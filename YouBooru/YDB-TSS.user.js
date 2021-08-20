// ==UserScript==
// @name          YDB Tag Score Statistics
// @version       0.1.0
// @author        stsyn

// @match         *://*/*

// @exclude       *://*/adverts/*

// @require       https://github.com/stsyn/createElement/raw/component/min/es5.js
// @require       https://github.com/stsyn/createElement/raw/component/src/extensions/forms.js

// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/ImageSearch.js

// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js

// @downloadURL   https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-TSS.user.js

// @grant         GM_setValue
// @grant         GM_getValue
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

var createElement = createElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var wrapElement = wrapElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var clearElement = clearElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var fillElement = fillElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
(function() {
  'use strict';
  // const scores = [-150, -100, -75, -50, -25, -10, -5, 0, 5, 10, 15, 20, 25, 50, 75, 100, 125, 150, 200, 300, 400, 500, 600, 800, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000];
  const scores = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 50, 75, 100, 125, 150, 200, 300, 400, 500, 600, 800, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000];

  const formData = {};
  const elements = {};
  let apiKey;

  function YDB_tagStat() {
    document.querySelector('#content h1').innerHTML = 'Tag stats';
    document.getElementById('content').className = 'layout--wide';

    function renderBase() {
      const apiKeys = JSON.parse(GM_getValue('apiKey', '{}'));
      formData.apiKey = apiKeys[location.hostname] || '';
      formData._scores = scores.join(', ');

      return [
        [formElement, { data: formData }, [
          [YDB_api.UI.input, { type: 'password', name: 'apiKey', label: 'API key' }],
          [YDB_api.UI.textarea, { name: 'tagName', fullWidth: true, label: 'Tag to look' }],
          [YDB_api.UI.textarea, { name: 'tagDecor', fullWidth: true, label: 'Search wrapper' }],
          [YDB_api.UI.textarea, { name: '_scores', fullWidth: true, label: 'Scores' }],
          ['button.button', {onclick: selectTags}, 'Start'],
          elements.renderPlace = createElement('table.table')
        ]]
      ];
    }

    function draw(index, current, all) {
      fillElement(elements.list.querySelector(`tr[data-id="${index}"]`), [
        ['td', current],
        ['td', String(Math.round(current / all * 100000) / 1000).replace('.', ',')]
      ]);
    }

    function endIt(currentScoreId) {
      for (; currentScoreId < formData.scores.length; currentScoreId++) {
        draw(currentScoreId, 0, 100);
      }
    }

    function prefill(until, total) {
      for (let i = 0; i < until; i++) {
        draw(i, total, total);
      }
    }

    function detailedFill(data, minId, grandTotal) {
      for (; minId < formData.scores.length; minId++) {
        const items = data.images.filter(image => image.score >= formData.scores[minId]);
        draw(minId, items.length, grandTotal);
      }
    }

    async function fetchAndWrite(currentScoreId, grandTotal, tagName, search) {
      const data = await YDB_api.searchImages(search + ', score.gte:' + formData.scores[currentScoreId], {key: apiKey, sf: 'score', sd: 'asc'});

      let offset = 0;
      const base = Math.min(50, data.total);
      let previousFit = base;
      let drawnOnce = false;

      while (currentScoreId + offset <= formData.scores.length) {
        if (offset > 0) {
          drawnOnce = true;
          draw(currentScoreId + offset - 1, data.total - base + previousFit, grandTotal);
        }
        if (currentScoreId + offset + 1 === formData.scores.length) {
          break;
        }
        const fit = data.images.filter(image => image.score >= formData.scores[currentScoreId + offset]);
        if (fit.length > 0) {
          previousFit = fit.length;
          offset++;
        } else break;
      }

      if (data.total > 0) {
        if (data.total <= 50) {
          detailedFill(data, currentScoreId + offset, grandTotal);
        } else if (currentScoreId + offset < formData.scores.length) {
          await fetchAndWrite(currentScoreId + offset, grandTotal, tagName, search);
        }
      } else {
        endIt(currentScoreId + offset);
      }
    }

    function prerender(tags) {
      elements.renderPlace.appendChild(createElement('thead', [
        ['tr', [
          ['th', '[score]'],
          ...tags.map(tag => [tag, tag + ' %']).flat().map(v => ['th', v])
        ]]
      ]))
      elements.renderPlace.appendChild(elements.list = createElement('tbody', formData.scores.map((score, i) => ['tr', {dataset: {id: i}}, [
        ['td', score]
      ]])));
    }

    async function startAnalysis(tagName) {
      apiKey = formData.apiKey.trim();
      const apiKeys = JSON.parse(GM_getValue('apiKey', '{}'));
      apiKeys[location.hostname] = apiKey;
      GM_setValue('apiKey', JSON.stringify(apiKeys));
      const tagDecor = formData.tagDecor.trim();
      const search = (() => {
        if (!tagDecor) return tagName;
        if (tagDecor.indexOf('$1') < 0) return tagName + ',' + tagDecor;
        return tagDecor.replace(/\$1/g, tagName);
      })();

      const data = await YDB_api.searchImages(search, {key: apiKey, sf: 'score', sd: 'asc'});

      if (data.total > 0) {
        const initial = data.images[0].score;
        const index = formData.scores.findIndex(sc => sc > initial);
        prefill(index, data.total);

        await fetchAndWrite(index, data.total, tagName, search);
      } else {
        endIt(0);
      }
    }

    async function selectTags(e) {
      e.preventDefault();
      e.stopPropagation();
      formData.scores = formData._scores.split(',').map(v => v.trim());
      const tags = formData.tagName.split(',').map(t => t.trim()).filter(t => t);
      prerender(tags);
      for (let tag of tags) {
        await startAnalysis(tag);
      }
    }

    return renderBase();
  }

  YDB_api.pages.add('tagStat', YDB_tagStat);
})();
