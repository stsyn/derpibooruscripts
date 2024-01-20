// ==UserScript==
// @name         DеviantArt Fucker
// @version      0.3.1
// @description  You can run but you can't hide
// @include      http*://*.deviantart.com/*
// @include      http://*.mrsxm2lbnz2gc4tufzrw63i.cmle.*/*

// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/other/DAF.user.js
// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js

// @grant        unsafeWindow
// @grant        GM_download
// ==/UserScript==

(function() {
  'use strict';
  if (unsafeWindow.top !== unsafeWindow) return;

  const RIGHTPAD = '._1VvVp._10lmT';
  const PAD = '._3L-AU';
  const SPAD = '._2rl2o';
  const LINK = '._277bf._3VrNw';

  function makeElement(name, action) {
    let container, target2;

    const element = createElement('div' + SPAD, [
      ['a' + LINK, {
        target: '_blank',
        style: 'width:calc(100% - 9px);display:inline-block;margin-right:4px',
        onclick: e => action(e, element)
      }, name]
    ]);
    container = document.querySelector(RIGHTPAD);
    target2 = container.querySelector('._ydb_adup') || createElement('div._ydb_adup' + PAD);
    target2.appendChild(element);
    container.insertBefore(target2, container.children[0]);
  }

  function spawn(name, action) {
    makeElement(name, e => {
      e.preventDefault();
      action(e);
    })
  }

  function spawnPreStarter(name, action) {
    makeElement(name, (e, element) => {
      e.preventDefault();
      action(e, element);
      element.style.pointerEvents = 'none';
    })
  }

  function fetchImage(url) {
    return new Promise(resolve => {
      const image = document.createElement('img', {crossOrigin:'anonymous'});
      image.crossOrigin = 'anonymous';
      image.src = url;
      image.addEventListener('load', () => resolve(image));
    })
  }

  function openOrDownload(dataUrl, filename) {
    if (!window.event.ctrlKey) {
      const image = new Image();
      image.src = dataUrl;

      var w = window.open('');
      w.document.write(image.outerHTML);
    }
    else GM_download(dataUrl, filename);
  }



  async function unwatermark(d) {
    const data = d.media;
    const fullview = data.types.find(item => item.t === 'fullview');
    const canvas = createElement('canvas', { width: fullview.w, height: fullview.h});
    const ctx = canvas.getContext('2d');
    const url = () => data.baseUri + `/v1/fill/w_${width},h_${fullview.h},q_100,strp/${data.prettyName}-pre.png?token=` + data.token[0];

    let width = fullview.w;
    let height = fullview.h;
    let offsetX = 0;
    let offsetY = 0;

    while (width > 5) {
      const image = await fetchImage(url());
      ctx.drawImage(image, 0, offsetY, width, fullview.h - offsetY * 2, offsetX, offsetY, width, fullview.h - offsetY * 2);
      offsetX += Math.floor(width / 4);
      offsetY += Math.floor(height / 6);
      width = fullview.w - offsetX * 2;
      height = fullview.h - offsetY * 2;
    }
    spawn('Open unwatermarked (Ctrl+ = download)', (event) => openOrDownload(canvas.toDataURL(), data.prettyName + '-uw.png'));
  }

  async function combine(data, extendedData, elem) {
    const fullview = data.media.types.find(item => item.t === 'fullview');
    const targetWidth = extendedData.originalFile.width;
    const targetHeight = extendedData.originalFile.height;
    const maxWidth = fullview.w;
    const maxHeight = fullview.h;
    const deltaWidth = Math.floor(maxWidth * 1);
    const deltaHeight = Math.floor(maxHeight * 1);
    let canvas = createElement('canvas', { width: targetWidth, height: targetHeight});
    let ctx = canvas.getContext('2d');
    const url = () => data.media.baseUri + `/v1/crop/x_${offsetX},y_${offsetY},w_${maxWidth},h_${maxHeight},q_100/${data.media.prettyName}-pre.png?token=` + data.media.token[0];

    let offsetX = 0;
    let offsetY = 0;

    const piecesTotal = Math.ceil(targetWidth / maxWidth) * Math.ceil(targetHeight / maxHeight);
    let i = 0;

    while (offsetX <= targetWidth - maxWidth) {
      offsetY = 0;
      while (offsetY <= targetHeight - maxHeight) {
        elem.innerHTML = `${++i}/${piecesTotal}`;
        const image = await fetchImage(url());

        const temp = createElement('canvas', { width: targetWidth, height: targetHeight});
        const tempCtx = temp.getContext('2d');

        tempCtx.drawImage(image, offsetX, offsetY);
        tempCtx.drawImage(canvas, 0, 0);

        ctx = tempCtx;
        canvas = temp;

        if (offsetY === targetHeight - maxHeight) {
          break;
        }
        offsetY = Math.min(targetHeight - maxHeight, offsetY + deltaHeight);
      }

      if (offsetX === targetWidth - maxWidth) {
        break;
      }
      offsetX = Math.min(targetWidth - maxWidth, offsetX + deltaWidth);
    }

    spawn('Open full (Ctrl+ = download)', (event) => openOrDownload(canvas.toDataURL(), data.media.prettyName + '-full.png'));
  }




  async function getMeta() {
    const l = location.href;
    if (l.indexOf('/art/') == -1) {
      return;
    }

    const response = await fetch(location.href);
    const text = await response.text();
    const match = text.match(/window.__INITIAL_STATE__ = JSON.parse\("(.*)"\);/)[1].replace(/\\(.)/g, '$1');
    const content = JSON.parse(match);
    const deviationId = Object.keys(content['@@entities'].deviationExtended)[0];
    const data = content['@@entities'].deviation[deviationId];
    const extendedData = content['@@entities'].deviationExtended[deviationId];

    spawnPreStarter('Unwatermark', (_, elem) => unwatermark(data, extendedData, elem));
    spawnPreStarter('Combine full', (_, elem) => combine(data, extendedData, elem));
  }

  window.addEventListener('popstate', _ => getMeta);
  getMeta();
})();
