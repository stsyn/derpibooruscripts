// updates CSRF token to avoid site fails because of some scripts requests

let updateCSRF = function() {};
(function() {
  let prevented = true;
  let specific = {_all:true};
  function preventWrongCSRF(e, c) {
    if (e && !e.custom) {
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
          if (e && !e.custom) {
            prevented = true;
			if (c) specific[c.form.action] = true;
            e.target.click();
            setTimeout(() => { prevented = false; specific[c.form.action] = false}, 30000);
          }
          else if (e.custom) {
            prevented = true;
            setTimeout(() => {prevented = false;}, 30000);
            e.callback();
          };
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
    setTimeout(() => {
        document.body.addEventListener('click', e => {
        if (prevented && !(e.target.form && e.target.form.authenticity_token && !(specific[e.target.form.action] || specific._all) )) return;
        const check = function(elem) {
          if (
            ((elem.tagName === 'INPUT' || elem.tagName === 'BUTTON') && elem.type === 'submit' && elem.title.toLowerCase() !== 'search')
                ||
            ((elem.tagName === 'A') && elem.href.endsWith('#') && !(Boolean(elem.dataset) && (elem.dataset.clickTab === 'write' || elem.className.indexOf('interaction') > -1)))
          ) {
            preventWrongCSRF(e, elem.form ? elem.form.authenticity_token : null);
          }
          if (elem.tagName !== 'BODY') check(elem.parentNode);
        };
        check(e.target);
      });
    }, 15000);
    setTimeout(() => {
        prevented = false;
        specific._all = false;
    }, 30000);
    // setInterval(preventWrongCSRF, 60000);
  }

  updateCSRF = function(callback) {
    if (prevented) callback();
    else preventWrongCSRF({custom:true, callback})
  };
}());
