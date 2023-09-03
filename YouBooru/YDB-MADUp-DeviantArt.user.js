// ==UserScript==
// @name         YDB:MADUp - DeviantArt
// @namespace    http://derpibooru.org
// @version      0.2.0
// @description  Simplifies process of image updating and uploading (for DeviantArt)
// @author       stsyn

// @match        *://*/*
// @exclude      *://*/api*/json/*
// @exclude      *://*/adverts/*

// @require      https://github.com/stsyn/GM_fetch/raw/master/GM_fetch.js
// @require      https://github.com/stsyn/createElement/raw/component/src/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-MADUp-DeviantArt.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-MADUp-DeviantArt.user.js

// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
  'use strict';
  const enviroment = YDB_api.getEnviroment();
  const isBooru = enviroment !== 'unknown';
  if (!isBooru) {
    return;
  }

  const container = document.querySelector('.block__tab[data-tab="replace"] form');
  const source = document.querySelector('.js-source-link')?.href;
  const replaceInput = document.getElementById('image_scraper_url');
  const replaceFetch = document.getElementById('js-scraper-preview');
  const elems = {};

  const uploadContainer = document.querySelector('form[action="/images"][method="post"]');

  const isOurTarget = str => str.match(/.*\.deviantart\.com\/(.*\/|)art\/.*/) || str.match(/.*\/\/fav\.me\/d.*/);

  if (container && isOurTarget(source)) {
    appendButton();
  }

  if (uploadContainer) {
    appendSection();
  }

  function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  function appendButton() {
    container.appendChild(createElement('hr'));
    container.appendChild(createElement(YDB_api.UI.button, { onclick: () => tryFetch(source), _cast: e => elems.button = e }, 'Auto-fetch'));
  }

  function appendSection() {
    const oldButton = document.querySelector('_madup-fetch');
    if (!oldButton) {
      const target = document.querySelector('.image-other');
      target.appendChild(createElement('hr'));
      let currentSource;
      target.appendChild(createElement('.field.field--inline', [
        [YDB_api.UI.input, {
          className: '_madup-url',
          _cast: e => elems.input = e,
          inline: true,
          fullWidth: true,
          onchange: (e) => currentSource = e.target.value,
          placeholder: 'Input for alternative fetch'
        }],
        [YDB_api.UI.button, {
          className: ' _madup-fetch',
          onclick: async(e) => {
            if (!currentSource) {
              return;
            }
            alert('Either no known targets found or another error occuppied, fallbacking to default fetch');

            replaceInput.value = currentSource;
            replaceFetch.disabled = false;
            await wait(200);
            replaceFetch.click();
          },
          _cast: e => elems.button = e,
        }, 'Alt fetch']
      ]));
    } else {
      elems.button = oldButton;
    }

    elems.button.addEventListener('click', async(e) => {
      const currentSource = document.querySelector('._madup-url');
      if (!isOurTarget(currentSource)) {
        return;
      }
      e.stopImmediatePropagation();
      tryFetch(currentSource);
      let srcElement = Array.from(document.querySelectorAll('.js-source-url')).filter(e => !e.value)[0];
      if (!srcElement) {
        document.querySelector('.js-image-add-source').click();
        await wait(200);
        srcElement = Array.from(document.querySelectorAll('.js-source-url')).filter(e => !e.value)[0];
      }

      srcElement.value = currentSource;
    }, { capture: true });
  }

  async function tryFetch(url) {
    let content;
    try {
      elems.button.disabled = true;

      const response = await GM.fetch(url);
      const text = await response.text();
      const match = text.match(/window.__INITIAL_STATE__ = JSON.parse\("(.*)"\);/)[1].replace(/\\(.)/g, '$1');
      content = JSON.parse(match);
      const deviationId = Object.keys(content['@@entities'].deviationExtended)[0];
      const deviation = content['@@entities'].deviation[deviationId];

      const payload = `{"sub":"urn:app:","iss":"urn:app:","obj":[[{"path":"\/f\/${deviation.media.baseUri.split(/\/[if]\//)[1].replace(/\//g, '\/')}"}]],"aud":["urn:service:file.download"]}`;
      const link = `${deviation.media.baseUri}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.${btoa(payload).replace(/=/g, '')}.`;

      replaceInput.value = link;
      replaceFetch.disabled = false;
      await wait(200);
      replaceFetch.click();
    } catch(e) {
      alert('Something went wrong. See the console or check deviation page');
      console.log(content);
      throw e;
    } finally {
      elems.button.disabled = false;
    }
  }
})();
