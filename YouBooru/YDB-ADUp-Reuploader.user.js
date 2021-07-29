// ==UserScript==
// @name         YDB:ADUp DA Reupload Edition
// @version      0.0.1
// @author       stsyn

// @include      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/adverts\/.*/
// @exclude      /http[s]*:\/\/(www\.|)(trixie|derpi)booru.org\/.*\.json.*/

// @require      https://raw.githubusercontent.com/blueimp/JavaScript-MD5/master/js/md5.min.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/ADUp-mini.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/libs/YouBooruSettings0.lib.js
// @require      https://github.com/stsyn/derpibooruscripts/raw/master/YouBooru/lib.js
// @require      https://github.com/stsyn/createElement/raw/master/min/es5.js

// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

// Internal usage only. Unstable.

var createElement = createElement || (() => { throw new Error('https://github.com/stsyn/createElement/raw/master/min/es5.js is broken') });
(async function() {
  'use strict';

  const allowedTopics = [
    'meta/topics/reuploading-old-tumblr-images',
    'meta/topics/report-tumblr-_raw-images-here-for-updating',
    'meta/topics/report-deviantart-high-resolution-images-here-for-updating',
    'helper/topics/deviantart-high-resolution-reuploads-draft-and-opinions'
  ];

  const url = parseURL(location.href);

  function waitFor(condition) {
    return new Promise(resolve => {
      const checker = function() {
        console.log(condition(), condition);
        if (!condition()) setTimeout(checker, 20);
        else resolve();
      };
      setTimeout(checker, 20);
    });
  }

  function wait(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }

  if (location.pathname == '/images/new') {
    const container = document.querySelector('form[action="/images"]');

    if (url.params.origin && url.params.newImg) {
      let hash, nonce, origTags = document.getElementById('image_tag_input').value;
      try {
        nonce = window._YDB_public.funcs.getNonce();
        hash = md5(url.params.origin+url.params.newImg+nonce);
      } catch (e) {
        container.appendChild(
          createElement('div', [
            ['h4', 'Replace old image'],
            ['p', 'Failed to gain nonce. Please make sure that YDB:Setting is available.']
          ])
        );
        return;
      }
      container.appendChild(
        createElement('div', [
          ['h4', "Replace old image"],
          ['p', "Hitting button below will try to replace an image "+url.params.origin+" with new by URL and update source (but only if you have a permission to do that)."],
          ['button.button', {
            onclick: (e) => {
              const currentTags = document.getElementById('image_tag_input').value;
              const tags = currentTags === origTags ? undefined : currentTags;
              location.href = `//${location.hostname}/${url.params.origin}?h=${hash}&n=${url.params.newImg}&s=${url.params.src}&t=${encodeURIComponent(tags)}`;
              e.preventDefault();
            }
          }, 'Replace']
        ])
      );
    }
  } else if (url.params.h) {
    const nonce = window._YDB_public.funcs.getNonce();
    const hash = md5(url.path.slice(1)+url.params.n+nonce);

    if (hash == url.params.h && document.getElementById('image_scraper_url')) {
      const src = decodeURIComponent(url.params.s);
      const tags = decodeURIComponent(url.params.t);
      const newImg = decodeURIComponent(url.params.n);
      await wait(1000);

      if (src != "undefined" && src != document.querySelector('input[name="image[source_url]"]').value) {
        document.querySelector('#edit-description').click();
        document.querySelector('textarea[name="description"]').value += '\n\n"Alt. source":'+document.querySelector('input[name="image[source_url]"]').value;
        document.querySelector('form[action*="/description"] input[type="submit"]').click();

        document.querySelector('#edit-source').click();
        document.querySelector('input[name="image[source_url]"]').value = src;

        document.querySelector('.edit_image input[type=submit]').click();

        await waitFor(() => !document.querySelector('.edit_image input[type=submit]').disabled);

        if (!document.querySelector('.edit_image input[type=submit]') || !document.querySelector('.tag-list')) {
          location.reload();
          return;
        }
      }

      if (tags != 'undefined') {
        document.getElementById('edit-tags').click();
        document.getElementsByClassName('js-taginput-hide')[0].click();
        await waitFor(() => !document.querySelector('#tags-form_tag_input.hidden'));
        document.getElementById('tags-form_tag_input').value = tags;
        document.getElementById('edit_save_button').click();
      }

      document.querySelector('a[data-click-tab="replace"]').click();
      await waitFor(() => !document.querySelector('.hidden[data-tab="replace"]'));

      document.getElementById('image_scraper_url').value = newImg;
      document.getElementById('js-scraper-preview').disabled = false;
      await wait(200);
      document.getElementById('js-scraper-preview').click();

      await waitFor(() => !document.getElementById('js-scraper-preview').disabled);
      document.querySelector('form[action*="/file"] button[type="submit"]').click();
    }
  }

  // ancient horror, do not enter
  allowedTopics.forEach(tp => {
    if (location.pathname.startsWith('/'+tp) || location.pathname.startsWith('/forums/'+tp)) {
      const render = (img, link, src) =>
        createElement(
          'a',
          {
            style: {display: 'inline-block', paddingLeft:'2em'},
            href: `/images/new?origin=${img}&src=${encodeURIComponent(src)}&newImg=${encodeURIComponent(link)}`,
            target: '_blank',
            onclick: (e) => e.target.style.color = 'gray'
          },
          '[Upload]');

      for (let el of Array.from(document.getElementsByClassName('communication__body__text'))) {
        const killswitch = Array.from(el.querySelectorAll('.spoiler, .strong')).find(z => ['Ignore', '[Done]'].includes(z.innerHTML));

        if (killswitch) return;
        let prxs = [], exs = [], img, link, src, iteration = 0;

        for (let z=0; z<el.childNodes.length; z++) {
          let x = el.childNodes[z];
          if (iteration == 0) {
            if (x.tagName == 'A' && x.innerHTML.startsWith('&gt;&gt;')) {
              prxs.push(x);
              img = parseInt(x.innerHTML.slice(8));
              iteration = 1;
              src = undefined;
            }
          }
          else if (iteration == 1) {
            if ((x.wholeText && x.wholeText.replace('\n','').startsWith('http')) || (x.tagName == 'A' && x.innerHTML.startsWith('http'))) {
              if (!x.tagName) link = x.wholeText;
              else link = x.innerText;
              let l = createElement('a', {href:link});
              link = l;/*'http://s3.amazonaws.com/data.tumblr.com'+l.pathname.replace(/_\d{3,}/, '_raw');*/
              iteration = 2;
            }
          }
          else if (iteration == 2) {
            if ((x.wholeText && x.wholeText.replace('\n','').startsWith('http')) || (x.tagName == 'A' && x.innerHTML.startsWith('http'))) {
              if (!x.tagName) src = x.wholeText;
              else src = x.innerText;
              iteration = 0;
              exs.push(render(img, link, src));
            }
            else if (x.tagName == 'A' && x.innerHTML.startsWith('&gt;&gt;')) {
              iteration = 0;
              exs.push(render(img, link, src));
              z--;
            }
          }
        }
        if (iteration == 2) {
          exs.push(render(img, link, src));
        }
        for (let z=0; z<exs.length; z++) {
          el.insertBefore(exs[z], prxs[z].nextSibling);
        }
      }
    }
  });
})();
