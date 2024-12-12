// ==UserScript==
// @name         Tantabus Vote Migrator
// @version      0.1.2
// @description  Copies votes from one booru to another
// @author       stsyn

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

// @grant        GM.xmlHttpRequest
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

  const getTargetSearchUrl = ({ id, key }) =>
  'https://tantabus.ai/api/v1/json/search/images?q=derpibooru+import%2C+source_url%3Ahttps%3A%2F%2Fderpibooru.org%2Fimages%2F{id}&hidden=1&key={key}&per_page=50&filter_id=2'
  .replace('{key}', key)
  .replace('{id}', id);

  const getImageUrl = ({ id }) => 'https://tantabus.ai/{id}'
  .replace('{id}', id);

  const handlers = {
    'faves': {
      selector: '.interaction--fave',
      extender: '%2Cmy%3Afaves',
    },
    'upvotes': {
      selector: '.interaction--upvote',
      extender: '%2Cmy%3Aupvotes',
    },
    'hidden': {
      selector: '.interaction--hide',
      extender: '%2Cmy%3Ahidden',
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

  async function waitForUrl(url) {
    nearest.location.href = url;

    return new Promise((resolve) => {
      let tries = 0;
      const interval = setInterval(() => {
        if (url === nearest.location.href.split('#')[0] && ["complete", "interactive"].includes(nearest.document.readyState)) {
          clearInterval(interval);
          resolve();
        }

        tries++;
        if (tries % 5 === 4) {
          nearest.location.href = url;
        }
      }, 200);
    })
  }

  async function fetchAll(extender, kind, from, to) {
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
      const [response] = await Promise.all([GM.fetch(getOriginSearchUrl({ key, extender: largeExtender, page })), pause(200)]);
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

    const response = await GM.fetch(getTargetSearchUrl({ key: targetKey, id }));
    const data = await response.json();
    const imgs = data.images.map(image => image.id);

    if (data.total > 1) {
      writeLog(['span', [
        `!!! Several pics (${data.total}) matched the same `,
        ['a', { target: '_blank', href: `https://derpibooru.org/${id}` }, id],
        ':',
        ...imgs.map((id) => ['a', { target: '_blank', href: `https://tantabus.ai/${id}` }, id]),
      ]]);

      return [null];
    }

    if (data.total === 0) {
      writeLog(['span', [
        `!!! Nothing matched for `,
        ['a', { target: '_blank', href: `https://derpibooru.org/${id}` }, id],
      ]]);

      return [null];
    }

    const interactions = data.interactions.map(({ interaction_type, value }) => {
      if (interaction_type === 'faved') return 'faves';
      if (interaction_type === 'voted' && value === 'up') return 'upvotes';
      if (interaction_type === 'hidden') return 'hidden';
    });
    cache.set(id, [imgs[0], interactions]);

    return [imgs[0], interactions];
  }

  async function vote(id, handler, kind) {
    await waitForUrl(getImageUrl({ id }));
    const element = nearest.document.querySelector(handler.selector);
    if (element.classList.contains('active')) {
      return writeLog(['span', [
        ['a', { target: '_blank', href: `https://tantabus.ai/${id}` }, id],
        ` is interacted that way already`,
      ]]);
    }

    element.click();
    do {
      await pause(10);
    } while(!element.classList.contains('active'));
  }

  async function interactWithEverything(ids, handler, kind) {
    let imgsToDoStuff = [];
    let queue;
    for (let id of ids) {
      const [[newId, interactions]] = await Promise.all([findPic(id), pause(100)]);
      if (newId == undefined) {
        continue;
      }
      if (interactions?.includes(kind)) {
        writeLog(['span', [
          ['a', { target: '_blank', href: `https://tantabus.ai/${id}` }, id],
          ` is interacted that way already`,
        ]]);
        continue;
      }
      imgsToDoStuff.push(newId);
      await queue;
      queue = Promise.all([vote(newId, handler, kind), pause(1000)]);
    }
    writeLog(`Processed ${imgsToDoStuff.length} of ${ids.length} from ${kind}`);
  }

  async function start(ignore, { from, to }) {
    writeLog(`Do NOT close the window which have just opened right now!`);
    writeLog(`Process started, do not interact with either of derpibooru or tantabus!`);
    nearest = window.open(getImageUrl({ id: 3 }), '_blank', 'location=yes,height=400,width=520,scrollbars=yes,status=yes');
    let queue;
    for (let kind in handlers) {
      if (ignore.includes(kind)) continue;
      const handler = handlers[kind];
      const images = await fetchAll(handler.extender, kind, from, to);
      writeLog(`Everything from ${kind} fetched, gathering matches, be patient...`);
      await queue;
      queue = interactWithEverything(images, handler, kind);
    }
    await queue;
    writeLog(`Done.`);
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
          key = input.value;
          targetKey = input2.value;
          inProgress = true;
          start(ignore, { from: parseInt(inputFrom.value), to: parseInt(inputTo.value) });
        } }, 'Process'],
      ]],

      ['', { _cast: (elem) => log = elem }],
    ];
  }
  YDB_api.pages.add('migrate-votes', render);
})();
