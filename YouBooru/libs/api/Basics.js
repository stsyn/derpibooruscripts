var YDB_api = YDB_api || {};
var createElement = createElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var wrapElement = wrapElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var clearElement = clearElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var fillElement = fillElement || (() => {throw '"// @require https://github.com/stsyn/createElement/raw/master/min/es5.js" broken'});
var unsafeWindow = unsafeWindow || undefined;

(function() {
  YDB_api.instance = Math.random();

  function wait(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }

  function waitFor(condition) {
    return new Promise(resolve => {
      const checker = function() {
        if (!condition()) setTimeout(checker, 20);
        else resolve();
      };
      setTimeout(checker, 20);
    });
  }

  YDB_api.booru = async function() {
    await waitFor(() => unsafeWindow.booru);
    return unsafeWindow.booru;
  }

  YDB_api.getEnviroment = function() {
    const elem = document.querySelector('#serving_info');
    if (elem && elem.innerText) {
      if (elem.innerText.toLowerCase().indexOf('philomena') > -1) return 'philomena';
      if (elem.innerText.toLowerCase().indexOf('booru-on-rails') > -1) return 'bor';
    }
    return 'unknown';
  }

  function buildFormData(formData, data, parentKey) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data).forEach(key => {
        buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      const value = data == null ? '' : data;

      formData.append(parentKey, value);
    }
  }

  YDB_api.fetchPage = async function(verb, path, body, useFormData) {
    if (!path.startsWith('https://' + location.hostname)) path = 'https://' + location.hostname + path;

    const data = {
      method: verb,
      credentials: 'same-origin',
      headers: {
        'Upgrade-Insecure-Requests': 1,
      }
    };

    if (body) {
      body._method = verb;
      data.body = JSON.stringify(body);
    }

    if (useFormData) {
      const formData = new FormData();
      for (let i in body) {
        buildFormData(formData, body[i], i);
      }
      data.body = formData;
    }

    return await fetch(path, data);
  }

  YDB_api.fetchGetJson = async function(method, requestParams, endpoint = '/api/v1/json/') {
    const path = 'https://' + location.hostname + endpoint + method;

    let stringified = requestParams;
    if (typeof requestParams === 'object') {
      stringified = Object.entries(requestParams).map(v => `${v[0]}=${encodeURIComponent(v[1])}`).join('&');
    }

    return await (await fetch(path + '?' + stringified)).json();
  }


  {
    YDB_api.storage = YDB_api.storage || {};
    const lsKey = 'YDB_API';

    function readLocalStorage() {
      return JSON.parse(localStorage[lsKey] || '{}');
    }

    /* if timeout specified, will wait for specific amount of time until not undefined will be received */
    YDB_api.storage.readFromLocalStorage = async function(keys, timeout = 0) {
      if (typeof keys === 'string') {
        return (await YDB_api.storage.readFromLocalStorage([keys], timeout))[keys];
      }

      function read() {
        const data = readLocalStorage();
        const output = {};
        for (let key of keys) {
          if (!data[key] && timeout) return false;
          output[key] = data[key];
        }
        return output;
      }

      let data, endTime = Date.now() + (timeout || 60000);
      while (!(data = read()) && Date.now() < endTime) {
        wait(200);
      }

      if (!data) throw new Error('No data found');
      return data;
    }

    /* updates only specified part of API localStorage. 3rd party usage discouraged */
    YDB_api.storage.updateLocalStorage = function(data) {
      localStorage[lsKey] = JSON.stringify(readLocalStorage(), data);
    }

    const settingsLsKey = 'site-settings';
    const settingsLifeTime = 1000 * 60 * 60;
    const blacklistedOptions = ['user[subscribe_url]'];
    async function fetchSettings() {
      const html = await (await YDB_api.fetchPage('GET', '/settings/edit')).text();
      const element = createElement('form', { innerHTML: html.match(/<form action="\/settings" .*?>([\s\S]*?)<\/form>/i)[1] });
      const items = [];
      const settings = {};
      for (let i in element.elements) {
        if (i.startsWith('user[') && !blacklistedOptions.includes(i)) items.push(i);
      }
      items.forEach(i => {
        const elem = element.elements;
        if (elem.type === 'checkbox') settings[i] = elem.checked;
        else settings[i] = elem.value;
      });
      settings.loggedIn = settings['user[watched_tag_list]'] === undefined;
      return settings;
    }

    /* tries to read user settings */
    YDB_api.storage.getSettings = async function() {
      const oldCache = await YDB_api.storage.readFromLocalStorage(settingsLsKey);
      if (oldCache && oldCache.until > Date.now()) {
        return oldCache.data;
      }

      if (await YDB_api.queue.reserve('fetchSettings')) {
        const data = await fetchSettings();

        await YDB_api.storage.updateLocalStorage({[settingsLsKey]: {
          until: Date.now() + settingsLifeTime,
          data,
        }});

        await YDB_api.queue.release('fetchSettings');
        return data;
      }

      return (await YDB_api.storage.readFromLocalStorage(settingsLsKey, 10000))?.data;
    }
  }



  {
    YDB_api.queue = YDB_api.queue || {};
    const lsKey = 'queue';

    /* marks specified label as busy for specified time, returns true if it was free */
    YDB_api.queue.reserve = async function(label, time = 5000) {
      const currentData = await YDB_api.storage.readFromLocalStorage(lsKey) || {};
      const currentValue = currentData[label];

      if (currentValue) {
        if (Date.now() < currentValue.until) return false;
      }

      currentData[label] = {
        instance: YDB_api.instance,
        until: Date.now() + time,
      }

      YDB_api.storage.updateLocalStorage({ [lsKey]: currentData });
      return true;
    }

    /* marks specified label as free */
    YDB_api.queue.release = async function(label) {
      const currentData = await YDB_api.storage.readFromLocalStorage(lsKey) || {};
      delete currentData[label];
      YDB_api.storage.updateLocalStorage({ [lsKey]: currentData });
    }
  }


  {
    YDB_api.pages = YDB_api.pages || {};

    const pages = new Map();
    YDB_api.pages.add = function(key, renderer) {
      if (pages.get(key)) throw new Error(`Page ${key} already defined.`);

      pages.set(key, renderer);

      if (location.pathname == '/pages/api') {
        if (!location.search) return;
        else if (location.search == '?') return;

        const target = location.search.slice(1);
        const urlData = target.split('?');

        if (urlData[0] === key) {
          let temp;
          if (temp = document.querySelector('#content>p')) document.getElementById('content').removeChild(temp);
          if (temp = document.querySelector('#content>a')) document.getElementById('content').removeChild(temp);
          const renderPosition = document.querySelector('#content .walloftext');
          clearElement(renderPosition);

          const parameters = urlData[1] ? new Map(urlData[1].split('&').map(part => part.split('=').map(v => decodeURIComponent(v)))) : new Map();;
          fillElement(renderPosition, renderer(parameters));
        }

      }
    }

    YDB_api.pages.get = function(key) {
      return pages.get(key);
    }
  }
})();
