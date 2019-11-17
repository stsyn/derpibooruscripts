// ==UserScript==
// @name         DeviantArt ADUp Module
// @version      0.2.1
// @author       stsyn
// @include      http*://*.deviantart.com/*
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp-DeviantArt.user.js
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
  'use strict';
  let mainDomain = 'www.derpibooru.org';
  const leak = true;

  let l, width, height, i=0, dunno, hasFull, eclipse = false, artist;
  var req = false;

  function spawn(link, text) {
    let target, target2, target3;
    if (eclipse) {
      target = document.querySelector('._3fcE7._15yPL.fXGZA.WikyH');
      target2 = target.querySelector('._ydb_adup') || document.createElement('div');
      target2.className = 'JQhXs _ydb_adup';
      target.insertBefore(target2, target.children[0]);
      target3 = document.createElement('div');
      target3.className = '_2iAFC';
      target2.appendChild(target3);
    } else {
      target = Array.from(document.getElementsByClassName('dev-meta-actions')).pop();
    }
    let ds = document.createElement('a');
    ds.className = eclipse?'V7yJQ':'dev-page-button dev-page-button-with-text dev-page-download';
    ds.target = '_blank';
    if (!hasFull) ds.style = 'width:calc(50% - 18px);display:inline-block;margin-right:4px';

    ds.innerHTML = '<i></i><span class="label"> Upload on DB</span><span class="text"></span>';


    ds.href = '//'+mainDomain+'/images/new?newImg='+encodeURIComponent(link)+
      '&src='+encodeURIComponent(location.href)+
      '&tags='+encodeURIComponent('artist:'+artist)+
      '&description='+(encodeURIComponent(text))+
      '&newWidth='+width+
      '&newHeight='+height;

    ds.getElementsByTagName('i')[0].style.width = '20px';
    ds.getElementsByTagName('i')[0].style.background = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJtMTMuMiwuNmM1LDkuMi0uMiwxNS41LTIuOSwxNS4zcy0zLjYsLTQuNy05LjIsLTQuNWMyLjYsLTMuNCA4LjMsLS4zIDkuOCwtMS42czMuNywtNS40IDIuMywtOS4yIiBmaWxsPSIjNzNkNmVkIj48L3BhdGg+PHBhdGggZD0ibTExLDAuNi0xLjcsMS40LTEuNywtMS4yLjgsMi0xLjcsMWgxLjhsLTUuNSw5LjcuNCwuMiA1LjUsLTkuNy42LDEuOCAuNSwtMiAyLjIsLS4xLTEuOCwtMS4xLjYsLTIiIGZpbGw9IiM5NGMxZGQiPjwvcGF0aD48Y2lyY2xlIGN4PSIxMy41IiBjeT0iOC41IiBmaWxsPSIjZmZmIiBpZD0iZSIgcj0iMC41Ij48L2NpcmNsZT48dXNlIHg9Ii0yIiB5PSIzIiB4bGluazpocmVmPSIjZSI+PC91c2U+PHVzZSB4PSItNiIgeT0iNCIgeGxpbms6aHJlZj0iI2UiPjwvdXNlPjx1c2UgeD0iLTIuOCIgeT0iNiIgeGxpbms6aHJlZj0iI2UiPjwvdXNlPjwvc3ZnPgo=')";
    i = 1;
    if (eclipse) {
      ds.querySelector('span.text').innerHTML = ' '+text;
    } else {
      ds.querySelector('span.text').innerHTML = text;
    }
    if (eclipse) {
      target3.appendChild(ds);
    } else {
      target.appendChild(ds);
    }

    if (!hasFull) {
      let ls = ds.cloneNode(true);
      ls.href = link;
      ls.getElementsByTagName('i')[0].style.background = "url(https://st.deviantart.net/minish/deviation/action-sprites.png?)";
      ls.getElementsByTagName('i')[0].style.backgroundPosition = '-1px -78px';
      ls.querySelector('span.label').innerHTML = " Direct link";
      if (eclipse) {
        ls.querySelector('span.text').innerHTML = ' '+text;
      } else {
        ls.querySelector('span.text').innerHTML = text;
      }
      if (eclipse) {
        target3.appendChild(ls);
      } else {
        target.appendChild(ls);
      }
    }

    target.classList.add('patched');
  }
  
  function DA404() {
    const code = parseInt(location.href.split('-').pop()).toString(36);
    document.getElementById('deviantART-v5').classList.add('patched');
    document.getElementById('description').appendChild(InfernoAddElem('a', {href:'https://fav.me/d'+code, innerHTML:'https://fav.me/d'+code}));
  }

  function DA(p) {
    dunno = p;
    req = true;
    if (l.indexOf('/art/') == -1) {
      console.log('Not art');
      return;
    }

    hasFull = !!(document.querySelector('.dev-meta-actions:not(.patched) .dev-page-download'));
    let dlink, text = '';
    if (hasFull) {
      let xlink = document.querySelector('.dev-meta-actions:not(.patched) .dev-page-download').href;
      width = document.querySelector('.dev-meta-actions:not(.patched) div.dev-metainfo-details dl dd:nth-child(6)').innerHTML.split('×')[0];
      height = document.querySelector('.dev-meta-actions:not(.patched) div.dev-metainfo-details dl dd:nth-child(6)').innerHTML.split('×')[1];

      dlink = location.href;
    } else {
      const o = Array.from(document.querySelectorAll('.pimp a.thumb')).pop();
      if (eclipse) {
        dlink = document.querySelector('._1izoQ.vbgSM').src;
        artist = document.querySelector('[data-hook="deviation_meta"] a[data-hook="user_link"]').dataset.username.toLowerCase();
      } else {
        dlink = o.dataset.superFullImg;
        artist = document.querySelector('.author .username').innerHTML.toLowerCase();
      }

      // failsafe
      const isSourcePng = /https:\/\/images-wixmp-[0-9a-f]+\.wixmp\.com\/f\/[0-9a-f\-]+\/[0-9a-z\-]+\.png/.test(dlink);
      const isSourceJpg = /https:\/\/images-wixmp-[0-9a-f]+\.wixmp\.com\/f\/[0-9a-f\-]+\/[0-9a-z\-]+\.jpg/.test(dlink);
      if (isSourcePng) {
        dlink = dlink.replace(/(https:\/\/[0-9a-z\-\.]+\/f\/[0-9a-f\-]+\/[0-9a-z\-]+\.png\/v1\/fill\/[0-9a-z_,]+\/[0-9a-z_\-]+)(\.jpg)(.*)/,'$1.png$3');
      } else {
        dlink = dlink.replace(/(https:\/\/[0-9a-z\-\.]+\/f\/[0-9a-f\-]+\/[0-9a-z\-]+\.png\/v1\/fill\/w_[0-9]+,h_[0-9]+,q_)([0-9]+)(,[a-z]+\/[a-z0-6_\-]+\.jpg.*)/,'$1100$3');
      }
      spawn(dlink, 'failsafe');

      // intermediary
      if (eclipse) {
        dlink = document.querySelector('._1izoQ.vbgSM').src.replace(/\/v1\/fill.*$/, '').replace('.com/f/', '.com/intermediary/f/').replace(/\?token=.*$/, '');
      } else {
        dlink = o.dataset.superFullImg.replace(/\/v1\/fill.*$/, '').replace('.com/f/', '.com/intermediary/f/').replace(/\?token=.*$/, '');
      }
      spawn(dlink, 'intermediary');

    }

    if (document.querySelector('.dev-description .text.block') != undefined) text = '[bq]'+document.querySelector('.dev-description .text.block').innerText+'[/bq]';

  }

  function DA_check() {
    setTimeout(DA_check, 1000);

    try {
      mainDomain = unsafeWindow._YDB_public.funcs.getDerpHomeDomain();
    }
    catch(e) {}

    if (document.querySelector('#deviantART-v5.error-404:not(.patched)')) {
      l = window.location.pathname;
      DA404();
    }
    else if (document.querySelector('.dev-meta-actions:not(.patched)')) {
      l = window.location.pathname;
      DA(i);
    } else if (document.querySelector('._3fcE7._15yPL.fXGZA.WikyH:not(.patched)')) {
      eclipse = true;
      l = window.location.pathname;
      DA(i);
    } else if (eclipse && l != window.location.pathname) {
      document.querySelector('._ydb_adup').innerHTML = '';
      l = window.location.pathname;
      DA(i);
    }
  }

  DA_check();

})();
