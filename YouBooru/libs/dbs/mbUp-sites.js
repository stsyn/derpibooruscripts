function GetMBUpRulesets() {
  return (origin, target) => {
    let firstPart = [], secondPart = [];
    if (target === 'furbooru.org') {
      secondPart = GetDerpi2FurbooruRuleset();
    } else if (target === 'manebooru.art') {
      secondPart = GetDerpi2ManebooruRuleset();
    } else if (target === 'twibooru.org') {
      secondPart = GetDerpi2TwibooruRuleset();
    }

    if (origin === 'furbooru.org') {
      firstPart = GetFurbooru2DerpiRuleset();
    } else if (origin === 'manebooru.art') {
      firstPart = GetManebooru2DerpiRuleset();
    } else if (target === 'twibooru.org') {
      firstPart = GetTwibooru2DerpiRuleset();
    }
    
    return firstPart.concat(secondPart);
  };
}
