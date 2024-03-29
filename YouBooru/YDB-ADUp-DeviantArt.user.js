// ==UserScript==
// @name         DeviantArt ADUp Module
// @version      0.6.5
// @author       stsyn
// @match        http*://*.deviantart.com/*
// @match        https://derpibooru.org/images/new*
// @match        https://www.derpibooru.org/images/new*
// @match        https://trixiebooru.org/images/new*
// @match        https://www.trixiebooru.org/images/new*
// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ADUp-mini.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/YDB-ADUp-DeviantArt.user.js
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

  const RIGHTPAD = '._1VvVp._10lmT';
  const PAD = '._3L-AU';
  const SPAD = '._2rl2o';
  const LINK = '._277bf._3VrNw';
  const LOGIN = 'BoW0n';
  const USERNAME = '._3UDQj ._4GWw7 .user-link._277bf[data-username]';

  let l, width, height, artist;

  function spawn(link, text) {
    let target, target2, target3;

    target = document.querySelector(RIGHTPAD);
    target2 = target.querySelector('._ydb_adup') || createElement('div._ydb_adup' + PAD);
    target.insertBefore(target2, target.children[0]);
    target3 = createElement('div' + SPAD);
    target2.appendChild(target3);

    let href = '//'+mainDomain+'/images/new?newImg='+encodeURIComponent(link)+
      '&src='+encodeURIComponent(location.href)+
      '&tags='+encodeURIComponent('artist:'+artist)+
      '&description='+(encodeURIComponent(text))+
      '&newWidth='+width+
      '&newHeight='+height;

    let ds = createElement('a' + LINK, {
      target: '_blank',
      href,
      style: 'width:calc(50% - 18px);display:inline-block;margin-right:4px'
    }, [
      createElement('span.label', ' Upload on DB'),
      createElement('span.text', ' ' + text),
    ]);

    target3.appendChild(ds);
    let ls = ds.cloneNode(true);
    ls.href = link;
    ls.querySelector('span.label').innerHTML = " Direct link";
    ls.addEventListener('click', (e) => {
      e.preventDefault();
      GM_download(link, link.split('/').pop().split('?')[0])
    });
    ls.querySelector('span.text').innerHTML = ' '+text;
    target3.appendChild(ls);
  }

  function DA404() {
    let code = parseInt(location.href.split('-').pop()).toString(36);
    if (code == 'NaN') {
      code = parseInt(location.href.split('/').pop()).toString(36);
    }
    document.getElementById('deviantART-v5').classList.add('patched');
    document.getElementById('description').appendChild(createElement('a', {href:`http://orig01.deviantart.net/x_by_x-d${code}.png`}, 'https://fav.me/d'+code));
  }

  async function fetchFullFromLoginScreen() {
    const data = await fetch('https://www.deviantart.com/users/login', { credentials: 'omit' });
    const x = await data.text();
    const temp = createElement('div', {innerHTML: x});
    const element = temp.getElementsByClassName(LOGIN)[0];
    return element.style.backgroundImage.slice(5, -2);
  }

  async function DA() {
    if (l.indexOf('/art/') === -1) {
      return;
    }
    let dlink, text = '';

    artist = document.querySelector(USERNAME).dataset.username.toLowerCase();

    document.querySelector(RIGHTPAD).classList.add('patched');

    fetch(location.href)
    .then(resp => resp.text())
    .then(async resp => {
      const match = resp.match(/window.__INITIAL_STATE__ = JSON.parse\("(.*)"\);/)[1].replace(/\\(.)/g, '$1');
      const content = JSON.parse(match);

      const deviationId = Object.keys(content['@@entities'].deviationExtended)[0];
      const deviation = content['@@entities'].deviation[deviationId];

      const data = deviation.media;

      // failsafe
      const isSourcePng = data.baseUri.endsWith('.png');
      const fullview = data.types.find(item => item.t === 'fullview');
      if (fullview && fullview.c) {
        if (isSourcePng) {
          dlink = data.baseUri + `/v1/fill/w_${fullview.w},h_${fullview.h},q_100,strp/${data.prettyName}-pre.png?token=` + data.token[0];
        } else {
          dlink = data.baseUri + `/v1/fill/w_${fullview.w},h_${fullview.h},q_100,strp/${data.prettyName}-pre.jpg?token=` + data.token[0];
        }
      } else if (data.token) {
          dlink = data.baseUri + '?token=' + data.token[0];
      }
      if (dlink) {
        spawn(dlink, 'failsafe');
      }

      // intermediary
      dlink = data.baseUri.replace('.com/f/', '.com/intermediary/f/');

      spawn(dlink, 'intermediary');

      // token kek
      // All credit goes to @Ironchest337
      /*const payload = `{"sub":"urn:app:","iss":"urn:app:","obj":[[{"path":"\/f\/${data.baseUri.split(/\/[if]\//)[1].replace(/\//g, '\/')}"}]],"aud":["urn:service:file.download"]}`;
      spawn(`${data.baseUri.replace("//images-wixmp", "//wixmp")}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.${btoa(payload).replace(/=/g, '')}.`, 'token kek');

      spawn(await fetchFullFromLoginScreen(), 'login leak');*/
    })

    // if (document.querySelector('.dev-description .text.block')) text = '[bq]'+document.querySelector('.dev-description .text.block').innerText+'[/bq]';
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
    } else if (document.querySelector(RIGHTPAD + ':not(.patched)')) {
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
