/*
 * Tag rulesets interpretator
 */
var YDB_api = YDB_api || {};
(function() {
  // - rules be like (can have ^ to act negative)
  // safe
  // solo+female     — combine (AND)
  // -pony           — negate
  // _origin         — category
  // *sparkle        — wildcard only 1 * supported
  // *sparkle[>1]
  // _character[>1]  — can also be [x][<x]
  // *               — any tag
  // __              — no tag

  // - actions be like
  // safe            — adds
  // -safe           — remove tag
  // -[x]            — remove tags from x + match
  // ? (mlp)
  // ? (mlp)[x]      — removes part
  // %* (mlp)
  // %* (mlp)[x]     — appends part to every tag
  // ^error text     — throws error (can't have + in error text)
  // explicit+sex    — combine actions (AND)

  YDB_api.applyRulesetOnTags = function(ruleset, tagArray, dontApply) {
    const tagsToRemove = new Set();
    const tagsToAdd = new Set();
    const renamesDeletions = {};
    const renamesAdditions = {};
    const errors = [];

    function getMatchingTags(rulePart, tagArray) {
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

      if (rulePart === '__') return [];
      if (rulePart === '*') return tagArray;
      rulePart = rulePart.replace(/\[\[plus]]/g, '+');

      // category
      if (rulePart.startsWith('_')) {
        const rule = rulePart.match(/_(.*)(\[.?\d+]|)/)[1];
        const match = tagArray.filter(tag => tag.category === rule);
        console.warn(match, tagArray);
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

    function applyTagRule(action, tags, rules) {
      // removals
      if (action.startsWith('-')) {
        action = action.substring(1);
        const linked = action.match(/^\[(\d+)]$/);

        if (linked) {
          const t = tags[parseInt(linked)];
          if (t) {
            t.forEach(tag => tagsToRemove.add(tag.name));
          }
        } else if (action.length > 0) {
          tagsToRemove.add(action);
        }
        return;
      }
      // wildcard deletions
      if (action.startsWith('?')) {
        const match = action.match(/\?(.*)\[(\d+)]/);
        if (match[3]) {
          const t = tags[parseInt(match[3])];
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
        return;
      }
      // wildcard additions
      if (action.startsWith('%')) {
        const beginning = action.startsWith('%*');
        const match = action.match(/%(\*|)(.*)(\*|)(\[(\d+)]|)/);
        if (match[5]) {
          const t = tags[parseInt(match[5])];
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
        return;
      }
      // errors
      if (action.startsWith('^')) {
        errors.push(action.substring(1));
        return;
      }
      // additions
      tagsToAdd.add(action);
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
        const actions = ruleset[rule].split('+');
        actions.forEach(action => applyTagRule(action, finalTags, ruleTags));
      }
      const fTags = dontApply ? tagArray.map(tag => tag.name) : runRules(tagArray.map(tag => tag.name));
      return {tags: fTags, errors, tagsToRemove, tagsToAdd, renamesDeletions, renamesAdditions};
    }
  }
})();
