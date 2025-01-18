// ==UserScript==
// @name         Vote Migrator
// @version      0.4.0
// @description  Copies votes from one booru to another (filename is legacy)
// @author       stsyn, feat. Cloppershy

// @match        *://*/*

// @exclude      *://*/api*/json/*
// @exclude      *://*/adverts/*

// @require      https://github.com/stsyn/createElement/raw/component/src/es5.js
// @require      https://github.com/stsyn/createElement/raw/component/src/extensions/forms.js
// @require      https://github.com/stsyn/GM_fetch/raw/master/GM_fetch.js

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Blocks.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js

// @grant        unsafeWindow
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';
  let inProgress = false;
  let key, targetKey, log, nearest;
  let importPattern, exportPattern, everythingFilterId;
  let cache = new Map();

  const everythingFilter = {
    'derpibooru.org': '56027',
    'trixiebooru.org': '56027',
    'tantabus.ai': '2',
    'twibooru.org': '2',
    'ponybooru.org': '2', // not actual everything
    'ponerpics.org': '2',
    'manebooru.art': '2',
  }
  const getOriginSearchUrl = ({ key, extender, page }) => [
    'search/images',
    {
      q: `${importPattern}${extender}`,
      hidden: 1,
      key,
      per_page: 50,
      page,
      filter_id: everythingFilterId,
    }
  ];
  const getTargetSearchUrl = ({ key, id, page }) => [
    'search/images',
    {
      q: exportPattern.replace('{id}', id),
      hidden: 1,
      key,
      per_page: 50,
      filter_id: everythingFilterId,
    }
  ];

  const getImageUrl = ({ id }) => `https://${location.host}/{id}`
  .replace('{id}', id);

  const handlers = {
    'faves': {
      extender: ',my:faves',
      action: '/images/{id}/fave',
      body: {},
    },
    'upvotes': {
      extender: ',my:upvotes',
      action: '/images/{id}/vote',
      body: {up:true},
    },
    'hidden': {
      extender: ',my:hidden',
      action: '/images/{id}/hide',
      body: {},
    },
  }

  function writeLog(data) {
    try {
      log.insertBefore(createElement('div', [data]), log.children[0]);
    } catch(e) {
      console.error(data);
    }
  }

  async function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function fetchAll(extender, kind, { from, to, sameSite } = {}) {
    let total = 0;
    let collected = [];
    let page = 1;
    let fromArg = Number.isNaN(from) ? null : from;
    let toArg = Number.isNaN(to) ? null : to;

    const largeExtender = (() => {
      let temp = extender;
      if (fromArg != null) {
        temp += `%2Cid.gte%3A${fromArg}`;
      }

      if (toArg != null) {
        temp += `%2Cid.lte%3A${toArg}`;
      }

      return temp;
    })();

    do {
      const [data] = await Promise.all([YDB_api.fetchGetJson(...getOriginSearchUrl({ key, extender: largeExtender, page })), pause(200)]);
      total = data.total;
      collected = collected.concat(data.images);
      writeLog(`Retrieving ${collected.length}/${data.total} of ${kind}...`);
      if (data.images.length === 0) {
        break;
      }
      page++;
    } while (collected.length < total)

    return collected.map(image => image.id);
  }

  async function findPic(id) {
    if (cache.has(id)) {
      return cache.get(id);
    }

    const [data] = await Promise.all([YDB_api.fetchGetJson(...getTargetSearchUrl({ key: targetKey, id })), pause(250)]);
    const imgs = data.images.map(image => image.id);

    if (data.total > 1) {
      writeLog(['span', [
        `!!! Several pics (${data.total}) matched the same `,
        ['a', { target: '_blank', href: `https://derpibooru.org/${id}` }, id],
        ': ',
        ...imgs.flatMap((id) => [['a', { target: '_blank', href: `https://tantabus.ai/${id}` }, id], ', ']).slice(0, -1),
      ]]);

      return [null, []];
    }

    if (data.total === 0) {
      writeLog(['span', [
        `!!! Nothing matched for `,
        ['a', { target: '_blank', href: `https://derpibooru.org/${id}` }, id],
      ]]);

      return [null, []];
    }

    const interactions = data.interactions.map(({ interaction_type, value }) => {
      if (interaction_type === 'faved') return 'faves';
      if (interaction_type === 'voted' && value === 'up') return 'upvotes';
      if (interaction_type === 'hidden') return 'hidden';
    });
    cache.set(id, [imgs[0], interactions]);

    return [imgs[0], interactions];
  }

  async function vote(id, handler, kind, oldId) {
      try {
          const response = await fetchJson('POST', handler.action.replace('{id}', id), handler.body);
          if (response.status !== 200) {
              throw new Error(`${response.status}`);
          }
          const cacheItem = cache.get(oldId);
          cacheItem?.[1]?.push(kind);
          if (kind === 'faves') cacheItem?.[1]?.push('upvotes');
      } catch (e) {
          writeLog(['span', [
            ['a', { target: '_blank', href: `https://tantabus.ai/${id}` }, id],
            ` ERROR! ${e}`,
          ]]);
          await pause(5000);
      }
  }

  async function interactWithEverything(ids, handler, kind) {
    let voted = 0;
    let alreadyVoted = 0;
    let notFound = 0;

    const logProcess = () => writeLog(`${kind}: ${((voted + alreadyVoted + notFound) / ids.length * 100).toFixed(1)}% ${voted}/${ids.length - alreadyVoted - notFound} (${alreadyVoted} already voted, ${notFound} not found)`);

    for (let id of ids) {
      const [newId, interactions] = await findPic(id);
      if (newId == undefined) {
        notFound++;
        continue;
      }
      if (interactions?.includes(kind)) {
        alreadyVoted++;
        if (alreadyVoted % 10 === 0) {
          logProcess();
        }
        continue;
      }
      await Promise.all([vote(newId, handler, kind, id), pause(250)]);
      voted++;
      if (voted % 10 === 0) {
          logProcess();
      }
    }
    writeLog(`Processed ${voted} ${kind} out of ${ids.length} (${alreadyVoted} already voted, ${notFound} not found)`);
  }

  function renderFrom() {
    let input, patternInput, filterInput;

    return [
      [YDB_api.UI.block, [
        'Generate voting data (will override already saved)',
        [YDB_api.UI.input, { type: 'password', _cast: (e) => input = e, label: 'API key from this site', name: 'derpiKey' }],
        [YDB_api.UI.input, { type: 'text', _cast: (e) => patternInput = e, label: 'Search pattern', name: 'pattern', fullWidth: true, value: 'ai generated' }],
        [YDB_api.UI.input, {
          type: 'number',
          _cast: (e) => filterInput = e,
          label: 'Everything filter id (number in filter url on this site – default is usually fine, but ponybooru doesn\'t have public Everything filter)',
          name: 'filterId',
          value: everythingFilter[location.host] ?? 2,
        }],
        [YDB_api.UI.button, { onclick: async() => {
          if (inProgress || !input.value || !patternInput.value || !filterInput.value) {
            return
          }

          importPattern = patternInput.value.trim();
          everythingFilterId = filterInput.value;

          key = input.value.trim();
          inProgress = true;

          writeLog(`Do NOT close this window/tab!`);
          writeLog(`Importing process started.`);
          let images = {};
          for (let kind in handlers) {
            const handler = handlers[kind];
            images[kind] = await fetchAll(handler.extender, kind, { sameSite: true });
            writeLog(`Everything from ${kind} fetched.`);
          }
          GM.setValue('__db-ttb-vote-data', JSON.stringify(images));
          writeLog(`Done.`);
          writeLog([YDB_api.UI.input, { type: 'text', label: 'Raw import result (if you need it for some reason)', value: JSON.stringify(images) }])
        } }, 'Process'],
      ]],

      ['', { _cast: (elem) => log = elem }],
    ];
  }

  async function renderTo() {
    let input2, input3, patternInput, dataInput, filterInput;

    return [
      [YDB_api.UI.block, [
        'Apply imported votes',
        [YDB_api.UI.input, { type: 'password', _cast: (e) => input2 = e, label: 'API key from this site', name: 'tantabusKey' }],
        [YDB_api.UI.input, {
          type: 'text',
          _cast: (e) => patternInput = e,
          label: 'Matching pattern (have to use "{id}" to insert image id in search)',
          name: 'pattern',
          fullWidth: true,
          value: 'derpibooru import, source_url:https://derpibooru.org/images/{id}'
        }],
        [YDB_api.UI.input, {
          type: 'number',
          _cast: (e) => filterInput = e,
          label: 'Everything filter id (number in filter url on this site – default is usually fine, but ponybooru doesn\'t have public Everything filter)',
          name: 'filterId',
          value: everythingFilter[location.host] ?? 2,
        }],
        [YDB_api.UI.input, { type: 'text', _cast: (e) => input3 = e, label: 'Skip up to "faves, upvotes, hidden"' }],
        [YDB_api.UI.input, { type: 'text', _cast: (e) => dataInput = e, label: 'Manual import data (skip if you don\'t know what it is for)' }],
        [YDB_api.UI.button, { onclick: async() => {
          if (inProgress || !input2.value || !patternInput.value.includes('{id}') || !filterInput.value) {
            return
          }

          exportPattern = patternInput.value.trim();
          everythingFilterId = filterInput.value;
          const ignore = (input3.value || '').split(',').map(v => v.toLowerCase().trim());
          targetKey = input2.value.trim();
          inProgress = true;
          const content = dataInput.value || await GM.getValue('__db-ttb-vote-data', '');
          if (!content) {
            writeLog(`Import data missing`);
            return;
          }

          let images;
          try {
            images = JSON.parse(content);
            writeLog(`Ready to import faves:${images.faves.length}, upvotes:${images.upvotes.length}, hidden:${images.hidden.length}`);
          } catch(e) {
            writeLog(`Import data wrong format`);
          }

          writeLog(`Do NOT close this window/tab!`);
          writeLog(`Writing process started, do not interact with tantabus!`);
          let queue;
          for (let kind in handlers) {
            if (ignore.includes(kind) || !images[kind]) continue;
            const handler = handlers[kind];
            writeLog(`Working with ${kind}, be patient...`);
            await queue;
            queue = interactWithEverything(images[kind], handler, kind);
          }
          await queue;
          writeLog(`Done.`);
        } }, 'Process'],
      ]],

      ['', { _cast: (elem) => log = elem }],
    ];
  }


  YDB_api.pages.add('migrate-votes-from', renderFrom);
  renderTo().then(data => YDB_api.pages.add('migrate-votes-to', () => data));
})();
