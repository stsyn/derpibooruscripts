// ==UserScript==
// @name         YCH.Commishes YDB:ADUp module
// @version      0.2.1
// @author       stsyn
// @include      https://portfolio.commishes.com/upload/show/*
// @include      https://ych.commishes.com/followUp/show/*
// @include      https://ych.commishes.com/auction/show/*

// @include      *://trixiebooru.org/images/new*
// @include      *://derpibooru.org/images/new*
// @include      *://www.trixiebooru.org/images/new*
// @include      *://www.derpibooru.org/images/new*
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/images/new*
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/upload/*
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/images/new*
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/images/new*
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js

// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      commishes.com

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp-YCHC.user.js

// ==/UserScript==

(function() {
    'use strict';
    let mainDomain = 'www.derpibooru.org';
    let stop = 0;
    let multiplier, hermit;

    try {
        mainDomain = unsafeWindow._YDB_public.funcs.getDerpHomeDomain();
    }
    catch(e) {
    }

    function literalToNumeric(x) {
        let arr = '0123456789abcdefghijklmnopqrstuv';
        let res = 0;
        for (let i=0; i<x.length; i++) {
            let d = x.length-i-1;
            res += arr.indexOf(x[i])*Math.pow(arr.length, d);
        }
        return res;
    }

    if (location.hostname == 'ych.commishes.com') {
        // easy
        let container = document.querySelector('a[href*="/uploads/"]') || document.querySelector('img[src*="/uploads/"]');
        let src;
        if (container != undefined) {
            src = container.href || container.src;
        }
        else return;
        let holder;
        if (location.href.indexOf('/followUp/')==-1) {
            holder = document.querySelector('.material.unpadded+.spacer');
            holder.style.minHeight = '3em';
            holder.style.textAlign = 'center';
        }
        else {
            holder = document.querySelector('.row4.fluid');
        }
        let aname = document.querySelector('a[href*="/user/"]:not([href*="commishes.com"])').innerHTML.toLowerCase();
        let text = '';
        if (document.querySelector('div.material .force-wrap') != undefined) text = document.querySelector('div.material .force-wrap').innerText;
        let href = '//'+mainDomain+'/images/new?newImg='+encodeURIComponent(src)+
			'&src='+encodeURIComponent(location.href)+
            '&tags='+encodeURIComponent('artist:'+aname)+',ych'+(location.href.indexOf('/followUp/')>-1?' result':',commission')+
            '&description='+(encodeURIComponent(text));
        holder.appendChild(InfernoAddElem('a', {href:href,target:'_blank',innerHTML:'Share on Derpibooru',className:'like-toggle iconless',style:{fontSize:'120%',marginTop:'0.7em',display:'inline-block'}}, []));
    }
    else if (location.hostname == 'portfolio.commishes.com') {
        // hard
        let container = document.querySelector('#preview-container img');
        if (container == undefined) {
            return;
        }
        let holder = document.querySelector('.user-info+.spacer');
        holder.style.minHeight = '6em';

        let xid = document.querySelector('meta[name="og:image"]').content.split('/')[5];
        let src = 'https://portfolio.commishes.com/image/'+xid+'/original/';
        let aname = document.querySelectorAll('.user-info a')[1].innerText;

        let draw = function (url) {
            let href = '//'+mainDomain+'/images/new?newImg='+encodeURIComponent(url)+
			'&src='+encodeURIComponent(location.href)+
            '&tags='+encodeURIComponent('artist:'+aname.toLowerCase());

            let button = holder.appendChild(InfernoAddElem('a', {href:href,target:'_blank',innerHTML:'Share on Derpibooru', className:'like-toggle iconless',
                                                                 style:{fontSize:'120%',marginTop:'0.2em',display:'inline-block'}}, []));
			let direct = holder.appendChild(InfernoAddElem('a', {href:url,target:'_blank',innerHTML:'Direct link', className:'iconless',
                                                                 style:{fontSize:'120%',marginTop:'0.2em',display:'block'}}, []));
        };

        let error = function() {
            let button = holder.appendChild(InfernoAddElem('a', {innerHTML:'Sorry, file is inaccessible :(', className:'like-toggle iconless',
                                                                 style:{fontSize:'120%',marginTop:'0.2em',display:'inline-block'}}, []));
        }

        GM_xmlhttpRequest({
            method:   "HEAD",
            url:      src,
            onload: function(r) {
                let ext = r.responseHeaders.split('\r\n').find(function(e) {return e.startsWith('content-type:')}).split('/').pop();
                if (ext.startsWith('html')) error();
                else draw(r.finalUrl+'/.'+ext);
            },
            onerror:  function(r) {
                console.log('Error', r);
            }
        });
    }
})();
