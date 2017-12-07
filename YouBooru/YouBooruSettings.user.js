// ==UserScript==
// @name         YourBooru:Settings
// @namespace    http://tampermonkey.net/

// @include      *://trixiebooru.org/settings
// @include      *://derpibooru.org/settings
// @include      *://www.trixiebooru.org/settings
// @include      *://www.derpibooru.org/settings
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/settings
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/settings
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/settings
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/settings

// @include      *://trixiebooru.org/pages/yourbooru*
// @include      *://derpibooru.org/pages/yourbooru*
// @include      *://www.trixiebooru.org/pages/yourbooru*
// @include      *://www.derpibooru.org/pages/yourbooru*
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/pages/yourbooru*
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/pages/yourbooru*
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/pages/yourbooru*
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/pages/yourbooru*

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js
// @version      0.4.6
// @description  Global settings script for YourBooru script family
// @author       stsyn
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    var feedz, feedzCache, feedzURLS;
    var config;
    let svd = localStorage._ydb;
    if (svd === undefined) return;
    else {
        try {
            feedz = JSON.parse(svd);
        }
        catch (e) {
            console.log('Cannot get cached feeds');
        }
    }
    svd = localStorage._ydb_caches;
    if (svd !== undefined) {
        try {
            feedzCache = JSON.parse(svd);
        }
        catch (e) {
            console.log('Cannot get feeds cache');
        }
    }
    svd = localStorage._ydb_cachesUrls;
    if (svd !== undefined) {
        try {
            feedzURLS = JSON.parse(svd);
        }
        catch (e) {
            console.log('Cannot get feeds cache');
        }
    }

    svd = localStorage._ydb_config;
    if (svd !== undefined) {
        try {
            config = JSON.parse(svd);
        }
        catch (e) {
            console.log('Cannot get configs');
        }
    }


    function ChildsAddElem(tag, values,parent, childs) {
        var t;
        if (values != undefined && values.id != undefined && document.getElementById(values.id) != undefined) {
            if (document.querySelectorAll(tag+'#'+values.id).length == 0) {
                t = document.getElementById(values.id);
                t.parentNode.removeChild(t);
                t = document.createElement(tag);
            }
            else {
                t = document.getElementById(values.id);
                while (t.firstChild) {
                    t.removeChild(t.firstChild);
                }
            }
        }
        else t = document.createElement(tag);

        for (var i in values) if (i!='events' && i!='dataset') t[i] = values[i];
        if (values.dataset != undefined) for (var i in values.dataset) t.dataset[i] = values.dataset[i];
        if (values.events != undefined) values.events.forEach(function(v,i,a) {
            t.addEventListener(v.t, v.f);
        });

        if (childs != undefined && childs.length != undefined) childs.forEach(function(c,i,a) {
            t.appendChild(c);
        });

        parent.appendChild(t);
        return t;
    }

    function register() {
        if (window._YDB_public == undefined) window._YDB_public = {};
        if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
        window._YDB_public.settings.settings = {
            name:'Settings',
            container:'_ydb',
            version:GM_info.script.version
        };
    }

    function resetCaches() {
        for (let i=0; i<feedz.length; i++) {
            if (feedz[i] == undefined) continue;
            feedz[i].cachedResp = '';
            feedz[i].saved = 0;
            feedz[i].responsed = 0;
        }
        localStorage._ydb = JSON.stringify(feedz);
    }

    function write() {
        localStorage._ydb = JSON.stringify(feedz);
        localStorage._ydb_caches = JSON.stringify(feedzCache);
        localStorage._ydb_cachesUrls = JSON.stringify(feedzURLS);
    }

    function writeConfig() {
        localStorage._ydb_config = JSON.stringify(config);
    }

    function hideBlock(e) {
        let u = e.target;
        while (!u.classList.contains('block__header')) u = u.parentNode;
        let x = u.nextSibling;
        x.classList.toggle('hidden');
        u.getElementsByClassName('fa')[0].innerHTML = (x.classList.contains('hidden')?'\uF061':'\uF063');
    }

    function putLine(e, f, i) {
        let l = addElem('div', {classList:'block__content alternating-color',style:(f == undefined?'display:none;':'')+'marginBottom:.5em'}, e);

        addElem('span', {innerHTML:'Name '}, l);
        addElem('input', {
            type:'text',
            value:f.name,
            style:'width:16em',
            dataset:{id:i},
            className:'input',
            events:[{
                t:'input',
                f:function(e) {feedz[e.target.dataset.id].name = e.target.value; write();}
            }]
        }, l);

        addElem('span', {innerHTML:'Sort ',style:'margin-left:.5em'}, l);
        addElem('input', {
            type:'text',
            value:f.sort,
            style:'width:5em',
            dataset:{id:i},
            className:'input',
            events:[{
                t:'input',
                f:function(e) {feedz[e.target.dataset.id].sort = e.target.value; write();}
            }]
        }, l);

        addElem('span', {innerHTML:'Direction ',style:'margin-left:.5em'}, l);
        addElem('input', {
            type:'text',
            value:f.sd,
            style:'width:4em',
            dataset:{id:i},
            className:'input',
            events:[{
                t:'input',
                f:function(e) {feedz[e.target.dataset.id].sd = e.target.value; write();}
            }]
        }, l);

        addElem('span', {innerHTML:'Cache (minutes) ',style:'margin-left:.5em'}, l);
        addElem('input', {
            type:'text',
            value:f.cache,
            style:'width:3em',
            dataset:{id:i},
            className:'input',
            events:[{
                t:'input',
                f:function(e) {feedz[e.target.dataset.id].cache = parseInt(e.target.value); write();}
            }]
        }, l);

        addElem('span', {innerHTML:'... or update each ',style:'margin-left:.5em'}, l);
        addElem('input', {
            type:'text',
            value:f.ccache,
            style:'width:4em',
            dataset:{id:i},
            className:'input',
            events:[{
                t:'input',
                f:function(e) {feedz[e.target.dataset.id].ccache = parseInt(e.target.value); write();}
            }]
        }, l);

        addElem('a', {
            type:'text',
            style:'margin-left:.5em',
            innerHTML:'Share',
            className:'button',
            target:'_blank',
            title:'Copy this link and paste it somewhere to share that feed!',
            href:'/pages/yourbooru?addFeed?'+f.name+'?'+encodeURIComponent(f.query).replace(/\(/,'%28').replace(/\)/,'%29')+'?'+f.sort+'?'+f.sd+'?'+f.cache+'?'+f.ccache
        }, l);


        if (i > 0) {
            addElem('span', {
                type:'text',
                style:'margin-left:.5em; float:right',
                className:'button',
                innerHTML:'<i class="fa fa-arrow-up"></i>',
                events:[{
                    t:'click',
                    f:function() {
                        var t = feedz[i];
                        feedz[i] = feedz[i-1];
                        feedz[i-1] = t;

                        t = feedzCache[i];
                        feedzCache[i] = feedzCache[i-1];
                        feedzCache[i-1] = t;

                        t = feedzURLS[i];
                        feedzURLS[i] = feedzURLS[i-1];
                        feedzURLS[i-1] = t;

                        write();
                        renderList(e);
                    }
                }]
            }, l);
        }

        /******************/

        addElem('span', {innerHTML:'<br>Query '}, l);
        addElem('textarea', {
            type:'text',
            value:f.query,
            style:'width:calc(100% - 26.2em);resize:none;height:2em;vertical-align:-50%;overflow:hidden',
            dataset:{id:i},
            className:'input',
            events:[{
                t:'input',
                f:function(e) {
                    feedz[e.target.dataset.id].query = e.target.value;
                    feedz[e.target.dataset.id].saved = 0;
                    write();
                }},{
                    t:'focus',
                    f:function(e) {
                        e.target.style.height = '7em';
                        e.target.style.width = 'calc(100% - 4em)';
                        e.target.style.position = 'absolute';
                        e.target.style.overflowY = 'auto';
                    }},{
                        t:'blur',
                        f:function(e) {
                            e.target.style.height = '2em';
                            e.target.style.width = 'calc(100% - 26.2em)';
                            e.target.style.position = 'static';
                            e.target.style.overflowY = 'hidden';
                        }
                    }]
        }, l);

        ChildsAddElem('label', {innerHTML:' Double size '}, l, [
            InfernoAddElem('input', {
                type:'checkbox',
                checked:f.double,
                dataset:{id:i},
                events:[{
                    t:'click',
                    f:function(e) {
                        feedz[e.target.dataset.id].double = e.target.checked;
                        feedz[e.target.dataset.id].saved = 0;
                        write();
                    }
                }]
            })]
                     );

        addElem('span', {
            style:'margin-left:.5em;margin-right:0',
            dataset:{id:i},
            classList:'button commission__category',
            innerHTML:'Reset cache',
            events:[{
                t:'click',
                f:function(e) {
                    feedz[e.target.dataset.id].saved = 0;
                    write();
                }
            }]
        }, l);

        addElem('span', {
            style:'margin-left:.5em;margin-right:0',
            dataset:{id:i},
            classList:'button commission__category',
            innerHTML:'Delete',
            events:[{
                t:'click',
                f:function(e) {
                    feedz.splice(e.target.dataset.id, 1);
                    feedzCache.splice(e.target.dataset.id, 1);
                    feedzURLS.splice(e.target.dataset.id, 1);
                    write();
                }
            }]
        }, l);


        if (i<feedz.length-1) {
            addElem('span', {
                type:'text',
                style:'margin-left:.5em; float:right',
                className:'button',
                innerHTML:'<i class="fa fa-arrow-down"></i>',
                events:[{
                    t:'click',
                    f:function() {
                        var t = feedz[i];
                        feedz[i] = feedz[i+1];
                        feedz[i+1] = t;

                        t = feedzCache[i];
                        feedzCache[i] = feedzCache[i+1];
                        feedzCache[i+1] = t;

                        t = feedzURLS[i];
                        feedzURLS[i] = feedzURLS[i+1];
                        feedzURLS[i+1] = t;

                        write();
                        renderList(e);
                    }
                }]
            }, l);
        }
    }

    function renderList(fel) {
        fel.innerHTML = '';
        if (feedz != undefined) {
            for (let i=0; i<feedz.length; i++) if (feedz[i] == undefined) {
                feedz.splice(i,1);
                i--;
            };
            for (let i=0; i<feedz.length; i++) putLine(fel, feedz[i], i);
        }
        else {
            fel.classList.add('block--warning');
            fel.classList.add('block');
            fel.classList.add('block--fixed');
            fel.innerHTML = 'Everything is lost! Please visit derpibooru mainpage to reload default feeds and make everything work again!';
        }
    }

    function _YDB_feeds(cont2) {
        ChildsAddElem('div', {className:'block__header'}, cont2, [
            InfernoAddElem('a', {events:[{t:'click',f:hideBlock}]}, [
                InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
                InfernoAddElem('span', {innerHTML:' Feeds'})
            ])
        ]);

        let cont = addElem('div', {className:'block__content hidden'}, cont2);

        ChildsAddElem('label', {innerHTML:'Do not remove watchlist '}, cont, [
            InfernoAddElem('input', {
                type:'checkbox',
                checked:config.feeds.doNotRemoveWatchList,
                events:[{
                    t:'change',
                    f:function(e) {
                        config.feeds.doNotRemoveWatchList = this.checked;
                        writeConfig();
                    }
                }]
            })]
                     );

        ChildsAddElem('p', {innerHTML:'Images in each feed: '}, cont, [
            InfernoAddElem('input', {
                type:'text',
                value:config.feeds.imagesInFeeds,
                style:'width:3em',
                className:'input',
                events:[{
                    t:'input',
                    f:function(e) {
                        config.feeds.imagesInFeeds = parseInt(this.value);
                        writeConfig();
                    }
                }]
            })]
                     );

        ChildsAddElem('label', {innerHTML:'Watch link on the right side '}, cont, [
            InfernoAddElem('input', {
                type:'checkbox',
                checked:config.feeds.watchFeedLinkOnRightSide,
                events:[{
                    t:'change',
                    f:function(e) {
                        config.feeds.watchFeedLinkOnRightSide = this.checked;
                        writeConfig();
                    }
                }]
            })]
                     );

        ChildsAddElem('label', {innerHTML:'Remove unneeded content from HTML '}, cont, [
            InfernoAddElem('input', {
                type:'checkbox',
                checked:config.feeds.optimizeLS,
                events:[{
                    t:'change',
                    f:function(e) {
                        config.feeds.optimizeLS = this.checked;
                        writeConfig();
                    }
                }]
            })]
                     );

        let fel = addElem('div', {className:'block'}, cont);

        addElem('span', {
            type:'text',
            className:'button',
            innerHTML:'Add feed',
            events:[{
                t:'click',
                f:function(e) {
                    if (feedz != undefined) for (let i=0; i<=feedz.length; i++) {
                        if (feedz[i] == undefined) {
                            feedz[i] = {
                                name:'New feed',
                                query:'*',
                                sort:'',
                                sd:'desc',
                                cache:30,
                                double:false
                            };
                            write();
                            break;
                        }
                    }
                    renderList(fel);
                }
            }]
        }, cont);

        addElem('span', {
            type:'text',
            classList:'button commission__category',
            innerHTML:'Reset feeds cache',
            style:'margin-left:1em; margin-right:6em',
            events:[{
                t:'click',
                f:resetCaches
            }]
        }, cont);

        addElem('input', {type:'checkbox',id:'ydb_reset'}, cont);

        addElem('span', {
            type:'text',
            classList:'button commission__category',
            innerHTML:'Reset everything',
            style:'margin-left:.5em; margin-right:6em',
            events:[{
                t:'click',
                f:function() {
                    if (document.getElementById('ydb_reset').checked) {
                        feedz = undefined;
                        write();
                        location.href = '/';
                    }
                    else {
                        alert('Mark checkbox first!');
                    }
                }
            }]
        }, cont);

        renderList(fel);
    }

    function renderCustom(e, cont2) {
        if (e.s.length == 0) return;
        let ss = {};
        try {
            ss = JSON.parse(localStorage[e.container]);
        }
        catch (ex) {
        }

        ChildsAddElem('div', {className:'block__header'}, cont2, [
            InfernoAddElem('a', {events:[{t:'click',f:hideBlock}]}, [
                InfernoAddElem('i', {className:'fa', innerHTML:'\uF061'}),
                InfernoAddElem('span', {innerHTML:' '+e.name})
            ])
        ]);

        let cont = addElem('div', {className:'block__content hidden'}, cont2);

        let l = document.createElement('div');

        e.s.forEach(function (v,i,a) {
            let x, y;
            if (v.type == 'checkbox') {
                y = ChildsAddElem('label', {innerHTML:' '+v.name+' '}, l, [
                    x = InfernoAddElem('input',{type:'checkbox',checked:ss[v.parameter], events:[{t:'click', f:function(ev) {
                        ss[v.parameter] = ev.target.checked;
                        localStorage[e.container] = JSON.stringify(ss);
                    }}]})
                ]);
            }
            else if (v.type == 'input') {
                y = addElem('span', {innerHTML:' '+v.name+' '},l);
                x = addElem('input', {type:'text',className:'input',value:ss[v.parameter], events:[{t:'input',f:function(ev) {
                    ss[v.parameter] = ev.target.value;
                    localStorage[e.container] = JSON.stringify(ss);
                }}]},l);
            }
            else if (v.type == 'select') {
                y = addElem('span', {innerHTML:' '+v.name+' '},l);
                let elems = v.values.map(function (vv,i,a) {
                    return InfernoAddElem('option',{innerHTML:vv.name, value:vv.value, selected:(vv.value == ss[v.parameter])});
                });
                x = ChildsAddElem('select', {size:1, className:'input', events:[{t:'change', f:function(ev){
                    ss[v.parameter] = ev.target.value;
                    localStorage[e.container] = JSON.stringify(ss);
                }}]}, l, elems);
            }

            else if (v.type == 'breakline') {
                y = addElem('br', {},l);
            }

            if (v.attrI != undefined) for (let s in v.attrI) x[s] = v.attrI[s];
            if (v.attrS != undefined) for (let s in v.attrS) y[s] = v.attrS[s];

        });
        cont.appendChild(l);
    }

    function settingPage() {
        let cont;
        document.getElementById('js-setting-table').insertBefore(cont = InfernoAddElem('div',{className:'block__tab hidden',dataset:{tab:'YourBooru'},style:'position:relative'}), document.querySelector('[data-tab="local"]').nextSibling);

        addElem('a',{href:'#',innerHTML:'YourBooru',dataset:{clickTab:'YourBooru'}},document.getElementsByClassName('block__header')[0]);

        let el;

        el = document.createElement('div');
        el.className = 'block block--fixed block--warning';
        el.innerHTML = 'Settings on this tab are saved in the current browser. They are independent of whether you are logged in or not.<br><b>Every setting will apply when you change anything. Be careful.</b>';
        cont.appendChild(el);
        if (window._YDB_public != undefined) {
            if (window._YDB_public.settings != undefined) {
                for (let k in window._YDB_public.settings) {
                    if (k!='settings') {
                        if (k == 'feeds') {
                            _YDB_feeds(cont);
                        }
                        else if (window._YDB_public.settings[k] != undefined && window._YDB_public.settings[k].s != undefined) {
                            renderCustom(window._YDB_public.settings[k], cont);
                        }
                    }
                }
            }
        }

        for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
            try {
                let k = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
                renderCustom(k, cont);
            }
            catch (e) {
                console.log('Error JSON processing "'+document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value+'"');
            }
        }

        ChildsAddElem('div', {className:'block__header'}, cont, [
            InfernoAddElem('span', {innerHTML:'Installed plugins', style:'margin-left:12px'})
        ]);

        let s = '';
        for (let key in window._YDB_public.settings) {
            let ax = window._YDB_public.settings[key];
            addElem('div', {classList:'block__content alternating-color', innerHTML:ax.name+' ver. '+ax.version}, cont);
        }
        for (let i=0; i<document.getElementsByClassName('_YDB_reserved_register').length; i++) {
            try {
                let ax = JSON.parse(document.getElementsByClassName('_YDB_reserved_register')[i].dataset.value);
                addElem('div', {classList:'block__content alternating-color', innerHTML:ax.name+' ver. '+ax.version}, cont);
            }
            catch (e) {
            }
        }

        ChildsAddElem('div', {className:'block__header'}, cont, [
            InfernoAddElem('a', {innerHTML:'Backup', target:'_blank', href:'/pages/yourbooru?backup'})
        ]);

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
        setTimeout(hh, 500);
    }

    ////////////////////////////

    function YB_createEmpty() {
        document.querySelector('#content h1').innerHTML = 'Ooops!';
        document.querySelector('#content .walloftext').innerHTML = '<p>YourBooru cannot get what you want. Sorry :(</p><p>Try to check url you used. If you believe that you found a bug report to me please!</p>';
    }

    function YB_insertFeed(u) {
        var f = {};
        let i;
        for (i=0; i<feedz.length; i++) {
            if (feedz[i].name == decodeURIComponent(u[1])) {
                f = feedz[i];
                break;
            }
        }
        f.loaded = false;
        f.name = decodeURIComponent(u[1]);
        f.query = decodeURIComponent(u[2]).replace(/\\+/g,' ');
        f.sort = u[3];
        f.sd = u[4];
        f.cache = u[5];
        f.ccache = u[6];
        feedz[i] = f;
        write();

        if (history.length == 1) close();
        else history.back();
    }

    function YB_addFeed(u) {
        document.querySelector('#content h1').innerHTML = 'Add feed';
        var c = document.querySelector('#content .walloftext');
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

    ///////////////////////////

    function YB_backup() {
        document.querySelector('#content h1').innerHTML = 'Backup';
        var c = document.querySelector('#content .walloftext');

        var s = '';
        s = 'Copy content from that textbox and save it somewhere.';
        s += '<textarea id="_yy_container" class="button" style="width:100%; height:20em" readonly="true"></textarea>';
        s += '<br>If you want to "restore" backup:<br>1. Open developer console (usually F12) while using derpibooru;<br>2. Copypaste saved code inside;<br>3. Press Enter.';
        c.innerHTML = s;
        s = 'localStorage._ydb_config = \''+localStorage._ydb_config+'\';\n';
        s += 'localStorage._ydb_main = \''+localStorage._ydb_main+'\';\n';
        s += 'localStorage._ydb = \''+localStorage._ydb+'\';\n';
        if (window._YDB_public != undefined) {
            if (window._YDB_public.settings != undefined) {
                for (let k in ax) {
                    if (k!='feeds' && k!='settings') {
                        if (window._YDB_public.settings[k] != undefined) {
                            s += 'localStorage.'+k+' = \''+localStorage[k]+'";\n';
                        }
                    }
                }
            }
        }
        document.getElementById('_yy_container').value = s;


    }

    function yourbooruPage() {
        let x = location.search.slice(1);
        if (location.search == "") YB_createEmpty();
        else if (location.search == "?") YB_createEmpty();
        else {
            let u = x.split('?');
            if (u[0] == "addFeed") YB_addFeed(u);
            else if (u[0] == "backup") YB_backup(u);
            else YB_createEmpty();
        }
    }

    if (location.pathname == "/settings") setTimeout(settingPage, 100);
    if (location.pathname == "/pages/yourbooru") yourbooruPage();
    register();
})();
