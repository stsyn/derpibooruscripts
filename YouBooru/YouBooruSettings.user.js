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

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js
// @version      0.4
// @description  Global settings script for YourBooru script family
// @author       stsyn
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    var feedz;
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
    svd = localStorage._ydb_config;
    if (svd !== undefined) {
        try {
            config = JSON.parse(svd);
        }
        catch (e) {
            console.log('Cannot get configs');
        }
    }

    function register() {
        let date = new Date();
        let x = localStorage._ydb_main;
        if (x == undefined) x = {};
        else x = JSON.parse(x);
        x.settings = {};
        x.settings.timestamp = date.getTime();
        x.settings.version = GM_info.script.version;
        localStorage._ydb_main = JSON.stringify(x);
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
    }

    function writeConfig() {
        localStorage._ydb_config = JSON.stringify(config);
    }

    function putLine(e, f, i) {
        let l = document.createElement('div');
        if (f == undefined) {
            l.style.display = 'none';
            return;
        }
        let x = document.createElement('span');
        l.style.marginBottom = '.5em';
        x.innerHTML = 'Name ';
        l.appendChild(x);

        x = document.createElement('input');
        x.type = 'text';
        x.value = f.name;
        x.style.width = '18.1em';
        x.id = i;
        x.className = 'input';
        x.addEventListener('input', function(e) {feedz[e.target.id].name = e.target.value; write();});
        l.appendChild(x);

        x = document.createElement('span');
        x.style.marginLeft = '.5em';
        x.innerHTML = 'Sort ';
        l.appendChild(x);

        x = document.createElement('input');
        x.type = 'text';
        x.value = f.sort;
        x.id = i;
        x.style.width = '5em';
        x.className = 'input';
        x.addEventListener('input', function(e) {feedz[e.target.id].sort = e.target.value; write();});
        l.appendChild(x);

        x = document.createElement('span');
        x.style.marginLeft = '.5em';
        x.innerHTML = 'Direction';
        l.appendChild(x);

        x = document.createElement('input');
        x.type = 'text';
        x.value = f.sd;
        x.id = i;
        x.style.width = '4em';
        x.className = 'input';
        x.addEventListener('input', function(e) {feedz[e.target.id].sd = e.target.value; write();});
        l.appendChild(x);

        x = document.createElement('span');
        x.style.marginLeft = '.5em';
        x.innerHTML = 'Cache (minutes)';
        l.appendChild(x);

        x = document.createElement('input');
        x.type = 'text';
        x.value = f.cache;
        x.id = i;
        x.style.width = '3em';
        x.className = 'input';
        x.addEventListener('input', function(e) {feedz[e.target.id].cache = parseInt(e.target.value); write();});
        l.appendChild(x);

        x = document.createElement('span');
        x.innerHTML = ' ... or update each';
        l.appendChild(x);

        x = document.createElement('input');
        x.type = 'text';
        x.value = f.ccache;
        x.id = i;
        x.style.width = '4em';
        x.className = 'input';
        x.addEventListener('input', function(e) {feedz[e.target.id].ccache = parseInt(e.target.ccache); write();});
        l.appendChild(x);

        x = document.createElement('a');
        x.style.marginLeft = '.5em';
        x.classList = 'button';
        x.innerHTML = 'Share';
        x.target = '_blank';
        x.title = 'Copy this link and paste it somewhere to share that feed!';
        x.href = '/pages/yourbooru?addFeed?'+f.name+'?'+encodeURIComponent(f.query).replace(/\(/,'%28').replace(/\)/,'%29')+'?'+f.sort+'?'+f.sd+'?'+f.cache+'?'+f.ccache;
        l.appendChild(x);

        if (i > 0) {
            x = document.createElement('span');
            x.style.marginLeft = '.5em';
            x.style.float = 'right';
            x.classList = 'button';
            x.innerHTML = '<i class="fa fa-arrow-up"></i>';
            x.addEventListener('click',function() {
                var t = feedz[i];
                feedz[i] = feedz[i-1];
                feedz[i-1] = t;
                write();
                renderList(e);
            });
            l.appendChild(x);

        }

        /******************/

        x = document.createElement('span');
        x.innerHTML = '<br>Query ';
        l.appendChild(x);

        x = document.createElement('textarea');
        x.value = f.query;
        x.id = i;
        x.className = 'input';
        x.style.width = 'calc(100% - 26.2em)';
        x.style.resize = 'none';
        x.style.height = '2em';
        x.style.verticalAlign = '-50%';
        x.style.overflow = 'hidden';
        x.addEventListener('input', function(e) {
            feedz[e.target.id].query = e.target.value;
            feedz[e.target.id].cachedResp = undefined;
            write();
        });
        x.addEventListener('focus', function(e) {
            e.target.style.height = '7em';
            e.target.style.width = 'calc(100% - 4em)';
            e.target.style.position = 'absolute';
            e.target.style.overflowY = 'auto';
        });
        x.addEventListener('blur', function(e) {
            e.target.style.height = '2em';
            e.target.style.width = 'calc(100% - 26.2em)';
            e.target.style.position = 'static';
            e.target.style.overflowY = 'hidden';
        });
        l.appendChild(x);

        let el2 = document.createElement('label');
        el2.innerHTML = ' Double size ';
        el2.id = i;
        l.appendChild(el2);
        x = document.createElement('input');
        x.type = 'checkbox';
        x.checked = f.double;
        x.id = i;
        x.addEventListener('click', function(e) {
            feedz[e.target.id].double = e.target.checked;
            feedz[e.target.id].cachedResp = undefined;
            write();
        });
        el2.appendChild(x);


        x = document.createElement('span');
        x.style.marginLeft = '.5em';
        x.style.marginRight = '0';
        x.id = i;
        x.classList = 'button commission__category';
        x.innerHTML = 'Reset cache';
        x.addEventListener('click',function(e) {
            feedz[e.target.id].cachedResp = undefined;
            write();
        });
        l.appendChild(x);

        x = document.createElement('span');
        x.style.marginLeft = '.5em';
        x.style.marginRight = '0';
        x.id = i;
        x.classList = 'button commission__category';
        x.innerHTML = 'Delete';
        x.addEventListener('click',function(e) {
            feedz.splice(e.target.id, 1);
            write();
            e.target.parentNode.style.display = 'none';
        });
        l.appendChild(x);

        if (i<feedz.length-1) {
            x = document.createElement('span');
            x.style.marginLeft = '.5em';
            x.style.float = 'right';
            x.classList = 'button';
            x.innerHTML = '<i class="fa fa-arrow-down"></i>';
            x.addEventListener('click',function() {
                var t = feedz[i];
                feedz[i] = feedz[i+1];
                feedz[i+1] = t;
                write();
                renderList(e);
            });
            l.appendChild(x);
        }

        x = document.createElement('hr');
        l.appendChild(x);
        e.appendChild(l);
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

    function _YDB_feeds(cont) {
        let el = document.createElement('h4');
        el.innerHTML = 'Feeds';
        cont.appendChild(el);

        let el2 = document.createElement('label');
        el2.innerHTML = 'Do not remove watchlist ';
        cont.appendChild(el2);
        el = document.createElement('input');
        el.type = 'checkbox';
        el.checked = config.feeds.doNotRemoveWatchList;
        el.addEventListener('change', function() {config.feeds.doNotRemoveWatchList = this.checked; writeConfig();});
        el2.appendChild(el);

        el2 = document.createElement('p');
        el2.innerHTML = 'Images in each feed: ';
        cont.appendChild(el2);
        el = document.createElement('input');
        el.type = 'text';
        el.value = config.feeds.imagesInFeeds;
        el.style.width = '3em';
        el.className = 'input';
        el.addEventListener('input', function() {config.feeds.imagesInFeeds = parseInt(this.value); writeConfig();});
        el2.appendChild(el);

        el2 = document.createElement('label');
        el2.innerHTML = 'Watch link on the right side ';
        cont.appendChild(el2);
        el = document.createElement('input');
        el.type = 'checkbox';
        el.checked = config.feeds.watchFeedLinkOnRightSide;
        el.addEventListener('change', function() {config.feeds.watchFeedLinkOnRightSide = this.checked; writeConfig();});
        el2.appendChild(el);

        el2 = document.createElement('label');
        el2.innerHTML = '<br>Remove unneeded content from HTML (disable if issues happens (but it will fill up your localStorage!))';
        cont.appendChild(el2);
        el = document.createElement('input');
        el.type = 'checkbox';
        el.checked = config.feeds.optimizeLS;
        el.addEventListener('change', function() {config.feeds.optimizeLS = this.checked; writeConfig();});
        el2.appendChild(el);

        let fel = document.createElement('div');
        cont.appendChild(fel);

        el2 = document.createElement('span');
        el2.classList = 'button';
        el2.innerHTML = 'Add feed';
        el2.addEventListener('click',function() {
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
        });
        cont.appendChild(el2);

        el2 = document.createElement('span');
        el2.classList = 'button commission__category';
        el2.innerHTML = 'Reset feeds cache';
        el2.style.marginLeft = '1em';
        el2.style.marginRight = '6em';
        el2.addEventListener('click',resetCaches);
        cont.appendChild(el2);

        el2 = document.createElement('input');
        el2.type = 'checkbox';
        el2.id = 'ydb_reset';
        cont.appendChild(el2);

        el2 = document.createElement('span');
        el2.classList = 'button commission__category';
        el2.innerHTML = 'Reset everything';
        el2.style.marginLeft = '.5em';
        el2.style.marginRight = '6em';
        el2.addEventListener('click', function() {
            if (document.getElementById('ydb_reset').checked) {
                feedz = undefined;
                write();
                location.href = '/';
            }
            else {
                alert('Mark checkbox first!');
            }
        });
        cont.appendChild(el2);

        el2 = document.createElement('input');
        el2.type = 'checkbox';
        el2.id = 'ydb_feeds_del';
        cont.appendChild(el2);

        el2 = document.createElement('span');
        el2.classList = 'button commission__category';
        el2.innerHTML = 'I uninstalled YourBooru: Feeds.<br>';
        el2.style.marginLeft = '.5em';
        el2.href = '#';
        el2.addEventListener('click', function() {
            if (document.getElementById('ydb_feeds_del').checked) {
                feedz = undefined;
                write();
                ax.feeds = undefined;
                localStorage._ydb_main = JSON.stringify(ax);
                location.reload();
            }
            else {
                alert('Mark checkbox first!');
            }
        });
        cont.appendChild(el2);

        renderList(fel);
    }

    function renderCustom(e, cont) {
        let el = document.createElement('h4');
        let ss = {};
        try {
            ss = JSON.parse(localStorage[e.container]);
        }
        catch (ex) {
        }
        el.innerHTML = e.name;
        cont.appendChild(el);

        let l = document.createElement('div');

        e.s.forEach(function (v,i,a) {
            if (v.type == 'checkbox') {
                let el2 = document.createElement('label');
                el2.innerHTML = ' '+v.name+' ';
                l.appendChild(el2);
                let x = document.createElement('input');
                x.type = 'checkbox';
                x.checked = ss[v.parameter];
                x.addEventListener('click', function(ev) {
                    ss[v.parameter] = ev.target.checked;
                    localStorage[e.container] = JSON.stringify(ss);
                });
                el2.appendChild(x);
            }

            else if (v.type == 'breakline') {
                let x = document.createElement('br');
                l.appendChild(x);
            }

        });
        cont.appendChild(l);
    }

    function settingPage() {

        let cont = document.createElement('div');
        cont.className = 'block__tab hidden';
        cont.setAttribute('data-tab','YourBooru');
        cont.style.position = 'relative';
        document.getElementById('js-setting-table').insertBefore(cont, document.querySelector('[data-tab="local"]').nextSibling);

        let tab = document.createElement('a');
        tab.href = '#';
        tab.setAttribute('data-click-tab','YourBooru');
        tab.innerHTML = 'YourBooru';
        document.getElementsByClassName('block__header')[0].appendChild(tab);

        let el;
        let ax = JSON.parse(localStorage._ydb_main);

        el = document.createElement('div');
        el.className = 'block block--fixed block--warning';
        el.innerHTML = 'Settings on this tab are saved in the current browser. They are independent of whether you are logged in or not.<br><b>Every setting will apply when you change anything.</b>';
        cont.appendChild(el);
        if (ax.feeds != undefined) {
            _YDB_feeds(cont);
        }
        if (window._YDB_public != undefined) {
            if (window._YDB_public.settings != undefined) {
                for (let k in ax) {
                    if (k!='feeds' && k!='settings') {
                        if (window._YDB_public.settings[k] != undefined) {
                            renderCustom(window._YDB_public.settings[k], cont);
                        }
                    }
                }
            }
        }

        if (ax.settings != undefined) {
            el = document.createElement('h4');
            el.innerHTML = '&nbsp';
            cont.appendChild(el);
            el = document.createElement('h4');
            el.innerHTML = 'Installed plugins';
            cont.appendChild(el);
            let s = '';
            el = document.createElement('p');
            for (let key in ax) {
                if (key == 'feeds') s+='YourBooru: Feeds ';
                else if (key == 'settings') s+='YourBooru: Settings ';
                else s+='id='+key+' ';

                s+='ver. '+ax[key].version;
                s+='<br>';
            }
            el.innerHTML =s;
            cont.appendChild(el);
        }
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

    function yourbooruPage() {
        let x = location.search.slice(1);
        if (location.search == "") YB_createEmpty();
        else if (location.search == "?") YB_createEmpty();
        else {
            let u = x.split('?');
            if (u[0] == "addFeed") YB_addFeed(u);
            else YB_createEmpty();
        }
    }

    if (location.pathname == "/settings") setTimeout(settingPage, 100);
    if (location.pathname == "/pages/yourbooru") yourbooruPage();
    register();
})();
