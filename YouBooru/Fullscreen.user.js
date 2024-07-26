// ==UserScript==

// @name         Resurrected Derp Fullscreen
// @namespace    https://derpibooru.org
// @version      0.7.54
// @description  Make Fullscreen great again!
// @author       stsyn

// @include      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/adverts\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/api\/v1\/json/.*/

// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js

// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/themeData.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/fullscreenStyles.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js

// @run-at       document-start

// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant        GM.addStyle
// @grant        GM_addStyle
// @grant        unsafeWindow

// ==/UserScript==

var createElement = createElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var fillElement = fillElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
(function() {
  'use strict';
  const currentColorApi = 4;

  let de = document.documentElement;
  let popUps = {};
  let objects = {};
  let pub = {};
  let adc = {};
  let settings, state;
  let colors = {};
  let started = false;
  let dictionary = {};

  function write() {
    localStorage._ydb_fs_state = JSON.stringify(state);
  }

  let svd = localStorage._ydb_fs;
  try {
    settings = JSON.parse(svd);
  }
  catch (e) {
    settings = {};
  }

  svd = localStorage._ydb_fs_state;
  try {
    state = JSON.parse(svd);
  }
  catch (e) {
    state = {};
  }

  if (state.enabled == undefined) state.enabled = false;
  if (!state.NU1) {
    settings.button = 'Download (no tags in filename)';
    state.NU1 = true;
    write();
  }

  if (settings.extended === undefined) settings.extended = true;
  if (settings.scrollSpeed === undefined) settings.scrollSpeed = 20;
  if (settings.zoomSpeed === undefined) settings.zoomSpeed = settings.scrollSpeed;
  if (settings.scrollMultiply === undefined) settings.scrollMultiply = 5;
  if (settings.staticTime === undefined) settings.staticTime = 20;
  if (settings.staticEnabled === undefined) settings.staticEnabled = true;
  if (settings.commentLink === undefined) settings.commentLink = true;
  if (settings.colorAccent === undefined) settings.colorAccent = false;
  if (settings.webmControls === undefined) settings.webmControls = true;
  if (settings.style === undefined) settings.style = 'rating';
  if (settings.button === undefined) settings.button = 'Download (short filename)';
  if (settings.pony_mark === undefined) settings.pony_mark = 'none';
  settings.scrollSpeed = parseInt(settings.scrollSpeed);
  settings.zoomSpeed = parseInt(settings.zoomSpeed);
  settings.scrollMultiply = parseFloat(settings.scrollMultiply);
  settings.staticTime = parseInt(settings.staticTime);
  localStorage._ydb_fs = JSON.stringify(settings);

  let singleDefSize = settings.singleMode;
  let singleFirstChange = false;

  function register() {
    if (!unsafeWindow._YDB_public) unsafeWindow._YDB_public = {};
    if (!unsafeWindow._YDB_public.settings) unsafeWindow._YDB_public.settings = {};
    unsafeWindow._YDB_public.settings.fullscreen = {
      name:'Fullscreen',
      container:'_ydb_fs',
      version:GM_info.script.version,
      link:'/meta/topics/userscript-derp-fullscreen-viewer',
      s:[
        {type:'checkbox', name:'Show UI', parameter:'extended'},
        {type:'checkbox', name:'Remove href from comments link', parameter:'commentLink'},
        {type:'breakline'},
        {type:'input', name:'Scroll speed', parameter:'scrollSpeed', validation:{type:'int',min:5, max:100, default:20}},
        {type:'input', name:'Scroll multiplier', parameter:'scrollMultiply', validation:{type:'float',min:1, max:10, default:2}},
        {type:'input', name:'Zoom speed', parameter:'zoomSpeed', validation:{type:'int',min:5, max:100, default:20}},
        {type:'breakline'},
        {type:'checkbox', name:'New experimental UI', parameter:'new'},
        {type:'checkbox', name:'All in one mode', parameter:'singleMode'},
        {type:'checkbox', name:'Don\'t cover webms if possible', parameter:'webmControls'},
        {type:'breakline'},
        {type:'checkbox', name:'Autohide UI', parameter:'staticEnabled'},
        {type:'input', name:'Autohide timeout', parameter:'staticTime', validation:{type:'int',min:0, max:600, default:50}},
        {type:'breakline'},
        {type:'select', name:'Panel color', parameter:'style', values:[
          {name:'Brown', value:'species'},
          {name:'Pink', value:'content-fanmade'},
          {name:'Magenta', value:'oc'},
          {name:'Red', value:'error'},
          {name:'Orange', value:'spoiler'},
          {name:'Yellow', value:'content-official'},
          {name:'Green', value:''},
          {name:'Cyan', value:'character'},
          {name:'Blue', value:'rating'},
          {name:'Violet', value:'origin'},
          {name:'Grey', value:'body-type'}
        ], attrI:{id:'_fs_color_setting'}},
        {type:'checkbox', name:'Match site palette', parameter:'colorAccent'},
        {type:'select', name:'Cutiemark BG', parameter:'pony_mark', values:[
          {name:'disabled', value:'none'},
          {name:'theme default', value:'auto'},
          {name:'random', value:'random'},
          {name:'Applejack', value:'aj'},
          {name:'Cadence', value:'pcd'},
          {name:'Celestia', value:'tia'},
          {name:'Derpy', value:'dh'},
          {name:'Fluttershy', value:'fs'},
          {name:'Luna', value:'luna'},
          {name:'Lyra', value:'lyra'},
          {name:'Pinkie Pie', value:'pp'},
          {name:'Rainbow Dash', value:'rd'},
          {name:'Rarity', value:'ry'},
          {name:'Starlight', value:'sg'},
          {name:'Trixie', value:'tx'},
          {name:'Twilight', value:'ts'}
        ], attrI:{id:'_fs_pony_mark_setting'}},
        {type:'breakline'},
        {type:'select', name:'Top right button', parameter:'button', values:[
          {name:'none', value:''},
          {name:'View (with tags)', value:'View (tags in filename)'},
          {name:'View', value:'View (no tags in filename)'},
          {name:'Download (with tags)', value:'Download (tags in filename)'},
          {name:'Download', value:'Download (no tags in filename'}
        ]}
      ]
    };
  }

  function append(id, accentFix) {
    if (dictionary[id] && !accentFix) dictionary[id].media = 'all';
    else GM.addStyle(styles[id]).then(x => dictionary[id] = x);
    if (accentFix) GM.addStyle(styles[id]).then(x => dictionary[id] = x);
    return 0;
  }

  function remove(id) {
    if (!dictionary[id]) return 1;
    dictionary[id].media = 'none';
    return 0;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  function resize(event) {
    if (!state.enabled) return;
    if (document.querySelector('.image-show-container .image-show.hidden') != null) return;
    dropExecution(event);
    if (settings.singleMode) {
      rescale(true);
    }
  }

  function rescale(doNotSwitch) {
    const winWidth = unsafeWindow.innerWidth;
    const winHeight = unsafeWindow.innerHeight;
    const imageWidth = objects.icontainer.dataset.width;
    const imageHeight = objects.icontainer.dataset.height;
    const aspectRatio = winWidth / winHeight;
    const imageAspectRatio = objects.icontainer.dataset.aspectRatio;

    if (imageAspectRatio > aspectRatio) pub.wide = false;
    else pub.wide = true;

    let forced = settings.singleMode && singleDefSize;

    if (settings.singleMode) {
      if (pub.scaled === 'partscaled') {
        pub.scaled = 'false';
        initalZoom();
      }
    } else if (pub.scaled !== objects.dcontainer.dataset.scaled) {
      pub.scaled = objects.dcontainer.dataset.scaled;
      if (pub.scaled !== 'true') {
        append('hideAll');
        append('imageZoom');
        pub.zoom = 1;
      }
      else {
        remove('hideAll');
        remove('imageZoom');
      }
    }

    if (!pub.wide) pub.defzoom = winWidth / imageWidth;
    else pub.defzoom = winHeight / imageHeight;

    if (settings.singleMode && pub.zoom < pub.defzoom && !doNotSwitch) {
      singleEvent();
      return;
    }

    if (pub.scaled !== 'false') {
      let bufferWidth = objects.image.style.width, bufferHeight = objects.image.style.height,
          bufferTop = objects.image.style.marginTop, bufferLeft = objects.image.style.marginLeft;
      if (!pub.wide) {
        bufferWidth = forced ? winWidth + 'px' : '100vw';
        pub.zoom = winWidth / imageWidth;
        bufferHeight = forced ? (winWidth / imageAspectRatio) + 'px' : 'auto';
        const zoomRatio = imageWidth / winWidth;

        bufferLeft = '0';
        bufferTop = (winHeight - (imageHeight / zoomRatio)) / 2+'px';

        if (pub.isVideo && pub.scaled == 'true') {
          bufferTop = '0';
        }
      }
      else {
        const zoomRatio = imageHeight / winHeight;

        bufferTop = '0';
        bufferHeight = forced ? winHeight+'px' : '100vh';
        pub.zoom = winHeight / imageHeight;
        bufferWidth = forced ? (winHeight * imageAspectRatio)+'px' : 'auto';

        bufferLeft = (winWidth - (imageWidth / zoomRatio)) / 2+'px';
      }
      if (bufferWidth != objects.image.style.width || bufferHeight != objects.image.style.height ||
          bufferTop != objects.image.style.marginTop || bufferLeft != objects.image.style.marginLeft) {
        objects.image.style.width = bufferWidth;
        objects.image.style.height = bufferHeight;
        objects.image.style.marginTop = bufferTop;
        objects.image.style.marginLeft = bufferLeft;
      }
    }
  }

  function unscale() {
    objects.image.style.height = 'auto';
    objects.image.style.width = 'auto';
    objects.image.style.marginTop = '0';
    objects.image.style.marginLeft = '0';
  }

  function init() {
    const header = document.getElementsByClassName('header__force-right')[0];
    header.insertBefore(
      objects.disable = createElement('a.header__link', {style: { display: 'none' }, onclick: disable }, 'Disable'),
      header.childNodes[0],
    );

    header.insertBefore(
      objects.enable = createElement('a.header__link', { onclick: () => enable(true) }, 'Fullscreen'),
      header.childNodes[0],
    );
    started = true;
  }

  function loadedImgFetch() {
    objects.image = document.getElementById('image-display');
    if (settings.singleMode && objects.dcontainer) {
      append('imageZoom');
      if (!pub.isVideo) {
        objects.fullImage = createElement('img',{style:{display:'none'}, src:JSON.parse(objects.icontainer.dataset.uris).full});
      }
      else {
        if (!/\/[\d]+.webm$/.test(objects.image.querySelector('[type="video/webm"]').src)) {
          const url = JSON.parse(objects.icontainer.dataset.uris).full;
          objects.image.querySelector('[type="video/webm"]').src = url;
          objects.image.querySelector('[type="video/mp4"]').src = url.replace(/\.webm$/, '.mp4');
          objects.image.load();
          objects.image.play();
        }
      }
      objects.dcontainer.addEventListener('click', singleEvent);
    }
    if (!singleFirstChange && settings.singleMode) {
      rescale();
      singleFirstChange = true;
    }
    else if (!settings.singleMode) rescale();
  }

  function callPopup(id) {
    popUps[id].classList.add('active');
    popUps.back.classList.add('active');
  }

  function hidePopups(e) {
    if (!e.target.classList.contains('_fs_popup_back')) return;
    for (let i = 0; i < popUps.back.childNodes.length; i++) popUps.back.childNodes[i].classList.remove('active');
    popUps.back.classList.remove('active');
    if (!settings.commentLink) location.hash = '';
  }

  function showComms(e) {
    callPopup('coms');
    if (!settings.commentsLink) e.preventDefault();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  function tagEditor() {
    if (document.getElementsByClassName('autocomplete').length<=0) return;
    let ac = document.getElementsByClassName('autocomplete')[0];
    let orig = document.querySelector('.tagsinput input');

    ac.style.zIndex = '301';
    ac.style.top = orig.getBoundingClientRect().bottom + 'px';
  }

  function zeroZoom() {
    pub.zoom = pub.defzoom;
    objects.image.style.height = objects.icontainer.dataset.height * pub.zoom + 'px';
    objects.image.style.width = objects.icontainer.dataset.width * pub.zoom + 'px';
    objects.image.style.marginTop = -(objects.icontainer.dataset.height * pub.zoom - de.clientHeight)/2 + 'px';
    objects.image.style.marginLeft = -(objects.icontainer.dataset.width * pub.zoom - de.clientWidth)/2 + 'px';
  }

  function initalZoom(width) {
    if (!width) {
      if (adc.comic) {
        if (pub.wide) pub.zoom = unsafeWindow.innerWidth*(de.clientHeight>de.clientWidth?10:8)/10/objects.icontainer.dataset.width;
        objects.image.style.marginTop = '0';
      }
      else objects.image.style.marginTop = -(objects.icontainer.dataset.height - de.clientHeight)/2 + 'px';
    }
    if (width || width === undefined) {
      if (adc.comic) {
        objects.image.style.marginLeft = '0';
        if (!pub.wide) pub.zoom = unsafeWindow.innerHeight*(de.clientHeight<de.clientWidth?10:8)/10/objects.icontainer.dataset.height;
      }
      else objects.image.style.marginLeft = -(objects.icontainer.dataset.width - de.clientWidth)/2 + 'px';
    }
  }

  function setMargin() {
    if (pub.scaled != 'false' && !settings.singleMode) {
      return;
    }
    if (document.querySelector('#image-target.hidden')) return;
    if (!objects.image) return;
    if (pub.zoom >   20) pub.zoom =   20;
    if (pub.zoom < 0.02) pub.zoom = 0.02;
    addScrolls();

    const imageWidth = objects.icontainer.dataset.width;
    const imageHeight = objects.icontainer.dataset.height;
    const scrWidth = de.clientWidth, scrHeight = de.clientHeight;
    const xScale = scrWidth / (imageWidth * pub.zoom), yScale = scrHeight / (imageHeight * pub.zoom);

    if (!settings.singleMode) {
      if (isNaN(parseInt(objects.image.style.marginTop))) {
        initalZoom(false);
      }
      if (isNaN(parseInt(objects.image.style.marginLeft))) {
        initalZoom(true);
      }
    }

    let bufferWidth = parseInt(objects.image.style.width), bufferHeight = parseInt(objects.image.style.height),
        bufferTop = parseInt(objects.image.style.marginTop), bufferLeft = parseInt(objects.image.style.marginLeft);
    if (isNaN(bufferTop)) bufferTop = 0;
    if (isNaN(bufferLeft)) bufferLeft = 0;

    bufferHeight = imageHeight * pub.zoom;
    bufferWidth = imageWidth * pub.zoom;
    if (settings.singleMode && !(pub.isVideo || pub.gif)) {
      let isWide = (imageWidth / imageHeight > 1);
      let newsrc;
      if (isWide) {
        if (bufferWidth > 1280 && imageWidth > 1280) newsrc = JSON.parse(objects.icontainer.dataset.uris).full;
        else newsrc = JSON.parse(objects.icontainer.dataset.uris).large;
      }
      else {
        if ((bufferWidth > 1024 && imageWidth > 1024) || (bufferHeight > 4096 && imageHeight > 4096)) newsrc = JSON.parse(objects.icontainer.dataset.uris).full;
        else newsrc = JSON.parse(objects.icontainer.dataset.uris).tall;
      }
      if (objects.image.src.replace(/http(s|):/, '') != newsrc.replace(/http(s|):/, '')) {
        objects.image.src = newsrc;
      }
    }

    if (pub.dta !== 0) {
      if (bufferTop <= 0) {
        bufferTop = -(bufferHeight * (scrHeight/2-bufferTop) / (imageHeight*(pub.zoom-pub.dta)) - scrHeight/2);
      }
      if (bufferLeft <= 0) {
        bufferLeft = -(bufferWidth * (scrWidth/2-bufferLeft) / (imageWidth*(pub.zoom-pub.dta)) - scrWidth/2);
      }
      pub.dta=0;
    }

    if (bufferHeight < scrHeight) {
      bufferTop = (scrHeight - bufferHeight) / 2;
      objects.scroll_rgt.style.display = 'none';
    }
    else {
      objects.scroll_rgt.style.display = 'block';
      let vx = scrHeight*4/10;
      if (pub.mouseY < vx) {
        let v = 1-pub.mouseY/vx;
        bufferTop = bufferTop + settings.scrollSpeed*v*6;
      }
      if (pub.mouseY > scrHeight*6/10) {
        let v = (pub.mouseY-scrHeight*6/10)/vx;
        bufferTop = bufferTop - settings.scrollSpeed*v*6;
      }

      if (bufferTop > 0) bufferTop = 0;
      if (-bufferTop >= (bufferHeight - scrHeight)) bufferTop = -(bufferHeight - scrHeight)+1;
      if (singleDefSize) {
        bufferTop = 0;
        objects.scroll_rgt.style.display = 'none';
      }
    }

    if (bufferWidth > scrWidth) {
      objects.scroll_bot.style.display = 'block';
      const vx = scrWidth*4/10;
      if (pub.mouseX < vx) {
        const v = 1-pub.mouseX/vx;
        bufferLeft = bufferLeft + settings.scrollSpeed*v*6;
      }
      if (pub.mouseX > scrWidth*6/10) {
        const v = (pub.mouseX-scrWidth*6/10)/vx;
        bufferLeft = bufferLeft - settings.scrollSpeed*v*6;
      }

      if (bufferLeft>0) bufferLeft = 0;
      if (-bufferLeft>=(bufferWidth-scrWidth)) bufferLeft = -(bufferWidth-scrWidth)+1;
      if (singleDefSize) {
        bufferLeft = 0;
        objects.scroll_bot.style.display = 'none';
      }
    }
    else
    {
      bufferLeft = (scrWidth - objects.icontainer.dataset.width*pub.zoom) / 2;
      objects.scroll_bot.style.display = 'none';
    }
    objects.scroll_bot.style.left = -bufferLeft * xScale + 'px';
    objects.scroll_rgt.style.top = -bufferTop * yScale+'px';
    objects.scroll_rgt.style.height = scrHeight * yScale+'px';
    objects.scroll_bot.style.width = scrWidth * xScale+'px';

    bufferWidth = bufferWidth + 'px';
    bufferHeight = bufferHeight + 'px';
    bufferTop = bufferTop + 'px';
    bufferLeft = bufferLeft + 'px';

    if (bufferWidth != objects.image.style.width || bufferHeight != objects.image.style.height ||
          bufferTop != objects.image.style.marginTop || bufferLeft != objects.image.style.marginLeft) {
      objects.image.style.width = bufferWidth;
      objects.image.style.height = bufferHeight;
      objects.image.style.marginTop = bufferTop;
      objects.image.style.marginLeft = bufferLeft;
    }
  }

  function addScrolls() {
    if (pub.scaled != 'false' && !settings.singleMode) return;
    if (document.getElementById('_fs_scroll_bot')) return;
    const scrWidth = de.clientWidth, xScale = scrWidth/(objects.icontainer.dataset.width*pub.zoom);
    const scrHeight = de.clientHeight, yScale = scrHeight/(objects.icontainer.dataset.height*pub.zoom);

    document.body.appendChild(objects.scroll_bot = createElement('div#_fs_scroll_bot', {style: {width: scrWidth * xScale + 'px'}}));
    document.body.appendChild(objects.scroll_rgt = createElement('div#_fs_scroll_rgt', {style: {height: scrHeight * yScale + 'px'}}));
  }

  function listener() {
    if (!pub.enabled) return;
    setTimeout(listener, 100);
    tagEditor();

    if (settings.singleMode) {
      if (singleDefSize || pub.defzoom >= pub.zoom) remove('hideAll');
      else append('hideAll');

    }

    if (pub.scaled == 'false' || settings.singleMode) setMargin();

    if (objects.dcontainer) {
      const rect = objects.image?.getBoundingClientRect();
      const alreadyVisible = popUps.down.classList.contains('active');
      if (
        (pub.scaled == 'true' || (settings.singleMode && pub.defzoom >= pub.zoom))
        && pub.mouseY/unsafeWindow.innerHeight >= (alreadyVisible ? 0.3 : 0.85)
        && (!settings.webmControls || !pub.isVideo || alreadyVisible
            || (rect?.bottom ?? 0) < pub.mouseY
            || pub.mouseX < (rect?.left ?? Number.POSITIVE_INFINITY)
            || pub.mouseX > (rect?.right ?? 0))
        && !popUps.back.classList.contains('active')) {
        popUps.down.classList.add('active');
      }
      else popUps.down.classList.remove('active');
    }

    let s = '';
    if (document.getElementsByClassName('js-notification-ticker')[0] != undefined && parseInt(document.getElementsByClassName('js-notification-ticker')[0].innerHTML) > 0) s += ' '+parseInt(document.getElementsByClassName('js-notification-ticker')[0].dataset.notificationCount);
    if (parseInt(document.querySelector('a[href*="/conversations"] .header__counter').innerHTML) > 0) {
      s += (s.length>0?'+':' ')+'M'+document.querySelector('a[href*="/conversations"] .header__counter').innerHTML;
    }

    if (s.length > 0) {
      objects.mainButtonNotify.innerHTML = s;
      objects.mainButton.style.background = '#800';
    }
    else {
      objects.mainButtonNotify.innerHTML = '';
      objects.mainButton.style.background = '';
    }

    if (pub.scaled == 'true' || (settings.singleMode && pub.defzoom >= pub.zoom)) {
      if ((pub.mouseY/unsafeWindow.innerHeight > 0.15 && pub.mouseY/unsafeWindow.innerHeight < 0.85) &&
        !(popUps.down.classList.contains('active') || popUps.back.classList.contains('active'))) {
        pub.static++;
      }
      else {
        if (pub.static > 0) {
          pub.static = 0;
          state.hidden = false;
          pub.hidden = false;
          write();
          document.body.classList.remove('_ydb_fs_static');
        }
      }

      if (pub.static > settings.staticTime && !document.body.classList.contains('_ydb_fs_static')) {
        if (!pub.hidden) {
          state.hidden = true;
          pub.hidden = true;
          write();
          document.body.classList.add('_ydb_fs_static');
        }
      }
    }
  }

  function mouseListener(e) {
    pub.mouseX = e.clientX;
    pub.mouseY = e.clientY;
  }

  function wheelListener(e){
    if (!state.enabled) return;
    let delta = e.deltaY || e.detail || e.wheelDelta;
    let dt;

    if (pub.zoom<0.5) dt = 0.005*settings.zoomSpeed;
    else if (pub.zoom<1) dt = 0.01*settings.zoomSpeed;
    else if (pub.zoom<2.5) dt = 0.015*settings.zoomSpeed;
    else if (pub.zoom<5) dt = 0.025*settings.zoomSpeed;
    else dt = 0.05*settings.zoomSpeed;

    if (delta>0 && pub.zoom<10) {
      pub.zoom+=dt;
      pub.dta+=dt;
    }
    else if (delta<0 && pub.zoom>0.1) {
      pub.zoom-=dt;
      pub.dta-=dt;
    }
    if (settings.singleMode && singleDefSize) {
      singleDefSize = false;
      pub.scaled = 'false';
      objects.dcontainer.dataset.scaled = pub.scaled;
    }

    e.preventDefault();
  }

  function dropExecution(event) {
    if (!state.enabled || !settings.singleMode) return;
    if (event) event.stopImmediatePropagation();
  }

  function singleEvent(event) {
    if (!state.enabled || !settings.singleMode) return;
    if (document.querySelector('.image-target.hidden')) return;
    if (event) event.stopPropagation();

    singleDefSize = !singleDefSize;
    pub.scaled = ''+singleDefSize;
    if (pub.scaled != 'false') {
      pub.zoom = pub.defzoom;
      if (pub.isVideo) {
        event.preventDefault();
      }
    }
    else {
      pub.zoom = 1;
      initalZoom();
    }
    objects.dcontainer.dataset.scaled = pub.scaled;
    return false;
  }


  function advancedTagTools() {
    let t = JSON.parse(objects.icontainer.dataset.imageTags);
    if (t.indexOf(37875)>=0) {
      append('adc_pixel');
    }
    if (t.indexOf(23531)>=0) {
      adc.comic = true;
    }
  }


  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////

  function transformColor(v, x1, x2, d) {
    if (d) return parseInt(v/x1);
    else return parseInt(255-(255-v)/x2);
  }

  function isDarkF() {
    try {
      const c2 = document.head.querySelector('link[rel=stylesheet][media=all]').href;
      return (c2.split('/')[5].startsWith('dark') || c2.split('/')[5].startsWith('red'));
    }
    catch(e) {
      return Boolean(document.querySelector('body[data-theme*="dark"]'));
    }
  }

  function prePreColor() {
    if (state.colors) {
      colors = JSON.parse(state.colors);
      pub.isDark = isDarkF();
      applyColor();
    }
  }

  function preEnableColor() {
    if (settings.colorAccent) {
      document.body.appendChild(objects.colorAccent = createElement('div#_fs_colorAccent.tag.hidden', {dataset: {tagCategory:settings.style}}));
      pub.isDark = isDarkF();

      if (settings.style != colors.value || pub.isDark != colors.isDark || !state.colorApi || state.colorApi < currentColorApi) {
        state.colorApi = currentColorApi;
        write();
        remove('colorAccent');
        setTimeout(enableColor, 1);
      }
    }
  }

  function putDark() {
    if (document.body) {
      if (colors.isDark) document.body.classList.add('_fs_dark');
      else document.body.classList.remove('_fs_dark');
    }
    else setTimeout(putDark,10);
  }

  function applyColor() {
    if (document.getElementById('container')) cm_bg();
    const r = x => {
      styles.colorAccent = styles.colorAccent.replace(new RegExp(x,'g'), 'rgb('+colors[x][0]+','+colors[x][1]+','+colors[x][2]+')');
    };
    const rx = x => {
      styles.colorAccent = styles.colorAccent.replace(new RegExp(x,'g'), colors[x]);
    };
    styles.colorAccent = styles.colorAccentTemplate;
    rx('_fs_color');
    rx('_fs_background');
    r('_fs_component');
    r('_fs_2component');
    r('_fs_3component');
    r('_fs_4component');
    r('_fs_icomponent');
    r('_fs_ccomponent');
    append('colorAccent', true);

    const kek = () => {
      const xx = document.getElementsByClassName('theme-preview-trixie')[0];
      if (xx) {
        let c2 = document.head.querySelector('link[rel=stylesheet][media=all]').href;
        if (c2.split('/')[5].startsWith('red')) {
          xx.href = '/1085390';
          xx.querySelector('img').src = 'https://camo.derpicdn.net/4526e01f52d6d5e0f47a08cd002cb8ceaee7d559?url=https%3A%2F%2Fi.imgur.com%2FN2RPrTD.png';
          xx.style.maxWidth = '300px';
        }
        else {
          xx.href = '/1264984';
          xx.querySelector('img').src = 'https://derpicdn.net/assets/theme-cdf9fc928da041617fe7ec0f9683aaae63947a51a4f4104573567cf9a889a46c.png';
        }
      }
    };
    if (document.readyState !== 'loading') kek();
    else document.addEventListener('DOMContentLoaded', kek);
  }

  function enableColor(nrw) {

    colors.isDark = isDarkF();

    colors._fs_color = getComputedStyle(objects.colorAccent).color;
    colors._fs_background = getComputedStyle(objects.colorAccent).backgroundColor;

    let c = colors.isDark?colors._fs_background:colors._fs_color;
    colors.value = settings.style;
    colors._fs_component = c.substring(4, c.length - 1).split(',').map(v => transformColor(v, 3, 35, colors.isDark));
    colors._fs_2component = c.substring(4, c.length - 1).split(',').map(v => transformColor(v, 1.5, 5, colors.isDark));
    colors._fs_icomponent = c.substring(4, c.length - 1).split(',').map(v => transformColor(v, 1, 0.9, !colors.isDark));
    colors._fs_3component = c.substring(4, c.length - 1).split(',').map(v => transformColor(v, 2, 3, colors.isDark));
    colors._fs_4component = c.substring(4, c.length - 1).split(',').map(v => transformColor(v, 1.85, 10, colors.isDark));
    colors._fs_ccomponent = colors._fs_color.substring(4, colors._fs_color.length - 1).split(',').map(v => transformColor(v, 1.4, 1.3, colors.isDark));

    state.colors = JSON.stringify(colors);
    if (!nrw) {
      write();
    }
    applyColor();

  }

  function cm_bg() {
    if (settings.pony_mark !== 'off') {
      let theme = 'light'
      let mark = settings.pony_mark;
      if (document.getElementById('_fs_pony_mark_setting')) mark = document.getElementById('_fs_pony_mark_setting').value;
      try {
        let c2 = document.head.querySelector('link[rel=stylesheet][media=all]').href;
        if (c2.split('/')[5].startsWith('dark')) theme = 'dark';
        else if (c2.split('/')[5].startsWith('red')) theme = 'red';
      }
      catch(e) {
        if (Boolean(document.querySelector('body[data-theme*="dark"]'))) theme = 'dark';
        else if (Boolean(document.querySelector('body[data-theme="red"]'))) theme = 'red';
      }
      let ccolor = settings.style;
      if (document.getElementById('_fs_color_setting')) ccolor = document.getElementById('_fs_color_setting').value;

      if (mark === 'auto') mark = ponymarks.defaults[ccolor];
      if (mark === 'random') {
        let x = parseInt(Math.random()*13);
        let i;
        for (i in ponymarks.bgs) {
          if (x == 0) break;
          x--;
        }
        mark = i;
      }

      if (objects.ponymark) {
        objects.ponymark.parentNode.removeChild(objects.ponymark);
      }
      document.getElementById('container').insertBefore(objects.ponymark = createElement('div#_fs_pony_mark', { style:{
        backgroundImage:'url('+ponymarks.bgs[mark]+')',
        filter:(
            ccolor === 'body-type' ? 'grayscale(1) ' + (theme === 'light' ? 'brightness(300%)' : 'brightness(150%)') :
            'hue-rotate(' + ponymarks.filter[theme][ccolor] + 'deg)' +
            (theme === 'light' ? ' invert(1) saturate(250%) brightness(95%)' : '')+
            (!ponymarks.fix_brightness[theme][ccolor] ? '' : ' brightness(' + ponymarks.fix_brightness[theme][ccolor] + '%)')
        )
      }}), document.getElementById('container').firstChild);
    }
    else if (document.getElementById('_fs_pony_mark_setting')) {
      document.getElementById('container').removeChild(document.getElementById('_fs_pony_mark_setting'));
    }
  }

  function isForbidden() {
    return (document.title.indexOf('This image has been deleted.') == 0 || document.querySelector('#content>.walloftext>.block--warning')) ||
      (document.querySelector('#content>.block--warning:first-child'));
  }

  function preenable() {
    if (isForbidden()) return;
    append('general');
    if (settings.extended) {
      append('base');
      append('ex');
    }
    if (!settings.new) append('keepVanila');
    if (settings.staticEnabled) append('hider');
    if (settings.webmControls) append('webm');
  }

  function enable(notInital) {
    if (isForbidden()) return;
    if (notInital) preenable();
    if (!started) init();

    objects.disable.style.display = '';
    objects.enable.style.display = 'none';
    pub.mouseX = unsafeWindow.innerWidth/2;
    pub.mouseY = unsafeWindow.innerHeight/2;
    if (state.hidden) pub.static = 100000;
    else pub.static = 0;

    fillElement(document.body, [
      popUps.back = createElement('#_ydb_fs_backSide._fs_popup_back', [
        popUps.coms = createElement('#_ydb_fs_commPopup._fs_popup._fs_popup_big.block__content'),
        popUps.main = createElement('#_ydb_fs_mainPopup._fs_popup._fs_popup_vbig.block__content')
      ]),
      popUps.down = createElement('#_fs_down._fs_down', [
        popUps.downBack = createElement('#_fs_down_back._fs_down_back.tag', {dataset: {tagCategory: settings.style}}),
        popUps.downContainer = createElement('#_fs_down_container._fs_down_container', {dataset: {tagCategory: settings.style}})
      ])
    ])
    objects.mainButton = objects.mainButton || createElement('a#_fs_main', {style: {display: 'none'}, onclick:() => callPopup('main')}, [
      ['span', [
        ['i.fa', '\uf0c9'],
        objects.mainButtonNotify = createElement('span')
      ]]
    ]);

    document.querySelector('.image-metabar').childNodes[1].insertBefore(objects.mainButton, document.querySelector('.interaction--fave'));
    //document.querySelectorAll('#content>div')[3].appendChild(document.getElementById('image_options_area'));    console.log(document.getElementsByTagName('form'), document.getElementById('js-comment-form'));
    if (document.querySelector('form[action*="/comments"][method="post"]')) popUps.coms.appendChild(document.querySelector('form[action*="/comments"][method="post"]'));
    popUps.coms.appendChild(document.getElementById('comments'));
    //popUps.downContainer.appendChild(document.querySelector('#content>.block:first-child').cloneNode(true));
    //if (popUps.downContainer.childNodes[0].classList.contains('center--layout')) popUps.downContainer.childNodes[0].style.textAlign='center';
    //popUps.downContainer.childNodes[0].classList.add('layout--narrow');
    if (!settings.new) {
      document.querySelector('.block__header--user-credit > div').classList.add('block__content');
      popUps.downContainer.appendChild(document.querySelector('.block__header--user-credit > div'));
    }
    else {
      document.querySelector('#content .block.block__header').appendChild(createElement('div#_fs_top_bg',{style:{backgroundColor:getComputedStyle(document.getElementById('container')).backgroundColor}}));
    }
    popUps.downContainer.appendChild(document.querySelectorAll('#content>div')[2]);
    //popUps.downContainer.appendChild(popUps.coms.querySelector('#image_options_area'));

    document.querySelector('a[title="'+settings.button+'"]').classList.add('ydb_top_right_link');

    popUps.main.appendChild(document.querySelector('header'));
    popUps.main.appendChild(document.querySelector('nav.header.header--secondary'));
    popUps.main.appendChild(createElement('.block__header', [
      ['span', { style: { marginLeft: '1em' } }, 'Image Tools:'],
      ['a.js-up',{ onclick:() => document.querySelector('.image-metabar .js-up').click()}, [
        ['i.fa.fa-chevron-up'],
        ['span', ' Find']
      ]],
      ['a.js-random',{onclick:() => document.querySelector('.image-metabar .js-rand').click()}, [
        ['i.fa.fa-random'],
        ['span', ' Random']
      ]],
      document.querySelectorAll('#content>.block:first-child>* .js-subscription-link')[0].cloneNode(true),
      document.querySelectorAll('#content>.block:first-child>* .js-subscription-link')[1].cloneNode(true),
      document.querySelector('#content>.block:first-child>* .dropdown').cloneNode(true),
      document.querySelector('#content>.block:first-child>* [title="Related Images"]').cloneNode(true),
      document.querySelector('#content>.block:first-child>*>div:nth-child(4)').cloneNode(true)
    ]));
    document.querySelector('#_ydb_fs_mainPopup>.block__header>div:last-child').style.display = 'inline';
    //document.querySelector('#_ydb_fs_mainPopup>.block__header>div>.image-size').style.display = 'none';
    popUps.main.appendChild(document.querySelector('footer'));

    objects.image = document.getElementById('image-display');
    objects.de = document.documentElement;
    objects.icontainer = document.getElementsByClassName('image-show-container')[0];

    // not ready to serve images fix
    if (objects.icontainer) {
      const extension = JSON.parse(objects.icontainer.dataset.uris).full.split('.').pop();
      pub.isVideo = extension == 'webm';
      pub.gif = extension == 'gif';
      pub.jpg = extension == 'jpg' || extension == 'jpeg';
      pub.isSvg = !pub.gif && !pub.isVideo && !pub.jpg && document.querySelector('.image-size').innerText.split(' ')[1] == 'SVG';
    }

    objects.dcontainer = document.getElementsByClassName('image-target')[0];
    objects.commButton = document.getElementsByClassName('interaction--comments')[0];
    if (settings.commentLink) objects.commButton.href = 'javascript://';

    objects.commButton.addEventListener('click',showComms);
    popUps.back.addEventListener('mousedown',hidePopups);
    popUps.back.addEventListener('touchstart',hidePopups);
    document.body.addEventListener('mousemove',mouseListener);

    if (objects.image) loadedImgFetch();

    document.body.classList.add('_fs');

    pub.enabled = true;
    state.enabled = true;

    write();
    listener();

    //to avoid bugs on unloaded images
    if (objects.dcontainer) {
      objects.mutationObserver = new MutationObserver(loadedImgFetch);
      objects.mutationObserver.observe(objects.dcontainer, { childList: true, subtree: true });
      objects.dcontainer.addEventListener("wheel", wheelListener);
      advancedTagTools();
      if ((pub.gif || pub.isVideo) && settings.singleMode) {
        let x = JSON.parse(objects.icontainer.dataset.uris);
        for (let i in x) {
          x[i] = x.full;
        }

        const oldContent = objects.icontainer.dataset.uris;
        const newContent = JSON.stringify(x);
        objects.icontainer.dataset.uris = newContent;
      }

      if (pub.isSvg) {
        let x = JSON.parse(objects.icontainer.dataset.uris);
        const full = x.full.replace(/\.png$/, '.svg');
        for (let i in x) {
          x[i] = full;
        }
        objects.icontainer.dataset.uris = JSON.stringify(x);
        objects.image.src = full;
      }
    }
    else {
      popUps.down.classList.add('active');
    }

    unsafeWindow.addEventListener('resize', resize);

    if (location.hash.indexOf('#comment') == 0) showComms();
  }

  function disable() {
    objects.disable.style.display = 'none';
    objects.enable.style.display = '';
    remove('general');
    remove('base');
    remove('ex');
    remove('hider');
    remove('keepVanila');
    remove('webm');
    unscale();

    objects.mutationObserver.disconnect();
    objects.commButton.removeEventListener('click',showComms);
    objects.commButton.href = '#comments';
    popUps.back.removeEventListener('mousedown',hidePopups);
    popUps.back.removeEventListener('touchstart',hidePopups);
    document.body.removeEventListener('mousemove',mouseListener);
    objects.dcontainer.removeEventListener("wheel", wheelListener);

    //objects.mainButton.parentNode.removeChild(objects.mainButton);

    if (!settings.new) {
      popUps.downContainer.childNodes[0].classList.remove('block__content');
      document.getElementsByClassName('block__header--user-credit')[0].insertBefore(popUps.downContainer.childNodes[0],document.getElementsByClassName('image-size')[0]);
    }
    else {
      document.getElementById('_fs_top_bg').parentNode.removeChild(document.getElementById('_fs_top_bg'));
    }

    document.getElementById('content').appendChild(popUps.downContainer.childNodes[0]);
    if (document.querySelector('form[action*="/comments"][method="post"]')) document.querySelector('#content>.layout--narrow').appendChild(document.querySelector('form[action*="/comments"][method="post"]'));
    document.querySelector('#content>.layout--narrow').appendChild(document.getElementById('comments'));
    //document.getElementById('content').appendChild(popUps.coms.getElementsByTagName('div')[0]);
    document.querySelector('a[title="'+settings.button+'"]').classList.remove('ydb_top_right_link');

    document.getElementById('container').insertBefore(document.querySelector('nav.header.header--secondary'),document.getElementById('container').firstChild);
    document.getElementById('container').insertBefore(document.querySelector('header'),document.getElementById('container').firstChild);
    document.getElementById('container').appendChild(document.querySelector('footer'));

    //document.querySelectorAll('#content>div')[4].insertBefore(document.getElementById('image_options_area'), document.querySelectorAll('#content>div')[4].childNodes[0]);
    pub.enabled = false;
    state.enabled = false;

    document.body.classList.remove('_fs');
    document.body.removeChild(popUps.back);
    document.body.removeChild(popUps.down);
    unsafeWindow.removeEventListener('resize', resize);

    write();
  }

  register();
  if (document.title == "Update Deployment - Derpibooru - My Little Pony: Friendship is Magic Imageboard") return;
  document.addEventListener('DOMContentLoaded', () => {
    de = de || document.documentElement;
    cm_bg();
    if (document.getElementById('user_theme')) document.getElementById('user_theme').addEventListener('change',() => {
      remove('colorAccent');
      setTimeout(() => {
        if (isDarkF()) objects.colorAccent.classList.add('explicit_dark');
        else objects.colorAccent.classList.remove('explicit_dark');
      }, 200);
      setTimeout(() => enableColor(true), 777);
    });
    setTimeout(() => {
      if (document.getElementById('_fs_color_setting')) {
        document.getElementById('_fs_color_setting').addEventListener('change',(e) => {
          remove('colorAccent');
          objects.colorAccent.dataset.tagCategory = e.target.value;
          enableColor(true);
        });
      }
    },1000);
    setTimeout(() => {
      if (document.getElementById('_fs_pony_mark_setting')) {
        document.getElementById('_fs_pony_mark_setting').addEventListener('change', cm_bg);
      }
   },1000);
  });

  if (state.colorApi < currentColorApi) {
    state.enabled = false;
    state.colorApi = currentColorApi;
    write();
  }
  if (settings.colorAccent) prePreColor();
  if ((parseInt(location.pathname.slice(1))>=0 && !location.pathname.split('/')[2]) || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0 && !location.pathname.split('/')[3])) {
    if (state.enabled) {
      preenable();
      if (document.readyState !== 'loading') {
        enable();
        preEnableColor();
      }
      else document.addEventListener('DOMContentLoaded', () => {
        enable();
        preEnableColor();
      });
    }
    else {
      document.addEventListener('DOMContentLoaded',preEnableColor);
      if (document.readyState !== 'loading') init();
      else document.addEventListener('DOMContentLoaded', init);
    }
  }
  else {
    document.addEventListener('DOMContentLoaded',preEnableColor);
  }
}());
