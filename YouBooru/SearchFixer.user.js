// ==UserScript==
// @name         Derpibooru Search Fixer
// @namespace    http://tampermonkey.net/
// @include      *://trixiebooru.org/*
// @include      *://derpibooru.org/*
// @include      *://www.trixiebooru.org/*
// @include      *://www.derpibooru.org/*
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/*
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/*
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/*
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/*
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/SearchFixer.user.js
// @version      0.2.7
// @description  Allows Next/Prev/Random navigation with not id sorting
// @author       stsyn
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    // These settings also may be edited via YourBooru:Settings
    // https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js

    var settings = {
        //Which sortings type should be fixed
        score:true,
        random:true,
        sizes:true,
        comments:true,

        //Fix random button
        randomButton:true,

        //Blink on completion
        blink:true,

        //Change to true if you want to use these settings
        override:false,

        //If true, navigation will be fixed while page loading
        preloading:true,

        //With which sortings type find button should be fixed
        scoreUp:true,
        sizesUp:true,
        commentsUp:true,
        everyUp:true
    };

    var findTemp = 0, findIter = 1;

    //https://habrahabr.ru/post/177559/
    function parseURL(url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':',''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function(){
                var ret = {},
                    seg = a.search.replace(/^\?/,'').split('&'),
                    len = seg.length, i = 0, s;
                for (;i<len;i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
            hash: a.hash.replace('#',''),
            path: a.pathname.replace(/^([^\/])/,'/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
            segments: a.pathname.replace(/^\//,'').split('/')
        };
    }

    function register() {
        if (window._YDB_public == undefined) window._YDB_public = {};
        if (window._YDB_public.settings == undefined) window._YDB_public.settings = {};
        window._YDB_public.settings.searchSortingFixer = {
            name:'Search Sorting Fixer',
            version:GM_info.script.version,
            container:'_ssf',
            s:[
                {type:'checkbox', name:'Fix score sorting', parameter:'score'},
                {type:'checkbox', name:'Fix random sorting', parameter:'random'},
                {type:'checkbox', name:'Fix sizes sorting', parameter:'sizes'},
                {type:'checkbox', name:'Fix comments sorting', parameter:'comments'},
                {type:'breakline'},
                {type:'checkbox', name:'Fix random button', parameter:'randomButton'},
                {type:'checkbox', name:'Blink on completion', parameter:'blink'},
                {type:'checkbox', name:'Fix buttons on start (except "Find" button)', parameter:'preloading'},
                {type:'breakline'},
                {type:'checkbox', name:'Smart Find button at: score sorting', parameter:'scoreUp'},
                {type:'checkbox', name:'; sizes sorting', parameter:'sizesUp'},
                {type:'checkbox', name:'; comments sorting', parameter:'commentsUp'},
                {type:'checkbox', name:'; unsupported sortings', parameter:'everyUp'}
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
        setTimeout(function() {unblink(e);},200);
    }

    function failBlink(e) {
        if (!settings.blink) return;
        e.classList.add('active');
        e.classList.add('interaction--downvote');
        e.classList.remove('interaction--fave');
        setTimeout(function() {unblink(e);},200);
    }

    function complete (target, link) {
        blink(document.querySelectorAll(target)[0]);
        if (settings.preloading && target != '.js-up') document.querySelectorAll(target)[0].href=link;
        else location.href=link;
    }

    function fail (target) {
        failBlink(document.querySelectorAll(target)[0]);
        if (settings.preloading && target != '.js-up') document.querySelectorAll(target)[0].href='#';
    }

    function request(link, elem, target, level) {
        let req = new XMLHttpRequest();
        console.log(link, target, level, findTemp);
        req.sel = elem;
        req.level = level;
        req.onreadystatechange = readyHandler(req, target);
        req.open('GET', link);
        req.send();
        return;
    }

    function parse(r, type) {
        let u = JSON.parse(r.responseText);
        console.log(u, type, r.responseUrl);
        let i;
        if (type == 'find') {
            let param = '';
            if (myURL.params.sf == 'score') param = parseInt(document.getElementsByClassName('score')[0].innerHTML);
            else if (myURL.params.sf == 'width') param = document.querySelectorAll('#extrameta strong')[document.querySelectorAll('#extrameta strong').length-1].innerHTML.split('x')[0];
            else if (myURL.params.sf == 'height') param = document.querySelectorAll('#extrameta strong')[document.querySelectorAll('#extrameta strong').length-1].innerHTML.split('x')[1];
            else if (myURL.params.sf == 'comments') param = document.querySelectorAll('.comments_count')[0].innerHTML;

            if (r.level == 'act' && param == '') {
                findTemp = u.total;
                request('//'+myURL.host+'/search.json?q=%2A', r.sel, 'find', 'pre');
                return;
            }
            if (r.level == 'act' && param != '') {
                findTemp = u.total;
                findIter = parseInt(findTemp/50)+1;
                request(compileXQuery(findIter, true), r.sel, 'find', 'post');
                return;
            }
            else if (r.level == 'post') {
                if (u.search.length > 0) for (let i=0; i<u.search.length; i++) {
                    if (u.search[i].id == id) {
                        findTemp = ((findIter-1)*50)+i;
                        request('//'+myURL.host+'/search.json?q=%2A', r.sel, 'find', 'pre');
                        return;
                    }
                }
                else {
                    return;
                }
                findIter++;
                request(compileXQuery(findIter, true), r.sel, 'find', 'post');
                return;
            }
            else {
                complete('.js-up', compileXQuery(parseInt(findTemp/u.search.length+1), false));
                return;
            }
        }
        if (myURL.params.sf!= 'random') {
            if (r.level == 'pre') {
                if (u.total == 0) {
                    //не удалось найти следующую пикчу по номеру, пробуем теперь реально следующую
                    request(compileQuery(type), r.sel, type, 'act');
                    return;
                }
                else {
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
                        if (myURL.params.sf == 'score') param='score';
                        else if (myURL.params.sf == 'width') param='width';
                        else if (myURL.params.sf == 'height') param='height';
                        else if (myURL.params.sf == 'comments') param='comment_count';
                        else param = '';
                        if (u.search[1][param] == u.search[0][param]) {
                            //мы чот нашли, но у соседней по тому же критерию то же самое, нужно уточнить, что ставить
                            request(compilePostQuery(type, u.search[1][param]), r.sel, type, 'post');
                            return;
                        }
                        else {
                            //а все норм, она одна такая
                            complete(r.sel, location.href.replace(id, u.search[0].id));
                            return;
                        }
                    }
                    else {
                        //в запросе ваще одна пихча
                        complete(r.sel, location.href.replace(id, u.search[0].id));
                        return;
                    }
                }
            }
            else if (r.level == 'post') {
                let i=0;
                if (r.sel == '.js-rand' && u.search[0].id == id) i=1;
                if (i==1 && u.total == 1) {
                    //рандом высрал только эту пикчу
                    fail(r.sel);
                }
                //вот это точно должна идти
                complete(r.sel, location.href.replace(id, u.search[0].id));
                return;
            }
        }
        else {
            if (settings.preload) {
                if (u.total>1) {
                    let x = 0;
                    if (u.search[0].id == id) x = 1;
                    document.querySelectorAll('.js-next')[0].href=location.href.replace(id, u.search[x].id);
                    if (u.total>2) {
                        if (u.search[x+1].id == id) document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x+2].id);
                        else document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x+1].id);
                    }
                    else document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x].id);
                    if (settings.randomButton) {
                        if (u.total>3) {
                            if (u.search[x+2].id == id) document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x+3].id);
                            else document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x+2].id);
                        }
                        else document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x].id);
                    }
                }
                else {
                    if (settings.randomButton) fail('.js-rand');
                    fail('.js-prev');
                    fail('.js-next');
                }
                if (settings.randomButton) blink(document.querySelectorAll('.js-rand')[0]);
                blink(document.querySelectorAll('.js-prev')[0]);
                blink(document.querySelectorAll('.js-next')[0]);
            }
            else {
                if (u.total>1) complete(r.sel, location.href.replace(id, u.search[0].id));
                else fail(r.sel);
            }
        }
    }

    function readyHandler(request, type) {
        return function () {
            if (request.readyState === 4) {
                if (request.status === 200) return parse(request, type);
                else if (request.status === 0) {
                    console.log ('[YDB:SE]: Server timeout');
                    fail(r.sel);
                    return false;
                }
                else {
                    console.log ('[YDB:SE]: Response '+request.status);
                    fail(r.sel);
                    return false;
                }
            }
        };
    }

    function compilePostQuery(type, v, page) {
        //well, we should find first pic
        let prevUrl = '//'+myURL.host+'/search.json?q=('+myURL.params.q+')';
        let dir = ((myURL.params.sd=='asc'^type=='prev')?'gte':'lte');
        if (myURL.params.sf == "score") {
            prevUrl += ',(score:'+v+')';
        }
        else if (myURL.params.sf == "width") {
            prevUrl += ',(width:'+v+')';
        }
        else if (myURL.params.sf == "height") {
            prevUrl += ',(height:'+v+')';
        }
        else if (myURL.params.sf == "comments") {
            prevUrl += ',(comment_count:'+v+')';
        }
        prevUrl+=((type!='find')?('&perpage=1'):('&perpage=50&page='+page))+'&sf=created_at&sd='+((myURL.params.sd=='asc'^type=='prev')?'asc':'desc');
        return prevUrl;
    }

    function compilePreQuery(type) {
        //due to unpredictable sorting mechanism firstly gonna check by id
        if (type == 'find') return compileLtQuery(1);
        if (type == 'random' || myURL.params.sf == "random") return compileQuery(type);

        let prevUrl = '//'+myURL.host+'/search.json?q=('+myURL.params.q+')';
        let dir = ((myURL.params.sd=='asc'^type=='prev')?'gt':'lt');
        if (myURL.params.sf == "score") {
            let cscore = parseInt(document.getElementsByClassName('score')[0].innerHTML);
            prevUrl += ',(score:'+cscore+',id.'+dir+':'+id+')';
        }
        else if (myURL.params.sf == "width") {
            let cscore = document.querySelectorAll('#extrameta strong')[document.querySelectorAll('#extrameta strong').length-1].innerHTML.split('x')[0];
            prevUrl += ',(width:'+cscore+',id.'+dir+':'+id+')';
        }
        else if (myURL.params.sf == "height") {
            let cscore = document.querySelectorAll('#extrameta strong')[document.querySelectorAll('#extrameta strong').length-1].innerHTML.split('x')[1];
            prevUrl += ',(height:'+cscore+',id.'+dir+':'+id+')';
        }
        else if (myURL.params.sf == "comments") {
            let cscore = document.querySelectorAll('.comments_count')[0].innerHTML;
            prevUrl += ',(comment_count:'+cscore+',id.'+dir+':'+id+')';
        }
        prevUrl+='&perpage=1&sf=created_at&sd='+((myURL.params.sd=='asc'^type=='prev')?'asc':'desc');
        return prevUrl;
    }

    function compileQuery(type) {
        let prevUrl = '//'+myURL.host+'/search.json?q=('+myURL.params.q+')';
        if (type !='random' && myURL.params.sf != "random") {
            let dir = ((myURL.params.sd=='asc'^(type=='prev' || type=='find'))?'gt':'lt');
            if (myURL.params.sf == "score") {
                let cscore = parseInt(document.getElementsByClassName('score')[0].innerHTML);
                prevUrl += ',((score:'+cscore+',id.'+dir+':'+id+')+||+(score.'+dir+':'+cscore+'))';
            }
            else if (myURL.params.sf == "width") {
                let cscore = document.querySelectorAll('#extrameta strong')[document.querySelectorAll('#extrameta strong').length-1].innerHTML.split('x')[0];
                prevUrl += ',((width:'+cscore+',id.'+dir+':'+id+')+||+(width.'+dir+':'+cscore+'))';
            }
            else if (myURL.params.sf == "height") {
                let cscore = document.querySelectorAll('#extrameta strong')[document.querySelectorAll('#extrameta strong').length-1].innerHTML.split('x')[1];
                prevUrl += ',((height:'+cscore+',id.'+dir+':'+id+')+||+(height.'+dir+':'+cscore+'))';
            }
            else if (myURL.params.sf == "comments") {
                let cscore = document.querySelectorAll('.comments_count')[0].innerHTML;
                prevUrl += ',((comment_count:'+cscore+',id.'+dir+':'+id+')+||+(comment_count.'+dir+':'+cscore+'))';
            }
            prevUrl+='&perpage=2&sf='+myURL.params.sf+'&sd='+((myURL.params.sd=='asc'^type=='prev')?'asc':'desc');
        }
        else prevUrl+='&perpage='+(myURL.params.sf=="random"?4:2)+'&sf=random';
        return prevUrl;
    }

    function compileLtQuery(page) {
        let prevUrl = '//'+myURL.host+'/search.json?q=('+myURL.params.q+')';
        let dir = ((myURL.params.sd!='asc')?'gt':'lt');
        let sd = ((myURL.params.sd!='asc')?'asc':'desc');
        let sf = myURL.params.sf;
        if (myURL.params.sf == "score") {
            let cscore = parseInt(document.getElementsByClassName('score')[0].innerHTML);
            prevUrl += ',(score.'+dir+':'+cscore+')';
        }
        else if (myURL.params.sf == "width") {
            let cscore = document.querySelectorAll('#extrameta strong')[document.querySelectorAll('#extrameta strong').length-1].innerHTML.split('x')[0];
            prevUrl += ',(width.'+dir+':'+cscore+')';
        }
        else if (myURL.params.sf == "height") {
            let cscore = document.querySelectorAll('#extrameta strong')[document.querySelectorAll('#extrameta strong').length-1].innerHTML.split('x')[1];
            prevUrl += ',(height.'+dir+':'+cscore+')';
        }
        else if (myURL.params.sf == "comments") {
            let cscore = document.querySelectorAll('.comments_count')[0].innerHTML;
            prevUrl += ',(comment_count.'+dir+':'+cscore+')';
        }
        else {
            prevUrl += ',(id.'+dir+':'+id+')';
            sf = 'created_at';
        }
        prevUrl+='&page='+page+'&perpage=50&sf='+sf+'&sd='+sd;
        return prevUrl;
    }

    function compileXQuery(page, pp) {
        let sf = myURL.params.sf;
        if (myURL.params.sf == '' || myURL.params.sf == 'wilson' || myURL.params.sf == 'random' || myURL.params.sf == 'relevance') sf = 'created_at';
        return '//'+myURL.host+'/search'+(pp?'.json':'')+'?q='+myURL.params.q+(pp?'&perpage=50':'')+'&sf='+(sf==undefined?'':sf)+'&sd='+(myURL.params.sd==undefined?'':myURL.params.sd)+'&page='+page;
    }

    function crLink(sel, level, type) {
        request(compilePreQuery(type), sel, type, level);
    };

    function execute() {
        let url, req;
        if (myURL.params.sf != "random") {
            crLink('.js-prev', 'pre', 'prev');
            crLink('.js-next', 'pre', 'next');

        }
        if (settings.randomButton || myURL.params.sf == "random") {
            crLink('.js-rand', 'post', 'random');
        }
    }

    if (localStorage._ssf == undefined || settings.override) {
        localStorage._ssf = JSON.stringify(settings);
    }
    else {
        try {
            var settings2 = JSON.parse(localStorage._ssf);
            settings = settings2;
        }
        catch(e) {
            localStorage._ssf = JSON.stringify(settings);
        }
    }
    register();
    let myURL = parseURL(location.href);
    let id = parseInt(myURL.path.slice(1));

    if (isNaN(id)) {
        id = myURL.path.split('/');
        if (id[1] == 'images');
        id = parseInt(id[2]);
    }

    if (
        !isNaN(id) &&
        myURL.params.sf != undefined &&
        myURL.params.sf != "" &&
        myURL.params.sf != 'created_at' &&
        myURL.params.sf != 'wilson' &&
        myURL.params.sf != 'relevance' &&
        !(myURL.params.sf == 'score' && !settings.score) &&
        !(myURL.params.sf == 'comments' && !settings.comments) &&
        !(myURL.params.sf == 'random' && !settings.random) &&
        !((myURL.params.sf == 'width' || myURL.params.sf == 'height') && !settings.sizes)
    ) {
        myURL.params.sf = myURL.params.sf.split('%')[0];
        if (settings.preloading) execute();
        else {
            document.querySelectorAll('.js-next')[0].addEventListener('click',function(e) {
                e.preventDefault();
                if (settings.blink) {
                    let elem = e.target;
                    if (elem.classList.contains('fa')) elem = elem.parentNode;
                    elem.classList.add('interaction--fave');
                    elem.classList.add('active');
                }
                crLink('.js-next', (myURL.params.sf=='random')?'post':'pre', 'next');
            });
            document.querySelectorAll('.js-prev')[0].addEventListener('click',function(e) {
                e.preventDefault();
                if (settings.blink) {
                    let elem = e.target;
                    if (elem.classList.contains('fa')) elem = elem.parentNode;
                    elem.classList.add('interaction--fave');
                    elem.classList.add('active');
                }
                crLink('.js-prev', (myURL.params.sf=='random')?'post':'pre', 'prev');
            });
            document.querySelectorAll('.js-rand')[0].addEventListener('click',function(e) {
                e.preventDefault();
                if (settings.blink) {
                    let elem = e.target;
                    if (elem.classList.contains('fa')) elem = elem.parentNode;
                    elem.classList.add('interaction--fave');
                    elem.classList.add('active');
                }
                crLink('.js-rand', 'post', 'random');
            });
        }
    }

    if (!isNaN(id) && (
        (myURL.params.sf == 'score' && settings.scoreUp) ||
        (myURL.params.sf == 'comments' && settings.comments) ||
        ((myURL.params.sf == 'width' || myURL.params.sf == 'height') && settings.sizesUp) ||
        ((((myURL.params.sf == undefined || myURL.params.sf == '') && myURL.params.q != undefined && myURL.params.q != '' && myURL.params.q != '%2A') || myURL.params.sf == 'wilson' || myURL.params.sf == 'created_at' || myURL.params.sf == 'random' || myURL.params.sf == 'relevance') && settings.everyUp)

    )) {
        document.querySelectorAll('.js-up')[0].addEventListener('click',function(e) {
            e.preventDefault();
            if (settings.blink) {
                let elem = e.target;
                if (elem.classList.contains('fa')) elem = elem.parentNode;
                elem.classList.add('interaction--fave');
                elem.classList.add('active');
            }
            crLink('.js-up', 'act', 'find');
        });
    }
})();
