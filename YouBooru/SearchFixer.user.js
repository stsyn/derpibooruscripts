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
// @version      0.1.0a
// @description  Allows Next/Prev navigation with not id sorting
// @author       stsyn
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
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

    //////////////////////////////////////////////
    function unblink(e) {
        e.classList.remove('active');
        e.classList.remove('interaction--upvote');
    }

    function blink(e) {
        e.classList.add('active');
        e.classList.add('interaction--upvote');
        setTimeout(function() {unblink(e);},200);
    }

    function parse(r, type) {
        let u = JSON.parse(r.responseText);
        let i;
        if (myURL.params.sf!= 'random') {
            if (r.level == 'pre') {
                if (u.total == 0) {
                    //не удалось найти следующую пикчу по номеру, пробуем теперь реально следующую
                    let req = new XMLHttpRequest();
                    req.sel = r.sel;
                    req.level = 'act';
                    req.onreadystatechange = readyHandler(req, type);
                    req.open('GET', compileQuery(type));
                    req.send();
                    return;
                }
                else {
                    //нашли с тем же критерием, но другим очком
                    document.querySelectorAll(r.sel)[0].href=location.href.replace(id, u.search[0].id);
                    blink(document.querySelectorAll(r.sel)[0]);
                    return;
                }

            }
            else if (r.level == 'act') {
                if (u.total == 0) {
                    //чот нихуя не нашли опять. Видимо, на сей раз реально ничего нет
                    document.querySelectorAll(r.sel)[0].href='#';
                }
                else {
                    if (u.total > 1) {
                        let param;
                        if (myURL.params.sf == 'score') param='score';
                        else if (myURL.params.sf == 'width') param='width';
                        else if (myURL.params.sf == 'height') param='height';
                        else if (myURL.params.sf == 'comments') param='comment_count';
                        if (u.search[1][param] == u.search[0][param]) {
                            //мы чот нашли, но у соседней по тому же критерию то же самое, нужно уточнить, что ставить
                            let req = new XMLHttpRequest();
                            req.sel = r.sel;
                            req.level = 'post';
                            req.onreadystatechange = readyHandler(req, type);
                            req.open('GET', compilePostQuery(type, u.search[1][param]));
                            req.send();
                            return;
                        }
                        else {
                            //а все норм, она одна такая
                            document.querySelectorAll(r.sel)[0].href=location.href.replace(id, u.search[0].id);
                            blink(document.querySelectorAll(r.sel)[0]);
                            return;
                        }
                    }
                    else {
                        //в запросе ваще одна пихча
                        document.querySelectorAll(r.sel)[0].href=location.href.replace(id, u.search[0].id);
                        blink(document.querySelectorAll(r.sel)[0]);
                        return;
                    }
                }
            }
            else if (r.level == 'post') {
                let i=0;
                if (r.sel == '.js-rand' && u.search[0].id == id) i=1;
                if (i==1 && u.total == 1) {
                    //рандом высрал только эту пикчу
                    document.querySelectorAll(r.sel)[0].href='#';
                }
                //вот это точно должна идти
                document.querySelectorAll(r.sel)[0].href=location.href.replace(id, u.search[i].id);
                blink(document.querySelectorAll(r.sel)[0]);
                return;
            }
        }
        else {
            if (u.total>1)
            {
                let x = 0;
                if (u.search[0].id == id) x = 1;
                document.querySelectorAll('.js-next')[0].href=location.href.replace(id, u.search[x].id);
                if (u.total>2) {
                    if (u.search[x+1].id == id) document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x+2].id);
                    else document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x+1].id);
                }
                else document.querySelectorAll('.js-prev')[0].href=location.href.replace(id, u.search[x].id);
                if (u.total>3) {
                    if (u.search[x+2].id == id) document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x+3].id);
                    else document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x+2].id);
                }
                else document.querySelectorAll('.js-rand')[0].href=location.href.replace(id, u.search[x].id);
            }
            else {
                document.querySelectorAll('.js-rand')[0].href='#';
                document.querySelectorAll('.js-prev')[0].href='#';
                document.querySelectorAll('.js-next')[0].href='#';
            }
            blink(document.querySelectorAll('.js-rand')[0]);
            blink(document.querySelectorAll('.js-prev')[0]);
            blink(document.querySelectorAll('.js-next')[0]);
        }
    }

    function readyHandler(request, type) {
        return function () {
            if (request.readyState === 4) {
                if (request.status === 200) return parse(request, type);
                else if (request.status === 0) {
                    console.log ('[YDB:SE]: Server timeout');
                    return false;
                }
                else {
                    console.log ('[YDB:SE]: Response '+request.status);
                    return false;
                }
            }
        };
    }

    function compilePostQuery(type, v) {
        //well, we should find first pic
        let prevUrl = '//'+myURL.host+'/search.json?q='+myURL.params.q;
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
        prevUrl+='&perpage=1&sf=created_at&sd='+((myURL.params.sd=='asc'^type=='prev')?'asc':'desc');
        return prevUrl;
    }

    function compilePreQuery(type) {
        //due to unpredictable sorting mechanism firstly gonna check by id
        if (type == 'random' || myURL.params.sf == "random") return compileQuery(type);
        let prevUrl = '//'+myURL.host+'/search.json?q='+myURL.params.q;
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
        let prevUrl = '//'+myURL.host+'/search.json?q='+myURL.params.q;
        if (type !='random' && myURL.params.sf != "random") {
            let dir = ((myURL.params.sd=='asc'^type=='prev')?'gt':'lt');
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

    function execute() {
        let url, req;
        if (myURL.params.sf != "random") {
            url = compilePreQuery('prev');
            req = new XMLHttpRequest();
            req.sel = '.js-prev';
            req.level = 'pre';
            req.onreadystatechange = readyHandler(req, 'prev');
            req.open('GET', url);
            req.send();

            url = compilePreQuery('next');
            req = new XMLHttpRequest();
            req.sel = '.js-next';
            req.level = 'pre';
            req.onreadystatechange = readyHandler(req, 'next');
            req.open('GET', url);
            req.send();

        }
        url = compilePreQuery('random');
        req = new XMLHttpRequest();
        req.sel = '.js-rand';
        req.level = 'post';
        req.onreadystatechange = readyHandler(req, 'random');
        req.open('GET', url);
        req.send();
    }

    let myURL = parseURL(location.href);
    let id = parseInt(myURL.path.slice(1));

    if (isNaN(id)) {
        id = myURL.path.split('/');
        if (id[1] == 'images');
        id = parseInt(id[2]);
    }

    if (!isNaN(id) && myURL.params.sf != undefined && myURL.params.sf != "" && myURL.params.sf != 'created_at' && myURL.params.sf != 'wilson' && myURL.params.sf != 'relevance') {
        myURL.params.sf = myURL.params.sf.split('%')[0];
        execute();
    }
})();
