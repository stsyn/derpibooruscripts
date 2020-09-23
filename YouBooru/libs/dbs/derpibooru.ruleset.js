function GetDerpibooruRuleset() {
  return [{
    '[{[version]}]': '0.0',
    '*[<3]': '^[E]At least 3 tags required!',
    '^_rating': '^[E]You forgot rating tags!',
    'safe+_rating[>1]': '^[E]You cannot use "safe" with any other rating tags!',
    'suggestive,questionable,explicit[[>1]]': '^[E]You cannot use more than one sexual ratings tag!',
    'grimdark+semi-grimdark': '^[E]You cannot use more than one grimdark ratings tag!'
  }, {
    '[{[version]}]': '0.0',
    '^artist:*,screencap,artist needed,anonymous artist': '^[E]No origin provided!',
    '^_character,_oc,no pony': '^[E]No character tag!',
    'safe+solo female,solo male, solo futa': 'solo+^[E]%tag:solo *% should be used only in sexual context. Use just %tag:solo% and correct gender tag!',
    'solo+male,female,futa[[>1]]': '^[E]%tag:female%, %tag:futa%, %tag:male% with %tag:solo%.',
    'solo+_character,_oc[[>1]]+-fusion': '^[E]Multiple characters while %tag:solo% tagged.',

    '_oc[>1]': 'oc',
    '_oc[>1]+_character[0]': 'oc only',
  }]
}
