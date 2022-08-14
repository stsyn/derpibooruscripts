// ==UserScript==
// @name         YDB:MADUp - DeviantArt
// @namespace    http://derpibooru.org
// @version      0.1
// @description  Automates process of image updating (for DeviantArt)
// @author       stsyn

// @match        *://*/*
// @exclude      *://*/api*/json/*
// @exclude      *://*/adverts/*

// @require      https://github.com/stsyn/GM_fetch/raw/master/GM_fetch.js
// @require      https://github.com/stsyn/createElement/raw/component/src/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js

// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
  'use strict';
  const container = document.querySelector('.block__tab[data-tab="replace"] form');
  const source = document.querySelector('.js-source-link').href;
  const replaceInput = document.getElementById('image_scraper_url');
  const replaceFetch = document.getElementById('js-scraper-preview');
  const elems = {};

  if (container && source.match(/.*\.deviantart\.com\/art\/.*/)) {
    appendButton();
  }

  function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  function appendButton() {
    container.appendChild(createElement('hr'));
    container.appendChild(createElement(YDB_api.UI.button, { onclick: tryFetch, _cast: e => elems.button = e }, 'Auto-fetch'));
  }

  async function tryFetch() {
    elems.button.disabled = true;

    const response = await GM.fetch(source);
    const text = await response.text();
    const match = text.match(/window.__INITIAL_STATE__ = JSON.parse\("(.*)"\);/)[1].replace(/\\(.)/g, '$1');
    const content = JSON.parse(match);
    const deviationId = Object.keys(content['@@entities'].deviationExtended)[0];
    const deviation = content['@@entities'].deviation[deviationId];

    const payload = `{"sub":"urn:app:","iss":"urn:app:","obj":[[{"path":"\/f\/${deviation.media.baseUri.split('/f/')[1].replace(/\//g, '\/')}"}]],"aud":["urn:service:file.download"]}`;
    const link = `${deviation.media.baseUri}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.${btoa(payload).replace(/=/g, '')}.`;

    replaceInput.value = link;
    replaceFetch.disabled = false;
    await wait(200);
    replaceFetch.click();

    elems.button.disabled = false;
  }
})();
