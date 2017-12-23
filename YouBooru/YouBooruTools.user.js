// ==UserScript==
// @name         YourBooru:Tools
// @namespace    http://tampermonkey.net/
// @version      0.3.1
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
// @exclude      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://*.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*
// @exclude      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*

// @require      https://raw.githubusercontent.com/blueimp/JavaScript-MD5/master/js/md5.min.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruTools.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    function write(ls2) {
        localStorage._ydb_tools = JSON.stringify(ls2);
    }

    function register() {
        if (window._YDB_public == undefined) window._YDB_public = {};
        if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
        window._YDB_public.settings.tools = {
            name:'Tools',
            container:'_ydb_tools',
            version:GM_info.script.version,
            s:[
                {type:'header', name:'Notifications'},
                {type:'checkbox', name:'Reset', parameter:'reset'},
                {type:'checkbox', name:'Force hiding (Ignorantia non est argumentum!)', parameter:'force'},
                {type:'header', name:'UI'},
                {type:'checkbox', name:'Bigger search fields', parameter:'patchSearch'},
                {type:'header', name:'Tag aliases'},
                {type:'checkbox', name:'Do not parse page name', parameter:'oldName'},
                {type:'breakline'},
                {type:'text', name:'Aliase', styleS:{width:'30%', textAlign:'center',display:'inline-block'}},
                {type:'text', name:'Original tag', styleS:{width:'70%', textAlign:'center',display:'inline-block'}},
                {type:'array', parameter:'aliases', addText:'Add', customOrder:false, s:[
                    [
                        {type:'input', name:'', parameter:'a',styleI:{width:'calc(40% - 10px - 12.5em)'}},
                        {type:'textarea', name:'', parameter:'b',styleI:{width:'60%'}},
                        {type:'checkbox', name:'As watchlist', parameter:'w'}
                    ]
                ], template:{a:'',b:'', w:false}}
            ],
            onChanges:{
                aliases:{
                    _:function(module,data) {
                        if (data != undefined && data.length>0) {
                            data.sort(function(a, b){
                                return b.a.length - a.a.length;
                            });
                        }
                        for (let i=0; i<data.length; i++) {
                            if (data[i].changed) {
                                data[i].changed = false;
                                if (data[i].w) {
                                    window.open('/pages/yourbooru?checklist?'+i);
                                }
                            }
                        }
                    },
                    b:function(m, el) {
                        console.log('kek?');
                        m.changed = true;
                    }
                }
            }
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
            write(ls);
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
    if (ls.patchSearch == undefined) {
        ls.patchSearch = true;
        write(ls);
    }

    if (ls.aliases != undefined && ls.aliases.length>0) {
        ls.aliases.sort(function(a, b){
            return b.a.length - a.a.length;
        });
        write(ls);
    }

    //flashes
    function flashNotifies() {
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
                    write(ls);
                });
                e.appendChild(x);
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
        let css = 'header ._ydb_t_textarea {resize:none;overflow:hidden;line-height:2em;white-space:pre}'+
            'header ._ydb_t_textarea:focus {max-width:calc(100vw - 350px);overflow:auto;position:absolute;width:calc(100vw - 350px);height:5em;z-index:5;white-space:pre-wrap}'+
            '#searchform textarea {min-width:100%;max-width:100%;min-height:2.4em;line-height:1.5em;height:7em}';
        addElem('style',{type:'text/css',innerHTML:css},document.head);
        let x = [document.getElementsByClassName('header__input--search')[0], document.querySelector('.js-search-form input')];
        let x2 = [document.getElementsByClassName('header__search__button')[0], document.querySelector('input[type="submit"][value="Search"]')];
        let y = [];
        for (let i=0; i<x.length; i++) {
            if (x[i] == null) return;
            y[i] = document.createElement('textarea');
            y[i].value = x[i].value;
            y[i].className = x[i].className+' _ydb_t_textarea';
            y[i].name = x[i].name;
            y[i].id = x[i].id;
            y[i].placeholder = x[i].placeholder;
            y[i].autocapitalize = x[i].autocapitalize;
            y[i].addEventListener('keypress',function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    x2[i].click();
                }
            });
            x[i].parentNode.insertBefore(y[i],x[i]);
            x[i].parentNode.removeChild(x[i]);
        }
    }

    //tag tools
    function simpleParse(x) {
        x = x.replace(/\|\|/g, ',');
        x = x.replace(new RegExp(' OR ','g'), ',');
        let y = x.split(',');
        for (let i=0; i<y.length; i++) y[i] = y[i].trim();
        return y;
    }

    function goodParse(x) {
        let yx = {};
        yx.orig = x;
        x = x.replace(/\|\|/g, ', ');
        x = x.replace(/^\(/g, ' ');
        while (x.indexOf('(') >= 0) x = x.replace(/[^\\\(]\(/g, function(str){return str[0]+' ';});
        while (x.indexOf(')') >= 0) x = x.replace(/[^\\\)]\)/g, function(str){return str[0]+' ';});
        x = x.replace(/[ ,\(]\-/g, function(str){return str[0]+' ';});
        x = x.replace(/[ ,\(]!/g, function(str){return str[0]+' ';});
        x = x.replace(/\*/g, ' ');
        x = x.replace(/\?/g, ' ');
        x = x.replace(/\~/g, ',');
        x = x.replace(/\^/g, ',');
        x = x.replace(new RegExp(' OR ','g'), ' ,  ');
        x = x.replace(new RegExp(' AND ','g'), ',   ');
        x = x.replace(new RegExp(' NOT ','g'), ',   ');
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
            ns+=yx.orig.substring(pos,yx.tags[i].offset);
            pos+=(yx.tags[i].offset-pos)+yx.tags[i].length;
            ns+=yx.tags[i].v;
        }
        ns+=yx.orig.substring(pos);
        return ns;
    }

    function simpleCombine(y) {
        let s = '';
        for (let i=0; i<y.length; i++) s += y[i] + (i<y.length-1?' OR ':'');
        return s;
    }

    function readTagTools() {
        let svd = localStorage._ydb_tagtools;
        try {
            svd = JSON.parse(svd);
        }
        catch(e) {
            svd = {};
        }
        return svd;
    }

    function writeTagTools(svd) {
        localStorage._ydb_tagtools = JSON.stringify(svd);
    }

    function getTimestamp() {
        return parseInt(Date.now()/1000);
    }

    function aliases() {
        let data = readTagTools();
        let s = md5(document.getElementsByClassName('header__input--search')[0].value);
        if (data[s] != undefined) {
            document.getElementsByClassName('header__input--search')[0].value = data[s].q;
            if (document.querySelector('#imagelist_container .block__header__title') != undefined && !ls.oldName) {
                let x = document.querySelector('#imagelist_container .block__header__title').innerHTML;
                x = x.slice(0,14)+data[s].q;
                document.querySelector('#imagelist_container .block__header__title').innerHTML = x;
            }
            if (document.querySelector('.js-search-form .input') != undefined) document.querySelector('.js-search-form .input').value = data[s].q;

            data[s].t = getTimestamp();
        }
        for (let i in data) {
            if (data[i].t == null) data[i].t = getTimestamp();
            if (data[i].t+3600<getTimestamp()) {
                delete data[i];
                continue;
            }
        }
        writeTagTools(data);

        if (ls.aliases != undefined && ls.aliases.length>0) {
            let aliaseParse = function(el) {
                let udata = readTagTools();
                let orig = el.value;

                let als = {};
                for (let i=0; i<ls.aliases.length; i++) als[ls.aliases[i].a] = ls.aliases[i].b;
                let changed = false;

                let cycledParse = function(orig) {
                    let changed = false;
                    console.log(orig);
                    let tags = goodParse(orig);
                    for (let i=0; i<tags.tags.length; i++) {
                        if (als[tags.tags[i].v] != undefined) {
                            tags.tags[i].v = '('+als[tags.tags[i].v]+')';
                            changed = true;
                        }
                    }
                    let q2 = goodCombine(tags);
                    if (changed) q2 = cycledParse(q2);
                    return q2;
                };

                let q = cycledParse(orig);
                if (q!=el.value) {
                    changed = true;
                    el.value = q;
                }

                if (changed) {
                    udata[md5(el.value)] = {q:orig, t:getTimestamp()};
                    console.log(udata);
                    writeTagTools(udata);
                };
            };

            document.getElementsByClassName('header__search__button')[0].addEventListener('click',function() {aliaseParse(document.getElementsByClassName('header__input--search')[0]);});
            if (document.querySelector('input[type="submit"][value="Search"]')!=undefined)
                document.querySelector('input[type="submit"][value="Search"]').addEventListener('click',function() {aliaseParse(document.querySelector('.js-search-form .input'));});
        };
    }

    function asWatchlist() {
        for (let i=0; i<ls.aliases.length; i++) {
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
                    addElem('a',{dataset:{a:ls.aliases[i].a, tag:t[j].dataset.tagName},events:[{t:'click',f:function(e) {
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
                                        return;
                                    }
                                }
                                s.push(d.tag);
                                l.aliases[k].b = simpleCombine(s);
                                write(l);
                                e.target.innerHTML = d.a+' (-)';
                                return;
                            }
                        }
                        e.target.innerHTML = d.a+' (?)';
                    }}],className:'tag__dropdown__link', style:'cursor:pointer', innerHTML:ls.aliases[i].a+' ('+(isEnabled?'-':'+')+')'}, t[j].getElementsByClassName('dropdown__content')[0]);
                }
            }
        }
    }

    //target _blank
    //domain fixes
    function linksPatch(doc) {
        let a = doc.getElementsByTagName('a');
        let domains = ['www.trixiebooru.org', 'trixiebooru.org', 'www.derpibooru.org', 'derpibooru.org', 'www.derpiboo.ru', 'derpiboo.ru'];
        for (let i=0; i<a.length; i++) {
            for (let j=0; j<domains.length; j++)
                if (a[i].host != location.host && a[i].host == domains[j]) a[i].host = location.host;
            if (a[i].host != location.host && a[i].host != '') a[i].target = '_blank';
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

    //fixing watchlist
    function YB_checkList(u) {
        document.querySelector('#content h1').innerHTML = 'Checking watchlist tags...';
        let c = document.querySelector('#content .walloftext');
        let t = addElem('div',{id:'_ydb_temp', style:'display:none'}, document.getElementById('content'));
        c.innerHTML = 'This may take few seconds. Do not close this page until finished<br><br>';

        let o = ls.aliases[u[1]];
        let y = simpleParse(o.b);
        for (let i=0; i<y.length; i++) y[i] = y[i].trim();
        c.innerHTML += y.length+' tags detected.<br>';

        let parse = function (request) {
            t.innerHTML = request.responseText;
            y[request.id] = t.getElementsByClassName('tag')[0].dataset.tagName;
            c.innerHTML += y[request.id]+'<br>';
            t.innerHTML = '';
            if (request.id < y.length) get(request.id+1);
            return;
        };

        let readyHandler = function(request) {
            return function () {
                if (request.readyState === 4) {
                    if (request.status === 200) return parse(request);
                    else if (request.status === 0) {
                        c.innerHTML += '[ERROR]<br>';
                        if (request.id < y.length) return get(request.id+1);
                        return false;
                    }
                    else {
                        c.innerHTML += '[ERROR]<br>';
                        if (request.id < y.length) return get(request.id+1);
                        return false;
                    }
                }
            };
        };

        let get = function(i) {
            if (i == y.length) {
                finish();
                return;
            }
            c.innerHTML += y[i]+' -> ';
            let req = new XMLHttpRequest();
            req.id = i;
            req.onreadystatechange = readyHandler(req);
            req.open('GET', '/tags/'+encodeURIComponent(y[i]));
            req.send();
        };

        let finish = function() {
            o.b = simpleCombine(y);
            write(ls);
            console.log('kek');
            if (history.length == 1) close();
            else history.back();
        };
        if (y.length>0) get(0);
    }

    function YDB() {
        let x = location.search.slice(1);
        if (location.search == "") YB_createEmpty();
        else if (location.search == "?") YB_createEmpty();
        else {
            let u = x.split('?');
            if (u[0] == "checklist") YB_checkList(u);
        }
    }

    badge(document);

    flashNotifies();
    profileLinks();
    if (ls.patchSearch) bigSearch();
    aliases();
    asWatchlist();
    linksPatch(document);
    if (location.pathname == "/pages/yourbooru") {
        YDB();
    }
    if (document.getElementById('comments') != undefined) document.getElementById('comments').addEventListener("DOMNodeInserted",function(e) {
        if (e.target.classList == undefined) return;
        if (!(e.target.id == 'image_comments' || (e.target.classList.contains('block') && e.target.classList.contains('communication')))) return;
        badge(e.target);
        linksPatch(e.target);});
})();
