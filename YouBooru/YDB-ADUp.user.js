// ==UserScript==
// @name          YDB:ADUp
// @version       0.4.2
// @author        stsyn

// @match         *://*/*

// @exclude       *://trixiebooru.org/adverts/*
// @exclude       *://derpibooru.org/adverts/*
// @exclude       *://www.trixiebooru.org/adverts/*
// @exclude       *://www.derpibooru.org/adverts/*
// @exclude       *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude       *://*.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude       *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*
// @exclude       *://*.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*

// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0UW.lib.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/CreateElement.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require       https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/tagDB0.js
// @downloadURL   https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp.user.js

// @grant         GM_setValue
// @grant         GM_getValue
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

(function() {
  'use strict';
  if (unsafeWindow.self !== unsafeWindow.top) return;
  function getDerpHomeDomain() {
    try {
      return GM_getValue('domain', 'www.derpibooru.org');
    }
    catch (e) {
      return 'www.derpibooru.org';
    }
  }

  let tagDB = {};
  function _getTagDB() {
    try {
      tagDB = getTagDB();
      let newNormal = {};
      for (let i in tagDB.normal) {
        tagDB.normal[i].forEach(tag => newNormal[tag] = i);
      }
      tagDB.normal = newNormal;
    }
    catch(e) {setTimeout(_getTagDB,500);}
  }
  _getTagDB();

  let overRideSize = false;
  let onceLoaded = false;
  let checkedTags = {};
  let ratingsReason = '';
  let forceRedraw = false;
  let currentImage = '';
  let loadLimit = 2;
  let settings = {
    implicationDisallow: false,
    implicationDefaultInsert: true,
    implicationNotify: true,
    implicationDefaultRecursive: false,
    implicationAutoDelete: true,
    batchLoader: true,
    smartSuggestions: true
  };

  const tagRules = [
    {
      type: 'error',
      message: 'No origin provided!',
      checker: {
        op: 'nor',
        params: ['artist:*', 'screencap', 'artist needed', 'anonymous artist']
      }
    }, {
      type: 'error',
      message: 'No character tag!',
      checker: {
        op: 'nor',
        params: ['%character', '%oc', 'no pony']
      }
    }, {
      type: 'error',
      message: '%tag:solo *% should be used only in sexual context. Use just %tag:solo%.',
      suggestions: ['solo'],
      checker: {
        op: 'and',
        params: [{
          op: 'or',
          params: ['solo female', 'solo male', 'solo futa']
        }, 'safe']
      }
    }, {
      type: 'error',
      message: '%tag:female%, %tag:futa%, %tag:male% with %tag:solo%.',
      checker: {
        op: 'and',
        params: ['solo', {
          op: 'gt',
          params: [1, {
            op: 'add',
            params: ['male', 'female', 'futa']
          }]
        }]
      }
    }, {
      type: 'error',
      message: 'Multiple characters while %tag:solo% tagged.',
      checker: {
        op: 'and',
        params: ['solo', {
          op: 'gt',
          params: [1, {
            op: 'add',
            params: ['%character', 'oc:*']
          }]
        }, {
          op: 'not',
          params: ['fusion']
        }]
      }
    }, {
      type: 'suggestion',
      message: '%tag:oc% should be tagged',
      suggestions: ['oc'],
      checker: {
        op: 'and',
        params: ['oc:*']
      }
    }, {
      type: 'suggestion',
      message: 'Only original characters tagged, maybe %tag:oc only% should be used?',
      suggestions: ['oc only'],
      checker: {
        op: 'and',
        params: [
          'oc:*',
          {op: 'not', params: ['%character']},
          {op: 'not', params: ['oc only']}
        ]
      }
    }
  ];

  function register() {
    if (!unsafeWindow._YDB_public) unsafeWindow._YDB_public = {};
    if (!unsafeWindow._YDB_public.funcs) unsafeWindow._YDB_public.funcs = {};
    unsafeWindow._YDB_public.funcs.getDerpHomeDomain = getDerpHomeDomain;

    if (/(www\.|)(derpi|trixie)booru\.org/.test(location.hostname)) {
      if (!unsafeWindow._YDB_public.settings) unsafeWindow._YDB_public.settings = {};
      unsafeWindow._YDB_public.settings._adup = {
        name:'ADUp',
        version:GM_info.script.version,
        container:'_adup',
        link:'/meta/topics/userscript-semi-automated-derpibooru-uploader',
        s:[
          {type:'checkbox', name:'Turn off implication predictor', parameter:'implicationDisallow'},
          {type:'checkbox', name:'Batch tag loader', parameter:'batchLoader'},
          {type:'breakline'},
          {type:'checkbox', name:'Notify about implication', parameter:'implicationNotify'},
          {type:'breakline'},
          {type:'checkbox', name:'Smart tag suggestions', parameter:'smartSuggestions'}/*,
          {type:'breakline'},
          {type:'breakline'},
          {type:'checkbox', name:'Show implied tags by default', parameter:'implicationDefaultInsert'},
          {type:'checkbox', name:'Insert implied tags by default', parameter:'implicationDefaultRecursive'},
          {type:'breakline'},
          {type:'text', name:'Please refer to the script forum topic to understand the difference.',styleS:{fontStyle:'italic'}}*/
        ]
      };
    }
  }

  function fetchExtData(url) {
    let req = new XMLHttpRequest();
    req.open('GET', '/images/'+url.params.origin+'.json', false);
    req.send();
    let x = JSON.parse(req.responseText);
    url.params.tags = encodeURIComponent(x.tags);
    url.params.originWidth = x.width;
    url.params.originHeight = x.height;
    url.params.originView = x.representations.large;
    if (url.params.src == 'undefined') url.params.src = encodeURIComponent(x.source_url);
  }

  function hasData() {
    return document.getElementById('image_tag_input').value || document.getElementById('image_source_url').value || document.getElementById('image_scraper_url').value || document.getElementById('image_description').value;
  }

  function fillDData1(url) {
    if (decodeURIComponent(url.params.tags) != 'undefined') {
      if (url.params.origTags) {
        document.getElementById('image_tag_input').value = url.params.origTags+','+decodeURIComponent(url.params.tags);
      }
      else {
        url.params.origTags = decodeURIComponent(url.params.tags);
        document.getElementById('image_tag_input').value = decodeURIComponent(url.params.tags);
      }
      document.querySelector('.button.button--state-primary.button--bold.js-taginput-show').click();
    }
    if (decodeURIComponent(url.params.src) != 'undefined') {
      document.getElementById('image_source_url').value = decodeURIComponent(url.params.src);
    }
    if (decodeURIComponent(url.params.newImg) != 'undefined') {
      document.getElementById('image_scraper_url').value = decodeURIComponent(url.params.newImg);
      onceLoaded = true;
      document.getElementById('js-scraper-preview').click();
    }
    if (decodeURIComponent(url.params.description) != 'undefined') {
      document.getElementById('image_description').value = decodeURIComponent(url.params.description).replace(/\n\s*\n/g, '\n').replace(/^\s*/mg, '');
    }
    if (decodeURIComponent(url.params.originView) != 'undefined') {
      document.getElementById('_ydb_preview').src = url.params.originView;
    }
  }

  function fillData1(url) {
    if (!hasData()) {
      fillDData1(url)
    } else {
      document.querySelector('form[action="/images"]').insertBefore(
        createElement('div#_ydb_warning.dnp-warning', {style: {marginBottom: '0.5em'}},[
          createElement('h4', "Override prefilled page content with ADUp fetch data?"),
          createElement('p', [
            createElement('a', {events:{'click':() => {fillDData1(url); document.getElementById('_ydb_warning').style.display = 'none'}}}, 'OK'),
            ' ',
            createElement('a', {events:{'click':() => document.getElementById('_ydb_warning').style.display = 'none'}}, 'Cancel')
          ])
        ]),
        document.querySelector('.dnp-warning'));
    }

    if (decodeURIComponent(url.params.originWidth) != 'undefined') {
      document.getElementById('_ydb_old').innerHTML = url.params.originWidth+'x'+url.params.originHeight;
    }
    if (decodeURIComponent(url.params.newWidth) != 'undefined') {
      overRideSize = true;
      document.getElementById('_ydb_new').innerHTML = url.params.newWidth+'x'+url.params.newHeight;
    }
  }

  function diff(url) {
    let ctx = document.getElementById('_ydb_diff').getContext('2d');
    ctx.canvas.width = document.getElementById('_ydb_preview').naturalWidth;
    ctx.canvas.height = document.getElementById('_ydb_preview').naturalHeight;
    let img = document.getElementById('_ydb_preview');
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'difference';
    img = document.getElementById('js-image-upload-preview');
    ctx.drawImage(img, 0, 0, document.getElementById('_ydb_preview').naturalWidth, document.getElementById('_ydb_preview').naturalHeight);
    if (!overRideSize) document.getElementById('_ydb_new').innerHTML = img.naturalWidth + 'x' + img.naturalHeight;
    if (decodeURIComponent(url.params.src) != 'undefined') {
      document.getElementById('image_source_url').value = decodeURIComponent(url.params.src);
    }
  }

  function reverse(url) {
    const build = function(req) {
      let ux;
      if (!document.getElementById('image_scraper_url').value) {
        if (document.getElementById('image_image').files.length > 0) {
          ux = document.querySelector('.input.js-scraper').cloneNode(true);
          ux.id = 'image';
          ux.name = 'image';
          document.querySelector('#_ydb_similarGallery strong').innerHTML += ' (It may take a while)';
        }
        else {
          document.querySelector('#_ydb_similarGallery strong').innerHTML = 'You hadn\'t specified either local file or url.';
          document.getElementById('ydb_head_hiddenable').style.display = 'inline';
          return;
        }
      }
      const s = createElement('div',{style:'display:none'}, req.responseText);
      //document.body.appendChild(s);
      const ax = createElement('form#_ydb_reverse.hidden', {enctype:"multipart/form-data",action:"/search/reverse",acceptCharset:"UTF-8",method:"post"},[
        createElement('input',{name:"utf8",value:"✓",type:'hidden'}),
        createElement('input',{name:"_csrf_token",value:s.querySelector('form[action="/search/reverse"] input[name="_csrf_token"]').value,type:'hidden'}),
        createElement('input',{name:"fuzziness",value:document.getElementById('ydb_fuzzyness').value,type:'hidden'}),
        (!document.getElementById('image_scraper_url').value?
         ux:
         createElement('input',{name:"image[scraper_url]",value:decodeURIComponent(document.getElementById('image_scraper_url').value),type:'hidden'})
        )
      ]);
      const callback = function(rq) {
        document.getElementById('ydb_head_hiddenable').style.display = 'inline';
        s.innerHTML = rq.responseText;
        let t = document.getElementById('_ydb_similarGallery');
        t.innerHTML = '';
        let e = s.querySelector('table');
        if (e) for (let i=1; i<e.querySelectorAll('tr').length; i++) {
          let x = e.querySelectorAll('tr')[i];
          let ix = x.querySelector('.image-container.thumb');
          t.parentNode.style.display = 'block';

          t.appendChild(
            createElement('div.media-box', [
              createElement('a.media-box__header.media-box__header--link.media-box__header--small', {target:'_blank', href:'/images/'+ix.dataset.imageId}, '>>'+ix.dataset.imageId),
              createElement('div.media-box__content.media-box__content--small', [
                createElement('div.image-container.thumb', [
                  createElement('a',{events:{'click':(ex) => {
                    Array.from(document.getElementById('_ydb_similarGallery').childNodes[i]).forEach(elem => elem.style.opacity = 1);
                    let x = ex.target;
                    while (!x.classList.contains('media-box')) x = x.parentNode;
                    x.style.opacity = 0.5;
                    url.params.origin = ix.dataset.imageId;
                    fetchExtData(url);
                    fillData1(url);
                    diff(url);
                  }}},[
                    createElement('picture', [
                      createElement('img',{src:JSON.parse(ix.dataset.uris).thumb})
                    ])
                  ])
                ])
              ])
            ])
          );

        }
        else {
          if (document.querySelector('#_ydb_similarGallery strong') != undefined) document.querySelector('#_ydb_similarGallery strong').innerHTML = 'Nothing is found';
          else document.getElementById('_ydb_similarGallery').appendChild(createElement('strong', 'Nothing is found'));
        }
      };
      const readyHandler = function(rq) {
        return function () {
          if (rq.readyState === 4) {
            if (rq.status === 200) return callback(rq);
          }
          return false;
        };
      };
      const get = function() {
        const rq = new XMLHttpRequest();
        rq.onreadystatechange = readyHandler(rq);
        rq.open('POST', '/search/reverse');
        rq.send(new FormData(ax));
      };
      get();
    };
    const req = new XMLHttpRequest();
    req.open('GET', '/search/reverse', false);
    req.send();
    build(req);
  }

  function addTag(tag) {
    const z = document.querySelector('.fancy-tag-upload').parentNode;
    if (z.querySelector(`._ydb_transparent a[data-tag-name="${tag}"]`)) return;
    if (document.querySelector(`.js-taginput-fancy .tag a[data-tag-name="${tag}"]`)) return;
    let y = z.querySelector('._ydb_tag_placeholder');
    if (!y) {
      y = z.insertBefore(
        createElement('div._ydb_tag_placeholder.js-taginput.input.input--wide.tagsinput', {style:'min-height:0', dataset:{clickFocus:'.js-taginput-input', target:'[name="image[tag_input]"]'}}, [
          createElement('span', 'Implied tags ')
      ]), z.querySelector('.js-taginput-show'));
    }
    y.appendChild(createElement('span.tag._ydb_transparent',{style:{opacity:'0.75', cursor:'pointer'}, dataset:{clickAddtag: tag, tagName: tag, tagCategory: (checkedTags[tag] || {}).category}},[
      tag+' ',
      createElement('a',{href:'javascript://', style:{display:'none'},dataset:{clickFocus:'.js-taginput-input',tagName:tag}}, 'x')
    ]));
  }

  function drawEmptyTag(tagData, addable) {
    let category;
    if (tagData) {
      category = tagData.category;
    }
    if (tagData.name == '') return createElement('span');
    return createElement('span.tag', {dataset:{tagCategory:category}},[
      tagData.name+' ',
      createElement('a', {style:{display:'none'}, dataset:{tagName: tagData.name, clickAddtag: addable ? tagData.name : null}})
    ]);
  }

  function tagCheck() {
    let gotten;

    const ratingTags = {
      safe:'safe',
      suggestive:'sexual',
      questionable:'sexual',
      explicit:'sexual',
      'semi-grimdark':'grimdark',
      grimdark:'grimdark',
      grotesque:'grotesque'
    };

    const handleTagData = function (name, data) {
      if (data.fail) {
        delete checkedTags[name];
        return;
      }

      if ((data.tag && data.tag.implied_tags) || settings.implicationDisallow) {
        checkedTags[name] = {name, implied_tags: data.tag.implied_tags};
      }
      else {
        checkedTags[name] = {name, implied_tags: []};
      }

      if (data.tag) checkedTags[name].category = data.tag.category;
      checkedTags[name].notReady = false;
      checkedTags[name].drawn = false;

      let dnp = data.dnp_entries;
      if (!dnp) {
        checkedTags[name].dnp_type = 'Tag does not exist';
      }
      else if (data.tag.images == 0) {
        checkedTags[name].dnp_type = 'Tag has no images';
      }
      else if (dnp.length > 0) {
        dnp.forEach(d => {
          d.name = name;
          d.implied_tags = checkedTags[name].implied_tags;
          checkedTags[name] = d;
          gotten = true;
        });
      }
      else if (checkedTags[name].implied_tags.length == 0) {
        checkedTags[name].ok = true;
      }
    };

    const handleBatchTagData = function (name, data) {
      if (data.fail) {
        delete checkedTags[name];
        return;
      }

      if ((data.implied_tags) || settings.implicationDisallow) {
        checkedTags[name] = {name, implied_tags: data.implied_tags};
      }
      else {
        checkedTags[name] = {name, implied_tags: []};
      }

      if (data.tag) checkedTags[name].category = data.tag.category;
      checkedTags[name].notReady = false;
      checkedTags[name].drawn = false;

      let dnp = data.dnp_entries;
      if (data.images == 0) {
        checkedTags[name].dnp_type = 'Tag has no images';
        return;
      }
      else if (dnp && dnp.length>0) {
        dnp.forEach(d => {
          d.name = name;
          d.implied_tags = checkedTags[name].implied_tags;
          checkedTags[name] = d;
          gotten = true;
        });
      }
      else if (checkedTags[name].implied_tags.length == 0) {
        checkedTags[name].ok = true;
      }
    };

    const checkTag = function (name, y) {
      fetch('/tags/'+encodeURIComponent((name).replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-').replace(/\//g,'-fwslash-'))+'.json',{method:'GET'})
      .then(response => {
        const errorMessage = {fail:true};
        if (!response.ok)
          return errorMessage;
        if (response.redirected) {
          let newTag = response.url.split('/').pop().replace(/.json$/,'');
          if (newTag == '') return {};
          newTag = decodeURIComponent(newTag.replace(/\-dash\-/g,'-').replace(/\-dot\-/g,'.').replace(/\+/g,' ').replace(/\-colon\-/g,':').replace(/\%25/g,'%'));
          y.getElementsByTagName('a')[0].dataset.tagName = newTag;
          y.firstChild.textContent = newTag+' ';
          return errorMessage;
        }
        return response.json();
      })
      .then(data => {
        handleTagData(name, data);
      });
    };

    const batchCheckTag = function (names, target) {
      if (names.length == 1) {
        checkTag(names[0], target.querySelector('.tag a[data-tag-name="'+names[0]+'"]').parentNode);
        return;
      }
      let uri = unsafeWindow.booru.apiEndpoint+"tags/fetch_many.json?name[]="+names.join("&name[]=");
      fetch(uri,{method:'GET'})
      .then(function (response) {
        const errorMessage = {fail:true};
        if (!response.ok)
          return errorMessage;
        return response.json();
      })
      .then(data => {
        if (data.fail) {
          names.forEach(function (name) {delete checkedTags[name]})
          return;
        }

        if (data.tags) {
          data.tags.forEach(x => {
            if (x.aliased_to) {
              const newTag = x.aliased_to;
              const y = target.querySelector('.tag a[data-tag-name="'+names[0]+'"]').parentNode;
              y.getElementsByTagName('a')[0].dataset.tagName = newTag;
              y.firstChild.textContent = newTag+' ';
              x = {fail:true};
            }
            handleBatchTagData(x.name, x);
            names.splice(names.indexOf(x.name));
          });
          names.forEach(name => checkedTags[name].dnp_type = 'Tag does not exist');
        }

      });
    };

    const implyRender = function (x, d) {
      const tags = d.implied_tags.filter(tag => !document.querySelector(`.js-taginput-fancy .tag:not(._ydb_transparent) a[data-tag-name="${tag}"]`)).map(tag => drawEmptyTag({name: tag}));
      if (tags.length == 0) return false;
      return createElement('div.alternating-color.block__content', [
        createElement('div',[
          drawEmptyTag(d),
          'implies — ',
          createElement('span', tags),
          createElement('a.action.block__header__title',{href:'javascript://', events:{'click':() => {
            d.implied_tags.forEach(tag => {
              if (document.querySelector(`.tag._ydb_transparent a[data-tag-name="${tag}"]`)) {
                document.querySelector(`.tag._ydb_transparent a[data-tag-name="${tag}"]`).click();
              }
            });
          }}}, 'Insert'),
          createElement('a.action.block__header__title',{href:'javascript://', events:{'click':(e) => {
            d.ok = true;
            d.drawn = false;
            e.target.parentNode.parentNode.style.display = 'none';
          }}}, 'Hide')
        ])
      ]);
    };

    const render = function (d) {
      let color = 'flash--site-notice', suggestion = '';
      if (d.dnp_type=='Artist Upload Only') {
        suggestion = 'You won\'t be able to finish uploading.';
        color = 'flash--warning';
      }
      if (d.dnp_type=='With Permission Only') {
        suggestion = 'You should be ready to provide proof of permission!';
        color = 'flash--warning';
      }
      if (d.dnp_type=='Certain Type/Location Only') color = 'flash--warning';
      if (d.dnp_type=='No Edits') {
        suggestion = 'If you have permission to upload, remove "edit" tag for now and add it after uploading.';
        color = 'flash--warning';
      }
      if (d.dnp_type=='Other') color = 'flash--warning';
      if (d.dnp_type=='Tag does not exist' || d.dnp_type=='Tag has no images') {
        suggestion = 'You may have mistyped.';
      }

      if (d.ratings) {
        suggestion = 'You need to fix it before uploading.';
        color = 'flash--warning';
      }

      return createElement('div.alternating-color.block__content', [
        createElement('div', {className: ' '+color}, [
          drawEmptyTag(d),
          ' — ',
          createElement('strong', {style: {color}}, d.dnp_type),
          (!suggestion ? '' : ' — '),
          suggestion
        ]),
        ' ',
        d.conditions,
        createElement('br'),
        createElement('em', d.reason)
      ]);
    };

    const checkRatingTags = function (ratings) {
      let warning = '';
      let wx = {name:''};
      if (ratings.safe == 0 && ratings.sexual == 0 && ratings.grimdark == 0 && ratings.grotesque == 0) {
        warning = 'You forgot rating tags!';
      }
      else if (ratings.safe != 0 && (ratings.sexual != 0 || ratings.grimdark != 0 || ratings.grotesque != 0)) {
        warning = 'You cannot use "safe" with any other rating tags!';
        wx.name = 'safe';
      }
      else if (ratings.sexual > 1) {
        warning = 'You cannot use more than one sexual ratings tag!';
        wx.name = (ratings.detailed.indexOf('suggestive') > -1 ? 'suggestive' : 'questionable');
      }
      else if (ratings.grimdark > 1) {
        warning = 'You cannot use more than one grimdark ratings tag!';
        wx.name = 'semi-grimdark';
      }
      else if (ratings.detailed.length < 3) {
        warning = 'You should have at least 3 tags!';
      }
      else {
        document.getElementById('ratings-warning').style.display = 'none';
        return {dnp_type:''};
      }

      const container = document.getElementById('ydb_dnp_container');
      wx.dnp_type = warning;
      wx.ratings = true;
      document.getElementById('ratings-warning').style.display = 'block';
      document.querySelector('#ratings-warning h4').innerHTML = warning;
      return wx;
    };

    const checkTagsByRules = function() {
      if (!settings.smartSuggestions) return false;
      let anythingChanged = false;
      const handleNode = (node) => {
        let first = true;
        let nodeState = 0;
        node.params.forEach(elem => {
          let elemState = 0;
          if (typeof elem == 'object') {
            elemState = handleNode(elem);
          }
          else if (typeof elem == 'string') {
            if (elem.startsWith('%')) {
              let cache = {};
              elemState = Object.values(checkedTags).reduce((sum, tag) => {
                const cat = elem.substr(1);
                if (cache[tag.name]) return sum;
                if (tag.notReady) return sum;
                let x = 0;
                if (tag.category == cat) {
                  cache[tag.name] = true;
                  x = 1;
                }
                if (tag.implied_tags) {
                  x += tag.implied_tags.filter(tn => {
                    if (cache[tn]) return false;
                    cache[tn] = true;
                    if (tagDB.regulars[cat] && tagDB.regulars[cat].test(tn)) return true;
                    return tagDB.normal[tn] === cat;
                  }).length;
                }
                return sum + x;
              }, 0);
            } else if (elem.endsWith('*')) {
              let cache = {};
              elemState = Object.values(checkedTags).reduce((sum, tag) => {
                if (cache[tag.name]) return sum;
                if (tag.notReady) return sum;
                let x = 0;
                if (tag.name.startsWith(elem.slice(0, -1))) {
                  cache[tag.name] = true;
                  x = 1;
                }
                if (tag.implied_tags) {
                  x += tag.implied_tags.filter(tn => {
                    if (cache[tn]) return false;
                    if (tn.startsWith(elem.slice(0, -1))) {
                      cache[tn] = true;
                      return true;
                    };
                  }).length;
                }
                return sum + x;
              }, 0);
            } else {
              let cache = {};
              if (!(checkedTags[elem] || {notReady: true}).notReady) {
                elemState = 1;
                cache[elem] = true;
              }
              elemState += Object.values(checkedTags).filter(tag => {
                if (!tag.notReady && tag.implied_tags && tag.implied_tags.indexOf(elem) > -1) {
                  if (cache[elem]) return false;
                  cache[elem] = true;
                  return true;
                }
              }).length;
            }
          }
          else if (typeof elem == 'number') {
            elemState = elem;
          }
          if (node.op == 'or' || node.op == 'nor' || node.op == 'add') nodeState += elemState;
          if (node.op == 'not') nodeState = !elemState;
          if (first) {
            if (node.op == 'gt' || node.op == 'gte' || node.op == 'lt' || node.op == 'lte' || node.op == 'eq' || node.op == 'neq') nodeState = elemState;
            if (node.op == 'and' || node.op == 'nand') nodeState = elemState;
          } else {
            if (node.op == 'and' || node.op == 'nand') nodeState &= elemState;
            if (node.op == 'gt') nodeState = elemState > nodeState ? 1 : 0;
            if (node.op == 'gte') nodeState = elemState >= nodeState ? 1 : 0;
            if (node.op == 'lt') nodeState = elemState < nodeState ? 1 : 0;
            if (node.op == 'lte') nodeState = elemState <= nodeState ? 1 : 0;
            if (node.op == 'eq') nodeState = elemState === nodeState ? 1 : 0;
            if (node.op == 'neq') nodeState = elemState !== nodeState ? 1 : 0;
          }

          first = false;
        });
        if (node.op == 'nand' || node.op == 'nor') nodeState = !nodeState;
        return nodeState;
      };

      tagRules.forEach(rule => {
        const state = handleNode(rule.checker);
        if (rule.state != state) {
          rule.state = state;
          anythingChanged = true;
        }
      });

      return anythingChanged;
    };

    const renderTagRules = function(container) {
      const colors = {
        'error': 'flash--warning',
        'suggestion': 'flash--site-notice'
      };
      return tagRules.filter(rule => rule.state).forEach(rule => {
        if (rule.suggestions) {
          rule.suggestions.filter(tag => !document.querySelector(`.js-taginput-fancy .tag:not(._ydb_transparent) a[data-tag-name="${tag}"]`)).map(tag => addTag(tag));
        }
        container.appendChild(
          createElement('div.alternating-color.block__content', [
            createElement('div', {className: ' '+colors[rule.type]}, rule.message.replace(/%tag:([^%]*)%/g, `<span class="tag" data-tag-name="$1">$1 <a data-tag-name="$1" style="display: none;"></a></span>`)
            )
          ])
        );
      });
    };

    const checker = function (target, method) {
      const container = document.getElementById('ydb_dnp_container');

      for (let i=0; i<document.querySelectorAll(target).length; i++) {
        let ratings = {
          safe:0,
          sexual:0,
          grimdark:0,
          grotesque:0,
          detailed:[]
        };
        let processed = 0;
        let tagsToCheck = [];
        let x = document.querySelectorAll(target)[i];
        for (let x in checkedTags) checkedTags[x].shouldDraw = false;
        for (let i=0; i < x.getElementsByClassName('tag').length; i++) {
          if (processed > loadLimit) break;
          if (tagsToCheck.length > 50) break;
          let y = x.getElementsByClassName('tag')[i];
          const name = y.getElementsByTagName('a')[0].dataset.tagName;

          if (y.dataset && !y.dataset.tagCategory && checkedTags[name] && checkedTags[name].category) y.dataset.tagCategory = checkedTags[name].category;

          if (y.classList.contains('_ydb_transparent')) continue;

          if (ratingTags[name]) {
            ratings[ratingTags[name]]++;
          }
          ratings.detailed.push(name);

          if (!checkedTags[name]) {
            checkedTags[name] = {notReady:true};
            if (!settings.batchLoader) {
              checkTag(name, y);
              processed++;
            }
            else tagsToCheck.push(name);
          }
          else if (!checkedTags[name].notReady) {
            checkedTags[name].shouldDraw = true;
            if (!checkedTags[name].drawn) gotten = true;
          }

        }

        if (settings.batchLoader && tagsToCheck.length > 0) batchCheckTag(tagsToCheck, x);

        for (let x in checkedTags) {
          if (checkedTags[x].notReady) continue;
          if (!checkedTags[x].shouldDraw) {
            delete checkedTags[x];
            gotten = true;
            continue;
          }
          if (checkedTags[x].drawn != checkedTags[x].shouldDraw) {
            gotten = true;
            break;
          }
        }

        let ratingCheck = checkRatingTags(ratings);
        if (ratingsReason != ratingCheck.dnp_type) gotten = true;

        gotten != checkTagsByRules();

        if (gotten) {
          let drawn = false;
          for (let x in checkedTags) {
            if (checkedTags[x].notReady) continue;
            checkedTags[x].drawn = false;
          }
          while (document.querySelector('._ydb_transparent')) document.querySelector('._ydb_transparent').parentNode.removeChild(document.querySelector('._ydb_transparent'));

          let container = document.getElementById('ydb_dnp_container');
          container.innerHTML = '';
          if (ratingCheck.dnp_type != '') {
            drawn = true;
            container.appendChild(render(ratingCheck));
          }
          ratingsReason = ratingCheck.dnp_type;

          renderTagRules(container);

          for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
            let y = x.getElementsByClassName('tag')[i];
            let z;
            z = y.getElementsByTagName('a')[0].dataset.tagName;

            let name = z;
            if (!checkedTags[name]) continue;
            else if (checkedTags[name].notReady) continue;
            else if (!checkedTags[name].ok) {
              if (checkedTags[name].dnp_type) {
                container.appendChild(render(checkedTags[name]));
                container.scrollTop = container.scrollHeight;
                drawn = true;
              }
            }

            const elem = implyRender(x, checkedTags[name]);
            if (checkedTags[name].implied_tags.length > 0) {
              if (elem) {
                if (!checkedTags[name].ok && settings.implicationNotify) {
                  container.appendChild(elem);
                  container.scrollTop = container.scrollHeight;
                  drawn = true;
                }
              }
              checkedTags[name].implied_tags.forEach(tag => addTag(tag));
            }
            checkedTags[name].drawn = true;
          }
          if (!drawn) {
            container.appendChild(createElement('div.block__content', 'Nothing'));
          }
        }
      }

    };
    checker('.js-taginput-fancy');
    setTimeout(tagCheck,333);
  }

  function diffCheck(url) {
    setTimeout(diffCheck, 100, url);
    if (url.params.originView == undefined) document.getElementById('_ydb_diff_container').style.display = 'none';
    else document.getElementById('_ydb_diff_container').style.display = 'block';
    if (document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked') == null) return;
    let c = document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked').value;
    if (currentImage != c) {
      currentImage = c;
      document.getElementById('js-image-upload-preview').src = document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked+.scraper-preview--image-wrapper img').src;
    }
  }

  register();
  if (/(www\.|)(derpi|trixie)booru\.org/.test(location.hostname)) {
    GM_setValue('domain', location.hostname);
    if (localStorage._adup == undefined || settings.override) {
      localStorage._adup = JSON.stringify(settings);
    }
    else {
      try {
        var settings2 = JSON.parse(localStorage._adup);
        settings = settings2;
      }
      catch(e) {
        localStorage._adup = JSON.stringify(settings);
      }
    }

    if (settings.batchLoad === undefined) settings.batchLoad = true;

    unsafeWindow.checkedTags = checkedTags;
    if ((parseInt(location.pathname.slice(1))>=0 && location.pathname.split('/')[2] == undefined) || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0 && location.pathname.split('/')[3] == undefined)) {
      let url;
      url = '?';
      url += 'tags='+encodeURIComponent(document.querySelector('.js-taginput.js-taginput-plain.js-taginput-tag_input').value);
      let src = document.querySelector('span.source_url a');
      if (src) url += '&src='+encodeURIComponent(src.innerHTML);
      url += '&origin='+document.getElementsByClassName('image-show-container')[0].dataset.imageId;
      url += '&originView='+encodeURIComponent(JSON.parse(document.getElementsByClassName('image-show-container')[0].dataset.uris).large);
      url += '&originWidth='+document.getElementsByClassName('image-show-container')[0].dataset.width;
      url += '&originHeight='+document.getElementsByClassName('image-show-container')[0].dataset.height;
      document.querySelector('#image_options_area .block__header').appendChild(
        createElement('a',{href:'/images/new'+url}, [
          createElement('i.fa.fa-copy'),
          ' Upload copy'
        ]));
    }
    else if (location.pathname == '/images/new') {
      let url = parseURL(location.href);
      document.querySelector('.input.js-taginput-input').style.marginRight = "5px";
      //if (location.search == '') return;
      if (url.params.origin != undefined) {
        fetchExtData(url);
      }
      let actions = [];
      if (!settings.implicationDisallow) {
        let actionsNames = [];
        actionsNames.push('Insert all implications');
        actionsNames.push('Hide all implications');
        for (let i=0; i<actionsNames.length; i++) {
          actions.push(createElement('a',{style:'margin-right:0.85em;cursor:pointer', events:{'click':() => {
            document.querySelectorAll('#ydb_dnp_container .block__content a.action:nth-child('+(i+1)+')').forEach((v) => v.click());
          }}}, actionsNames[i]));
        }
      }

      let preview = createElement('img#js-image-upload-preview', {style:{display:'inline-block',width:'320px'}});
      document.querySelector('.image-other').insertBefore(createElement('div', [
        createElement('div.block',[
          createElement('div.block__header',[
            createElement('strong.block__header__title', 'Similar images'),
            createElement('span#ydb_head_hiddenable', [
              createElement('a#reverseButton',{ events:{'click':(e) => {
                e.target.parentNode.style.display = 'none';
                document.getElementById('_ydb_similarGallery').innerHTML = '';
                document.getElementById('_ydb_similarGallery').appendChild(createElement('strong', 'Fetching...'));
                reverse(url);
              }}},'Check'),
              createElement('strong.block__header__title', 'Fuzziness'),
              createElement('input#ydb_fuzzyness.header__input.input', {value:0.45})
            ])
          ]),
          createElement('div.block__content', [
            createElement('div#_ydb_similarGallery', [
              createElement('strong', 'Not executed')
            ])
          ])
        ]),
        createElement('div', {style:{paddingBottom:'1em',fontSize:'1.1em',textAlign:'center'}},[
          createElement('strong#_ydb_old', '??? x ???'),
          ' => ',
          createElement('strong#_ydb_new', '??? x ???')
        ]),
        createElement('div#_ydb_diff_container', [
          createElement('img#_ydb_preview', {style:{display:'inline-block',width:'320px',marginRight:'10px'}}),
          createElement('canvas#_ydb_diff', {style:{display:'inline-block',width:'320px',marginRight:'10px'}}),
          preview
        ])
      ]),document.querySelector('.image-other').childNodes[0]);
      document.getElementById('_ydb_preview').addEventListener('load', function() {
        document.getElementById('_ydb_diff').style.height = document.getElementById('_ydb_preview').clientHeight+'px';
        diff(url);
      });

      document.getElementById('js-scraper-preview').addEventListener('click',function() {
        if (onceLoaded) {
          onceLoaded = false;
          return;
        }
        overRideSize = false;
        if (document.querySelector('#_ydb_similarGallery strong') != undefined) document.querySelector('#_ydb_similarGallery strong').innerHTML = 'Not executed';
        else document.getElementById('_ydb_similarGallery').appendChild(createElement('strong', '<br>Not executed'));
      });
      preview.addEventListener('load', function() {
        if (document.getElementById('image_image').files.length > 0) {
          overRideSize = false;
          if (document.querySelector('#_ydb_similarGallery strong') != undefined) document.querySelector('#_ydb_similarGallery strong').innerHTML = 'Not executed';
          else document.getElementById('_ydb_similarGallery').appendChild(createElement('strong', '<br>Not executed'));
        }
        diff(url);
      });

      setTimeout(fillData1, 70, url);

      document.querySelector('form[action="/images"]').insertBefore(createElement('div.block',[
        createElement('div.block__header', [
          createElement('span.block__header__title', 'DNP entries and warnings. '),
          createElement('span.block__header__title', actions)
        ]),
        createElement('div#ydb_dnp_container.js-taginput', {style:{maxHeight:'40vh',overflowY:'auto'}}, [
          createElement('div.block__content', 'Nothing')
        ])
      ]),document.querySelector('h4+.field'));

      document.querySelector('form[action="/images"]').insertBefore(createElement('div#ratings-warning.dnp-warning', [
        createElement('h4', 'You forgot rating tags!',),
        createElement('p', 'You won\'t upload image if you click "Upload" right now.')
      ]),document.querySelector('#new_image .actions:last-child'));

      tagCheck();
      setTimeout(diffCheck, 100, url);
    }
  }
})();
