/*
 * Tag rulesets interpretator
 */
var YDB_api = YDB_api || {};
(function() {
  const rulesetVersionField = '[{[version]}]';
  const rulesetCategoriesField = '[{[categories]}]';
  function __unique(item, index, array) {
    return index === array.indexOf(item);
  }

  function __flatSets(array) {
    let result = new Set;
    for (const set of array) {
      for (const element of set) {
        result.add(element);
      }
    }
    return result;
  }

  ////// - rules be like
  //// selectors
  // safe            — tag
  // _origin         — category
  // twilight*
  // princess *a
  // *sparkle        — wildcard (only 1 * supported)
  // *               — any tag
  // __              — no tag
  // >female         — matches all tags which imply this tag and this tag as well, won't search in aliases (version 0.1+)
  // >oc:*           — wildcards can be used in implications (version 0.1+)
  // /-sparkle       — escape logical operators on tag — will match "-sparkle", won't escape * (version 0.1+)
  // __sexual        — use custom category (version 1.1)

  //// subcases
  // *sparkle[>1]
  // _character[>1]  — can also be [x][<x]

  //// listings
  // pegasus,unicorn — listing
  // _species,!pony  — exclusion
  // artist:*[>1],idw[[1]] — use [[]] for count cases for listings

  //// logics
  // -pony           — negate (NOT) — do not have tag
  // solo+female     — combine (AND)
  // ^solo+female    — global NOT (NAND)
  // OR is not supported and will never be, dupe actions rows if needed+

  //// custom categories (version 1.1+)
  // Should be defined in [{[categories]}] field as integred object. Syntax is the same, as for rules:
  // '[{[categories]}]': {
  //   'sexual': 'suggestive,questionable,explicit',
  // },
  // Custom categories are prohibitted inside custom categories rules. ^ untested.

  ////// - actions be like
  //// adding
  // safe            — adds

  //// removal
  // -safe           — remove tag
  // -[x]            — remove tags from x + match
  // -               — remove whole match

  //// part of tag removals
  // ? (mlp)
  // ? (mlp)[x]      — removes part

  //// part of tag addings
  // %* (mlp)
  // %solo *
  // %* (mlp)[x]     — appends part to every tag

  //// returns error
  // ^error text

  //// logics
  // party+pinkie pie — combine actions (AND)

  //// Actions order is global for whole ruleset iteration:
  // 1. Tag removals;
  // 2. Part of tag removals;
  // 3. Part of tag addings;
  // 4. Tag addings.

  YDB_api.applyRulesetOnTags = function(ruleset, tagArray, dontApply) {
    const version = 1;
    if (ruleset[rulesetVersionField] && parseInt(ruleset[rulesetVersionField].split('.')[1]) > version) {
      throw new Error('Unsupported ruleset version, x.' + version + ' at most!');
    }
    let customCategories = {};
    const tagsToRemove = new Set();
    const tagsToAdd = new Set();
    const renamesDeletions = {};
    const renamesAdditions = {};
    const errors = [];

    function getMatchingTags(rule, tagArray) {
      rule = rule.trim();
      function checkTag(rulePart) {
        rulePart = rulePart.trim();
        if (rulePart === '__') return [];
        if (rulePart === '*') return tagArray;

        // category
        if (rulePart.startsWith('_')) {
          const rule = rulePart.match(/_([^\[\]]*)\s*(\[.?\d+]|)/)[1];
          if (rule.startsWith('_')) {
            const category = customCategories[rule.substring(1)];
            if (category) {
              return checkCondition(rulePart, category);
            }
            throw new Error('Category "' + rule.substring(1) + '" is not defined!');
          }
          const match = tagArray.filter(tag => tag.category === rule);
          return checkCondition(rulePart, match);
        }
        // implication
        if (rulePart.startsWith('>')) {
          const rule = rulePart.match(/>([^\[\]]*)\s*(\[.?\d+]|)/)[1];
          // wildcard
          if (rulePart.indexOf('*') > -1) {
            const parts = rule.split('*');
            const match = tagArray.filter(tag => {
              return (tag.name.startsWith(parts[0]) && tag.name.endsWith(parts[1])) || tag.implied_tags.find(t => t.startsWith(parts[0]) && t.endsWith(parts[1]))
            })
            return checkCondition(rulePart, match);
          }
          const match = tagArray.filter(tag => tag.implied_tags.includes(rule) || tag.name === rule);
          return checkCondition(rulePart, match);
        }
        // wildcard
        if (rulePart.indexOf('*') > -1) {
          const rule = rulePart.match(/([^\[\]]*)\s*(\[.?\d+]|)/)[1];
          const parts = rule.split('*');
          const match = tagArray.filter(tag => (tag.name.startsWith(parts[0]) && tag.name.endsWith(parts[1])) || tag.aliases.find(t => t.startsWith(parts[0]) && t.endsWith(parts[1])))
          return checkCondition(rulePart, match);
        }
        // strict
        const name = rulePart.startsWith('/') ? rulePart.substring(1) : rulePart;
        const match = tagArray.filter(tag => tag.name === name || tag.aliases.find(t => t === name));
        return checkCondition(name, match);
      }

      function resolveDupes(match) {
        const dupes = [];
        let newMatch = [].concat(match);
        match.forEach(m => {
          m.synonyms.forEach(synonym => {
            dupes.push([m.name, synonym]);
            dupes.push([synonym, m.name]);
          })
        });
        dupes.forEach(dupe => {
          const firstIndex = newMatch.findIndex(m => m.name === dupe[0]);
          const secondIndex = newMatch.findIndex(m => m.name === dupe[1]);
          if (firstIndex > -1 && secondIndex > -1) {
            newMatch = newMatch.splice(secondIndex, 1);
          }
        });
        return newMatch;
      }

      function checkCondition(rule, match) {
        const condition = rule.match(/\[(.?)(\d+)]/);
        const newMatch = resolveDupes(match);
        if (condition) {
          const value = parseInt(condition[2]);
          switch (condition[1]) {
            case '>': return (newMatch.length > value) ? match : [];
            case '<': return (newMatch.length < value) ? match : [];
            case '': return (newMatch.length === value) ? match : [];
          }
        }
        return match;
      }

      function checkConditionGlobal(rule, match) {
        const condition = rule.match(/\[\[(.?)(\d+)]]/);
        const newMatch = resolveDupes(match);
        if (condition) {
          const value = parseInt(condition[2]);
          switch (condition[1]) {
            case '>': return (newMatch.length > value) ? match : [];
            case '<': return (newMatch.length < value) ? match : [];
            case '': return (newMatch.length === value) ? match : [];
          }
        }
        return match;
      }

      rule = rule.replace(/\[\[plus]]/g, '+');
      if (rule.indexOf(',') > -1) {
        const rules = rule.match(/([^\[\]]*)\s*(\[\[.?\d+]]|)/)[1].split(',');
        const matched = rules.filter(rule => !rule.startsWith('!')).map(checkTag).flat().filter(__unique);
        const notMatched = rules.filter(rule => rule.startsWith('!')).map(rule => checkTag(rule.substring(1))).flat();
        const match = matched.filter(tag => !notMatched.includes(tag));
        return checkConditionGlobal(rule, match);
      } else {
        return checkTag(rule);
      }
    }

    function applyTagRule(action, tags, rules) {
      action = action.trim();
      action = action.replace(/\[\[plus]]/g, '+');
      // removals
      if (action.startsWith('-')) {
        action = action.substring(1);
        const linked = action.match(/^\[(\d+)]$/);

        if (linked) {
          const t = tags[parseInt(linked[1]) - 1];
          if (t) {
            t.forEach(tag => tagsToRemove.add(tag.name));
          }
        } else if (action.length > 0) {
          tagsToRemove.add(action);
        } else {
          tags.flat().forEach(tag => tagsToRemove.add(tag.name));
        }
      }
      // wildcard deletions
      else if (action.startsWith('?')) {
        const match = action.match(/\?(.*)\s*(\[(\d+)]|)/);
        if (match[3]) {
          const t = tags[parseInt(match[3]) - 1];
          if (t) {
            t.forEach(tagName => {
              renamesDeletions[tagName.name] = renamesDeletions[tagName.name] || [];
              renamesDeletions[tagName.name].push(tag => tag.replace(match[1], ''))
            });
          }
        } else {
          tags.forEach(tagList => {
            tagList.forEach(tagName => {
              renamesDeletions[tagName.name] = renamesDeletions[tagName.name] || [];
              renamesDeletions[tagName.name].push(tag => tag.replace(match[1], ''))
            });
          });
        }
      }
      // wildcard additions
      else if (action.startsWith('%')) {
        const beginning = action.startsWith('%*');
        const match = action.match(/%(\*|)(.*)(\*|)\s*(\[(\d+)]|)/);
        if (match[5]) {
          const t = tags[parseInt(match[5]) - 1];
          if (t) {
            t.forEach(tagName => {
              renamesAdditions[tagName.name] = renamesAdditions[tagName.name] || [];
              renamesAdditions[tagName.name].push(!beginning ? tag => match[2] + tag : tag => tag + match[2]);
            });
          }
        } else {
          tags.forEach(tagList => {
            tagList.forEach(tagName => {
              renamesAdditions[tagName.name] = renamesAdditions[tagName.name] || [];
              renamesAdditions[tagName.name].push(!beginning ? tag => match[2] + tag : tag => tag + match[2]);
            });
          });
        }
      }
      // errors
      else if (action.startsWith('^')) {
        errors.push(action.substring(1));
      }
      // additions
      else {
        tagsToAdd.add(action);
      }
    }

    function runRules(tags) {
      tags = tags.filter(tag => !tagsToRemove.has(tag));
      tags = tags.map(tag => {
        let tx = tag;
        if (renamesDeletions[tx]) {
          tag = renamesDeletions[tx].reduce((t, f) => f(t), tag);
        }
        if (renamesAdditions[tx]) {
          tag = renamesAdditions[tx].reduce((t, f) => f(t), tag);
        }
        return tag;
      });
      return tags.concat(Array.from(tagsToAdd.values())).filter((tag, index, tags) => index === tags.indexOf(tag));
    }

    function handleRule(originRule) {
      let rule;
      // first letter - prefix
      const negate = originRule.startsWith('^');
      if (negate) {
        rule = originRule.substring(1);
      } else {
        rule = originRule;
      }
      rule = rule.replace(/\\\+/g, '[[plus]]');
      const ruleTags = rule.split('+');
      const requiredTags = ruleTags.map(tag => tag.startsWith('-') ? '*' : tag);
      const bannedTags = ruleTags.map(tag => tag.startsWith('-') ? tag.substring(1) : '__');

      const foundMatchedTags = requiredTags.map(rule => getMatchingTags(rule, tagArray));
      const foundBannedTags = bannedTags.map(rule => getMatchingTags(rule, tagArray));

      const foundNeeded = foundMatchedTags.filter(tags => tags.length > 0).length === requiredTags.length;
      const dontHaveBanned = foundBannedTags.filter(tags => tags.length > 0).length === 0;
      if ((foundNeeded && dontHaveBanned) ^ negate) {
        return {matched: foundMatchedTags.map((tags, index) => tags.length > 0 ? tags : foundBannedTags[index]), rules: ruleTags};
      }
      return {matched: [], rules: ruleTags};
    }

    if (ruleset[rulesetCategoriesField]) {
      for (let category in ruleset[rulesetCategoriesField]) {
        customCategories[category] = handleRule(ruleset[rulesetCategoriesField][category]).matched.flat().filter(__unique);
      }
    }
    for (let originRule in ruleset) {
      if (originRule === rulesetVersionField) continue;
      if (originRule === rulesetCategoriesField) continue;
      const finalTags = handleRule(originRule);
      if (finalTags.matched.length > 0) {
        const alist = ruleset[originRule].replace(/\\\+/g, '[[plus]]');
        const actions = alist.split('+');
        actions.forEach(action => applyTagRule(action, finalTags.matched, finalTags.rules));
      }
    }
    const fTags = dontApply ? tagArray.map(tag => tag.name || tag) : runRules(tagArray.map(tag => tag.name));
    return {tags: fTags, errors, tagsToRemove, tagsToAdd, renamesDeletions, renamesAdditions};
  }

  // matched rules will be removed from first ruleset!
  YDB_api.mergeRulesets = function(old, newer) {
    const version = 1;
    if (old[rulesetVersionField] && parseInt(old[rulesetVersionField].split('.')[0]) > version) {
      throw new Error('Unsupported ruleset version, ' + version + '.x at most!');
    }
    if (newer[rulesetVersionField] && parseInt(newer[rulesetVersionField].split('.')[0]) > version) {
      throw new Error('Unsupported parseInt version, ' + version + '.x at most!');
    }
    let temp = Object.assign({}, old, newer);
    if (temp[rulesetCategoriesField]) {
      temp[rulesetCategoriesField] = Object.assign({}, old[rulesetCategoriesField] || {}, newer[rulesetCategoriesField] || {});
    }
    if (old[rulesetVersionField] > newer[rulesetVersionField]) temp[rulesetVersionField] = old[rulesetVersionField];
    return temp;
  }

  YDB_api.applyRulesetResults = function(results, tagArray) {
    function runRules(tags) {
      tags = tags.filter(tag => !tagsToRemove.has(tag));
      tags = tags.map(tag => {
        let tx = tag;
        if (renamesDeletions[tx]) {
          tag = renamesDeletions[tx].reduce((t, f) => f(t), tag);
        }
        if (renamesAdditions[tx]) {
          tag = renamesAdditions[tx].reduce((t, f) => f(t), tag);
        }
        return tag;
      });
      return tags.concat(Array.from(tagsToAdd.values())).filter((tag, index, tags) => index === tags.indexOf(tag));
    }
    const tagsToRemove = results.tagsToRemove;
    const tagsToAdd = results.tagsToAdd;
    const renamesDeletions = results.renamesDeletions;
    const renamesAdditions = results.renamesAdditions;
    return runRules(tagArray.map(tag => tag.name || tag));
  }

  YDB_api.mergeRulesetResults = function(old, newer) {
    const renamesDeletions = Object.assign(old.renamesDeletions);
    for (let i in newer.renamesDeletions) {
      renamesDeletions[i] = renamesDeletions[i] || [];
      renamesDeletions[i] = renamesDeletions[i].concat(newer.renamesDeletions[i]);
    }
    const renamesAdditions = Object.assign(old.renamesAdditions);
    for (let i in newer.renamesAdditions) {
      renamesAdditions[i] = renamesAdditions[i] || [];
      renamesAdditions[i] = renamesAdditions[i].concat(newer.renamesAdditions[i]);
    }
    return {
      errors: old.errors.concat(newer.errors),
      tagsToRemove: __flatSets([old.tagsToRemove, newer.tagsToRemove]),
      tagsToAdd: __flatSets([old.tagsToAdd, newer.tagsToAdd]),
      renamesDeletions: renamesDeletions,
      renamesAdditions: renamesAdditions
    }
  }
})();
