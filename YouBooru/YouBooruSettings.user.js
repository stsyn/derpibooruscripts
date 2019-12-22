// ==UserScript==
// @name         YourBooru:Settings
// @namespace    http://tampermonkey.net/

// @include      /http[s]*:\/\/(www\.|philomena\.|)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/adverts\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*\.json.*/

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/SettingsData0.js
// @require      https://github.com/LZMA-JS/LZMA-JS/raw/master/src/lzma_worker-min.js
// /require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/DerpibooruCSRFPatch.lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js
// @version      0.9.32
// @description  Global settings script for YourBooru script family
// @author       stsyn
// @grant        unsafeWindow
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  let scriptId = 'settings';
  let internalVersion = '0.9.30';
  try {if (unsafeWindow._YDB_public.settings[scriptId] != undefined) return;}
  catch(e){}
  let version = GM_info.script.version;

  let config;
  let modules = [];
  let settings;
  let resaved = false;
  let errorCode = 0;
  let windows = '._ydb_window {position:fixed;z-index:999;width:80vw;height:80vh;top:10vh;left:10vw;overflow-y:auto} ._ydb_warn{background:#f00 !important}';
  const warningText = 'These two lines are used by YourBooru to save data in your account. Do not split or edit them.';
  const warningTextShort = 'Lines below are used by YourBooru. Do not edit.';
  const backupVersion = 2;

  function read() {
    if (localStorage._ydb_config == undefined) localStorage._ydb_config = localStorage._ydb;
    let svd = localStorage._ydb_config;
    try {
      settings = JSON.parse(svd);
    }
    catch (e) {
      settings = {};
    }
    if (settings.sync == undefined) settings.sync = settings.synch;
    if (settings.downsync == undefined) settings.downsync = settings.downsynch;
    if (settings.sync == undefined) settings.sync = true;
    if (settings.downsync == undefined) settings.downsync = settings.sync;
    if (settings.syncInterval == undefined) settings.syncInterval = 360;
    if (settings.silentSync == undefined) settings.silentSync = false;
    if (settings.debugLength == undefined) settings.debugLength = 100;
    if (settings.debugLevel == undefined) settings.debugLevel = 1;
    if (settings.nonce == undefined || isNaN(settings.nonce)) settings.nonce = parseInt(Math.random()*Number.MAX_SAFE_INTEGER);
    write();
  }
  read();

  function write() {
    localStorage._ydb_config = JSON.stringify(settings);
  }

  function callWindow(inside) {
    return ChildsAddElem('div',{className:'_ydb_window block__content'},document.body,inside);
  }

  function debugLogger(id, val, level) {
    if (settings.debugLevel>level) return;
    if (settings.debugFilter != undefined) {
      let filter = settings.debugFilter.split(',');
      for (let i=0; i<filter.length; i++) {
        if (filter[i].trim() == id) return;
      }
    }
    let x = [];
    let svd = localStorage._ydb_dlog;
    try {
      x = JSON.parse(svd);
    }
    catch (e) { }
    let levels = ['!', '?', '.'];
    x.push({id:id,level:level,val:val,ts:Date.now()});
    if (x.length > settings.debugLength) x = x.slice(-settings.debugLength);
    if (level == 2) {
      console.log('['+['.', '?', '!'][level]+'] ['+id+'] '+val);
      console.trace();
    }
    localStorage._ydb_dlog = JSON.stringify(x);
  }

  function register() {
    if (unsafeWindow._YDB_public == undefined) unsafeWindow._YDB_public = {};
    if (unsafeWindow._YDB_public.settings == undefined) unsafeWindow._YDB_public.settings = {};
    unsafeWindow._YDB_public.settings.settings = {
      name:'Settings',
      container:'_ydb_config',
      version:version,
      s:[
        {type:'header', name:'Syncronization'},
        {type:'text', name:'Writes a compressed copy of these settings into the end of your watchlist query and filter settings. This action does not affect your watchlist, you still may use everything as before, but please do not edit appended data.', styleS:{fontStyle:'italic'}},
        {type:'breakline'},
        {type:'text', name:'Available space is limited, if you\'re running out of it, consider using YDB:Feeds to replicate all your watchlist settings in a more compressed format.', styleS:{fontStyle:'italic'}},
        {type:'breakline'},
        {type:'breakline'},
        {type:'checkbox', name:'Allow setting uploading', parameter:'sync'},
        {type:'breakline'},
        {type:'checkbox', name:'Allow setting downloading', parameter:'downsync'},
        {type:'breakline'},
        {type:'input', name:'Syncronization interval (in minutes)', parameter:'syncInterval', validation:{type:'int',min:5,max:10080, default:360}},
        {type:'breakline'},
        {type:'checkbox', name:'Silent syncronization', parameter:'silentSync'},
        {type:'breakline'},
        {type:'breakline'},
        {type:'text', name:'If you do not wish to backup anymore, simply remove ydb-related strings from your display settings.', styleS:{fontStyle:'italic'}},
        {type:'breakline'},
        {type:'breakline'},
        {type:'buttonLink', name:'Sync', href:'/pages/api?sync'},
        {type:'breakline'},
        {type:'header', name:'Logs'},
        {type:'input', name:'Debug log length', parameter:'debugLength', validation:{type:'int',min:0,max:500, default:200}},
        {type:'select', name:'Log level', parameter:'debugLevel', values:[
          {name:'Errors', value:2},
          {name:'Info', value:1},
          {name:'Verbose', value:0}
        ]},
        {type:'input', name:'Filter (,)', parameter:'debugFilter'}
      ]
    };
    if (unsafeWindow._YDB_public.funcs == undefined) unsafeWindow._YDB_public.funcs = {};
    unsafeWindow._YDB_public.funcs.callWindow = callWindow;
    unsafeWindow._YDB_public.funcs.backgroundBackup = backgroundBackup;
    unsafeWindow._YDB_public.funcs.log = debugLogger;
    unsafeWindow._YDB_public.funcs.getNonce = () => settings.nonce;
  }

  function hideBlock(e) {
    let u = e.target;
    while (!u.classList.contains('block__header')) u = u.parentNode;
    let x = u.nextSibling;
    x.classList.toggle('hidden');
    u.getElementsByClassName('fa')[0].innerHTML = (x.classList.contains('hidden')?'\uF061':'\uF063');
  }

  function renderer(e, ss, l, s, mod) {
    s.forEach(function (v,i,a) {
      let x, y;
      if (v.type == 'checkbox') {
        y = ChildsAddElem('label', {dataset:{parent:e.container, parameter:v.parameter}, className:'_ydb_s_checkcont',innerHTML:' '+v.name+' '}, l, [
          x = InfernoAddElem('input',{type:'checkbox',checked:ss[v.parameter]})
        ]);
      }
      else if (v.type == 'input') {
        y = addElem('span', {innerHTML:' '+v.name+' '},l);
        x = addElem('input', {dataset:{parent:e.container, parameter:v.parameter},type:'text',className:'input _ydb_s_valuecont',value:ss[v.parameter]},l);
      }
      else if (v.type == 'textarea') {
        y = addElem('span', {innerHTML:' '+v.name+' '},l);
        x = addElem('textarea', {dataset:{parent:e.container, parameter:v.parameter},type:'text',className:'input _ydb_s_valuecont _ydb_s_bigtextarea',value:ss[v.parameter]},l);
      }
      else if (v.type == 'select') {
        y = addElem('span', {innerHTML:' '+v.name+' '},l);
        let elems = v.values.map(function (vv,i,a) {
          return InfernoAddElem('option',{innerHTML:vv.name, value:vv.value, selected:(vv.value == ss[v.parameter])});
        });
        x = ChildsAddElem('select', {dataset:{parent:e.container, parameter:v.parameter},size:1, className:'input _ydb_s_valuecont'}, l, elems);
      }

      else if (v.type == 'button') {
        x = addElem('span', {innerHTML:v.name, className:'button', events:[{t:'click',f:function(e) {v.action(mod, e.target);}}]},l);
      }

      else if (v.type == 'buttonLink') {
        x = addElem('a', {innerHTML:v.name, className:'button', href:v.href},l);
      }

      else if (v.type == 'breakline') {
        y = addElem('br', {},l);
      }

      else if (v.type == 'header') {
        y = addElem('h4', {innerHTML:v.name},l);
      }

      else if (v.type == 'text') {
        y = addElem('span', {innerHTML:v.name},l);
      }

      else if (v.type == 'array') {
        let rr = function(e, ss, l, s, y, nav) {
          let x = addElem('div', {className:'block__content alternating-color _ydb_inArray', dataset:{id:y.getElementsByClassName('_ydb_inArray').length}}, y);
          for (let k=0; k<v.s.length; k++) {
            renderer(e, ss, x, s[k], mod);
            if (nav && k==0) {
              addElem('span', {
                style:{marginLeft:'.5em', float:'right'},
                className:'button',
                innerHTML:'<i class="fa fa-arrow-up"></i>',
                events:[{
                  t:'click',
                  f:function(e) {
                    let u = e.target;
                    if (!u.classList.contains('button')) u = u.parentNode;
                    let xl = u.parentNode;
                    if (xl.previousSibling == null) return;
                    xl.parentNode.insertBefore(xl, xl.previousSibling);
                  }
                }]
              }, x);
            }
            if (k == v.s.length-1) {
              addElem('span', {
                className:'button commission__category',
                innerHTML:'Delete',
                style:{marginLeft:'.5em'},
                events:[{
                  t:'click',
                  f:function(ex) {
                    this.parentNode.parentNode.removeChild(this.parentNode);
                  }
                }]
              }, x);

              if (nav) {
                addElem('span', {
                  style:{marginLeft:'.5em', float:'right'},
                  className:'button',
                  innerHTML:'<i class="fa fa-arrow-down"></i>',
                  events:[{
                    t:'click',
                    f:function(e) {
                      let u = e.target;
                      if (!u.classList.contains('button')) u = u.parentNode;
                      let xl = u.parentNode;
                      if (xl.nextSibling == null) return;
                      let xp = xl.nextSibling.nextSibling;
                      if (xp == undefined) xl.parentNode.appendChild(xl);
                      else xl.parentNode.insertBefore(xl, xp);
                    }
                  }]
                }, x);
              }
            }
            else addElem('br', {},x);
          }
        };
        x = addElem('div', {dataset:{parent:e.container, parameter:v.parameter},className:'_ydb_array'},l);
        v.container = v.parameter;
        if (ss[v.parameter] != undefined) for (let j=0; j<ss[v.parameter].length; j++) {
          rr(e, ss[v.parameter][j], x, v.s, x, v.customOrder);
        }
        y = addElem('span', {
          className:'button',
          innerHTML:v.addText,
          events:[{
            t:'click',
            f:function(ex) {
              rr(e, v.template, x, v.s, x, v.customOrder);
            }
          }]
        }, l);

      }

      if (v.attrI != undefined) for (let s in v.attrI) x[s] = v.attrI[s];
      if (v.attrS != undefined) for (let s in v.attrS) y[s] = v.attrS[s];
      if (v.styleI != undefined) for (let s in v.styleI) x.style[s] = v.styleI[s];
      if (v.styleS != undefined) for (let s in v.styleS) y.style[s] = v.styleS[s];
      if (v.eventsI != undefined) for (let s in v.eventsI) x.addEventListener(s,v.eventsI[s]);
      if (v.eventsS != undefined) for (let s in v.eventsS) y.addEventListener(s,v.eventsS[s]);
      if (v.validation != undefined) x.dataset.validation = v.validation.type;
      if (v.i != undefined) v.i(mod, x);

    });
  }

  function renderCustom(e, cont2, mod) {
    if (e.s.length == 0) return;
    let ss = {};
    try {
      ss = JSON.parse(localStorage[e.container]);
    }
    catch (ex) {
    }

    if (e.name != 'Settings') ChildsAddElem('div', {className:'block__header'}, cont2, [
      InfernoAddElem('a', {events:[{t:'click',f:hideBlock}]}, [
        InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
        InfernoAddElem('span', {innerHTML:' '+e.name})
      ])
    ]);

    let cont = addElem('div', {className:'block__content '+(e.name!='Settings'?'hidden':'')}, cont2);
    if (e.name == 'Settings') cont2.insertBefore(cont, cont2.childNodes[0]);

    let l = document.createElement('div');
    l.dataset.parent = e.container;
    l.className = '_ydb_settings_container';
    renderer(e, ss, l, e.s, mod);
    cont.appendChild(l);

  }

  function getData(force, external) {
    let win;
    let t = InfernoAddElem('div');
    let parse = function (request) {
      try {
        t.innerHTML = request.responseText;
        let x = t.querySelector('#user_watched_images_exclude_str').value.split('\n');
        let y = t.querySelector('#user_watched_images_query_str').value.split('\n');
        t.innerHTML = '';
        let bc = '';
        for (let i=0; i<x.length; i++) {
          if (x[i].startsWith('$')) {
            bc += x[i].slice(1);
            break;
          }
        }
        for (let i=0; i<y.length; i++) {
          if (y[i].startsWith('$')) {
            bc += y[i].slice(1);
            break;
          }
        }
        bc = bc.trim();
        if (bc != '') {
          bc = atob(bc);
          let r = [];
          for (let j=0; j<bc.length; j++) {
            let x2 = bc.charCodeAt(j);
            if (x2>127) x2-=256;
            r.push(x2);
          }
          let s = JSON.parse(LZMA.decompress(r));
          if (external) {
            document.querySelector('#content .walloftext').innerHTML = JSON.stringify(s,null,' ');
            return;
          }
          if (settings.timestamp+60 < s.timestamp || force) {
            for (let y in s.vs) {
              localStorage[y] = s.vs[y];
            }
            settings.timestamp = parseInt(Date.now()/1000);
            write();
            if (location.pathname != "/pages/api" && location.search != '?sync' && !settings.silentSync) location.reload();
            return;
          }
          settings.timestamp = parseInt(Date.now()/1000);
          write();
          debugLogger('YDB:S','Successfuly syncronized', 1);
          if (!external && !settings.silentSync) win.parentNode.removeChild(win);
          return;
        }
        errorCode = 2;
        settings.timestamp = parseInt(Date.now()/1000);
        write();
        debugLogger('YDB:S','Failed to sync settings — nothing to parse. Updating impossible',2);
        if (!external && !settings.silentSync) win.parentNode.removeChild(win);
        return;
      }
      catch (e) {
        settings.timestamp = parseInt(Date.now()/1000);
        write();
        debugLogger('YDB:S','Failed to sync settings. Updating impossible',2);

        if (!external && !settings.silentSync) win.parentNode.removeChild(win);
      }
      return;
    };

    let readyHandler = function(request) {
      return function () {
        if (request.readyState === 4) {
          if (request.status === 200) return parse(request);
          else if (request.status === 0) {
            return false;
          }
          else {
            return false;
          }
        }
      };
    };

    let get = function() {
      let req = new XMLHttpRequest();
      req.onreadystatechange = readyHandler(req);
      req.open('GET', '/settings/edit');
      req.send();
    };
    if (!settings.downsync && !force && !external) return;
    if (!external && !settings.silentSync) win = callWindow([InfernoAddElem('h1',{innerHTML:'Fetching last settings, please wait a bit...'},[])]);
    get();
  }

  function createBackup(x, y) {
    let ret1, ret2;

    let inserted;
    let content = {};
    content.timestamp = parseInt(Date.now()/1000);
    content.version = backupVersion;
    content.vs = {};

    for (let m in modules) {
      if (modules[m].container != '_ydb_config') content.vs[modules[m].container] = localStorage[modules[m].container];
    }

    let r2 = LZMA.compress(JSON.stringify(content),9);
    let r = '';
    let rs = [];
    for (let i=0; i<r2.length; i++) {
      if (r2[i] < 0) r2[i] = 256+r2[i];
      r+=String.fromCharCode(r2[i]);
    }
    r = btoa(r);
    rs[0] = '$'+r.substring(0, parseInt((r.length-1)/2)+1);
    rs[1] = '$'+r.substring(parseInt((r.length-1)/2)+1, r.length);

    for (let i=0; i<x.length; i++) {
      if (x[i] == warningText) x[i] = warningTextShort;
      if (x[i].startsWith('$')) {
        if (i==0 || x[i-1] != warningTextShort) x.splice(i,0,warningTextShort);
        x[i] = rs[0];
        inserted = true;
      }
    }
    if (!inserted) {
      x.push(warningTextShort);
      x.push(rs[0]);
    }
    inserted = false;
    for (let i=0; i<y.length; i++) {
      if (y[i] == warningText) y[i] = warningTextShort;
      if (y[i].startsWith('$')) {
        if (i==0 || y[i-1] != warningTextShort) y.splice(i,0,warningTextShort);
        y[i] = rs[1];
        inserted = true;
      }
    }
    if (!inserted) {
      y.push(warningTextShort);
      y.push(rs[1]);
    }
    ret1 = x.join('\n');
    ret2 = y.join('\n');
    return [ret1, ret2];
  }

  function backgroundBackup(callback) {
    let s = document.querySelector('._ydb_settings_cloneForm');

    let process = function() {
      read();
      write();
      let el = s.querySelector('textarea[name*="watched_images_exclude_str"]');
      let x = el.innerHTML.split('\n');
      let el2 = s.querySelector('textarea[name*="watched_images_query_str"]');
      let y = el2.innerHTML.split('\n');
      let ax = createBackup(x, y);
      el.innerHTML = ax[0];
      el2.innerHTML = ax[1];
      let readyHandler = function(request) {
        return function () {
          if (request.readyState === 4) {
            if (callback!= undefined) callback(true);
          }
        };
      };

      let get = function() {
        let req = new XMLHttpRequest();
        req.onreadystatechange = readyHandler(req);
        req.open('POST', '/settings');
        req.send(new FormData(s.querySelector('form')));
      };
      get();
    };

    let callbackS = function (r) {
      let x = addElem('div',{style:{display:'none'},innerHTML:r.responseText},document.body);
      if (x.querySelector('form.new_user') != undefined) return;
      s = ChildsAddElem('div',{style:{display:'none'},className:'_ydb_settings_cloneForm'},document.body,[
        x.querySelector('form.edit_user')
      ]);
      document.body.removeChild(x);
      s.querySelector('#serve_hidpi').checked = localStorage.serve_hidpi;
      s.querySelector('#serve_webm').checked = localStorage.serve_webm;
      s.querySelector('#webm').checked = localStorage.webm;
      s.querySelector('#hide_uploader').checked = localStorage.hide_uploader;
      s.querySelector('#chan_nsfw').checked = localStorage.chan_nsfw;
      setTimeout(() => {s.parentNode.removeChild(s);}, 15000);
      process();
    };

    let get = function() {
      let req = new XMLHttpRequest();
      req.onreadystatechange = readyHandler(req);
      req.open('GET', '/settings');
      req.send();
    };

    let readyHandler = function(request) {
      return function () {
        if (request.readyState === 4) {
          if (request.status === 200) return callbackS(request);
          else {
            debugLogger('YDB:S','Failed to fetch settings. Backup impossible',2);
            callback(false);
          }
        }
      };
    };

    if (s == undefined) get();
    else process();
  }

  function backup() {
    read();
    if (!settings.sync) {
      //removeBackup();
      return;
    }
    let container = document.getElementById('user_watched_images_exclude_str');
    let x = container.value.split('\n');
    let container2 = document.getElementById('user_watched_images_query_str');
    let x2 = container2.value.split('\n');
    let bc = createBackup(x, x2);
    container.value = bc[0];
    container2.value = bc[1];
    debugLogger('YDB:S', 'Front backup successfully created', 0);
  }

  function afterSave() {
    backup();
  }

  function validate(e) {
    let ec = document.getElementById('_ydb_error_cont');
    ec.innerHTML = '';
    let errorlevel = 0;
    let validateChilds = function(c, m, mm) {
      let errorlevel = 0;
      for (let i=0; i<c.childNodes.length; i++) {
        let el = c.childNodes[i];
        let x;
        for (let j=0; j<m.length; j++) {
          if (m[j].length>0) for (let k=0; k<m[j].length; k++) {
            if (m[j][k].parameter == el.dataset.parameter) {
              x = m[j][k];
              break;
            }
          }
          else if (m[j].parameter == el.dataset.parameter) {
            x = m[j];
            break;
          }
        }
        if (el.classList == null) continue;
        else if (el.classList.contains('_ydb_s_valuecont')) {
          if (x.validation != undefined) {
            let v = x.validation;
            if (v.type == 'int') {
              if (el.value == '') {
                if (x.default != undefined) el.value = x.default;
                else if (el.min != undefined) el.value = x.min;
                else el.value=0;
              }
              if (el.value != parseInt(el.value) || el.value<v.min || el.value>v.max) {
                let reason = '';
                if (el.value != parseInt(el.value)) reason = ' must be an integer!';
                else if (el.value < v.min) reason = ` must be at least ${v.min}`;
                else if (el.value > v.max) reason = ` must be no more than ${v.max}`;
                addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+reason}, ec);
                errorlevel++;
                el.classList.add('_ydb_warn');
              }
            }
            else if (v.type == 'float') {
              if (el.value == '') {
                if (x.default != undefined) el.value = x.default;
                else if (el.min != undefined) el.value = x.min;
                else el.value=0;
              }
              if (el.value != parseFloat(el.value) || el.value<v.min || el.value>v.max) {
                let reason = '';
                if (el.value != parseInt(el.value)) reason = ' must be a real number!';
                else if (el.value<v.min) reason = ' must be at least '+v.min;
                else if (el.value>v.max) reason = ' must not be more than '+v.max;
                addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+reason}, ec);
                errorlevel++;
                el.classList.add('_ydb_warn');
              }
            }
            else if (v.type == 'unique') {
              for (let i=0; i<c.parentNode.querySelectorAll('input._ydb_s_valuecont[data-parent="'+el.dataset.parent+'"][data-parameter="'+el.dataset.parameter+'"]').length;i++) {
                let c2 = c.parentNode.querySelectorAll('input._ydb_s_valuecont[data-parent="'+el.dataset.parent+'"][data-parameter="'+el.dataset.parameter+'"]')[i];
                if (c2 == el) break;
                if (c2.value == el.value) {
                  addElem('div',{className:'flash flash--warning', innerHTML:'>'+mm.name+': '+x.name+' should be unique!'}, ec);
                  errorlevel++;
                  el.classList.add('_ydb_warn');
                }
              }
            }
            continue;
          }
        }
        else if (el.classList.contains('_ydb_array')) {
          if (el.childNodes != undefined) for (let j=0; j<el.childNodes.length; j++) {
            if (el.childNodes[j].classList.contains('_ydb_inArray')) {
              errorlevel+=validateChilds(el.childNodes[j], x.s, mm);
            }
          }
        }
      }
      return errorlevel;
    };
    if (e == undefined || e.tagName == undefined) {
      let containers = document.getElementsByClassName('_ydb_settings_container');
      for (let i=0; i<containers.length; i++) {
        let mx = modules[containers[i].dataset.parent];
        errorlevel += (validateChilds(containers[i], mx.options, mx));
      }

      if (errorlevel>0) {
        let x = addElem('div',{className:'flash flash--warning', style:{fontWeight:500}, innerHTML:errorlevel+' error(s) are preventing the settings from saving:'}, ec);
        ec.insertBefore(x,ec.childNodes[0]);
      }
    }
    else {
      let virgin = (ec.childNodes.length == 0);
      let mx = modules[e.dataset.parent];
      errorlevel += (validateChilds(e, mx.options, mx));
      if (errorlevel>0 && virgin) {
        let x = addElem('div',{className:'flash flash--warning', style:{fontWeight:500}, innerHTML:errorlevel+' error(s) are preventing the settings from saving:'}, ec);
        ec.insertBefore(x,ec.childNodes[0]);
      }
    }
    return errorlevel;
  }

  function save(e) {
    if (resaved) {
      afterSave();
      return;
    }
    unsafeWindow._YDB_public.handled = 0;
    if (validate(e) >0) {
      e.preventDefault();
      setTimeout(() => document.querySelector('.edit_user button.button[type=submit]').removeAttribute('disabled'),500);
      return;
    }
    let changed = false;
    let exploreChilds = function(c, m, o, mx) {
      //container, module data container, onchange functions, module
      let callback = function(m, el, val) {
        m[el.dataset.parameter] = val;
      };
      let changed = false;
      for (let i=0; i<c.childNodes.length; i++) {
        let el = c.childNodes[i];
        if (el.classList == null) continue;
        else if (el.classList.contains('_ydb_s_valuecont')) {
          if (m[el.dataset.parameter] != el.value) {
            changed = true;
            m[el.dataset.parameter] = el.value;
            if (el.dataset.validation == 'int') m[el.dataset.parameter] = parseInt(m[el.dataset.parameter]);
            else if (el.dataset.validation == 'float') m[el.dataset.parameter] = parseFloat(m[el.dataset.parameter]);
            if (o != undefined && o[el.dataset.parameter] != undefined) o[el.dataset.parameter](m, el, callback);
          }
        }
        else if (el.classList.contains('_ydb_s_checkcont')) {
          let cel = el.getElementsByTagName('input')[0];
          if (m[el.dataset.parameter] != cel.checked) {
            changed = true;
            m[el.dataset.parameter] = cel.checked;
            if (o != undefined && o[el.dataset.parameter] != undefined) o[el.dataset.parameter](m, cel, callback);
          }
        }
        else if (el.classList.contains('_ydb_array')) {
          let inChanged = false;
          let k = 0;
          if (m[el.dataset.parameter] == undefined || m[el.dataset.parameter].length == undefined) m[el.dataset.parameter] = [];
          if (el.childNodes != undefined) for (let j=0; j<el.childNodes.length; j++) {
            if (el.childNodes[j].classList.contains('_ydb_inArray')) {
              if (typeof m[el.dataset.parameter][k] != 'object') m[el.dataset.parameter][k] = {};
              if (exploreChilds(el.childNodes[j], m[el.dataset.parameter][k], (o != undefined?o[el.dataset.parameter]:undefined))) {
                inChanged = true;
              }
              k++;
            }
          }

          if (k<m[el.dataset.parameter].length) {
            m[el.dataset.parameter].splice(k);
            inChanged = true;
          }

          if (inChanged) changed = true;
          if (inChanged && o != undefined && o[el.dataset.parameter] != undefined && o[el.dataset.parameter]._ != undefined) o[el.dataset.parameter]._(m, m[el.dataset.parameter], callback);
        }
      }
      return changed;
    };
    let containers = document.getElementsByClassName('_ydb_settings_container');
    for (let i=0; i<containers.length; i++) {
      let mx = modules[containers[i].dataset.parent];
      mx.changed = false;
      if (exploreChilds(containers[i], mx.saved, mx.onChanges, mx.s)) {
        changed = true;
        mx.changed = true;
        if (mx.onChanges != undefined && mx.onChanges._ != undefined) mx.onChanges._(mx);
        //localStorage[mx.container] = JSON.stringify(mx.saved);
      }
    }
    read();
    settings.timestamp = parseInt(Date.now()/1000);
    settings.bgBackupflag = false;
    write();
    if (unsafeWindow._YDB_public.handled != 0) {
      e.preventDefault();
      const checker = () => {
        if (unsafeWindow._YDB_public.handled != 0) setTimeout(checker, 100);
        else {
          for (let i=0; i<containers.length; i++) {
            let mx = modules[containers[i].dataset.parent];
            if (mx.changed) localStorage[mx.container] = JSON.stringify(mx.saved);
          }
          resaved = true;
          document.querySelector('.edit_user button.button[type=submit]').removeAttribute('disabled');
          document.querySelector('.edit_user button.button[type=submit]').click();
        }
      };
      setTimeout(checker, 100);
    }
    else if (changed) {
      for (let i=0; i<containers.length; i++) {
        let mx = modules[containers[i].dataset.parent];
        if (mx.changed) localStorage[mx.container] = JSON.stringify(mx.saved);
      }
      backup();
    }
    debugLogger('YDB:S', 'Settings saved', 0);
  }


  function injectModule(k, editCont, listCont) {
    let ss = {};
    let s2 = unsafeWindow._YDB_public.settings[k];
    try {ss = JSON.parse(localStorage[unsafeWindow._YDB_public.settings[k].container]);}
    catch (ex) {console.log('Warning: '+k+' has empty storage!');}
    modules[s2.container] = {name:s2.name, container:s2.container, changed:false, saved:ss, options:s2.s, onChanges:s2.onChanges};
    if (s2.s != undefined && editCont != undefined) {
      try {renderCustom(s2, editCont, modules[s2.container]);}
      catch(e) {console.log('Error rendering '+k+'. '+e); console.trace(e);}
    }

    if (listCont != undefined && !s2.hidden) addElem(s2.link!=undefined?'a':'div', {href:s2.link!=undefined?s2.link:'', style:{display:'block'}, className:'block__content alternating-color', innerHTML:s2.name+' v. '+s2.version}, listCont);
  }

  function injectLegacyModule(k, editCont, listCont) {
    let ss = {};
    try {ss = JSON.parse(localStorage[k.container]);}
    catch (ex) {console.log('Warning: '+k.name+' has empty storage!');}
    modules[k.container] = {name:k.name, container:k.container, changed:false, saved:ss, options:k.s, onChanges:k.onChanges};
    if (k.s != undefined && editCont != undefined) {
      try {renderCustom(k, editCont, modules[k.container]);}
      catch(e) {console.log('Error rendering '+k.name+'. '+e);}
    }

    if (listCont != undefined && !k.hidden) addElem(k.link!=undefined?'a':'div',  {href:k.link!=undefined?k.link:'', style:{display:'block'}, className:'block__content alternating-color', innerHTML:k.name+' v. '+k.version}, listCont);
  }

  function listModules() {
    let loadedList = {};
    //loading, stage 1
    if (unsafeWindow._YDB_public != undefined) {
      if (unsafeWindow._YDB_public.settings != undefined) {
        for (let k in unsafeWindow._YDB_public.settings) {
          injectModule(k);
          loadedList[k] = true;
        }
      }
    }

    //loading, stage 2
    for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
      try {
        let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
        injectLegacyModule(k);
        loadedList[k.name] = true;
      }
      catch (e) {
        console.log('JSON failed to parse: "'+document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value+'" '+e);
      }
    }

    let timer = 50;
    let handler = function() {
      for (let k in unsafeWindow._YDB_public.settings) {
        if (!loadedList[k]) {
          injectModule(k);
          loadedList[k] = true;
        }
      }
      for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
        try {
          let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
          if (!loadedList[k.name]) {
            injectLegacyModule(k);
            loadedList[k.name] = true;
          }
        }
        catch (e) {
        }
      }

      timer*=4;
      setTimeout(handler, timer);
    };
    setTimeout(handler, 50);
  }

  function settingPage() {
    //localStorage._ydb_watchListFilterString = document.getElementById('user_watched_images_exclude_str').innerHTML;
    let cont;
    //preparing
    document.getElementById('js-setting-table').insertBefore(cont = InfernoAddElem('div',{className:'block__tab hidden',dataset:{tab:'YourBooru'},style:{position:'relative'}}), document.querySelector('[data-tab="local"]').nextSibling);

    let style = '._ydb_s_bigtextarea {resize:none;overflow:hidden;line-height:1.25em;white-space:pre;height:2.25em;vertical-align:top;}'+
        '._ydb_s_bigtextarea:focus {overflow:auto;position:absolute;width:900px !important;height:10em;z-index:5;white-space:pre-wrap}';
    GM_addStyle(style);
    addElem('a',{href:'#',innerHTML:'YourBooru',dataset:{clickTab:'YourBooru'}},document.getElementsByClassName('block__header')[0]);

    let editCont = addElem('div',{className:'block'},cont);
    let listCont = addElem('div',{className:'block'},cont);
    ChildsAddElem('div', {className:'block__header'}, listCont, [
      InfernoAddElem('span', {innerHTML:'Installed plugins', style:{marginLeft:'12px'}})
    ]);

    let el;
    if (!settings.sync) {
      el = document.createElement('div');
      el.className = 'block block--fixed block--warning';
      el.innerHTML = 'Settings on this tab are saved in the current browser. They are independent of whether you are logged in or not.';
      cont.appendChild(el);
    }

    let loadedList = {};

    //loading, stage 1
    if (unsafeWindow._YDB_public != undefined) {
      if (unsafeWindow._YDB_public.settings != undefined) {
        for (let k in unsafeWindow._YDB_public.settings) {
          injectModule(k, editCont, listCont);
          loadedList[k] = true;
        }
      }
    }

    //loading, stage 2
    for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
      try {
        let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
        injectLegacyModule(k, editCont, listCont);
        loadedList[k.name] = true;
      }
      catch (e) {
        console.log('JSON failed to parse "'+document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value+'" '+e);
      }
    }

    //postloading
    ChildsAddElem('div', {className:'block__header'}, cont, [

      InfernoAddElem('a', {target:'_blank', href:'javscript://', events:[{t:'click',f:function() {
        unsafeWindow.open(getDonateLink()!=undefined?getDonateLink():'https://ko-fi.com/C0C8BVXS');
      }}]}, [
        InfernoAddElem('i', {className:'fa fa-heart', style:{color:'red'}}, []),
        InfernoAddElem('span', {innerHTML:' Support'}, [])
      ]),
      InfernoAddElem('a', {target:'_blank', href:'/pages/api?help'}, [
        InfernoAddElem('i', {className:'fa fa-question'}, []),
        InfernoAddElem('span', {innerHTML:' Help'}, [])
      ]),
      InfernoAddElem('a', {target:'_blank', href:'/pages/api?logs'}, [
        InfernoAddElem('i', {className:'fa fa-bug'}, []),
        InfernoAddElem('span', {innerHTML:' Debug logs'}, [])
      ]),
      InfernoAddElem('a', {target:'_blank', href:'/pages/api?backup'}, [
        InfernoAddElem('i', {className:'fa fa-bug'}, []),
        InfernoAddElem('span', {innerHTML:' Test backup'}, [])
      ])
    ]);
    addElem('div', {className:'block', id:'_ydb_error_cont'}, cont);

    let hh = function () {
      if (location.hash!='') {
        let t = location.hash.slice(1);
        if (document.querySelector('a[data-click-tab="'+t+'"]') != null) document.querySelector('a[data-click-tab="'+t+'"]').click();
      }
    };

    for (let i=0; i<document.getElementsByClassName('block__header')[0].childNodes.length; i++) {
      document.getElementsByClassName('block__header')[0].childNodes[i].href = '#'+document.getElementsByClassName('block__header')[0].childNodes[i].getAttribute('data-click-tab');
      document.getElementsByClassName('block__header')[0].childNodes[i].addEventListener('click', function(e) {location.hash = e.target.href.split('#')[1];});
    }

    document.querySelector('button.button[type=submit]').addEventListener('click', save);
    setTimeout(hh, 500);
    if (location.hash.slice(1) == 'backup') {
      document.querySelector('button.button[type=submit]').click();
    }
    validate();

    let timer = 50;
    let handler = function() {
      for (let k in unsafeWindow._YDB_public.settings) {
        if (!loadedList[k]) {
          injectModule(k, editCont, listCont);
          loadedList[k] = true;
        }
      }
      for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
        try {
          let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
          if (!loadedList[k.name]) {
            injectLegacyModule(k, editCont, listCont);
            loadedList[k.name] = true;
          }
        }
        catch (e) {
        }
      }

      timer*=4;
      setTimeout(handler, timer);
    };
    setTimeout(handler, 50);
  }

  ////////////////////////////

  function YB_createEmpty() {
    if (document.querySelector('#content h1').innerHTML != 'API') return;
    document.querySelector('#content h1').innerHTML = 'Derp!';
    document.querySelector('#content .walloftext').innerHTML = '<p>I know the script is callled "YourBooru", but as much as I would want it to be truly yours, I could not find a page you specified. Nope. Nothing at all! I tried though.</p><p>Make sure that the URL you are trying to access is valid and that you aren\'t trying to hunt ghosts here. Otherwise you might have hit a bug and it would be a good idea to report it to me!</p>';
  }

  ///////////////////////////
  function YB_logs() {
    let active = {}, ex = {};

    let readAll = function() {
      let svd = localStorage._ydb_dlog;
      try {
        x = JSON.parse(svd);
      }
      catch (e) { }
    };

    let getAll = function() {
      let ox = [];
      for (let i=x.length-1; i>=0; i--) {
        if (ex[x[i].id] == undefined) {
          ex[x[i].id] = true;
          active[x[i].id] = true;
          ox.push(InfernoAddElem('label',{innerHTML:x[i].id+' ',style:{marginRight:'9px'}},[
            InfernoAddElem('input',{type:'checkbox', dataset:{id:x[i].id}, checked:true, events:[{t:'change',f:function(e) {active[e.target.dataset.id] = e.target.checked; render();}}]},[])
          ]));
        }
      }
      c3.appendChild(InfernoAddElem('span',{},ox));
    };

    let render = function() {
      readAll();
      getAll();
      c2.innerHTML = '';
      let u = [];
      for (let i=x.length-1; i>=0; i--) {
        if (document.getElementById('_ydb_s_level').value<=x[i].level && active[x[i].id]) {
          let d = new Date(x[i].ts);
          u.push(InfernoAddElem('div',{className:levelsClasses[x[i].level]},[
            InfernoAddElem('strong',{innerHTML:'['+levels[x[i].level]+'] '},[]),
            InfernoAddElem('strong',{innerHTML:'['+x[i].id+'] '},[]),
            InfernoAddElem('span',{innerHTML:d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()+'@'+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()},[]),
            InfernoAddElem('span',{innerHTML:' '+x[i].val},[])
          ]));
        }
      }
      ChildsAddElem('div',{className:'block',style:{width:'100%'}}, c2, u);
    };

    document.querySelector('#content h1').innerHTML = 'Debug Logs';
    let c = document.querySelector('#content .walloftext');
    c.innerHTML = '';
    ChildsAddElem('div',{className:'block',style:{width:'100%'}}, c, [
      InfernoAddElem('select',{id:'_ydb_s_level',className:'input header__input', style:{display:'inline'}, events:[{t:'change',f:render}], size:1},[
        InfernoAddElem('option',{innerHTML:'Only errors', value:'2'},[]),
        InfernoAddElem('option',{innerHTML:'Normal', value:'1'},[]),
        InfernoAddElem('option',{innerHTML:'Verbose', value:'0'},[])
      ]),
      InfernoAddElem('input',{type:'button', className:'button', style:{marginLeft:'2em'}, value:'Redraw', events:[{t:'click',f:render}]},[])
    ]);

    let s = '';

    let x = [];
    let levels = ['.', '?', '!'];
    let levelsClasses = ['flash--success','flash--site-notice','flash--warning'];

    let c3 = ChildsAddElem('div',{className:'block',style:{fontFamily:'monospace',whiteSpace:'pre',width:'100%'}}, c, []);
    let c2 = ChildsAddElem('div',{className:'block',style:{fontFamily:'monospace',whiteSpace:'pre',width:'100%'}}, c, []);

    render();
  }

  function YB_backup() {
    document.querySelector('#content h1').innerHTML = 'Help';
    let c = document.querySelector('#content .walloftext');
    c.innerHTML = '';

    let error = 'Ha, you thought there is help, how adorable.<br><br><br>Help is available only for standalone versions of YDB:Settings.';
    try {
      renderHelp(c);
    }
    catch(e) {
      c.innerHTML = error;
    }
  }

  function yourbooruPage() {
    let x = location.search.slice(1);
    if (location.search == "?") YB_createEmpty();
    else {
      document.getElementById('content').removeChild(document.querySelector('#content>p'));
      document.getElementById('content').removeChild(document.querySelector('#content>a'));
      let u = x.split('?');
      if (u[0] == "backup") setTimeout(function() {
        document.querySelector('#content h1').innerHTML = 'Syncing...';
        document.querySelector('#content .walloftext').innerHTML = '';
        getData(true, true);
      }, 100);
      else if (u[0] == "help") setTimeout(YB_backup, 100);
      else if (u[0] == "logs") setTimeout(YB_logs, 100);
      else if (u[0] == "sync") setTimeout(function() {
        document.querySelector('#content h1').innerHTML = 'Syncing...';
        document.querySelector('#content .walloftext').innerHTML = '';
        getData(true);
        let c = function() {
          if (errorCode>0) {
            if (errorCode == 2) {
              document.querySelector('#content .walloftext').innerHTML = 'No backups for you!';
              setTimeout(function() {
                if (history.length == 1) close();
                else history.back();
              },5000);
            }
          }
          else if (settings.timestamp+1 >= parseInt(Date.now()/1000)) {
            if (history.length == 1) close();
            else history.back();
          }
          else setTimeout(c, 100);
        };
        c();
      }, 100);
      else if (location.search != '') setTimeout(YB_createEmpty, 100);
    }
  }

  unsafeWindow.onbeforeunload = function(e) {
    if (unsafeWindow._YDB_public.bgCalled) {
      let checker = function() {
        if (unsafeWindow._YDB_public.bgCalled) setTimeout(checker, 100);
      };
      callWindow([InfernoAddElem('h1',{innerHTML:'Background copy in process...'},[])]);
    }
  };

  GM_addStyle(windows);
  if (settings.timestamp+(settings.syncInterval*60) < parseInt(Date.now()/1000) && location.pathname != "/settings/edit") {
    settings.nonce = parseInt(Math.random()*Number.MAX_SAFE_INTEGER);
    try { telemetry();} catch(e) {}
    getData();
  }
  if (location.pathname == "/settings/edit") setTimeout(settingPage, 50);
  else setTimeout(listModules, 50);
  if (location.pathname == "/pages/api") yourbooruPage();
  register();
})();
