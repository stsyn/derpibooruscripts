// ==UserScript==
// @name          YDB:Tools Tag DB Filler
// @namespace     http://derpibooru.org
// @version       0.1.1
// @description   Fullfills static db for tag highlighting
// @author        stsyn
// @include         /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*/
// @grant         none

// @require       https://github.com/stsyn/createElement/raw/component/src/es5.js
// @require       https://github.com/stsyn/createElement/raw/component/src/extensions/forms.js

// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Tags.js

// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/TagInput.js
// ==/UserScript==

var createElement = createElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var wrapElement = wrapElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var clearElement = clearElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var fillElement = fillElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
(function() {
  'use strict';
  const formData = {};
  const state = {};
  const elements = {};

  const base = {
    normal: {
      'body-type': [],
      character: [],
      'content-official':[],
      'content-fanmade': [],
      error: [],
      oc: [],
      origin: [],
      rating: [],
      species: [],
      spoiler: [],
    },
    regulars: {
      oc:/^oc:/,
      origin:/^(artist:|editor:|colorist:|photographer:|generator:|prompter:)/,
      'content-fanmade':/^(comic:|fanfic:|art pack:|tumblr:|series:)/,
      spoiler:/^spoiler:/
    },
  }

  const prefixes = {
    oc: ['oc:'],
    origin: ['artist:', 'editor:', 'colorist:', 'photographer:', 'generator:', 'prompter:' ],
    'content-fanmade': ['comic:', 'fanfic:', 'art pack:', 'tumblr:', 'series:' ],
    spoiler: ['spoiler:'],
  }

  function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  function YDB_tagStat() {
    document.querySelector('#content h1').innerHTML = 'Tag stats';
    document.getElementById('content').className = 'layout--wide';

    function renderBase() {
      return [
        [formElement, { data: formData }, [
          [YDB_api.UI.input, { type: 'number', name: 'minImageCount', label: 'Minimal image count to process', value: 50 }],
          [YDB_api.UI.button, {onclick: selectTags}, 'Start'],
          [YDB_api.UI.input, { type: 'number', name: 'progress', disabled: true }],
          [YDB_api.UI.textarea, { name: 'output', fullWidth: true, label: 'JSON output', style: { height: '90vh' } }]
        ]]
      ];
    }

    function draw() {
      const patched = Object.entries(base.normal).map(([k, v]) => `  '${k}': ${JSON.stringify(v)},`)

      formData.output = '{\n' + patched.join('\n') + '\n}';
    }

    function makeQuery(category) {
      const exclusion = (prefixes[category] ?? []).map(c => `-${c}*`).join(',');

      return `category:${category}${exclusion ? `,${exclusion}` : ''}`
    }

    async function selectTags(e) {
      const tags = Object.keys(base.normal);
      for (let i = 0; i < tags.length; i++) {
        formData.progress = Math.round(i / tags.length * 100);
        await iterate(tags[i], YDB_api.longTagSearch(makeQuery(tags[i])));
      }

      draw();
      alert('done');
      formData.progress = 100;
    }

    async function iterate(category, iterator) {
      while(true) {
        await wait(333);
        const result = await iterator.next();
        formData.progress = (parseFloat(formData.progress) + 0.1).toFixed(1);

        if (result.done) {
          return;
        }

        const tags = result.value.tags;
        base.normal[category] = base.normal[category].concat(tags.map(t => t.name));
        draw();

        if (tags.length < 50) {
          return;
        }

        const lastTag = tags.pop();
        if (lastTag.images < formData.minImageCount) {
          return;
        }
      }
    }

    return renderBase();
  }

  YDB_api.pages.add('tagDb', YDB_tagStat);
})();
