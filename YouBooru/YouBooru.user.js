// ==UserScript==
// @name         YourBooru:Feeds
// @namespace    http://tampermonkey.net/

// @include      /http[s]*:\/\/(www\.|philomena\.)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/adverts\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*\.json.*/

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/CreateElement.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0UW.lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js
// @version      0.5.25
// @description  Feedz
// @author       stsyn

// @grant        unsafeWindow
// @grant        GM_addStyle

// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';
  const scriptId = 'feeds';
  let version = GM_info.script.version;

  let privated = false;
  const feedCSS = '._ydb_feedloading {display:none} ._ydb_feedshadow .block__content {opacity:0.5} ._ydb_feedshadow ._ydb_feedloading{display:block !important; position:absolute; width:100%; top:48%; pointer-events:none; text-align:center}';
  let data={};

  let config = {
    imagesInFeeds:6,
    doNotRemoveWatchList:true,
    doNotRemoveControls:true,
    watchFeedLinkOnRightSide:true
  };
  let feedz = [
    {
      name:'Hot',
      query:'first_seen_at.gte:6 hours ago',
      sort:'score',
      sd:'desc',
      ccache:0,
      cache:5
    },
    {
      name:'Fresh ponuts every day',
      query:'?onut',
      sort:'first_seen_at',
      sd:'desc',
      ccache:0,
      cache:30
    },
    {
      name:'Catbooru',
      query:'cat || cat lingerie || behaving like a cat || catsuit || cat ears || cat keyhole bra set || catified || nyan cat || sphinx || cat costume',
      sort:'first_seen_at',
      sd:'desc',
      ccache:0,
      cache:30
    },
    {
      name:'That day in history',
      query:'__ydb_LastYearsAlt',
      sort:'score',
      sd:'desc',
      cache:0,
      ccache:1440
    },
    {
      name:'Watch it again',
      query:'my:watched, first_seen_at.lte:1 years ago',
      sort:'random',
      sd:'desc',
      ccache:0,
      cache:5
    },
    {
      name:'Upvoted',
      query:'my:upvotes',
      sort:'random',
      sd:'desc',
      ccache:0,
      cache:5
    },
    {
      name:'Recently uploaded',
      query:'*',
      sort:'created_at',
      sd:'desc',
      cache:0,
      ccache:0,
      double:true
    }
  ];

  let feedzCache = [];
  let feedzURLs = [];
  let feedzEvents = [];
  let f_s_c;
  const debug = (id, value, level) => {
    try {
      unsafeWindow._YDB_public.funcs.log(id, value, level);
    }
    catch(e) {
      const levels = ['.', '?', '!'];
      console.log('['+levels[level]+'] ['+id+'] '+value);
    }
  };
  let sentRequests = 0;

  function resetCache(module, element) {
    let id = element.parentNode.dataset.id;
    if (id == undefined) id = element.parentNode.parentNode.dataset.id;
    let svd = localStorage._ydb_caches;
    if (svd !== undefined) {
      try {
        let cache = JSON.parse(svd);
        cache[id] = undefined;
        localStorage._ydb_caches = JSON.stringify(cache);
      }
      catch (e) {}
    }
  }

  function register() {
    GM_addStyle(feedCSS);
    if (unsafeWindow._YDB_public == undefined) unsafeWindow._YDB_public = {};
    if (unsafeWindow._YDB_public.settings == undefined) unsafeWindow._YDB_public.settings = {};
    unsafeWindow._YDB_public.settings.feeds = {
      name:'Feeds',
      container:'_ydb_feeds',
      version:version,
      link:'/meta/userscript-youbooru-feeds-on-main-page',
      s:[
        {type:'checkbox', name:'Keep watchlist', parameter:'doNotRemoveWatchList'},
        {type:'breakline'},
        {type:'input', name:'Amount of images in a feed:', parameter:'imagesInFeeds', validation:{type:'int',min:1,max:25}},
        {type:'input', name:'Minimum feeds loaded at once:', parameter:'oneTimeLoad', validation:{type:'int',min:1,max:10}},
        {type:'breakline'},
        {type:'checkbox', name:'Right-aligned layout', parameter:'watchFeedLinkOnRightSide'},
        {type:'breakline'},
        {type:'checkbox', name:'Trim garbage from HTML', parameter:'optimizeLS', styleS:{display:'none'}},
        {type:'array', parameter:'feedz', addText:'Add feed', customOrder:true, s:[
          [
            {type:'input', name:'Name', parameter:'name',styleI:{width:'31.5em', marginRight:'.5em'},validation:{type:'unique'}},
            {type:'select', name:'Sorting', parameter:'sort',styleI:{marginRight:'.5em'}, values:[
              {name:'Upload date', value:'created_at'},
              {name:'Modification date', value:'updated_at'},
              {name:'Creation date', value:'first_seen_at'},
              {name:'Score', value:'score'},
              {name:'Wilson score', value:'wilson'},
              {name:'Relevance', value:'relevance'},
              {name:'Width', value:'width'},
              {name:'Height', value:'height'},
              {name:'Comments', value:'comments'},
              {name:'Tag count', value:'tag_count'},
              {name:'Random', value:'random'},
              {name:'Gallery', value:'gallery_id'}
            ],i:(module,elem) => {
              const f = module.saved.feedz[elem.parentNode.dataset.id];
              if (!f || !f.sort.startsWith('gallery_id')) {
                elem.removeChild(elem.querySelector('option[value="gallery_id"]'));
              }
              else {
                const x = elem.querySelector('option[value="gallery_id"]');
                x.value = f.sort;
                x.selected = true;
              }
            }},
            {type:'select', name:'Direction', parameter:'sd',styleI:{marginRight:'.5em'}, values:[
              {name:'Descending', value:'desc'},
              {name:'Ascending', value:'asc'}
            ]}
          ],
          [
            {type:'input', name:'Caching delay (minutes)', parameter:'cache',styleI:{width:'3em', marginRight:'.4em'}, validation:{type:'int',min:0,max:99999}},
            {type:'input', name:'...or caching interval', parameter:'ccache',styleI:{width:'3.2em', marginRight:'.4em'}, validation:{type:'int',min:0,max:99999}},
            {type:'checkbox', name:'Double size', parameter:'double',styleI:{marginRight:'.4em'}},
            {type:'checkbox', name:'Show on home page', parameter:'mainPage',styleI:{marginRight:'.4em'}},
            {type:'buttonLink', attrI:{title:'Copy-paste this link somewhere to share this feed!',target:'_blank'},styleI:{marginRight:'.5em'}, name:'Share', i:function(module,elem) {
              const f = module.saved.feedz[elem.parentNode.dataset.id];
              if (!f) {
                elem.innerHTML = '------';
                return;
              }
              let q = f.query;
              if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.tagAliases)
                q = encodeURIComponent(unsafeWindow._YDB_public.funcs.tagAliases(f.query, {legacy:false}));
              elem.href = '/search?name='+encodeURIComponent(f.name)+'&q='+q.replace(/\%20/g,'+')+'&sf='+f.sort+'&sd='+f.sd+'&cache='+f.cache+'&ccache='+f.ccache;
            }},
            {type:'button', name:'Nuke cache  (╯°□°）╯', action:resetCache}
          ],[
            {type:'textarea', name:'Query', parameter:'query',styleI:{width:'calc(100% - 11em)'}}
          ]
        ], template:{name:'New feed',sort:'',sd:'',cache:'30',ccache:'0',query:'*',double:false,mainPage:true}}
      ],
      onChanges:{
        feedz:{
          sort:resetCache,
          sd:resetCache,
          query:resetCache,
          double:resetCache
        }
      }
    };
  }

  function resizing(elem) {
    const ccont = document.getElementsByClassName('column-layout__main')[0];
    const mwidth = parseInt(ccont.clientWidth) - 14;
    const twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);
    elem.getElementsByClassName('media-box__header')[0].style.width = twidth+'px';
    elem.getElementsByClassName('media-box__content')[0].style.width = twidth+'px';
    elem.getElementsByClassName('media-box__content')[0].style.height = twidth+'px';
    elem.getElementsByClassName('media-box__header')[0].classList[twidth < 200 ? 'add' : 'remove']('media-box__header--small');
  }

  function resizeEverything() {
    const ccont = document.getElementsByClassName('column-layout__main')[0];
    const mwidth = parseInt(ccont.clientWidth) - 14;
    const twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);
    for (let i=0; i<document.getElementsByClassName('_ydb_resizible').length; i++) {
      resizing(document.getElementsByClassName('_ydb_resizible')[i]);
    }

    for (let i=0; i<document.getElementsByClassName('_ydb_row_resizable').length; i++) {
      const c = document.getElementsByClassName('_ydb_row_resizable')[i];
      let s = twidth+22+7;
      if (c.classList.contains('_ydb_row_double')) s*=2;
      c.style.height = s+'px';
    }
  }

  function preRun() {
    f_s_c = localStorage._ydb_feeds;
    if (f_s_c == undefined) {
      legacyPreRun();
      debug('YDB:F','Data conversion to 0.4.5+ format done', 0);
      f_s_c = {};
      for (let k in config) f_s_c[k] = config[k];
      f_s_c.feedz = feedz;
      localStorage.removeItem('_ydb');
      localStorage.removeItem('_ydb_config');
      localStorage._ydb_feeds = JSON.stringify(f_s_c);
    }
    else f_s_c = JSON.parse(f_s_c);

    //conversion
    feedz = f_s_c.feedz;
    config = f_s_c;

    //caches
    let svd = localStorage._ydb_caches;
    if (svd !== undefined) {
      try {
        feedzCache = JSON.parse(svd);
      }
      catch (e) {
        debug('YDB:F','Cannot get feeds cache', 1);
      }
    }
    svd = localStorage._ydb_cachesUrls;
    if (svd !== undefined) {
      try {
        feedzURLs = JSON.parse(svd);
      }
      catch (e) {
        debug('YDB:F','Cannot get feeds URLCache', 1);
      }
    }
    svd = localStorage._ydb_cachesEvents;
    if (svd !== undefined) {
      try {
        feedzEvents = JSON.parse(svd);
      }
      catch (e) {
        debug('YDB:F','Cannot get feeds EventCache', 1);
      }
    }

    let updated = false;

    for (let i=0; i<feedz.length; i++) {
      if (!f_s_c.firstSeenAtImplemented) {
        if (feedz[i].sort == "created_at" && feedz[i].query != '*') {
          feedz[i].sort = 'first_seen_at';
          updated = true;
          feedzCache[i] = undefined;
        }
      }
      if (feedz[i] != null) feedz[i].loaded = false;
      if (feedz[i].cachedResp != undefined) {
        feedzCache[i] = feedz[i].cachedResp;
        delete feedz[i].cachedResp;
      }
      if (feedz[i].cachedQuery != undefined) {
        feedzURLs[i] = feedz[i].cachedQuery;
        delete feedz[i].cachedQuery;
      }
    }
    f_s_c.firstSeenAtImplemented = true;
    if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined && updated) {
      setTimeout(function() {
        unsafeWindow._YDB_public.funcs.backgroundBackup(function() {});
        write();
      }, 3000);
    }
    if (config.oneTimeLoad == undefined) config.oneTimeLoad = 3;
  }

  function legacyPreRun() {
    let svd = localStorage._ydb;
    if (svd !== undefined) {
      if (JSON.parse(svd).length !== undefined) {
        try {
          feedz = JSON.parse(svd);
        }
        catch (e) {
          debug('YDB:F','Cannot get feeds. Should be loaded default', 1);
        }
      }
      else {
        debug('YDB:F','Cannot get feeds. Should be loaded default', 1);
      }
    }
    for (let i=0; i<feedz.length; i++) {
      if (feedz[i] != null) feedz[i].loaded = false;
      if (feedz[i].cachedResp != undefined) {
        feedzCache[i] = feedz[i].cachedResp;
        delete feedz[i].cachedResp;
      }
      if (feedz[i].cachedQuery != undefined) {
        feedzURLs[i] = feedz[i].cachedQuery;
        delete feedz[i].cachedQuery;
      }
    }

    if (!config.forceScriptConfig) {
      svd = localStorage._ydb_config;
      if (svd !== undefined) {
        try {
          let svd2 = JSON.parse(svd);
          if (svd2.feeds !== undefined) config = svd2.feeds;
        }
        catch (e) {
        debug('YDB:F','Cannot get configs', 1);
        }
      }
      let c2 = {};
      c2.feeds = config;
      localStorage._ydb_config = JSON.stringify(c2);
    }
  }

  function write(w) {
    localStorage._ydb_feeds = JSON.stringify(w || f_s_c);
    localStorage._ydb_caches = JSON.stringify(feedzCache);
    localStorage._ydb_cachesUrls = JSON.stringify(feedzURLs);
    localStorage._ydb_cachesEvents = JSON.stringify(feedzEvents);
  }

  function postRun() {
    const keyForDeletion = ['loaded', 'container', 'temp', 'reload', 'internalId', 'url', 'observer', 'postprocessors'];
    resizeEverything();
    let x = JSON.parse(JSON.stringify(f_s_c));
    x.feedz.forEach(feed => {
      for (let key in feed) {
        if (keyForDeletion.includes(key)) delete feed[key];
      }
    })
    write(x);
  }

  /*********************************/

  function getYesterdayQuery() {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return '(created_at:' + date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' +date.getDate().toString().padStart(2, '0') + ')';
  }

  function getYearsQuery() {
    const date = new Date();
    let c = '(';
    const cc = 'created_at:';
    const dateString = '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');

    for (let i = date.getFullYear() - 1; i>2011; i--)
      c += (c === '(' ? '' : ' || ') + cc + i + dateString;

    return c+')';
  }

  function getYearsAltQuery() {
    const date = new Date();
    let c = '(';
    const cc = 'first_seen_at:';
    const dateString = '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');

    for (let i = date.getFullYear() - 1; i>2011; i--)
      c += (c === '(' ? '' : ' || ') + cc + i + dateString;

    return c+')';
  }

  function getNotSeenYetQuery(f) {
    let gc = parseInt(f.saved);
    if (isNaN(gc)) gc = 0;
    if (gc == undefined) gc = 0;
    gc *= 60000;
    let t = new Date(parseInt(gc));
    return '(created_at.gte:'+t.toISOString()+')';
  }

  function getNotSeenYetQueryNoNew(f) {
    let gc = parseInt(f.saved);
    if (isNaN(gc)) gc = 0;
    if (gc == undefined) gc = 0;
    gc*=60000;
    let t = new Date(gc);
    let t2 = new Date();
    return '(created_at.gte:'+t.toISOString()+', created_at.lte:'+t2.toISOString()+')';
  }

  function hiddenQuery() {
    if (!document.getElementsByClassName('js-datastore')[0].dataset.hiddenTagList) return;

    let tl = JSON.parse(document.getElementsByClassName('js-datastore')[0].dataset.hiddenTagList);
    let tags = tl.reduce((prev, cur, i, a) => {
      if (!localStorage['bor_tags_'+cur]) return '[Unknown]';
      return prev + JSON.parse(localStorage['bor_tags_'+cur]).name+(i+1 == a.length?'':' || ');
    }, '');
    tags = '('+tags+')';
    if (document.getElementsByClassName('js-datastore')[0].dataset.hiddenFilter) tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.hiddenFilter;
    return tags;
  }

  function spoileredQuery() {
    if (!document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList) return;

    let tl = JSON.parse(document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList);
    let tags = tl.reduce((prev, cur, i, a) => {
      if (!localStorage['bor_tags_'+cur]) return '[Unknown]';
      return prev + JSON.parse(localStorage['bor_tags_'+cur]).name+(i+1 == a.length?'':' || ');
    }, '');
    tags = '('+tags+')';
    if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter) tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter;
    return tags;
  }

  function customQueries(f) {
    let tx = f.query;
    if (!unsafeWindow._YDB_public.funcs || !unsafeWindow._YDB_public.funcs.tagAliases) {
      tx = tx.replace('__ydb_Yesterday', getYesterdayQuery());
      tx = tx.replace('__ydb_LastYearsAlt', getYearsAltQuery());
      tx = tx.replace('__ydb_LastYears', getYearsQuery());
      tx = tx.replace('__ydb_Spoilered', spoileredQuery());
      tx = tx.replace('__ydb_Hidden', hiddenQuery());
      tx = tx.replace('__ydb_tryUnspoil', '');
    }
    else {
      tx = tx.replace('__ydb_tryUnspoil', '__ydb_Unspoil');
      tx = unsafeWindow._YDB_public.funcs.tagAliases(tx, {legacy:true});
    }

    tx = tx.replace('__ydb_SinceLeavedNoNew', getNotSeenYetQueryNoNew(f));
    tx = tx.replace('__ydb_SinceLeaved', getNotSeenYetQuery(f));
    return tx;
  }

  /*********************************/

  function compileURL(f, act) {
    let tx = customQueries(f);
    let s = '/search?q='+encodeURIComponent(tx.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
    if (act && (unsafeWindow._YDB_public.funcs || unsafeWindow._YDB_public.funcs.feedURLs)) {
      for (let i in unsafeWindow._YDB_public.funcs.feedURLs) s += unsafeWindow._YDB_public.funcs.feedURLs[i](f);
    }
    return s;
  }

  function compileJSONURL(f, act) {
    let tx = customQueries(f);
    let s = '/search.json?q='+encodeURIComponent(tx.replace(new RegExp(' ','g'),'+')).replace(new RegExp('%2B','g'),'+')+'&sf='+f.sort+'&sd='+f.sd;
    if (act && (unsafeWindow._YDB_public.funcs || unsafeWindow._YDB_public.funcs.feedURLs)) {
      for (let i in unsafeWindow._YDB_public.funcs.feedURLs) s += unsafeWindow._YDB_public.funcs.feedURLs[i](f);
    }
    return s;
  }

  function fetchFeed(feed, id) {
    fetchJson('GET', compileURL(feed, true))
    .then(response => {
      if (!response.ok) {
        debug('YDB:FS','Request failed. Response '+response.status,2);
        feedAfterload(feed, 'Request failed ('+response.status+'). Retry?', id);
        return false;
      }
      return response.text();
    })
    .then(text => {
      feed.temp.innerHTML = text;
      parse(feed, id);
    });
  }

  function getFeed(feed, id, inital) {
    fillParsed(feed, id);
    feed.container.parentNode.classList.add('_ydb_feedshadow');

    if (inital) {
      if (sentRequests>config.oneTimeLoad) {
        if (parseInt(feed.container.getBoundingClientRect().top) <= (unsafeWindow.innerHeight+unsafeWindow.pageYOffset)*2) {
          setTimeout(() => fetchFeed(feed, id), 500*(sentRequests-config.oneTimeLoad+1));
        }
        else {
          let d = unsafeWindow.pageYOffset;
          const c = () => {
            if (feed.container.getBoundingClientRect().top <= (unsafeWindow.innerHeight + unsafeWindow.pageYOffset + (unsafeWindow.pageYOffset-d)*3)*1.5) {
              fetchFeed(feed, id);
            }
            else setTimeout(c,200);
            d = unsafeWindow.pageYOffset;
          };
          c();
        }
      }
      else fetchFeed(feed, id);
    }
    else fetchFeed(feed, id);
    sentRequests++;
  }

  function spoiler(event, alwaysOff) {
    if ((event.target || event).spoilerFired) return;

    (event.target || event).spoilerFired = true;
    let iContainer;
    if (!event.target) iContainer = event;
    else iContainer = event.target;
    iContainer = iContainer.closest('.image-container');
    let video = !!iContainer.querySelector('video');
    let spx = JSON.parse(iContainer.getAttribute('data-image-tags'));
    let fls = data.spoilers;
    let mx = 999999999;
    let hasSpoiler = false;
    let n = '', s = null;
    for (let i=0; i<spx.length; i++) {
      for (let j=0; j<fls.length; j++) {
        if (spx[i] == fls[j]) {
          if (localStorage['bor_tags_'+spx[i]] != undefined) {
            let u = JSON.parse(localStorage['bor_tags_'+spx[i]]);
            let a = u.images;
            n += (n==''?'':', ')+u.name;
            hasSpoiler = true;
            if (a < mx) {
              if (u.spoiler_image_uri != null) {
                mx = a;
                s = u.spoiler_image_uri;
              }
            }
          }
        }
      }
    }
    console.log();
    if (!hasSpoiler) return;
    let spoilerInfo = iContainer.querySelector('.media-box__overlay.js-spoiler-info-overlay');
    spoilerInfo.classList.remove('hidden');
    spoilerInfo.innerHTML = n;
    let image = event.target || event;
    let spoiler = image;
    if (video) {
      image = iContainer.getElementsByTagName('video')[0];
      spoiler = iContainer.getElementsByTagName('img')[0];
    }
    if (data.spoilerType == 'off' || alwaysOff) {
      spoilerInfo.classList.add('hidden');
      if (video) {
        image.classList.remove('hidden');

        image.appendChild(createElement('source', {type:'video/webm', src:iContainer.getAttribute('data-thumb').replace('.gif','.webm')}));
        image.appendChild(createElement('source', {type:'video/mp4', src:iContainer.getAttribute('data-thumb').replace('.gif','.mp4')}));

        spoiler.classList.add('hidden');
      }
      else image.src = iContainer.getAttribute('data-thumb');
    }
    else {
      if (!s) s = '/tagblocked.svg';
      spoiler.src = s;

      // chrome bug
      spoiler.style.position = 'static';
      setTimeout(() => {spoiler.style.position = 'absolute'}, 100);

      spoiler.style.left = '0';
      spoiler.style.top = '0';
      console.log(data.spoilerType, event);
      if (data.spoilerType != 'static') {
        let ac = data.spoilerType;
        if (ac == 'hover') ac = 'mouseenter';
        iContainer.addEventListener(ac, function(e) {
          if (!spoilerInfo.classList.contains('hidden')) {
            if (!video) {
              image.style.position = 'static';
              image.spoiler = image.src;
              image.src = iContainer.getAttribute('data-thumb');
            }
            else {
              image.classList.remove('hidden');

              image.appendChild(createElement('source', {type:'video/webm', src:iContainer.getAttribute('data-thumb').replace('.gif','.webm')}));
              image.appendChild(createElement('source', {type:'video/mp4', src:iContainer.getAttribute('data-thumb').replace('.gif','.mp4')}));

              spoiler.classList.add('hidden');
            }
            spoilerInfo.classList.add('hidden');
            e.preventDefault();
          }
        });
        iContainer.addEventListener('mouseleave', function(e) {
          if (spoilerInfo.classList.contains('hidden')) {
            if (!video) {
              image.style.position = 'absolute';
              image.src = image.spoiler;
            }
            else {
              image.classList.add('hidden');
              for (let i=image.childNodes.length-1; i>=0; i--) image.removeChild(image.childNodes[i]);
              spoiler.classList.remove('hidden');
            }
            spoilerInfo.classList.remove('hidden');
          }
        });
      }
    }
  }

  function feedAfterload(feed, cc, id, notcache) {
    feedzURLs[id] = compileURL(feed, true);
    feed.url.href = feedzURLs[id]+'&feedId='+id;
    feed.temp.innerHTML = '';
    feed.loaded = true;
    feed.responsed = parseInt(config.imagesInFeeds*1.2);

    feedzCache[id] = cc;
    if (!notcache) {
      feed.saved = parseInt(Date.now() / 60000);
    }

    if (feedz.find(feed => feed && (privated || feed.mainPage) && !feed.loaded)) return;

    postRun();
  }

  function updateEvents(elem, feed) {
    let obj = {};
    try {
      obj.fcount = elem.getElementsByClassName('favorites')[0].innerHTML;
      obj.count = elem.getElementsByClassName('score')[0].innerHTML;
      obj.isFaved = (Boolean)(elem.querySelector('.interaction--fave.active'));
      obj.isUpvoted = (Boolean)(elem.querySelector('.interaction--upvote.active'));
      obj.isDownvoted = (Boolean)(elem.querySelector('.interaction--downvote.active'));
      obj.isHidden = (Boolean)(elem.querySelector('.interaction--hide.active'));
    }
    catch (e) {}
    feedzEvents[feed.internalId][elem.dataset.imageId] = obj;
  }

  function applyEvents(elem,feed) {
    let obj = feedzEvents[feed.internalId][elem.dataset.imageId];
    if (obj == undefined) return;
    try {
      if (!!obj.fcount) elem.getElementsByClassName('favorites')[0].innerHTML = obj.fcount;
      if (!!obj.count) elem.getElementsByClassName('score')[0].innerHTML = obj.count;
      if (obj.isFaved) elem.querySelector('.interaction--fave').classList.add('active');
      else elem.querySelector('.interaction--fave').classList.remove('active');
      if (obj.isUpvoted) elem.querySelector('.interaction--upvote').classList.add('active');
      else elem.querySelector('.interaction--upvote').classList.remove('active');
      if (obj.isDownvoted) elem.querySelector('.interaction--downvote').classList.add('active');
      else elem.querySelector('.interaction--downvote').classList.remove('active');
      if (obj.isHidden) elem.querySelector('.interaction--hide').classList.add('active');
      else elem.querySelector('.interaction--hide').classList.remove('active');
    }
    catch (e) {}
  }

  function parse(feed, id) {
    let votes = feed.temp.querySelector('.js-datastore').getAttribute('data-interactions');
    if (votes) votes = JSON.parse(votes);

    const pc = feed.temp.querySelector('.block__content.js-resizable-media-container');
    let aloff = false;
    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.tagSimpleParser) {
      let t = unsafeWindow._YDB_public.funcs.tagSimpleParser(feed.query);
      aloff = !!t.find(x => x.startsWith('__ydb_Unspoil'));
    }
    const c = feed.container;
    const mwidth = parseInt(cont.clientWidth) - 14;
    const twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);

    clearElement(c);
    c.parentNode.classList.remove('_ydb_feedshadow');
    feedzEvents[feed.internalId] = {};
    if (!pc) c.innerHTML = 'Empty feed';
    else {
      if (feed.postprocessors && feed.postprocessors.length && unsafeWindow._YDB_public.funcs.feedPP) {
        feed.postprocessors.forEach(postProcessor => {
          if (unsafeWindow._YDB_public.funcs.feedPP[postProcessor])
            unsafeWindow._YDB_public.funcs.feedPP[postProcessor](feed);
        });
      }
      for (let i = 0, l = parseInt(config.imagesInFeeds*(feed.double?2:1)*1.2); i < l; i++) {
        const elem = pc.childNodes[0];
        if (!elem) break;

        const iContainer = elem.querySelector('.media-box__content .image-container');
        const image = elem.querySelector('.media-box__content .image-container a img');

        if (!config.doNotRemoveControls) elem.getElementsByClassName('media-box__header')[0].style.display = 'none';

        let act = 'nope';
        let faved = false;
        votes.forEach(vote => {
          if (vote.image_id == iContainer.getAttribute('data-image-id')) {
            if (vote.interaction_type == 'voted') {
              if (vote.value == 'up') act = 'up';
              else if (vote.value == 'down') act = 'down';
            }
            if (vote.interaction_type == 'faved') faved = true;
          }
        })

        if (act == 'up') elem.querySelector('.media-box__header .interaction--upvote').classList.add('active');
        else if (act == 'down') elem.querySelector('.media-box__header .interaction--downvote').classList.add('active');
        if (faved) elem.querySelector('.media-box__header .interaction--fave').classList.add('active');

        let temp = (JSON.parse(iContainer.getAttribute('data-uris')));
        iContainer.setAttribute('data-thumb', temp.thumb.replace(/webm$/,'gif'));
        iContainer.removeAttribute('data-download-uri');
        iContainer.removeAttribute('data-orig-sha512');
        iContainer.removeAttribute('data-sha512');
        iContainer.removeAttribute('data-source-url');
        iContainer.removeAttribute('data-aspect-ratio');
        iContainer.removeAttribute('data-created-at');
        if (image) image.removeAttribute('alt');

        iContainer.classList.remove('thumb_small');
        iContainer.classList.add('thumb');
        elem.querySelector('.media-box__content').classList.remove('media-box__content--small');

        const th = elem.querySelector('picture *[src], video *[src]');
        if (th) th.src = th.src.replace('/thumb_small.','/thumb.');
        resizing(elem);
        elem.classList.add('_ydb_resizible');

        if (image) {
          image.onload = (e) => spoiler(e, aloff);
          if (!image.src) {
            spoiler(image, aloff);
          }
        }
        if (i >= parseInt(config.imagesInFeeds*(privated?1.2:1))*(feed.double?2:1)) elem.classList.add('hidden');
        c.appendChild(pc.childNodes[0]);
        updateEvents(elem, feed);
      }
    }

    setTimeout(() => {
      feed.observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type == 'attributes') {
            let u = mutation.target.classList;
            if (u.contains('interaction--fave') || u.contains('interaction--upvote') || u.contains('interaction--downvote') || u.contains('interaction--hide')) {
              updateEvents(feed.container.querySelector('.media-box[data-image-id="'+mutation.target.dataset.imageId+'"]'), feed);
              localStorage._ydb_cachesEvents = JSON.stringify(feedzEvents);
            }
          }
        });
      });
      setTimeout(() => {feed.observer.observe(feed.container, {attributes: true, childList: true, characterData: true, subtree:true });},250);
    },1000);


    feedAfterload(feed, c.innerHTML, id);
    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler)
      unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler(c, true);
  }

  function fillParsed(feed, id, pre) {
    const c = feed.container;
    let aloff = false;
    if (unsafeWindow._YDB_public.funcs != undefined && unsafeWindow._YDB_public.funcs.tagSimpleParser != undefined) {
      let t = unsafeWindow._YDB_public.funcs.tagSimpleParser(feed.query);
      aloff = !!t.find(x => x.startsWith('__ydb_Unspoil'));
    }
    if (!feedzCache[id] || (feedzCache[id].length < 50 )) {
      if (!feedzCache[id]) c.innerHTML = 'Empty feed';
      else c.innerHTML = feedzCache[id];
    }
    else {
      c.innerHTML = feedzCache[id];
      for (let i=0, l = parseInt(config.imagesInFeeds*(feed.double?2:1)*1.2); i < l; i++) {
        const elem = c.childNodes[i];
        if (!elem) break;
        const image = elem.querySelector('.media-box__content .image-container a img');
        if (image) {
          image.onload = (e) => spoiler(e, aloff);
          if (!image.src) {
            spoiler(image, aloff);
          }
        }
        const mwidth = parseInt(cont.clientWidth) - 14;
        const twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);
        resizing(elem);
        if (i >= parseInt(config.imagesInFeeds*(privated?1.2:1)*(feed.double?2:1))) elem.classList.add('hidden');
        else elem.classList.remove('hidden');
        applyEvents(elem, feed);
      }
    }
    setTimeout(() => {
      feed.observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type == 'attributes') {
            let u = mutation.target.classList;
            if (u.contains('interaction--fave') || u.contains('interaction--upvote') || u.contains('interaction--downvote') || u.contains('interaction--hide')) {
              updateEvents(feed.container.querySelector(`.media-box[data-image-id="${mutation.target.dataset.imageId}"]`), feed);
              localStorage._ydb_cachesEvents = JSON.stringify(feedzEvents);
            }
          }
        });
      });
      feed.observer.observe(feed.container, {attributes: true, childList: true, characterData: true, subtree:true });
    },1000);

    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler)
      unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler(c, true);
    feed.temp.innerHTML = '';
    feed.url.href = feedzURLs[id] + '&feedId=' + id;
    if (pre) return;
    feed.loaded = true;
    if (feedz.find(feed => feed && (privated || feed.mainPage) && !feed.loaded)) return;
    postRun();
  }

  function init() {
    register();
    let i;
    data.spoilerType = document.getElementsByClassName('js-datastore')[0].getAttribute('data-spoiler-type');
    data.spoilers = JSON.parse(document.getElementsByClassName('js-datastore')[0].getAttribute('data-spoilered-tag-list'));
    preRun();
    cont.style.minWidth = 'calc(100% - 338px)';
    if (cont.childNodes.length == 1) config.hasWatchList = false;
    else config.hasWatchList = true;
    for (i=0; i<(config.doNotRemoveWatchList?1:2); i++) {
      if (cont.childNodes[i] != undefined) cont.childNodes[i].style.display = 'none';
    }

    const ptime = parseInt((new Date()).getTime()/60000);
    for (i=0; i<feedz.length; i++) feedz[i].loaded = false;
    for (i=0; i<feedz.length; i++) {
      let f = feedz[i];
      if (!f) continue;
      if (f.mainPage === undefined) f.mainPage = true;
      if (!(privated || f.mainPage)) continue;

      const mwidth = parseInt(cont.clientWidth) - 14;
      const twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);
      let s = twidth+22+7;
      if (f.double) s*=2;
      f.internalId = i;
      f.temp = createElement('div');

      cont.appendChild(createElement('div.block', {style: {position: 'relative'}}, [
        createElement('div.block__header', [
          createElement('span.block__header__title', f.name),
          f.url = createElement('a', {style: {float: config.watchFeedLinkOnRightSide ? 'right' : ''}}, [
            createElement('i.fa.fa-eye'),
            createElement('span.hide-mobile', ' Browse feed')
          ]),
          createElement('span._ydb_feedloading', ' Updating feed...'),
          f.reload = createElement('a', {
            style: {float: config.watchFeedLinkOnRightSide ? 'right' : ''},
            events: {click: () => {
              feedzCache[f.internalId] = undefined;
              f.saved = 0;
              clearElement(f.container);
              getFeed(f, f.internalId);
            }}
          }, [
            createElement('i.fa', '\uF021'),
            createElement('span.hide-mobile', ' Reload feed')
          ])
        ]),
        f.container = createElement('div.block__content.js-resizable-media-container._ydb_row_resizable',
          {
            className: (f.double ? ' _ydb_row_double' : ''),
            style: {height: s + 'px'}
          })
      ]));

      f.saved = parseInt(f.saved);
      f.cache = parseInt(f.cache);
      f.ccache = parseInt(f.ccache);
      if (!feedzEvents[i]) feedzEvents[i] = {};
      if (!feedzCache[i]) {
        getFeed(f, i, true);
        debug('YDB:F','Requested update to feed "'+f.name+'". Reason "No cache found"', 1);
      }
      else if (feedzCache[i].startsWith('Server timeout.')) {
        getFeed(f, i, true);
        debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Not finished loading"', 1);
      }
      else if (compileURL(f) != feedzURLs[i]) {
        getFeed(f, i, true);
        debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Feed url changed"', 1);
      }
      else if (parseInt(config.imagesInFeeds*1.2) != feedz[i].responsed) {
        getFeed(f, i, true);
        debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Changed setting imageInFeeds"', 1);
      }
      else if (ptime > (f.saved+f.cache))
      {
        if (f.ccache && (!isNaN(f.ccache))) {
          if (parseInt(ptime/f.ccache) > parseInt(f.saved/f.ccache)) {
            getFeed(f, i, true);
            debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Scheduled update"', 1);
          }
          else fillParsed(f, i);
        }
        else {
          getFeed(f, i, true);
          debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Cache lifetime expired"', 1);
        }
      }
      else if (!feedzURLs[i]) getFeed(f, i, true);
      else fillParsed(f, i);
    }

    unsafeWindow.addEventListener("resize", resizeEverything);
    if (config.doNotRemoveWatchList && config.hasWatchList) cont.appendChild(cont.childNodes[1]);
  }

  /*********************************/

  function YB_insertFeed(u) {
    let f = {};
    let i;
    for (i=0; i<feedz.length; i++) {
      if (feedz[i].name == decodeURIComponent(u[1])) {
        f = feedz[i];
        break;
      }
    }
    f.loaded = false;
    f.name = decodeURIComponent(u[1]);
    f.query = decodeURIComponent(u[2]).replace(/\+/g,' ');
    f.sort = u[3];
    f.sd = u[4];
    f.cache = u[5];
    f.ccache = u[6];
    feedz[i] = f;
    write();

    if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) unsafeWindow._YDB_public.funcs.backgroundBackup(function() {
      if (history.length == 1) close();
      else history.back();
    });
  }


  function YB_insertFeed2(u) {
    let f = {};
    let i;
    for (i=0; i<feedz.length; i++) {
      if (feedz[i].name == document.querySelector('#searchform [name="name"]').value) {
        f = feedz[i];
        break;
      }
    }
    f.loaded = false;
    f.name = document.querySelector('#searchform [name="name"]').value;
    f.query = document.querySelector('#searchform [name="q"]').value;
    f.sort = document.querySelector('#searchform [name="sf"]').value;
    f.sd = document.querySelector('#searchform [name="sd"]').value;
    f.cache = parseInt(document.querySelector('#searchform [name="cache"]').value);
    f.ccache = parseInt(document.querySelector('#searchform [name="ccache"]').value);
    f.double = document.querySelector('#searchform [name="double"]').checked;
    f.mainPage = document.querySelector('#searchform [name="mainPage"]').checked;
    if (f.sort.startsWith('random')) f.sort = 'random';
    if (isNaN(f.cache) || f.cache<0) f.cache = 30;
    if (isNaN(f.ccache) || f.ccache<0) f.ccache = 60;
    feedz[i] = f;
    write();

    if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) unsafeWindow._YDB_public.funcs.backgroundBackup(function() {
      if (history.length == 1) close();
      else if (u.params.feedId != undefined) location.href = '/search?q='+customQueries(f)+'&sf='+f.sort+'&sd='+f.sd+'&feedId='+i;
      else location.href = '/settings#YourBooru';
    });
  }

  function YB_feedsPage() {
    cont = document.getElementById('content');
    cont.className = 'column-layout__main';
    document.querySelector('#content .walloftext').style.display = 'none';
    cont.appendChild(createElement('span'));
    cont.appendChild(createElement('span'));
    privated = true;
    setTimeout(init, 10);
  }

  function YB_addFeed(u) {
    document.querySelector('#content h1').innerHTML = 'Add feed';
    let c = document.querySelector('#content .walloftext');
    if (u.length>6) {
      c.innerHTML = 'Name: '+decodeURIComponent(u[1]);
      c.innerHTML += '<br>Query: <a href="/search?q='+u[2]+'&sf='+u[3]+'&sd='+u[4]+'">'+decodeURIComponent(u[2]).replace(/\\+/g,' ')+'</a>';
      c.innerHTML += '<br>Sorting type: '+u[3];
      c.innerHTML += '<br>Sorting direction: '+u[4];
      c.innerHTML += '<br>Update interval: '+(u[5]==0?'each'+u[6]:u[5])+' minutes';
      let x = true;
      for (let i=0; i<feedz.length; i++) {
        if (feedz[i].name == decodeURIComponent(u[1])) {
          c.innerHTML += '<br><br><b>There is saved feed with that name!</b>';
          c.innerHTML += '<br><br><span id="yy_add" class="button">Replace</span> <span id="yy_include" class="button">Rename automatically</span> <span id="yy_cancel" class="button">Cancel</span>';
          x = false;
          break;
        }
      }
      if (x) c.innerHTML += '<br><br><span id="yy_add" class="button">Add feed</span> <span id="yy_cancel" class="button">Cancel</span> <span id="yy_include"></span>';


      document.getElementById('yy_cancel').addEventListener('click', function() {
        if (history.length == 1) close();
        else history.back();
      });

      document.getElementById('yy_add').addEventListener('click', function() {
        YB_insertFeed(u);
      });

      document.getElementById('yy_include').addEventListener('click', function() {
        u[1] = decodeURIComponent(u[1])+'_'+parseInt(65536*Math.random());
        YB_insertFeed(u);
      });
    }
    else c.innerHTML = 'Not enough parameters, impossible to add!';
  }

  function YB_feedButton(id) {
    let e;
    if (id != undefined) {
      e = createElement('a', {href: location.href+'&name='+feedz[id].name+'&cache='+feedz[id].cache+'&ccache='+feedz[id].ccache, title: 'Edit feed'}, [
        createElement('i.fa', '\uF09E'),
        createElement('span', ' Edit feed')
      ]);
    }
    else {
      e = createElement('a', {href: location.href+'&name=New+feed&cache=30&ccache=0', title: 'Create feed'}, [
        createElement('i.fa', '\uF09E'),
        createElement('span', ' Create feed')
      ]);
    }
    document.querySelector('.block__header.flex .flex__right').insertBefore(e, document.querySelector('.block__header.flex .flex__right').firstChild);
  }

  function YB_addFeed2(u) {
    let uniqueCheck = function(p) {
      let x = false;
      for (let i=0; i<feedz.length; i++) {
        if (feedz[i].name == p) {
          x = true;
          break;
        }
      }
      return x;
    };
    let alreadyHas = uniqueCheck(decodeURIComponent(u.params.name).replace(/\+/g,' '));

    document.getElementById('searchform').appendChild(createElement('div', [
      createElement('h1', 'Add feed '),
      createElement('div.block.js-imagelist-info', [
        createElement('div.block__content',[
          createElement('span', 'Name: '),
          createElement('input.input', {value:decodeURIComponent(u.params.name).replace(/\+/g,' '), name: 'name', events: {input:(e) => {
            alreadyHas = uniqueCheck(e.target.value);
            if (!alreadyHas) {
              document.getElementById('yy_warn').classList.add('hidden');
              document.getElementById('yy_add').value = 'Add feed';
            }
            else {
              document.getElementById('yy_warn').classList.remove('hidden');
              document.getElementById('yy_add').value = 'Update';
            }
          }}}),
          createElement('span#yy_warn.flash--warning', {className: (alreadyHas ? '' : 'hidden')}, ' That feed already exists!'),
          createElement('br'),
          createElement('br'),
          createElement('span', 'Update: '),
          createElement('span#yy_cache', [
            createElement('span', 'after '),
            createElement('input.input', {value: decodeURIComponent(u.params.cache), name: 'cache', events: {input:(e) => {
              if (e.target.value == '0' || !e.target.value) {
                document.getElementById('yy_ccache').style.opacity = '1';
                document.querySelector('#yy_ccache input').removeAttribute('disabled');
              }
              else {
                document.getElementById('yy_cache').style.opacity = '1';
                document.getElementById('yy_ccache').style.opacity = '.2';
                document.querySelector('#yy_ccache input').setAttribute('disabled',true);
              }
            }}})
          ]),
          createElement('span#yy_ccache',[
            createElement('span', ' each '),
            createElement('input.input', {value: decodeURIComponent(u.params.ccache), name:'ccache', events:{input:(e) => {
              if (e.target.value == '0' || !e.target.value) {
                document.getElementById('yy_cache').style.opacity = '1';
                document.querySelector('#yy_cache input').removeAttribute('disabled');
              }
              else {
                document.getElementById('yy_ccache').style.opacity = '1';
                document.getElementById('yy_cache').style.opacity = '.2';
                document.querySelector('#yy_cache input').setAttribute('disabled',true);
              }
            }}},[])
          ]),
          createElement('span', ' minutes'),
          createElement('br'),
          createElement('label', 'Double size ',[
            createElement('input',{checked: (u.params.feedId!=undefined ? feedz[u.params.feedId].double : false), name: 'double', type: 'checkbox'})
          ]),
          createElement('label',' Show on main page ',[
            createElement('input',{checked: (u.params.feedId!=undefined ? feedz[u.params.feedId].mainPage : true), name: 'mainPage', type: 'checkbox'})
          ]),
          createElement('br'),
          createElement('br'),
          createElement('span', [
            createElement('input#yy_add.button', {type:'button', value: (alreadyHas ? 'Update' : 'Add feed')}),
            createElement('span', ' '),
            createElement('span#yy_cancel.button', 'Cancel'),
            createElement('span#yy_include.button', {style:'display:none'}, 'Rename automatically')
          ])
        ])
      ])
    ]));

    if (u.params.cache == 0) {
      document.getElementById('yy_cache').style.opacity = '.2';
      document.querySelector('#yy_cache input').setAttribute('disabled',true);
    }
    else {
      document.getElementById('yy_ccache').style.opacity = '.2';
      document.querySelector('#yy_ccache input').setAttribute('disabled',true);
    }

    document.getElementById('yy_cancel').addEventListener('click', function() {
      if (history.length == 1) close();
      else {
        let q = '';
        for (let i in u.params) {
          if (i != 'name' && i != 'cache' && i != 'ccache') q += i + '=' + u.params[i] + '&';
        }
        location.search = q;
      }
    });

    document.getElementById('yy_add').addEventListener('click', function() {
      YB_insertFeed2(u);
    });

    document.getElementById('yy_include').addEventListener('click', function() {
      u.params.name = decodeURIComponent(u.params.name)+'_'+parseInt(65536*Math.random());
      YB_insertFeed2(u);
    });

    document.getElementById('container').insertBefore(createElement('div.flash.flash--success', 'Feed editing panel is located on the bottom'),document.getElementById('content'));
  }

  function YDB() {
    let x = location.search.slice(1);
    if (!location.search) return;
    else if (location.search == "?") return;
    else {
      if (document.querySelector('#content>p')) document.getElementById('content').removeChild(document.querySelector('#content>p'));
      if (document.querySelector('#content>a')) document.getElementById('content').removeChild(document.querySelector('#content>a'));
      let u = x.split('?');
      if (u[0] == "addFeed") YB_addFeed(u);
      else if (u[0] == "feeds") YB_feedsPage();
    }
  }

  document.querySelector('.header--secondary .header__dropdown .dropdown__content').appendChild(
    createElement('a.header__link', {href: '/pages/api?feeds'}, 'Feeds'));
  const cont = document.getElementsByClassName('column-layout__main')[0];

  if (location.pathname == '/' || location.pathname == '') setTimeout(init, 500);
  else {
    preRun();
    if (location.pathname == "/pages/api") YDB();
    else if (location.pathname == "/search" || location.pathname == '/search/index') {
      let u = parseURL(location.href);
      if (u.params.name) YB_addFeed2(u);
      else if (u.params.feedId) YB_feedButton(u.params.feedId);
      else YB_feedButton();
    }
    register();
  }
})();
