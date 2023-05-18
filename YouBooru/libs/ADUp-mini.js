/*
 * Lightweight replacer of YDB:ADUp.
 * - Either @grant unsafeWindow or @grant none required to prevent possible conflicts with full ADUp.
 * - @grant GM_getValue and GM_setValue required to allow remembering derpibooru domain
 */

(function() {
  let win;
  let currentImage = '';
  let overRideSize = false;
  const objects = {};
  objects.tagInput = document.getElementById('image_tag_input');
  objects.tagSwitch = document.querySelector('.button.button--state-primary.button--bold.js-taginput-show');
  objects.imageSource = document.getElementById('image_source_url');
  objects.scrapper = document.getElementById('image_scraper_url') || document.getElementById('scraper_url');
  objects.scrapperLoader = document.getElementById('js-scraper-preview');
  objects.description = document.getElementById('image_description');

  function parseURL(url) {
    const a = document.createElement('a');
    a.href = url;
    return {
      source: url,
      protocol: a.protocol.replace(':',''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: (function(){
        let ret = {},
            seg = a.search.replace(/^\?/,'').split('&'),
            len = seg.length, s;
        for (let i = 0; i<len; i++) {
          if (!seg[i]) { continue; }
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }
        return ret;
      })(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
      hash: a.hash.replace('#',''),
      path: a.pathname.replace(/^([^\/])/,'/$1'),
      relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
      segments: a.pathname.replace(/^\//,'').split('/')
    };
  }

  function fetchJson(verb, endpoint, body) {
    let win;
    if (typeof unsafeWindow !== 'undefined') {
      win = unsafeWindow;
    } else {
      win = window;
    }
    if (!endpoint.startsWith('https://'+location.hostname)) endpoint = 'https://'+location.hostname+endpoint;
    const data = {
      method: verb,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      body._method = verb;
      data.body = JSON.stringify(body);
    }

    return fetch(endpoint, data).then(response => response.json());
  }

  function hasData() {
    return objects.tagInput.value || objects.imageSource.value || objects.scrapper.value || objects.description.value;
  }

  function fillData(url) {
    if (decodeURIComponent(url.params.tags) != 'undefined' && !objects.tagInput.value) {
      if (url.params.origTags) {
        objects.tagInput.value = url.params.origTags+','+decodeURIComponent(url.params.tags);
      }
      else {
        url.params.origTags = decodeURIComponent(url.params.tags);
        objects.tagInput.value = decodeURIComponent(url.params.tags);
      }
      objects.tagSwitch.click();
    }
    if (decodeURIComponent(url.params.src) != 'undefined' && !objects.imageSource.value) {
      objects.imageSource.value = decodeURIComponent(url.params.src);
    }
    if (decodeURIComponent(url.params.newImg) != 'undefined' && !objects.scrapper.value) {
      objects.scrapper.value = decodeURIComponent(url.params.newImg);
      const event = new win.CustomEvent('input');
      objects.scrapper.dispatchEvent(event);
      setTimeout(() => objects.scrapperLoader.click(), 1000);
    }
    if (decodeURIComponent(url.params.description) != 'undefined' && !objects.description.value) {
      objects.description.value = decodeURIComponent(url.params.description).replace(/[^\S\n]+\n/mg, '\n');
    }
    if (decodeURIComponent(url.params.originView) != 'undefined') {
      objects.preview.src = url.params.originView;
    }
  }

  function reverse(url) {
    alert('unsupported');
  }

  async function fetchExtData(url) {
    const response = await fetchJson('GET', '/api/v1/json/images/'+url.params.origin);
    const x = response.image;
    url.params.tags = encodeURIComponent(x.tags);
    url.params.originWidth = x.width;
    url.params.originHeight = x.height;
    url.params.originView = x.representations.large;
    if (url.params.src == 'undefined') url.params.src = encodeURIComponent(x.source_url);
  }

  async function maybeFillData(url) {
    if (url.params.origin) {
      await fetchExtData(url);
    }
    if (!hasData()) {
      fillData(url);
    } else {
      document.querySelector('form[action="/images"]').insertBefore(
        objects.warning = createFromNotation('.dnp-warning', {style: {marginBottom: '0.5em'}},
          ['h4', "Override prefilled page content with ADUp fetch data?"],
          ['p',
            ['a', {onclick:() => {fillData(url); objects.warning.style.display = 'none'}}, 'OK'],
            ' ',
            ['a', {onclick:() => objects.warning.style.display = 'none'}, 'Cancel']
          ])
        )
        document.querySelector('.dnp-warning');
    }
  }

  function diffCheck(url) {
    setTimeout(diffCheck, 100, url);
    if (!url.params.originView) objects.diffContainer.style.display = 'none';
    else objects.diffContainer.style.display = 'block';
    if (!document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked')) return;
    let c = document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked').value;
    if (currentImage != c) {
      currentImage = c;
      objects.origPreview.src = document.querySelector('#js-image-upload-previews .scraper-preview--label .scraper-preview--input:checked+.scraper-preview--image-wrapper img').src;
    }
  }

  function diff(url) {
    let ctx = objects.diff.getContext('2d');
    ctx.canvas.width = objects.preview.naturalWidth;
    ctx.canvas.height = objects.preview.naturalHeight;
    let img = objects.preview;
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'difference';
    img = objects.origPreview;
    ctx.drawImage(img, 0, 0, objects.preview.naturalWidth, objects.preview.naturalHeight);
    if (!overRideSize) objects.newSizes.innerHTML = img.naturalWidth + 'x' + img.naturalHeight;
    if (decodeURIComponent(url.params.originWidth) != 'undefined') {
      objects.oldSizes.innerHTML = url.params.originWidth+'x'+url.params.originHeight;
    }
  }

  function markup(url) {
    document.querySelector('.image-other').insertBefore(
      createFromNotation('div',
        ['.block',
          ['.block__header',
            ['strong.block__header__title', 'Similar images'],
            objects.reverseHead = createFromNotation('span',
              ['a#reverseButton', { onclick: (e) => {
                e.target.parentNode.style.display = 'none';
                objects.similarGallery.innerHTML = '';
                objects.similarGallery.appendChild(createElement('strong', 'Fetching...'));
                reverse(url);
              }}, 'Check'],
              ['strong.block__header__title', 'Fuzziness'],
              objects.fuzzyness = createElement('input.header__input.input', {value:0.45})
            )
          ],
          createElement('.block__content', [
            objects.similarGallery = createFromNotation('',
             ['strong', 'Not executed']
            )
          ])
        ],
        ['', {style:{paddingBottom:'1em',fontSize:'1.1em',textAlign:'center'}},
          objects.oldSizes = createElement('strong', '??? x ???'),
          ' => ',
          objects.newSizes = createElement('strong', '??? x ???')
        ],
        objects.diffContainer = createElement('', [
          objects.preview = createElement('img', {style:{display:'inline-block',width:'320px',marginRight:'10px'}}),
          objects.diff = createElement('canvas', {style:{display:'inline-block',width:'320px',marginRight:'10px'}}),
          objects.origPreview = createElement('img#js-image-upload-preview', {style:{display:'inline-block',width:'320px'}})
        ])
      ),
      document.querySelector('.image-other').childNodes[0]);
    objects.preview.addEventListener('load', () => {
      objects.diff.style.height = objects.preview.clientHeight+'px';
      diff(url);
    });

    objects.origPreview.addEventListener('load', () => {
      if (document.getElementById('image_image').files.length > 0) {
        overRideSize = false;
        if (objects.similarGallery.getElementsByTagName('strong')) objects.similarGallery.getElementsByTagName('strong')[0].innerHTML = 'Not executed';
        else objects.similarGallery.appendChild(createElement('strong', 'Not executed'));
      }
      diff(url);
    });
  }

  async function init() {
    if (typeof unsafeWindow !== 'undefined') {
      win = unsafeWindow;
    } else {
      win = window;
    }
    if (win._YDB_public &&
        win._YDB_public.settings &&
        (win._YDB_public.settings._adup || win._YDB_public.settings._madup)) return;
    if (document.getElementById('_ydb_diff_container')) return;

    win._YDB_public.settings._madup = 'hello';
    const url = parseURL(location.href);
    markup(url);
    await maybeFillData(url);
    setTimeout(diffCheck, 100, url);
  }

  if (location.pathname == '/images/new') {
    setTimeout(init, 70);
    if (/(www\.|)(derpi|trixie)booru\.org/.test(location.hostname)) {
      GM_setValue('domain', location.hostname);
    }
  }
})();

function getDerpHomeDomain() {
  try {
    return GM_getValue('domain', 'www.derpibooru.org');
  }
  catch (e) {
    return 'www.derpibooru.org';
  }
}
