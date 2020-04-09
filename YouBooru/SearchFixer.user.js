// ==UserScript==
// @name         Derpibooru Search Fixer
// @namespace    http://tampermonkey.net/

// @include      /http[s]*:\/\/(www\.|philomena\.|)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/adverts\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*\.json.*/

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/CreateElement.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0UW.lib.js
// /require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/DerpibooruCSRFPatch.lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/SearchFixer.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/SearchFixer.user.js
// @version      0.5.1
// @description  I hoped that this script could be deleted after moving to Philomena...
// @author       stsyn

// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue

// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  const whyTheFuckRelevanceSortingIsDefinedAs_score = '_score';
  const scriptId = 'ssf';
  const sversion = GM_info.script.version;
  try {if (unsafeWindow._YDB_public.settings[scriptId]) return;}
  catch(e) {}

  // YDB:Settings required to function (separated prefered)
  // https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js

  let settings = {
    // Which sortings type should be fixed
    score:true,
    random:true,
    randomSeedKeep:false,
    gallery:true,
    first_seen_at:true,

    // Fix random button
    randomButton:true,

    // Blink on completion
    blink:true,

    // If true, navigation will be fixed while page loading
    preloading:false,

    // With which sortings type find button should be fixed
    scoreUp: true,
    everyUp: true,
    slowFallback: false
  };

  let findTemp = 0, findIter = 1, TTL = 5;
  const perpage = 50;
  let preparam;
  let first_seen, wilson_score;
  const debug = function(id, value, level) {
    try {
      unsafeWindow._YDB_public.funcs.log(id, value, level);
    } catch(e) {
      const levels = ['.', '?', '!'];
      console.log('['+levels[level]+'] ['+id+'] '+value);
    };
  };
  let galleryLastImageId;

  const sfToFunction = {
    comments: 'comments_count',
    wilson_score: 'wilson_score',
    score: 'score',
    faves: 'faves',
    upvotes: 'upvotes',
    downvotes: 'downvotes',
    width: 'width',
    height: 'height',
    tag_count: 'tag_count',
    first_seen_at: 'first_seen_at'
  };

  function compileQueryComponent(l) {
    return encodeURIComponent(l.replace(/( |%20|%2B)/g,'+'));
  }

  function register() {
    if (!unsafeWindow._YDB_public) unsafeWindow._YDB_public = {};
    if (!unsafeWindow._YDB_public.settings) unsafeWindow._YDB_public.settings = {};
    unsafeWindow._YDB_public.settings.ssf = {
      name:'Search Sorting Fixer',
      version:sversion,
      container:'_ssf',
      link:'/meta/userscript-search-sorting-fixer-003',
      s:[
        {type:'header', name:'Navigation'},
        {type:'checkbox', name:'Alter score-like navigation', parameter:'score'},
        {type:'breakline'},
        {type:'checkbox', name:'Fix gallery sorting (slow)', parameter:'gallery'},
        {type:'breakline'},
        {type:'checkbox', name:'Fix random navigation', parameter:'random'},
        {type:'breakline'},
        {type:'checkbox', name:'Keep random seed (slow)', parameter:'randomSeedKeep'},
        {type:'breakline'},
        {type:'checkbox', name:'Fix random button', parameter:'randomButton'},
        {type:'breakline'},
        {type:'header', name:'Find'},
        {type:'checkbox', name:'Smart Find button with score-like and other strict sortings', parameter:'scoreUp'},
        {type:'breakline'},
        {type:'checkbox', name:'Interpretate Find button as working with id sorting with other sortings', parameter:'everyUp'},
        {type:'breakline'},
        {type:'checkbox', name:'Don\'t fallback to id sorting for relative search (slow)', parameter:'slowFallback'},
        {type:'breakline'},
        {type:'header', name:'UX'},
        {type:'checkbox', name:'Flash on completion', parameter:'blink'},
        {type:'breakline'},
        {type:'checkbox', name:'Fix buttons on start (except "Find" button)', parameter:'preloading'},
      ]
    };
  }

  function isNavigationSupported() {
    const sf = myURL.params.sf;
    return sf && (
    (sf == 'created_at' && myURL.params.del) ||
    ((sf == 'score' || sf == 'faves' || sf == 'upvotes' || sf == 'downvotes') && settings.score) ||
    //(sf == 'comments' && settings.comments) ||
    //(sf == 'first_seen_at' && settings.first_seen_at) ||
    //(sf == 'tag_count' && settings.tag_count) ||
    (sf.startsWith('random') && settings.random) ||
    (sf.startsWith('gallery_id') && settings.gallery)/* ||
    ((sf == 'width' || sf == 'height') && settings.sizes)*/
    )
  }

  function navigationFallbackLikeGalery() {
    const sf = myURL.params.sf;
    return sf && ((sf.startsWith('random%') && settings.randomSeedKeep) ||
      (sf.startsWith('gallery_id') && settings.gallery));
  }

  function isSupportedForFind() {
    const sf = myURL.params.sf;
    return ((sf == 'score' || sf == 'wilson_score' || sf == 'faves' || sf == 'upvotes' || sf == 'downvotes') && settings.scoreUp) ||
    (sf == 'comments' && settings.comments) ||
    (sf == 'first_seen_at' && settings.first_seen_at) ||
    ((sf == 'width' || sf == 'height') && settings.sizesUp)
  }

  function isSupportedForFindWithFallbackToCreatedAt() {
    const sf = myURL.params.sf;
    return (( (!sf && myURL.params.q && myURL.params.q != '%2A')
      || sf == 'created_at' || sf == 'updated_at' || sf == 'tag_count' || (sf && sf.startsWith('random')) /*|| sf == whyTheFuckRelevanceSortingIsDefinedAs_score*/) && settings.everyUp)
  }

  function isSupportedForFindWithFallbackToGalleryLike() {
    const sf = myURL.params.sf;
    return sf && ((sf.startsWith('gallery_id') && settings.gallery) ||
      (sf.startsWith('random%') && settings.randomSeedKeep)/* ||
      (sf == whyTheFuckRelevanceSortingIsDefinedAs_score && settings.slowFallback)*/)
  }

  //////////////////////////////////////////////
  function unblink(e) {
    e.classList.remove('active');
    e.classList.remove('interaction--upvote');
    e.classList.remove('interaction--downvote');
  }

  function blink(e) {
    if (!settings.blink) return;
    e.classList.add('active');
    e.classList.add('interaction--upvote');
    e.classList.remove('interaction--fave');
    setTimeout(() => unblink(e), 200);
  }

  function failBlink(e) {
    if (!settings.blink) return;
    e.classList.add('active');
    e.classList.add('interaction--downvote');
    e.classList.remove('interaction--fave');
    setTimeout(() => unblink(e), 200);
  }

  function complete(target, link) {
    link = link.split('#')[0];
    blink(target);
    if (settings.preloading && !target.classList.contains('js-up')) target.href = link;
    else location.href = link;
  }

  function fail(target) {
    failBlink(target);
    if (settings.preloading && !target.classList.contains('js-up')) target.href = '#';
  }

  function workerRequest(link) {
    return fetchJson('GET', link)
      .then(response => response.json())
      .catch(exception => {
        debug('SSF', 'Request failed: '+exception, 2);
        fail(elem);
        throw exception;
      });
  }

  function getSearchPrefix(src) {
    let apiKey;
    if (_YDB_S_OuterScope && _YDB_S_OuterScope.getApiKey) {
      try {
        apiKey = _YDB_S_OuterScope.getApiKey();
      } catch(e) {}
    }
    if (!apiKey) {
      if (!unsafeWindow._YDB_public || !unsafeWindow._YDB_public.funcs || !unsafeWindow._YDB_public.funcs.getApiKey) {
        alert('YDB:Settings 0.9.34 or higher required. Use standalone Settings version if you see this error even if Settings version is actual.');
        throw '_YDB_public.funcs.getApiKey not found';
      }
      apiKey = unsafeWindow._YDB_public.funcs.getApiKey();
    }
    return `/api/v1/json/search/images?key=${apiKey}&q=(${src || myURL.params.q})`;
  }

  function gainParams(arr) {
    const container = document.getElementsByClassName('image-show-container')[0];
    if (arr) return {
      score: container.dataset.score,
      upvotes: container.dataset.upvotes,
      downvotes: container.dataset.downvotes,
      width: container.dataset.width,
      height: container.dataset.height,
      comments: document.querySelectorAll('.comments_count')[0].innerHTML,
      tag_count: document.querySelectorAll('.tag-list .tag').length,
      first_seen_at: first_seen,
      wilson_score
    };
    if (myURL.params.sf == 'score') return container.dataset.score;
    if (myURL.params.sf == 'upvotes') return container.dataset.upvotes;
    if (myURL.params.sf == 'downvotes') return container.dataset.downvotes;
    if (myURL.params.sf == 'width') return container.dataset.width;
    if (myURL.params.sf == 'height') return container.dataset.height;
    if (myURL.params.sf == 'comments') return document.querySelectorAll('.comments_count')[0].innerHTML;
    if (myURL.params.sf == 'tag_count') return document.querySelectorAll('.tag-list .tag').length;
    if (myURL.params.sf == 'first_seen_at') return first_seen;
    if (myURL.params.sf == 'wilson_score') return wilson_score;
  }

  async function findWorker(element) {
    // getting rough offset
    let offset, page = 1;
    if (!isSupportedForFindWithFallbackToGalleryLike()) {
      offset = (await workerRequest(compileLtQuery(1))).total;
      page = parseInt(offset / perpage)+1;
    };

    // getting exact offset (using the same query as resulting, so results will be sorted as needed)
    let foundIndex = null;
    for (foundIndex; foundIndex === null; page++) {
      let result = await workerRequest(compileXQuery(page));
      if (result.images.length === 0) {
        fail(element);
        debug('SSF', 'Lost images in detailing step', 2);
      }
      const temp = result.images.findIndex(item => item.id === id);
      if (temp !== -1) {
        foundIndex = temp + (page - 1) * perpage;
      }
    }

    // getting perpage
    let visible = (await workerRequest(getSearchPrefix('%2A'))).images.length;

    complete(element, compileFinalQuery(Math.floor(foundIndex  / visible) + 1));
  }

  async function navigationWorker(element, direction) {
    if (navigationFallbackLikeGalery()) {
      return galleryNavigationWorker(element, direction);
    }
    // getting images with the same main attribute, but different id
    let result = await workerRequest(compileStep1Query(direction));
    if (result.total > 0) {
      return complete(element, location.href.replace(id, result.images[0].id));
    }

    // getting images by main attribute
    result = await workerRequest(compileQuery(direction));
    let images = result.images.filter(item => item.id !== id);
    if (result.total === 0) {
      return fail(element);
    }

    // we managed to hit only the same image
    let delta = 1;
    while (result.total === 1 && images.length === 0) {
      result = await workerRequest(compileQuery(direction, delta++));
      images = result.images.filter(item => item.id !== id);
      if (result.total === 0) {
        return fail(element);
      }
    }

    if (images.length === 1) {
      complete(element, location.href.replace(id, images[0].id));
    }

    // more than 1 possible images, need to check
    const possibleParams = ['score', 'faves', 'upvotes', 'downvotes', 'width', 'height', 'comments', 'first_seen_at'];
    const param = possibleParams.includes(myURL.params.sf) ? sfToFunction[myURL.params.sf] : '';
    let isEqualParam = false;

    if (myURL.params.sf === 'tag_count') {
      isEqualParam = (images[0].tag_ids.length == images[1].tag_ids.length);
    } else {
      isEqualParam = (images[0][param] == images[1][param]);
    }

    if (!isEqualParam) {
      complete(element, location.href.replace(id, images[0].id));
    }

    // yep, we need to choose one
    result = (await workerRequest(compilePostQuery(
      type,
      (myURL.params.sf == 'tag_count' ? images[0].tag_ids.length : images[0][param])
    ))).images;
    complete(element, location.href.replace(id, result[0].id));
  }

  async function galleryNavigationWorker(element, direction) {
    // similar as find, but we also getting next image id
    let foundIndex = null, page = 1, previousImageId = null;
    for (foundIndex; foundIndex === null; page++) {
      let result = await workerRequest(compileXQuery(page));
      if (result.images.length === 0) {
        fail(element);
        debug('SSF', 'Lost images in detailing step', 2);
      }
      const temp = result.images.findIndex(item => item.id === id);
      if (temp === -1) {
        previousImageId = result.images.pop().id;
        continue;
      }

      foundIndex = temp + (page - 1) * perpage;

      // bound cases
      if (temp === result.images.length - 1 && direction === 'next') {
        const tempResult = (await workerRequest(compileXQuery(page + 1))).images[0];
        if (!tempResult) {
          fail(element);
        } else {
          complete(element, location.href.replace(id, tempResult.id));
        }
      } else if (temp === 0 && direction === 'prev') {
        if (previousImageId) {
          complete(element, location.href.replace(id, previousImageId));
        } else {
          fail(element);
        }
      } else {
        complete(element, location.href.replace(id, result.images[temp + (direction === 'next'? 1 : -1)].id));
      }
    }
  }

  async function randomWorker(element) {
    // just get me anything
    let result = (await workerRequest(compileQuery('rand'))).images.filter(item => item.id !== id);
    if (settings.preloading) {
      let n, p, r, pid = 0, rid = 0;
      n = document.getElementsByClassName('js-rand')[0];
      p = document.getElementsByClassName('js-prev')[0];
      r = document.getElementsByClassName('js-next')[0];
      if (results.length > 0) {
        complete(n, location.href.replace(id, result[0].id));
        if (myURL.params.sf && myURL.params.sf.startsWith('random')) {
          if (results.length > 1) {
            pid = 1;
            if (settings.randomButton) {
              rid = results.length > 2 ? 2 : 1;
            }
          }
        }
        complete(p, location.href.replace(id, result[pid].id));
        complete(r, location.href.replace(id, result[rid].id));
      } else {
        if (settings.randomButton) fail(n);
        if (myURL.params.sf && myURL.params.sf.startsWith('random')) {
          fail(p);
          fail(r);
        }
      }
    } else if (result.length > 0) {
      complete(element, location.href.replace(id, result[0].id));
    } else {
      fail(element);
    }
  }

  // looking for the first pic in the possible results
  function compilePostQuery(type, v, page) {
    const dir = ((myURL.params.sd == 'asc' ^ type == 'prev') ? 'asc' : 'desc');
    const pagePart = type!='find' ? '&per_page=1' : '&per_page=50&page='+page;

    const link = `${getSearchPrefix()},(${sfToFunction[myURL.params.sf]}:${v})${pagePart}&sf=created_at&sd=${dir}`;

    debug('SSF', 'Post query: query '+link, 0);
    return link;
  }

  // looking for pics with the same score but different id
  function compileStep1Query(direction) {
    let prevUrl = getSearchPrefix();
    const dir = (myURL.params.sd == 'asc' ^ direction == 'prev') ? 'gt' : 'lt';
    const sd = (myURL.params.sd == 'asc' ^ direction == 'prev') ? 'asc' : 'desc';
    const cscore = preparam[myURL.params.sf];
    const idPart = `id.${dir}:${id}`;
    const sf = myURL.params.sf == 'first_seen_at' ? 'first_seen_at' : 'created_at';
    const common = ['score', 'faves', 'upvotes', 'downvotes', 'width', 'height', 'comments', 'tag_count'];

    if (common.includes(myURL.params.sf)) {
      prevUrl += `,(${sfToFunction[myURL.params.sf]}:${cscore},${idPart})`;
    } else if (myURL.params.sf == "created_at") {
      prevUrl += `,(${idPart})`;
    } else if (myURL.params.sf == "first_seen_at") {
      prevUrl += `,(first_seen_at.${dir}:${cscore})`;
    }

    prevUrl += `&per_page=1&sf=${sf}&sd=${sd}`;

    if (myURL.params.del) prevUrl += `&del=${myURL.params.del}`;
    debug('SSF','Pre query: query '+prevUrl,0);
    return prevUrl;
  }

  // actually searching
  function compileQuery(type, delta) {
    let d = 0;
    if (delta != undefined) d = delta * (myURL.params.sd=='asc' ^ type=='prev') ? -1 : 1;
    let prevUrl = getSearchPrefix();
    if (type !='random' && !myURL.params.sf.startsWith('random')) {
      const cscore = preparam[myURL.params.sf] + d;
      const dir = (myURL.params.sd == 'asc' ^ type == 'prev') ? 'gt' : 'lt';
      const sd = (myURL.params.sd == 'asc' ^ type == 'prev') ? 'asc' : 'desc';
      const idPart = `id.${dir}:${id}`;
      const sf = sfToFunction[myURL.params.sf];
      prevUrl += `,((${sf}:${cscore},${idPart})+||+(${sf}.${dir}:${cscore}))`;

      prevUrl += `&per_page=3&sf=${myURL.params.sf}&sd=${sd}`;
    }
    else prevUrl+='&per_page=4&sf=' + (settings.randomSeedKeep ? myURL.params.sf : 'random');
    debug('SSF','Query: query '+prevUrl,0);
    return prevUrl;
  }

  // taking offset
  function compileLtQuery(page) {
    let prevUrl = getSearchPrefix() + ',';
    const dir = ((myURL.params.sd!='asc')?'gt':'lt');
    const sd = ((myURL.params.sd!='asc')?'asc':'desc');
    const sff = sfToFunction[myURL.params.sf];
    const sf = sff ? myURL.params.sf : 'created_at';
    const cscore = preparam[myURL.params.sf];

    if (sff) {
      prevUrl += `(${sff}.${dir}:${cscore})`;
    } else {
      prevUrl += `(id.${dir}:${id})`;
    }

    prevUrl += `&page=${page}&per_page=50&sf=${myURL.params.sf}&sd=${sd}`;
    if (myURL.params.del) prevUrl += `&del=${myURL.params.del}`;
    debug('SSF','Gaining offset pagination query: page '+page+', query '+myURL.params.q,0);
    return prevUrl;
  }

  // find
  function compileXQuery(page) {
    const sff = sfToFunction[myURL.params.sf] || isSupportedForFindWithFallbackToGalleryLike();
    const sf = sff ? myURL.params.sf : 'created_at';

    debug('SSF','Pagination query: page '+page+', query '+myURL.params.q+', sort '+sf,0);
    return getSearchPrefix() + '&per_page=50&sf=' + sf + '&sd='+
            (myURL.params.sd || '') + '&page=' + page + (myURL.params.del ? '&del='+myURL.params.del : '');
  }

  // final
  function compileFinalQuery(page) {
    const sff = sfToFunction[myURL.params.sf] || isSupportedForFindWithFallbackToGalleryLike();
    const sf = sff ? myURL.params.sf : 'created_at';

    return '/search?q=' + myURL.params.q + '&sf=' + sf + '&sd='+
            (myURL.params.sd || '') + '&page=' + page + (myURL.params.del ? '&del='+myURL.params.del : '');
  }

  function crLink(sel, type) {
    if (myURL.params.sf == 'first_seen_at' && !first_seen || myURL.params.sf == 'wilson_score' && !wilson_score) {
      setTimeout(crLink, 10, sel, type);
      return;
    }

    if (type == 'find') {
      findWorker(sel);
      return;
    }

    if (type === 'random' && !navigationFallbackLikeGalery()) {
      randomWorker(sel, type);
      return;
    }

    navigationWorker(sel, type);
  };

  function fetchFirstSeen(id) {
    fetchJson('GET', '/api/v1/json/images/'+id)
    .then(response => response.json())
    .then(response => {
      first_seen = response.image.first_seen_at;
      wilson_score = response.image.wilson_score;
      preparam.first_seen_at = first_seen;
      preparam.wilson_score = wilson_score;
    });
  };

  //adding a button, pushes query in header search
  function pushQuery(withup) {
    GM_addStyle(`
#_ydb_s_qpusher_sf {
  display: inline;
  width: 5em;
}
#_ydb_s_qpusher_sd {
  display: inline;
  width: 3.5em;
}
#_ydb_s_finder i, #_ydb_s_qpusher i {
  color: #fff;
  width: 28px;
  line-height: 28px;
  text-align: center;
  font-size: 110%;
  vertical-align:super;
}

@media(max-width: 800px) {
  .header__search .dropdown__content, .header__search:hover .dropdown__content {
    display: flex;
    font-size: 14px;
    width: auto;
    min-width: auto !important
  }
}
`);

    let qpusher;
    const chall = () => {
      let s = location.search;
      let es = ['form.header__search .input','#_ydb_s_qpusher_sf','#_ydb_s_qpusher_sd', '#del'];
      let args = ['q','sf','sd','del'];
      for (let i=0; i<es.length; i++) {
        const e = document.querySelector(es[i]);
        if (!e) continue;
        let val = e.value;
        let arg = args[i];
        if (i == 0) {
          if (unsafeWindow._YDB_public.funcs && unsafeWindow._YDB_public.funcs.tagAliases)
            val = unsafeWindow._YDB_public.funcs.tagAliases(e.value,{});
        }
        let t = compileQueryComponent(val);
        myURL.params[arg] = t;
        s = '?';
        for (let x in myURL.params) {
          s += (s != '?' ? '&' : '') + x + '=' + myURL.params[x];
        }
      }
      qpusher.search = s.replace(/%2B/g, '+');
    };

    document.querySelector('form.header__search').classList.add('dropdown');
    document.querySelector('form.header__search').appendChild(
      createElement('span.dropdown__content',{style:{position:'static',minWidth:0,zIndex:1}},[
        createElement('select#_ydb_s_qpusher_sf.input.header__input',{
          name: 'sf',
          size: 1,
          events: { input: chall }
        }, [
          createElement('option',{value:'created_at'},'created_at'),
          createElement('option',{value:'updated_at'},'updated_at'),
          createElement('option',{value:whyTheFuckRelevanceSortingIsDefinedAs_score},'relevance'),
          createElement('option',{value:'first_seen_at'},'first_seen_at'),
          createElement('option',{value:'score'},'score'),
          createElement('option',{value:'faves'},'faves'),
          createElement('option',{value:'upvotes'},'upvotes'),
          createElement('option',{value:'downvotes'},'downvotes'),
          createElement('option',{value:'wilson_score'},'wilson'),
          createElement('option',{value:'width'},'width'),
          createElement('option',{value:'height'},'height'),
          createElement('option',{value:'comments'},'comments'),
          createElement('option',{value:'tag_count'},'tag_count'),
          createElement('option',{value:'random'},'random'),
        ]),
        createElement('select#_ydb_s_qpusher_sd.input.header__input', {
          name: 'sd',
          size: 1,
          events: { input: chall }
        }, [
          createElement('option',{value:'desc'},'desc'),
          createElement('option',{value:'asc'},'asc')
        ])
      ]));
    if (withup) {
      let item;
      document.querySelector('form.header__search').insertBefore(
        item = createElement('a#_ydb_s_finder.header__link.header__search__button', {
          title: 'Find this image position in entered query',
          style: { height: '28px', padding: 0},
          events: { click: e => {
            commonClickAction(e);
            myURL = parseURL(qpusher.href);
            crLink(item, 'find');
          }}
        }, [
          createElement('i.fa', '\uF03C')
        ]), document.querySelector('form.header__search>a.header__search__button'));

      document.querySelector('form.header__search').insertBefore(
        qpusher = createElement('a#_ydb_s_qpusher.header__link.header__search__button',{
          title: 'Push search query to url bar',
          style: { height: '28px', padding: 0},
          href: location.href
        }, [
          createElement('i.fa.fa-arrow-up')
        ]), document.querySelector('form.header__search>a.header__search__button'));

      qpusher.hash = '';
    }

    if (myURL.params.sf && myURL.params.sf.startsWith('gallery_id')) {
      addElem('option', {value: myURL.params.sf, innerHTML: 'gallery'}, document.getElementById('_ydb_s_qpusher_sf'));
    }
    if (!myURL.params.sf) myURL.params.sf = 'created_at';
    if (!myURL.params.sd) myURL.params.sd = 'desc';
    let x = myURL.params.sf;
    if (myURL.params.sf.startsWith('gallery_id')) x = 'gallery_id';
    if (myURL.params.sf.startsWith('random')) x = 'random';
    if (document.querySelector('#_ydb_s_qpusher_sf *[value*='+x+']')) {
      document.querySelector('#_ydb_s_qpusher_sf *[value*='+x+']').selected = 'selected';
    }
    if (document.querySelector('#_ydb_s_qpusher_sd *[value='+myURL.params.sd+']')) {
      document.querySelector('#_ydb_s_qpusher_sd *[value='+myURL.params.sd+']').selected = 'selected';
    }

    if (document.getElementById('_ydb_s_qpusher')) {
      document.querySelector('form.header__search .input').addEventListener('input', chall);
      if (document.querySelector('#del')) document.querySelector('#del').addEventListener('input', chall);
    }

    //fetching tags
    Array.from(document.querySelectorAll('.tag.dropdown')).forEach(elem => {
      elem.getElementsByClassName('dropdown__content')[0].appendChild(
        createElement('span.tag__dropdown__link', {dataset: {tag: elem.dataset.tagName}},[
          createElement('a', {style: {cursor:'pointer'}, events: {click: e => {
            const searchElem = document.querySelector('form.header__search .input');
            searchElem.value = e.target.parentNode.dataset.tag;
            chall();
          }}}, 'Set query '),
          createElement('a', {style: {cursor:'pointer'}, events: {click: e => {
            const searchElem = document.querySelector('form.header__search .input');
            searchElem.value += (searchElem.value.trim? ',' : '') + e.target.parentNode.dataset.tag;
            chall();
          }}},'[+]')
        ])
      );
    });
  }


  ////////////////////////////////

  function execute() {
    if (!myURL.params.sf.startsWith('random')) {
      crLink(document.getElementsByClassName('js-prev')[0], 'prev');
      crLink(document.getElementsByClassName('js-next')[0], 'next');
    }
    if (settings.randomButton || myURL.params.sf.startsWith('random')) {
      crLink(document.getElementsByClassName('js-rand')[0], 'random');
    }
  }

  function commonClickAction(e) {
    e.preventDefault();
    if (settings.blink) {
      let elem = e.target;
      if (elem.classList.contains('fa')) elem = elem.parentNode;
      elem.classList.add('interaction--fave');
      elem.classList.add('active');
    }
    myURL = parseURL(location.href);
  }

  /////////////////////////////////

  if (!localStorage._ssf || settings.override) {
    localStorage._ssf = JSON.stringify(settings);
  } else {
    try {
      let settings2 = JSON.parse(localStorage._ssf);
      settings = settings2;
    } catch(e) {
      localStorage._ssf = JSON.stringify(settings);
    }
  }

  register();
  let myURL = parseURL(location.href);
  let id = parseInt(myURL.path.slice(1));

  if (isNaN(id)) {
    id = myURL.path.split('/');
    if (id[1] == 'images') id = parseInt(id[2]);
  }
  pushQuery(!isNaN(id));
  if (!isNaN(id)) {
    preparam = gainParams(true);
    fetchFirstSeen(id);
  }

  // navigation section
  if (!isNaN(id) && isNavigationSupported()) {
    if (!navigationFallbackLikeGalery()) myURL.params.sf = myURL.params.sf.split('%')[0];
    if (settings.preloading) execute();
    else {
      const random = myURL.params.sf.startsWith('random') && !navigationFallbackLikeGalery();
      console.warn(random);

      const n = document.getElementsByClassName('js-next')[0];
      const p = document.getElementsByClassName('js-prev')[0];
      const r = document.getElementsByClassName('js-rand')[0];
      n.addEventListener('click',(e) => {
        commonClickAction(e);
        crLink(n, random ? 'random' : 'next');
      });
      p.addEventListener('click',(e) => {
        commonClickAction(e);
        crLink(p, random ? 'random' : 'prev');
      });
      r.addEventListener('click',(e) => {
        commonClickAction(e);
        crLink(r, 'random');
      });
    }
  }

  if (!isNaN(id) && (
    isSupportedForFind() ||
    isSupportedForFindWithFallbackToCreatedAt() ||
    isSupportedForFindWithFallbackToGalleryLike()
  )) {
    const x = document.getElementsByClassName('js-up')[0];
    x.addEventListener('click',(e) => {
      commonClickAction(e);
      crLink(x, 'find');
    });
  }
})();
