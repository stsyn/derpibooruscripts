// ==UserScript==
// @name         YCH.Commishes YDB:ADUp module
// @version      0.2.6
// @author       stsyn
// @include      https://portfolio.commishes.com/upload/show/*
// @include      https://ych.commishes.com/followUp/show/*
// @include      https://ych.commishes.com/auction/show/*

// @include      /http(s|):\/\/(www\.|)(trixie|derpi)booru.org\/images\/new.*/
// @include      *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/images/new*
// @include      *://*.orzgs6djmvrg633souxg64th.*.*/upload/*
// @include      *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/images/new*
// @include      *://*.mrsxe4djmjxw64tvfzxxezy.*.*/images/new*

// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ADUp-mini.js

// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
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
      res += arr.indexOf(x[i].toLowerCase())*Math.pow(arr.length, d);
    }
    return res;
  }

  if (location.hostname == 'ych.commishes.com') {
    // easy
    let container = document.querySelector('a[href*="/uploads/"]') || document.querySelector('img[src*="/uploads/"]');
    let src;
    if (container) {
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
    holder.appendChild(createElement('a.like-toggle.iconless', {href:href,target:'_blank',style:{fontSize:'120%',marginTop:'0.7em',display:'inline-block'}}, 'Share on Derpibooru'));
  }
  else if (location.hostname == 'portfolio.commishes.com') {
    // hard
    const container = document.querySelector('.span.l1.desktop-only .spacer');
    if (!container) {
      return;
    }

    container.style.height = 'auto';
    container.style.marginBottom = '20px';

    const xid = document.querySelector('meta[name="og:image"]').content.split('/')[5];
    const src = 'https://portfolio.commishes.com/image/'+xid+'/original/';
    const aname = document.querySelector('.span.s2 div a').innerText;

    const draw = function (url) {
      const href = '//'+mainDomain+'/images/new?newImg='+encodeURIComponent(url)+
            '&src='+encodeURIComponent(location.href)+
            '&tags='+encodeURIComponent('artist:'+aname.toLowerCase());

      const button = container.appendChild(createElement('a.like-toggle.iconless', {href:href,target:'_blank',
                                                                style:{fontSize:'120%',marginTop:'0.2em',display:'inline-block'}}, 'Share on Derpibooru'));
      const direct = container.appendChild(createElement('a.iconless', {href:url,target:'_blank',
                                                                style:{fontSize:'120%',marginTop:'0.2em',display:'block'}}, 'Direct link'));
    };

    const error = function() {
      let button = container.appendChild(createElement('a.like-toggle.iconless', {style:{fontSize:'120%',marginTop:'0.2em',display:'inline-block'},href:src}, 'Sorry, file is inaccessible :('));
    }

    console.log(src);
    GM_xmlhttpRequest({
      method:   "HEAD",
      url:      src,
      onload: function(r) {
        const ext = r.responseHeaders.split('\r\n').find(e => e.startsWith('content-type:')).split('/').pop();
        if (ext.startsWith('html')) error();
        else draw(r.finalUrl+'/.'+ext);
      },
      onerror:  function(r) {
        console.log('Error', r);
      }
    });
  }
})();
