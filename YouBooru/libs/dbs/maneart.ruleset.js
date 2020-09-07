function GetDerpi2ManebooruRuleset() {
  return [{
    '_character': '%character:*',
    '_species': '%species:*',
  }];
}

function GetManebooru2DerpiRuleset() {
  return [{
    'character:*': '?character:*',
    'species:*': '?species:*',
  }];
}
