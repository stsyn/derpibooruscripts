// ==UserScript==
// @name         YourBooru:Tools
// @namespace    http://tampermonkey.net/
// @version      0.8.13
// @description  Some UI tweaks and more
// @author       stsyn

// @include      /http[s]*:\/\/(www\.|philomena\.|)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/adverts\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*\.json.*/

// @require      https://raw.githubusercontent.com/blueimp/JavaScript-MD5/master/js/md5.min.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/CreateElement.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/tagDB0.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/badgesDB0.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0UW.lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/DerpibooruImitation0UW.js
// /require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/DerpibooruCSRFPatch.lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @grant        unsafeWindow
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';
  let scriptId = 'tools';
  try {if (unsafeWindow._YDB_public.settings[scriptId] != undefined) return;}
  catch(e){}
  let sversion = GM_info.script.version;


  if (!document.getElementById('burger')) return;

  /////////// DEFINITION
  let processing = {};
  let result;
  let version = 0;
  let artists = [];
  const bps = ['princess luna','tempest shadow','starlight glimmer','rarity','oc:blackjack','princess celestia'];
  const sps = [{name:'solo',image:'https://derpicdn.net/img/view/2016/8/22/1231050.png'},
             {name:'patreon preview',image:'https://derpicdn.net/img/view/2016/6/3/1169448.png'},
             {name:'80s',image:'https://derpicdn.net/img/view/2016/5/5/1147241.png'},
             {name:'op is trying to start shit',image:'https://derpicdn.net/img/view/2015/8/28/967369.jpg'},
             {name:'twilight sparkle (alicorn)',image:'https://derpicdn.net/img/view/2014/12/1/776065.png'},
             {name:'milf',image:'https://derpicdn.net/img/view/2013/9/21/431956.png'},
             {name:'canon x oc',image:'https://derpicdn.net/img/view/2013/7/20/379005.png'},
             {name:'simple background',image:'https://derpicdn.net/img/view/2013/5/6/317918.png'},
             {name:'bad dragon',image:'https://derpicdn.net/img/view/2013/4/24/307465.png'},
             {name:'bedroom eyes',image:'https://derpicdn.net/img/view/2013/4/23/305990.png'},
             {name:'edit',image:'https://derpicdn.net/img/view/2013/4/22/305629.png'},
             {name:'artist:hoihoi',image:'https://derpicdn.net/img/view/2013/4/21/303903.png'},
             {name:'crotchboobs',image:'https://derpicdn.net/img/view/2013/4/22/305692.png'},
             {name:'foot fetish',image:'https://derpicdn.net/img/view/2013/4/20/303577.png'}
            ];
  const best_pony_for_today = bps[parseInt(Math.random()*Math.random()*bps.length)];
  const spoiler_for_today = sps[parseInt(Math.random()*sps.length)];
  const hidden = {
    normal:[
      {
        big:'https://derpicdn.net/img/view/2017/10/23/large.png',
        small:'https://derpicdn.net/img/2017/10/23/1568696/medium.png'
      }
    ],
    pony:[
      {
        big:'https://derpicdn.net/img/2012/11/24/161576/large.png',
        small:'https://derpicdn.net/img/2012/11/24/161576/medium.png'
      }
    ]
  };
  const debug = function(id, value, level) {
    try {unsafeWindow._YDB_public.funcs.log(id, value, level);}
    catch(e) {
      console.log('[' + ['.', '?', '!'][level] + '] [' + id + '] ' + value);
      if (level == 2) console.trace();
    }
  };
  const css = {
    general:`body[data-theme*=dark] ._ydb_green{background:#5b9b26;color:#e0e0e0!important}
body ._ydb_green{background:#67af2b!important;color:#fff!important}
body[data-theme*=dark] ._ydb_orange{background:#8b5b26;color:#e0e0e0!important}
body ._ydb_orange{background:#9f6f2b!important;color:#fff!important}._ydb_t_patched{overflow-y:hidden}
.ydb_t_block.block__content:not(.hidden){display:block}body[data-theme*=dark] .spoiler ._ydb_greentext{color:#782c21}
body[data-theme*=dark] ._ydb_greentext,body[data-theme*=dark] .spoiler-revealed ._ydb_greentext,body[data-theme*=dark] .spoiler:hover ._ydb_greentext{color:#66e066}
.spoiler ._ydb_greentext{color:#e88585}._ydb_greentext,.spoiler-revealed ._ydb_greentext,.spoiler:hover ._ydb_greentext{color:#0a0}`,
    bigSearch:`header ._ydb_t_textarea{resize:none;overflow:hidden;line-height:2em;white-space:pre}
header ._ydb_t_textarea:focus{max-width:calc(100vw - 350px);margin-top:1.5em;overflow:auto;position:absolute;width:calc(100vw - 350px);height:5em;z-index:5;white-space:pre-wrap}
#searchform textarea{min-width:100%;max-width:100%;min-height:2.4em;line-height:1.5em;height:7em}`
  }

  let tagDB = {
    normal:{
      character:["twilight sparkle","rainbow dash","pinkie pie","fluttershy","rarity","applejack","princess luna","princess celestia","spike","trixie","derpy hooves","scootaloo",
                 "sweetie belle","sunset shimmer","apple bloom","vinyl scratch","starlight glimmer","queen chrysalis","dj pon-3","princess cadance","discord","lyra heartstrings",
                 "big macintosh","octavia melody","shining armor","nightmare moon","sci-twi","bon bon","sweetie drops","soarin'","spitfire","sonata dusk","king sombra","maud pie",
                 "adagio dazzle","flash sentry","doctor whooves","time turner","cheerilee","diamond tiara","gilda","angel bunny","aria blaze","zecora","silver spoon","royal guard",
                 "berry punch","berryshine","braeburn","daring do"],
      'content-official':["equestria girls","rainbow rocks","my little pony: the movie","friendship games","legend of everfree"],
      'content-fanmade':["fallout equestria"],
      error:["artist needed","source needed","dead source","useless source url"],
      oc:["oc","oc only"],
      origin:["screencap","edit","edited screencap","derpibooru exclusive","alternate version","color edit"],
      rating:["safe","explicit","questionable","suggestive","grimdark","semi-grimdark", "grotesque"],
      spoiler:[]},
    regulars:{oc:/^oc:/g,origin:/^(artist:|editor:|colorist:)/g,spoiler:/^spoiler:/g,'content-fanmade':/^(comic:|fanfic:|artpack:|tumblr:)/g},list:{oc:[],origin:[]}
  };
  function _getTagDB() {
    try {
      tagDB = getTagDB();
      colorTags();
    }
    catch(e) {setTimeout(_getTagDB,500);}
  }
  _getTagDB();

  function write(ls2) {
    localStorage._ydb_tools = JSON.stringify(ls2);
  }

  function register() {
    GM_addStyle(css.general);
    if (!unsafeWindow._YDB_public) unsafeWindow._YDB_public = {};
    if (!unsafeWindow._YDB_public.settings) unsafeWindow._YDB_public.settings = {};
    unsafeWindow._YDB_public.settings.tools = {
      name:'Tools',
      container:'_ydb_tools',
      link:'/meta/youboorutools-0524-everything-what-you-ever-imagined-and-even-more',
      version:sversion,
      s:[
        {type:'header', name:'Notifications'},
        {type:'checkbox', name:'Reset', parameter:'reset'},
        {type:'checkbox', name:'Force hiding (Ignorantia non est argumentum!)', parameter:'force'},
        {type:'header', name:'UI'},
        {type:'checkbox', name:'Bigger search fields', parameter:'patchSearch'},
        {type:'breakline'},
        {type:'checkbox', name:'Deactive downvote if upvoted (and reverse)', parameter:'deactivateButtons'},
        {type:'breakline'},
        {type:'checkbox', name:'Hide images immediately', parameter:'fastHide'},
        {type:'breakline'},
        {type:'checkbox', name:'Old headers style', parameter:'oldHead'},
        {type:'breakline'},
        {type:'checkbox', name:'Hide obvious badges', parameter:'hideBadges'},
        {type:'checkbox', name:' and not really obvious', parameter:'hideBadgesX'},
        {type:'checkbox', name:' and donation based implications', parameter:'hideBadgesP'},
        {type:'breakline'},
        {type:'checkbox', name:'Compact image spoiler in posts', parameter:'smallerSpoilers'},
        {type:'breakline'},
        {type:'input', name:'Shrink comments and posts longer than (px)', parameter:'shrinkComms', validation:{type:'int',min:280, default:500}},
        {type:'breakline'},
        {type:'checkbox', name:'Button to shrink expanded posts', parameter:'shrinkButt'},
        {type:'breakline'},
        {type:'checkbox', name:'Greentext (don\'t tell TSP about it)', parameter:'greenText',eventsI:{change:function (e) {
          if ((document.body.dataset.userName == 'The Frowning Pony') || (document.body.dataset.userName == 'The Smiling Pony')) {
            alert(errorMessages[errorLog++%errorMessages.length]);
            e.target.checked = false;
          }
        }}},
        {type:'breakline'},
        {type:'checkbox', name:'Use endless related images search', parameter:'similar'},
        {type:'breakline'},
        {type:'header', name:'Custom spoilers'},
        {type:'button', name:'Enforce update', action:function() {
          localStorage._ydb_tools_ctags = '[]';
          customSpoilerCheck(true, ls.spoilers);
        }
        },
        {type:'breakline'},
        {type:'breakline'},
        {type:'text', name:'Spoiler', styleS:{width:'30%', textAlign:'center',display:'inline-block'}},
        {type:'text', name:'Image URL', styleS:{width:'70%', textAlign:'center',display:'inline-block'}},
        {type:'array', parameter:'spoilers', addText:'Add', customOrder:false, s:[
          [
            {type:'input', name:'', parameter:'name',styleI:{width:'calc(35% - 5.7em)'},validation:{type:'unique'}},
            {type:'input', name:'', parameter:'image',styleI:{width:'65%'}}
          ]
        ], template:{name:spoiler_for_today.name,image:spoiler_for_today.image, w:false}},
        {type:'breakline'},
        {type:'header', name:'Tag aliases'},
        {type:'checkbox', name:'Show actual query in page header', parameter:'oldName'},
        {type:'checkbox', name:'As short queries as possible', parameter:'compress', styleS:{display:'none'}},
        {type:'breakline'},
        {type:'breakline'},
        {type:'text', name:'Aliase', styleS:{width:'30%', textAlign:'center',display:'inline-block'}},
        {type:'text', name:'Original tag', styleS:{width:'70%', textAlign:'center',display:'inline-block'}},
        {type:'array', parameter:'aliases', addText:'Add', customOrder:false, s:[
          [
            {type:'input', name:'', parameter:'a',styleI:{width:'calc(40% - 10px - 12.25em)'},validation:{type:'unique'}},
            {type:'textarea', name:'', parameter:'b',styleI:{width:'60%'}},
            {type:'input', name:'', parameter:'c',styleI:{display:'none'}},
            {type:'checkbox', name:'As watchlist', parameter:'w'}
          ]
        ], template:{a:'best_pony',b:best_pony_for_today, w:false}},
        {type:'breakline'},
        {type:'header', name:'Shortcuts'},
        {type:'breakline'},
        {type:'text', name:'Name', styleS:{width:'30%', textAlign:'center',display:'inline-block'}},
        {type:'text', name:'Actual link', styleS:{width:'70%', textAlign:'center',display:'inline-block'}},
        {type:'array', parameter:'shortcuts', addText:'Add', customOrder:false, s:[
          [
            {type:'input', name:'', parameter:'name',styleI:{width:'calc(40% - 10px - 5em)'}},
            {type:'input', name:'', parameter:'link',styleI:{width:'60%'}},
          ]
        ], template:{name:'Somepony is watching you',link:'/search?q=looking+at+you%2C+score.gte%3A100&random_image=y&sd=desc&sf=created_at'}},
      ],
      onChanges:{
        spoilers:{
          _:function(module,data, cb) {
            customSpoilerCheck(true, data);
          }
        },
        aliases:{
          _:function(module,data, cb) {
            data.forEach( d => {
              if (d.changed) {
                d.changed = false;
                if (d.w) {
                  unsafeWindow._YDB_public.handled++;
                  let t = createElement('div', [
                    createElement('h1'),
                    createElement('div.wallcontainer'),
                    createElement('div.walloftext')
                  ]);
                  t = unsafeWindow._YDB_public.funcs.callWindow([t]);
                  processing[d.a] = true;
                  YB_checkList(d, t);
                  let process = () => {
                    if (!processing[d.a]) {
                      d = result;
                      unsafeWindow._YDB_public.handled--;
                      t.classList.add('hidden');
                    }
                    else setTimeout(process, 100);
                  };
                  process();
                }
              }
            });
          },
          b:function(m, el, cb) {
            m.changed = true;
          },
          w:function(m, el, cb) {
            if (el.checked) m.changed = true;
          }
        }
      }
    };
    unsafeWindow._YDB_public.settings.toolsUB = {
      name:'Tools (Userbase debug page)',
      container:'_ydb_toolsUBLocal',
      version:sversion,
      link:'/pages/api?usersDebug'
    };
    if (unsafeWindow._YDB_public.funcs == undefined) unsafeWindow._YDB_public.funcs = {};
    unsafeWindow._YDB_public.funcs.tagAliases = tagAliases;
    unsafeWindow._YDB_public.funcs.tagComplexParser = goodParse;
    unsafeWindow._YDB_public.funcs.tagSimpleParser = simpleParse;
    unsafeWindow._YDB_public.funcs.tagComplexCombine = goodCombine;
    unsafeWindow._YDB_public.funcs.tagSimpleCombine = simpleCombine;
    unsafeWindow._YDB_public.funcs.searchForDuplicates = searchForDuplicates;
    unsafeWindow._YDB_public.funcs.compactURL = compactURL;
    unsafeWindow._YDB_public.funcs.upvoteDownvoteDisabler = (elem, inital) => {
      commentButtons(elem, inital);
      deactivateButtons(elem, inital);
      hiddenImg(elem, inital);
    };
  }

  function isThisImage() {
    return ((parseInt(location.pathname.slice(1))>=0 && !location.pathname.split('/')[2]) ||
            (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0 && !location.pathname.split('/')[3]));
  }

  function writeDate(date) {
    let m = ['January','February','March','April','May','June','July','August','September','October','Novermber','December'];
    return (''+date.getHours()).padStart(2, '0')+':'+
           (''+date.getMinutes()).padStart(2, '0')+', '+
           m[date.getMonth()]+' '+
           (''+date.getDate()).padStart(2, '0')+', '+
           date.getFullYear()
  }

  //reader
  let ls, fl;
  let svd = localStorage._ydb_tools;
  try {
    ls = JSON.parse(svd);
    fl = ls.hidden;
    if (ls.hidden == undefined || ls.reset) {
      ls.hidden = {};
      fl = ls.hidden;
      ls.reset = false;
      write(ls);
    }
  }
  catch (e) {
    ls = {};
    ls.hidden = {};
    ls.force = false;
    ls.reset = false;
    ls.version = version;
    fl = ls.hidden;
  }
  register();
  if (ls.patchSearch === undefined) {
    ls.patchSearch = true;
    write(ls);
  }
  if (ls.smallerSpoilers === undefined) {
    ls.smallerSpoilers = true;
    write(ls);
  }
  if (ls.version === undefined) {
    ls.version = version;
    write(ls);
  }
  if (ls.shrinkComms === undefined) {
    ls.shrinkComms = 500;
    write(ls);
  }
  if (ls.fastHide === undefined) {
    ls.fastHide = true;
    write(ls);
  }
  if (ls.oldHead === undefined) {
    ls.oldHead = true;
    write(ls);
  }
  if (ls.hideBadges === undefined) {
    ls.hideBadges = true;
    ls.hideBadgesX = false;
    write(ls);
  }

  if ((document.body.dataset.userName == 'The Frowning Pony') || (document.body.dataset.userName == 'The Smiling Pony')) {
    ls.greenText = false;
    localStorage._fucken_grin_ = 'caught';
    write(ls);
  }
  else if (localStorage._fucken_grin_ == 'caught' && ls.greenText) {
    alert('It\'s still you? :P');
    ls.greenText = false;
    write(ls);
  }
  if (ls.greenText === undefined) {
    ls.greenText = true;
    if (localStorage._fucken_grin_ == 'caught') ls.greenText = false;
    write(ls);
  }
  let errorMessages = ['Nope', 'Nope', 'N-nope!', 'Stahp it', 'You don\'t want it', 'Go ewey', 'ples', 'Look, I don\'t want permaban, so, stop it c:', 'Plz', ':c', 'why u so bad?'];
  let errorLog = 0;

  /*/////////////////////////////////////////////////

    ACTUAL CODE

    /////////////////////////////////////////////////*/


  //flashes
  function flashNotifies() {
    if (document.getElementsByClassName('flash--site-notice').length == 0) {
      ls.hidden = {};
      write(ls);
    }
    for (let i=0; i<document.getElementsByClassName('flash--site-notice').length; i++) {
      let e = document.getElementsByClassName('flash--site-notice')[i];
      let z = md5(e.innerHTML);
      if (fl[z] == '1' || ls.force)
        e.style.display = 'none';
      else {
        e.appendChild(InfernoAddElem('a', {style:{float:'right'}, innerHTML:'[X]', href:'#', events:{
          'click':() => {
            e.style.display = 'none';
            fl[z] = '1';
            write(ls);
            return false;
          }
        }}, []));
      }
    }
  }

  //links at profile and other
  function profileLinks() {
    for (let i=0; i<document.getElementsByClassName('block').length; i++) {
      let e = document.getElementsByClassName('block')[i];
      if (e.getElementsByClassName('block__header__title').length == 0) continue;
      let h = e.getElementsByClassName('block__header__title')[0].innerHTML;
      if (h == 'Recent Uploads' || h == 'Recent Favourites' || h == 'Recent Artwork' || h == 'Watched Images') {
        for (let j=0; j<e.querySelectorAll('.image-container a').length; j++) {
          let a = e.querySelectorAll('.image-container a')[j];
          if (a.search == '' || a.search == '?') a.search = e.querySelector('.block__header a').search;
        }
      }
    }
  }

  //bigger search fields
  function bigSearch() {
    GM_addStyle(css.bigSearch);
    let x = [document.getElementsByClassName('header__input--search')[0], document.querySelector('.js-search-form input')];
    let x2 = [document.getElementsByClassName('header__search__button')[0], document.querySelector('form#searchform[action*="/search"] button[type="submit"]')];
    for (let i=0; i<x.length; i++) {
      if (x[i] == null) return;

      x[i].parentNode.insertBefore(InfernoAddElem('textarea', {
        value:x[i].value,
        className:x[i].className+' _ydb_t_textarea',
        name:x[i].name,
        placeholder:x[i].placeholder,
        autocapitalize:x[i].autocapitalize,
        title:x[i].title,
        events:{
          keypress:(e) => {
            if (e.keyCode == 13) {
              e.preventDefault();
              x2[i].click();
            }
          }
        }
      }, []), x[i]);
      x[i].parentNode.removeChild(x[i]);
    }
  }

  //tag tools
  function simpleParse(x) {
    return x.replace(/(\|\|| OR | AND | \&\&)/g, ',').split(',').map(y => y.trim());
  }

  function goodParse(x) {
    let yx = {};
    yx.orig = x;
    x = x.replace(/\|\|/g, ', ');
    x = x.replace(/\&\&/g, ', ');
    x = x.replace(/^\(/g, ' ');
    x = x.replace(/^(\s*)(\()/g, '$1 ');
    x = x.replace(/(\))(\s*)$/g, ' $2');
    while (/(,\s*)(\()/g.test(x)) x = x.replace(/(,\s*)(\()/g, '$1 ');
    while (/(\))(\s*,)/g.test(x)) x = x.replace(/(\))(\s*,)/g, ' $2');
    x = x.replace(/^\-/g, ' ');
    x = x.replace(/^\!/g, ' ');
    x = x.replace(/([ ,])\-/g, '$1 ');
    x = x.replace(/([ ,])!/g, '$1 ');
    x = x.replace(/\"/g, ' ');
    x = x.replace(/\~/g, ',');
    x = x.replace(/\^/g, ',');
    x = x.replace(/ OR /g, ',   ');
    x = x.replace(/ AND /g, ',    ');
    x = x.replace(/ NOT /g, ',    ');
    x = x.replace(/^NOT /g, '    ');
    let y = x.split(',');
    let afix = 0;
    for (let i=0; i<y.length; i++) {
      let tag = {};
      tag.offset = afix;
      tag.length = y[i].length;
      afix+=1+y[i].length;
      let s1 = y[i].replace(/^ +/g,'');
      tag.offset += y[i].length-s1.length;
      tag.length -= y[i].length-s1.length;
      let s2 = s1.replace(/ +$/g,'');
      tag.length -= s1.length-s2.length;
      tag.v = s2;
      y[i] = tag;
    }
    yx.temp = x;
    yx.tags = y;
    return yx;
  }

  function goodCombine(yx) {
    let pos = 0, ns = '';
    for (let i=0; i<yx.tags.length; i++) {
      ns += yx.orig.substring(pos,yx.tags[i].offset);
      pos += (yx.tags[i].offset - pos) + yx.tags[i].length;
      ns += yx.tags[i].v;
    }
    ns += yx.orig.substring(pos);
    return ns;
  }

  function simpleCombine(y, separator) {
    if (!separator) separator = ' OR ';
    let s = '';
    for (let i=0; i<y.length; i++) s += y[i] + (i<y.length-1?separator:'');
    return s;
  }

  function searchForDuplicates(a) {
    return a.filter((a, c, d) => {
      return d.indexOf(a) === c
    })
  }

  function readTagTools() {
    let svd = localStorage._ydb_tagtools;
    try {svd = JSON.parse(svd);}
    catch(e) {svd = {};}
    return svd;
  }

  function writeTagTools(svd) {
    localStorage._ydb_tagtools = JSON.stringify(svd);
  }

  function getTimestamp() {
    return parseInt(Date.now()/1000);
  }

  function checkAliases() {
    let data = readTagTools();
    for (let i in data) {
      if (!data[i].t) data[i].t = getTimestamp();
      if (data[i].t+3600<getTimestamp()) {
        delete data[i];
        continue;
      }
    }
    writeTagTools(data);
  }

  function legacyTagAliases(original) {
    let getYesterdayQuery = function(param) {
      let date = new Date(Date.now()-param*24*60*60*1000);
      let c = '(';
      let cc = 'created_at:';
      c += cc + date.getFullYear() + '-' + (date.getMonth()+1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
      return c+')';
    };

    let getYearsQuery = (param) => {
      const date = new Date(Date.now()-param*24*60*60*1000);
      let c = '(';
      const cc = 'created_at:';
      const dateString = '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');

      for (let i = date.getFullYear() - 1; i>2011; i--) {
        if (date.getMonth() == 1 && date.getDate() == 29 && i % 4 != 0) continue;
        c += (c === '(' ? '' : ' || ') + cc + i + dateString;
      }

      return c+')';
    };

    let getYearsAltQuery = (param) => {
      const date = new Date(Date.now()-param*24*60*60*1000);
      let c = '(';
      const cc = 'first_seen_at:';
      const dateString = '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');

      for (let i = date.getFullYear() - 1; i>2011; i--) {
        if (date.getMonth() == 1 && date.getDate() == 29 && i % 4 != 0) continue;
        c += (c === '(' ? '' : ' || ') + cc + i + dateString;
      }

      return c+')';
    };

    let spoileredQuery = function() {
      if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList == undefined) return;
      let tl = JSON.parse(document.getElementsByClassName('js-datastore')[0].dataset.spoileredTagList);
      let tags = tl.reduce(function(prev, cur, i, a) {
        if (localStorage['bor_tags_'+cur] == undefined) return prev;
        let tname = JSON.parse(localStorage['bor_tags_'+cur]).name;
        let quotes = (/(\(|\))/.test(tname)?'"':'');
        return prev + quotes + tname + quotes + (i+1 == a.length?'':' || ');
      }, '');
      if (document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter != "") tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.spoileredFilter;
      tags = '('+tags+')';
      return tags;
    };

    function hiddenQuery() {
      if (document.getElementsByClassName('js-datastore')[0].dataset.hiddenTagList == undefined) return;
      let tl = JSON.parse(document.getElementsByClassName('js-datastore')[0].dataset.hiddenTagList);
      let tags = tl.reduce(function(prev, cur, i, a) {
        if (localStorage['bor_tags_'+cur] == undefined) return prev;
        let tname = JSON.parse(localStorage['bor_tags_'+cur]).name;
        let quotes = (/(\(|\))/.test(tname)?'"':'');
        return prev + quotes + tname + quotes + (i+1 == a.length?'':' || ');
      }, '');
      if (document.getElementsByClassName('js-datastore')[0].dataset.hiddenFilter != "") tags += ' || '+document.getElementsByClassName('js-datastore')[0].dataset.hiddenFilter;
      tags = '('+tags+')';
      return tags;
    }

    if (original.startsWith('__ydb')) {
      let param = 0;
      if (!isNaN(parseInt(original.split(':')[1]))) param = parseInt(original.split(':')[1]);
      if (original.startsWith('__ydb_lastyearsalt')) original = getYearsAltQuery(param);
      else if (original.startsWith('__ydb_lastyears')) original = getYearsQuery(param);
      else if (original.startsWith('__ydb_spoilered')) original = spoileredQuery();
      else if (original.startsWith('__ydb_hidden')) original = hiddenQuery();
      else if (original.startsWith('__ydb_yesterday')) original = getYesterdayQuery(1);
      else if (original.startsWith('__ydb_daysago')) original = getYesterdayQuery(param);
    }
    return original;
  }

  function compactURL(link) {
    return encodeURIComponent(link.replace(/ /g, '+')).replace(/%2B/g,'+').replace(/%2A/g, '*').replace(/%2C/g, ',').replace(/%3A/g, ':');
  }

  function tagAliases(original, opt) {
    let limit = 8192;
    checkAliases();
    let udata = readTagTools();

    let als = {};
    if (ls.aliases != undefined) ls.aliases.forEach(v => {als[v.a] = v.b});
    let iterations = 0;

    let cycledParse = function(orig) {
      let changed = false;
      let tags = goodParse(orig);
      for (let i=0; i<tags.tags.length; i++) {
        if (als[tags.tags[i].v] != undefined) {
          tags.tags[i].v = '('+als[tags.tags[i].v]+')';
          changed = true;
        }
      }
      let q2 = goodCombine(tags);
      iterations++;
      if (changed && iterations < 16) q2 = cycledParse(q2);
      return q2;
    };

    let artists = function(orig) {
      let tags = goodParse(orig);
      for (let i=0; i<tags.tags.length; i++) {
        if (tags.tags[i].v.startsWith('@')) {
          if (tags.tags[i].v == '@everyone') continue;
          tags.tags[i].v = tags.tags[i].v.replace('@','artist:');
        }
      }
      let q2 = goodCombine(tags);
      return q2;
    };

    const compressSyntax = orig => {
      let q2 = orig.replace(/ \&\& /g, ',');
      q2 = q2.replace(/ \|\| /g, ' OR ');
      while (q2.indexOf(', ')>-1) q2 = q2.replace(/, /g, ',');
      while (q2.indexOf(' ,')>-1) q2 = q2.replace(/ ,/g, ',');
      q2 = q2.replace(/ AND /g, ',');
      q2 = q2.replace(/ NOT /g, ' -');
      q2 = q2.replace(/'^NOT /g, '-');
      q2 = q2.replace(/[ ,\(]!/g, str => str[0]+'-');
      q2 = q2.replace(/^ +/g,'');
      q2 = q2.replace(/ +$/g,'');
      while (q2.indexOf('  ')>-1) q2 = q2.replace(/  /g, ' ');
      return q2;
    };

    let compressAliases = function (orig) {
      /*const tags = goodParse(orig);
      const tt = getTagShortAliases();
      if (!tt) return orig;
      for (let i=0; i<tags.tags.length; i++) {
        if (tt[tags.tags[i].v]) {
          tags.tags[i].v = tt[tags.tags[i].v];
        }
      }
      let q2 = goodCombine(tags);
      return q2;*/
    };

    const compressArtists = orig => {
      let tags = goodParse(orig);
      tags.tags.forEach(tag => {
        if (tag.v.startsWith('artist:')) {
          tag.v = tag.v.replace('artist:','ar*:');
        }
      });
      let q2 = goodCombine(tags);
      return q2;
    };

    const toLowerCase = orig => {
      let tags = goodParse(orig);
      tags.tags.forEach(tag => {
        tag.v = tag.v.toLowerCase();
      });
      let q2 = goodCombine(tags);
      return q2;
    };

    let unspoilTag = function (orig) {
      let nonce;
      if (unsafeWindow._YDB_public.funcs.getNonce == undefined) nonce = 'unsafe_nonce';
      else nonce = unsafeWindow._YDB_public.funcs.getNonce();
      let tags = goodParse(orig);
      for (let i=0; i<tags.tags.length; i++) {
        if (tags.tags[i].v == '__ydb_unspoil') {
          tags.tags[i].v = '!__ydb_unspoil:'+md5(document.body.dataset.userName+nonce+original);
        }
      }
      let q2 = goodCombine(tags);
      return q2;
    };

    let smartLegacy = function (orig) {
      let tags = goodParse(orig);
      for (let i=0; i<tags.tags.length; i++) {
        tags.tags[i].v = legacyTagAliases(tags.tags[i].v);
      }
      let q2 = goodCombine(tags);
      return q2;
    };

    //////////////////////////////////////////////////////

    let q2 = toLowerCase(original);
    let q = cycledParse(q2);
    if (opt.legacy) q = smartLegacy(q);
    q = artists(q);
    if (compactURL(q).length > limit) q = compressSyntax(q);
    //if (compactURL(q).length > limit) q = compressAliases(q);
    if (compactURL(q).length > limit) q = compressArtists(q);
    q = unspoilTag(q);

    if (q!=q2) {
      debug('YDB:T',`Query with length ${original.length} transformed to ${q.length}`,0);
      udata[md5(q)] = {q:original, t:getTimestamp()};
      writeTagTools(udata);
    }
    return q;
  }

  function unspoil(cont) {
    const work = elem => {
      const ux = elem.querySelector('.media-box__overlay.js-spoiler-info-overlay');
      if (ux.innerHTML == '') return;

      let ix = elem.querySelector('video');
      let xx = elem.querySelector('a img');
      let x = elem.querySelector('.image-container');
      let s = JSON.parse(x.getAttribute('data-uris')).thumb;
      if (localStorage.serve_hidpi && !/\.gif$/.test(s) && !/\.webm$/.test(s)) {
        xx.srcset = s + " 1x, " + JSON.parse(x.getAttribute('data-uris')).medium + " 2x";
      }
      if (s.indexOf('.webm')>-1) ux.innerHTML = 'Webm';
      else ux.classList.add('hidden');
      if (ix) {
        ix.classList.remove('hidden');

        let s = document.createElement('source');
        s.src = JSON.parse(x.getAttribute('data-uris')).thumb;
        s.type = 'video/webm';
        ix.appendChild(s);

        xx.classList.add('hidden');
        xx.parentNode.removeChild(xx);
      }
      else {
        xx.src = JSON.parse(x.getAttribute('data-uris')).thumb.replace('.webm','.gif');
      }
      let clone = x.cloneNode(true);
      x.parentNode.replaceChild(clone, x);
    };
    let work2 = function (elem) {
      let ux = elem.querySelector('.block--warning');
      let x = elem.querySelector('.image-show');
      ux.classList.add('hidden');
      x.classList.remove('hidden');
    };
    if (cont) {
      if (cont.querySelectorAll('.media-box').length > 0) {
        for (let i=0; i<cont.querySelectorAll('.media-box').length; i++) {
          work(cont.querySelectorAll('.media-box')[i]);
        }
      }
      else if (cont.classList.contains('image-show-container')) work2(cont);
    }
  }

  //define buttons around search
  function aliases() {
    if (document.querySelector('#searchform > .block .block__header.flex') != undefined) {
      document.querySelector('#searchform > .block .block__header.flex').insertBefore(
        createElement('div.dropdown.block__header__dropdown-tab',[
          createElement('a', 'YDB tags ', [
            createElement('span',{dataset:{clickPreventdefault:true}},[
              createElement('i.fa.fa-caret-down')
            ])
          ]),
          createElement('div.dropdown__content',[
            createElement('a',{dataset:{searchAdd:'__ydb_LastYears:0',searchShowHelp:''}}, 'Created at that day of previous years'),
            createElement('a',{dataset:{searchAdd:'__ydb_LastYearsAlt:0',searchShowHelp:''}}, 'First seen at that day of previous years'),
            createElement('a',{dataset:{searchAdd:'__ydb_Spoilered',searchShowHelp:''}}, 'Spoilered by filter'),
            createElement('a',{dataset:{searchAdd:'__ydb_Hidden',searchShowHelp:''}}, 'Hidden by filter'),
            createElement('a',{dataset:{searchAdd:'__ydb_Unspoil',searchShowHelp:''}}, 'Unspoil result'),
            createElement('a',{dataset:{searchAdd:'__ydb_Yesterday',searchShowHelp:''}}, 'Uploaded yesterday'),
            createElement('a',{dataset:{searchAdd:'__ydb_DaysAgo:2',searchShowHelp:''}}, 'Uploaded X days ago')
          ])
        ]),
        document.querySelector('#searchform > .block .block__header.flex .flex__right'));
    }
    let q = document.getElementsByClassName('header__input--search')[0].value;
    let qc = goodParse(q);
    let data = readTagTools();
    let s = md5(document.getElementsByClassName('header__input--search')[0].value);

    for (let i=0; i<qc.tags.length; i++) {
      if (qc.tags[i].v.startsWith('__ydb_unspoil')) {
        let n = qc.tags[i].v.split(':').pop();
        if (!unsafeWindow._YDB_public.funcs.getNonce) {
          document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--warning', innerHTML:'YDB:Settings 0.9.1+ strongly recommended! Using unsafe nonce.'},[]),document.getElementById('content'));
        }

        let nonce;
        if (!unsafeWindow._YDB_public.funcs.getNonce) nonce = 'unsafe_nonce';
        else nonce = unsafeWindow._YDB_public.funcs.getNonce();

        if (!data[s]) {
          document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--warning', innerHTML:'Query lifetime expired. Please search again.'}),document.getElementById('content'));
          break;
        }

        let hash = md5(document.body.dataset.userName+nonce+data[s].q);
        if (hash != n) {
          document.getElementById('container').insertBefore(InfernoAddElem('div',{className:'flash flash--warning', innerHTML:'Invalid or outdated token!'}),document.getElementById('content'));
          break;
        }
        if (document.getElementsByClassName('js-resizable-media-container')[0]) setTimeout(() => unspoil(document.getElementsByClassName('js-resizable-media-container')[0]), 100);
        else if (document.getElementsByClassName('image-show-container')[0]) unspoil(document.getElementsByClassName('image-show-container')[0]);

      }
    }

    if (data[s]) {
      document.getElementsByClassName('header__input--search')[0].value = data[s].q;
      if (document.querySelector('#imagelist_container .block__header__title') && !ls.oldName) {
        let x = document.querySelector('#imagelist_container .block__header__title').innerHTML;
        x = x.slice(0,14)+data[s].q;
        document.querySelector('#imagelist_container .block__header__title').innerHTML = x;
      }
      if (document.querySelector('.js-search-form .input')) document.querySelector('.js-search-form .input').value = data[s].q;

      data[s].t = getTimestamp();
    }
    let aliaseParse = function(el) {
      el.value = tagAliases(el.value, {legacy:true});
    };

    document.getElementsByClassName('header__search__button')[0].addEventListener('click',() => aliaseParse(document.getElementsByClassName('header__input--search')[0]));
    if (document.querySelector('form#searchform[action*="/search"] button[type="submit"]'))
      document.querySelector('form#searchform[action*="/search"] button[type="submit"]').addEventListener('click',() => aliaseParse(document.querySelector('.js-search-form .input')));
  }

  function asWatchlist() {
    if (ls.aliases) for (let i=0; i<ls.aliases.length; i++) {
      if (ls.aliases[i].w) {
        let s = simpleParse(ls.aliases[i].b);
        let ts = {};
        for (let j=0; j<s.length; j++) {
          ts[s[j]] = true;
        }
        let t = document.querySelectorAll('.tag.dropdown');
        for (let j=0; j<t.length; j++) {
          let isEnabled = false;
          if (ts[t[j].dataset.tagName]) isEnabled = true;
          addElem('a',{
            dataset:{a:ls.aliases[i].a, tag:t[j].dataset.tagName},
            events:{'click':function(e) {
              let d = e.target.dataset;
              let l = JSON.parse(localStorage._ydb_tools);
              for (let k=0; k<l.aliases.length; k++) {
                if (l.aliases[k].a == d.a && l.aliases[k].w) {
                  let s = simpleParse(l.aliases[k].b);
                  for (let j2=0; j2<s.length; j2++) {
                    if (s[j2] == d.tag) {
                      s.splice(j2,1);
                      l.aliases[k].b = simpleCombine(s);
                      write(l);
                      e.target.innerHTML = d.a+' (+)';
                      if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) unsafeWindow._YDB_public.funcs.backgroundBackup();
                      return;
                    }
                  }
                  s.push(d.tag);
                  l.aliases[k].b = simpleCombine(s);
                  write(l);
                  e.target.innerHTML = d.a+' (-)';
                  if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) unsafeWindow._YDB_public.funcs.backgroundBackup();
                  return;
                }
              }
              e.target.innerHTML = d.a+' (?)';
            }},
            className:'tag__dropdown__link',
            style:{cursor:'pointer'},
            innerHTML:ls.aliases[i].a+' ('+(isEnabled?'-':'+')+')'},
                  t[j].getElementsByClassName('dropdown__content')[0]);
        }
      }
    }
  }

  //colored tags
  function colorTags() {
    let checker = (target, method) => {
      for (let i=0; i<document.querySelectorAll(target).length; i++) {
        let x = document.querySelectorAll(target)[i];
        for (let i=0; i<x.getElementsByClassName('tag').length; i++) {
          let gotten = false;
          let y = x.getElementsByClassName('tag')[i];
          let z;
          if (method == 'standart') z = y.getElementsByTagName('a')[0].dataset.tagName;
          else if (method == 'suggested') {
            z = '';
            let t = y.getElementsByTagName('span')[0].innerHTML;
            for (let j=0; j<t.split(' ').length-1; j++) z+=(j==0?'':' ')+t.split(' ')[j];
          }
          for (let tcat in tagDB.regulars) {
            if (tagDB.regulars[tcat].test(z)) {
              tagDB.regulars[tcat].test(z); //DON'T ASK ME WHY, BUT WITHOUT IT THIS THING DOESN'T WORK
              y.dataset.tagCategory = tcat;
              gotten = true;
              break;
            }
          }
          if (gotten) continue;
          for (let tcat in tagDB.normal) {
            for (let j=0; j<tagDB.normal[tcat].length; j++) {
              if (tagDB.normal[tcat][j] == z) {
                y.dataset.tagCategory = tcat;
                gotten = true;
                break;
              }
            }
            if (gotten) continue;
          }
        }
      }
    };
    checker('.js-taginput', 'standart');
    checker('.suggested_tags', 'suggested');
    setTimeout(colorTags,500);
  }

  //greenText
  function greentext(e) {
    let parser = function(et) {
      for (let i=0; i<et.childNodes.length; i++) {
        let el = et.childNodes[i];
        if (el.tagName != undefined) {
          if (el.tagName != 'A') parser(el);
        }
        else {
          let x = el.textContent.replace(/^\s+/g,'');
          let els = [el];
          let z = el.nextSibling;
          while (z && z.tagName != 'BR' && z.tagName != 'BLOCKQUOTE') {
            els.push(z);
            if (z.outerHTML) x += z.outerHTML;
            else x += z.textContent;
            z = z.nextSibling;
          }
          if (x.startsWith('>')) {
            let t = createElement('span._ydb_greentext', x);
            et.insertBefore(t,el);
            for (let j=0; j<els.length; j++) {
              et.removeChild(els[j]);
            }
          }
        }
      }
    };
    parser(e);
  }

  //spoilers
  //help
  function YDBSpoilersHelp() {
    for (let i=0; i<document.getElementsByClassName('textile_help').length; i++) {
      document.getElementsByClassName('textile_help')[i].insertBefore(createElement('span', [
        createElement('ins','YDB Spoilers:'),
        ' +',
        createElement('strong','$'),
        'Spoiler name+[bq]Spoiler body[/bq], [bq]',
        createElement('strong','$'),
        'Nameless spoiler body[/bq] ([bq] can be replaced with [spoiler])',
        createElement('br')
      ]), document.getElementsByClassName('textile_help')[i].getElementsByTagName('strong')[0]);
    }
  }

  function YDBSpoilers(e) {
    let hideBlock = function(e) {
      let u = e.target;
      while (!u.classList.contains('block__header')) u = u.parentNode;
      let x = u.nextSibling;
      x.classList.toggle('hidden');
      u.getElementsByClassName('fa')[0].innerHTML = (x.classList.contains('hidden')?'\uF061':'\uF063');
    };

    setTimeout(function() {
      e.querySelectorAll('._ydb_spoil:not(._ydb_spoil_patched)').forEach(function(x) {
        x.addEventListener('click', hideBlock);
        x.classList.add('_ydb_spoil_patched');
      });
    }, 100);

    for (let i=0; i<e.querySelectorAll('ins').length; i++) {
      let el = e.querySelectorAll('ins')[i];
      if (el.innerHTML.startsWith('$')) {
        if (el.style.display == 'none') continue;
        let uid = '_ydb_spoil';
        let h = InfernoAddElem('div',{className:'block'},[
          InfernoAddElem('div',{className:'block__header'},[
            InfernoAddElem('a',{className:uid},[
              InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
              InfernoAddElem('span',{innerHTML:' '+el.innerHTML.slice(1)},[])
            ])
          ])
        ]);

        let n = el.nextSibling;
        while (n.tagName !='BLOCKQUOTE' && !(n.classList != undefined && n.classList.contains('spoiler'))) {
          n = n.nextSibling;
          if (n == undefined) break;
        };
        if (n == undefined) break;
        h.appendChild(n);
        n.classList.add('block__content');
        n.classList.add('hidden');
        n.classList.remove('spoiler');
        n.classList.add('ydb_t_block');
        n.style.margin = 0;
        el.style.display = 'none';
        el.parentNode.insertBefore(h,el);
        YDBSpoilers(n);
      }
    }
    for (let i=0; i<e.querySelectorAll('blockquote, .spoiler').length; i++) {
      let el = e.querySelectorAll('blockquote, .spoiler')[i];
      if (el.innerHTML.startsWith('$')) {
        let uid = '_ydb_spoil';
        let h = InfernoAddElem('div',{className:'block'},[
          InfernoAddElem('div',{className:'block__header'},[
            InfernoAddElem('a',{className:uid},[
              InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
              InfernoAddElem('span',' Spoiler')
            ])
          ])
        ]);
        el.innerHTML = el.innerHTML.slice(1);
        el.parentNode.insertBefore(h,el);
        h.appendChild(el);
        el.classList.add('block__content');
        el.classList.add('hidden');
        el.classList.remove('spoiler');
        el.classList.add('ydb_t_block');
        el.style.margin = 0;
      }
    }
  }

  //bad links fixes
  function urlSearchInElem(e) {
    let exclude = [];
    for (let i=0; i<e.querySelectorAll('a').length; i++) exclude.push(e.querySelectorAll('a')[i].href);
    for (let i=0; i<e.querySelectorAll('img').length; i++) exclude.push(e.querySelectorAll('img')[i].src);
    for (let i=0; i<e.querySelectorAll('.image-show-container').length; i++) exclude.push(e.querySelectorAll('.image-show-container')[i].dataset.sourceUrl);
    e.innerHTML = e.innerHTML.replace(/(.{0,2})(https?:\/\/|ftp:\/\/)((?![.,?!;:()]*(\s|$|\"|<))[^\s]){2,}/gim, function(str2) {
      let ind = str2.search(/(https?:\/\/|ftp:\/\/)/);
      let str = str2.substring(ind);
      let apx = str2.substring(0, ind);
      if (str2.startsWith(">")) return str2;
      str = str.replace(/\&amp;/g,'&');
      for (let i=0; i<exclude.length; i++) if (exclude[i] == str) return str2;
      for (let i=0; i<exclude.length; i++) if (exclude[i] == str+'/') return str2;
      for (let i=0; i<exclude.length; i++) if (exclude[i]+'/' == str) return str2;
      if (e.innerText.indexOf(str) < 0) return str2;
      let color = getComputedStyle(document.querySelector('footer a')).color;
      return apx+'<a href="'+str+'" style="border-bottom: 1px dotted '+color+'">'+str+'</a>';
    });
  }

  function urlSearch(e) {
    Array.from(e.querySelectorAll('.communication__body__text, .profile-about, .image-description')).forEach(elem => {
      greentext(elem);
      urlSearchInElem(elem);
      YDBSpoilers(elem);
    });
  }

  //gallery sort
  function addGalleryOption() {
    if (location.pathname == "/search" || location.pathname == '/search/index') {
      let t = simpleParse(document.querySelector('.js-search-field').value);
      for (let i=0; i<t.length; i++) {
        if (t[i].startsWith('gallery_id')) {
          addElem('option',{value:t[i],innerHTML:'As in gallery #'+t[i].split(':').pop()},document.querySelector('#searchform select[name="sf"]'));
        }
      }
      if (parseURL(location.href).params.sf == undefined) return;
      let sf = parseURL(location.href).params.sf.replace('%3A',':');
      if (sf.startsWith('gallery_id')) {
        document.querySelector('#searchform select[name="sf"] option[value*="'+sf.split(':').pop()+'"]').selected = true;
      }
    }
    else if (location.pathname.startsWith("/galleries")) {
      let id = location.pathname.split('/').pop();
      addElem('a',{href:'/search?q=gallery_id%3A'+id+'&sf=gallery_id%3A'+id+'&sd=desc',innerHTML:'Open in search'},document.querySelector('.block__header--sub'));
    }
  }

  //highlight artist
  function getArtists() {
    let remained = 0;
    let checked=0;

    if (!isThisImage()) return;
    let initHighlight = function() {
      editArtistMetainfo();
      artists.forEach(artist => {
        for (let i=0; i<document.querySelectorAll('.image_uploader a').length; i++) {
          let a = document.querySelectorAll('.image_uploader a')[i];
          if (a.classList.contains('_ydb_dontCheck')) continue;
          if (a.innerText == artist.name)
          a.classList.add(artist.editor?'_ydb_orange':'_ydb_green');
        }
      });
    }

    let get = function(el) {
      let dt = parseInt(Date.now()/1000);
      if (userbase.artists[el.innerHTML] != undefined && (userbase.users[userbase.artists[el.innerHTML]].updated > parseInt(Date.now()/1000)-60*60*24*28)) {
        let n = userbase.users[userbase.artists[el.innerHTML]].name;
        let ax = {
          name:n,
          isEditor:el.innerHTML.startsWith('editor:') || el.innerHTML.startsWith('colorist:'),
          tag:el.innerHTML,
          commState:userbase.users[userbase.artists[el.innerHTML]].commState,
          awards:userbase.users[userbase.artists[el.innerHTML]].awards,
          count:parseInt(el.parentNode.querySelector('.tag__count').innerHTML.replace('(', ''))
        };
        artists.push(ax);
        initHighlight(ax);
        highlightArtist(document, ax);
      }
      else {
        if (checked > 1) return;
        checked++;

        fetchJson('GET', el.href)
        .then(resp => resp.text())
        .then(rtxt => {
          const r = {
            el,
            u: (userbase.artists[el.innerHTML] != undefined),
            text: rtxt
          };
          const x = createElement('div', r.text);
          const exit = (() => { });
          for (let i=0; i<x.querySelectorAll('.tag-info__more strong').length; i++) {
            const acx = x.querySelectorAll('.tag-info__more strong')[i];
            if (acx.innerHTML == 'Associated users:') {
              let n = acx.nextSibling.nextSibling;
              // added already
              if (artists.indexOf(n.innerHTML) > -1) {
                exit();
                return;
              }

              let ax = {
                name: n.innerHTML,
                isEditor: r.el.innerHTML.startsWith('editor:') || r.el.innerHTML.startsWith('colorist:'),
                tag: r.el.innerHTML,
                count: parseInt(r.el.parentNode.querySelector('.tag__count').innerHTML.substring(1))
              };
              artists.push(ax);
              initHighlight(ax);
              highlightArtist(document, ax);
              if (getUser(n.innerHTML).id == 0) {
                addUserInBase(n.innerHTML, undefined, {tags:[r.el.innerHTML]})
              }
              else {
                let user = getUser(n.innerHTML);
                addUserInBase(user.name, user.id, {tags:[r.el.innerHTML]})
              }

              //more than one user
              while (n.nextSibling != undefined && n.nextSibling.nextSibling != undefined && n.nextSibling.nextSibling.tagName == 'A') {
                n = n.nextSibling.nextSibling;
                artists.push(ax = {
                  name :n.innerHTML,
                  isEditor: r.el.innerHTML.startsWith('editor:') || r.el.innerHTML.startsWith('colorist:'),
                  tag: r.el.innerHTML,
                  count: parseInt(r.el.parentNode.querySelector('.tag__count').innerHTML.substring(1))
                });
                initHighlight(ax);
                highlightArtist(document, ax);
                if (getUser(n.innerHTML).id == 0) {
                  addUserInBase(n.innerHTML, undefined, {tags:[r.el.innerHTML]})
                }
                else {
                  const user = getUser(n.innerHTML);
                  addUserInBase(user.name, user.id, {tags:[r.el.innerHTML]})
                }
              };
              break;
            }
          }
          exit();
        });
      }
    };

    for (let i=0; i<document.querySelectorAll('.tag.dropdown[data-tag-category="origin"] .tag__name').length; i++) {
      let el = document.querySelectorAll('.tag.dropdown[data-tag-category="origin"] .tag__name')[i];
      if (!(el.innerHTML.startsWith('artist:') || el.innerHTML.startsWith('editor:') || el.innerHTML.startsWith('photographer:') || el.innerHTML.startsWith('colorist:'))) continue;
      get(el);
    }
  }

  function highlightArtist(e, artist) {
    let highlight = function(e,n, editor) {
      for (let i=0; i<e.getElementsByClassName('communication__body').length; i++) {
        let el = e.getElementsByClassName('communication__body')[i];
        if (el.querySelector('.communication__body__sender-name a') != undefined && el.querySelector('.communication__body__sender-name a').innerHTML == n) {
          el.querySelector('.communication__body__sender-name a').classList.add(editor?'flash--warning':'flash--success');
        }
      }
    };
    if (artist) highlight(e, artist.name, artist.editor);
    else {
      for (let i=0; i<artists.length; i++) highlight(e, artists[i].name, artists[i].isEditor);
    }
  }

  function editArtistMetainfo() {
    let commLink = (r) => {
      if (r.commState == 'none' || r.commState == undefined) return InfernoAddElem('span', {}, []);
      return InfernoAddElem('span', {className:'commissions'}, [
        InfernoAddElem('a', {href:'/commissions/'+nameEncode(r.name), style:{color:(r.commState=='open'?'green':'')}, innerHTML:(r.commState=='open'?'(commissions open)':'(commissions list)')}, [])
      ])
    }

    let xContainer = [
      document.querySelector('#extrameta > div'),
      document.querySelector('._fs_down_container > div')
    ];
    xContainer.forEach(v => {
      if (!v) return;
      if (!v.querySelector('.image_uploader a')) return;
      if (artists.length == 1 && !artists[0].isEditor && v.querySelector('.image_uploader a').innerHTML == artists[0].name) {
        v.firstChild.nodeValue = 'Created and uploaded ';
      } else {
        v.firstChild.nodeValue = 'Uploaded ';
        artists.sort((a,b) => {return b.count - a.count;});
        let container = v.querySelector('._ydb_who_did_this');
        if (!container) {
          v.insertBefore(container = InfernoAddElem('div', {className:'_ydb_who_did_this'}), v.firstChild);
        }
        container.innerHTML = 'Created by ';

        artists.forEach((artist, i) => {
          let badges = [];
          let bd = [];
          if (artist.awards) {
            for (let j=0; j<artist.awards.length; j++) {
              let bx = badges;
              if (j>=7) bx = bd;
              let aw = artist.awards[j];
              bx.push(InfernoAddElem('div', {className:'badge'}, [
                InfernoAddElem('img', {src:aw.image_url, alt:aw.title+' — '+aw.label, width:18, height:18}, [])
              ]));
            }
            if (artist.awards.length>7) {
              badges.push(InfernoAddElem('div',{className:'dropdown'},[
                InfernoAddElem('i',{className:'fa fa-caret-down'},[]),
                InfernoAddElem('div',{className:'dropdown__content block__header'},[
                  InfernoAddElem('div',{className:'badges flex--column'},bd)
                ])
              ]))
            };
          }
          container.appendChild(InfernoAddElem('span',{className:'image_uploader'},[
            InfernoAddElem('a',{className:'_ydb_dontCheck', href:'/profiles/'+nameEncode(artist.name)}, [
              InfernoAddElem('strong', artist.name)
            ]),
            InfernoAddElem('div',{className:'badges'},badges),
            commLink(artist)
          ]));

          if (i == artists.length-2) container.appendChild(InfernoAddElem('span',' and '));
          else if (i<artists.length-1) container.appendChild(InfernoAddElem('span',','));
        });
      }
    });
  }

  //highlight uploader
  function showUploader(e) {
    if (document.querySelector('.image_uploader a') == undefined) return;
    let n = document.querySelector('.image_uploader a').innerHTML;
    for (let i=0; i<e.getElementsByClassName('communication__body').length; i++) {
      let el = e.getElementsByClassName('communication__body')[i];
      if (el.querySelector('.communication__body__sender-name a') != undefined && el.querySelector('.communication__body__sender-name a').innerHTML == n) {
        addElem('span',{innerHTML:' (OP)'},el.querySelector('.communication__body__sender-name'));

      }
    }
  }

  //favs
  function highlightFaves() {
    if (document.querySelector('[data-tab="favoriters"]>p')) setTimeout(highlightFaves, 200);
    else {
      let preload = userbase_local.groups.Friends.map(v => {return userbase.users[v].name});
      let favesLinks = [];
      let els = document.querySelectorAll('[data-tab="favoriters"]>a.interaction-user-list-item');
      for (let i=0; i<els.length; i++) {
        let user = els[i].innerHTML;
        if (preload.indexOf(user) > -1) {
          favesLinks.push(InfernoAddElem('a', {innerHTML:user, href:els[i].href}));
          els[i].classList.add('_ydb_green');
        }
      }
      if (favesLinks.length == 0) return;
      favesLinks.sort((a, b) => {return Math.random() < 0.5?1:-1});
      let cont = [];
      let appx = [];
      for (let i=0; i<favesLinks.length; i++) {
        if (!favesLinks[i]) break;
        if (i < 5) {
          if (i != 0 && i == favesLinks.length-1) cont.push(InfernoAddElem('span', ' and '));
          else if (i != 0) cont.push(InfernoAddElem('span', ', '));
          cont.push(favesLinks[i]);
        } else {
          appx.push(favesLinks[i].innerHTML);
        }
      }
      if (favesLinks.length > 5) {
        cont.push(InfernoAddElem('span', ' and '));
        cont.push(InfernoAddElem('span', {title:appx.join(', '),innerHTML:(favesLinks.length-5)}));
        cont.push(InfernoAddElem('span', ' more'));
      }
      document.querySelector('[data-tab="favoriters"]').insertBefore(InfernoAddElem('h4', [
        InfernoAddElem('span', ''),
        InfernoAddElem('span', cont),
        InfernoAddElem('span', ' favorited it.')
      ]), document.querySelector('[data-tab="favoriters"] h5'));
    }
  }

  //compress comments
  function shrinkComms(e) {
    for (let i=0; i<e.querySelectorAll('.block.communication, .profile-about').length; i++) {
      let baseSize = parseInt(ls.shrinkComms);
      let el = e.querySelectorAll('.block.communication, .profile-about')[i];
      if (el.classList.contains('profile-about')) {
        el = el.parentNode;
        //baseSize *= 4;
      }
      if (el.clientHeight == 0) {
        setTimeout(function() {shrinkComms(e)}, 200);
        return;
      }
      if (el.clientHeight > baseSize*1.2+13) {
        let t = el.querySelector('.communication__body__text, .profile-about');
        if (t.classList.contains('_ydb_t_comm_shrink')) continue;
        t.classList.add('_ydb_t_comm_shrink');
        t.style.maxHeight = baseSize*0.8+'px';
        el.style.position = 'relative';
        let x;
        let y = InfernoAddElem('div',{className:'block__content communication__options _ydb_tools_compress', style:{display:'none',textAlign:'center',fontSize:'150%',marginBottom:'2px'}},[
          InfernoAddElem('a',{href:'javascript://', style:{width:'100%',display:'inline-block'}, events:[{t:'click',f:function() {
            t.classList.add('_ydb_t_comm_shrink');
            t.style.maxHeight = baseSize*0.8+'px';
            x.style.display = 'block';
            y.style.display = 'none';
          }}]}, [
            InfernoAddElem('i',{innerHTML:'\uF062',className:'fa'},[]),
            InfernoAddElem('span',{innerHTML:' Shrink '},[]),
            InfernoAddElem('i',{innerHTML:'\uF062',className:'fa'},[])
          ])
        ]);
        x = InfernoAddElem('div',{className:'block__content communication__options _ydb_tools_expand', style:{position:'absolute',textAlign:'center',fontSize:'150%',bottom:(t.classList.contains('profile-about')?0:(el.querySelector('.communication__options').clientHeight+4))+'px',width:'calc(100% - 14px)'}},[
          InfernoAddElem('a',{href:'javascript://', style:{width:'100%',display:'inline-block'},events:[{t:'click',f:function() {
            t.classList.remove('_ydb_t_comm_shrink');
            t.style.maxHeight = 'none';
            x.style.display = 'none';
            y.style.display = 'block';
          }}]}, [
            InfernoAddElem('i',{innerHTML:'\uF063',className:'fa'},[]),
            InfernoAddElem('span',{innerHTML:' Expand '},[]),
            InfernoAddElem('i',{innerHTML:'\uF063',className:'fa'},[])
          ])
        ]);
        if (t.classList.contains('profile-about')) {
          if (ls.shrinkButt) el.appendChild(y);
          el.appendChild(x);
        }
        else {
          if (ls.shrinkButt) el.insertBefore(y,el.lastChild);
          el.insertBefore(x,el.lastChild);
        }
      }
      else if (el.clientHeight < baseSize*0.8+13) {
        let t = el.querySelector('.communication__body__text, .profile-about');
        if (t.classList.contains('_ydb_t_comm_shrink') && parseInt(t.style.maxHeight)<t.clientHeight) {
          if (el.getElementsByClassName('_ydb_tools_compress')[0] != undefined) el.removeChild(el.getElementsByClassName('_ydb_tools_compress')[0]);
          el.removeChild(el.getElementsByClassName('_ydb_tools_expand')[0]);
          t.classList.remove('_ydb_t_comm_shrink');
        }
      }
    }
  }

  //compress badges
  function compressBadges(e) {
    if (!ls.hideBadges) return;
    let bd = getBadgesImplications();
    let x = e.querySelectorAll('.badges:not(._ydb_b_checked)');
    for (let i=0; i<x.length; i++) {
      for (let j=0; j<x[i].getElementsByClassName('badge').length; j++) {
        let y = x[i].getElementsByClassName('badge')[j];
        let bname = y.getElementsByTagName('img')[0].title.split('-')[0].trim();
        if (bd.normal[bname] != undefined) {
          for (let k=0; k<bd.normal[bname].length; k++) {
            let ax = x[i].querySelector('img[alt^="'+bd.normal[bname][k]+'"]');
            if (ax != undefined) ax.parentNode.classList.add('hidden');
          }
        }
        if (bd.extreme[bname] != undefined && ls.hideBadgesX) {
          for (let k=0; k<bd.extreme[bname].length; k++) {
            let ax = x[i].querySelector('img[alt^="'+bd.extreme[bname][k]+'"]');
            if (ax != undefined) ax.parentNode.classList.add('hidden');
          }
        }
        if (bd.donations[bname] != undefined && ls.hideBadgesP) {
          for (let k=0; k<bd.donations[bname].length; k++) {
            let ax = x[i].querySelector('img[alt^="'+bd.donations[bname][k]+'"]');
            if (ax != undefined) ax.parentNode.classList.add('hidden');
          }
        }
      }
      x[i].classList.add('_ydb_b_checked');
    }
  }

  //deactivateButtons
  function deactivateButtons(e, inital, itsHide) {
    if (!ls.deactivateButtons) return;
    let work = function(el) {
      if (el.querySelector('.media-box__header--link-row') == undefined) return;
      if (inital) {
        el.addEventListener('DOMNodeInserted',function(e) {
          setTimeout(function() {deactivateButtons(el,false);}, 100);
        });
        el.querySelector('.media-box__header .interaction--hide').addEventListener('click',function(e) {
          deactivateButtons(el,false, true);
        });
      }
      try{
        if (el.querySelector('.media-box__header .interaction--upvote.active') != undefined || el.querySelector('.media-box__header .interaction--fave.active') != undefined) {
          el.querySelector('.media-box__header .interaction--hide').classList.add('hidden');
          el.querySelector('.media-box__header .interaction--downvote').classList.add('hidden');
        }
        else {
          el.querySelector('.media-box__header .interaction--hide').classList.remove('hidden');
          el.querySelector('.media-box__header .interaction--downvote').classList.remove('hidden');
        }

        if (el.querySelector('.media-box__header .interaction--downvote.active') != undefined || ((el.querySelector('.media-box__header .interaction--downvote.active') == undefined ^ el.querySelector('.media-box__header .interaction--hide.active') == undefined) ^ itsHide)) {
          el.querySelector('.media-box__header .interaction--upvote').classList.add('hidden');
          el.querySelector('.media-box__header .interaction--fave').classList.add('hidden');
        }
        else {
          el.querySelector('.media-box__header .interaction--upvote').classList.remove('hidden');
          el.querySelector('.media-box__header .interaction--fave').classList.remove('hidden');
        }
      }
      catch (e) {}
    };

    let soloWork = function(el) {
      if (inital) {
        el.addEventListener('DOMNodeInserted',function(e) {
          setTimeout(function() {deactivateButtons(el,false);}, 100);
        });
        el.querySelector('.interaction--hide').addEventListener('click',function(e) {
          deactivateButtons(el,false,true);
        });
      }
      if (el.querySelector('.interaction--upvote.active[href="#"]') != undefined || el.querySelector('.interaction--fave.active[href="#"]') != undefined) {
        el.querySelector('.interaction--downvote[href="#"]').classList.add('hidden');
        el.querySelector('.interaction--hide[href="#"]').classList.add('hidden');
      }
      else {
        el.querySelector('.interaction--downvote[href="#"]').classList.remove('hidden');
        el.querySelector('.interaction--hide[href="#"]').classList.remove('hidden');
      }

      if (el.querySelector('.interaction--downvote.active[href="#"]') != undefined || el.querySelector('.interaction--hide.active[href="#"]') != undefined ^ itsHide) {
        el.querySelector('.interaction--upvote[href="#"]').classList.add('hidden');
        el.querySelector('.interaction--fave[href="#"]').classList.add('hidden');
      }
      else {
        el.querySelector('.interaction--upvote[href="#"]').classList.remove('hidden');
        el.querySelector('.interaction--fave[href="#"]').classList.remove('hidden');
      }
    };
    if (e.classList!=undefined && e.classList.contains('media-box')) work(e);
    else if (document.querySelector('.image-metabar .stretched-mobile-links:nth-child(2)') != undefined) soloWork(document.querySelector('.image-metabar .stretched-mobile-links:nth-child(2)'));
    else for (let i=0; i<e.getElementsByClassName('media-box').length; i++) {
      work(e.getElementsByClassName('media-box')[i]);
    }
  }

  //similar images
  function similar() {
    if (document.getElementById('image_old_tag_list') == undefined) return;
    let tags = '('+document.getElementById('image_old_tag_list').value.replace(/\, /g,' || ')+' || *), -(id:'+document.getElementsByClassName('image-show-container')[0].dataset.imageId+')';
    document.querySelectorAll('a[href*="/related/"]').forEach(function(e,i,a) {e.href = '/search?q='+encodeURIComponent(tags).replace(/%20/g,'+')+'&sd=desc&sf=random';});
  }

  function commentButtons(e) {
    let work = function(el) {
      if (el.querySelector('.media-box__header--link-row') == undefined) return;
      el.querySelector('.media-box__header .interaction--comments').href = el.querySelector('.media-box__content a').href+'#comments';
    };

    for (let i=0; i<e.getElementsByClassName('media-box').length; i++) {
      work(e.getElementsByClassName('media-box')[i]);
    }
  }

  function hiddenImg(e, inital, invert) {
    let horsie = (document.querySelector('body[data-theme*="ponyicons"]')?'pony':'normal');
    let im = hidden[horsie][parseInt(Math.random()*hidden[horsie].length)];
    if (!ls.fastHide) return;
    if (parseURL(location.href).params.hidden == '1') return;
    let work = function(el) {
      if (el.querySelector('.media-box__header--link-row') == undefined) return;
      if (inital) {
        el.querySelector('.media-box__header .interaction--hide').addEventListener('click',function(e) {
          hiddenImg(el,false,true);
        });
      }
      if (el.querySelector('.media-box__header--link-row') == undefined) return;
      if ((el.querySelector('.media-box__header .interaction--hide.active') != undefined ^ invert)) {
        if (el.querySelector('.media-box__content picture img') != undefined) {
          el.querySelector('.image-container').dataset.hthumb = el.querySelector('.media-box__content picture img').src;
          el.querySelector('.image-container').dataset.hsthumb = el.querySelector('.media-box__content picture img').srcset;
          el.querySelector('.media-box__content picture img').src = im.small;
          el.querySelector('.media-box__content picture img').srcset = im.small+' 1x,'+im.big+' 2x';
        }
        else {
          el.querySelector('.media-box__content a video').style.display = 'none';
          ChildsAddElem('picture',{},el.querySelector('.media-box__content a'), [
            InfernoAddElem('img',{src:im.small, srcset:im.small+' 1x,'+im.big+' 2x'},[])
          ]);
        }
      }
      else if (!inital) {
        if (el.querySelector('.media-box__content a video') != undefined) {
          el.querySelector('.media-box__content a video').style.display = 'block';
          el.querySelector('.media-box__content a picture').style.display = 'none';
        }
        else {
          el.querySelector('.media-box__content picture img').src = el.querySelector('.image-container').dataset.hthumb;
          el.querySelector('.media-box__content picture img').srcset = el.querySelector('.image-container').dataset.hsthumb;
        }
      }
    };

    if (e.classList!=undefined && e.classList.contains('media-box')) work(e);
    else for (let i=0; i<e.getElementsByClassName('media-box').length; i++) {
      work(e.getElementsByClassName('media-box')[i]);
    }
  }

  //canonical headers
  function oldHeaders() {
    let xs = `#content>.block>.block__header.flex:not(.image-metabar) {flex-wrap: wrap;}`;
    //document.head.appendChild(InfernoAddElem('style',{innerHTML:xs},[]))
    GM_addStyle(xs);
  }

  //target _blank
  //domain fixes
  function linksPatch(doc) {
    let a = doc.getElementsByTagName('a');
    let domains = ['www.trixiebooru.org', 'trixiebooru.org', 'www.derpibooru.org', 'derpibooru.org', 'www.derpiboo.ru', 'derpiboo.ru'];
    for (let i=0; i<a.length; i++) {
      for (let j=0; j<domains.length; j++)
        if (a[i].host != location.host && a[i].host == domains[j]) a[i].host = location.host;
      if (a[i].host != location.host && a[i].host != '') {
        a[i].target = '_blank';
        a[i].rel = 'nofollow noreferrer';
      }
    }
  }

  /////////////////////////////////////////////
  //user aliases
  let UBinterval = 1209600000;  //two weeks
  let UBbackupTimeout = 120;    //two minutes
  let userbase = {
    users:{},
    pending:[],
    artists:{}
  };
  let userbase_local = {
    friendlist:[],
    groups:{Friends:[], Artists:[]},
    scratchpad:{}
  };
  let userbaseTS = {
    ttu:0,
    lastRun:0,
    fix:0,
    migrated:false
  };
  let userbaseStarted = false;
  let getUserId, getUserName, addUserInBase, UAwrite, UACLwrite, addUserPending, getUser, addUserPendingById;
  let addGroup, removeGroup, renameGroup, addUserInGroup, removeUserFromGroup, nameEncode, updateUser;


  function UA(e) {
    let nameIndex = {};
    let _nameEncode = function(name) {
      return encodeURI(name.replace(/\-/g,'-dash-').replace(/\+/g,'-plus-').replace(/\:/g,'-colon-').replace(/\./g,'-dot-').replace(/\//g,'-fwslash-').replace(/\\/g,'-bwslash-').replace(/ /g,'+')).replace(/\&lt;/g,'%3C').replace(/\#/,'%2523');
    };

    let getUserByName = function (name) {
      if (nameIndex[name] != undefined) return userbase.users[nameIndex[name]];
      for (let i in userbase.users) {
        nameIndex[userbase.users[i].name] = i;
        if (name == userbase.users[i].name) return userbase.users[i];
      }
      debug('YDB:U','Failed to find user with name "'+name+'".', 0);
      return {id:0,name:'[UNKNOWN USER]',aliases:[],tags:[]}
    };

    let write = function() {
      localStorage._ydb_toolsUB2 = JSON.stringify(userbase);
    };

    let clwrite = function() {
      userbase.lastSaved = parseInt(Date.now()/1000);
      userbase.changed = true;
      localStorage._ydb_toolsUBLocal = JSON.stringify(userbase_local);
      if (unsafeWindow._YDB_public.funcs.backgroundBackup != undefined && userbase.lastSaved - userbase.lastBackupped > UBbackupTimeout) {
        userbase.lastBackupped = parseInt(Date.now()/1000);
        userbase.changed = false;
        unsafeWindow._YDB_public.funcs.backgroundBackup();
      }
      write();
    };

    let tswrite = function() {
      localStorage._ydb_toolsUBTS = JSON.stringify(userbaseTS);
    };

    let addPending = function(user) {
      if (userbase.pending.indexOf(user.id) != -1 || user.id == null) return;
      userbase.pending.push(parseInt(user.id));
      debug('YDB:U','User "'+user.name+'" ('+user.id+') added to pending list.', 0);
      write();
    };

    let addPendingById = function(id) {
      if (userbase.pending.indexOf(id) != -1 || id == null) return;
      userbase.pending.push(parseInt(id));
      debug('YDB:U','User with id '+id+' added to pending list.', 0);
      write();
    };

    let removeUser = function(id) {
      let user = userbase.users[id];
      if (user == undefined) return;
      for (let i in user.tags) {
        delete userbase.artists[user.tags[i]];
      }
      if (userbase.pending.indexOf(id) != -1) userbase.pending.splice(userbase.pending.indexOf(id),1);
    };

    let updateComms = function(user, callback) {
      fetch('/commissions/'+nameEncode(user.name))
			.then(response => {
				if (response.ok) return response.text();
			})
			.then(code => {
        let xuser = userbase.users[user.id];
        let x = InfernoAddElem('div',{innerHTML:code,style:{display:'none'}},[]);
				if (!x.querySelector('.block__content.commission__block_body')) xuser.commState = 'none';
        else xuser.commState = (x.querySelector('.block__content.commission__block_body br+strong').nextSibling.wholeText.trim()=='Open'?'open':'closed');
        xuser.updated = parseInt(Date.now()/1000);
        write();
        if (callback) callback(xuser);
			});
    };

    let updateAll = function (user2, callback) {
      updateName(user2, (user => {
        fetch('/profiles/'+nameEncode(user.name)+'.json',{method:'GET'})
        .then(function (response) {
          const errorMessage = {fail:true};
          if (!response.ok) {
            debug('YDB:U','Error in response while performing "updateAll" on "'+user.name+'"', 2);
            setTimeout(function() {updateAll(user)}, 200);
            errorMessage.retry = true;
            return errorMessage;
          }
          if (response.redirected) {
            debug('YDB:U','Redirected response while performing "updateAll" on "'+user.name+'". Encoded to '+nameEncode(user.name), 2);
            return errorMessage;
          }
          return response.json();
        })
        .then(data => {
          if (data.fail) {
            if (!data.retry) callback();
            return;
          }
          try {
            if (user.id != data.id) {
              debug('YDB:U','Received data of user "'+user.name+'", id doesn\'t match! '+data.id+', expected '+user.id+'.', 2);
              updateId(user, callback);
              return;
            }
            let xuser = userbase.users[user.id];
            debug('YDB:U','Received data of user "'+data.name+'".', 0);
            xuser.name = data.name;
            xuser.awards = data.awards;
            xuser.avatar = data.avatar_url;
            xuser.updated = parseInt(Date.now()/1000);
            updateComms(xuser, callback);
          }
          catch(e) {
            debug('YDB:U','Failed to data in reponse while performing "updateAll" on "'+user.name+'". Encoded to '+nameEncode(user.name), 2);
          }
        });
      }));
    };

    let getId = function(name, callback) {
      fetch('/profiles/'+nameEncode(name)+'.json',{method:'GET'})
        .then(function (response) {
        const errorMessage = {fail:true};
        if (!response.ok) {
          debug('YDB:U','Error in response while performing "updateId" on "'+name+'"', 2);
          setTimeout(function() {getId(name, callback)}, 200);
          errorMessage.retry = true;
          return errorMessage;
        }
        if (response.redirected) {
          debug('YDB:U','Redirected response while performing "updateId" on "'+name+'". Encoded to '+nameEncode(name), 2);
          return errorMessage;
        }
        return response.json();
      })
        .then(data => {
        if (data.fail) {
          if (!data.retry) callback();
          return;
        }
        try {
          callback(data.id);
          debug('YDB:U','Received id '+id+' of user "'+id+'".', 0);
        }
        catch(e) {
          debug('YDB:U','Failed to decode ID in reponse while performing "updateId" on "'+name+'". Encoded to '+nameEncode(name), 2);
        }
      });
    };

    let getName = function(id, callback) {
      return;

      /*  DISABLED UNTIL I FIND WORKAROUND ON PHILOMENA

      fetch('/lists/user_comments/'+id,{method:'GET'})
        .then(function (response) {
        const errorMessage = {fail:true};
        if (!response.ok) {
          debug('YDB:U','Error in response while performing "updateName" on user with id '+id, 2);
          return errorMessage;
        }
        if (response.redirected) {
          debug('YDB:U','Redirected response while performing "updateName" on user with id '+id, 2);
          return errorMessage;
        }
        return response.text();
      })
        .then(data => {
        if (data.fail) return;
        try {
          let n = document.createElement('div');
          n.innerHTML = data;
          let name = n.getElementsByTagName('h1')[0].innerHTML.slice(0,-11);
          debug('YDB:U','Received name "'+name+'" of user with id '+id+'.', 0);
          callback(name);
        }
        catch(e) {
          debug('YDB:U','Failed to find userName in reponse while performing "updateName" on user with id '+id+'.', 2);
        }
      });
      */
    };

    let updateId = function(user, callback) {
      getId(user.name, function (id, awards) {
        if (id != undefined) {
          user.id = id;
          user.awards = awards;
        }
        user.updated = parseInt(Date.now()/1000);
        write();
        if (callback) callback(user);
      })
    };

    let updateName = function(user, callback) {
      getName(user.id, function (name) {
        if (user.name != undefined && user.name != '[UNKNOWN]' && user.name != name) {
          user.aliases.push(user.name);
          debug('YDB:U','User "'+user.name+'" ('+user.id+') was renamed into "'+name+'".', 0);
        }
        if (user.name != name) {
          user.name = name;
        }
        user.updated = parseInt(Date.now()/1000);
        write();
        if (callback) callback(user);
      })
    };

    let createUser = function(name, id, content) {
      let writeEntry = function(newId) {
        if (newId == undefined) return;
        let user = {id:newId, name:name, aliases:[], tags:[]};
        if (userbase.users[newId] != undefined) {
          let changed = false;
          let oldUser = userbase.users[newId];

          user.aliases = oldUser.aliases;
          user.tags = oldUser.tags;
          //in case of renaming
          if (user.name != oldUser.name) {
            user.aliases.push(oldUser.name);
            debug('YDB:U','User "'+oldUser.name+'" ('+user.id+') was renamed into "'+user.name+'".', 0);
            changed = true;
          }

          //adding aliases
          if (content.aliases != undefined && content.aliases.length>0) {
            for (let i=0; i<content.aliases.length; i++) {
              if (oldUser.aliases.indexOf(oldUser.aliases[i]) == -1 && !content.aliases[i] == oldUser.name) {
                user.aliases.push(content.aliases[i]);
                changed = true;
              }
            }
          }

          //adding artist tags
          if (content.tags != undefined && content.tags.length>0) {
            for (let i=0; i<content.tags.length; i++) {
              if (oldUser.tags.indexOf(content.tags[i]) == -1) {
                user.tags.push(content.tags[i]);
                if (userbase.artists[content.tags[i]] != undefined && userbase.artists[content.tags[i]] != user.id) {
                  //removing artist tag from user which is no longer connected to it
                  let u = userbase.users[userbase.artists[content.tags[i]]];
                  if (u.tags.indexOf(content.tags[i]) != -1) u.tags.splice(u.tags.indexOf(content.tags[i]),1);
                  debug('YDB:U','Removed tag "'+content.tags[i]+'" from "'+u.name+'" ('+u.id+') because "'+u.name+'" ('+u.id+') has it now.', 0);
                }
                userbase.artists[content.tags[i]] = user.id;
                changed = true;
              }
            }
          }

          user.awards = content.awards;
          user.updated = parseInt(Date.now()/1000);
          setTimeout(() => {updateAll(user);}, 1000);

          if (changed) {
            userbase.users[newId] = user;
            debug('YDB:U','Updated user "'+user.name+'" ('+user.id+').', 1);
            write();
          }
        }
        else {
          //new user
          if (getUserByName(user.name).id != id && getUserByName(user.name).id != 0) {
            //user with this name exists... should recheck old one
            addPending(getUserByName(user.name));
          }

          //adding aliases
          if (content.aliases != undefined && content.aliases.length>0) {
            for (let i=0; i<content.aliases.length; i++) {
              user.aliases.push(content.aliases[i]);
            }
          }

          //adding artist tags
          if (content.tags != undefined && content.tags.length>0) {
            for (let i=0; i<content.tags.length; i++) {
              user.tags.push(content.tags[i]);
              if (userbase.artists[content.tags[i]] != undefined) {
                //removing artist tag from user which is no longer connected to it
                let u = userbase.users[userbase.artists[content.tags[i]]];
                if (u.tags.indexOf(content.tags[i]) != -1) u.tags.splice(u.tags.indexOf(content.tags[i]),1);
                debug('YDB:U','Removed tag "'+content.tags[i]+'" from "'+u.name+'" ('+u.id+') because "'+u.name+'" ('+u.id+') has it now.', 0);
              }
              userbase.artists[content.tags[i]] = user.id;
            }
          }

          user.updated = parseInt(Date.now()/1000);
          userbase.users[newId] = user;
          debug('YDB:U','Created user "'+user.name+'" ('+user.id+').', 1);
          write();
          setTimeout(() => {updateAll(userbase.users[newId]);}, 1000);
        }
      };
      if (id == undefined) getId(name, writeEntry);
      else writeEntry(id);
    };

    let removeFromGroup = function(group, id) {
      if (userbase_local.groups[group].indexOf(id) != -1) {
        userbase_local.groups[group].splice(userbase_local.groups[group].indexOf(id), 1);
        clwrite();
      }
    }

    let addInGroup = function(group, id) {
      if (isNaN(parseInt(id))) return;
      if (userbase_local.groups[group].indexOf(id) == -1) {
        userbase_local.groups[group].push(parseInt(id));
        clwrite();
      }
    }

    let _addGroup = function(group) {
      if (!userbase_local.groups[group]) {
        userbase_local.groups[group] = [];
        clwrite();
        return true;
      }
      return false;
    }

    let _renameGroup = function(group, newName) {
      if (group == 'All' || group == 'Friends' || group == 'Artists') return false;
      if (newName == 'All' || newName == 'Friends' || newName == 'Artists') return false;
      if (userbase_local.groups[group] && !userbase_local.groups[newName]) {
        userbase_local.groups[newName] = [...userbase_local.groups[group]];
        delete userbase_local.groups[group];
        clwrite();
        return true;
      }
      return false;
    }

    let deleteGroup = function(group) {
      if (group == 'All' || group == 'Friends' || group == 'Artists') return;
      if (userbase_local.groups[group]) {
        delete userbase_local.groups[group];
        clwrite();
      }
    }

    let migrate = function() {

      if (localStorage._ydb_toolsUB == undefined) return;
      let callWindow = function(inside) {
        return ChildsAddElem('div',{className:'_ydb_window block__content'},document.body,inside);
      }
      if (unsafeWindow._YDB_public != undefined && unsafeWindow._YDB_public.funcs != undefined && unsafeWindow._YDB_public.funcs.callWindow != undefined) {
        callWindow = unsafeWindow._YDB_public.funcs.callWindow;
      }
      let win = callWindow([
        InfernoAddElem('h1',{innerHTML:'Renewing userbase...'},[]),
        InfernoAddElem('span',{innerHTML:'Please be patient and don\'t close or navigate tab.'},[]),
        InfernoAddElem('hr',{},[]),
        InfernoAddElem('span',{id:"_ydb_t_ub_status",innerHTML:'Reading...'},[])
      ]);
      try {
        let inline = 0, errors = 0;
        let temp = JSON.parse(localStorage._ydb_toolsUB);
        let done = false;

        let finalize = function() {
          for (let i in temp.artists) {
            if (!isNaN(parseInt(temp.artists[i])) && userbase.users[temp.artists[i]] != undefined) {
              userbase.artists[i] = temp.artists[i];
              userbase.users[userbase.artists[i]].tags.push(i);
            }
          }
          for (let i in userbase_local.scratchpad) userbase.pending.push(i);
          for (let i=0; i<userbase_local.friendlist.length; i++) {
            if (userbase.pending.indexOf(userbase_local.friendlist[i]) != -1)
              userbase.pending.push(userbase_local.friendlist[i]);
          }
          write();
          userbaseTS.migrated = true;
          tswrite();
          if (errors == 0) debug('YDB:U','Database was successfully migrated to new version.', 1);
          else debug('YDB:U','Database was migrated to new version with '+errors+' missed entries.', 1);
          if (win != undefined) win.style.display = 'none';
        };

        let writeEntry = function(user) {
          if (user.id != undefined) {
            userbase.users[user.id] = user;
          }
          else errors++;
          inline--;
          if (inline == 0 && done) finalize();
        };

        for (let i in temp.users) {
          inline++;
          let user = {
            name:i,
            id:temp.users[i].id,
            aliases:temp.users[i].aliases,
            tags:[],
            updated:parseInt(Date.now()/1000)
          };
          if (user.id == undefined || isNaN(user.id)) updateId(user, function() {writeEntry(user)});
          else writeEntry(user);
        }
        done = true;
        if (inline == 0) finalize();
        document.getElementById('_ydb_t_ub_status').innerHTML = 'Waiting for responses... If it takes too long (more than 5 seconds) reload page.';
      }
      catch (e) {
        debug('YDB:U', 'Failed to migrate a database! '+e, 2);
      }
    };

    let fixDupesInNames = function() {
      for (let id in userbase.users) {
        let user = userbase.users[id];
        let name = user.name;
        for (let i=0; i<user.aliases.length; i++) {
          if (user.aliases[i] == name) {
            user.aliases.splice(i, 1);
            i--;
          }
        }
        for (let i=0; i<user.aliases.length-1; i++) {
          name = user.aliases[i];
          for (let j=i+1; j<user.aliases.length; j++) {
            if (user.aliases[j] == name) {
              user.aliases.splice(j, 1);
              j--;
            }
          }
        }
      }
      write();
    };

    if (!userbaseStarted) {
      getUserId = function (name, callback) {return getId(name, callback);};
      getUserName = function (id, callback) {return getName(id, callback);};
      getUser = function (name) {return getUserByName(name);};
      addUserInBase = function (name, id, content) {createUser(name, id, content);};
      addUserPending = function(user) {addPending(user);};
      addUserPendingById = function(id) {addPendingById(id);};
      addUserInGroup = function (group, id) {addInGroup(group, id);}
      removeUserFromGroup = function (group, id) {removeFromGroup(group, id);}
      addGroup = function (group) {return _addGroup(group);}
      removeGroup = function (group) {deleteGroup(group);}
      renameGroup = function (group, newName) {return _renameGroup(group, newName);}
      nameEncode = function (name) {return _nameEncode(name);}
      UAwrite = function (name, id) {write();};
      UACLwrite = function (name, id) {clwrite();};
      updateUser = function (user, callback) {updateAll(user, callback);};

      //чтение
      //metadata
      try {
        let temp = JSON.parse(localStorage._ydb_toolsUBTS);
        userbaseTS = temp;
      }
      catch(e) {
        if (userbase.ttu != undefined) {
          userbaseTS.ttu = userbase.ttu;
          userbaseTS.lastRun = userbase.lastRun;
        }
      }

      //cloud database
      try {
        let temp = JSON.parse(localStorage._ydb_toolsUBLocal);
        userbase_local = temp;
        if (!userbase_local.groups) userbase_local.groups = {Friends:[], Artists:[]};
      }
      catch(e) {}

      //database
      try {
        let temp = JSON.parse(localStorage._ydb_toolsUB2);
        userbase = temp;
      }
      catch(e) {
        if (localStorage._ydb_toolsUB != undefined) migrate();
        else {
          userbaseTS.migrated = true;
          tswrite();
        }
      }

      //cleaning updates
      for (let i=0; i<userbase.pending.length; i++) {
        userbase.pending[i] = parseInt(userbase.pending[i]);
        if (userbase.pending[i] == 0 || isNaN(userbase.pending[i])) {
          userbase.pending.splice(i,1);
          i--;
        }
        else {
          for (let j=0; j<i; j++) {
            if (userbase.pending[i] == userbase.pending[j]) {
              userbase.pending.splice(i,1);
              i--;
              break;
            }
          }
        }
      }

      //pending updates
      if (!userbaseTS.checkedDupes) {
        fixDupesInNames();
        userbaseTS.checkedDupes = true;
        tswrite();
      }
      if (userbase.pending.length>0) {
        userbaseTS.ttu -= (Date.now()-userbaseTS.lastRun);
        if (userbaseTS.ttu <= 0) {
          if (userbaseTS.lastRun == 0) userbaseTS.ttu = 0;
          if (userbase.users[userbase.pending[0]] == undefined) createUser('[UNKNOWN]', userbase.pending[0], {});
          updateAll(userbase.users[userbase.pending[0]], function(user) {
            debug('YDB:U','Updated user "'+user.name+'" ('+user.id+').', 1);
            userbase.pending.shift();
            if (userbase_local.friendlist.indexOf(user.id) != -1 || userbase_local.scratchpad[user.id] != undefined)
              userbase.pending.push(user.id);
            userbaseTS.lastRun = Date.now();
            userbaseTS.ttu += UBinterval/userbase.pending.length;
            userbaseTS.ttu = parseInt(userbaseTS.ttu);
            userbaseTS.checkedDupes = false;
            tswrite();
            write();
          });
        }
        tswrite();
      }

      userbaseStarted = true;
      let touched = false;

      //filling friends
      for (let i=0; i<userbase_local.friendlist.length; i++) {
        if (userbase.users[userbase_local.friendlist[i]] == undefined) {
          createUser('[UNKNOWN]', userbase_local.friendlist[i], {});
          addPending(i);
        }
        touched = true;
      }
      //filling scratchpad
      for (let i in userbase_local.scratchpad) {
        if (userbase.users[i] == undefined) {
          createUser('[UNKNOWN]', i, {});
          addPending(i);
        }
        touched = true;
      }

      //writing in cloud storage
      if (touched) write();

      //gathering old names from profile page
      if (document.querySelector('.profile-top__name-header') != undefined) {
        let name = document.querySelector('.profile-top__name-header').innerHTML.slice(0, -10);
        if (getUserByName(name).id == 0) {
          if (document.querySelector('.profile-top__name-header').nextSibling.tagName == undefined) {
            let t = document.querySelector('.profile-top__name-header').nextSibling.wholeText;
            t = t.substring(21,t.length-2).trim();
            let aliases = [t];
            let id = getUidOnPage();

            createUser(name, id, {aliases:aliases});
          }
        }
        let a = getUserByName(name).aliases;
        if (a.length>0) {
          let ae = [];
          for (let i=0;i<a.length; a++) {
            ae.push(InfernoAddElem('div',{className:'alternating-color block__content', innerHTML:a[i]},[]));
          }
          ae.unshift(InfernoAddElem('div',{className:'block__header'},[
            InfernoAddElem('span',{className:'block__header__title',innerHTML:'Also known as:'},[])
          ]));
          document.querySelector('.column-layout__left').insertBefore(
            InfernoAddElem('div',{className:'block'},ae)
            ,document.querySelector('.column-layout__left').firstChild);
        }
      }

      //maybe save?
      if (userbase.changed && unsafeWindow._YDB_public.funcs.backgroundBackup != undefined && userbase.lastSaved - userbase.lastBackupped > UBbackupTimeout) clwrite();
    }

    if (e == undefined) return;

    //checking posts and comments
    for (let i=0; i<e.getElementsByClassName('communication__body').length; i++) {
      let el = e.getElementsByClassName('communication__body')[i];
      let eln = el.querySelector('.communication__body__sender-name a');
      if (eln == undefined) continue;
      let ele = el.querySelector('.communication__body__sender-name');
      let name = eln.innerHTML;
      //scratchpad content and previous names
      if (getUserByName(name).id != 0) {
        let user = getUserByName(name);
        if (userbase_local.scratchpad[user.id] != undefined) {
          eln.title = userbase_local.scratchpad[user.id];
        }
        if (user.aliases.length>0) {
          let s = InfernoAddElem('div',{style:{width:'100px',fontSize:'.86em'}},[
            InfernoAddElem('span','AKA '),
            InfernoAddElem('strong',user.aliases.join(', ')),
            InfernoAddElem('br')
          ]);
          if (!(el.parentNode.querySelector('.flex__fixed.spacing-right').lastChild.classList != undefined && el.parentNode.querySelector('.flex__fixed.spacing-right').lastChild.classList.contains('post-image-container')))
            el.parentNode.querySelector('.flex__fixed.spacing-right').insertBefore(s,el.parentNode.querySelector('.flex__fixed.spacing-right').lastChild);
        }
        //continue;
      }
      //gather aliases
      let alias = ele.nextSibling;
      while (!(alias.classList != undefined && alias.classList.contains('communication__body__text'))) {
        if (alias.classList != undefined && alias.classList.contains('small-text')) {
          let t = alias.innerHTML;
          t = t.substring(21,t.length-2).trim();
          if (getUserByName(name).id != 0) {
            let user = getUserByName(name);
            let has = (user.aliases.indexOf(t) != -1);
            if (has) break;
            user.aliases.push(t);
            user.updated = parseInt(Date.now()/1000);
            write();
          }
          else {
            createUser(name, undefined, {aliases:[t]});
          }
          break;
        }
        alias = alias.nextSibling;
      }
    }

  }

  ////////////////////////////////////////////////

  function scratchPad() {
    let getPreview = function() {
      let previewTab = document.querySelector('.ydb_scratchpad .communication__body__text');
      let body = document.getElementById('_ydb_scratchpad').value;
      let path = '/posts/preview';

      fetchJson('POST', path, { body, anonymous:false})
        .then(function (response) {
        const errorMessage = '<div>Preview failed to load!</div>';
        if (!response.ok)
          return errorMessage;
        return response.text();
      })
        .then(data => {
        let cc = createElement('div', data);
        previewTab.innerHTML = cc.getElementsByClassName('communication__body__text')[0].innerHTML;
        DB_processImages(previewTab.parentNode);
        listRunInComms(previewTab.parentNode);
      });
    }
    if (document.querySelector('.profile-top__name-header') != undefined) {
      let name = document.querySelector('.profile-top__name-header').innerHTML.slice(0, -10);
      let id = getUidOnPage();
      let content = '';
      if (userbase_local.scratchpad[id] != undefined) content = userbase_local.scratchpad[id];
      document.querySelector('.column-layout__left').insertBefore(
        InfernoAddElem('div',{className:'block ydb_scratchpad'},[
          InfernoAddElem('div',{className:'block__header'},[
            InfernoAddElem('span',{className:'block__header__title',innerHTML:'Private scratchpad'},[])
          ]),
          InfernoAddElem('div',{className:'block__content'},[
            InfernoAddElem('div',{className:'block'},[
              InfernoAddElem('div',{className:'communication__body__text'},[])
            ]),
            InfernoAddElem('textarea',{className:'input input--wide', value:content, id:'_ydb_scratchpad', placeholder:''},[]),
            InfernoAddElem('span',{innerHTML:'Do not use for passwords!'},[]),
            InfernoAddElem('input',{type:'button', className:"button input--wide",value:'Update',events:[{t:'click',f:function(e) {
              if (userbase_local.scratchpad[id] == undefined) {
                if (userbase.users[id] == undefined) {
                  addUserInBase(name, id, {});
                }
              }
              userbase_local.scratchpad[id] = document.getElementById('_ydb_scratchpad').value;
              UACLwrite();
              getPreview();
              e.target.classList.add('button--state-success');
              setTimeout(() => {e.target.classList.remove('button--state-success');}, 200);
            }}]},[])
          ])
        ])
        ,document.querySelector('.column-layout__left').firstChild);
      setTimeout(getPreview, 200);
    }
  }

  //mark as read
  function readAll() {
    if (location.pathname.startsWith('/notifications')) {
      document.getElementById('content').insertBefore(InfernoAddElem('span',{style:{fontSize:'150%'}},[
        InfernoAddElem('a',{innerHTML:'Read all',href:'#',events:[{t:'click', f:function() {
          document.querySelectorAll('a[data-click-markread]').forEach(function(e,i,a) {
            e.click();
          });
        }}]},[]),
        InfernoAddElem('span',{innerHTML:' | '},[]),
        InfernoAddElem('a',{innerHTML:'Read merging',href:'#',events:[{t:'click', f:function() {
          document.querySelectorAll('a[data-click-markread]').forEach(function(e,i,a) {
            if (e.parentNode.parentNode.querySelector('.flex.flex--centered.flex__grow>div').innerText.startsWith('Somebody deleted (for \'System deduplication'))
              e.click();
          });
        }}]},[])
      ]),document.getElementById('content').childNodes[1]);
    }
  }

  //broken preview
  function fixDupes() {
    let cs = document.querySelectorAll('.grid.grid--dupe-report-list:not(._ydb_patched)');
    for (let i=0; i<cs.length; i++) {
      let es = cs[i].querySelectorAll('.image-container.thumb_small');
      for (let j=0; j<es.length; j++) {
        let p = es[j].querySelector('a img');
        if (p != undefined) {
          if (p.src.indexOf('derpicdn.net/assets/1x1') > -1) {
            DB_processImages(es[j].parentNode);
          }
        }
        es[j].querySelector('a').style.lineHeight = '150px';
        es[j].style.minWidth = '150px';
        es[j].style.minHeight = '150px';
      }
      cs[i].classList.add('_ydb_patched');
    }
    setTimeout(fixDupes, 500);
  }

  //custom spoilers
  function customSpoilerApply(spoiler) {
    let ax = JSON.parse(localStorage._ydb_tools_ctags);
    if (ax == undefined) ax = {};
    if (typeof ax == 'object' && Array.isArray(ax)) {
      let cx = {};
      for (let i=0; i<ax.length; i++) cx[ax[i]] = true;
      ax = cx;
      localStorage._ydb_tools_ctags = JSON.stringify(ax);
    }
    // for (let i=0; i<ax.length; i++) if (ax[i] == spoiler.name) return;

    for (let i in localStorage) {
      if (/bor_tags_\d+/.test(i)) {
        let s = JSON.parse(localStorage[i]);
        try {
          if (s.name == spoiler.name && !(s.spoiler_image_uri == spoiler.image)) {
            s.spoiler_image_uri_old = s.spoiler_image_uri;
            s.spoiler_image_uri = spoiler.image;
            ax[spoiler.name] = true;
            debug('YDB:T','Spoiler '+spoiler.name+' successfully added.',1);
            localStorage[i] = JSON.stringify(s);
            localStorage._ydb_tools_ctags = JSON.stringify(ax);
            return true;
          }
        }
        catch (e) {
          debug('YDB:T','Spoiler '+spoiler.name+' cannot be added — unknown reason.',2);
          return false;
        }
      }
    }
    debug('YDB:T','Spoiler '+spoiler.name+' cannot be added — entry does not found.',0);
    return false;
  }

  function customSpoilerRemove(spoiler) {
    let ax = JSON.parse(localStorage._ydb_tools_ctags);
    if (ax == undefined) ax = {};
    if (typeof ax == 'object' && Array.isArray(ax)) {
      let cx = {};
      for (let i=0; i<ax.length; i++) cx[ax[i]] = true;
      ax = cx;
      localStorage._ydb_tools_ctags = JSON.stringify(ax);
    }
    let trigger = false;

    for (let j=0; j<ax.length; j++) if (ax[j] == spoiler.name) {
      trigger = true;
      break;
    }

    if (!trigger) return;

    for (let i in localStorage) {
      if (/bor_tags_\d+/.test(i)) {
        let s = JSON.parse(localStorage[i]);
        if (s.name == spoiler.name) {
          s.spoiler_image_uri = s.spoiler_image_uri_old;
          ax[spoiler.name] = false;
          debug('YDB:T','Spoiler '+spoiler.name+' successfully removed.',1);
        }
      }
    }
    localStorage._ydb_tools_ctags = JSON.stringify(ax);
  }

  function customSpoilerCheck(forced, spoilers) {
    if (spoilers == undefined) return;
    if (!forced && Math.random()>0.1) return;

    //check for activation
    let ax;
    try {
      ax = JSON.parse(localStorage._ydb_tools_ctags);
    }
    catch (e) {
      localStorage._ydb_tools_ctags = '{}';
      ax = {};
    }
    if (ax == undefined) ax = [];
    for (let i=0; i<spoilers.length; i++) {
      customSpoilerApply(spoilers[i]);
    }

    //check for deactivation
    ax = JSON.parse(localStorage._ydb_tools_ctags);
    if (ax == undefined) ax = {};
    for (let i in ax) {
      let trigger = false;
      if (ax[i]) for (let j=0; j<spoilers.length; j++) {
        if (i == spoilers[j].name) {
          trigger = true;
          break;
        }
      }
      if (!trigger) customSpoilerRemove(spoilers[j]);
    }
  }

  function appendCustomNav() {
    let sh = ls.shortcuts;
    if (sh == undefined || sh.length == 0) return;
    let rootLink = '#';
    let links = sh.map(function (sh) {
      if (sh.name != '_root_')
        return InfernoAddElem('a',{innerHTML:sh.name, className:'header__link', href:sh.link, rel:'nofollow noreferrer'},[]);
      else {
        rootLink = sh.link;
        return InfernoAddElem('a',{innerHTML:'', className:'hidden', href:sh.link, rel:'nofollow noreferrer'},[]);
      }
    });
    document.querySelector('.header.header--secondary .hide-mobile').insertBefore(InfernoAddElem('div', {className:'dropdown header__dropdown'}, [
      InfernoAddElem('a', {className:'header__link', href:rootLink}, [
        InfernoAddElem('i', {className:'fa fa-external-link-alt'}, []),
        InfernoAddElem('span', {innerHTML:' '}, []),
        InfernoAddElem('span', {dataset:{clickPreventdefault:true},className:'fa fa-caret-down'}, [])
      ]),
      InfernoAddElem('div', {className:'dropdown__content'}, links)
    ]), document.querySelector('.header.header--secondary .hide-mobile').firstChild);
  }

  // smaller spoilers
  function smallSpoilers() {
    if (!ls.smallerSpoilers) return;
    const style = `
.block.communication .image-show-container .image-filtered {
  max-width: 240px;
  max-height: 240px;
  overflow-y: scroll;
  scrollbar-width: thin;
  zoom: 0.75;
}

.block.communication .image-show-container .image-filtered::-webkit-scrollbar {
  width: 6px;
}

.block.communication .image-show-container .image-filtered::-webkit-scrollbar-thumb {
  background-color: #888;
}`;
    GM_addStyle(style);
  }

  function getUidOnPage() {
    return parseInt(document.querySelector('a[href*="comments?cq=user_id"]').href.split('%3A').pop());
  }

  // contacts module
  function contacts() {
    if (document.querySelector('.js-burger-links a.header__link[href*="conversations"]') == undefined) return;
    let cc = document.querySelector('.js-burger-links a.header__link[href*="conversations"]');
    cc.querySelector('i').classList.add('fa-address-book');
    cc.querySelector('i').classList.remove('fa-envelope');
    cc.lastChild.data = ' Contacts';
    cc.href='/pages/api?contactList';

    if (location.pathname.startsWith('/conversations/new')) {
      let x = [];
      for (let i=0; i<userbase_local.friendlist.length; i++) {
        x.push(InfernoAddElem('span',{className:'button',innerHTML:userbase.users[userbase_local.friendlist[i]].name,events:{'click':function() {
          document.querySelector('[name="conversation[recipient]"]').value = userbase.users[userbase_local.friendlist[i]].name;
        }}}));
      }

      document.querySelector('#new_conversation .field').appendChild(
        InfernoAddElem('div',x));
    }

    let groupsPad = (uid) => {
      let container, groups = [InfernoAddElem('span','Groups'), InfernoAddElem('hr')];
      for (let i in userbase_local.groups) {
        groups.push(InfernoAddElem('li',[
          InfernoAddElem('label',[
            InfernoAddElem('input', {type:'checkbox', checked:userbase_local.groups[i].indexOf(uid)>-1, events:{change:function() {
              if (this.checked) addUserInGroup(i, uid);
              else removeUserFromGroup(i, uid);
            }}}),
            InfernoAddElem('span', ' '+i)
          ])
        ]));
      }
      document.getElementsByClassName('profile-top__options')[0].appendChild(
        container = InfernoAddElem('ul', {className:'profile-top__options__column'}, groups)
      );
    };

    if (document.getElementsByClassName('profile-top__name-and-links')[0] != undefined) {
      const uid = getUidOnPage();
      let added = false;
      for (let i=0; i<userbase_local.friendlist.length; i++) {
        if (uid == userbase_local.friendlist[i]) {
          added = true;
          groupsPad(uid);
          break;
        }
      }
      if (!added) document.getElementsByClassName('profile-top__options__column')[0].appendChild(
        InfernoAddElem('li',[
          InfernoAddElem('a',{href:'javascript://',innerHTML:'Add to contacts', events:{'click':function(e) {
            let name = document.querySelector('.profile-top__name-header').innerHTML.slice(0, -10);
            addUserInBase(name, uid, {});
            userbase_local.friendlist.push(uid);
            addUserPendingById(uid);
            document.getElementsByClassName('profile-top__options__column')[0].lastChild.classList.add('hidden');
            groupsPad(uid);
            UACLwrite();
          }}},[])
        ])
      );
    }
  }

  function YDB_contacts() {
//    document.getElementById('content').className = 'layout--wide';
    document.querySelector('#content h1').innerHTML = 'Contact list';
    let c = document.querySelector('#content .walloftext');
    c.innerHTML = '';

    let nameEncode = function(name) {
      return encodeURI(name.replace(/\+/g,'-plus-').replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/\//g,'-fwslash-').replace(/\\/g,'-bwslash-').replace(/ /g,'+'));
    };

    let removeUser = function(user) {
      if (userbase_local.friendlist.indexOf(user.id) > -1) userbase_local.friendlist.splice(userbase_local.friendlist.indexOf(user.id), 1);
      if (userbase.pending.indexOf(user.id) > -1) userbase.pending.splice(userbase.pending.indexOf(user.id), 1);

      UAwrite();
      UACLwrite();
      location.reload();
    };

    let generateLine = function(user, group) {
      if (user == undefined) return InfernoAddElem('tr',{},[
        InfernoAddElem('td',{style:{width:'48px'}}),
        InfernoAddElem('td','[USER NOT FOUND]'),
        InfernoAddElem('td'),
        InfernoAddElem('td'),
        InfernoAddElem('td'),
        InfernoAddElem('td',[
          InfernoAddElem('a',{className:'interaction--downvote', href:'javascript://', events:{'click':() => removeUser(user)}},[
            InfernoAddElem('i',{className:'fa fa-trash-alt'}),
            InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Remove'})
          ])
        ])
      ]);
      if (user.name == '[UNKNOWN]') {
        addUserPending(user);
        getUserName(user.id, function(e) {user.name = e; UAwrite();});
      }
      let groups = [];
      for (let i in userbase_local.groups) {
        if (i != 'All') groups.push(InfernoAddElem('option', {value:i, innerHTML:i}));
      }
      return InfernoAddElem('tr',{dataset:{username:user.name}},[
        InfernoAddElem('td',{style:{width:'48px'}},[
          InfernoAddElem('img',{width:48,height:48, src:user.avatar})
        ]),
        InfernoAddElem('td',[
          InfernoAddElem('a',{href:'/profiles/'+nameEncode(user.name)},[
            InfernoAddElem('span',user.name)
          ])
        ]),
        InfernoAddElem('td',userbase_local.scratchpad[user.id]==undefined?'':userbase_local.scratchpad[user.id].split('\n')[0].substring(0, 100)),
        InfernoAddElem('td', {style:{width:'9em'}}, [
          InfernoAddElem('a',{href:'/conversations/new?recipient='+nameEncode(user.name)},[
            InfernoAddElem('i',{className:'fa fa-envelope'}),
            InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Send message'})
          ])
        ]),
        InfernoAddElem('td', {style:{width:'8em'}}, [
          InfernoAddElem('a',{href:'/conversations?with='+user.id},[
            InfernoAddElem('i',{className:'fa fa-clock'}),
            InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Chat history'})
          ])
        ]),
        (group!='All'?
          InfernoAddElem('td', {style:{width:'6em'}}, [
            InfernoAddElem('a',{className:'interaction--downvote', href:'javascript://', events:{'click':() => {removeUserFromGroup(group, user.id);prepare(group)}}},[
              InfernoAddElem('i',{className:'fa fa-times'}),
              InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Remove from group'},[])
            ])
          ]):
          InfernoAddElem('td', {style:{width:'6em'}}, [
            InfernoAddElem('a',{href:'javascript://', events:{'click':function () {let gr = this.nextSibling.value; addUserInGroup(gr, user.id); prepare(gr)}}},[
              InfernoAddElem('span',{innerHTML:'Add in '},[])
            ]),
            InfernoAddElem('select', {className:'input'},groups)
          ])),
        InfernoAddElem('td', {style:{width:'6em'}}, [
          InfernoAddElem('a',{className:'interaction--downvote', href:'javascript://', events:{'click':() => {removeUser(user);YDB_contacts();}}},[
            InfernoAddElem('i',{className:'fa fa-trash-alt'}),
            InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Remove'},[])
          ])
        ])
      ]);
    };

    let render = function (users, group) {
      let x = [];
      let xcontainer = document.getElementById('group_container_'+group);
      if (!xcontainer) cont.appendChild(xcontainer = InfernoAddElem('div', {id:'group_container_'+group}));
      xcontainer.innerHTML = '';

      for (let i=0; i<users.length; i++) {
        let user = users[i];
        let line = generateLine(user, group);
        if (user.avatar == undefined) {
          setTimeout(() => {updateUser(user,() => {line.querySelector('img').src = user.avatar;});}, 50*i);
        }
        x.push(line);
      }

      if (userbase_local.friendlist.length == 0) {
        x.push(InfernoAddElem('tr',[InfernoAddElem('td','Your contact list is empty.')]));
        x.push(InfernoAddElem('tr',[InfernoAddElem('img',{src:'https://derpicdn.net/img/2013/4/2/285856/medium.png'})]));
      }
      xcontainer.appendChild(InfernoAddElem('div', [
        (group != 'All' && group != 'Artists' && group != 'Friends'?InfernoAddElem('a',{className:'interaction--downvote', style:{float:'right'}, href:'javascript://', events:{'click':() => {removeGroup(group); YDB_contacts()}}},[
          InfernoAddElem('i',{className:'fa fa-times'}),
          InfernoAddElem('span',{className:'hide-mobile',innerHTML:' Remove group'},[])
        ]):InfernoAddElem('span')),
        (group != 'All' && group != 'Artists' && group != 'Friends'?InfernoAddElem('form', {style:{display:'inline', float:'right', marginRight:'2em'}}, [
          InfernoAddElem('input',{className:'input',type:'text'}),
          InfernoAddElem('input',{className:'button',type:'submit', value:'Rename', events:{'click':function(e) {
            e.preventDefault();
            let gr = this.previousSibling.value;
            let err = renameGroup(group, gr);
            if (!err) alert('This group already exists!');
            else {
              xcontainer.id = 'group_container_'+gr;
              prepare(gr);
            }
          }}})
        ]):InfernoAddElem('span')),
        InfernoAddElem('input', {className:'toggle-box', id:'group_'+group, type:'checkbox', checked:group != 'All'}),
        InfernoAddElem('label', {for:'group_'+group, style:{marginBottom:'0.5em'},  innerHTML:group}),
        InfernoAddElem('div', {className:'toggle-box-container'}, [
          InfernoAddElem('table', {className:'table'},[
            InfernoAddElem('tbody',x)
          ])
        ]),
        InfernoAddElem('hr')
      ]));
    };

    let cont = addElem('div',{}, c);
    cont.innerHTML = '';
    cont.appendChild(InfernoAddElem('form', [
      InfernoAddElem('input',{className:'input',type:'text'}),
      InfernoAddElem('input',{className:'button',type:'submit', value:'Create new group', events:{'click':function(e) {
        e.preventDefault();
        let gr = this.previousSibling.value;
        let err = addGroup(gr);
        if (!err) alert('This group already exists!');
        else YDB_contacts();
      }}}),
      InfernoAddElem('hr')
    ]));

    let prepare = group => {
      let u = userbase_local.groups[group] || userbase_local.friendlist;
      let users = [];

      for (let i=0; i<u.length; i++) {
        let user = userbase.users[u[i]];
        users.push(user);
      }

      users.sort(function(a,b) {return a.name.toLowerCase()<b.name.toLowerCase()?-1:(a.name.toLowerCase()>b.name.toLowerCase()?1:0);});

      render(users, group)
    };

    let grs = [];
    for (let gr in userbase_local.groups) grs.push(gr);

    grs.sort((a, b) => {
      if (a.startsWith('!')) return -1;
      if (b.startsWith('!')) return 1;
      if (a == 'Friends') return -1;
      if (b == 'Friends') return 1;
      if (a == 'Artists') return -1;
      if (b == 'Artists') return 1;
      if (a<b) return -1;
      if (b<a) return 1;
      return 0;
    });

    grs.forEach(gr => {
      userbase_local.groups[gr] = userbase_local.groups[gr].map(v => {return parseInt(v)});
      prepare(gr);
    });

    prepare('All');
  }

  function YDB_Userlist() {
    document.getElementById('content').className = 'layout--wide';
    document.querySelector('#content h1').innerHTML = 'Userlist debug';
    let c = document.querySelector('#content .walloftext');
    c.innerHTML = '';

    let generateLine = function(user) {
      let date;
      if (user && user.updated) {
        date = new Date(parseInt(user.updated)*1000);
      }
      if (user == undefined)
        return InfernoAddElem('tr',[
          InfernoAddElem('td',[
            InfernoAddElem('a',{innerHTML:'Name', events:{'click':() => {sortby='name';render();} }},[])
          ]),
          InfernoAddElem('td',[
            InfernoAddElem('a',{innerHTML:'ID', events:{'click':() => {sortby='id';render();} }},[])
          ]),
          InfernoAddElem('td',[
            InfernoAddElem('a',{innerHTML:'Updated', events:{'click':() => {sortby='updated';render();} }},[])
          ]),
          InfernoAddElem('td',[
            InfernoAddElem('a',{innerHTML:'[Auto]', events:{'click':() => {sortby='auto';render();} }},[])
          ]),
          InfernoAddElem('td'),
          InfernoAddElem('td'),
          InfernoAddElem('td'),
          InfernoAddElem('td')
        ]);
      if (typeof user.id == 'string') user.id = parseInt(user.id);
      return InfernoAddElem('tr', [
        InfernoAddElem('td',[
          InfernoAddElem('a',{href:'/profiles/'+nameEncode(user.name), innerHTML:user.name})
        ]),
        InfernoAddElem('td',[
          InfernoAddElem('span',user.id)
        ]),
        InfernoAddElem('td',[
          date?InfernoAddElem('time',{style:{whiteSpace:'nowrap'},datetime:date, innerHTML:writeDate(date)}):InfernoAddElem('span')
        ]),
        InfernoAddElem('td',[
          InfernoAddElem('span',user.aliases.join(', '))
        ]),
        InfernoAddElem('td',[
          InfernoAddElem('span',user.tags.join(', '))
        ]),
        InfernoAddElem('td',[
          InfernoAddElem('span',user.awards?'Badges: '+user.awards.length:'')
        ]),
        InfernoAddElem('td',[
          InfernoAddElem('span',{style:{whiteSpace:'nowrap'}, innerHTML:(user.commState?user.commState:' ')})
        ]),
        InfernoAddElem('td',[
          InfernoAddElem('a',{innerHTML:'Update', events:{'click':() => updateUser(user, () => render())}})
        ])
      ]);
    };

    let render = function() {
      let reverse = {updated:true}
      if (sortby != 'auto') tusers.sort(function (a,b) {
        if (a[sortby] == undefined && b[sortby] == undefined) return 0;
        if (a[sortby] == undefined) return 1;
        if (b[sortby] == undefined) return -1;
        if (a[sortby] > b[sortby]) {
          if (reverse[sortby]) return -1; else return 1;
        }
        if (a[sortby] < b[sortby]) {
          if (reverse[sortby]) return 1; else return -1;
        }
        return 0;
      });
      else {
        tusers = [];
        for (let i in userbase.users) {
          tusers.push(userbase.users[i]);
        }
      }

      container.innerHTML = '';
      let container2;
      let temp = {};
      temp.userNames = userbase.pending.map(v => {
        return v+' ('+userbase.users[v].name+')'
      })
      temp.date = new Date(userbaseTS.ttu + Date.now());
      temp.lastDate = new Date(userbaseTS.lastRun);

      if (userbaseTS.ttu<0) temp.dateDiv = InfernoAddElem('span', 'Just now');
      else temp.dateDiv = InfernoAddElem('time', {datetime:temp.date, innerHTML:writeDate(temp.date)});
      temp.lastDateDiv = InfernoAddElem('time', {datetime:temp.lastDate, innerHTML:writeDate(temp.lastDate)});

      container.appendChild(
        InfernoAddElem('table', {className:'table'}, [
          InfernoAddElem('tbody', [
            InfernoAddElem('tr', [
              InfernoAddElem('td', 'Last update'),
              InfernoAddElem('td', [temp.lastDateDiv])
            ]),
            InfernoAddElem('tr', [
              InfernoAddElem('td', 'Next update'),
              InfernoAddElem('td', [temp.dateDiv])
            ]),
            InfernoAddElem('tr', [
              InfernoAddElem('td', 'Pending'),
              InfernoAddElem('td', temp.userNames.join(', '))
            ])
          ])
        ])
      );
      container.appendChild(InfernoAddElem('br'));
      container.appendChild(InfernoAddElem('table', {className:'table'}, [
        InfernoAddElem('thead', [generateLine()]),
        container2 = InfernoAddElem('tbody')
        ])
      );
      for (let i=0; i<tusers.length; i++)
        container2.appendChild(generateLine(tusers[i]));
    };

    let tusers = [];
    let sortby = 'auto';
    let container = ChildsAddElem('div',{id:'_ydb_userlist',className:'block',style:{width:'100%'}}, c, []);
    render();

  }

  function YDB_TestSpoiler() {
    document.querySelector('#content h1').innerHTML = 'Applying spoilers...';
    let c = document.querySelector('#content .walloftext');
    c.innerHTML = '';

    if (ls.spoilers == undefined) ls.spoilers = [];

    let generateLine = (spoiler, state) => {
      return InfernoAddElem('div',{className:'alternating-color block__content flex flex--center-distributed flex--centered'},[
        InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
          InfernoAddElem('span',{innerHTML:spoiler},[])
        ]),
        InfernoAddElem('span',{className:'flex__grow',style:{paddingLeft:'1em'}},[
          InfernoAddElem('span',{innerHTML:state},[])
        ])
      ]);
    };
    let x = [];

    for (let i=0; i<sps.length; i++) {
      let triggered = false;
      if (ls.spoilers != undefined) for (let j=0; j<ls.spoilers.length; j++) {
        if (ls.spoilers[j].name == sps[i].name) {
          c.appendChild(generateLine(sps[i].name, 'Exists already'));
          triggered = true;
          break;
        }
      }
      if (!triggered) {
        ls.spoilers.push(sps[i]);
        customSpoilerApply(sps[i]);
        c.appendChild(generateLine(sps[i].name, 'Added'));
      }
    }

    c.appendChild(generateLine(' ', ' '));
    c.appendChild(generateLine('Saving...', ' '));
    write(ls);
    if (unsafeWindow._YDB_public.funcs.backgroundBackup!=undefined) {
      unsafeWindow._YDB_public.funcs.backgroundBackup(function(state) {
        if (state) c.appendChild(generateLine('Backupped succesfully, returning...', ' '));
        else c.appendChild(generateLine('Failed to backup, returning anyway...', ' '));
        setTimeout(function() {
          /*if (history.length == 1) close();
					else history.back();*/
        }, 200);
      });
      c.appendChild(generateLine('Backupping...', ' '));
    }

  }

  //fixing watchlist
  function YB_checkList(o, elems) {
    let stop = false;
    elems.querySelector('h1').innerHTML = 'Checking watchlist tags...';
    let c = elems.querySelector('.wallcontainer');
    let t = addElem('div',{id:'_ydb_temp', style:{display:'none'}}, document.getElementById('content'));
    c.innerHTML = 'This may take few seconds. Do not close this page until finished<br><br>';
    c.appendChild(InfernoAddElem('a',{innerHTML:'Abort', events:[{t:'click',f:function(e) {stop = true;}}]},[]));
    c.appendChild(InfernoAddElem('br',{},[]));
    c.appendChild(InfernoAddElem('br',{},[]));
    c = elems.querySelector('.walloftext');

    let y = simpleParse(o.b);
    for (let i=0; i<y.length; i++) y[i] = y[i].trim();
    c.appendChild(InfernoAddElem('span',{innerHTML:y.length+' tags detected.<br>'},[]));

    let parse = function (request) {
      try {
        t.innerHTML = request.responseText;
        y[request.id] = t.getElementsByClassName('tag')[0].dataset.tagName;
        c.firstChild.innerHTML+=y[request.id];
        t.innerHTML = '';
      }
      catch (e) {
        c.firstChild.innerHTML+='[PARSE ERROR] '+e;
        debug('YDB:T','[PARSE ERROR] '+e+' for '+y[request.id],2);
      }
      if (request.id < y.length) get(request.id+1);
      return;
    };

    let readyHandler = function(request) {
      return function () {
        if (request.readyState === 4) {
          if (request.status === 200) return parse(request);
          else if (request.status === 0) {
            c.firstChild.innerHTML+='[ERROR]';
            if (request.id < y.length) return get(request.id+1);
            return false;
          }
          else {
            c.firstChild.innerHTML+='[ERROR]';
            if (request.id < y.length) return get(request.id+1);
            return false;
          }
        }
      };
    };

    let get = function(i) {
      if (i == y.length || stop) {
        finish();
        return;
      }
      c.insertBefore(InfernoAddElem('span',{innerHTML:'<br>'+y[i]+' -> '},[]), c.firstChild);
      let req = new XMLHttpRequest();
      req.id = i;
      req.onreadystatechange = readyHandler(req);
      req.open('GET', '/tags/'+encodeURIComponent(y[i].replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-')));
      req.send();
    };

    let finish = function() {
      y = searchForDuplicates(y);
      o.b = simpleCombine(y);
      result = o;
      processing[o.a] = false;
    };
    if (y.length>0) get(0);
  }

  function YDB() {
    let x = location.search.slice(1);
    if (location.search == "") return;
    else if (location.search == "?") return;
    else {
      if (document.querySelector('#content>p')) document.getElementById('content').removeChild(document.querySelector('#content>p'));
      if (document.querySelector('#content>a')) document.getElementById('content').removeChild(document.querySelector('#content>a'));
      let u = x.split('?');
      if (u[0] == 'contactList') YDB_contacts();
      else if (u[0] == 'usersDebug') YDB_Userlist();
      else if (u[0] == 'toolsSpoilerTest') YDB_TestSpoiler();
    }
  }

  function listRunInComms(targ) {
    UA(targ);
    urlSearch(targ);
    linksPatch(targ);
    showUploader(targ);
    compressBadges(targ);
    setTimeout(function() {shrinkComms(targ)},200);
  }

  function listRunWhenDone() {
    shrinkComms(document);
  }

  function listener(e) {
    if (e.target.classList == undefined) return;
    if (!(e.target.id == 'image_comments' || (e.target.parentNode.classList.contains('communication-edit__tab')) || (e.target.classList.contains('block') && e.target.classList.contains('communication')))) return;
    listRunInComms(e.target);
    shrinkComms(e.target);
    highlightArtist(e.target);
  }

  function error(name, e) {
    debug('YDB:T',name+' crashed during startup. '+e.stack,2);
  }

  try {UA();} catch(e) {error("UA", e)};
  try {flashNotifies();} catch(e) {error("flashNotifies", e)};
  try {profileLinks();} catch(e) {error("profileLinks", e)};
  try {readAll();} catch(e) {error("readAll", e)};
  try {scratchPad();} catch(e) {error("scratchPad", e)};
  if (ls.patchSearch) try {bigSearch();} catch(e) {error("bigSearch", e)};
  try {aliases();} catch(e) {error("aliases", e)};
  try {asWatchlist();} catch(e) {error("asWatchlist", e)};
  try {YDBSpoilersHelp();} catch(e) {error("YDBSpoilersHelp", e)};
  if (ls.similar) try {similar();} catch(e) {error("bigSearch", e)};
  try {listRunInComms(document);} catch(e) {error("listRunInComms", e)};
  if (ls.deactivateButtons) try {deactivateButtons(document, true);} catch(e) {error("deactivateButtons", e)};
  if (ls.oldHead) try {oldHeaders();} catch(e) {error("oldHead", e)};
  try {commentButtons(document, true);} catch(e) {error("commentButtons", e)};
  try {customSpoilerCheck(false, ls.spoilers);} catch(e) {error("customSpoilerCheck", e)};
  try {shrinkComms(document);} catch(e) {error("shrinkComms", e)};
  try {hiddenImg(document, true);} catch(e) {error("hiddenImg", e)};
  try {getArtists();} catch(e) {error("getArtists", e)};
  try {addGalleryOption();} catch(e) {error("addGalleryOption", e)};
  try {contacts();} catch(e) {error("contacts", e)};
  try {fixDupes();} catch(e) {error('fixDupes', e)};
  try {appendCustomNav();} catch(e) {error('appendCustomNav', e)};
  try {highlightFaves();} catch(e) {error('highlightFaves', e)};
  try {smallSpoilers();} catch(e) {error('smallerSpoilers', e)};
  if (location.pathname == "/pages/api") {
    YDB();
  }
  unsafeWindow.addEventListener('load',listRunWhenDone);
  if (document.getElementById('comments')) document.getElementById('comments').addEventListener("DOMNodeInserted", listener);
  if (document.querySelector('.communication-edit__tab[data-tab="preview"]'))
    document.querySelector('.communication-edit__tab[data-tab="preview"]').addEventListener("DOMNodeInserted", listener);

})();
