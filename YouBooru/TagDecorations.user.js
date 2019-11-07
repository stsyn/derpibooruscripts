// ==UserScript==
// @name         Tag decorations
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  some silly tag decorations
// @author       stsyn
// @include      /http[s]*://(www.|)(trixie|derpi)booru.org/*/
// @exclude      /http[s]*://(www.|)(trixie|derpi)booru.org/adverts/*/
// @downloadURL  https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/TagDecorations.user.js
// @updateURL    https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/TagDecorations.user.js
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

/*******************************
  Princess Celesia code
*******************************/

/* dirty hack for animation sync */
.tag[data-tag-name="princess celestia"].dropdown .dropdown__content {
    display:block;
    opacity:0;
    pointer-events:none;
}
.tag[data-tag-name="princess celestia"].dropdown:hover .dropdown__content {
    opacity:1;
    pointer-events:auto;
}
.tag[data-tag-name="princess celestia"].dropdown>*:not(.dropdown__content) {
    z-index:1;
    position:relative;
}

@keyframes tia_mane {
  from {background-position:0% 0;}
  to {background-position:0% 400px;}
}

@keyframes tia_mane_fix {
  from {background-position:0% 30px;}
  to {background-position:0% 430px;}
}

.tag[data-tag-name="princess celestia"].dropdown::before, .tag[data-tag-name="princess celestia"] .dropdown__content::before {
    content: " ";
    width:100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: url(https://camo.derpicdn.net/26f345ba427b6d33ac1aa61a97abdc7e7a8a0a5d?url=https%3A%2F%2Fi.imgur.com%2FvBfierZ.png);
    background-repeat: repeat-y;
    background-size: 50% 400px;
    opacity: 0.5;
}
.tag[data-tag-name="princess celestia"].dropdown::before {
    animation: 10s infinite linear tia_mane_fix;
}
.tag[data-tag-name="princess celestia"] .dropdown__content::before {
    animation: 10s infinite linear tia_mane;
    z-index:-1;
}
.tag[data-tag-name="princess celestia"] .dropdown__content, .tag[data-tag-name="princess celestia"].dropdown {
    background: white;
    border-color: violet;
}
.tag[data-tag-name="princess celestia"] a, .tag[data-tag-name="princess celestia"] .tag__state {
    color: violet !important;
}
.tag[data-tag-name="princess celestia"] a:hover, .tag[data-tag-name="princess celestia"] a:not(.header__link):not([rel="dc:source"]):not(.button):not(.block__header):not(.block__header--single-item):not(.tag__name):not(.interaction--fave):not(.interaction--comments):not(.interaction--upvote):not(.interaction--hide):not(.interaction--downvote):not(.media-box__header--link):hover {
    color: a_violet !important;
}
`;

  let commonColors = {
    red:       ['#e47c73', '#811d13', '#e47c73'],
    orange:    ['#f5c183', '#824c1c', '#f5c183'],
    yellow:    ['#fef08f', '#897c2a', '#fef08f'],
    green:     ['#8ec47b', '#285818', '#8ec47b'],
    lightblue: ['#98d0fc', '#325888', '#98d0fc'],
    blue:      ['#6a8bd2', '#062562', '#6a8bd2'],
    violet:    ['#d981eb', '#6a1b7a', '#d981eb'],

    cyan:      ['#98e1fc', '#327088', '#98e1fc'],
    pink:      ['#f8c9d3', '#855d65', '#f8c9d3'],

    white:     ['#fff',    '#8b8b8b', '#fff'   ],
    gray:      ['#b0b0b0', '#454545', '#b0b0b0'],
    black:     ['#606060', '#000',    '#606060'],

    themeText: ['#000',    '#eee',    '#000'   ],
    themeAnti: ['#fff',    '#000',    '#fff'   ],
    themeMd:   ['#888',    '#888',    '#888'   ]
  }

  const themes = ['default', 'dark', 'red'];

  const tagsWithPatchedText = ['gay', 'intersex', 'straight', 'lesbian', 'transgender', 'asexual', 'bisexual', 'grayscale'];

  const commonPatterns = [
    '.tag[data-tag-name="%name%"], .tag[data-tag-name="%name%"] a',
    '.tag[data-tag-name="%name%"] > span, .tag[data-tag-name="%name%"] > a',
    'body .tag[data-tag-name="%name%"] a:hover'
  ];

  const images = {
    'princess celestia':'https://camo.derpicdn.net/05aa9790d2afb2c098782b5d21f51b952c46722f?url=https%3A%2F%2Fi.imgur.com%2F0Iu5eXC.png'
  };

  const imagesCss = `
.tag[data-tag-name="%name%"] .tag__dropdown__link {
    background:none;
}
.tag[data-tag-name="%name%"] .tag__dropdown__link:hover {
    background:rgba(0,0,0,.1);
}
.tag[data-tag-name="%name%"] .dropdown__content::after {
    content: " ";
    background-image: url(%imageUri%);
    background-position: bottom right;
    background-repeat: no-repeat;
    width:70px;
    height:70px;
    position: absolute;
    bottom: 0;
    right: 0;
    opacity: 0.5;
    z-index:-1;
}`

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

  for (let i in commonColors) {
    style = style.replace(new RegExp('([^_])'+i+'(;| |,)', 'g'), '$1'+commonColors[i][theme] + '$2');
  }

  for (let i in images) {
    style += imagesCss.replace(/%name%/g, i).replace(/%imageUri%/g, images[i]);
  }

  console.log(style, commonColors);
  GM_addStyle(style);
})();
