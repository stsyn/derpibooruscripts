// ==UserScript==
// @name         YourBooruSettings
// @namespace    http://tampermonkey.net/
// @include      *://trixiebooru.org/settings
// @include      *://derpibooru.org/settings
// @include      *://www.trixiebooru.org/settings
// @include      *://www.derpibooru.org/settings
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/settings
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/settings
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/settings
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/settings
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YouBooruSettings.user.js
// @version      0.1.0
// @description  Feedz
// @author       stsyn
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var feedz;
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
    
    function resetCaches() {
        for (let i=0; i<feedz.length; i++) {
            feedz[i].cachedResp = '';
            feedz[i].saved = 0;
            feedz[i].responsed = 0;
        }
        localStorage._ydb = JSON.stringify(feedz);
    }
    
    function write() {
        localStorage._ydb = JSON.stringify(feedz);
    }
    
    function putLine(e, f, i) {
        let l = document.createElement('div');
        if (f == undefined) {
            l.style.display = 'none';
            return;
        }
        let x = document.createElement('span');
        l.style.marginBottom = '1em';
        x.innerHTML = 'Name ';
        l.appendChild(x);
        
        x = document.createElement('input');
        x.type = 'text';
        x.value = f.name;
        x.style.width = '16em';
        x.id = i;
        x.className = 'input';
        x.addEventListener('input', function() {feedz[this.id].name = this.value; write();});
        l.appendChild(x);
        
        x = document.createElement('span');
        x.style.marginLeft = '1em';
        x.innerHTML = 'Sort ';
        l.appendChild(x);
        
        x = document.createElement('input');
        x.type = 'text';
        x.value = f.sort;
        x.id = i;
        x.style.width = '6em';
        x.className = 'input';
        x.addEventListener('input', function() {feedz[this.id].sort = this.sort; write();});
        l.appendChild(x);
        
        x = document.createElement('span');
        x.style.marginLeft = '1em';
        x.innerHTML = 'Direction';
        l.appendChild(x);
        
        x = document.createElement('input');
        x.type = 'text';
        x.value = f.sd;
        x.id = i;
        x.style.width = '4em';
        x.className = 'input';
        x.addEventListener('input', function() {feedz[this.id].sd = this.sd; write();});
        l.appendChild(x);
        
        x = document.createElement('span');
        x.style.marginLeft = '1em';
        x.innerHTML = 'Cache (in minutes)';
        l.appendChild(x);
        
        x = document.createElement('input');
        x.type = 'text';
        x.value = f.cache;
        x.id = i;
        x.style.width = '3em';
        x.className = 'input';
        x.addEventListener('input', function() {feedz[this.id].cache = parseInt(this.cache); write();});
        l.appendChild(x);
        
        x = document.createElement('span');
        x.innerHTML = '... or update each (in minutes)';
        l.appendChild(x);
        
        x = document.createElement('input');
        x.type = 'text';
        x.value = f.ccache;
        x.id = i;
        x.style.width = '4em';
        x.className = 'input';
        x.addEventListener('input', function() {feedz[this.id].ccache = parseInt(this.ccache); write();});
        l.appendChild(x);
        
        x = document.createElement('span');
        x.innerHTML = '<br>Query ';
        l.appendChild(x);
        
        x = document.createElement('input');
        x.type = 'text';
        x.value = f.query;
        x.id = i;
        x.className = 'input';
        x.style.width = 'calc(100% - 9em)';
        x.addEventListener('input', function() {feedz[this.id].query = this.query; write();});
        l.appendChild(x);
        
        x = document.createElement('span');
        x.style.marginLeft = '1em';
        x.id = i;
        x.classList = 'button commission__category';
        x.innerHTML = 'Delete';
        x.addEventListener('click',function() {
            feedz[this.id] = undefined;
            write();
            this.parentNode.style.display = 'none';
        });
        l.appendChild(x);
        
        e.appendChild(l);
    }
    
    let cont = document.getElementsByClassName('block__tab')[0];
    let el = document.createElement('h4');
    el.innerHTML = 'YourBooru';
    cont.appendChild(el);

    el = document.createElement('p');
    el.innerHTML = 'Change your feeds here. Please notice that settings are saved only in the current browser.<br>';
        let fel = document.createElement('div');
        el.appendChild(fel);

        let el2 = document.createElement('span');
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
                        cache:30
                    };
                    write();
                    break;
                }
            }
            location.reload();
        });
        el.appendChild(el2);

        el2 = document.createElement('span');
        el2.classList = 'button commission__category';
        el2.innerHTML = 'Reset feeds cache';
        el2.style.marginRight = '12em';
        el2.addEventListener('click',resetCaches);
        el.appendChild(el2);

        el2 = document.createElement('input');
        el2.type = 'checkbox';
        el2.id = 'ydb_reset';
        el.appendChild(el2);

        el2 = document.createElement('span');
        el2.classList = 'button commission__category';
        el2.innerHTML = 'Reset everything';
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
        el.appendChild(el2);
    cont.appendChild(el);
    if (feedz != undefined) for (let i=0; i<feedz.length; i++) putLine(fel, feedz[i], i);
    else {
        fel.classList.add('block--warning');
        fel.classList.add('block');
        fel.classList.add('block--fixed');
        fel.innerHTML = 'Everything is lost! Please visit derpibooru mainpage to reload default feeds and make everything work again!';
    }
})();
