// ==UserScript==
// @name         Tag decorations
// @namespace    http://tampermonkey.net/
// @version      0.2
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

.tag[data-tag-name="gay"], .tag[data-tag-name="gay"] .tag__dropdown__link {
    background:linear-gradient(90deg, red 16%, orange 16%, orange 33%, yellow 33%, yellow 50%, green 50%, green 67%, blue 67%, blue 83%, violet 83%);
}
.tag[data-tag-name="intersex"], .tag[data-tag-name="intersex"] .tag__dropdown__link {
    background:linear-gradient(90deg, pink 16%, white 16%, white 33%, cyan 33%, cyan 50%, pink 50%, pink 67%, white 67%, white 83%, pink 83%);
}

.tag[data-tag-name="straight"], .tag[data-tag-name="straight"] .tag__dropdown__link {
    background:linear-gradient(90deg, black 20%, white 20%, white 40%, black 40%, black 60%, white 60%, white 80%, black 80%);
}
.tag[data-tag-name="lesbian"], .tag[data-tag-name="lesbian"] .tag__dropdown__link {
    background:linear-gradient(90deg, red 20%, orange 20%, orange 40%, white 40%, white 60%, pink 60%, pink 80%, violet 80%);
}
.tag[data-tag-name="transgender"], .tag[data-tag-name="transgender"] .tag__dropdown__link {
    background:linear-gradient(90deg, cyan 20%, pink 20%, pink 40%, white 40%, white 60%, pink 60%, pink 80%, cyan 80%);
}

.tag[data-tag-name="asexual"], .tag[data-tag-name="asexual"] .tag__dropdown__link {
    background:linear-gradient(90deg, black 25%, gray 25%, gray 50%, white 50%, white 75%, violet 75%);
}

.tag[data-tag-name="bisexual"], .tag[data-tag-name="bisexual"] .tag__dropdown__link {
    background:linear-gradient(90deg, red 43%, violet 43%, violet 57%, blue 57%);
}

.tag[data-tag-name="grayscale"], .tag[data-tag-name="grayscale"] .tag__dropdown__link {
    background:gray;
}
`;

  const commonColors = {
    red:       ['#e47c73', '#811d13', '#e47c73'],
    orange:    ['#f5c183', '#824c1c', '#f5c183'],
    yellow:    ['#fef08f', '#897c2a', '#fef08f'],
    green:     ['#8ec47b', '#285818', '#8ec47b'],
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

  commonPatterns.forEach((text, i) => {
    let result = [];
    for (let name of tagsWithPatchedText) {
      result.push(text.replace(new RegExp('%name%', 'g'), name));
    }
    const res = result.join(',');
    commonColors['pattern'+i] = themes.map(() => res);
  }) ;

  const theme = themes.indexOf(document.body.dataset.theme);

  for (let i in commonColors) {
    style = style.replace(new RegExp(i+'(;| |,)', 'g'), commonColors[i][theme] + '$1');
  }

  console.log(style, commonColors);
  GM_addStyle(style);
})();
