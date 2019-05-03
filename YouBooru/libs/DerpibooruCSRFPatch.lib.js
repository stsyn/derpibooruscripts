// updates CSRF token to avoid site fails because of some scripts requests

(function() {
let prevented = false;
function preventWrongCSRF(e, c) {
    e.preventDefault();
    e.stopPropagation();
    let token, token2, token2Container;
    let update = function() {

        let onComplete = function (r) {
            let t = r.responseText;
            try {
                token = t.match(/<meta name="csrf-token" content="([A-Za-z0-9+=\/]*)" \/>/)[1];
                if (c) {
                    token2Container = document.createElement('div');
                    token2Container.innerHTML = t.match(/<body [A-Za-z0-9=\- "]*>([\s\S]*)<\/body>/)[1];
                    token2 = token2Container.querySelector('form[action="'+c.form.action.replace(location.origin, '')+'"]').authenticity_token.value;
                }
            }
            catch (e) {
                if (!token) console.log('No token :( — '+e);
                else if (!token2) console.log('No token2 '+c.form.action+' :( — '+e);
            }
            if (token) {
                try {unsafeWindow.booru.csrfToken = token;} catch(e) {};
                if (window.booru) window.booru.csrfToken = token;
                if (document.querySelector('meta[name="csrf-token"]')) document.querySelector('meta[name="csrf-token"]').content = token;
                if (c && token2) c.value = token2;
                prevented = true;
                e.target.click();
                setTimeout(function() {prevented = false;}, 15000);
            }
        }

        let readyHandler = function(request) {
            return function () {
                if (request.readyState === 4) {
                    if (request.status === 200) return onComplete(request);
                    else if (request.status === 0) {
                        return false;
                    }
                    else {
                        return false;
                    }
                }
            };
        };

        let req = new XMLHttpRequest();
        req.onreadystatechange = readyHandler(req);
        req.open('GET', location.href);
        req.send();
    };
    update();
}

if (!document.querySelector('meta[name="csrf-ydb-tweak"]')) {
    let x = document.createElement('meta');
    x.name = "csrf-ydb-tweak";
    document.head.appendChild(x);
    document.body.addEventListener('click', function (e) {
        if (prevented) return;
        let check = function(elem) {
            if ((elem.tagName == 'INPUT' || elem.tagName == 'BUTTON') && elem.type == 'submit' && elem.title.toLowerCase() != 'search') {
                preventWrongCSRF(e, elem.form.authenticity_token);
            }
            if (!elem.tagName == 'BODY') check(elem.parentNode);
        }
        check(e.target);
    });
}
})();
