// ==UserScript==
// @name         YourBooru:Tools
// @namespace    http://tampermonkey.net/
// @version      0.2.2
// @description  Some UI tweaks
// @author       stsyn

// @include      *://trixiebooru.org/*
// @include      *://derpibooru.org/*
// @include      *://www.trixiebooru.org/*
// @include      *://www.derpibooru.org/*
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/*
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/*
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/*
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/*

// @exclude      *://trixiebooru.org/adverts/*
// @exclude      *://derpibooru.org/adverts/*
// @exclude      *://www.trixiebooru.org/adverts/*
// @exclude      *://www.derpibooru.org/adverts/*
// @exclude      *://adverts/*.o53xo.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://adverts/*.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://adverts/*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*
// @exclude      *://adverts/*.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*

// @require      https://raw.githubusercontent.com/blueimp/JavaScript-MD5/master/js/md5.min.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    function write() {
        localStorage._ydb_tools = JSON.stringify(ls);
    }

    function register() {
        if (window._YDB_public == undefined) window._YDB_public = {};
        if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
        window._YDB_public.settings.tools = {
            name:'Tools',
            container:'_ydb_tools',
            version:GM_info.script.version,
            s:[
                {type:'checkbox', name:'Reset', parameter:'reset'},
                {type:'checkbox', name:'Force hiding', parameter:'force'}
            ]
        };
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
            write();
        }
    }
    catch (e) {
        ls = {};
        ls.hidden = {};
        ls.force = false;
        ls.reset = false;
        fl = ls.hidden;
    }
    register();

    //execute
    for (let i=0; i<document.getElementsByClassName('flash--site-notice').length; i++) {
        let e = document.getElementsByClassName('flash--site-notice')[i];
        let z = md5(e.innerHTML);
        if (fl[z] == '1' || ls.force)
            e.style.display = 'none';
        else {
            let x = document.createElement('a');
            x.style.float = 'right';
            x.innerHTML = '[X]';
            x.href = 'javascript://';
            x.addEventListener('click', function(u) {
                e.style.display = 'none';
                fl[z] = '1';
                write();
            });
            e.appendChild(x);
        }
    }
    //links at profile and other
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
    //selfbadges
    function badge(core) {
        let x = [];
        x = core.querySelectorAll('.communication__body__sender-name');
        for (let i=0; i<x.length; i++) {
            if (x[i].innerHTML.indexOf('St@SyaN') > -1) {
                let b = document.createElement('div');
                b.innerHTML = 'YourBooru dev';
                b.className = 'label label--purple label--block label--small';
                let p = x[i].parentNode;
                p.insertBefore(b, p.getElementsByClassName('label')[0]);
            }
        }
        if (core.querySelector('.profile-top__name-header') != null) {
            x = core.querySelector('.profile-top__name-header');
            if (x.innerHTML.indexOf('St@SyaN') > -1) {
                let b = document.createElement('div');
                b.innerHTML = 'YourBooru dev';
                b.className = 'label label--purple label--block';
                let p = x.parentNode;
                p.insertBefore(b, p.getElementsByClassName('label')[0]);
            }
        }
    }
    badge(document);
    if (document.getElementById('comments') != undefined) document.getElementById('comments').addEventListener("DOMNodeInserted",function(e) {
        if (e.target.classList == undefined) return;
        if (!(e.target.id == 'image_comments' || (e.target.classList.contains('block') && e.target.classList.contains('communication')))) return;
        badge (e.target);});
})();
