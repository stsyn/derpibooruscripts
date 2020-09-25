var YDB_api = YDB_api || {};

(function() {
  const perPage = 50;
  async function* longSearchIterator(query, params) {
    let notEmpty = true;
    let stopPoint = -1;
    while (notEmpty) {
      let limiter = '';
      if (stopPoint !== -1) {
        limiter = `id.lte:${stopPoint},`;
      }
      const data = await YDB_api.searchImages(limiter+query, params);
      if (data.images.length > 0) stopPoint = data.images[data.images.length-1].id;
      if (data.images.length < perPage) notEmpty = false;
      yield data;
    }
  }

  YDB_api.performLongSearch = async function (query, params = {}) {
    params.sd = '';
    params.sf = '';
    const data = {images: [], interactions: []};
    const iterator = longSearchIterator(query, params)
    for await (let content of iterator) {
      data.images = data.images.concat(content.images);
      data.interactions = data.interactions.concat(content.interactions);
      data.total = content.total;
    }
    return data;
  }

  YDB_api.longSearch = function (query, params = {}) {
    params.sd = '';
    params.sf = '';
    return longSearchIterator(query, params);
  }

  YDB_api.searchImages = async function (query, params = {}) {
    let url = `api/v1/json/search/images?q=${encodeURIComponent(query)}&per_page=${perPage}`;
    if (params.del) url += '&del='+params.del;
    if (params.sf) url += '&sf='+params.sf;
    if (params.sd) url += '&sd='+params.sd;
    if (params.page) url += '&page='+params.page;
    if (params.key) url += '&key='+params.key;
    const response = await fetch(url, {method:'GET'});
    if (!response.ok) {
      console.error(response);
      throw new Error('Error during request');
    }
    const content = await response.json();
    return content;
  }
}());
