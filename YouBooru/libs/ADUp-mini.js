/*
 * Lightweight replacer of YDB:ADUp without everything, except filling data from url.
 * Either @grant unsafeWindow or @grant none required to prevent possible conflicts with full ADUp.
 */

(function() {
  let win;
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
        for (let i = 0; i<len;i++) {
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


  function fillData1(url) {
    if (decodeURIComponent(url.params.tags) != 'undefined') {
      if (url.params.origTags) {
        document.getElementById('image_tag_input').value = url.params.origTags+','+decodeURIComponent(url.params.tags);
      }
      else {
        url.params.origTags = decodeURIComponent(url.params.tags);
        document.getElementById('image_tag_input').value = decodeURIComponent(url.params.tags);
      }
      document.querySelector('.button.button--state-primary.button--bold.js-taginput-show').click();
    }
    if (decodeURIComponent(url.params.src) != 'undefined') {
      document.getElementById('image_source_url').value = decodeURIComponent(url.params.src);
    }
    if (decodeURIComponent(url.params.newImg) != 'undefined') {
      document.getElementById('image_scraper_url').value = decodeURIComponent(url.params.newImg);
      const event = new win.CustomEvent('input');
      document.getElementById('image_scraper_url').dispatchEvent(event);
      setTimeout(() => document.getElementById('js-scraper-preview').click(), 1000);
    }
    if (decodeURIComponent(url.params.description) != 'undefined') {
      document.getElementById('image_description').value = decodeURIComponent(url.params.description).replace(/\n\s*\n/g, '\n').replace(/^\s*/mg, '');
    }
  }

  function init() {
    if (typeof unsafeWindow !== 'undefined') {
      win = unsafeWindow;
    } else {
      win = window;
    }
    if (win._YDB_public &&
        win._YDB_public.settings &&
        win._YDB_public.settings._adup) return;
    if (document.getElementById('_ydb_diff_container')) return;
    const url = parseURL(location.href);
    fillData1(url);
  }

  if (location.pathname == '/images/new') {
    setTimeout(init, 70);
  }
})();
