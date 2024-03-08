// ==UserScript==
// @name         YDB:MADUp - Pixiv
// @version      1.0.0
// @description  Simplifies process of image updating and uploading (for Pixiv)
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

  const imageRequest = (link) => new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
      method: 'GET',
      url: link,
      responseType: 'blob',
      headers: {
        'Referer': 'https://www.pixiv.net/',
      },
      onload: function(response) {
        resolve(response.response);
      },
      onerror: reject,
      ontimeout: reject,
    });
  });

  YDB_MADUp.registerFetcher(
    'Pixiv',
    str => str.match(/.*\.pixiv\.net\/(.*\/|)artworks\/.*/),
    async(url) => {
      let content;
      try {
        const response = await GM.fetch(url, { headers: { referer: 'https://www.pixiv.net/' } });
        const text = await response.text();
        const match = text.match(/<meta name="preload-data" id="meta-preload-data" content='(.*)'>/)[1];
        content = JSON.parse(match);
        const artwork = Object.values(content.illust)[0];
        const link = artwork.urls.original;

        const image = await imageRequest(link);
        return {
          blob: image,
        };
      } catch(e) {
        alert('Something went wrong. See the console or check deviation page');
        console.log(content);
        throw e;
      }
    },
    1,
  );
})();
