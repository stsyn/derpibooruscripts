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
// @version      0.4.15
// @description  Allows Next/Prev/Random navigation with not id sorting and more stuff
// @author       stsyn

// @grant        unsafeWindow
// @grant        GM_addStyle

// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  const scriptId = 'ssf';
  const philomena = location.hostname.split('.')[0] == 'philomena';
  const sversion = GM_info.script.version;
  try {if (unsafeWindow._YDB_public.settings[scriptId] != undefined) return;}
  catch(e) {}

  // These settings also may be edited via YourBooru:Settings
  // And it's strongly recomended to install it, you won't lose settings if you update script!
  // https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js

  let settings = {
    //!!!Change to true if you want to use these settings
    override:false,

    //Which sortings type should be fixed
    score:true,
    random:true,
    sizes:false,
    comments:false,
    gallery:true,
    first_seen_at:true,
    tag_count:false,

    //Fix random button
    randomButton:true,

    //Blink on completion
    blink:true,

    //If true, navigation will be fixed while page loading
    preloading:false,

    //With which sortings type find button should be fixed
    scoreUp:true,
    sizesUp:true,
    commentsUp:true,
    everyUp:true,

    //Pregaining image data
    pregain:true
  };

  let findTemp = 0, findIter = 1, TTL = 5;
  let preparam;
  let first_seen;
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
    score: 'score',
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
        {type:'checkbox', name:'Fix score sorting', parameter:'score'},
        {type:'checkbox', name:'Fix random sorting', parameter:'random'},
        {type:'checkbox', name:'Fix size sorting', parameter:'sizes'},
        {type:'checkbox', name:'Fix comments sorting', parameter:'comments'},
        {type:'checkbox', name:'Fix gallery sorting', parameter:'gallery'},
        {type:'checkbox', name:'Fix first_seen_at', parameter:'first_seen_at'},
        {type:'checkbox', name:'Fix tag_count', parameter:'tag_count'},
        {type:'breakline'},
        {type:'checkbox', name:'Fix random button', parameter:'randomButton'},
        {type:'checkbox', name:'Flash on completion', parameter:'blink'},
        {type:'checkbox', name:'Fix buttons on start (except "Find" button)', parameter:'preloading'},
        {type:'breakline'},
        {type:'checkbox', name:'Smart Find button at: score sorting', parameter:'scoreUp'},
        {type:'checkbox', name:'; sizes sorting', parameter:'sizesUp'},
        {type:'checkbox', name:'; comments sorting', parameter:'commentsUp'},
        {type:'checkbox', name:'; other sortings', parameter:'everyUp'}
      ]
    };
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

  function complete (target, link) {
    link = link.split('#')[0];
    blink(document.querySelectorAll(target)[0]);
    if (settings.preloading && target != '.js-up') document.querySelectorAll(target)[0].href = link;
    else location.href = link;
  }

  function fail (target) {
    failBlink(document.querySelectorAll(target)[0]);
    if (settings.preloading && target != '.js-up') document.querySelectorAll(target)[0].href = '#';
  }

  function request(link, elem, target, level) {
    if (!link.startsWith('https://' + location.hostname)) link = 'https://'+location.hostname + link;
    let req = new XMLHttpRequest();
    debug('SSF','Request: link '+link+', level '+level,1);
    TTL = 5;
    req.link = link;
    req.sel = elem;
    req.level = level;
    req.onreadystatechange = readyHandler(req, target);
    req.open('GET', link);
    req.send();
    return;
  }

  function readyHandler(request, type) {
    return function () {
      if (request.readyState === 4) {
        if (request.status === 200) return parse(request, type);
        else if (request.status === 0) {
          debug('SSF', 'Server refused to answer. Trying again in '+100*(6-TTL)+'ms', 2);
          setTimeout(function() {
            TTL--;
            let req = new XMLHttpRequest();
            req.sel = request.sel;
            req.link = request.link;
            req.level = request.level;
            req.onreadystatechange = readyHandler(req, type);
            req.open('GET', request.link);
            req.send();
          }, 100*(6-TTL));
          return false;
        } else {
          debug('SSF', 'Request failed: '+request.status, 2);
          fail(request.sel);
          return false;
        }
      }
    };
  }

  function gainParams(arr) {
    if (arr) return {
      score: parseInt(document.getElementsByClassName('score')[0].innerHTML),
      width: document.querySelector('.image-show-container').dataset.width,
      height: document.querySelector('.image-show-container').dataset.height,
      comments: document.querySelectorAll('.comments_count')[0].innerHTML,
      tag_count: document.querySelectorAll('.tag-list .tag').length,
      first_seen_at: first_seen
    };
    if (myURL.params.sf == 'score') return parseInt(document.getElementsByClassName('score')[0].innerHTML);
    if (myURL.params.sf == 'width') return document.querySelector('.image-show-container').dataset.width;
    if (myURL.params.sf == 'height') return document.querySelector('.image-show-container').dataset.height;
    if (myURL.params.sf == 'comments') return document.querySelectorAll('.comments_count')[0].innerHTML;
    if (myURL.params.sf == 'tag_count') return document.querySelectorAll('.tag-list .tag').length;
    if (myURL.params.sf == 'first_seen_at') return first_seen;
  }

  function parse(r, type) {
    let u;
    try {
      u = JSON.parse(r.responseText);
    } catch (e) {
      debug ('SSF', e, 2);
      return;
    }
    let i;
    if (type == 'find') {
      let param = settings.pregain ? preparam[myURL.params.sf] : gainParams();

      if (r.level == 'act' && param == '') {
        findTemp = u.total;
        request('/search.json?q=%2A', r.sel, 'find', 'pre');
        return;
      }
      if (r.level == 'act' && param != '') {
        findTemp = u.total;
        findIter = parseInt(findTemp/50)+1;
        request(compileXQuery(findIter, true), r.sel, 'find', 'post');
        return;
      }
      if (r.level == 'post') {
        if (u.search.length > 0) for (let i=0; i<u.search.length; i++) {
          if (u.search[i].id == id) {
            findTemp = ((findIter-1)*50)+i;
            request('/search.json?q=%2A', r.sel, 'find', 'pre');
            return;
          }
        } else return;
        findIter++;
        request(compileXQuery(findIter, true), r.sel, 'find', 'post');
        return;
      } else {
        complete(r.sel, compileXQuery(parseInt(findTemp/u.search.length+1), false));
        return;
      }
    }
    if (type == 'nextGalleryLast') {
      //для галерей
      if (u.search.length > 0) complete(r.sel, location.href.replace(id, u.search[0].id));
      else fail(r.sel);
      return;
    }
    if (myURL.params.sf.startsWith('gallery_id')) {
      //для галерей
      if (u.search.length > 0) for (let i=0; i<u.search.length; i++) {
        if (u.search[i].id == id) {
          //нашли якорь
          if (type == 'prev') {
            if (i == 0 && galleryLastImageId) complete(r.sel, location.href.replace(id, galleryLastImageId));
            else if (i == 0) fail(r.sel);
            else complete(r.sel, location.href.replace(id, u.search[i-1].id));
            return;
          } else {
            if (i == u.search.length-1) {
              findIter++;
              request(compileXQuery(findIter, true), r.sel, 'nextGalleryLast', 'post');
            } else complete(r.sel, location.href.replace(id, u.search[i+1].id));
            return;
          }
        }
      } else return;
      //не нашли
      findIter++;
      galleryLastImageId = u.search[u.search.length-1].id;
      request(compileXQuery(findIter, true), r.sel, type, 'post');
      return;
    }
    if (!myURL.params.sf.startsWith('random')) {
      if (r.level == 'pre') {
        if (u.total == 0) {
          //не удалось найти следующую пикчу по номеру, пробуем теперь реально следующую
          request(compileQuery(type), r.sel, type, 'act');
          return;
        } else {
          //нашли с тем же критерием, но другим очком
          complete(r.sel, location.href.replace(id, u.search[0].id));
          return;
        }

      }
      else if (r.level == 'act') {
        if (u.total == 0) {
          //чот нихуя не нашли опять. Видимо, на сей раз реально ничего нет
          fail(r.sel);
        }
        else {
          if (u.total > 1) {
            let param;
            let s = 0;
            if (u.search[s].id == id) s++;

            const possibleParams = ['score', 'width', 'height', 'comments', 'first_seen_at'];
            param = possibleParams.includes(myURL.params.sf) ? sfToFunction[myURL.params.sf] : '';

            if ((myURL.params.sf == 'tag_count' && u.search[s+1].tag_ids.length == u.search[s].tag_ids.length) ||
              (myURL.params.sf != 'tag_count' && u.search[s+1][param] == u.search[s][param])) {
              //мы чот нашли, но у соседней по тому же критерию то же самое, нужно уточнить, что ставить
              request(compilePostQuery(type, (myURL.params.sf == 'tag_count'?u.search[s+1].tag_ids.length:u.search[s+1][param])), r.sel, type, 'post');
              return;
            } else {
              //а все норм, она одна такая
              complete(r.sel, location.href.replace(id, u.search[s].id));
              return;
            }
          } else {
            //в запросе ваще одна пихча
            if (u.search[0].id == id) {
              request(compileQuery(type, 1), r.sel, type, 'act');
            } else {
              complete(r.sel, location.href.replace(id, u.search[0].id));
            }
            return;
          }
        }
      } else if (r.level == 'post') {
        if (r.sel == '.js-rand' && u.search[0].id == id && u.total == 1) {
          //рандом высрал только эту пикчу
          fail(r.sel);
        }
        //вот это точно должна идти
        complete(r.sel, location.href.replace(id, u.search[0].id));
        return;
      }
    } else {
      if (settings.preload) {
        if (u.total > 1) {
          const x = (u.search[0].id == id) ? 1 : 0;
          document.querySelectorAll('.js-next')[0].href=location.href.replace(id, u.search[x].id);
          if (u.total > 2) {
            if (u.search[x+1].id == id) document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x+2].id);
            else document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x+1].id);
          }
          else document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x].id);
          if (settings.randomButton) {
            if (u.total > 3) {
              if (u.search[x+2].id == id) document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x+3].id);
              else document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x+2].id);
            }
            else document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x].id);
          }
        } else {
          if (settings.randomButton) fail('.js-rand');
          fail('.js-prev');
          fail('.js-next');
        }
        if (settings.randomButton) blink(document.querySelectorAll('.js-rand')[0]);
        blink(document.querySelectorAll('.js-prev')[0]);
        blink(document.querySelectorAll('.js-next')[0]);
      } else {
        if (u.total>1) complete(r.sel, location.href.replace(id, u.search[0].id));
        else fail(r.sel);
      }
    }
  }

  function getSearchPrefix() {
    return `/search.json?q=(${myURL.params.q}),`;
  }

  // looking for the first pic in the possible
  function compilePostQuery(type, v, page) {
    const dir = ((myURL.params.sd == 'asc' ^ type == 'prev') ? 'asc' : 'desc');
    const pagePart = type!='find' ? '&perpage=1' : '&perpage=50&page='+page;

    const link = `${getSearchPrefix()}(${sfToFunction[myURL.params.sf]}:${v})${pagePart}&sf=created_at&sd=${dir}`;

    debug('SSF', 'Post query: query '+link, 0);
    return link;
  }

  // looking for pics with the same score but different id
  function compilePreQuery(type) {
    findIter = 1;
    findTemp = 9;
    if (type == 'find') return compileLtQuery(1);
    if (myURL.params.sf.startsWith('gallery_id')) return compileXQuery(1, true);
    if (type == 'random' || myURL.params.sf.startsWith("random")) return compileQuery(type);

    let prevUrl = getSearchPrefix();
    const dir = (myURL.params.sd == 'asc' ^ type == 'prev') ? 'gt' : 'lt';
    const sd = (myURL.params.sd == 'asc' ^ type == 'prev') ? 'asc' : 'desc';
    const cscore = settings.pregain ? preparam[myURL.params.sf] : gainParams();
    const idPart = `id.${dir}:${id}`;
    const sf = myURL.params.sf == 'first_seen_at' ? 'first_seen_at' : 'created_at';
    const common = ['score', 'width', 'height', 'comments', 'tag_count'];

    if (common.includes(myURL.params.sf)) {
      prevUrl += `(${sfToFunction[myURL.params.sf]}:${cscore},${idPart})`;
    } else if (myURL.params.sf == "created_at" && type != "find") {
      prevUrl += `(${idPart})`;
    } else if (myURL.params.sf == "first_seen_at") {
      prevUrl += `(first_seen_at.${dir}:${cscore})`;
    }

    prevUrl += `&perpage=1&sf=${sf}&sd=${sd}`;

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
      const cscore = (settings.pregain ? preparam[myURL.params.sf] : gainParams()) + d;
      const dir = (myURL.params.sd == 'asc' ^ type == 'prev') ? 'gt' : 'lt';
      const sd = (myURL.params.sd == 'asc' ^ type == 'prev') ? 'asc' : 'desc';
      const idPart = `id.${dir}:${id}`;
      const sf = sfToFunction[myURL.params.sf];
      prevUrl += `((${sf}:${cscore},${idPart})+||+(${sf}.${dir}:${cscore}))`;

      prevUrl += `&perpage=3&sf=${myURL.params.sf}&sd=${sd}`;
    }
    else prevUrl+='&perpage='+(myURL.params.sf.startsWith('random')?4:3)+'&sf=random';
    debug('SSF','Query: query '+prevUrl,0);
    return prevUrl;
  }

  function compileLtQuery(page) {
    let prevUrl = getSearchPrefix();
    const dir = ((myURL.params.sd!='asc')?'gt':'lt');
    const sd = ((myURL.params.sd!='asc')?'asc':'desc');
    const sff = sfToFunction[myURL.params.sf];
    const sf = sff ? myURL.params.sf : 'created_at';
    const cscore = settings.pregain ? preparam[myURL.params.sf] : gainParams();

    if (sff) {
      prevUrl += `(${sff}.${dir}:${cscore})`;
    } else {
      prevUrl += `(id.${dir}:${id})`;
    }

    prevUrl += `&page=${page}&perpage=50&sf=${myURL.params.sf}&sd=${sd}`;
    if (myURL.params.del) prevUrl += `&del=${myURL.params.del}`;
    debug('SSF','Gaining offset pagination query: page '+page+', query '+myURL.params.q,0);
    return prevUrl;
  }

  // find
  function compileXQuery(page, pp) {
    const sff = sfToFunction[myURL.params.sf] || (myURL.params.sf && myURL.params.sf.startsWith('gallery_id'));
    const sf = sff ? myURL.params.sf : 'created_at';

    debug('SSF','Pagination query: page '+page+', query '+myURL.params.q+', sort '+sf,0);
    return '/search' + (pp?'.json':'') + '?q=' + myURL.params.q + (pp?'&perpage=50':'') + '&sf=' + sf + '&sd='+
            (myURL.params.sd || '') + '&page=' + page + (myURL.params.del ? '&del='+myURL.params.del : '');
  }

  function crLink(sel, level, type) {
    if (myURL.params.sf == 'first_seen_at' && !first_seen) setTimeout(crLink, 10, sel, level, type);
    else {
      if (myURL.params.sf == 'first_seen_at' && type != 'find') request(compilePreQuery(type, first_seen), sel, type, 'post');
      else request(compilePreQuery(type), sel, type, (myURL.params.sf == 'created_at' && type != "find"?'post':level));
    }
  };

  function fetchFirstSeen(id) {
    fetchJson('GET', '/'+id+'.json')
    .then(response => response.json())
    .then(response => {
      first_seen = response.first_seen_at;
      preparam.first_seen_at = first_seen;
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
    document.querySelector('form.header__search').classList.add('dropdown');
    document.querySelector('form.header__search').appendChild(
      createElement('span.dropdown__content',{style:{position:'static',minWidth:0,zIndex:1}},[
        createElement('select#_ydb_s_qpusher_sf.input.header__input',{name:'sf', size:1},[
          createElement('option',{value:'created_at'},'created_at'),
          createElement('option',{value:'updated_at'},'updated_at'),
          createElement('option',{value:'first_seen_at'},'first_seen_at'),
          createElement('option',{value:'score'},'score'),
          createElement('option',{value:'wilson'},'wilson'),
          createElement('option',{value:'relevance'},'relevance'),
          createElement('option',{value:'width'},'width'),
          createElement('option',{value:'height'},'height'),
          createElement('option',{value:'comments'},'comments'),
          createElement('option',{value:'tag_count'},'tag_count'),
          createElement('option',{value:'random'},'random'),
        ]),
        createElement('select#_ydb_s_qpusher_sd.input.header__input',{name:'sd', size:1},[
          createElement('option',{value:'desc'},'desc'),
          createElement('option',{value:'asc'},'asc')
        ])
      ]));
    if (withup) {
      document.querySelector('form.header__search').insertBefore(
        createElement('a#_ydb_s_finder.header__link.header__search__button',{title:'Find this image position in entered query', style:{height:'28px',padding:0}}, [
          createElement('i.fa', '\uF03C')
        ]), document.querySelector('form.header__search>a.header__search__button'));

      document.querySelector('form.header__search').insertBefore(
        createElement('a#_ydb_s_qpusher.header__link.header__search__button',{title:'Push search query to url bar', style:{height:'28px',padding:0}, href:location.href}, [
          createElement('i.fa.fa-arrow-up')
        ]),document.querySelector('form.header__search>a.header__search__button'));

      document.getElementById('_ydb_s_qpusher').hash = '';
    }

    if (myURL.params.sf && myURL.params.sf.startsWith('gallery_id'))
      addElem('option',{value:myURL.params.sf, innerHTML:'gallery'},document.getElementById('_ydb_s_qpusher_sf'));
    if (!myURL.params.sf) myURL.params.sf = 'created_at';
    if (!myURL.params.sd) myURL.params.sd = 'desc';
    let x = myURL.params.sf;
    if (myURL.params.sf && myURL.params.sf.startsWith('gallery_id')) x = 'gallery_id';
    if (myURL.params.sf && myURL.params.sf.startsWith('random')) x = 'random';
    if (myURL.params.sf && document.querySelector('#_ydb_s_qpusher_sf *[value*='+x+']'))
      document.querySelector('#_ydb_s_qpusher_sf *[value*='+x+']').selected = 'selected';
    if (myURL.params.sd && document.querySelector('#_ydb_s_qpusher_sd *[value='+myURL.params.sd+']'))
      document.querySelector('#_ydb_s_qpusher_sd *[value='+myURL.params.sd+']').selected = 'selected';

    let chall = () => {
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
      document.getElementById('_ydb_s_qpusher').search = s.replace(/%2B/g, '+');
    };

    if (document.getElementById('_ydb_s_qpusher'))
      setTimeout(() => {
        document.querySelector('form.header__search .input').addEventListener('input', chall);
        document.querySelector('#_ydb_s_qpusher_sf').addEventListener('input', chall);
        document.querySelector('#_ydb_s_qpusher_sd').addEventListener('input', chall);
        if (document.querySelector('#del')) document.querySelector('#del').addEventListener('input', chall);
      }, 200);

    //fetching tags
    let t = document.querySelectorAll('.tag.dropdown');
    for (let j=0; j<t.length; j++) {
      t[j].getElementsByClassName('dropdown__content')[0].appendChild(
        createElement('span.tag__dropdown__link', {dataset: {tag: t[j].dataset.tagName}},[
          createElement('a', {style:{cursor:'pointer'}, events:{click: (e) => {
            document.querySelector('form.header__search .input').value = e.target.parentNode.dataset.tag;
            chall();
          }}}, 'Set query '),
          createElement('a', {style:{cursor:'pointer'}, events:{click: (e) => {
            const elem = document.querySelector('form.header__search .input');
            elem.value += (elem.value.trim? ',' : '') + e.target.parentNode.dataset.tag;
            chall();
          }}},'[+]')
        ])
      );
    }

    if (document.getElementById('_ydb_s_finder')) document.getElementById('_ydb_s_finder').addEventListener('click', (e) => {
      commonClickAction(e);
      myURL = parseURL(document.getElementById('_ydb_s_qpusher').href);
      crLink('#_ydb_s_finder', 'act', 'find');
    });
  }


  ////////////////////////////////

  function execute() {
    if (!myURL.params.sf.startsWith('random')) {
      crLink('.js-prev', 'pre', 'prev');
      crLink('.js-next', 'pre', 'next');
    }
    if (settings.randomButton || myURL.params.sf.startsWith('random')) {
      crLink('.js-rand', 'post', 'random');
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
  }
  else {
    try {
      let settings2 = JSON.parse(localStorage._ssf);
      if (!settings2.pregain) {
        settings2.pregain = true;
        localStorage._ssf = JSON.stringify(settings2);
      }
      settings = settings2;
    }
    catch(e) {
      localStorage._ssf = JSON.stringify(settings);
    }
  }
  if (settings.first_seen_at === undefined) settings.first_seen_at = true;
  register();
  let myURL = parseURL(location.href);
  let id = parseInt(myURL.path.slice(1));

  if (isNaN(id)) {
    id = myURL.path.split('/');
    if (id[1] == 'images') id = parseInt(id[2]);
  }

  pushQuery(!isNaN(id));
  if (!isNaN(id) && settings.pregain) preparam = gainParams(true);
  
  if (
    !philomena &&
    !isNaN(id) &&
    myURL.params.sf &&
    !(myURL.params.sf == 'created_at' && !myURL.params.del) &&
    myURL.params.sf != 'wilson' &&
    myURL.params.sf != 'updated_at' &&
    myURL.params.sf != 'relevance' &&
    !(myURL.params.sf == 'score' && !settings.score) &&
    !(myURL.params.sf == 'comments' && !settings.comments) &&
    !(myURL.params.sf == 'first_seen_at' && !settings.first_seen_at) &&
    !(myURL.params.sf == 'tag_count' && !settings.tag_count) &&
    !(myURL.params.sf.startsWith('random') && !settings.random) &&
    !(myURL.params.sf.startsWith('gallery_id') && !settings.gallery) &&
    !((myURL.params.sf == 'width' || myURL.params.sf == 'height') && !settings.sizes)
  ) {
    if (!(myURL.params.sf.startsWith('gallery_id'))) myURL.params.sf = myURL.params.sf.split('%')[0];
    if (myURL.params.sf == 'first_seen_at') fetchFirstSeen(id);
    if (settings.preloading) execute();
    else {
      const random = myURL.params.sf.startsWith('random');

      document.querySelectorAll('.js-next')[0].addEventListener('click',(e) => {
        commonClickAction(e);
        crLink('.js-next', random?'post':'pre', random?'random':'next');
      });
      document.querySelectorAll('.js-prev')[0].addEventListener('click',(e) => {
        commonClickAction(e);
        crLink('.js-prev', random?'post':'pre', random?'random':'prev');
      });
      document.querySelectorAll('.js-rand')[0].addEventListener('click',(e) => {
        commonClickAction(e);
        crLink('.js-rand', 'post', 'random');
      });
    }
  }

  if (!isNaN(id) && (
    (myURL.params.sf == 'score' && settings.scoreUp) ||
    (myURL.params.sf == 'comments' && settings.comments) ||
    (myURL.params.sf == 'first_seen_at' && settings.first_seen_at) ||
    (myURL.params.sf && myURL.params.sf.startsWith('gallery_id') && settings.gallery) ||
    ((myURL.params.sf == 'width' || myURL.params.sf == 'height') && settings.sizesUp) ||
    (( (!myURL.params.sf && myURL.params.q && myURL.params.q != '%2A')
      || myURL.params.sf == 'wilson' || myURL.params.sf == 'created_at' || myURL.params.sf == 'updated_at' || myURL.params.sf == 'tag_count' || (myURL.params.sf && myURL.params.sf.startsWith('random')) || myURL.params.sf == 'relevance') && settings.everyUp)
  )) {
    document.querySelectorAll('.js-up')[0].addEventListener('click',(e) => {
      commonClickAction(e);
      crLink('.js-up', 'act', 'find');
    });
  }
})();
