// ==UserScript==
// @name         *Booru Uploader
// @namespace    http://derpibooru.org/
// @version      0.2.3
// @description  Way to upload the same image on multiple sites
// @author       stsyn

// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Tags.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/dbs/mbUp-sites.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/dbs/furbooru.ruleset.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/dbs/maneart.ruleset.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/dbs/twibooru.ruleset.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/TagLogic.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ADUp-mini.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/MBUp.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/MBUp.user.js

// @include      /http(s|):\/\/.*\/images\/new.*/

// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        window.close
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
  'use strict';
  let sites = new Set();
  let index = 0;
  sites.add('derpibooru.org');
  sites.add('furbooru.org');
  let listContainer;
  const iam = location.hostname.replace('www.', '').replace('trixiebooru.org', 'derpibooru.org');

  const globalRuleset = {
    '[{[version]}]': '0.0',
    'featured image': '-',
    '* exclusive': '-',
    '* (mlp)': '? (mlp)',
  };

  try {
    sites = new Set(JSON.parse(GM_getValue('sites')));
  } catch (e) {
  }

  function foolProtector(name) {
    const domain = name.split('/')[2].replace('www.', '');
    if (domain === iam) return false;
    return true;
  }

  function adaptLink(name) {
    if (!name.startsWith('//')) name = '//'+name;
    if (!name.startsWith('http:')) name = 'http:'+name;
    if (!name.endsWith('/')) name = name + '/';
    return name;
  }

  function save() {
    GM_setValue('sites', JSON.stringify(Array.from(sites)));
  }

  function renderSiteLine(name) {
    return ['li', {dataset: { name }}, [
      ['button.button', {onclick: (e) => remove(name, e) }, [['i.fa.fa-trash']]],
      ' ',
      ['input.input', {type: 'text', value: name}],
      ' ',
      ['button.button', {onclick: (e) => edit(name, e) }, [['i.fa.fa-save']]],
      ' ',
      ['button.button', {onclick: (e) => upload(name, e) }, [['i.fa.fa-upload']]],
      ['span', { style: {display: 'none'} }, ' Prefetching, please wait...']
      ]]
  }

  function remove(name, e) {
    e.preventDefault();
    e.stopPropagation();
    if (unsafeWindow.confirm(`Delete site ${name}?`)) {
      sites.delete(name);
      save();
      listContainer.removeChild(listContainer.querySelector(`li[data-name="${name}"]`));
    }
    return false;
  }

  function add(e) {
    e.preventDefault();
    e.stopPropagation();
    listContainer.appendChild(createElement(...renderSiteLine('__' + index++)));
    return false;
  }

  async function gainTags() {
    const tags = document.getElementById('image_tag_input').value.split(',').map(tag => tag.trim().toLowerCase());
    return Object.values(await YDB_api.fetchManyTagsByName(tags));
  }

  function makeDataLink(tags) {
    const tagSwitch = document.querySelector('.button.button--state-primary.button--bold.js-taginput-show');
    const imageSource = document.getElementById('image_source_url');
    const scrapper = document.getElementById('image_scraper_url') || document.getElementById('scraper_url');
    const scrapperLoader = document.getElementById('js-scraper-preview');
    const description = document.getElementById('image_description');

    return 'images/new?newImg='+encodeURIComponent(scrapper.value)+
      '&src='+encodeURIComponent(imageSource.value)+
      '&tags='+encodeURIComponent(tags.join(','))+
      '&description='+encodeURIComponent(description.value)+
      '&ydb_mbooru=1';
  }

  function uploadOnSite(name, tags, tab) {
    const link = adaptLink(name);
    const domain = link.split('/')[2].replace('www.', '');
    listContainer.querySelector(`li[data-name="${name}"] span`).style.display = 'inline';
    let firstResults = YDB_api.applyRulesetOnTags(globalRuleset, tags, true);
    const rulesets = GetMBUpRulesets()(iam, domain);
    let results;
    if (rulesets) {
      results = rulesets.map(ruleset => YDB_api.applyRulesetOnTags(ruleset, tags, true));
      results = results.reduce((acc, result) => YDB_api.mergeRulesetResults(acc, result), firstResults);
      firstResults = YDB_api.applyRulesetResults(results, tags);
    } else {
      firstResults = YDB_api.applyRulesetResults(firstResults, tags);
    }

    setTimeout(() => {
      if (tab) tab.close();
      const appendix = makeDataLink(firstResults);
      GM_openInTab(link + appendix, {active: true});
      listContainer.querySelector(`li[data-name="${name}"] span`).style.display = 'none';
    }, 500);
  }

  async function upload(name, e) {
    e.preventDefault();
    e.stopPropagation();
    const link = adaptLink(name);
    if (!foolProtector(link)) {
      unsafeWindow.alert('You can\'t use it for your current site, silly!');
      return;
    }
    const tab = GM_openInTab(link, {active: false});
    uploadOnSite(name, await gainTags(), tab);
  }

  async function uploadEverywhere(e) {
    e.preventDefault();
    e.stopPropagation();
    const tabs = Array.from(sites).map(name => {
      const link = adaptLink(name);
      return !foolProtector(link) ? null : GM_openInTab(link, {active: false});
    }).filter(tab => tab);
    const tags = await gainTags();

    setTimeout(() => {
      tabs.forEach(tab => tab.close());
      Array.from(sites).forEach(name => {
        const link = adaptLink(name);
        if (!foolProtector(link)) return;
        uploadOnSite(name, tags, null);
      })
    }, 500);
  }

  function edit(name, e) {
    e.preventDefault();
    e.stopPropagation();
    const elem = listContainer.querySelector(`li[data-name="${name}"]`);
    const newName = elem.getElementsByTagName('input')[0].value;
    sites.delete(name);
    sites.add(newName);
    listContainer.removeChild(elem);
    listContainer.appendChild(createElement(...renderSiteLine(newName)));
    save();
    return false;
  }

  if (!location.href.includes('&ydb_mbooru=1')) {
    document.querySelector('form[action="/images"]').appendChild(
      createFromNotation(
        '.actions',
        ['h4', 'Also upload to: '],
        listContainer = createElement('ul', Array.from(sites).map(renderSiteLine)),
        ['button.button', { onclick: add }, 'Add site'],
        ' ',
        ['button.button', { onclick: uploadEverywhere }, 'Upload everywhere'],
        ['.block',
         ['.block__content',
          ['p',
           '"Upload" button on all sites still will need to be clicked by you. ',
           ['strong', 'Only you are responsible for accurate tagging and compliance with the rules between boorus!']
          ],
          ['p', 'Images will be prepared only if transfered via "Fetch", othervise you\'ll have to specify them manually again.'],
          ['p', 'Tag transformations when going from Booru-on-Rails based boorus may be inaccurate.']
         ]
        ]
      )
    )
  }
})();
