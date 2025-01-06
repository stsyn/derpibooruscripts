// ==UserScript==
// @name         Tantabus Vote Migrator
// @version      0.3.2
// @description  Copies votes from one booru to another
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
  let cache = new Map();

  const getOriginSearchUrl = ({ key, extender, page }) =>
  'https://derpibooru.org/api/v1/json/search/images?q=ai+content{extender}&hidden=1&key={key}&per_page=50&page={page}&filter_id=56027'
  .replace('{key}', key)
  .replace('{extender}', extender)
  .replace('{page}', page);

  const hostname = location.hostname;

  const getTargetSearchUrl = ({ id, key }) =>
  `https://${hostname}/api/v1/json/search/images?q=derpibooru+import%2C+source_url%3Ahttps%3A%2F%2Fderpibooru.org%2Fimages%2F{id}&hidden=1&key={key}&per_page=50&filter_id=2`
  .replace('{key}', key)
  .replace('{id}', id);

  const getImageUrl = ({ id }) => `https://${hostname}/{id}`
  .replace('{id}', id);

  const handlers = {
    'faves': {
      extender: '%2Cmy%3Afaves',
      action: '/images/{id}/fave',
      body: {},
    },
    'upvotes': {
      extender: '%2Cmy%3Aupvotes',
      action: '/images/{id}/vote',
      body: {up:true},
    },
    'hidden': {
      extender: '%2Cmy%3Ahidden',
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
      const [response] = await Promise.all([(sameSite ? fetch : GM.fetch)(getOriginSearchUrl({ key, extender: largeExtender, page })), pause(200)]);
      const data = await response.json();
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

    const [response] = await Promise.all([fetch(getTargetSearchUrl({ key: targetKey, id })), pause(250)]);
    const data = await response.json();
    const imgs = data.images.map(image => image.id);

    if (data.total > 1) {
      writeLog(['span', [
        `!!! Several pics (${data.total}) matched the same `,
        ['a', { target: '_blank', href: `https://derpibooru.org/${id}` }, id],
        ': ',
        ...imgs.flatMap((id) => [['a', { target: '_blank', href: `https://${hostname}/${id}` }, id], ', ']).slice(0, -1),
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
            ['a', { target: '_blank', href: `https://${hostname}/${id}` }, id],
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

  function render() {
    let input, input2, input3, inputFrom, inputTo;

    return [
      [YDB_api.UI.block, [
        'Import votes from derpibooru',
        [YDB_api.UI.input, { type: 'password', _cast: (e) => input = e, label: 'API key from origin site (derpibooru)', name: 'derpiKey' }],
        [YDB_api.UI.input, { type: 'password', _cast: (e) => input2 = e, label: 'API key from target site (tantabus)', name: 'tantabusKey' }],
        [YDB_api.UI.input, { type: 'text', _cast: (e) => input3 = e, label: 'Skip up to "faves, upvotes, hidden"' }],
        [YDB_api.UI.input, { type: 'number', _cast: (e) => inputFrom = e, label: 'From derpi image id (smaller one) - omit if unneeded', name: 'from' }],
        [YDB_api.UI.input, { type: 'number', _cast: (e) => inputTo = e, label: 'To derpi image id (larger one) - omit if unneeded', name: 'to' }],
        [YDB_api.UI.button, { onclick: async() => {
          if (inProgress || !input.value || !input2.value) {
            return
          }

          const ignore = (input3.value || '').split(',').map(v => v.toLowerCase().trim());
          key = input.value.trim();
          targetKey = input2.value.trim();
          inProgress = true;

          writeLog(`Do NOT close this window/tab!`);
          writeLog(`Process started, do not interact with either of derpibooru or tantabus!`);
          let queue;
          for (let kind in handlers) {
            if (ignore.includes(kind)) continue;
            const handler = handlers[kind];
            const images = await fetchAll(handler.extender, kind, { from: parseInt(inputFrom.value), to: parseInt(inputTo.value) });
            writeLog(`Everything from ${kind} fetched, gathering matches, be patient...`);
            await queue;
            queue = interactWithEverything(images, handler, kind);
          }
          await queue;
          writeLog(`Done.`);
        } }, 'Process'],
      ]],

      ['', { _cast: (elem) => log = elem }],
    ];
  }

  function renderFrom() {
    let input;

    return [
      [YDB_api.UI.block, [
        'Import votes from derpibooru',
        [YDB_api.UI.input, { type: 'password', _cast: (e) => input = e, label: 'API key from origin site (derpibooru)', name: 'derpiKey' }],
        [YDB_api.UI.button, { onclick: async() => {
          if (inProgress || !input.value) {
            return
          }

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
        } }, 'Process'],
      ]],

      ['', { _cast: (elem) => log = elem }],
    ];
  }

  async function renderTo() {
    let input2, input3;

    if (!await GM.getValue('__db-ttb-vote-data')) {
      return ['Import from derpi not found'];
    }

    return [
      [YDB_api.UI.block, [
        'Write votes from derpibooru',
        [YDB_api.UI.input, { type: 'password', _cast: (e) => input2 = e, label: 'API key from target site (tantabus)', name: 'tantabusKey' }],
        [YDB_api.UI.input, { type: 'text', _cast: (e) => input3 = e, label: 'Skip up to "faves, upvotes, hidden"' }],
        [YDB_api.UI.button, { onclick: async() => {
          if (inProgress || !input2.value) {
            return
          }

          const ignore = (input3.value || '').split(',').map(v => v.toLowerCase().trim());
          targetKey = input2.value.trim();
          inProgress = true;

          writeLog(`Do NOT close this window/tab!`);
          writeLog(`Writing process started, do not interact with tantabus!`);
          let queue;
          let images = JSON.parse(await GM.getValue('__db-ttb-vote-data', '{}'));
          for (let kind in handlers) {
            if (ignore.includes(kind)) continue;
            const handler = handlers[kind];
            writeLog(`Everything from ${kind} fetched, gathering matches, be patient...`);
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


  YDB_api.pages.add('migrate-votes', render);
  YDB_api.pages.add('migrate-votes-from', renderFrom);
  renderTo().then(data => YDB_api.pages.add('migrate-votes-to', () => data));
})();
