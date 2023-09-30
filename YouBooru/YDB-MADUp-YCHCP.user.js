// ==UserScript==
// @name         YDB:MADUp - YCHC.Portfolio
// @namespace    http://derpibooru.org
// @version      1.0.0
// @description  Simplifies process of image updating and uploading (for portfolio.commishes)
// @author       stsyn

// @match        *://*/*
// @exclude      *://*/api*/json/*
// @exclude      *://*/adverts/*

// @require      https://github.com/stsyn/GM_fetch/raw/master/GM_fetch.js
// @require      https://github.com/stsyn/createElement/raw/component/src/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YDB-MADUp-common.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-MADUp-YCHCP.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-MADUp-YCHCP.user.js

// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
  'use strict';
  YDB_MADUp.registerFetcher(
    'YCHC.Portfolio',
    str => str.match(/portfolio\.commishes\.com\/upload\/show\//),
    async(url) => {
      let content;
      try {
        const id = url.match(/upload\/show\/([A-Z0-9]+)/)[1];
        const numericId = parseInt(id, 32);

        const link = `https://portfolio.commishes.com/image/${numericId}/original/`;

        return link;
      } catch(e) {
        alert('Something went wrong. But what?..');
        console.log(content);
        throw e;
      }
    }
  );
})();
