// ==UserScript==
// @name         YDB:MADUp - DeviantArt
// @namespace    http://derpibooru.org
// @version      1.0.0
// @description  Simplifies process of image updating and uploading (for DeviantArt)
// @author       stsyn

// @match        *://*/*
// @exclude      *://*/api*/json/*
// @exclude      *://*/adverts/*

// @require      https://github.com/stsyn/GM_fetch/raw/master/GM_fetch.js
// @require      https://github.com/stsyn/createElement/raw/component/src/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YDB-MADUp-common.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-MADUp-DeviantArt.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-MADUp-DeviantArt.user.js

// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
  'use strict';
  YDB_MADUp.registerFetcher(
    'DeviantArt',
    str => str.match(/.*\.deviantart\.com\/(.*\/|)art\/.*/) || str.match(/.*\/\/fav\.me\/d.*/),
    async(url) => {
      let content;
      try {
        const response = await GM.fetch(url);
        const text = await response.text();
        const match = text.match(/window.__INITIAL_STATE__ = JSON.parse\("(.*)"\);/)[1].replace(/\\(.)/g, '$1');
        content = JSON.parse(match);
        const deviationId = Object.keys(content['@@entities'].deviationExtended)[0];
        const deviation = content['@@entities'].deviation[deviationId];

        const payload = `{"sub":"urn:app:","iss":"urn:app:","obj":[[{"path":"\/f\/${deviation.media.baseUri.split(/\/[if]\//)[1].replace(/\//g, '\/')}"}]],"aud":["urn:service:file.download"]}`;
        const link = `${deviation.media.baseUri}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.${btoa(payload).replace(/=/g, '')}.`;

        return link;
      } catch(e) {
        alert('Something went wrong. See the console or check deviation page');
        console.log(content);
        throw e;
      }
    }
  );
})();
