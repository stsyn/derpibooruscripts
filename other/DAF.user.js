// ==UserScript==
// @name         DеviantArt Fucker
// @version      0.4.0
// @description  You can run but you can't hide
// @match        http*://*.deviantart.com/*

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/other/DAF.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/other/DAF.user.js
// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require      https://github.com/stsyn/pngtoy/raw/patch-1/pngtoy.min.js

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
  const IMAGE_VIEW = '.TZM0T._2NIJr';

  function loadFileAsArrayBuffer(url) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function(e) {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(this.response);
        }
      };
      xhr.send();
    })
  };

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

  function getMedia(data, extendedData) {
    const baseUri = document.querySelector(IMAGE_VIEW).src.split('/v1')[0];
    const medias = [
        { ...data.media, originalFile: extendedData.originalFile },
        ...extendedData.additionalMedia.map(v => ({ ...v.media, originalFile: extendedData.originalFile }))];
    return medias.find(m => m.baseUri === baseUri);
  }

  async function unwatermark(data, extendedData) {
    const media = getMedia(data, extendedData);
    const fullview = media.types.find(item => item.t === 'fullview');
    const canvas = createElement('canvas', { width: fullview.w, height: fullview.h});
    const ctx = canvas.getContext('2d');
    const baseUri = document.querySelector(IMAGE_VIEW).src.split('/v1')[0];
    const url = () => baseUri + `/v1/fill/w_${width},h_${fullview.h},q_100,strp/${media.prettyName}-pre.png?token=` + media.token[0];

    let width = fullview.w;
    let height = fullview.h;
    let offsetX = 0;
    let offsetY = 0;

    while (width > 5) {
      const image = await fetchImage(url());
      ctx.drawImage(image, 0, offsetY, width, fullview.h - offsetY * 2, offsetX, offsetY, width, fullview.h - offsetY * 2);
      offsetX += Math.floor(width / 4 + 0.5);
      offsetY += Math.floor(height / 6 + 0.5);
      width = fullview.w - offsetX * 2;
      height = fullview.h - offsetY * 2;
    }
    spawn('Open unwatermarked (Ctrl+ = download)', (event) => openOrDownload(canvas.toDataURL(), media.prettyName + '-uw.png'));
  }

  async function combine(data, extendedData, elem) {
    const media = getMedia(data, extendedData);
    const fullview = media.types.find(item => item.t === 'fullview');
    const targetWidth = media.originalFile.width;
    const targetHeight = media.originalFile.height;
    const maxWidth = fullview.w;
    const maxHeight = fullview.h;

    let canvas = createElement('canvas', { width: targetWidth, height: targetHeight});
    let ctx = canvas.getContext('2d');
    const url = (oX, oY, mW, mH) => media.baseUri + `/v1/crop/x_${oX},y_${oY},w_${mW},h_${mH},q_100/${media.prettyName}-pre.png?token=` + media.token[0];

    const pngtoy = new PngToy();
    let warnings = 0;
    let errors = 0;

    let offsetX = 0;
    let offsetY = 0;
    let currentWidth = maxWidth;
    let currentHeight = maxHeight;

    const piecesTotal = Math.ceil(targetWidth / maxWidth) * Math.ceil(targetHeight / maxHeight);
    let i = 0;

    while (offsetX <= targetWidth - maxWidth) {
      offsetY = 0;
      while (offsetY <= targetHeight - maxHeight) {

        elem.innerHTML = `${++i}/${piecesTotal} ${errors ? ' (tainted)' : ''}`;

        currentWidth = Math.min(maxWidth, targetWidth - offsetX);
        currentHeight = Math.min(maxHeight, targetHeight - offsetY);
        const arrayBuffer = await loadFileAsArrayBuffer(url(offsetX, offsetY, currentWidth, currentHeight));

        await pngtoy.fetch(arrayBuffer);

        const phys = pngtoy.getChunk('pHYs');
        if (!phys || !phys.ppuX || !phys.ppuY) {
            warnings++;
        } else if (phys.ppuX == 1000 || phys.ppuY == 1000) {
            errors++;
            console.log(offsetX, offsetY, 'tainted');
        }

        const arrayBufferView = new Uint8Array(arrayBuffer);
        const blob = new Blob([arrayBufferView], { type: "image/png" });
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(blob);

        const image = await fetchImage(imageUrl);

        const temp = createElement('canvas', { width: targetWidth, height: targetHeight});
        const tempCtx = temp.getContext('2d');

        tempCtx.drawImage(image, offsetX, offsetY);
        tempCtx.drawImage(canvas, 0, 0);

        image.remove();
        URL.revokeObjectURL(imageUrl);

        ctx = tempCtx;
        canvas = temp;

        if (offsetY === targetHeight - maxHeight) {
          break;
        }
        offsetY = Math.min(targetHeight - maxHeight, offsetY + maxHeight);
      }

      if (offsetX === targetWidth - maxWidth) {
        break;
      }
      offsetX = Math.min(targetWidth - maxWidth, offsetX + maxWidth);
    }

    spawn(
      'Open full (Ctrl+ = download)' + (errors ? ' [Low quality detected!]' : (warnings ? ' [Unable to check quality]' : '')),
      (event) => openOrDownload(canvas.toDataURL(), media.prettyName + '-full.png'),
    );
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
