var YDB_api = YDB_api || {};

(function() {
  function __tagToSlug(tag) {
    return escape(tag.replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-').replace(/\//g,'-fwslash-'));
  }

  function __slugToTag(tag) {
    return unescape(tag.replace(/\-dash\-/g,'-').replace(/\-dot\-/g,'.').replace(/\+/g,' ').replace(/\-colon\-/g,':').replace(/\-fwslash\-/g,'/'));
  }

  function __getEnviroment() {
    const elem = document.querySelector('#serving_info');
    if (elem && elem.innerText) {
      if (elem.innerText.toLowerCase().indexOf('philomena') > -1) return 'philomena';
      if (elem.innerText.toLowerCase().indexOf('booru-on-rails') > -1) return 'bor';
    }
    return 'unknown';
  }

  function getCommonTagFields(tag) {
    return {
      category: tag.category,
      description: tag.description,
      id: tag.id,
      images: tag.images,
      name: tag.name,
      name_in_namespace: tag.name_in_namespace || tag.name,
      namespace: tag.namespace,
      short_description: tag.short_description,
      slug: tag.slug,
      spoiler_image_uri: tag.spoiler_image_uri
    }
  }

  YDB_api.fetchManyTagsByName = async function(tagNames) {
    const enviroment = __getEnviroment();
    let url;
    if (enviroment === 'philomena') {
      // for philomena use tag search ability
      // slug:* atm looks too clumsy for real usage
      // url = '/api/v1/json/search/tags?q=slug:' + tagNames.map(tag => encodeURIComponent(__tagToSlug(tag))).join("+OR+slug:");
      url = '/api/v1/json/search/tags?q=name:' + tagNames.join("+OR+name:");
    } else if (enviroment === 'bor') {
      // for bor use tag batch fetch
      url = '/api/v2/tags/fetch_many.json?name[]=' + tagNames.join("&name[]=");
    } else {
      throw new Error('Unsupported enviroment: ' + enviroment);
    }

    const response = await fetch(url, {method:'GET'});
    if (!response.ok) {
      console.error(response);
      throw new Error('Error during request');
    }
    const content = await response.json();

    if (enviroment === 'philomena') {
      content.tags = content.tags.map(tag => {
        let newTag = getCommonTagFields(tag);
        newTag.aliases = tag.aliases.map(__slugToTag);
        newTag.aliased_tag = __slugToTag(tag.aliased_tag || '');
        newTag.implied_tags = tag.implied_tags.map(__slugToTag);
        return newTag;
      });
    }

    if (enviroment === 'bor') {
      content.tags = content.tags.map(tag => {
        let newTag = getCommonTagFields(tag);
        newTag.aliases = [];
        newTag.aliased_tag = tag.aliased_to;
        newTag.implied_tags = tag.implied_tags;
        return newTag;
      });
    }

    const result = {};

    tagNames.forEach(name => {
      result[name] = content.tags.find(tag => tag.name === name);
    });

    const secondPass = content.tags.filter(tag => tag.aliased_tag);
    if (secondPass.length > 0) {
      const secondResult = await YDB_api.fetchManyTagsByName(secondPass.map(tag => tag.aliased_tag));
      secondPass.forEach(tag => {
        result[tag.name] = secondResult[tag.aliased_tag];
      });
    }
    return result;
  }
})();
