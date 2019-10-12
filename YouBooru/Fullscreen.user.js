// ==UserScript==
// @name     Resurrected Derp Fullscreen
// @namespace  https://github.com/stsyn/derp-fullscreen/
// @version    0.7.20
// @description  Make Fullscreen great again!
// @author     St@SyaN

// @include    *://trixiebooru.org/*
// @include    *://derpibooru.org/*
// @include    *://www.trixiebooru.org/*
// @include    *://www.derpibooru.org/*
// @include    *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/*
// @include    *://*.orzgs6djmvrg633souxg64th.*.*/*
// @include    *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/*
// @include    *://*.mrsxe4djmjxw64tvfzxxezy.*.*/*

// @exclude    *://trixiebooru.org/adverts/*
// @exclude    *://derpibooru.org/adverts/*
// @exclude    *://www.trixiebooru.org/adverts/*
// @exclude    *://www.derpibooru.org/adverts/*
// @exclude    *://*.o53xo.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude    *://*.orzgs6djmvrg633souxg64th.*.*/adverts/*
// @exclude    *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*
// @exclude    *://*.mrsxe4djmjxw64tvfzxxezy.*.*/adverts/*

// @exclude    *://trixiebooru.org/*.json
// @exclude    *://derpibooru.org/*.json
// @exclude    *://www.trixiebooru.org/*.json
// @exclude    *://www.derpibooru.org/*.json
// @exclude    *://*.o53xo.orzgs6djmvrg633souxg64th.*.json
// @exclude    *://*.orzgs6djmvrg633souxg64th.*.json
// @exclude    *://*.o53xo.mrsxe4djmjxw64tvfzxxezy.*.json
// @exclude    *://*.mrsxe4djmjxw64tvfzxxezy.*.json

// @require    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js

// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js
// @updateURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/Fullscreen.user.js

// @grant    GM_addStyle

// @run-at     document-start
// ==/UserScript==


