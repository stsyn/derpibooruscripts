function GetMBUpRulesets() {
  return (origin, target) => {
    if (origin === 'derpibooru.org' && target === 'furbooru.org') {
      return GetDerpi2FurbooruRuleset();
    }
  };
}
