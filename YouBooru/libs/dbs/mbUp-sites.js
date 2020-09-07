function GetMBUpRulesets() {
  return (origin, target) => {
    let firstPart = [], secondPart = [];
    if (target === 'furbooru.org') {
      secondPart = GetDerpi2FurbooruRuleset();
    } else if (target === 'manebooru.art') {
      secondPart = GetDerpi2ManebooruRuleset();
    }

    if (origin === 'furbooru.org') {
      firstPart = GetFurbooru2DerpiRuleset();
    } else if (origin === 'manebooru.art') {
      firstPart = GetManebooru2DerpiRuleset();
    }
    
    return firstPart.concat(secondPart);
  };
}