(function() {
  'use strict';
  let currentColorApi = 3;
  let styles = {};
  styles.general = `
#_ydb_fs_enable {
display:none
}
#_ydb_fs_mainPopup {
position:relative;
display: flex;
flex-direction: column;
}
footer {
position:absolute;
bottom:0;
width:calc(100% - 12px);
}
._fs #footer {
background:none
}
#content>.block:first-child, .flash--site-notice {
height:0;
margin:0;
padding:0;
}
#content>.block:first-child{
z-index:201;
width:100%;
position:fixed;
}
.image-show-container .block--warning {
margin:auto;
}
#content {
margin:0;
padding:0;
padding-left:0 !important;
}
.layout--narrow > h4 {display:none}
#content>.block:first-child>* a.js-rand,
#content>.block:first-child>* a.js-up,
#content>.block:first-child>* a.js-prev i,
#content>.block:first-child>* a.js-next i{
display:none;
}
#content>.block:first-child>* a.js-prev,
#content>.block:first-child>* a.js-next{
position:fixed;
top:0;
height:100%;
width:10%;
}
#content>.block:first-child>* a.js-prev {
left:0;
}
#content>.block:first-child>* a.js-next {
right:0;
}
.center--layout--flex .image-show-container {
position:absolute;
top:0;
left:0;
margin:0;
padding:0;
min-width:100%;
min-height:100%;
z-index:200;
}
._fs_popup_back {
position:fixed;
display:none;
top:0;
left:0;
width:100%;
height:100%;
z-index:400;
background:rgba(0,0,0,.5);
}
._fs_popup {
display:none;
margin:auto;
overflow-y:auto;
}
._fs_popup_big {
max-width:1000px;
height:80vh;
margin-top:10vh;
}
._fs_popup_vbig {
width:95vw;
height:80vh;
margin-top:10vh;
}
._fs_popup.active, ._fs_popup_back.active{
display:block;
}
._fs_down {
display:none;
}
#image_target, #image_target>picture {
min-height:100vh;
min-width:100vw;
display:block;
}
#image_target>video{
max-height:none;
max-width:none;
display:block;
}
#image_target>picture>* {
max-height:none;
max-width:none;
margin:auto;
display:block;
}
#_ydb_fs_disable {
left:0;
top:0;
position:fixed;
z-index:202;
display:inline-block !important;
opacity:0.3;
font-size: 120%;
line-height: 205%;
}
#_ydb_fs_disable:hover {
opacity:.7
}

.block__header__title {
text-shadow:0 0 0.15em #fff;
font-size:100%;
line-height:175%;
}

body[data-theme*="dark"] .block__header__title {
text-shadow:0 0 0.15em #000;
}

#content>.block:first-child>*,
#content>.block:first-child>* a:not(.active){
background:none;
}

#image_target {
position:fixed;
top:0;
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
}

#_fs_scroll_bot,#_fs_scroll_rgt {
background:none;
border-radius:5px;
display:block;
position:fixed;
z-index:201;
}
#_fs_scroll_bot {
height:10px;
bottom:3px
}
#_fs_scroll_rgt {
width:10px;
right:3px
}

`;
  styles.keepVanila = `
#content>.block:first-child>*>div {
text-align:center;
width:100%;
font-size:150%;
line-height:175%;
z-index:2;
}

#content>.block:first-child>*>.interaction--comments:hover,
#_fs_main:hover{
color:#e0e0e0;
}

#content>.block:first-child>*>.block__header__title:hover {
color:#000;
transition-duration: 0.1s;
transition-timing-function: ease-in-out;
}

#content>.block:first-child>.block__header--sub .image_uploader,
#content>.block:first-child>.block__header--sub time,
#content>.block:first-child>* [class*="js-notification-Image"],
#content>.block:first-child>* [href*="/related"],
#content>.block:first-child>* [href*="/view/"],
#content>.block:first-child>* [href*="/download/"],
.image-metabar>div:nth-child(3),
.image-metabar span[data-click-preventdefault="true"]{
display:none;
}


#content>.block:first-child>* a.ydb_top_right_link {
right:0;
position: fixed;
z-index:202;
opacity:0.3;
display:inline;
top: 0;
}

.image-size{
text-shadow:0 0 0.15em #fff, 0 0 0.15em #fff;
right:0;
position:absolute;
z-index:202;
opacity:0.4;
display:inline;
top: 2.2em;
}


body[data-theme*="dark"] .image-size {
text-shadow:0 0 0.15em #000, 0 0 0.15em #000;
}

#content>.block:first-child>* [href*="/download/"]:hover {
opacity:.7;
}
`;
  styles.base = `
#content>.block:first-child{
top:0;
height:auto;
background:none;
width:100%;
}

#content>.block:first-child>.block__header--sub {
float:right;
width:auto;
opacity:0.2;
}

#content>.block:first-child>.block__header>div {
text-align:center;
width:100%;
font-size:150%;
line-height:175%;
z-index:2;
}

#content>.block:first-child>*>.block__header__title {
font-size:100%;
line-height:100%;
transition-duration: 0.1s;
transition-timing-function: ease-in-out;
color:#e0e0e0;
}

.block__header__title {
text-shadow:0 0 0.15em #fff;
font-size:100%;
line-height:175%;
}

body[data-theme*="dark"] .block__header__title {
text-shadow:0 0 0.15em #000;
}

#content>.block:first-child>.block__header>.interaction--comments:hover,
#_fs_main:hover{
color:#e0e0e0;
}

#content>.block:first-child>.block__header>.block__header__title:hover {
color:#000;
transition-duration: 0.1s;
transition-timing-function: ease-in-out;
}

#content>.block:first-child>.block__header--sub .image_uploader,
#content>.block:first-child>.block__header--sub time,
#content>.block:first-child>.block__header [class*="js-notification-Image"],
#content>.block:first-child>.block__header [href*="/related"],
#content>.block:first-child>.block__header [href*="/view/"],
#content>.block:first-child>.block__header [href*="/download/"] {
display:none;
}

#content>.block:first-child>.block__header a.ydb_top_right_link {
right:0;
position:absolute;
z-index:202;
opacity:0.3;
display:inline;
top: 0;
}

#content>.block:first-child>.block__header>div>.image-size{
right:0;
position:absolute;
font-size:70%;
z-index:202;
opacity:0.3;
display:inline;
top: 2em;
}
body[data-theme*="dark"] #content>.block:first-child>.block__header>div>.image-size {
text-shadow:0 0 0.15em #000, 0 0 0.15em #000;
}

#content>.block:first-child>.block__header [href*="/download/"]:hover {
opacity:.7;
}
`;

  styles.ex = `
#content .image-show-container .block--warning{
margin-top:6em;
}
._fs_down {
transition:.3s;
display:block;
width:100%;
z-index:300;
bottom:0;
height:15vh;
overflow:hidden;
position:fixed;
left:0;
}
._fs_down_container{
transition:.3s;
max-width:1000px;
margin:auto;
margin-top:14vh;
height:1vh;
}
._fs_down_back{
transition:.3s;
width:100%;
height:calc(100% - 13vh);
position:absolute;
top:13vh;
left:0;
z-index:-1;
opacity:.8;
}

#_fs_top_bg {
width:100%;
position:absolute;
top:0;
left:0;
z-index:-1;
opacity:.5;
height:4em;
}


._fs_down.active {
height:66vh;
}
._fs_down.active ._fs_down_container{
margin-top:1vh;
height:55vh;
overflow-y:auto;
padding-bottom:11vh;
}
._fs_down.active ._fs_down_back{
height:100%;
top:0;
}
`;

  styles.hider = `
._ydb_fs_static #content>.block:first-child>*,
._ydb_fs_static ._fs_down{
opacity:0;
transition:.5s;
}
`;

  styles.imageZoom = `
#_fs_scroll_bot, #_fs_scroll_rgt {
background:RGBA(192,192,192,0.5);
transition:0.1s;
transition-timing-function:linear;
}
#image-display {
transition:0.1s;
transition-timing-function:linear;
}
#image_target>video {
min-height: 0;
min-width: 0;
max-height: none;
max-width: none;
margin:auto;
}
`;

  styles.hideAll = `
.block, ._fs_down  {
display:none
}`;

  styles.colorAccentTemplate = `
*:not(.dnp-warning) > *:not(.tag) > a:not(.header__link):not([rel="dc:source"]):not(.button):not(.block__header):not(.tag__name):not(.interaction--hide):not(.interaction--fave):not(.interaction--comments):not(.interaction--upvote):not(.interaction--downvote), .button.button--link, .button.button--link:visited {
color:_fs_color;
}

/*p>a {
color:_fs_color !important;
}*/

#content .communication__body .spoiler:not(:hover) a[href], .image-description .spoiler:not(:hover) a[href] {
color:#e88585 !important
}

body[data-theme*="dark"] #content .communication__body .spoiler:not(:hover) a[href], body[data-theme*="dark"] .image-description .spoiler:not(:hover) a[href] {
color:#782c21 !important
}

.autocomplete__item:not(.autocomplete__item--selected), .header, #burger a:hover, header a.header__link, span.header__link-user__dropdown-arrow, .add-to-gallery-list ::-webkit-scrollbar-thumb,
span.header__link-user__dropdown-arrow:hover, .header__dropdown:hover span.header__link-user__dropdown-arrow, .sparkline .bar, .poll-bar__fill:not(.poll-bar__fill--top)  {
background-color:_fs_ccomponent;
}

.border-vertical, .block__header--js-tabbed a:hover, .image-description, #imagespns, .block__header--js-tabbed, .block__header--js-tabbed a.selected, .block__header--js-tabbed a.selected:hover,
.button:not(.commission__category):not(.button--state-warning):not(.button--state-danger):not(.button--state-success), .toggle-box+label,
.block__list a.block__list__link, .block__list, .input, .communication__toolbar__button, .tag-info__image,
#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked+.scraper-preview--image-wrapper,
.block__header--js-tabbed a, .block__header--js-tabbed a:last-child, .block__header--js-tabbed a:first-child, .block--fixed:not(.block--success):not(.block--warning), .media-box, .filter,
.poll-bar {
border-color:_fs_background;
}

#container, .block__content .profile-top__options ul li a {
background:none
}

hr {
background-color: _fs_background;
}

body, .image-description, #imagespns, .block__content, .block__tab, .block__header--js-tabbed a.selected, .block__header--js-tabbed a.selected:hover, .toggle-box+label,
a.header__search__button:hover, button.header__search__button:hover, .input, .communication__toolbar__button, .tag__dropdown__link:hover, .block--fixed:not(.block--success):not(.block--warning),
.filter, #burger a, #burger,
.alternating-color:nth-child(odd), .table>thead>tr, .table>tbody>tr:nth-child(odd), .poll-bar,
.block__content .profile-top__options ul li:hover {
background:_fs_component;
}

#footer, .alternating-color:nth-child(even), .table>tbody>tr:nth-child(even), .block__header--sub, .block__header--sub a, .block__content>.label.label--primary.label--block,
.block__content .profile-top__options ul li {
background:_fs_4component;
}

.header--secondary>.flex>.hide-mobile a.header__link:hover, .header--secondary .header__dropdown:hover>a, .input:focus, .communication__toolbar__button:hover, .tag__dropdown__link,
.block__header, .block__header--single-item,
.block__header a, .block__header--single-item a, .block__list a.block__list__link,
.communication__options, .button:not(.commission__category):not(.button--state-warning):not(.button--state-danger):not(.button--state-success),
a.media-box__header--link:hover, .header--secondary span.header__counter,
#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked+.scraper-preview--image-wrapper,
.interaction--downvote.disabled, .interaction--downvote.disabled:hover, .block__content>.label.label--primary.label--block:hover, .poll-form__options__label {
background:_fs_2component;
}

.rule h2, .quick-tag-table__tab>div, .poll-form__options__label {
border-color:_fs_2component;
}

.input:focus, .communication:target, .communication__toolbar__button:focus, .communication__toolbar__button:hover, .communication__toolbar__button:active,
.communication__toolbar__button:visited, .sparkline  {
border-color:_fs_color;
}

.barline__bar {
fill:_fs_color;
}

a:not(.header__link):not([rel="dc:source"]):not(.button):not(.block__header):not(.block__header--single-item):not(.tag__name):not(.interaction--fave):not(.interaction--comments):not(.interaction--upvote):not(.interaction--hide):not(.interaction--downvote):not(.media-box__header--link):hover{
color:#aaa !important;
}

body[data-theme*="dark"] a:not(.header__link):not([rel="dc:source"]):not(.button):not(.block__header):not(.block__header--single-item):not(.tag__name):not(.interaction--fave):not(.interaction--comments):not(.interaction--upvote):not(.interaction--downvote):not(.media-box__header--link):hover{
color:#aaa !important;
}

.media-box__header:not(.media-box__header--unselected), .button:hover:not(.button--state-danger):not(.button--state-warning):not(.button--state-success), .toggle-box+label:hover, .header--secondary, .header--secondary>.flex>.hide-mobile a,
.block__list a.block__list__link.primary, select.header__input:hover, select.header__input:focus:hover, span.header__counter {
background-color:_fs_background;
border-color:_fs_color;
}

header a.header__link:hover, .header__dropdown:hover>a, ::selection {
background:_fs_color;
}

.block__header__dropdown-tab:hover>a, a.block__header--single-item:hover, .block__header a:hover, .block__header--sub a:hover, .block__header--single-item a:hover, .rule h2 {
background:_fs_3component;
}

.button--link:hover,
div.tag-list span.source_url a:not(.header__link):hover{
color:_fs_ccomponent !important;
}

.header__input, .header__input:focus, select.header__input, select.header__input:focus, a.header__search__button, button.header__search__button,
select.header__input:hover, select.header__input:focus:hover,body[data-theme*="default"] .flash.flash--site-notice {
background-color:_fs_icomponent;
}

.block__content, .block__content:last-child, .block__content:first-child, .table, .table>tbody, .block__tab, .block__tab:not(.hidden), .block__content>.label.label--primary.label
{
border-color:_fs_2component;
}
.block__header--js-tabbed  {
background:none
}


#_fs_pony_mark {
width:100%;
height:100%;
position:fixed;
background-position:bottom right;
background-repeat:no-repeat;
background-size:contain;
top:0;
left:0;
z-index:-1;
pointer-events:none;
opacity:0.25;
}
`;

  styles.adc_pixel = `
#image_target {
image-rendering: pixelated;
}
`;

  styles.noneTag = `
body[data-theme*="dark"] .tag[data-tag-category="none"], .tag[data-tag-category="none"].explicit_dark {
background: #333;
border-color: #555;
color: #888;
}

.tag[data-tag-category="none"] {
background: #ccc;
border-color: #888;
color: #777;
}
`;

  let popUps = {};
  let objects = {};
  let pub = {};
  let adc = {};
  let settings, state;
  let colors = {};
  let started = false;
    let dictionary = {};

  let ponymarks = {
    bgs:{
      aj:'https://camo.derpicdn.net/9ec1a92c1d98be04d750f719c5285e14eb0af3e7?url=https%3A%2F%2Fi.imgur.com%2FiOy09ti.png',
      dh:'https://camo.derpicdn.net/497efe3f86ad217bd0999dd1c904e4cb9c9f897c?url=https%3A%2F%2Fi.imgur.com%2FOdsgUat.png',
      fs:'https://camo.derpicdn.net/45c6d0533de22ccbbbccb77c44b9f0c6229c67ab?url=https%3A%2F%2Fi.imgur.com%2Fc3Bo4i8.png',
      luna:'https://camo.derpicdn.net/4d4c82f4c20c3dae40587b1836decec85ae506a9?url=https%3A%2F%2Fi.imgur.com%2FpmcGux8.png',
      lyra:'https://camo.derpicdn.net/a80100c0596a68ff8881c80f3b8a168f98b58825?url=https%3A%2F%2Fi.imgur.com%2FMijgqfu.png',
      pcd:'https://camo.derpicdn.net/ef8cf240f883a12285720569f2f1a02c75104942?url=https%3A%2F%2Fi.imgur.com%2F5yreNg4.png',
      pp:'https://camo.derpicdn.net/ea8d8c75578126a1102161eb29fed0c95a2232fd?url=https%3A%2F%2Fi.imgur.com%2FNDUyAIQ.png',
      rd:'https://camo.derpicdn.net/f9851bd532e626c21f28c740153bf57724596a1d?url=https%3A%2F%2Fi.imgur.com%2FC70ULye.png',
      ry:'https://camo.derpicdn.net/681bbc4eb5c3d1cfb52ed0314394e13759ca1201?url=https%3A%2F%2Fi.imgur.com%2FFE1oL6K.png',
      sg:'https://camo.derpicdn.net/02c657a4380895b264b92bddfcde31c71cf69732?url=https%3A%2F%2Fi.imgur.com%2F7P3D8xl.png',
      tia:'https://camo.derpicdn.net/59f353243662b65b8b5db8553d2523a86fbd8ecd?url=https%3A%2F%2Fi.imgur.com%2F6VxwK0n.png',
      ts:'https://camo.derpicdn.net/361a9e94f8f37e4d8175a1ceb361134e8eb00b73?url=https%3A%2F%2Fi.imgur.com%2FURcKMiB.png',
      tx:'https://camo.derpicdn.net/8c9b2c6232506c634e588162402fb5020e783c39?url=https%3A%2F%2Fi.imgur.com%2FRQHaAEG.png'
    },
    defaults:{
      'content-fanmade': 'pp',
      species:'none',
      oc: 'ts',
      error: 'tia',
      spoiler: 'aj',
      'content-official': 'fs',
      '': 'lyra',
      character: 'rd',
      rating: 'luna',
      origin: 'ry',
      none: 'dh'
    },
    fix_brightness: {
      light:{},
      dark:{
        spoiler: 150,
        'content-official':160
      },
      red:{}
    },
    filter:{
      dark:{
        species: 45,
        'content-fanmade': 320,
        oc: 300,
        error: 0,
        spoiler: 60,
        'content-official': 70,
        '': 120,
        character:183,
        rating:210,
        origin:265
      },
      light:{
        species: 185,
        'content-fanmade': 170,
        oc: 150,
        error: 180,
        spoiler: 190,
        'content-official':255,
        '': 270,
        character:340,
        rating:60,
        origin:70
      },
      red:{
        species: 60,
        'content-fanmade': 320,
        oc: 300,
        error: 0,
        spoiler: 60,
        'content-official': 70,
        '': 120,
        character:180,
        rating:210,
        origin:280
      }
    }
  };

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

  if (settings.extended == undefined) settings.extended = true;
  if (settings.scrollSpeed == undefined) settings.scrollSpeed = 20;
  if (settings.scrollMultiply == undefined) settings.scrollMultiply = 5;
  if (settings.staticTime == undefined) settings.staticTime = 20;
  if (settings.staticEnabled == undefined) settings.staticEnabled = true;
  if (settings.commentLink == undefined) settings.commentLink = true;
  if (settings.colorAccent == undefined) settings.colorAccent = false;
  if (settings.style == undefined) settings.style = 'rating';
  if (settings.button == undefined) settings.button = 'Download (short filename)';
  if (settings.pony_mark == undefined) settings.pony_mark = 'none';
  settings.scrollSpeed = parseInt(settings.scrollSpeed);
  settings.scrollMultiply = parseInt(settings.scrollMultiply);
  settings.staticTime = parseInt(settings.staticTime);
  localStorage._ydb_fs = JSON.stringify(settings);

  let singleDefSize = settings.singleMode;
  let singleFirstChange = false;

  function register() {
    let fsData = {
      name:'Fullscreen',
      container:'_ydb_fs',
      version:GM_info.script.version,
      link:'/meta/topics/userscript-derp-fullscreen-viewer',
      s:[
        {type:'checkbox', name:'Show UI', parameter:'extended'},
        {type:'input', name:'Scroll speed', parameter:'scrollSpeed', validation:{type:'int',min:5, max:100, default:20}},
        {type:'input', name:'Scroll multiplier', parameter:'scrollMultiply', validation:{type:'float',min:1, max:10, default:2}},
        {type:'checkbox', name:'Remove href from comments link', parameter:'commentLink'},
        {type:'breakline'},
        {type:'checkbox', name:'New experimental UI', parameter:'new'},
        {type:'checkbox', name:'All in one mode (beta)', parameter:'singleMode'},
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
          {name:'Grey', value:'none'}
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
    document.addEventListener('DOMContentLoaded', function() {addElem('span', {style:{display:'none'}, type:'text', dataset:{value:JSON.stringify(fsData),origin:'script'}, className:'_YDB_reserved_register'}, document.body);});
  }
  
  function append(id, accentFix) {
    if (dictionary[id] && !accentFix) dictionary[id].media = 'all';
    dictionary[id] = GM_addStyle(styles[id]);
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
    if (objects.icontainer.dataset.aspectRatio > window.innerWidth/window.innerHeight) pub.wide = false;
    else pub.wide = true;

    let forced = settings.singleMode && singleDefSize;

    if (pub.scaled != objects.dcontainer.dataset.scaled) {
      if (!settings.singleMode) {
        pub.scaled = objects.dcontainer.dataset.scaled;
        if (pub.scaled != 'true') {
          append('hideAll');
          append('imageZoom');
          pub.zoom = 1;
        }
        else {
          remove('hideAll');
          remove('imageZoom');
        }
      }
    }

    if (settings.singleMode) {
      if (pub.scaled == 'partscaled') {
        pub.scaled = 'false';
        initalZoom();
      }
    }

    if (!pub.wide) pub.defzoom = window.innerWidth/objects.icontainer.dataset.width;
    else pub.defzoom = window.innerHeight/objects.icontainer.dataset.height;

    if (settings.singleMode && pub.zoom<pub.defzoom && !doNotSwitch) {
      singleEvent();
      return;
    }

    if (pub.scaled != 'false') {
      if (!pub.wide) {
        objects.image.style.width = forced?window.innerWidth+'px':'100vw';
        pub.zoom = window.innerWidth/objects.icontainer.dataset.width;
        objects.image.style.height = forced?(window.innerWidth/objects.icontainer.dataset.aspectRatio)+'px':'auto';
        let aspectRatio = window.innerWidth / window.innerHeight;
        let zoomRatio = objects.icontainer.dataset.width / window.innerWidth;

        objects.image.style.marginLeft = '0';
        objects.image.style.marginTop = (window.innerHeight - (objects.icontainer.dataset.height / zoomRatio)) / 2+'px';

        if (pub.isVideo && pub.scaled == 'true') {
          objects.image.style.marginTop = '0';
        }
      }
      else {
        let aspectRatio = window.innerWidth / window.innerHeight;
        let zoomRatio = objects.icontainer.dataset.height / window.innerHeight;

        objects.image.style.marginTop = '0';
        objects.image.style.height = forced?window.innerHeight+'px':'100vh';
        pub.zoom = window.innerHeight/objects.icontainer.dataset.height;
        objects.image.style.width = forced?(window.innerHeight*objects.icontainer.dataset.aspectRatio)+'px':'auto';

        objects.image.style.marginLeft = (window.innerWidth - (objects.icontainer.dataset.width / zoomRatio)) / 2+'px';
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
    objects.disable = addElem('a', {id:'_ydb_fs_disable', className:'', style:{display:'none'}, innerHTML:'Disable', events:[{t:'click',f:disable}]},  document.querySelector('#content>.block:first-child'));
    objects.enable = addElem('a', {id:'_ydb_fs_enable', className:'header__link', innerHTML:'Fullscreen', events:[{t:'click',f:function() {enable(true);}}]}, document.body);
    document.getElementsByClassName('header__force-right')[0].insertBefore(objects.enable, document.getElementsByClassName('header__force-right')[0].childNodes[0]);
    started = true;
  }

  function disgustingLoadedImgFetch() {
    if (!state.enabled) return;
    setTimeout(loadedImgFetch, 1);
    if (pub.scaled == 'false') zeroZoom();
  }

  function loadedImgFetch() {
    objects.image = document.getElementById('image-display');

    if (settings.singleMode && objects.dcontainer != undefined) {
      append('imageZoom');
      if (!pub.isVideo) {
        objects.fullImage = InfernoAddElem('img',{style:{display:'none'},src:JSON.parse(objects.icontainer.dataset.uris).full, events:[{t:'load',f:function() {
          objects.dcontainer.addEventListener('click', singleEvent);
          //objects.icontainer.addEventListener('click', dropExecution);
        }}]},[]);
      }
      else {
        if (!/full.webm/.test(objects.image.querySelector('[type="video/webm"]').src)) {
          objects.image.querySelector('[type="video/webm"]').src = JSON.parse(objects.icontainer.dataset.uris).webm;
          objects.image.querySelector('[type="video/mp4"]').src = JSON.parse(objects.icontainer.dataset.uris).mp4;
          objects.image.addEventListener('click', singleEvent);
        }
      }
    }
    if (!pub.isVideo && !singleFirstChange && settings.singleMode) {
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
    for (let i=0; i<popUps.back.childNodes.length; i++) popUps.back.childNodes[i].classList.remove('active');
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

  function checkMargin() {
    let de = document.documentElement;
    let scrWidth = de.clientWidth,scrHeight = de.clientHeight;
    if (pub.dta === 0) return;
    if (!isNaN(parseInt(objects.image.style.marginTop))) {
      if (parseInt(objects.image.style.marginTop)<=0) {
        objects.image.style.marginTop = -(pub.zoom*objects.icontainer.dataset.height*(scrHeight/2-parseInt(objects.image.style.marginTop))/(objects.icontainer.dataset.height*(pub.zoom-pub.dta))-scrHeight/2)+'px';
      }
    }
    if (!isNaN(parseInt(objects.image.style.marginLeft))) {
      if (parseInt(objects.image.style.marginLeft)<=0) {
        objects.image.style.marginLeft = -(pub.zoom*objects.icontainer.dataset.width*(scrWidth/2-parseInt(objects.image.style.marginLeft))/(objects.icontainer.dataset.width*(pub.zoom-pub.dta))-scrWidth/2)+'px';
      }
    }
    pub.dta=0;
  }

  function zeroZoom() {
    let de = document.documentElement;
    pub.zoom = pub.defzoom;
    objects.image.style.height=objects.icontainer.dataset.height*pub.zoom+'px';
    objects.image.style.width=objects.icontainer.dataset.width*pub.zoom+'px';
    objects.image.style.marginTop = -(objects.icontainer.dataset.height*pub.zoom - de.clientHeight)/2 + 'px';
    objects.image.style.marginLeft = -(objects.icontainer.dataset.width*pub.zoom - de.clientWidth)/2 + 'px';
  }

  function initalZoom(width) {
    let de = document.documentElement;
    if (!width || width === undefined) {
      if (adc.comic) {
        if (pub.wide) pub.zoom = window.innerWidth*(de.clientHeight>de.clientWidth?10:8)/10/objects.icontainer.dataset.width;
        objects.image.style.marginTop = '0';
      }
      else objects.image.style.marginTop = -(objects.icontainer.dataset.height - de.clientHeight)/2 + 'px';
    }
    if (width || width === undefined) {
      if (adc.comic) {
        objects.image.style.marginLeft = '0';
        if (!pub.wide) pub.zoom = window.innerHeight*(de.clientHeight<de.clientWidth?10:8)/10/objects.icontainer.dataset.height;
      }
      else objects.image.style.marginLeft = -(objects.icontainer.dataset.width - de.clientWidth)/2 + 'px';
    }
  }

  function setMargin() {
    if (pub.scaled != 'false' && !settings.singleMode) {
      return;
    }
    if (document.querySelector('#image-target.hidden') != null) return;
    if (objects.image == undefined) return;
    let de = document.documentElement;
    if (pub.zoom >   20) pub.zoom =   20;
    if (pub.zoom < 0.02) pub.zoom = 0.02;
    addScrolls();
    let xScale = de.clientWidth/(objects.icontainer.dataset.width*pub.zoom), yScale = de.clientHeight/(objects.icontainer.dataset.height*pub.zoom);
    if (!settings.singleMode) {
      if (isNaN(parseInt(objects.image.style.marginTop))) {
        initalZoom(false);
      }
      if (isNaN(parseInt(objects.image.style.marginLeft))) {
        initalZoom(true);
      }
    }
    objects.image.style.height=objects.icontainer.dataset.height*pub.zoom+'px';
    objects.image.style.width=objects.icontainer.dataset.width*pub.zoom+'px';
    if (settings.singleMode && !(pub.isVideo || pub.gif)) {
      let isWide = (objects.icontainer.dataset.width/objects.icontainer.dataset.height > 1);
      let newsrc;
      if (isWide) {
        if (parseInt(objects.image.style.width) > 1280 && objects.icontainer.dataset.width > 1280) newsrc = JSON.parse(objects.icontainer.dataset.uris).full;
        else newsrc = JSON.parse(objects.icontainer.dataset.uris).large;
      }
      else {
        if ((parseInt(objects.image.style.width) > 1280 && objects.icontainer.dataset.width > 1024) || (parseInt(objects.image.style.height) > 4096 && objects.icontainer.dataset.height > 4096)) newsrc = JSON.parse(objects.icontainer.dataset.uris).full;
        else newsrc = JSON.parse(objects.icontainer.dataset.uris).tall;
      }
      if (objects.image.src != newsrc) objects.image.src = newsrc;
    }

    checkMargin();
    if (objects.icontainer.dataset.height*pub.zoom < de.clientHeight) {
      objects.image.style.marginTop = (de.clientHeight - objects.icontainer.dataset.height*pub.zoom) / 2+'px';
      objects.scroll_rgt.style.display = 'none';
    }
    else {
      objects.scroll_rgt.style.display = 'block';
      let vx = de.clientHeight*4/10;
      if (pub.mouseY < vx) {
        let v = 1-pub.mouseY/vx;
        objects.image.style.marginTop = (isNaN(parseInt(objects.image.style.marginTop))?0:parseInt(objects.image.style.marginTop))+settings.scrollSpeed*v*6+'px';
      }
      if (pub.mouseY > de.clientHeight*6/10) {
        let v = (pub.mouseY-de.clientHeight*6/10)/vx;
        objects.image.style.marginTop = (isNaN(parseInt(objects.image.style.marginTop))?0:parseInt(objects.image.style.marginTop))-settings.scrollSpeed*v*6+'px';
      }

      if (parseInt(objects.image.style.marginTop)>0) objects.image.style.marginTop = '0px';
      if (-parseInt(objects.image.style.marginTop)>=(objects.icontainer.dataset.height*pub.zoom-de.clientHeight)) objects.image.style.marginTop = -(objects.icontainer.dataset.height*pub.zoom-de.clientHeight)+1+'px';
      if (singleDefSize) {
        objects.image.style.marginTop = '0px';
        objects.scroll_rgt.style.display = 'none';
      }
    }

    if (objects.icontainer.dataset.width*pub.zoom > de.clientWidth) {
      objects.scroll_bot.style.display = 'block';
      let vx = de.clientWidth*4/10;
      if (pub.mouseX < vx) {
        let v = 1-pub.mouseX/vx;
        objects.image.style.marginLeft = (isNaN(parseInt(objects.image.style.marginLeft))?0:parseInt(objects.image.style.marginLeft))+settings.scrollSpeed*v*6+'px';
      }
      if (pub.mouseX > de.clientWidth*6/10) {
        let v = (pub.mouseX-de.clientWidth*6/10)/vx;
        objects.image.style.marginLeft = (isNaN(parseInt(objects.image.style.marginLeft))?0:parseInt(objects.image.style.marginLeft))-settings.scrollSpeed*v*6+'px';
      }

      if (parseInt(objects.image.style.marginLeft)>0) objects.image.style.marginLeft = '0px';
      if (-parseInt(objects.image.style.marginLeft)>=(objects.icontainer.dataset.width*pub.zoom-de.clientWidth)) objects.image.style.marginLeft = -(objects.icontainer.dataset.width*pub.zoom-de.clientWidth)+1+'px';
      if (singleDefSize) {
        objects.image.style.marginLeft = '0px';
        objects.scroll_bot.style.display = 'none';
      }
    }
    else
    {
      objects.image.style.marginLeft = (de.clientWidth - objects.icontainer.dataset.width*pub.zoom) / 2+'px';
      objects.scroll_bot.style.display = 'none';
    }
    objects.scroll_bot.style.left = -(isNaN(parseInt(objects.image.style.marginLeft))?0:parseInt(objects.image.style.marginLeft))*xScale+'px';
    objects.scroll_rgt.style.top = -(isNaN(parseInt(objects.image.style.marginTop))?0:parseInt(objects.image.style.marginTop))*yScale+'px';
  }

  function addScrolls() {
    if (pub.scaled != 'false' && !settings.singleMode) return;
    let de = document.documentElement;
    let scrWidth = de.clientWidth, xScale = de.clientWidth/(objects.icontainer.dataset.width*pub.zoom);
    let scrHeight = de.clientHeight, yScale = de.clientHeight/(objects.icontainer.dataset.height*pub.zoom);

    objects.scroll_bot = addElem('div', {id:'_fs_scroll_bot'}, document.body);
    objects.scroll_bot.style.width = scrWidth*xScale+'px';

    objects.scroll_rgt = addElem('div', {id:'_fs_scroll_rgt'}, document.body);
    objects.scroll_rgt.style.height = scrHeight*yScale+'px';
  }

  function listener() {
    if (!pub.enabled) return;
    setTimeout(listener, 100);
    tagEditor();

    if (settings.singleMode) {
      if (singleDefSize || pub.defzoom >= pub.zoom) remove('hideAll');
      else append('hideAll');

    }

    if (objects.image != undefined && pub.isVideo && settings.singleMode && (!/\/full.webm/.test(objects.image.querySelector('[type="video/webm"]').src) || !singleFirstChange)) {
      objects.image.removeAttribute('src');
      objects.image.querySelector('[type="video/webm"]').src = JSON.parse(objects.icontainer.dataset.uris).webm;
      objects.image.querySelector('[type="video/mp4"]').src = JSON.parse(objects.icontainer.dataset.uris).mp4;
      rescale();
      singleFirstChange = true;
    }

    if (pub.scaled == 'false' || settings.singleMode) setMargin();

    if (objects.dcontainer != undefined) {
      if ((pub.scaled == 'true' || (settings.singleMode && pub.defzoom >= pub.zoom)) && pub.mouseY/window.innerHeight >= (popUps.down.classList.contains('active')?0.3:0.85) && !popUps.back.classList.contains('active')) popUps.down.classList.add('active');
      else popUps.down.classList.remove('active');
    }

    let s = '';
    if (document.getElementsByClassName('js-notification-ticker')[0] != undefined && parseInt(document.getElementsByClassName('js-notification-ticker')[0].innerHTML) > 0) s += ' '+parseInt(document.getElementsByClassName('js-notification-ticker')[0].dataset.notificationCount);
    if (parseInt(document.querySelector('a[href*="/conversations"] .fa-embedded__text').innerHTML) > 0) s += (s.length>0?'+':' ')+'M'+parseInt(document.querySelector('a[href*="/conversations"] .fa-embedded__text').innerHTML);

    if (s.length>0) {
      objects.mainButtonNotify.innerHTML = s;
      objects.mainButton.style.background = '#800';
    }
    else {
      objects.mainButtonNotify.innerHTML = '';
      objects.mainButton.style.background = '';
    }

    if (pub.scaled == 'true' || (settings.singleMode && pub.defzoom >= pub.zoom)) {
      if ((pub.mouseY/window.innerHeight > 0.15 && pub.mouseY/window.innerHeight < 0.85) &&
        !(popUps.down.classList.contains('active') || popUps.back.classList.contains('active')))  {
        pub.static++;
      }
      else {
        if (pub.static>0) {
          pub.static =0;
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

    if (pub.zoom<0.5) dt = 0.005*settings.scrollSpeed;
    else if (pub.zoom<1) dt = 0.01*settings.scrollSpeed;
    else if (pub.zoom<2.5) dt = 0.015*settings.scrollSpeed;
    else if (pub.zoom<5) dt = 0.025*settings.scrollSpeed;
    else dt = 0.05*settings.scrollSpeed;

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
    if (event != undefined) event.stopImmediatePropagation();
  }

  function singleEvent(event) {
    if (!state.enabled || !settings.singleMode) return;
    if (document.querySelector('#image_target.hidden') != null) return;
    if (event != undefined) event.stopPropagation();
    //dropExecution(event);

    singleDefSize = !singleDefSize;
    pub.scaled = ''+singleDefSize;
    if (pub.scaled != 'false') {
      /*if (pub.isVideo) */pub.zoom = pub.defzoom;
    }
    else {
      pub.zoom = 1;
      initalZoom();
    }
    objects.dcontainer.dataset.scaled = pub.scaled;
    if (pub.isVideo && !/full.webm/.test(objects.image.querySelector('[type="video/webm"]').src)) {
      objects.image.querySelector('[type="video/webm"]').src = JSON.parse(objects.icontainer.dataset.uris).webm;
      objects.image.querySelector('[type="video/mp4"]').src = JSON.parse(objects.icontainer.dataset.uris).mp4;
    }
    return false;
  }


  function advancedTagTools() {
    //
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
      let c2 = document.head.querySelector('link[rel=stylesheet][media=all]').href;
      return (c2.split('/')[5].startsWith('dark') || c2.split('/')[5].startsWith('red'));
    }
    catch(e) {
      return Boolean(document.querySelector('body[data-theme*="dark"]'));
    }
  }

  function prePreColor() {
    if (state.colors != undefined) {
      colors = JSON.parse(state.colors);
      pub.isDark = isDarkF();
      applyColor();
    }
  }

  function preEnableColor() {
    if (settings.colorAccent) {
      objects.colorAccent = addElem('div', {id:'_fs_colorAccent', className:'tag hidden', dataset:{tagCategory:settings.style}}, document.body);
      pub.isDark = isDarkF();

      if (settings.style != colors.value || pub.isDark != colors.isDark || state.colorApi == undefined || state.colorApi < currentColorApi) {
        state.colorApi = currentColorApi;
        write();
        remove('colorAccent');
        setTimeout(enableColor, 1);
      }
    }
  }

  function putDark() {
    if (document.body != undefined) {
      if (colors.isDark) document.body.classList.add('_fs_dark');
      else document.body.classList.remove('_fs_dark');
    }
    else setTimeout(putDark,10);
  }

  function applyColor() {
    if (document.getElementById('container') != undefined) cm_bg();
    let r = function(x) {
      styles.colorAccent = styles.colorAccent.replace(new RegExp(x,'g'), 'rgb('+colors[x][0]+','+colors[x][1]+','+colors[x][2]+')');
    };
    let rx = function(x) {
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

    let kek = function() {
      let xx = document.getElementsByClassName('theme-preview-trixie')[0];
      if (xx != undefined) {
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
    colors._fs_component = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 3, 35, colors.isDark);});
    colors._fs_2component = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 1.5, 5, colors.isDark);});
    colors._fs_icomponent = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 1, 0.9, !colors.isDark);});
    colors._fs_3component = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 2, 3, colors.isDark);});
    colors._fs_4component = c.substring(4, c.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 1.85, 10, colors.isDark);});
    colors._fs_ccomponent = colors._fs_color.substring(4, colors._fs_color.length - 1).split(',').map(function (v,i,a) {return transformColor(v, 1.4, 1.3, colors.isDark);});

    state.colors = JSON.stringify(colors);
    if (!nrw) {
      write();
    }
    applyColor();

  }

  function cm_bg() {
    if (settings.pony_mark != 'off') {
      let theme = 'light'
      let mark = settings.pony_mark;
      if (document.getElementById('_fs_pony_mark_setting') != undefined) mark = document.getElementById('_fs_pony_mark_setting').value;
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
      if (document.getElementById('_fs_color_setting') != undefined) ccolor = document.getElementById('_fs_color_setting').value;

      if (mark == 'auto') mark = ponymarks.defaults[ccolor];
      if (mark == 'random') {
        let x = parseInt(Math.random()*13);
        let i;
        for (i in ponymarks.bgs) {
          if (x == 0) break;
          x--;
        }
        mark = i;
      }

      document.getElementById('container').insertBefore(InfernoAddElem('div',{id:'_fs_pony_mark', style:{
        backgroundImage:'url('+ponymarks.bgs[mark]+')',
        filter:(
            ccolor=="none"?'grayscale(1) '+(theme=='light'?'brightness(300%)':'brightness(150%)'):
            'hue-rotate('+ponymarks.filter[theme][ccolor]+'deg)'+
            (theme=='light'?' invert(1) saturate(250%) brightness(95%)':'')+
            (ponymarks.fix_brightness[theme][ccolor]==undefined?'':' brightness('+ponymarks.fix_brightness[theme][ccolor]+'%)')
        )
      }}), document.getElementById('container').firstChild);
    }
    else if (document.getElementById('_fs_pony_mark_setting') != undefined) {
      document.getElementById('container').removeChild(document.getElementById('_fs_pony_mark_setting'));
    }
  }

  function preenable() {
    if (document.title.indexOf('This image has been deleted.') == 0) return;
    append('general');
    if (settings.extended) {
      append('base');
      append('ex');
    }
    if (!settings.new) append('keepVanila');
    if (settings.staticEnabled) append('hider');
  }

  function enable(notInital) {
    if (document.title.indexOf('This image has been deleted.') == 0) return;
    if (notInital) preenable();
    if (!started) init();

    pub.mouseX = window.innerWidth/2;
    pub.mouseY = window.innerHeight/2;
    if (state.hidden) pub.static = 100000;
    else pub.static = 0;

    popUps.back = addElem('div', {id:'_ydb_fs_backSide', className:'_fs_popup_back'}, document.body);
    popUps.coms = addElem('div', {id:'_ydb_fs_commPopup', className:'_fs_popup _fs_popup_big block__content'}, popUps.back);
    popUps.main = addElem('div', {id:'_ydb_fs_mainPopup', className:'_fs_popup _fs_popup_vbig block__content'}, popUps.back);
    popUps.down = addElem('div', {id:'_fs_down', className:'_fs_down'}, document.body);
    popUps.downBack = addElem('div', {id:'_fs_down_back', className:'_fs_down_back tag', dataset:{tagCategory:settings.style}}, popUps.down);
    popUps.downContainer = addElem('div', {id:'_fs_down_container', className:'_fs_down_container'}, popUps.down);
    objects.mainButton = InfernoAddElem('a', {id:'_fs_main', events:[{
      t:'click',
      f:function() {
        callPopup('main');
      }
    }]}, [
      InfernoAddElem('span', {}, [
        InfernoAddElem('i', {className:'fa', innerHTML:'\uf0c9'}, []),
        objects.mainButtonNotify = InfernoAddElem('span', {}, [])
      ])
    ]);

    document.querySelector('.image-metabar').childNodes[1].insertBefore(objects.mainButton,document.querySelector('.interaction--fave'));
    //document.querySelectorAll('#content>div')[3].appendChild(document.getElementById('image_options_area'));    console.log(document.getElementsByTagName('form'), document.getElementById('js-comment-form'));
    if (document.getElementById('js-comment-form') != undefined) popUps.coms.appendChild(document.getElementById('js-comment-form'));
    popUps.coms.appendChild(document.getElementById('comments'));
    //popUps.downContainer.appendChild(document.querySelector('#content>.block:first-child').cloneNode(true));
    //if (popUps.downContainer.childNodes[0].classList.contains('center--layout')) popUps.downContainer.childNodes[0].style.textAlign='center';
    //popUps.downContainer.childNodes[0].classList.add('layout--narrow');
    if (!settings.new) {
      document.querySelector('.block__header--user-credit > div').classList.add('block__content');
      popUps.downContainer.appendChild(document.querySelector('.block__header--user-credit > div'));
    }
    else {
      document.querySelector('#content .block.block__header').appendChild(InfernoAddElem('div',{id:'_fs_top_bg',style:{backgroundColor:getComputedStyle(document.getElementById('container')).backgroundColor}},[]));
    }
    popUps.downContainer.appendChild(document.querySelectorAll('#content>div')[2]);
    //popUps.downContainer.appendChild(popUps.coms.querySelector('#image_options_area'));

    document.querySelector('a[title="'+settings.button+'"]').classList.add('ydb_top_right_link');

    popUps.main.appendChild(document.querySelector('header'));
    popUps.main.appendChild(document.querySelector('nav.header.header--secondary'));
    ChildsAddElem('div', {className:'block__header'}, popUps.main, [
      InfernoAddElem('span',{innerHTML:'Image Tools:',style:{marginLeft:'1em'}}, []),
      InfernoAddElem('a',{className:'js-up', events:[{t:'click',f:function() {
        document.querySelector('.image-metabar .js-up').click();
      }}]}, [
        InfernoAddElem('i',{className:'fa fa-chevron-up'},[]),
        InfernoAddElem('span',{innerHTML:' Find'},[])
      ]),
      InfernoAddElem('a',{className:'js-random', events:[{t:'click',f:function() {
        document.querySelector('.image-metabar .js-rand').click();
      }}]}, [
        InfernoAddElem('i',{className:'fa fa-random'},[]),
        InfernoAddElem('span',{innerHTML:' Random'},[])
      ]),
      document.querySelectorAll('#content>.block:first-child>* [class*="js-notification"')[0].cloneNode(true),
      document.querySelectorAll('#content>.block:first-child>* [class*="js-notification"')[1].cloneNode(true),
      document.querySelector('#content>.block:first-child>* .dropdown').cloneNode(true),
      document.querySelector('#content>.block:first-child>* [title="Related Images"').cloneNode(true),
      document.querySelector('#content>.block:first-child>*>div:nth-child(4)').cloneNode(true)
    ]);
    document.querySelector('#_ydb_fs_mainPopup>.block__header>div:last-child').style.display = 'inline';
    //document.querySelector('#_ydb_fs_mainPopup>.block__header>div>.image-size').style.display = 'none';
    popUps.main.appendChild(document.querySelector('footer'));

    objects.image = document.getElementById('image-display');
    objects.de = document.documentElement;
    objects.icontainer = document.getElementsByClassName('image-show-container')[0];
    objects.dcontainer = document.getElementById('image_target');
    objects.commButton = document.getElementsByClassName('interaction--comments')[0];
    if (settings.commentLink) objects.commButton.href = 'javascript://';

    objects.commButton.addEventListener('click',showComms);
    popUps.back.addEventListener('click',hidePopups);
    document.body.addEventListener('mousemove',mouseListener);

    if (objects.image != undefined) loadedImgFetch();

    document.body.classList.add('_fs');

    pub.enabled = true;
    state.enabled = true;

    write();
    listener();

    //to avoid bugs on unloaded images
    if (objects.dcontainer != undefined) {
      objects.dcontainer.addEventListener("DOMNodeInserted",loadedImgFetch);
      //objects.dcontainer.addEventListener("click",disgustingLoadedImgFetch);
      objects.dcontainer.addEventListener("wheel", wheelListener);
      advancedTagTools();
      pub.isVideo = JSON.parse(objects.icontainer.dataset.uris).full.split('.').pop() == 'webm';
      pub.gif = JSON.parse(objects.icontainer.dataset.uris).full.split('.').pop() == 'gif';
      if ((pub.gif || pub.isVideo) && settings.singleMode) {
        let x = JSON.parse(objects.icontainer.dataset.uris);
        for (let i in x) {
          if (pub.gif) x[i] = x.full;
        }
        objects.icontainer.dataset.uris = JSON.stringify(x);
        objects.dcontainer.dataset.uris = JSON.stringify(x);
        // я устал с этим скриптом бороться :(
      }
    }
    else {
      popUps.down.classList.add('active');
    }

    window.addEventListener('resize', resize);

    if (location.hash.indexOf('#comment') == 0) showComms();
  }

  function disable() {
    remove('general');
    remove('base');
    remove('ex');
    remove('hider');
    remove('keepVanila');
    unscale();

    objects.dcontainer.removeEventListener("DOMNodeInserted",loadedImgFetch);
    //objects.dcontainer.removeEventListener("click",disgustingLoadedImgFetch);
    objects.commButton.removeEventListener('click',showComms);
    objects.commButton.href = '#comments';
    popUps.back.removeEventListener('click',hidePopups);
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
    if (document.getElementById('js-comment-form') != undefined) document.querySelector('#content>.layout--narrow').appendChild(document.getElementById('js-comment-form'));
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
    window.removeEventListener('resize', resize);

    write();
  }

  register();
  append('noneTag');
  if (document.title == "Update Deployment - Derpibooru - My Little Pony: Friendship is Magic Imageboard") return;
  document.addEventListener('DOMContentLoaded', function() {
    cm_bg();
    if (document.getElementById('user_theme') != undefined) document.getElementById('user_theme').addEventListener('change',function() {
      remove('colorAccent');
      setTimeout(function() {
        if (isDarkF()) objects.colorAccent.classList.add('explicit_dark');
        else objects.colorAccent.classList.remove('explicit_dark');
      }, 200);
      setTimeout(function() {enableColor(true);},777);
    });
    setTimeout(function() {if (document.getElementById('_fs_color_setting') != undefined) document.getElementById('_fs_color_setting').addEventListener('change',function(e) {
      remove('colorAccent');
      objects.colorAccent.dataset.tagCategory = e.target.value;
      enableColor(true);
    });},1000);
    setTimeout(function() {if (document.getElementById('_fs_pony_mark_setting') != undefined) document.getElementById('_fs_pony_mark_setting').addEventListener('change',function(e) {
      cm_bg();
    });},1000);
  });

  if (settings.colorAccent) prePreColor();
  if ((parseInt(location.pathname.slice(1))>=0 && location.pathname.split('/')[2] == undefined) || (location.pathname.split('/')[1] == 'images' && parseInt(location.pathname.split('/')[2])>=0 && location.pathname.split('/')[3] == undefined)) {
    if (state.enabled) {
      preenable();
      if (document.readyState !== 'loading') {
        enable();
        preEnableColor();
      }
      else document.addEventListener('DOMContentLoaded', function() {
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
