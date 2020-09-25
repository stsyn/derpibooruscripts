// ==UserScript==
// @name          YDB:Tag Validator
// @version       1.5.1
// @author        stsyn
// @description   Successor of ADUp's component — tag validator

// @match         *://*/*

// @exclude       *://*/adverts/*

// @require       https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0UW.lib.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Tags.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/TagLogic.js

// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/dbs/tv-sites.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/dbs/derpibooru.ruleset.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/dbs/furbooru.ruleset.js

// @downloadURL   https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-TV.user.js

// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

var createElement = createElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var clearElement = clearElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
(function() {
  'use strict';
  if (unsafeWindow.self !== unsafeWindow.top) return;
  const enviroment = YDB_api.getEnviroment();

  function __unique(item, index, array) {
    return index === array.indexOf(item);
  }

  let settings = {
    implicationDisallow: false,
    implicationNotify: true,
    smartSuggestions: true
  };
  const checkedTags = {};
  const isBooru = enviroment !== 'unknown';
  const iam = location.hostname.replace('www.', '').replace('trixiebooru.org', 'derpibooru.org');
  let rulesets = [{}, {}];

  function register() {
    if (!unsafeWindow._YDB_public) unsafeWindow._YDB_public = {};
    if (!unsafeWindow._YDB_public.funcs) unsafeWindow._YDB_public.funcs = {};

    if (/(www\.|)(derpi|trixie)booru\.org/.test(location.hostname)) {
      if (!unsafeWindow._YDB_public.settings) unsafeWindow._YDB_public.settings = {};
      unsafeWindow._YDB_public.settings.tv = {
        name:'Tag Validator',
        version:GM_info.script.version,
        container:'_adup',
        link:'/meta/topics/userscript-semi-automated-derpibooru-uploader',
        s:[
          {type:'checkbox', name:'Turn off implication predictor', parameter:'implicationDisallow'},
          {type:'breakline'},
          {type:'checkbox', name:'Notify about implication', parameter:'implicationNotify'},
          {type:'breakline'},
          {type:'checkbox', name:'Smart tag suggestions', parameter:'smartSuggestions'}
        ]
      };
    }
  }

  function addTag(tag, container) {
    if (container.querySelector(`.tag a[data-tag-name="${tag}"]`)) return;
    container.appendChild(createElement('span.tag._ydb_transparent',{style:{opacity:'0.75', cursor:'pointer'}, dataset:{clickAddtag: tag, tagName: tag, tagCategory: (checkedTags[tag] || {}).category}},[
      tag+' ',
      createElement('a',{href:'javascript://', style:{display:'none'}, dataset:{clickFocus:'.js-taginput-input', tagName:tag}}, 'x')
    ]));
  }

  function drawEmptyTag(tagData, addable) {
    if (!tagData || !tagData.name) return createElement('span');
    const category = tagData.category;
    return createElement('span.tag', {dataset:{tagCategory:category}},[
      tagData.name+' ',
      ['a', {style:{display:'none'}, dataset:{tagName: tagData.name, clickAddtag: addable ? tagData.name : null}}]
    ]);
  }

  function renderImplications(d, container) {
    const tags = d.implied_tags.map(tag => drawEmptyTag({name: tag}));
    container.appendChild(createElement('.alternating-color.block__content', [
      ['',[
        drawEmptyTag(d),
        'implies — ',
        ['span', tags]
      ]]
    ]));
  };

  function renderDnp(container, d) {
    let color = 'flash--site-notice', suggestion = '';
    if (d.dnp_type == 'Artist Upload Only') {
      suggestion = 'You won\'t be able to finish uploading.';
      color = 'flash--warning';
    } else if (d.dnp_type == 'With Permission Only') {
      suggestion = 'You should be ready to provide proof of permission!';
      color = 'flash--warning';
    } else if (d.dnp_type == 'Certain Type/Location Only') {
      color = 'flash--warning';
    } else if (d.dnp_type == 'No Edits') {
      suggestion = 'If you have permission to upload, remove "edit" tag for now and add it after uploading.';
      color = 'flash--warning';
    } else if (d.dnp_type == 'Other') {
      color = 'flash--warning';
    }

    container.appendChild(createElement('.alternating-color.block__content', [
      ['', {className: ' '+color}, [
        drawEmptyTag(d.tag),
        ' — ',
        ['strong', {style: {color}}, d.dnp_type],
        (!suggestion ? '' : ' — '),
        suggestion
      ]],
      ' ',
      d.conditions,
      ['br'],
      ['em', d.reason]
    ]));
  };

  function renderNotify(container, text, color) {
    const colors = {
      'error': 'flash--warning',
      'suggestion': 'flash--site-notice'
    };
    container.appendChild(
      createElement('.alternating-color.block__content', [
        ['div', {
          className: ' '+colors[color],
          innerHTML: text.replace(/%tag:([^%]*)%/g, `<span class="tag" data-tag-name="$1">$1 <a data-tag-name="$1" style="display: none;"></a></span>`)
        }]
      ])
    );
  };

  function makeTagInCache(cache, tag) {
    if (!cache[tag]) cache[tag] = {name: tag, implied_by: [], aliased_to: null};
  }

  async function loadTags(tags, elements, firstPass) {
    const anotherBatchToLoad = [];
    const updatedInfo = Object.values(await YDB_api.fetchManyTagsByName(tags, {resolveSynonims: true, alwaysLoadAliases: true, separateAliases: true}));
    for (let tag of updatedInfo) {
      if (tag.empty) {
        elements.cache[tag.name].empty = true;
        Object.assign(checkedTags[tag.name], tag, {loaded: true});
        continue;
      }
      for (let impliedTag of tag.implied_tags) {
        makeTagInCache(elements.cache, impliedTag);
        if (!checkedTags[impliedTag]) {
          checkedTags[impliedTag] = {loaded: false};
          anotherBatchToLoad.push(impliedTag);
        }
        if (firstPass) elements.cache[impliedTag].implied_by.push(tag.name);
      };
      if (!elements.cache[tag.name]) {
        makeTagInCache(elements.cache, tag.name);
      }
      tag.aliases.forEach(alias => {
        makeTagInCache(elements.cache, alias);
        elements.cache[alias].correctName = tag.name;
      });
      checkedTags[tag.name] = Object.assign(tag, {loaded: true});
    }
    return anotherBatchToLoad;
  }

  async function checker(elements, firstRun) {
    Object.values(elements.cache).forEach(tag => tag.present = false);
    const currentTags = elements.tagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const tagsToLoad = [];
    let deepTagsToLoad = [];
    let hasDiff = false;
    currentTags.forEach(tag => {
      makeTagInCache(elements.cache, tag);
      elements.cache[tag].present = true;
      if (!elements.cache[tag].wasPresent) hasDiff = true;
      elements.cache[tag].wasPresent = true;
      if (!checkedTags[tag]) {
        checkedTags[tag] = {loaded: false};
        tagsToLoad.push(tag);
      } else {
        checkedTags[tag].implied_tags.forEach(tag => {
          if (!checkedTags[tag]) {
            checkedTags[tag] = {loaded: false};
            deepTagsToLoad.push(tag);
          }
        });
      }
    });
    Object.values(elements.cache).filter(tag => !tag.present && tag.wasPresent).forEach(tag => {
      elements.cache[tag.name].wasPresent = false;
      hasDiff = true;

      checkedTags[tag.name].implied_tags.forEach(implied => {
        const impliedTag = elements.cache[implied];
        impliedTag.implied_by = impliedTag.implied_by.filter(name => name !== tag.name);
      });
    });

    if (tagsToLoad.length > 0 || deepTagsToLoad.length > 0) {
      deepTagsToLoad = deepTagsToLoad.concat(await loadTags(tagsToLoad, elements, true)).filter(__unique);
      await loadTags(deepTagsToLoad, elements);
    }

    if (hasDiff || firstRun) {
      const primaryTags = Object.values(elements.cache).filter(tag => tag.present).map(tag => checkedTags[tag.name]);
      const secondaryTags = Object.values(elements.cache).filter(tag => tag.present || tag.implied_by.length > 0).map(tag => checkedTags[tag.name]);

      const primaryData = YDB_api.applyRulesetOnTags(rulesets[0], primaryTags, true);
      const secondaryData = YDB_api.applyRulesetOnTags(rulesets[1], secondaryTags, true);

      const allNotifies = primaryData.errors.concat(secondaryData.errors);
      const dnps = secondaryTags.filter(tag => tag.dnp_entries.length).map(tag => {
        tag.dnp_entries.forEach(dnp => dnp.tag = tag);
        return tag.dnp_entries;
      }).flat();
      let errors = allNotifies.filter(notify => notify.startsWith('[E]')).map(notify => notify.substring(3));
      errors = errors.concat(primaryTags.filter(tag => !tag.images && !tag.aliased_tag).map(tag => `Tag %tag:${tag.name}% has no images`));
      errors = errors.concat(primaryTags.filter(tag => tag.empty && !tag.aliased_tag).map(tag => `Tag %tag:${tag.name}% does not exists`));
      const aliases = primaryTags.filter(tag => tag.aliased_tag);
      const notifies = allNotifies.filter(notify => !notify.startsWith('[E]'));
      const suggestions = Array.from(primaryData.tagsToAdd).concat(Array.from(secondaryData.tagsToAdd)).filter(__unique).filter(tag => !elements.cache[tag] || !elements.cache[tag].present);
      const implications = primaryTags.filter(tag => tag.implied_tags.filter(impl => !(elements.cache[impl] && elements.cache[impl].present)).length);
      const implications2 = Object.values(elements.cache).filter(tag => !tag.present && tag.implied_by.length > 0);

      clearElement(elements.renderer);
      errors.forEach(text => renderNotify(elements.renderer, text, 'error'));
      dnps.forEach(dnp => renderDnp(elements.renderer, dnp));
      if (settings.smartSuggestions) {
        notifies.forEach(text => renderNotify(elements.renderer, text, 'suggestion'));
      }

      if (settings.implicationNotify && !settings.implicationDisallow) {
        implications.forEach(tag => renderImplications(tag, elements.renderer));
      }

      if (!settings.implicationDisallow) {
        clearElement(elements.tagContainer);
        implications2.forEach(implication => addTag(implication.name, elements.tagContainer));
      }
      if (settings.smartSuggestions) {
        clearElement(elements.suggestedContainer);
        suggestions.forEach(implication => addTag(implication, elements.suggestedContainer));
      }

      aliases.forEach(tag => {
        const x = elements.fancyTagInput.querySelector('.tag a[data-tag-name="'+tag.name+'"]');
        // todo говнокакоето
        if (x) {
          const y = x.parentNode;
          y.getElementsByTagName('a')[0].dataset.tagName = tag.aliased_tag;
          y.firstChild.textContent = tag.aliased_tag+' ';
        }
        currentTags.splice(currentTags.indexOf(tag.name), 1);
        currentTags.push(tag.aliased_tag);
        elements.tagInput.value = currentTags.join(', ');
      });

      elements.ratingsWarning.style.display = primaryData.errors.length ? 'block' :'none';
    }
    setTimeout(checker, 333, elements);
  }

  function init() {
    const elements = {};
    elements.form = document.querySelector('form[action="/images"]');

    elements.form.insertBefore(createElement('.block',[
      ['.block__header', [
        ['span.block__header__title', 'DNP entries and warnings. ']
      ]],
      elements.renderer = createElement('.js-taginput.tag-page', {style: {maxHeight: '40vh', overflowY: 'auto'}}, [
        ['.block__content', 'Nothing']
      ])
    ]), document.querySelector('h4+.field'));
    elements.form.insertBefore(elements.ratingsWarning = createElement('.dnp-warning', [
      ['h4', 'You forgot rating tags!'],
      ['p', 'You won\'t upload image if you click "Upload" right now.']
    ]), document.querySelector('#new_image .actions:last-child'));
    elements.container = elements.renderer.parentNode;
    elements.fancyTagInput = document.getElementsByClassName('js-taginput-fancy')[0];
    elements.tagInput = document.getElementsByClassName('js-taginput-plain')[0];
    elements.fancyTagInput.parentNode.parentNode.insertBefore(
      createElement('.js-taginput.input.input--wide.tagsinput', {
        style:{ minHeight:0, display: settings.smartSuggestions || !settings.implicationDisallow ? 'block' : 'none'},
        dataset:{clickFocus:'.js-taginput-input', target:'[name="image[tag_input]"]'}
      }, [
        ['span', !settings.implicationDisallow ? 'Implied tags ' : ''],
        elements.tagContainer = createElement('span'),
        ['hr', {style: {display: settings.smartSuggestions && !settings.implicationDisallow ? 'block' : 'none' }}],
        ['span', settings.smartSuggestions ? 'Suggested tags ' : ''],
        elements.suggestedContainer = createElement('span')
      ]), elements.form.querySelector('.js-taginput-show'));
    elements.cache = {};
    elements.wcache = {};
    elements.initialState = {};
    checker(elements, true);
  }

  if (isBooru) {
    if (!localStorage._adup) {
      localStorage._adup = JSON.stringify(settings);
    }
    else {
      try {
        settings = JSON.parse(localStorage._adup);
      }
      catch(e) {
        localStorage._adup = JSON.stringify(settings);
      }
    }
    rulesets = GetTVRulesets()(iam);
    register();
    if (location.pathname == '/images/new') {
      init();
    }
  }
})();
