let prevented = false;
function preventWrongCSRF(e, c) {
    e.preventDefault();
    e.stopPropagation();
    let token, token2;
    let update = function() {
        fetch('/images/new')
        .then(function(response) {
            return response.text();
        })
        .then(function(t) {
            try {
                token = t.match(/<meta name="csrf-token" content="([A-Za-z0-9+=\/]*)" \/>/)[1];
                if (c) token2 = t.match(/<input type="hidden" name="authenticity_token" value="([A-Za-z0-9+=\/]*)" \/>/)[1];
            }
            catch (e) {
                console.log('No token :( — '+e);
            }
            if (token) {
                if (unsafeWindow) unsafeWindow.booru.csrfToken = token;
                if (window.booru) window.booru.csrfToken = token;
                if (document.querySelector('meta[name="csrf-token"]')) document.querySelector('meta[name="csrf-token"]').content = token;
                //if (c && token2) c.value = token2;
                prevented = true;
                e.target.click();
                setTimeout(function() {prevented = false;}, 1000);
            }
        });
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
            if ((elem.tagName == 'INPUT' || elem.tagName == 'BUTTON') && elem.type == 'submit') {
                preventWrongCSRF(e, e.target.form.authenticity_token);
            }
            if (!elem.tagName == 'BODY') check(elem.parentNode);
        }
        check(e.target);
    });
}
