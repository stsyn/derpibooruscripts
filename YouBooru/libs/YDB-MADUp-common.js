// ==UserScriptLib==
// @name         YDB:MADUp - Common
// @version      1.0.1L
// @description  Simplifies process of image updating and uploading — shared derpi code
// @author       stsyn

// literally all boorus are supported by common library
// @match        *://*/*
// @exclude      *://*/api*/json/*
// @exclude      *://*/adverts/*

// these scripts are required for this library to work — append all of these as well and insert this library at the end
// @require      https://github.com/stsyn/GM_fetch/raw/master/GM_fetch.js
// @require      https://github.com/stsyn/createElement/raw/component/src/es5.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ui/Inputs.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/api/Basics.js

// needed to perform requests for another sites
// @grant        GM.xmlHttpRequest
// ==/UserScriptLib==

'use strict';
/**
 * YDB_MADUp.registerFetcher(name, siteMatcher, fetcher) => void
 * @param name string — human-readable target site name;
 * @param siteMatcher (url: string) => boolean — function to check if script is able to evaluate source;
 * @param fetcher (url: string, options: Options) => Promise<string | { imageUrl: string }> — function to fetch provided url and retrieve image url.
 * It's expected that you will show the error message and reject in case of troble.
 * * @param options — right now it's just {}, some properties could be added.
 */
var YDB_MADUp = (function() {
  const noop = () => {};
  const enviroment = YDB_api.getEnviroment();
  const isBooru = enviroment !== 'unknown';
  if (!isBooru) {
    return {
      registerFetcher: noop,
    };
  }

  const container = document.querySelector('.block__tab[data-tab="replace"] form');
  const sources = Array.from(document.querySelectorAll('.image_source__link a')).map(v => v.href);
  const replaceInput = document.getElementById('image_scraper_url');
  const replaceFetch = document.getElementById('js-scraper-preview');
  const elems = {};

  const uploadContainer = document.querySelector('form[action="/images"][method="post"]');

  function registerFetcher(name, isOurTarget, fetchTarget) {
    const tryFetch = async(url) => {
      try {
        elems.button.disabled = true;
        const result = await fetchTarget(url);
        const imageUrl = typeof result === 'string' ? result : result.imageUrl;
        replaceInput.value = imageUrl;
        // fixing derpi ui
        replaceFetch.disabled = false;
        await wait(200);
        replaceFetch.click();
      } finally {
        elems.button.disabled = false;
      }
    }

    const appendButton = (href) => {
      container.appendChild(createElement('hr'));
      container.appendChild(createElement(YDB_api.UI.button, { onclick: () => tryFetch(href), _cast: e => elems.button = e }, [name + ' auto-fetch']));
    }

    const appendSection = () => {
      const oldButton = document.querySelector('_madup-fetch');
      if (!oldButton) {
        const target = document.querySelector('.image-other');
        target.appendChild(createElement('hr'));
        let currentSource;
        target.appendChild(createElement('.field.field--inline', [
          [YDB_api.UI.input, {
            className: '_madup-url',
            _cast: e => elems.input = e,
            inline: true,
            fullWidth: true,
            onchange: (e) => currentSource = e.target.value,
            placeholder: 'Input for alternative fetch'
          }],
          [YDB_api.UI.button, {
            className: ' _madup-fetch',
            onclick: async(e) => {
              if (!currentSource) {
                return;
              }
              alert('Either no known targets found or another error occuppied, fallbacking to default fetch');

              replaceInput.value = currentSource;
              replaceFetch.disabled = false;
              await wait(200);
              replaceFetch.click();
            },
            _cast: e => elems.button = e,
          }, ['Alt fetch']]
        ]));
        console.log(target);
      } else {
        elems.button = oldButton;
      }

      elems.button.addEventListener('click', async(e) => {
        const currentSource = document.querySelector('._madup-url').value;
        if (!isOurTarget(currentSource)) {
          return;
        }
        e.stopImmediatePropagation();

        await tryFetch(currentSource);

        let srcElement = Array.from(document.querySelectorAll('.js-source-url')).filter(e => !e.value)[0];
        if (!srcElement) {
          document.querySelector('.js-image-add-source').click();
          await wait(200);
          srcElement = Array.from(document.querySelectorAll('.js-source-url')).filter(e => !e.value)[0];
        }

        srcElement.value = currentSource;
      }, { capture: true });
    }

    if (container) {
      sources.filter(isOurTarget).forEach(appendButton);
    }

    if (uploadContainer) {
      appendSection();
    }
  }

  function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  return {
    registerFetcher,
  }
})();
