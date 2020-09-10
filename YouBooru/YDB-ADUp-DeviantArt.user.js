// ==UserScript==
// @name         DeviantArt ADUp Module
// @version      0.3.5
// @author       stsyn
// @include      http*://*.deviantart.com/*
// @include      /http(s|):\/\/(www\.|)(trixie|derpi)booru.org\/images\/new.*/
// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ADUp-mini.js
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp-DeviantArt.user.js
// @grant        unsafeWindow
// @grant        GM_download
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
  'use strict';
  if (window.top !== window) return;
  let mainDomain = 'www.derpibooru.org';
  const leak = true;
  const derpImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJtMTMuMiwuNmM1LDkuMi0uMiwxNS41LTIuOSwxNS4zcy0zLjYsLTQuNy05LjIsLTQuNWMyLjYsLTMuNCA4LjMsLS4zIDkuOCwtMS42czMuNywtNS40IDIuMywtOS4yIiBmaWxsPSIjNzNkNmVkIj48L3BhdGg+PHBhdGggZD0ibTExLDAuNi0xLjcsMS40LTEuNywtMS4yLjgsMi0xLjcsMWgxLjhsLTUuNSw5LjcuNCwuMiA1LjUsLTkuNy42LDEuOCAuNSwtMiAyLjIsLS4xLTEuOCwtMS4xLjYsLTIiIGZpbGw9IiM5NGMxZGQiPjwvcGF0aD48Y2lyY2xlIGN4PSIxMy41IiBjeT0iOC41IiBmaWxsPSIjZmZmIiBpZD0iZSIgcj0iMC41Ij48L2NpcmNsZT48dXNlIHg9Ii0yIiB5PSIzIiB4bGluazpocmVmPSIjZSI+PC91c2U+PHVzZSB4PSItNiIgeT0iNCIgeGxpbms6aHJlZj0iI2UiPjwvdXNlPjx1c2UgeD0iLTIuOCIgeT0iNiIgeGxpbms6aHJlZj0iI2UiPjwvdXNlPjwvc3ZnPgo=')";

  let l, width, height, artist;

  function spawn(link, text) {
    let target, target2, target3;

    target = document.querySelector('._3fcE7._15yPL.fXGZA');
    target2 = target.querySelector('._ydb_adup') || document.createElement('div');
    target2.className = 'JQhXs _ydb_adup';
    target.insertBefore(target2, target.children[0]);
    target3 = document.createElement('div');
    target3.className = '_2iAFC';
    target2.appendChild(target3);

    let href = '//'+mainDomain+'/images/new?newImg='+encodeURIComponent(link)+
      '&src='+encodeURIComponent(location.href)+
      '&tags='+encodeURIComponent('artist:'+artist)+
      '&description='+(encodeURIComponent(text))+
      '&newWidth='+width+
      '&newHeight='+height;

    let ds = createElement('a', {
      className: 'V7yJQ',
      target: '_blank',
      href,
      style: 'width:calc(50% - 18px);display:inline-block;margin-right:4px'
    }, [
      createElement('i', {style: {width: '20px', background: derpImage}}),
      createElement('span.label', ' Upload on DB'),
      createElement('span.text', ' ' + text),
    ]);

    target3.appendChild(ds);
    let ls = ds.cloneNode(true);
    ls.href = link;
    ls.getElementsByTagName('i')[0].style.background = "url(https://st.deviantart.net/minish/deviation/action-sprites.png?)";
    ls.getElementsByTagName('i')[0].style.backgroundPosition = '-1px -78px';
    ls.querySelector('span.label').innerHTML = " Direct link";
    ls.addEventListener('click', (e) => {
      e.preventDefault();
      GM_download(link, link.split('/').pop().split('?')[0])
    });
    ls.querySelector('span.text').innerHTML = ' '+text;
    target3.appendChild(ls);
    target.classList.add('patched');
  }

  function DA404() {
    let code = parseInt(location.href.split('-').pop()).toString(36);
    if (code == 'NaN') {
      code = parseInt(location.href.split('/').pop()).toString(36);
    }
    document.getElementById('deviantART-v5').classList.add('patched');
    document.getElementById('description').appendChild(createElement('a', {href:`http://orig01.deviantart.net/x_by_x-d${code}.png`}, 'https://fav.me/d'+code));
  }

  function DA(p) {
    if (l.indexOf('/art/') === -1) {
      return;
    }
    let dlink, text = '';

    const o = Array.from(document.querySelectorAll('.pimp a.thumb')).pop();
    artist = document.querySelector('[data-hook="deviation_meta"] a[data-hook="user_link"]').dataset.username.toLowerCase();

    const url = `https://www.deviantart.com/_napi/shared_api/deviation/extended_fetch?deviationid=${location.href.split('-').pop()}&type=art`;
    fetch(url)
    .then(resp => resp.json())
    .then(resp => {
      const data = resp.deviation.media;

      // failsafe
      const isSourcePng = data.baseUri.endsWith('.png');
      const fullview = data.types.find(item => item.t === 'fullview');
      if (fullview && fullview.c) {
        if (isSourcePng) {
          dlink = data.baseUri + `/v1/fill/w_${fullview.w},h_${fullview.h},q_100,strp/${data.prettyName}-pre.png?token=` + data.token[0];
        } else {
          dlink = data.baseUri + `/v1/fill/w_${fullview.w},h_${fullview.h},q_100,strp/${data.prettyName}-pre.jpg?token=` + data.token[0];
        }
      } else {
          dlink = data.baseUri + '?token=' + data.token[0];
      }
      spawn(dlink, 'failsafe');

      // intermediary
      dlink = data.baseUri.replace('.com/f/', '.com/intermediary/f/');

      spawn(dlink, 'intermediary');
    })

    // leak
    /*const code = parseInt(location.href.split('-').pop()).toString(36);
    dlink = `http://orig01.deviantart.net/x_by_x-d${code}.png`;
    spawn(dlink, "leak");

    if (document.querySelector('.dev-description .text.block')) text = '[bq]'+document.querySelector('.dev-description .text.block').innerText+'[/bq]';*/
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
    } else if (document.querySelector('._3fcE7._15yPL.fXGZA:not(.patched)')) {
      l = window.location.pathname;
      DA();
    } else if (l != window.location.pathname) {
      if (document.querySelector('._ydb_adup')) document.querySelector('._ydb_adup').innerHTML = '';
      l = window.location.pathname;
      DA();
    }
  }

  DA_check();

})();
