function GetDerpi2FurbooruRuleset() {
  return [{
    // adds " (mlp)" to every character tag + "my little pony" tag
    '_character': '%* (mlp)+my little pony',
    // adds "not furry" if only "human" as species tag
    '_species[1]+human': 'not furry',
    // removes "%character%butt"
    '*butt,!butt,!* butt': '-',
    '*betes': '-',
    'cute*,!cute,!cute *': '-',
    // solo * always tagged
    'solo+female': 'solo female',
    'solo+male': 'solo male',
    'solo+futa': 'solo futa',
    // believe in aliases to cover episode names as well
    'spoiler:*': '-',

    'semi-grimdark': '-',
    'busty *': '-',
    'woona': '-',
  }]
}

function GetFurbooru2DerpiRuleset() {
  return [{
    'not furry': '-',
    'safe+solo female': '-solo female',
    'safe+solo male': '-solo male',
    'safe+solo futa': '-solo futa',
    'equine': '-',
    'horse': '-',
    'mammal': '-',
    'fictional species': '-',
    'feral': '-',
    'friendship is magic': '-',
    'my little pony': '-',
  }]
}

function GetFurbooruRuleset() {
  return [{}, {}]
}

