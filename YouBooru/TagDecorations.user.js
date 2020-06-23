// ==UserScript==
// @name         Tag decorations
// @version      1.0
// @description  some silly tag decorations
// @author       stsyn
// @include      /http[s]*:\/\/(www\.|philomena\.|)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|philomena\.|)(trixie|derpi)booru.org\/adverts\/*/
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/TagDecorations.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/TagDecorations.user.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/tagDecorationsStaticData.js
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  let style = `
pattern0 {
    color:themeText !important;
    text-shadow:0 0 2px themeAnti, 0 0 2px themeAnti, 0 0 2px themeAnti;
    border-color:themeMd;
}

pattern1 {
    color:themeText;
}

pattern2 {
    color:themeText !important;
    filter: brightness(85%);
}

pattern3 {
    background: none;
}


/*******************************
  Orientation and other tags
*******************************/

.tag[data-tag-name="gay"], .tag[data-tag-name="gay"] .tag__dropdown__link {
    background: linear-gradient(90deg, red 16%, orange 16%, orange 33%, yellow 33%, yellow 50%, green 50%, green 67%, blue 67%, blue 83%, violet 83%);
}
.tag[data-tag-name="intersex"], .tag[data-tag-name="intersex"] .tag__dropdown__link {
    background: linear-gradient(90deg, pink 16%, white 16%, white 33%, cyan 33%, cyan 50%, pink 50%, pink 67%, white 67%, white 83%, pink 83%);
}

.tag[data-tag-name="straight"], .tag[data-tag-name="straight"] .tag__dropdown__link {
    background: linear-gradient(90deg, black 20%, white 20%, white 40%, black 40%, black 60%, white 60%, white 80%, black 80%);
}
.tag[data-tag-name="lesbian"], .tag[data-tag-name="lesbian"] .tag__dropdown__link {
    background: linear-gradient(90deg, red 20%, orange 20%, orange 40%, white 40%, white 60%, pink 60%, pink 80%, violet 80%);
}
.tag[data-tag-name="transgender"], .tag[data-tag-name="transgender"] .tag__dropdown__link {
    background: linear-gradient(90deg, cyan 20%, pink 20%, pink 40%, white 40%, white 60%, pink 60%, pink 80%, cyan 80%);
}

.tag[data-tag-name="asexual"], .tag[data-tag-name="asexual"] .tag__dropdown__link {
    background: linear-gradient(90deg, black 25%, gray 25%, gray 50%, white 50%, white 75%, violet 75%);
}

.tag[data-tag-name="bisexual"], .tag[data-tag-name="bisexual"] .tag__dropdown__link {
    background: linear-gradient(90deg, red 43%, violet 43%, violet 57%, blue 57%);
}

.tag[data-tag-name="grayscale"], .tag[data-tag-name="grayscale"] .tag__dropdown__link ,
.tag[data-tag-name="neo noir"], .tag[data-tag-name="neo noir"] .tag__dropdown__link {
    background: gray;
}

.tag[data-tag-name="neo noir"], .tag[data-tag-name="neo noir"] .tag__dropdown__link {
    border-color: white;
    color: white;
}

.tag[data-tag-name="derpy hooves"] {
    z-index: 3;
    transform: rotate(180deg);
}

.tag[data-tag-name="comic sans"] {
   font-family:'Comic Sans MS';
   line-height: 1.1em;
   font-size: 1.2em;
}

.tag[data-tag-name="impact font"] {
   font-family:Impact;
   line-height: 1.2em;
   font-size: 1.15em;
   font-weight: 100;
}

.tag[data-tag-name="wrong aspect ratio"] {
    zoom: 0.75;
    transform: scaleY(1.33);
    z-index: 2;
}

.tag[data-tag-name="apple bloom"] .tag__name::before {
    content: " ";
    background-size: contain;
    background-image: url("https://derpicdn.net/img/2018/3/13/1679280/thumb_small.png");
    background-position: bottom right;
    background-repeat: no-repeat;
    width: 50px;
    height: 45px;
    position: absolute;
    top: -32px;
    transform: rotate(-45deg);
    left: -29px;
    z-index: 1;
    pointer-events: none;
}

.tag[data-tag-name="nightmare moon"] {
    text-shadow:0 0 2px #088, 0 0 2px #088;
}
.tag[data-tag-name="nightmare rarity"] {
    text-shadow:0 0 2px #7FC5E1;
}
.tag[data-tag-name="nightmare moon"] .dropdown__content::after {
    opacity: 0.8;
}
.tag[data-tag-name="sweetie drops"] {
    text-shadow:0 0 2px #fff, 0 0 2px #fff;
}
.tag[data-tag-name="tempest shadow"]>span.tag__count::before, .tag[data-tag-name="fizzlepop berrytwist"]>span.tag__count::before {
    content: " ";
    position: absolute;
    top: -2px;
    left: -9px;
    z-index: -1;
    height: 20px;
    width: 90px;
    pointer-events: none;
    background: linear-gradient(25deg, transparent 49%, fsMane 49%, fsMane 51%, transparent 51%)
}

.tag[data-tag-name="queen chrysalis"].dropdown::before, .tag[data-tag-name="queen chrysalis"] .dropdown__content::before {
    background-size: 220px
}

.tag[data-tag-name="king sombra"] {
    text-shadow:0 0 2px #0f0, 0 0 2px #0f0, 1px -1px 4px #70F, 1px -1px 4px #70F;
}

.tag[data-tag-name="nightmare star"] .dropdown__content::after {
    filter: saturate(13);
}

.tag[data-tag-name="daybreaker"] {
    text-shadow:0 0 2px #600E16, 0 0 2px #600E16;
}
.tag[data-tag-name="daybreaker"] .dropdown__content::after {
    filter: saturate(3);
}
.tag[data-tag-name="princess flurry heart"] .dropdown__content, .tag[data-tag-name="princess flurry heart"].dropdown {
    background-size: cover;
}
.tag[data-tag-name="oc:anon"] .dropdown__content::after {content: "?";
    position: absolute;
    color: #00000080;
    bottom: 10px;
    right: 10px;
    width: auto;
    height: auto;
    font-size: 50px;
    line-height: 50px;
    opacity: 1;
}

.tag[data-tag-name="oc:fluffle puff"], .tag[data-tag-name="oc:fluffle puff"] .tag__count {
    z-index: 5;
    background: #ffe5ed;
}
.tag[data-tag-name="oc:fluffle puff"] .dropdown__content::before {
    content: " ";
    height: 230px;
    width: 220px;
    position: absolute;
    background: url(https://derpicdn.net/img/2016/8/2/1215732/medium.png) no-repeat;
    background-size: contain;
    z-index: -1;
    left: -20px;
    top: -55px;
    pointer-events: none;
    transform: scaleX(-1);
}
.tag[data-tag-name="oc:fluffle puff"] .dropdown__content {
    z-index: -1;
    overflow: visible;
}
.tag[data-tag-name="oc:fluffle puff"] .tag__dropdown__link {
    text-shadow: 0 0 4px #ffe5ed, 0 0 4px #ffe5ed, 0 0 4px #ffe5ed;
}

.tag[data-tag-name="coco pommel"] .dropdown__content::after {
    margin-bottom: 1em;
}

.tag[data-tag-name="surprise"] .dropdown__content::after {
    filter: sepia(100%) hue-rotate(260deg) brightness(0.5);
}
`;

  // 50% black/white for eyes, 40% black and 33% of white
  let commonColors = {
    lightblue: ['#98d0fc', '#325888', '#98d0fc'], // day
    darkblue:  ['#6a8bd2', '#031230', '#6a8bd2'], // day

    spBg: ['#e6c9b5a0', '#362118a0', '#e6c9b5a0'],
    spTxt:     ['#8b552f', '#b16b50', '#8b552f'],

    red:       ['#e47c73', '#811d13', '#e47c73'],
    orange:    ['#f5c183', '#824c1c', '#f5c183'],
    yellow:    ['#fef08f', '#897c2a', '#fef08f'],
    green:     ['#8ec47b', '#285818', '#8ec47b'],
    blue:      ['#6a8bd2', '#062562', '#6a8bd2'],
    mint:      ['#66e1ca', '#00896f', '#66e1ca'],
    violet:    ['#d981eb', '#6a1b7a', '#d981eb'],

    cyan:      ['#98e1fc', '#327088', '#98e1fc'],
    pink:      ['#f8c9d3', '#855d65', '#f8c9d3'],
    magenta:   ['#e089b9', '#620a3b', '#e089b9'],

    white:     ['#fff',    '#999999', '#fff'   ],
    darkgray:  ['#a3a3a3', '#343434', '#a3a3a3'],
    lightgray: ['#dfdfdf', '#7a7a7a', '#dfdfdf'],
    gray:      ['#b0b0b0', '#454545', '#b0b0b0'],
    black:     ['#545454', '#000',    '#545454'],

    tsCoat:    ['#dcbee2', '#78667d', '#dcbee2'],
    tsMane1:   ['#76779d', '#1f2244', '#76779d'],
    tsMane2:   ['#996ab2', '#411854', '#996ab2'],
    tsMane3:   ['#f470b6', '#8e2e56', '#f470b6'],
    tsEye:     ['#a994bc', '#29143b', '#a994bc'],

    bsCoat:    ['#e8bbf6', '#845d91', '#e8bbf6'],

    mpMane1:   ['#97a6a5', '#3c4949', '#97a6a5'],
    mpMane2:   ['#adc0b5', '#4f6157', '#adc0b5'],

    fsCoat:    ['#fdf8c9', '#979369', '#fdf8c9'],
    fsMane:    ['#f0b7d8', '#8c5a76', '#f0b7d8'],
    fsEye:     ['#7fbfbc', '#00403d', '#7fbfbc'],

    txEye:     ['#917aa0', '#2c1b38', '#917aa0'],
    txMane1:   ['#cfeafa', '#6e8695', '#cfeafa'],
    txMane2:   ['#e4f3fc', '#818e96', '#e4f3fc'],

    ttCoat:    ['#cbc1a7', '#6a614a', '#cbc1a7'],
    ttMane:    ['#8a8474', '#312b1c', '#8a8474'],

    cpMane1:   ['#b9eaed', '#5d9396', '#b9eaed'],
    cpMane2:   ['#def9f7', '#86a4a2', '#def9f7'],
    cpCoat:    ['#faf7e8', '#a5a291', '#faf7e8'],

    clrMane1:  ['#7f7b90', '#1c172e', '#7f7b90'],
    clrMane2:  ['#8a879f', '#28243f', '#8a879f'],
    clrMane3:  ['#81c3cc', '#1e6872', '#81c3cc'],

    sfCoat:    ['#f6f2af', '#a29d48', '#f6f2af'],
    sfMane1:   ['#f8d8a1', '#a48126', '#f8d8a1'],
    sfMane2:   ['#ecb49c', '#974f03', '#ecb49c'],

    lyEye:     ['#ffc98f', '#80460c', '#ffc98f'],
    lyCoat:    ['#b7ffe8', '#589985', '#b7ffe8'],
    lyMane:    ['#c8f4ee', '#678f8a', '#c8f4ee'],

    tpsMane1:  ['#a7547c', '#4b0024', '#a7547c'],
    tpsMane2:  ['#b0547e', '#520025', '#b0547e'],
    tpsCoat:   ['#8c6985', '#32132c', '#8c6985'],

    dhCoat:    ['#dcdeeb', '#7a7c87', '#dcdeeb'],

    mpMane:    ['#c2b9d2', '#776991', '#c2b9d2'],
    mpEye:     ['#b2cdc5', '#438073', '#b2cdc5'],

    bsMane1:   ['#fc8293', '#a71f32', '#fc8293'],
    bsMane2:   ['#fda2b2', '#a84355', '#fda2b2'],
    bsCoat:    ['#e9bf86', '#926324', '#e9bf86'],
    bsEye:     ['#bcdf93', '#3d6014', '#bcdf93'],

    chrMane1:  ['#fae5ef', '#c5aab8', '#fae5ef'],
    chrMane2:  ['#f8d1e0', '#c390a5', '#f8d1e0'],

    s1LunaCoat:['#979ad1', '#3c3f70', '#979ad1'],
    s1LunaMane:['#a1c3f8', '#456393', '#a1c3f8'],

    themeText: ['#000',    '#eee',    '#000'   ],
    themeAnti: ['#fff',    '#000',    '#fff'   ],
    themeMd:   ['#888',    '#888',    '#888'   ]
  }

  const themes = ['default', 'dark', 'red'];

  const tagsWithPatchedText = ['gay', 'intersex', 'straight', 'lesbian', 'transgender', 'asexual', 'bisexual', 'grayscale'];

  const commonPatterns = [
    '.tag[data-tag-name="%name%"], .tag[data-tag-name="%name%"] a',
    '.tag[data-tag-name="%name%"] > span, .tag[data-tag-name="%name%"] > a',
    'body .tag[data-tag-name="%name%"] a:hover',
    'body .tag[data-tag-name="%name%"] .tag__count'
  ];

  const ponies = {
    'crystal pony': {
      CMimages: '',
      Mane: `background-image: url(${svgs.crystal}); background-size: cover; filter: hue-rotate(90deg)`,
      background: 'spBg',
      text: 'spTxt'
    },
    'nightmare star': {
      CMimages: 'https://derpicdn.net/img/2017/7/10/1483218/thumb_small.png',
      CMmaxWidth: 70,
      cmFix: true,
      transparentCM: 1,
      Mane: `background-image: url(${svgs.ns_mane_l})`,
      background: '#fff',
      text: '#B02D8A',
      xText: '#B02D8A',
      border: '#fff'
    },
    'daybreaker': {
      CMimages: 'https://derpicdn.net/img/2017/7/10/1483218/thumb_small.png',
      CMmaxWidth: 70,
      cmFix: true,
      transparentCM: 1,
      Mane: `background-image: url(${svgs.db_mane_l})`,
      background: '#fff',
      text: '#000',
      xText: '#000',
      border: '#fff'
    },
    'princess celestia': {
      CMimages: 'https://derpicdn.net/img/2017/7/10/1483218/thumb_small.png',
      CMmaxWidth: 70,
      cmFix: true,
      transparentCM: 1,
      Mane: `background-image: url(${svgs.tia_mane_l})`,
      background: '#fff',
      text: '#6a1b7a',
      xText: '#6a1b7a',
      border: '#fff'
    },
    'princess molestia': {
      CMimages: 'https://derpicdn.net/img/2017/7/10/1483218/thumb_small.png',
      CMmaxWidth: 70,
      Mane: `background-image: url(${svgs.molly_mane_l})`,
      transparentCM: 1,
      cmFix: true,
      background: '#fff',
      text: '#6a1b7a',
      xText: '#6a1b7a',
      border: '#fff'
    },
    'princess luna': {
      CMimages: 'https://camo.derpicdn.net/a81e34b0861cb2abdbaa18efe7b6005bb4b267fa?url=https%3A%2F%2Fi.imgur.com%2Fz7y6kaY.png',
      Mane: `background-image: url(${svgs.luna_mane_l})`,
      CMmaxWidth: 80,
      transparentCM: 1,
      cmFix: true,
      background:'#031230',
      text: '#98e1fc',
      xText: '#98e1fc',
      border: 'a_cyan'
    },
    's1 luna': {
      CMimages: 'https://camo.derpicdn.net/a81e34b0861cb2abdbaa18efe7b6005bb4b267fa?url=https%3A%2F%2Fi.imgur.com%2Fz7y6kaY.png',
      CMmaxWidth: 60,
      Mane: `background: linear-gradient(90deg, s1LunaMane 30%, s1LunaCoat 30%)`,
      text: '#98e1fc',
      border: '#98e1fc'
    },
    'nightmare moon': {
      CMimages: 'https://camo.derpicdn.net/bf00382d14ad6a6794392193e7fbb268c77f9398?url=https%3A%2F%2Fi.imgur.com%2FICT1O6r.png',
      CMmaxWidth: 80,
      Mane: `background-image: url(${svgs.luna_mane_l})`,
      transparentCM: 1,
      cmFix: true,
      background:'#000',
      text: '#0ff',
      xText: '#0ff',
      border: '#0ff'
    },
    'princess cadance': {
      CMimages: 'https://derpicdn.net/img/2016/12/31/1328963/thumb_small.png',
      CMmaxWidth: 100,
      Mane: 'background: linear-gradient(90deg, fsCoat 13%, tsMane3 13%, tsMane3 26%, tsMane2 26%, tsMane2 40%, pink 40%)',
      text: 'a_magenta',
      border: 'a_magenta'
    },
    'queen chrysalis': {
      CMimages: '',
      Mane: `background-image: url(${svgs.qc_mane})`,
      background:'none',
      text: '#96E651',
      xText: '#96E651',
      border: '#96E651'
    },
    'king sombra': {
      CMimages: '',
      Mane: `background-image: url(${svgs.sombra_mane_l})`,
      background:'#5C5C5C',
      text: '#E81000',
      xText: '#E81000',
      border: '#00FF00'
    },
    'nightmare rarity': {
      CMimages: 'https://derpicdn.net/img/2015/12/14/1044430/thumb_small.png',
      transparentCM: 1,
      cmFix: true,
      CMmaxWidth: 60,
      Mane: `background-image: url(${svgs.nmr_mane_l})`,
      background:'#211B33',
      text: '#7EC5E1',
      xText: '#7EC5E1',
      border: '#7EC5E1'
    },
    'princess flurry heart': {
      CMimages: '',
      Mane: 'background-image:linear-gradient(90deg, tsCoat 17%, cyan 17%, cyan 23%, tsCoat 23%, tsCoat 40%, pink 40%); opacity: 0.75',
      background: `url(${svgs.crystal})`,
      text: 'a_cyan',
      border: 'a_cyan',
    },

    'twilight sparkle': {
      CMimages: 'https://derpicdn.net/img/view/2014/6/17/655202.svg',
      CMmaxWidth: 55,
      Mane: 'background: linear-gradient(90deg, tsMane1 15%, tsMane2 15%, tsMane2 25%, tsMane3 25%, tsMane3 30%, tsMane1 30%, tsMane1 40%, tsCoat 40%)',
      text: 'a_tsEye',
      border: 'a_tsEye'
    },
    'twilight sparkle (alicorn)': {
      CMimages: 'https://derpicdn.net/img/view/2014/6/17/655202.svg',
      CMmaxWidth: 55,
      Mane: 'background: linear-gradient(90deg, tsMane1 15%, tsMane2 15%, tsMane2 25%, tsMane3 25%, tsMane3 30%, tsMane1 30%, tsMane1 40%, tsCoat 40%)',
      text: 'a_tsEye',
      border: 'a_tsEye'
    },
    'rainbow dash': {
      CMimages: 'https://derpicdn.net/img/view/2016/6/17/1180545.svg',
      CMmaxWidth: 37,
      Mane: 'background: linear-gradient(90deg, red 7%, orange 7%, orange 14%, yellow 14%, yellow 21%, green 21%, green 28%, blue 28%, blue 35%, violet 35%, violet 42%, cyan 42%)',
      text: 'a_magenta',
      border: 'a_blue'
    },
    'pinkie pie': {
      CMimages: 'https://derpicdn.net/img/view/2016/6/17/1180542.svg',
      CMmaxWidth: 45,
      Mane: 'background: linear-gradient(90deg, magenta 40%, pink 40%)',
      text: 'a_cyan',
      border: 'a_magenta'
    },
    'surprise': {
      CMimages: 'https://derpicdn.net/img/view/2016/6/17/1180542.svg',
      CMmaxWidth: 45,
      Mane: 'background: linear-gradient(90deg, yellow 40%, white 40%)',
      text: 'a_pink',
      border: 'a_pink'
    },
    'fluttershy': {
      CMimages: 'https://derpicdn.net/img/view/2016/6/17/1180541.svg',
      CMmaxWidth: 68,
      Mane: 'background: linear-gradient(90deg, fsMane 40%, fsCoat 40%)',
      text: 'a_fsEye',
      border: 'a_fsEye'
    },
    'rarity': {
      CMimages: 'https://derpicdn.net/img/view/2014/12/22/790610.svg',
      CMmaxWidth: 35,
      Mane: 'background: linear-gradient(90deg, tsMane1 40%, white 40%)',
      text: 'a_blue',
      border: 'a_blue'
    },
    'applejack': {
      CMimages: 'https://derpicdn.net/img/view/2016/6/17/1180534.svg',
      CMmaxWidth: 68,
      Mane: 'background: linear-gradient(90deg, yellow 40%, orange 40%)',
      text: 'a_green',
      border: 'a_green'
    },
    'spike': {
      CMimages: '',
      Mane: 'background: linear-gradient(90deg, green 30%, violet 30%, violet 90%, green 90%)',
      text: 'a_green',
      border: 'green'
    },

    'trixie': {
      CMimages: 'https://derpicdn.net/img/2016/7/12/1199154/thumb_small.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, txMane1 13%, txMane2 13%, txMane2 26%, txMane1 26%, txMane1 40%, lightblue 40%)',
      text: 'txEye',
      border: 'txEye'
    },
    'sunset shimmer': {
      CMimages: 'https://derpicdn.net/img/2014/1/1/512177/thumb_small.png',
      CMmaxWidth: 65,
      Mane: 'background: linear-gradient(90deg, red 13%, yellow 13%, yellow 26%, red 26%, red 40%, fsCoat 40%)',
      text: 'a_fsEye',
      border: 'a_fsEye'
    },
    'starlight glimmer': {
      CMimages: 'https://derpicdn.net/img/2017/5/2/1427119/thumb_small.png',
      CMmaxWidth: 50,
      Mane: 'background: linear-gradient(90deg, tsMane2 17.5%, fsEye 17.5%, fsEye 22.5%, tsMane2 22.5%, tsMane2 40%, tsCoat 40%)',
      text: 'a_blue',
      border: 'a_blue'
    },
    'tempest shadow': {
      CMimages: '',
      Mane: 'background: linear-gradient(90deg, tpsMane1 20%, tpsMane2 20%, tpsMane2 40%, tpsCoat 40%)',
      text: 'a_fsEye',
      border: 'a_fsEye'
    },
    'fizzlepop berrytwist': {
      CMimages: 'https://derpicdn.net/img/2019/9/1/2133220/thumb_small.png',
      CMmaxWidth: 65,
      Mane: 'background: linear-gradient(90deg, tpsMane1 20%, tpsMane2 20%, tpsMane2 40%, tpsCoat 40%)',
      text: 'a_fsEye',
      border: 'a_fsEye'
    },

    'sonata dusk': {
      CMimages: 'https://derpicdn.net/img/2018/8/8/1801146/thumb_small.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, tsMane1 10%, lightblue 10%, lightblue 15%, tsMane1 15%, tsMane1 25%, lightblue 25%, lightblue 30%, tsMane1 30%, tsMane1 40%, cyan 40%)',
      text: 'a_magenta',
      border: 'a_magenta'
    },
    'adagio dazzle': {
      CMimages: 'https://camo.derpicdn.net/5fba3886a03b22c1b887232d7f67df11872be392?url=https%3A%2F%2Fi.imgur.com%2FTi3GVjc.png',
      CMmaxWidth: 55,
      Mane: 'background: linear-gradient(90deg, sfMane1 17.5%, sfCoat 17.5%, sfCoat 22.5%, sfMane1 22.5%, sfMane1 40%, fsCoat 40%)',
      text: 'magenta',
      border: 'magenta'
    },
    'aria blaze': {
      CMimages: 'https://camo.derpicdn.net/f4b2c76f0c82ddbe0b64add4dd79b1d6f0bb6ae9?url=https%3A%2F%2Fi.imgur.com%2Fn5dRLJ4.png',
      CMmaxWidth: 52,
      Mane: 'background: linear-gradient(90deg, tsMane2 17.5%, fsEye 17.5%, fsEye 22.5%, tsMane2 22.5%, tsMane2 40%, tsCoat 40%)',
      text: 'a_magenta',
      border: 'a_magenta'
    },

    'derpy hooves': {
      CMimages: 'https://derpicdn.net/img/2013/6/8/343712/thumb_small.png',
      CMmaxWidth: 62,
      Mane: 'background: linear-gradient(90deg, fsCoat 40%, dhCoat 40%)',
      text: 'a_orange',
      border: 'a_orange'
    },
    'dj pon-3': {
      CMimages: 'https://derpicdn.net/img/2017/6/18/1464665/thumb_small.png',
      CMmaxWidth: 72,
      Mane: 'background: linear-gradient(90deg, blue 13%, cyan 13%, cyan 26%, blue 26%, blue 40%, white 40%)',
      text: '#f00',
      border: '#f00'
    },
    'vinyl scratch': {
      CMimages: 'https://derpicdn.net/img/2017/6/18/1464665/thumb_small.png',
      CMmaxWidth: 72,
      Mane: 'background: linear-gradient(90deg, blue 13%, cyan 13%, cyan 26%, blue 26%, blue 40%, white 40%)',
      text: 'a_magenta',
      border: 'a_magenta'
    },
    'lyra heartstrings': {
      CMimages: 'https://derpicdn.net/img/2019/6/28/2077057/thumb_small.png',
      CMmaxWidth: 50,
      Mane: 'background: linear-gradient(90deg, lyMane 20%, white 20%, white 40%, lyCoat 40%)',
      text: 'a_lyEye',
      border: 'a_lyEye'
    },
    'shining armor': {
      CMimages: 'https://derpicdn.net/img/2013/6/8/343642/thumb_small.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, tsMane1 10%, lightblue 10%, lightblue 15%, tsMane1 15%, tsMane1 25%, lightblue 25%, lightblue 30%, tsMane1 30%, tsMane1 40%, white 40%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'bon bon': {
      CMimages: 'https://derpicdn.net/img/2018/1/25/1640813/thumb_small.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, fsMane 20%, tsMane1 20%, tsMane1 40%, fsCoat 40%)',
      text: 'a_fsEye',
      border: 'a_fsEye'
    },
    'sweetie drops': {
      CMimages: 'https://derpicdn.net/img/2018/1/25/1640813/thumb_small.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, fsMane 20%, tsMane1 20%, tsMane1 40%, fsCoat 40%)',
      text: '#000',
      xText: '#000',
      border: 'a_fsEye'
    },
    'soarin\'': {
      CMimages: 'https://derpicdn.net/img/2014/1/21/530205/thumb_small.png',
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, blue 40%, white 40%)',
      text: 'a_green',
      border: 'a_green'
    },
    'big macintosh': {
      CMimages: 'https://camo.derpicdn.net/3dffa69d4e94e2bc8e0153f3dd949eb58c01133d?url=https%3A%2F%2Fi.imgur.com%2FxC8mPT0.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, orange 40%, red 40%)',
      text: 'a_green',
      border: 'a_green'
    },
    'octavia melody': {
      CMimages: 'https://derpicdn.net/img/2013/2/20/249927/thumb_small.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, darkgray 40%, gray 40%)',
      text: 'a_violet',
      border: 'a_violet'
    },
    'spitfire': {
      CMimages: 'https://derpicdn.net/img/2012/12/15/183403/thumb_small.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, sfMane2 20%, sfMane1 20%, sfMane1 40%, sfCoat 40%)',
      text: '#000',
      border: '#000'
    },
    'flash sentry': {
      CMimages: 'https://derpicdn.net/img/2016/3/5/1102350/thumb_small.png',
      CMmaxWidth: 62,
      Mane: 'background: linear-gradient(90deg, blue 20%, lightblue 20%, lightblue 40%, sfMane1 40%)',
      text: 'a_lightblue',
      border: 'a_lightblue'
    },
    'cheerilee': {
      CMimages: 'https://derpicdn.net/img/2016/7/20/1205215/thumb_small.png',
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, chrMane2 13%, chrMane1 13%, chrMane1 26%, chrMane2 26%, chrMane2 40%, magenta 40%)',
      text: 'a_green',
      border: 'a_green'
    },
    'zecora': {
      CMimages: 'https://derpicdn.net/img/2020/3/6/2291323/thumb.png',
      CMmaxWidth: 70,
      transparentCM: 1,
      Mane: 'background: linear-gradient(90deg, gray 10%, white 10%, white 20%, gray 20%, gray 30%, white 30%, white 40%, lightgray 40%, lightgray 60%, gray 60%, gray 70%, lightgray 70%, lightgray 80%, gray 80%, gray 90%, lightgray 90%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'time turner': {
      CMimages: 'https://derpicdn.net/img/2017/6/19/1466173/thumb_small.png',
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, ttMane 40%, ttCoat 40%)',
      text: 'a_blue',
      border: 'a_blue'
    },
    'doctor whooves': {
      CMimages: 'https://derpicdn.net/img/2017/6/19/1466173/thumb_small.png',
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, ttMane 40%, ttCoat 40%)',
      text: 'a_blue',
      border: 'a_blue'
    },
    'minuette': {
      CMimages: 'https://derpicdn.net/img/2017/6/19/1466173/thumb_small.png',
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, lightblue 20%, blue 20%, blue 40%, cyan 40%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'berry punch': {
      CMimages: 'https://derpicdn.net/img/2013/12/14/496918/thumb_small.png',
      CMmaxWidth: 70,
      transparentCM: 0.8,
      Mane: 'background: linear-gradient(90deg, tsMane3 40%, bsCoat 40%)',
      text: 'a_magenta',
      border: 'a_magenta'
    },
    'berryshine': {
      CMimages: 'https://derpicdn.net/img/2013/12/14/496918/thumb_small.png',
      CMmaxWidth: 70,
      transparentCM: 0.8,
      Mane: 'background: linear-gradient(90deg, tsMane3 40%, bsCoat 40%)',
      text: 'a_magenta',
      border: 'a_magenta'
    },
    'braeburn': {
      CMimages: 'https://derpicdn.net/img/2016/1/15/1067107/thumb_small.png',
      CMmaxWidth: 62,
      Mane: 'background: linear-gradient(90deg, sfCoat 20%, sfMane1 20%, sfMane1 40%, sfCoat 40%)',
      text: 'green',
      border: 'green'
    },
    'daring do': {
      CMimages: 'https://derpicdn.net/img/2012/7/29/61191/thumb_small.png',
      CMmaxWidth: 62,
      Mane: 'background: linear-gradient(90deg, darkgray 7%, gray 7%, gray 14%, lightgray 14%, lightgray 21%, gray 21%, gray 28%, darkgray 28%, darkgray 35%, black 35%, black 42%, yellow 42%)',
      text: 'a_magenta',
      border: 'a_magenta'
    },
    'sunburst': {
      CMimages: 'https://camo.derpicdn.net/4f1e9bc51191de5cb463c065135b592696a36c12?url=https%3A%2F%2Fi.imgur.com%2FGOwtR3M.png',
      CMmaxWidth: 62,
      transparentCM: 0.8,
      Mane: 'background: linear-gradient(90deg, red 40%, sfMane1 40%, sfMane1 90%, white 90%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'glitter drops': {
      CMimages: 'https://derpicdn.net/img/2018/12/1/1895415/thumb_small.png',
      CMmaxWidth: 50,
      Mane: 'background: linear-gradient(90deg, lyMane 40%, mint 40%)',
      text: 'a_violet',
      border: 'a_violet'
    },
    'coco pommel': {
      CMimages: 'https://derpicdn.net/img/2016/8/25/1233451/thumb_small.png',
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, cpMane1 13%, cpMane2 13%, cpMane2 26%, cpMane1 26%, cpMane1 40%, cpCoat 40%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'aloe': {
      CMimages: 'https://derpicdn.net/img/view/2020/3/14/2297097.svg',
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, cyan 20%, white 20%, white 26%, cyan 26%, cyan 40%, white 40%, white 47%, pink 47%)',
      text: 'blue',
      border: 'blue'
    },
    'lotus blossom': {
      CMimages: 'https://derpicdn.net/img/view/2020/3/14/2297096.svg',
      CMmaxWidth: 75,
      Mane: 'background: linear-gradient(90deg, pink 20%, chrMane2 20%, chrMane2 26%, pink 26%, pink 40%, white 40%, white 47%, cyan 47%)',
      text: 'blue',
      border: 'blue'
    },
    'coloratura': {
      CMimages: 'https://derpicdn.net/img/view/2015/11/21/1027178.svg',
      CMmaxWidth: 72,
      transparentCM: 0.8,
      Mane: 'background: linear-gradient(90deg, clrMane2 10%, clrMane1 10%, clrMane1 15%, clrMane2 15%, clrMane2 25%, clrMane3 25%, clrMane3 30%, clrMane2 30%, clrMane2 40%, lyMane 40%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },

    'maud pie': {
      CMimages: '',
      Mane: 'background: linear-gradient(90deg, mpMane 40%, lightgray 40%, lightgray 72.5%, lightblue 72.5%, lightblue 85%, darkgray 85%, darkgray 87.5%, lightblue 87.5%)',
      text: 'a_mpEye',
      border: 'a_mpEye'
    },
    'marble pie': {
      CMimages: 'https://derpicdn.net/img/2017/8/22/1517554/thumb_small.png',
      CMmaxWidth: 70,
      transparentCM: 0.8,
      Mane: 'background: linear-gradient(90deg, mpMane1 13%, mpMane2 13%, mpMane2 26%, mpMane1 26%, mpMane1 40%, lightgray 40%)',
      text: 'a_violet',
      border: 'a_violet'
    },
    'limestone pie': {
      CMimages: 'https://derpicdn.net/img/2017/8/24/1518819/thumb_small.png',
      CMmaxWidth: 55,
      Mane: 'background: linear-gradient(90deg, txMane2 40%, dhCoat 40%)',
      text: 'a_yellow',
      border: 'a_yellow'
    },

    'scootaloo': {
      CMimages: 'https://derpicdn.net/img/2016/4/23/1138658/thumb_small.png',
      CMmaxWidth: 72,
      Mane: 'background: linear-gradient(90deg, magenta 30%, orange 30%)',
      text: 'a_violet',
      border: 'a_violet'
    },
    'apple bloom': {
      CMimages: 'https://derpicdn.net/img/2016/4/23/1138655/thumb_small.png',
      CMmaxWidth: 72,
      Mane: 'background: linear-gradient(90deg, red 30%, fsCoat 30%)',
      text: 'a_orange',
      border: 'a_orange'
    },
    'sweetie belle': {
      CMimages: 'https://derpicdn.net/img/2016/4/23/1138656/thumb_small.png',
      CMmaxWidth: 72,
      Mane: 'background: linear-gradient(90deg, pink 20%, tsCoat 20%, tsCoat 40%, white 40%)',
      text: 'a_green',
      border: 'a_green'
    },
    'diamond tiara': {
      CMimages: 'https://camo.derpicdn.net/611fbbbad5a9ce29e02781e27e54af50a83af48b?url=https%3A%2F%2Fi.imgur.com%2F7Nd580c.png',
      transparentCM: 0.8,
      CMmaxWidth: 75,
      Mane: 'background: linear-gradient(90deg, tsCoat 13%, white 13%, white 26%, tsCoat 26%, tsCoat 40%, pink 40%)',
      text: 'blue',
      border: 'blue'
    },
    'silver spoon': {
      CMimages: 'https://derpicdn.net/img/2017/1/22/1345034/thumb_small.png',
      transparentCM: 0.8,
      CMmaxWidth: 35,
      Mane: 'background: linear-gradient(90deg, txMane2 13%, white 13%, white 26%, txMane2 26%, txMane2 40%, lightgray 40%)',
      text: 'violet',
      border: 'violet'
    },
    'babs seed': {
      CMimages: 'https://derpicdn.net/img/2019/6/16/2067468/thumb_small.png',
      CMmaxWidth: 45,
      Mane: 'background: linear-gradient(90deg, bsMane2 10%, bsMane1 10%, bsMane1 20%, bsMane2 20%, bsMane2 30%, bsMane1 30%, bsMane1 40%, bsCoat 40%)',
      text: 'a_bsEye',
      border: 'a_bsEye'
    },
    'cozy glow': {
      CMimages: 'https://derpicdn.net/img/2016/7/12/1863905/thumb_small.png',
      CMmaxWidth: 45,
      Mane: 'background: linear-gradient(90deg, txMane1 13%, txMane2 13%, txMane2 26%, txMane1 26%, txMane1 40%, pink 40%)',
      text: 'a_magenta',
      border: 'a_magenta'
    },

    'oc:anon': {
      CMimages: '',
      Mane: 'background: linear-gradient(90deg, darkgray 40%, green 40%)',
      text: 'a_green',
      border: 'a_green'
    },
    'oc:filly anon': {
      CMimages: '',
      Mane: 'background: linear-gradient(90deg, darkgray 40%, green 40%)',
      text: 'a_green',
      border: 'a_green'
    },
    'oc:aryanne': {
      CMimages: 'https://derpicdn.net/img/2014/6/1/642109/thumb_small.png',
      transparentCM: 0.8,
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, #fdf7c1 40%, #fff 40%)',
      text: '#7ca2e1',
      xText: '#000',
      border: '#7ca2e1'
    },
    'oc:littlepip': {
      CMimages: 'https://derpicdn.net/img/2020/3/6/2291390/thumb.png',
      transparentCM: 0.8,
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, ttCoat 40%, dhCoat 40%)',
      text: 'a_green',
      border: 'a_green'
    },
    'oc:blackjack': {
      CMimages: 'https://derpicdn.net/img/2020/3/6/2291394/thumb.png',
      transparentCM: 0.8,
      CMmaxWidth: 70,
      Mane: 'background: linear-gradient(90deg, black 13%, red 13%, red 26%, black 26%, black 40%, white 40%)',
      text: 'a_red',
      border: 'a_red'
    },
    'oc:fluffle puff': {
      CMimages: '',
      text: '#0b5956',
      xText: '#0b5956',
      border: '#0b5956'
    },
    'oc:milky way': {
      CMimages: 'https://derpicdn.net/img/view/2012/12/21/189707.svg',
      CMmaxWidth: 65,
      Mane: 'background: linear-gradient(90deg, blue 13%, lightblue 13%, lightblue 26%, blue 26%, blue 40%, sfCoat 40%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'oc:cream heart': {
      CMimages: 'https://derpicdn.net/img/2014/8/27/709182/thumb_small.png',
      CMmaxWidth: 75,
      Mane: 'background: linear-gradient(90deg, orange 40%, sfCoat 40%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'oc:fausticorn': {
      CMimages: 'https://derpicdn.net/img/2012/1/16/527/thumb_small.png',
      CMmaxWidth: 60,
      Mane: 'background: linear-gradient(90deg, red 40%, white 40%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'oc:nyx': {
      CMimages: 'https://derpicdn.net/img/2012/8/29/85794/thumb_small.png',
      CMmaxWidth: 50,
      Mane: 'background: linear-gradient(90deg, violet 40%, cyan 40%, cyan 45%, black 45%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
    'oc:snowdrop': {
      CMimages: '',
      Mane: 'background: linear-gradient(90deg, lightblue 10%, white 10%, white 20%, lightblue 20%, lightblue 30%, white 30%, white 40%, lightblue 40%, cyan 40%)',
      text: 'a_cyan',
      border: 'a_cyan'
    },
  };

  // only patterns here, autofilled with content above

  let extendedData = {
    CMimages: {
      _css:'.tag[data-tag-name="%tag%"] .dropdown__content::after {background-image: url(%data%);}',
      _ery_css_patterns:[
'.tag[data-tag-name="%tag%"] .tag__dropdown__link',
'.tag[data-tag-name="%tag%"] .tag__dropdown__link:hover',
'.tag[data-tag-name="%tag%"] .dropdown__content::after'
      ],
      _ery_css_patterns_resolve:[
'%pattern% {background:none}',
'%pattern% {background:rgba(0,0,0,.1)}',
`%pattern% {
    content: " ";
    background-position: bottom right;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
    position: absolute;
    bottom: 0;
    right: 0;
    opacity: 0.75;
    z-index:-1;
}`
      ]
    },

    CMmaxWidth:{ _css:'.tag[data-tag-name="%tag%"] .dropdown__content::after {max-width: %data%px; background-size: contain;}' },

    Mane: {
      _css:'.tag[data-tag-name="%tag%"].dropdown::before, .tag[data-tag-name="%tag%"] .dropdown__content::before {%data%}',
      _ery_css_patterns:[
'.tag[data-tag-name="%tag%"] .tag__count',
'.tag[data-tag-name="%tag%"].dropdown .dropdown__content',
'.tag[data-tag-name="%tag%"].dropdown:hover .dropdown__content',
'.tag[data-tag-name="%tag%"].dropdown>*:not(.dropdown__content)',
'.tag[data-tag-name="%tag%"].dropdown::before, .tag[data-tag-name="%tag%"] .dropdown__content::before',
'.tag[data-tag-name="%tag%"].dropdown::before',
'.tag[data-tag-name="%tag%"] .dropdown__content::before'
        ],
      _ery_css_patterns_resolve: [
'%pattern% {background:none}',
'%pattern% {display:block;opacity:0;pointer-events:none;padding:0}',
'%pattern% {opacity:1;pointer-events:auto}',
'%pattern% {z-index:1;position:relative}',
`%pattern% { content: " ";
    width:100%;
    height:100%;
    position:absolute;
    top:0;
    left:0;
    pointer-events:none;
    background-repeat:repeat-y}`,
'%pattern% {background-position:left bottom}',
'%pattern% {z-index:-1}',
        ]
    },

    transparentCM: { _css:'.tag[data-tag-name="%tag%"] .dropdown__content::after {opacity:%data% !important}' },

    cmFix: { _css:'.tag[data-tag-name="%tag%"] .dropdown__content::after {z-index:-2 !important}' },

    background: { _css:'.tag[data-tag-name="%tag%"] .dropdown__content, .tag[data-tag-name="%tag%"].dropdown {background: %data% }, .tag[data-tag-name="%tag%"] .tag__count {background:none}' },

    text: {
      _css:`.tag[data-tag-name="%tag%"] a, .tag[data-tag-name="%tag%"] .tag__state {color: %data% !important}
.tag[data-tag-name="%tag%"] a:not(.header__link):not([rel="dc:source"]):not(.button):not(.block__header):not(.block__header--single-item):not(.tag__name):not(.interaction--fave):not(.interaction--comments):not(.interaction--upvote):not(.interaction--hide):not(.interaction--downvote):not(.media-box__header--link):hover {
    color: %data% !important;
    opacity: .5;
}`
    },

    xText: {
      _css:`.tag[data-tag-name="%tag%"] .tag__count { color: %data% !important; }`
    },

    border: { _css:`.tag[data-tag-name="%tag%"] .dropdown__content, .tag[data-tag-name="%tag%"].dropdown {border-color: %data% }` }

  };

  // logic
  for (let name in ponies) {
    const pony = ponies[name];
    for (let key in pony) {
      extendedData[key][name] = pony[key];
    }
  };

  commonPatterns.forEach((text, i) => {
    let result = [];
    for (let name of tagsWithPatchedText) {
      result.push(text.replace(/%name%/g, name));
    }
    const res = result.join(',');
    commonColors['pattern'+i] = themes.map(() => res);
  }) ;

  const theme = themes.indexOf(document.body.dataset.theme);

  for (let i in commonColors) {
    if (!i.startsWith('a_')) {
      commonColors['a_'+i] = [commonColors[i][1], commonColors[i][0], commonColors[i][1]];
    }
  }

  // more complex code for character tags

  for (let i in extendedData) {
    let data = extendedData[i];
    let patterns, css = '';
    if (data._ery_css_patterns) {
      patterns = data._ery_css_patterns.map(() => '');
    }
    for (let tag in data) {
      if (tag.startsWith('_')) continue;
      css += data._css.replace(/%tag%/g, tag).replace(/%data%/g, data[tag]);
      if (data._ery_css_patterns) {
        data._ery_css_patterns.forEach((pattern, i) => {
          patterns[i] += (patterns[i]===''?'':',') + pattern.replace(/%tag%/g, tag);
        });
      }
    }

    if (data._ery_css_patterns) patterns.forEach((pattern, i) => {
      css += data._ery_css_patterns_resolve[i].replace(/%pattern%/g, pattern);
    });

    style = css + style;
  }

  // resolve colors
  style = style.replace(/a_a_/g, '');
  for (let i in commonColors) {
    style = style.replace(new RegExp('([^_])'+i+'(;| |,)', 'g'), '$1'+commonColors[i][theme] + '$2');
  }

  GM_addStyle(style);
})();
