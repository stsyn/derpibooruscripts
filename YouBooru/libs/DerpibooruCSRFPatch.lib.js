// updates CSRF token to avoid site fails because of some scripts requests

(function() {
  let prevented = true;
  function preventWrongCSRF(e, c) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let token, token2, token2Container;
    const update = function() {

      const onComplete = function(r) {
        const t = r.responseText;
        try {
          token = t.match(/<meta name="csrf-token" content="([A-Za-z0-9+=/]*)" \/>/)[1];
          if (c) {
            token2Container = document.createElement('div');
            token2Container.innerHTML = t.match(/<body [A-Za-z0-9=\- "]*>([\s\S]*)<\/body>/)[1];
            token2 = token2Container.querySelector(`form[action="${c.form.action.replace(location.origin, '')}"]`).authenticity_token.value;
          }
        }
        catch (err) {
          if (!token) console.log(`No token :( - ${err}`);
          else if (!token2) console.log(`No token2 ${c.form.action} :( - ${err}`);
        }
        if (token) {
          if ('unsafeWindow' in window) window.unsafeWindow.booru.csrfToken = token;
          if (window.booru) window.booru.csrfToken = token;
          if (document.querySelector('meta[name="csrf-token"]')) document.querySelector('meta[name="csrf-token"]').content = token;
          if (c && token2) c.value = token2;
          if (e) {
            prevented = true;
            e.target.click();
            setTimeout(() => { prevented = false; }, 30000);
          }
        }
      };

      const readyHandler = function(request) {
        return function() {
          if (request.readyState === 4) {
            if (request.status === 200) { return onComplete(request); }
            return false;
          }
        };
      };

      const req = new XMLHttpRequest();
      req.onreadystatechange = readyHandler(req);
      req.open('GET', location.href);
      req.send();
    };
    update();
  }

  if (!document.querySelector('meta[name="csrf-ydb-tweak"]')) {
    const x = document.createElement('meta');
    x.name = 'csrf-ydb-tweak';
    document.head.appendChild(x);
    document.body.addEventListener('click', e => {
      if (prevented) return;
      const check = function(elem) {
        if (
          ((elem.tagName === 'INPUT' || elem.tagName === 'BUTTON') && elem.type === 'submit' && elem.title.toLowerCase() !== 'search')
                ||
          ((elem.tagName === 'A') && elem.href.endsWith('#') && !(Boolean(elem.dataset) && (elem.dataset.clickTab === 'write')))
        ) {
          preventWrongCSRF(e, elem.form ? elem.form.authenticity_token : null);
        }
        if (elem.tagName !== 'BODY') check(elem.parentNode);
      };
      check(e.target);
    });
    setTimeout(() => { prevented = false; }, 30000);
    // setInterval(preventWrongCSRF, 60000);
  }
}());
