var YDB_api = YDB_api || {};
(function() {
  YDB_api.getEnviroment = function () {
    const elem = document.querySelector('#serving_info');
    if (elem && elem.innerText) {
      if (elem.innerText.toLowerCase().indexOf('philomena') > -1) return 'philomena';
      if (elem.innerText.toLowerCase().indexOf('booru-on-rails') > -1) return 'bor';
    }
    return 'unknown';
  }
})();
