function addElem(tag, values, parent) {
  var t = InfernoAddElem(tag, values, []);
  parent.appendChild(t);
  return t;
}

function ChildsAddElem(tag, values,parent, childs) {
  var t = InfernoAddElem(tag, values, childs);
  parent.appendChild(t);
  return t;
}

function InfernoAddElem(tag, values, childs) {
  var t;
    if (typeof values == 'undefined') values = {};
    if (typeof values == 'string') values = {innerHTML:values};
    if (typeof childs == 'undefined' && Array.isArray(values)) {
        childs = values;
        values = {};
    }
  if (values != undefined && values.id != undefined && document.getElementById(values.id) != undefined) {
    if (document.querySelectorAll(tag+'#'+values.id).length == 0) {
      t = document.getElementById(values.id);
      t.parentNode.removeChild(t);
      t = document.createElement(tag);
    }
    else {
      t = document.getElementById(values.id);
      while (t.firstChild) {t.removeChild(t.firstChild);}
    }
  }
  else t = document.createElement(tag);

  for (let i in values) if (i!='events' && i!='dataset' && i!='innerHTML' && i!='checked' && i!='disabled' && i!='value' && i!='selected' && i!='className' && !(i=='style' && typeof values.style=='object')) t.setAttribute(i,values[i]);
  if (values.dataset !== undefined) for (let i in values.dataset) t.dataset[i] = values.dataset[i];
  if (values.className !== undefined) t.className = values.className;
  if (values.innerHTML !== undefined) t.innerHTML = values.innerHTML;
  if (values.value !== undefined) t.value = values.value;
  if (values.checked !== undefined) t.checked = values.checked;
  if (values.selected !== undefined) t.selected = values.selected;
  if (values.disabled !== undefined) t.disabled = values.disabled;
  if (values.events !== undefined) {
    if (Array.isArray(values.events)) values.events.forEach(function(v,i,a) {t.addEventListener(v.t, v.f);});
    else for (let i in values.events) t.addEventListener(i, values.events[i]);
  }
  if (typeof values.style == 'object') for (let i in values.style) t.style[i] = values.style[i];

  if (childs && childs.length != undefined) childs.forEach(function(c,i,a) {t.appendChild(c.parentNode == null?c:c.cloneNode(true));});
  return t;
}


function parseURL(url) {
  let a = document.createElement('a');
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
        len = seg.length, i = 0, s;
      for (;i<len;i++) {
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
  if (!endpoint.startsWith('https://'+location.hostname)) endpoint = 'https://'+location.hostname+endpoint;
  const data = {
    method: verb,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': ((unsafeWindow || window).booru && (unsafeWindow || window).booru.csrfToken) || '',
    },
  };

  if (body) {
    body._method = verb;
    data.body = JSON.stringify(body);
  }

  return fetch(endpoint, data).then(response => response.json());
}
