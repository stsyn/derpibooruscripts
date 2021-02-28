// ==UserScript==
// @name         DеviantArt Fucker
// @version      0.1
// @description  You can run but you can't hide
// @include      http*://*.deviantart.com/*

// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/other/DAF.user.js
// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js

// @grant        unsafeWindow
// @grant        GM_download
// ==/UserScript==

(function() {
  'use strict';
  if (window.top !== window) return;

  function makeElement(name, action) {
    let container, target2;

    const element = createElement('div._2iAFC', [
      createElement('a.V7yJQ', {
        target: '_blank',
        style: 'width:calc(100% - 9px);display:inline-block;margin-right:4px',
        onclick: e => action(e, element)
      }, name)
    ]);
    container = document.querySelector('._3fcE7._15yPL.fXGZA');
    target2 = container.querySelector('._ydb_adup') || document.createElement('div');
    target2.className = 'JQhXs _ydb_adup';
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
      action(e);
      element.parentNode.removeChild(element);
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

  async function combine(data) {
    const fullview = data.media.types.find(item => item.t === 'fullview');
    const targetWidth = data.extended.originalFile.width;
    const targetHeight = data.extended.originalFile.height;
    const maxWidth = fullview.w;
    const maxHeight = fullview.h;
    const deltaWidth = Math.floor(maxWidth * 1);
    const deltaHeight = Math.floor(maxHeight * 1);
    const canvas = createElement('canvas', { width: targetWidth, height: targetHeight});
    const ctx = canvas.getContext('2d');
    const url = () => data.media.baseUri + `/v1/crop/x_${offsetX},y_${offsetY},w_${maxWidth},h_${maxHeight},q_100/${data.media.prettyName}-pre.png?token=` + data.media.token[0];

    let offsetX = 0;
    let offsetY = 0;

    while (offsetX <= targetWidth - maxWidth) {
      offsetY = 0;
      while (offsetY <= targetHeight - maxHeight) {
        console.log(offsetX, offsetY, deltaWidth, deltaHeight);
        const image = await fetchImage(url());
        ctx.drawImage(image, offsetX, offsetY);
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

    spawn('Open full (Ctrl+ = download)', (event) => openOrDownload(canvas.toDataURL(), data.prettyName + '-full.png'));
  }




  async function getMeta() {
    const l = location.href;
    if (l.indexOf('/art/') == -1) {
      return;
    }

    const url = `https://www.deviantart.com/_napi/shared_api/deviation/extended_fetch?deviationid=${location.href.split('-').pop()}&type=art`;
    const data = (await fetch(url).then(resp => resp.json())).deviation;

    spawnPreStarter('Unwatermark', () => unwatermark(data));
    spawnPreStarter('Combine full', () => combine(data));
  }

  window.addEventListener('popstate', _ => getMeta);
  getMeta();
})();
