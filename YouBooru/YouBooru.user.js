// ==UserScript==
// @name         YDB:Feeds
// @version      0.5.44
// @description  Feedz
// @author       stsyn
// @namespace    http://derpibooru.org

// @include      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/adverts\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*\.json.*/

// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/tagProcessor.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/DerpibooruImitation0UW.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0UW.lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooru.user.js

// @grant        unsafeWindow
// @grant        GM_addStyle

// @run-at       document-idle
// ==/UserScript==

var createElement = createElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});

(function() {
  'use strict';
  const scriptId = 'feeds';
  let version = GM_info.script.version;

  let privated = false;
  const feedCSS = `
    ._ydb_feedloading {display:none}
    ._ydb_feedshadow .block__content {opacity:0.5}
    ._ydb_feedshadow ._ydb_feedloading {
      display:block !important;
      position:absolute;
      width:100%; top:48%;
      pointer-events:none;
      text-align:center
    }`;
  let sizingCSSNode;
  let data = {};
  let cont;

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
    if (!id) id = element.parentNode.parentNode.dataset.id;
    let svd = localStorage._ydb_caches;
    if (svd !== undefined) {
      try {
        let cache = JSON.parse(svd);
        delete cache[id];
        localStorage._ydb_caches = JSON.stringify(cache);
      }
      catch (e) {}
    }
  }

  function register() {
    GM_addStyle(feedCSS);
    const sizingCSS = GM_addStyle('');
    sizingCSSNode = Array.from(document.styleSheets).find(ss => ss.ownerNode === sizingCSS);
    if (!unsafeWindow._YDB_public) unsafeWindow._YDB_public = {};
    if (!unsafeWindow._YDB_public.settings) unsafeWindow._YDB_public.settings = {};
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
              {name:'Mod. date', value:'updated_at'},
              {name:'Creation date', value:'first_seen_at'},
              {name:'Score', value:'score'},
              {name:'Upvotes', value:'upvotes'},
              {name:'Downvotes', value:'downvotes'},
              {name:'Wilson score', value:'wilson_score'},
              {name:'Relevance', value:'_score'},
              {name:'Width', value:'width'},
              {name:'Height', value:'height'},
              {name:'Comments', value:'comment_count'},
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
            {type:'buttonLink', attrI:{title:'Copy-paste this link somewhere to share this feed!',target:'_blank'},styleI:{marginRight:'.5em'}, name:'Share', i:async (module,elem) => {
              const f = module.saved.feedz[elem.parentNode.dataset.id];
              if (!f) {
                elem.innerHTML = '------';
                return;
              }
              let q = f.query;
              if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.getTagProcessors) {
                q = encodeURIComponent((await parseSearch(f.query, unsafeWindow._YDB_public.funcs.getTagProcessors({legacy:false}))).toString());
              }
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

  function resizeEverything() {
    const ccont = document.getElementsByClassName('column-layout__main')[0];
    const mwidth = parseInt(ccont.clientWidth) - 14;
    const twidth = parseInt(mwidth/parseInt(config.imagesInFeeds*(privated?1.2:1))-8);
    const s = twidth+22+7;
    try {
      while (sizingCSSNode.cssRules.length > 0) sizingCSSNode.deleteRule(0);
      sizingCSSNode.addRule('._ydb_row_resizable', `height: ${s}px`);
      sizingCSSNode.addRule('._ydb_row_resizable._ydb_row_double', `height: ${s * 2}px`);
      sizingCSSNode.addRule('._ydb_row_resizable .media-box__header', `width: ${twidth}px`);
      sizingCSSNode.addRule('._ydb_row_resizable .media-box__content', `width: ${twidth}px; height: ${twidth}px;`);
    } catch (e) {
      if (sizingCSSNode) {
        try {
          document.head.removeChild(sizingCSSNode);
        } catch(e) {}
      }
      sizingCSSNode = GM_addStyle(`
        ._ydb_row_resizable {height: ${s}px}
        ._ydb_row_resizable._ydb_row_double {height: ${s * 2}px}
        ._ydb_row_resizable .media-box__header {width: ${twidth}px}
        ._ydb_row_resizable .media-box__content {width: ${twidth}px; height: ${twidth}px}
      `);
    }
  }

  function preRun() {
    f_s_c = localStorage._ydb_feeds;
    if (!f_s_c) {
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
        debug('YDB:F','Cannot get feeds cache', 2);
      }
    }
    svd = localStorage._ydb_cachesUrls;
    if (svd !== undefined) {
      try {
        feedzURLs = JSON.parse(svd);
      }
      catch (e) {
        debug('YDB:F','Cannot get feeds URLCache', 2);
      }
    }
    svd = localStorage._ydb_cachesEvents;
    if (svd !== undefined) {
      try {
        feedzEvents = JSON.parse(svd);
      }
      catch (e) {
        debug('YDB:F','Cannot get feeds EventCache', 2);
      }
    }

    let updated = false;

    for (let i=0; i<feedz.length; i++) {
      if (!f_s_c.firstSeenAtImplemented) {
        if (feedz[i].sort == "created_at" && feedz[i].query != '*') {
          feedz[i].sort = 'first_seen_at';
          updated = true;
          delete feedzCache[i];
        }
      }
      if (feedz[i]) feedz[i].loaded = false;
      if (feedz[i].cachedResp) {
        feedzCache[i] = feedz[i].cachedResp;
        delete feedz[i].cachedResp;
      }
      if (feedz[i].cachedQuery) {
        feedzURLs[i] = feedz[i].cachedQuery;
        delete feedz[i].cachedQuery;
      }
    }
    f_s_c.firstSeenAtImplemented = true;
    if (updated) {
      setTimeout(() => {
        if (unsafeWindow._YDB_public && unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.backgroundBackup) {
          unsafeWindow._YDB_public.funcs.backgroundBackup(() => {});
          write();
        }
      }, 3000);
    }
    if (!config.oneTimeLoad) config.oneTimeLoad = 3;
  }

  function legacyPreRun() {
    let svd = localStorage._ydb;
    if (svd !== undefined) {
      if (JSON.parse(svd).length !== undefined) {
        try {
          feedz = JSON.parse(svd);
        }
        catch (e) {
          debug('YDB:F','Cannot get feeds. Should be loaded default', 2);
        }
      }
      else {
        debug('YDB:F','Cannot get feeds. Should be loaded default', 2);
      }
    }
    for (let i=0; i<feedz.length; i++) {
      if (feedz[i]) feedz[i].loaded = false;
      if (feedz[i].cachedResp) {
        feedzCache[i] = feedz[i].cachedResp;
        delete feedz[i].cachedResp;
      }
      if (feedz[i].cachedQueryd) {
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
    let x = JSON.parse(JSON.stringify(f_s_c));
    x.feedz.forEach(feed => {
      for (let key in feed) {
        if (keyForDeletion.includes(key)) delete feed[key];
      }
    })
    write(x);
  }

  /*********************************/
  function getDateString(date) {
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  function getYesterdayQuery() {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return `created_at:${getDateString(date)}`;
  }

  function getYearsQuery() {
    const date = new Date();
    let c = '(';
    const cc = 'created_at:';
    const dateString = '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');

    for (let i = date.getFullYear() - 1; i>2011; i--) {
      if (date.getMonth() == 1 && date.getDate() == 29 && i % 4 != 0) continue;
      c += (c === '(' ? '' : ' || ') + cc + i + dateString;
    }

    return c+')';
  }

  function getYearsAltQuery() {
    const date = new Date();
    let c = '(';
    const cc = 'first_seen_at:';
    const dateString = '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');

    for (let i = date.getFullYear() - 1; i>2011; i--) {
      if (date.getMonth() == 1 && date.getDate() == 29 && i % 4 != 0) continue;
      c += (c === '(' ? '' : ' || ') + cc + i + dateString;
    }

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
    if (document.getElementsByClassName('js-datastore')[0].dataset.hiddenFilter) tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.hiddenFilter;
    tags = '('+tags+')';
    return tags;
  }

  function spoileredQuery() {
    if (!document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList) return;

    let tl = JSON.parse(document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList);
    let tags = tl.reduce((prev, cur, i, a) => {
      if (!localStorage['bor_tags_'+cur]) return '[Unknown]';
      return prev + JSON.parse(localStorage['bor_tags_'+cur]).name+(i+1 == a.length?'':' || ');
    }, '');
    if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter) tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter;
    tags = '('+tags+')';
    return tags;
  }

  async function customQueries(f, thumb) {
    const processors = {tags: [], prefixes: []};
    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.getTagProcessors) {
      const data = unsafeWindow._YDB_public.funcs.getTagProcessors({legacy: true});
      processors.tags = processors.tags.concat(data.tags);
      processors.prefixes = processors.prefixes.concat(data.prefixes);
    } else {
      processors.tags.push({origin: '__ydb_yesterday', result: getYesterdayQuery()});
      processors.tags.push({origin: '__ydb_lastyearsalt', result: getYearsAltQuery()});
      processors.tags.push({origin: '__ydb_lastyears', result: getYearsQuery()});
      processors.tags.push({origin: '__ydb_spoilered', result: spoileredQuery()});
      processors.tags.push({origin: '__ydb_hidden', result: hiddenQuery()});
    }
    processors.tags.push({origin: '__ydb_sinceleftnonew', result: getNotSeenYetQueryNoNew(f)});
    processors.tags.push({origin: '__ydb_sinceleft', result: getNotSeenYetQuery(f)});

    processors.prefixes.push({origin: '__ydb_onlyfull:', result: f => !thumb ? f : '__ydb_placeholder'});
    processors.prefixes.push({origin: '__ydb_onlythumb:', result: f => thumb ? f : '__ydb_placeholder'});

    return (await parseSearch(f.query, processors)).toString();
  }

  /*********************************/

  function encode(link) {
    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.compactURL) {
      return unsafeWindow._YDB_public.funcs.compactURL(link);
    }
    else {
      return encodeURIComponent(link.replace(/ /g, '+')).replace(/%2B/g,'+');
    }
  }

  async function compileURL(f, act, thumb) {
    let tx = await customQueries(f, thumb);
    let s = `/search?q=${encode(tx)}&sf=${f.sort}&sd=${f.sd}`;
    if (act && (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.feedURLs)) {
      for (let i in unsafeWindow._YDB_public.funcs.feedURLs) s += unsafeWindow._YDB_public.funcs.feedURLs[i](f);
    }
    return s;
  }

  async function fetchFeed(feed, id) {
    return fetchJson('GET', await compileURL(feed, true, true))
    .then(response => {
      if (!response.ok) {
        debug('YDB:FS','Request failed. Response '+response.status,2);
        feedAfterload(feed, 'Request failed ('+response.status+'). Retry?', id);
        return false;
      }
      return response.text();
    })
    .then(async text => {
      feed.temp.innerHTML = text;
      await parse(feed, id);
    });
  }

  async function getFeed(feed, id, inital) {
    await fillParsed(feed, id);
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
            } else setTimeout(c,200);
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

  async function feedAfterload(feed, cc, id, notcache) {
    feedzURLs[id] = await compileURL(feed, true, true);
    feed.url.href = (await compileURL(feed, true, false))+'&feedId='+id;
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

  function observer(feed) {
    return new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type == 'attributes') {
          let u = mutation.target.classList;
          if (u.contains('interaction--fave') || u.contains('interaction--upvote') || u.contains('interaction--downvote') || u.contains('interaction--hide')) {
            updateEvents(feed.container.querySelector('.media-box[data-image-id="'+mutation.target.dataset.imageId+'"]'), feed);
            localStorage._ydb_cachesEvents = JSON.stringify(feedzEvents);
          }
        }
      });
    });
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

  async function parse(feed, id) {
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
          if (unsafeWindow._YDB_public.funcs.feedPP[postProcessor]) {
            unsafeWindow._YDB_public.funcs.feedPP[postProcessor](feed);
          }
        });
      }
      for (let i = 0, l = parseInt(config.imagesInFeeds*(feed.double?2:1)*1.2); i < l; i++) {
        const elem = pc.childNodes[0];
        if (!elem) break;

        const iContainer = elem.querySelector('.media-box__content .image-container');
        const link = iContainer.getElementsByTagName('a')[0];
        const image = link.getElementsByTagName('img')[0];
        const header = elem.getElementsByClassName('media-box__header')[0];

        if (!config.doNotRemoveControls) header.style.display = 'none';

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

        if (act == 'up') header.getElementsByClassName('interaction--upvote')[0].classList.add('active');
        else if (act == 'down') header.getElementsByClassName('interaction--downvote')[0].classList.add('active');
        if (faved) header.getElementsByClassName('interaction--fave')[0].classList.add('active');

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

        compactImageURL(link);

        const th = elem.querySelector('picture *[src], video *[src]');
        if (th) th.src = th.src.replace('/thumb_small.','/thumb.');
        elem.classList.add('_ydb_resizible');
        if (i >= parseInt(config.imagesInFeeds*(privated?1.2:1))*(feed.double?2:1)) elem.classList.add('hidden');
        c.appendChild(pc.childNodes[0]);
        updateEvents(elem, feed);
      }
    }
    DB_processImages(c, aloff);

    setTimeout(() => {
      feed.observer = observer(feed);
      setTimeout(() => feed.observer.observe(feed.container, {attributes: true, childList: true, characterData: true, subtree:true}), 250);
    },1000);


    await feedAfterload(feed, c.innerHTML, id);
    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler) {
      unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler(c, true);
    }
  }

  function compactImageURL(linkElem) {
    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.compactURL) {
      let q = parseURL(linkElem.href).params.q;
      if (q) {
        q = unsafeWindow._YDB_public.funcs.compactURL(decodeURIComponent(q));
        linkElem.href = linkElem.href.replace(/(\?|&)(q=.*)&/, `$1q=${q}&`).replace(/(\?|&)(q=.*)$/, `$1q=${q}`);
      }
    }
  }

  async function fillParsed(feed, id, pre) {
    const c = feed.container;
    let aloff = false;
    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.tagSimpleParser) {
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
        if (i >= parseInt(config.imagesInFeeds*(privated?1.2:1)*(feed.double?2:1))) elem.classList.add('hidden');
        else elem.classList.remove('hidden');
        applyEvents(elem, feed);
      }
    }
    DB_processImages(c, aloff);

    setTimeout(() => {
      feed.observer = observer(feed)
      feed.observer.observe(feed.container, {attributes: true, childList: true, characterData: true, subtree:true });
    },1000);

    if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler)
      unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler(c, true);
    feed.temp.innerHTML = '';
    feed.url.href = (await compileURL(feed, false, false)) + '&feedId=' + id;
    if (pre) return;
    feed.loaded = true;
    if (feedz.find(feed => feed && (privated || feed.mainPage) && !feed.loaded)) return;
    postRun();
  }

  async function init() {
    register();
    let i;
    data.spoilerType = document.getElementsByClassName('js-datastore')[0].getAttribute('data-spoiler-type');
    data.spoilers = JSON.parse(document.getElementsByClassName('js-datastore')[0].getAttribute('data-spoilered-tag-list'));
    preRun();
    resizeEverything();
    cont.style.minWidth = 'calc(100% - 338px)';
    if (cont.childNodes.length == 1) config.hasWatchList = false;
    else config.hasWatchList = true;
    for (i=0; i<(config.doNotRemoveWatchList?1:2); i++) {
      if (cont.childNodes[i]) cont.childNodes[i].style.display = 'none';
    }

    const ptime = parseInt((new Date()).getTime()/60000);
    for (i=0; i<feedz.length; i++) feedz[i].loaded = false;
    for (i=0; i<feedz.length; i++) {
      let f = feedz[i];
      if (!f) continue;
      if (f.mainPage === undefined) f.mainPage = true;
      if (!(privated || f.mainPage)) continue;

      f.internalId = i;
      f.temp = createElement('div');

      cont.appendChild(createElement('div.block', {style: {position: 'relative'}}, [
        ['div.block__header', [
          ['span.block__header__title', f.name],
          f.url = createElement('a', {style: {float: config.watchFeedLinkOnRightSide ? 'right' : ''}}, [
            ['i.fa.fa-eye'],
            ['span.hide-mobile', ' Browse feed']
          ]),
          ['span._ydb_feedloading', ' Updating feed...'],
          f.reload = ['a', {
            style: {float: config.watchFeedLinkOnRightSide ? 'right' : ''},
            onclick: async () => {
              f.saved = 0;
              await getFeed(f, f.internalId);
            }
          }, [
            ['i.fa.fa-sync'],
            ['span.hide-mobile', ' Reload feed']
          ]]
        ]],
        f.container = createElement('div.block__content.js-resizable-media-container._ydb_row_resizable',
          {
            className: (f.double ? ' _ydb_row_double' : '')
          })
      ]));

      f.saved = parseInt(f.saved);
      f.cache = parseInt(f.cache);
      f.ccache = parseInt(f.ccache);
      if (!feedzEvents[i]) feedzEvents[i] = {};
      if (!feedzCache[i]) {
        await getFeed(f, i, true);
        debug('YDB:F','Requested update to feed "'+f.name+'". Reason "No cache found"', 0);
      } else if (feedzCache[i].startsWith('Server timeout.')) {
        await getFeed(f, i, true);
        debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Not finished loading"', 0);
      } else if (await compileURL(f, false, true) != feedzURLs[i]) {
        await getFeed(f, i, true);
        debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Feed url changed"', 0);
      } else if (parseInt(config.imagesInFeeds*1.2) != feedz[i].responsed) {
        await getFeed(f, i, true);
        debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Changed setting imageInFeeds"', 0);
      } else if (ptime > (f.saved+f.cache)) {
        if (f.ccache && (!isNaN(f.ccache))) {
          if (parseInt(ptime/f.ccache) > parseInt(f.saved/f.ccache)) {
            await getFeed(f, i, true);
            debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Scheduled update"', 0);
          } else await fillParsed(f, i);
        } else {
          await getFeed(f, i, true);
          debug('YDB:F','Requested update to feed "'+f.name+'". Reason "Cache lifetime expired"', 0);
        }
      } else if (!feedzURLs[i]) await getFeed(f, i, true);
      else await fillParsed(f, i);
    }

    unsafeWindow.addEventListener("resize", resizeEverything);
    if (config.doNotRemoveWatchList && config.hasWatchList) cont.appendChild(cont.childNodes[1]);
  }

  /*********************************/

  async function YB_insertFeed2(u) {
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

    if (unsafeWindow._YDB_public.funcs.backgroundBackup) {
      unsafeWindow._YDB_public.funcs.backgroundBackup(async () => {
        if (history.length == 1) close();
        else if (u.params.feedId) location.href = '/search?q='+(await customQueries(f, false))+'&sf='+f.sort+'&sd='+f.sd+'&feedId='+i;
        else location.href = '/settings#YourBooru';
      });
    }
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
    location.href = `/search?q=${u[2]}&sf=${u[3]}&sd=${u[4]}&name=${u[1]}&cache=${u[5]}&ccache=${u[6]}`;
  }

  function YB_feedButton(id) {
    let e;
    if (id) {
      e = createElement('a', {href: location.href+'&name='+feedz[id].name+'&cache='+feedz[id].cache+'&ccache='+feedz[id].ccache, title: 'Edit feed'}, [
        ['i.fa', '\uF09E'],
        ' Edit feed'
      ]);
    } else {
      e = createElement('a', {href: location.href+'&name=New+feed&cache=30&ccache=0', title: 'Create feed'}, [
        ['i.fa', '\uF09E'],
        ' Create feed'
      ]);
    }
    const container = document.querySelector('.block__header.flex .flex__right');
    container.insertBefore(e, container.firstChild);
  }

  function YB_addFeed2(u) {
    function uniqueCheck(p) {
      return feedz.find(feed => feed.name == p)
    };
    let alreadyHas = uniqueCheck(decodeURIComponent(u.params.name).replace(/\+/g,' '));

    document.getElementById('searchform').appendChild(createElement('div', [
      ['h1', 'Add feed '],
      ['div.block.js-imagelist-info', [
        ['div.block__content',[
          'Name: ',
          ['input.input', {value:decodeURIComponent(u.params.name).replace(/\+/g,' '), name: 'name', oninput: e => {
            alreadyHas = uniqueCheck(e.target.value);
            if (!alreadyHas) {
              document.getElementById('yy_warn').classList.add('hidden');
              document.getElementById('yy_add').value = 'Add feed';
            }
            else {
              document.getElementById('yy_warn').classList.remove('hidden');
              document.getElementById('yy_add').value = 'Update';
            }
          }}],
          ['span#yy_warn.flash--warning', {className: (alreadyHas ? '' : 'hidden')}, ' That feed already exists!'],
          ['br'],
          ['br'],
          'Update: ',
          ['span#yy_cache', [
            'after ',
            ['input.input', {value: decodeURIComponent(u.params.cache), name: 'cache', oninput: e => {
              if (e.target.value == '0' || !e.target.value) {
                document.getElementById('yy_ccache').style.opacity = '1';
                document.querySelector('#yy_ccache input').removeAttribute('disabled');
              }
              else {
                document.getElementById('yy_cache').style.opacity = '1';
                document.getElementById('yy_ccache').style.opacity = '.2';
                document.querySelector('#yy_ccache input').setAttribute('disabled', true);
              }
            }}]
          ]],
          ['span#yy_ccache',[
            ' each ',
            ['input.input', {value: decodeURIComponent(u.params.ccache), name:'ccache', oninput: e => {
              if (e.target.value == '0' || !e.target.value) {
                document.getElementById('yy_cache').style.opacity = '1';
                document.querySelector('#yy_cache input').removeAttribute('disabled');
              }
              else {
                document.getElementById('yy_ccache').style.opacity = '1';
                document.getElementById('yy_cache').style.opacity = '.2';
                document.querySelector('#yy_cache input').setAttribute('disabled', true);
              }
            }}]
          ]],
          ' minutes',
          ['br'],
          ['label', 'Double size ', [
            ['input',{checked: (u.params.feedId ? feedz[u.params.feedId].double : false), name: 'double', type: 'checkbox'}]
          ]],
          ['label',' Show on main page ',[
            ['input',{checked: (u.params.feedId ? feedz[u.params.feedId].mainPage : true), name: 'mainPage', type: 'checkbox'}]
          ]],
          ['br'],
          ['br'],
          ['span', [
            ['input#yy_add.button', {type:'button', value: (alreadyHas ? 'Update' : 'Add feed')}],
            ' ',
            ['span#yy_cancel.button', 'Cancel'],
            ['span#yy_include.button', {style:'display:none'}, 'Rename automatically']
          ]]
        ]]
      ]]
    ]));

    if (u.params.cache == 0) {
      document.getElementById('yy_cache').style.opacity = '.2';
      document.querySelector('#yy_cache input').setAttribute('disabled',true);
    } else {
      document.getElementById('yy_ccache').style.opacity = '.2';
      document.querySelector('#yy_ccache input').setAttribute('disabled',true);
    }

    document.getElementById('yy_cancel').addEventListener('click', () => {
      if (history.length == 1) close();
      else {
        let q = '';
        for (let i in u.params) {
          if (i != 'name' && i != 'cache' && i != 'ccache') q += i + '=' + u.params[i] + '&';
        }
        location.search = q;
      }
    });

    document.getElementById('yy_add').addEventListener('click', () => YB_insertFeed2(u));

    document.getElementById('yy_include').addEventListener('click', () => {
      u.params.name = decodeURIComponent(u.params.name)+'_'+parseInt(65536*Math.random());
      YB_insertFeed2(u);
    });

    document.getElementById('container').insertBefore(createElement('div.flash.flash--success', 'Feed editing panel is located on the bottom'),document.getElementById('content'));
  }

  function YDB() {
    if (!location.search || location.search == "?") return;
    else {
      const x = location.search.slice(1);
      const u = x.split('?');
      if (u[0] == "addFeed") YB_addFeed(u);
      else if (u[0] == "feeds") YB_feedsPage();
    }
  }

  const dropdownLink = document.querySelector('.header--secondary .header__dropdown .header__link[href*="/images"]');
  dropdownLink.parentNode.getElementsByClassName('dropdown__content')[0].appendChild(createElement('a.header__link', {href: '/pages/api?feeds'}, 'Feeds'));
  cont = document.getElementsByClassName('column-layout__main')[0];

  if (location.pathname == '/' || location.pathname == '') setTimeout(init, 250);
  else {
    preRun();
    if (location.pathname == "/pages/api") YDB();
    else if (location.pathname == "/search" || location.pathname == '/search/index') {
      const u = parseURL(location.href);
      if (u.params.name) YB_addFeed2(u);
      else if (u.params.feedId) YB_feedButton(u.params.feedId);
      else YB_feedButton();
    }
    register();
  }
})();
