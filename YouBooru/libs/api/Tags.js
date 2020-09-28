// api/Basics.js needed
var YDB_api = YDB_api || {};

(function() {
  YDB_api.tagToSlug = function(tag) {
    return escape(tag.replace(/\-/g,'-dash-').replace(/\./g,'-dot-').replace(/ /g,'+').replace(/\:/g,'-colon-').replace(/\//g,'-fwslash-'));
  }

  YDB_api.slugToTag = function(tag) {
    return unescape(tag.replace(/\-dash\-/g,'-').replace(/\-dot\-/g,'.').replace(/\+/g,' ').replace(/\-colon\-/g,':').replace(/\-fwslash\-/g,'/'));
  }

  function __unique(item, index, array) {
    return index === array.indexOf(item);
  }

  function __get(cache, item) {
    if (!cache) return null;
    if (cache instanceof Map) return cache.get(item);
    return cache[item];
  }

  function __set(cache, name, item) {
    if (!cache) return null;
    if (cache instanceof Map) return cache.set(name, item);
    return cache[name] = item;
  }


  function getCommonTagFields(tag) {
    return {
      category: tag.category,
      description: tag.description,
      empty: false,
      id: tag.id,
      images: tag.images,
      name: tag.name,
      name_in_namespace: tag.name_in_namespace || tag.name,
      namespace: tag.namespace,
      short_description: tag.short_description,
      slug: tag.slug,
      spoiler_image_uri: tag.spoiler_image_uri,
      synonyms: []
    }
  }

  function emptyTag(tag) {
    return {
      aliases: [],
      aliased_tag: '',
      category: '',
      description: '',
      dnp_entries: [],
      empty: true,
      id: -1,
      images: -1,
      implied_tags: [],
      name: tag,
      name_in_namespace: '',
      short_description: '',
      slug: '',
      spoiler_image_uri: '',
      synonyms: []
    }
  }

  YDB_api.makeTagObject = function(tagName) {
    const tag = emptyTag(tagName);
    tag.empty = false;
    return tag;
  }

  async function fetchTagPage(tagNames, options, cache) {
    const enviroment = YDB_api.getEnviroment();

    let url;
    if (enviroment === 'philomena') {
      // for philomena use tag search ability
      url = `/api/v1/json/search/tags?per_page=50&q=${options.selector}:` + tagNames.join(`+OR+${options.selector}:`);
    } else if (enviroment === 'bor') {
      // for bor use tag batch fetch
      const selector = options.selector === 'id' ? 'ids' : options.selector;
      url = `/api/v2/tags/fetch_many.json?${selector}[]=` + tagNames.join(`&${selector}[]=`);
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
        newTag.dnp_entries = tag.dnp_entries.filter(dnp => !!dnp).map(dnp => {
          return {
            dnp_type: dnp.dnp_type || 'Unknown',
            conditions: dnp.conditions || 'Unknown',
            reason: dnp.reason || 'byte[], fix philomena plz',
          }
        });
        newTag.aliases = tag.aliases.map(YDB_api.slugToTag);
        newTag.aliased_tag = YDB_api.slugToTag(tag.aliased_tag || '');
        newTag.implied_tags = tag.implied_tags.map(YDB_api.slugToTag);
        return newTag;
      });
    }

    if (enviroment === 'bor') {
      content.tags = content.tags.map(tag => {
        let newTag = getCommonTagFields(tag);
        newTag.dnp_entries = [];
        newTag.aliases = [];
        newTag.aliased_tag = tag.aliased_to;
        newTag.implied_tags = tag.implied_tags;
        return newTag;
      });
    }

    const result = {};

    tagNames.forEach(name => {
      const found = content.tags.find(tag => tag.name === name) || emptyTag(name)
      result[name] = found;
      __set(cache, name, found);
    });

    const secondPass = content.tags.filter(tag => tag.aliased_tag && !__get(cache, tag.aliased_tag));
    if (secondPass.length > 0 && !options.dontFollowAliases) {
      const secondResult = await YDB_api.fetchManyTagsByName(secondPass.map(tag => tag.aliased_tag), {}, cache);
      secondPass.forEach(tag => {
        result[options.separateAliases ? tag.aliased_tag : tag.name] = secondResult[tag.aliased_tag];
        __set(cache, tag.aliased_tag, secondResult[tag.aliased_tag]);
      });
    }
    return result;
  }

  YDB_api.fetchTagByName = async function(tagName) {
    return await YDB_api.fetchTagBySlug(YDB_api.tagToSlug(tagName));
  }

  YDB_api.fetchTagBySlug = async function(tagSlug) {
    // todo
  }

  async function fetchManyTags(tags, options, cache) {
    if (options.resolveSynonims === undefined) options.resolveSynonims = false;
    if (options.alwaysLoadAliases === undefined) options.alwaysLoadAliases = false;
    if (options.alwaysLoadDnp === undefined) options.alwaysLoadDnp = false;
    if (options.separateAliases === undefined) options.separateAliases = false;
    if (options.dontFollowAliases === undefined) options.dontFollowAliases = false;

    const enviroment = YDB_api.getEnviroment();

    const maxTagsPerPage = 50;
    const result = {};
    const parts = tags.reduce((acc, tag, index) => {
      const page = Math.ceil(index / maxTagsPerPage);
      if (!acc[page]) acc[page] = [];
      acc[page].push(tag);
      return acc;
    }, []);
    for (let part of parts) {
      const fetched = await fetchTagPage(part, options, cache);
      for (let tag in fetched) {
        result[tag] = fetched[tag];
      }
    }

    if (options.resolveSynonims) {
      const tagsToLook = Object.values(result).filter(tag => !tag.empty).map(tag => tag.implied_tags).flat().filter(__unique).filter(tag => !result[tag] && !__get(cache, tag));
      const details = await YDB_api.fetchManyTagsByName(tagsToLook, {}, cache);
      Object.values(details).forEach(tag => {
        tag.implied_tags.forEach(implied => {
          const impliedTag = result[implied];
          if (impliedTag && impliedTag.implied_tags.includes(tag.name)) {
            impliedTag.synonyms.push(tag.name);
          }
        });
      });
    }
    if (options.alwaysLoadAliases && enviroment === 'bor') {
      const tagsToLook = Object.values(result).filter(tag => !tag.empty).map(tag => tag.name);
      const details = [];
      for (let tagName of tagsToLook) {
        details.push(await YDB_api.fetchTagByName(tagName, {}, cache));
      }
    }
    return result;
  }

  YDB_api.fetchManyTagsByName = async function(tagNames, options = {}, cache) {
    options.selector = 'name';
    return await fetchManyTags(tagNames, options, cache);
  }

  YDB_api.fetchManyTagsById = async function(tagNames, options = {}, cache) {
    options.selector = 'id';
    return await fetchManyTags(tagNames, options, cache);
  }
})();
