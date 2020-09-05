/*
 * Tag rulesets interpretator
 */
var YDB_api = YDB_api || {};
(function() {
  const rulesetVersionField = '[{[version]}]';
  function __unique(item, index, array) {
    return index === array.indexOf(item);
  }

  //// - rules be like (can have ^ to act negative)
  // safe
  // -pony           — negate (NOT)
  // _origin         — category
  // *sparkle        — wildcard only 1 * supported
  // *sparkle[>1]
  // _character[>1]  — can also be [x][<x]
  // *               — any tag
  // __              — no tag

  // solo+female     — combine (AND)

  // pegasus,unicorn — listing (it's not global OR!)
  // pony,!anthro    — exclusion (it's not global NOT!)
  // artist:*,idw[[1]] — use [[]] for count cases for listings and exclusions

  //// - actions be like
  // safe            — adds
  // -safe           — remove tag
  // -[x]            — remove tags from x + match
  // ? (mlp)
  // ? (mlp)[x]      — removes part
  // %* (mlp)
  // %solo *
  // %* (mlp)[x]     — appends part to every tag
  // ^error text     — throws error

  // party+pinkie pie — combine actions (AND)

  // Actions order is global for whole ruleset iteration:
  // 1. Tag removals;
  // 2. Part of tag removals;
  // 3. Part of tag appends;
  // 4. Tag appends.

  YDB_api.applyRulesetOnTags = function(ruleset, tagArray, dontApply) {
    const version = 0;
    if (ruleset[rulesetVersionField] && parseInt(ruleset[rulesetVersionField].split('.')[1]) > version) {
      throw new Error('Unsupported ruleset version');
    }
    const tagsToRemove = new Set();
    const tagsToAdd = new Set();
    const renamesDeletions = {};
    const renamesAdditions = {};
    const errors = [];

    function getMatchingTags(rule, tagArray) {
      function checkTag(rulePart) {
        if (rulePart === '__') return [];
        if (rulePart === '*') return tagArray;

        // category
        if (rulePart.startsWith('_')) {
          const rule = rulePart.match(/_(.*)(\[.?\d+]|)/)[1];
          const match = tagArray.filter(tag => tag.category === rule);
          return checkCondition(rulePart, match);
        }
        // wildcard
        if (rulePart.indexOf('*') > -1) {
          const rule = rulePart.match(/(.*)(\[.?\d+]|)/)[1];
          const parts = rule.split('*');
          const match = tagArray.filter(tag => tag.name.startsWith(parts[0]) && tag.name.endsWith(parts[1]))
          return checkCondition(rulePart, match);
        }
        // strict
        const match = tagArray.filter(tag => tag.name === rulePart);
        return checkCondition(rulePart, match);
      }

      function checkCondition(rule, match) {
        const condition = rule.match(/\[(.?)(\d+)]/);
        if (condition) {
          const value = parseInt(condition[2]);
          switch (condition[1]) {
            case '>': return (match.length > value) ? match : [];
            case '<': return (match.length < value) ? match : [];
            case '': return (match.length === value) ? match : [];
          }
        }
        return match;
      }

      function checkConditionGlobal(rule, match) {
        const condition = rule.match(/\[\[(.?)(\d+)]]/);
        if (condition) {
          const value = parseInt(condition[2]);
          switch (condition[1]) {
            case '>': return (match.length > value) ? match : [];
            case '<': return (match.length < value) ? match : [];
            case '': return (match.length === value) ? match : [];
          }
        }
        return match;
      }

      rule = rule.replace(/\[\[plus]]/g, '+');
      if (rule.indexOf(',') > -1) {
        const rules = rule.split(',');
        const matched = rules.filter(rule => !rule.startsWith('!').map(checkTag)).flat().filter(__unique);
        const notMatched = rules.filter(rule => rule.startsWith('!').map(rule => checkTag(rule.substring(1)))).flat();
        const match = matched.filter(tag => !notMatched.includes(tag));
        return checkConditionGlobal(rule, match);
      } else {
        return checkTag(rule);
      }
    }

    function applyTagRule(action, tags, rules) {
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
        }
      }
      // wildcard deletions
      else if (action.startsWith('?')) {
        const match = action.match(/\?(.*)\[(\d+)]/);
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
        const match = action.match(/%(\*|)(.*)(\*|)(\[(\d+)]|)/);
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

    for (let rule in ruleset) {
      if (rule === rulesetVersionField) continue;
      // first letter - prefix
      const negate = rule.startsWith('^');
      if (negate) {
        rule = rule.substring(1);
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
        const finalTags = foundMatchedTags.map((tags, index) => tags.length > 0 ? tags : foundBannedTags[index]);
        const alist = ruleset[rule].replace(/\\\+/g, '[[plus]]');
        const actions = alist.split('+');
        actions.forEach(action => applyTagRule(action, finalTags, ruleTags));
      }
    }
    const fTags = dontApply ? tagArray.map(tag => tag.name) : runRules(tagArray.map(tag => tag.name));
    return {tags: fTags, errors, tagsToRemove, tagsToAdd, renamesDeletions, renamesAdditions};
  }

  // matched rules will be removed from first ruleset!
  YDB_api.mergeRulesets = function(old, newer) {
    const version = 0;
    if (old[rulesetVersionField] && parseInt(old[rulesetVersionField].split('.')[0]) > version) {
      throw new Error('Unsupported ruleset version');
    }
    if (newer[rulesetVersionField] && parseInt(newer[rulesetVersionField].split('.')[0]) > version) {
      throw new Error('Unsupported parseInt version');
    }
    let temp = Object.assign({}, old);
    temp = Object.assign(temp, newer);
    if (old[rulesetVersionField] > newer[rulesetVersionField]) temp[rulesetVersionField] = old[rulesetVersionField];
    return temp;
  }
})();
