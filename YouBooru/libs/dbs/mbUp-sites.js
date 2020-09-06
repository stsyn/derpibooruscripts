function GetMBUpRulesets() {
  return (origin, target) => {
    if (origin === 'derpibooru.org' && target === 'furbooru.org') {
      return GetDerpi2FurbooruRuleset();
    }
    if (origin === 'furbooru.org' && target === 'derpibooru.org') {
      return GetFurbooru2DerpiRuleset();
    }
  };
}
