// ==UserScript==
// @name          YDB:TV Tester
// @version       0.1.1
// @author        stsyn

// @match         *://*/*

// @exclude       *://*/adverts/*

// @require       https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/DerpibooruImitation0UW.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/ImageSearch.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Tags.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/tagProcessor.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/TagLogic.js

// @downloadURL   https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-TVTest.user.js

// @grant         GM_setValue
// @grant         GM_getValue
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

var createElement = createElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var wrapElement = wrapElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var clearElement = clearElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
(function() {
  'use strict';

  const enviroment = YDB_api.getEnviroment();
  const elements = {};
  const state = {};
  let iterator;
  let apiKey;

  (function() {
    YDB_api.renderImage = function(container, image, interactions = []) {
      const link = `/images/${image.id}`;
      const title = `Size: ${image.width}x${image.height} | Tagged: ${image.tags.sort().join(', ')}`;
      const up = !!interactions.find(i => i.interaction_type === 'voted' && i.value === 'up');
      const down = !!interactions.find(i => i.interaction_type === 'voted' && i.value === 'down');
      const fave = !!interactions.find(i => i.interaction_type === 'faved');
      let img;
      container.appendChild(img = createElement('.media-box', {dataset: {imageId: image.id}}, [
        ['.media-box__header.media-box__header--link-row', {dataset: {imageId: image.id}}, [
          ['a.interaction--fave', {className: fave ? 'active' : '', dataset: {imageId: image.id, href:'#', rel:'nofollow'}}, [
            ['span.fave-span', {title: 'Fave!'}, [
              ['i.fa.fa-star']
            ]],
            ['span.favorites', {title: 'Favorites', dataset: {imageId: image.id}}, [image.faves]]
          ]],
          ['a.interaction--upvote', {className: up ? 'active' : '',dataset: {imageId: image.id, href:'#', rel:'nofollow'}}, [
            ['i.fa.fa-arrow-up', {title: 'Yay!'}]
          ]],
          ['span.score', {title:'Score', dataset: {imageId: image.id}}, [image.score]],
          ['a.interaction--downvote', {className: down ? 'active' : '',dataset: {imageId: image.id, href:'#', rel:'nofollow'}}, [
            ['i.fa.fa-arrow-down', {title: 'Neigh!'}]
          ]],
          ['a.interaction--comments', {dataset: {imageId: image.id}, href:link+'#comments', target:'_blank', title: 'Comments'}, [
            ['i.fa.fa-comments'],
            ['span.comments_count', {dataset: {imageId: image.id}}, [image.comment_count]]
          ]],
          ['a.interaction--hide', {dataset: {imageId: image.id, href:'#', rel:'nofollow'}}, [
            ['i.fa.fa-eye-slash', {title: 'Hide'}]
          ]],
        ]],
        ['.media-box__content.flex.flex--centered.flex--center-distributed.media-box__content--large', [
          ['.image-container.thumb', {
            dataset: {
              aspectRatio: image.aspect_ratio,
              width: image.width,
              height: image.height,
              commentCount: image.comment_count,
              createdAt: image.created_at,
              downvotes: image.downvotes,
              upvotes: image.upvotes,
              faves: image.faves,
              score: image.score,
              imageId: image.id,
              imageTagAliases: image.tags.join(', '),
              imageTags: JSON.stringify(image.tag_ids),
              sourceUrl: image.source_url,
              size: 'thumb',
              uris: JSON.stringify(image.representations)
            }
          }, [
            ['.media-box__overlay.js-spoiler-info-overlay'],
            ['a', {href:link, target:'_blank', title}, [
              image.format === 'webm' ?
              ['video', {alt: title, autoplay: 'autoplay', loop: 'loop', muted: 'muted', playsinline: 'playsinline'}, [
                ['source', {src: image.representations.thumb, type:'video/webm'}]
              ]] : '',
              image.format === 'webm' ? ['img', {alt: title}] :
              ['picture', [
                ['img', {alt: title, src: image.representations.thumb}]
              ]]
            ]]
          ]]
        ]]
      ]));
    }
  }());

  function makeLink() {
    const container = document.querySelector('a.header__link[href*="/tags"]');
    let dropdown;
    wrapElement(dropdown = createElement('.dropdown.header__dropdown'), container);
    container.appendChild(createFromNotation('span', {dataset: {clickPreventdefault: 'true'}},
      ' ',
      ['i.fa.fa-caret-down'],
    ));
    dropdown.appendChild(createFromNotation('.dropdown__content',
      ['a.header__link', {href: '/search?q=__ydb_tv_search+OR+*&per_page=1'}, 'TV search'],
     // ['a.header__link', {href: '/search?q=__ydb_tv_test'}, 'TV test'],
    ));
  }

  async function makeQueryParts() {
    let q = elements.searchQuery.value;
    if (unsafeWindow._YDB_public && unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.getTagProcessors) {
      q = (await parseSearch(q, unsafeWindow._YDB_public.funcs.getTagProcessors({legacy:true}))).toString();
    }
    const sc = elements.subcategories.value.replace(/\n/g, '|');
    const f = elements.filter.value.replace(/\n/g, '|');
    const del = elements.search.del && elements.search.del.value;
    return {q, sc, f, del};
  }

  function makePageLink(parts) {
    return `sc=${encodeURIComponent(parts.sc)}&f=${parts.f}&q=__ydb_tv_search+OR+${encodeURIComponent(parts.q)}&del=${parts.del}`;
  }

  function checkImage(ruleset, image) {
    const tags = image.tags.map(tag => YDB_api.makeTagObject(tag));
    return YDB_api.applyRulesetOnTags(ruleset, tags, false).errors.length > 0;
  }

  function updateStatus() {
    elements.stats.innerHTML = `${state.approved}/${state.looked}/${state.total}`;
  }

  async function runPortion() {
    if (!state) return;
    let portion = [];
    const limit = parseInt(elements.portions.value);
    while (!(portion.length > limit)) {
      const result = await state.iterator.next();
      if (result.done) return;
      state.total = result.value.total - result.value.images.length;
      const valid = result.value.images.filter(image => checkImage(state.ruleset, image));
      state.looked += result.value.images.length;
      state.approved += valid.length;
      state.handledImages = state.handledImages.concat(valid);
      portion = portion.concat(valid);
      valid.forEach(image => YDB_api.renderImage(elements.searchContainer, image, result.value.interactions.filter(i => i.image_id === image.id)));
      state.interactions = state.interactions.concat(result.value.interactions);
      updateStatus();
      DB_processImages(elements.searchContainer);
    }
  }

  async function start() {
    apiKey = elements.apiKey.value.trim();
    const apiKeys = JSON.parse(GM_getValue('apiKey', '{}'));
    apiKeys[location.hostname] = apiKey;
    GM_setValue('apiKey', JSON.stringify(apiKeys));
    const rulesetCategoriesField = '[{[categories]}]';
    const parts = await makeQueryParts();
    const ruleset = {};
    ruleset[rulesetCategoriesField] = {};
    if (elements.subcategories.value.trim()) {
      elements.subcategories.value.split('\n')
        .filter(value => value)
        .forEach(value => {
        const parts = value.split(' - ');
        if (!parts[1]) return;
        ruleset[rulesetCategoriesField][parts[0]] = parts[1];
      })
    }
    if (elements.filter.value.trim()) {
      elements.filter.value.split('\n')
        .forEach(value => {
        if (value.trim() === rulesetCategoriesField) return;
        ruleset[value] = '^Matched';
      })
    }

    window.history.replaceState('', `Searching for ${parts.q}`, 'search?' + makePageLink(parts));
    parts.key = apiKey;
    state.parts = parts;
    state.handledImages = [];
    state.interactions = [];
    state.total = 0;
    state.looked = 0;
    state.approved = 0;
    state.iterator = YDB_api.longSearch(parts.q, parts);
    state.ruleset = ruleset;
    clearElement(elements.searchContainer);
    await runPortion();
  }

  function prepareSearch() {
    const apiKeys = JSON.parse(GM_getValue('apiKey', '{}'));
    const url = parseURL(location.href);
    elements.searchContainer = document.querySelector('.js-resizable-media-container');
    clearElement(elements.searchContainer);
    if (document.querySelector('.js-imagelist-info')) clearElement(document.querySelector('.js-imagelist-info'));
    document.querySelectorAll('#imagelist-container .block__header.flex .flex__right a:not([class*="js-quick-tag"])').forEach(elem => elem.style.display = 'none');
    document.querySelector('#imagelist-container .block__header__title:not(.hide-mobile)').style.display = 'none';
    elements.stats = document.querySelector('#imagelist-container .block__header__title.hide-mobile');
    clearElement(elements.stats);
    document.querySelectorAll('#imagelist-container .pagination').forEach(elem => elem.style.display = 'none');
    document.querySelectorAll('#content h1').forEach(elem => elem.style.display = 'none');
    elements.search = document.getElementById('searchform');
    elements.searchQuery = elements.search.q;
    elements.search.sf.style.display = 'none';
    elements.search.sd.style.display = 'none';
    elements.searchQuery.value = elements.searchQuery.value.replace('__ydb_tv_search OR ', '');
    document.getElementById('content').insertBefore(elements.search, document.getElementById('imagelist-container'));
    elements.search.insertBefore(createElement('.block', [
      ['p', 'TV subcategories (split name and definition with " - ")'],
      elements.subcategories = createElement('textarea.input.input--wide.js-search-field', {value: decodeURIComponent(url.params.sc)}),
      ['p', 'TV filter (lines are ORed)'],
      elements.filter = createElement('textarea.input.input--wide.js-search-field', {value: decodeURIComponent(url.params.f)}),
      ['span', 'API key '],
      elements.apiKey = createElement('input.input', {value: apiKeys[location.hostname] || '', type:'password', name:'api_key'}),
     // ['label', {for: '_ydb_tv_fetch_tags', title: 'No need to check if you don\' use categories, aliases or implications'}, 'Fetch tag data '],
     // elements.fetchTagData = createElement('input#_ydb_tv_fetch_tags', {type: 'checkbox'})
    ]), elements.search.children[1]);
    elements.searchButton = elements.search.querySelector('button[type="submit"]');
    elements.searchButton.style.display = 'none';
    elements.searchControl = elements.search.querySelector('.field.field--inline.flex-wrap');
    elements.searchControl.insertBefore(elements.searchStart = createElement('a.button.button--state-primary', {onclick: start}, 'Search'), elements.searchButton);
    elements.searchControl.insertBefore(elements.searchStart = createElement('a.button.button.input--separate-left', {onclick: runPortion}, 'Continue'), elements.searchButton);
    fillElement(elements.searchControl, [
      ['label.input--separate-left', {style: {lineHeight: '200%'}}, 'Portions '],
      elements.portions = createElement('input.input.input--separate-left', {type: 'number', value: 50}),
      ['a.button.button--state-danger.input--separate-left', {onclick: () => clearElement(elements.searchContainer)}, 'Clear output']
    ]);

  }

  if (enviroment !== 'unknown') {
    makeLink();
    if (location.search.includes('__ydb_tv_search')) {
      prepareSearch();
    }
  }
})();
