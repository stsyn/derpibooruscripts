function GetDerpibooruRuleset() {
  return [{
    '[{[version]}]': '0.0',
    '^*[>2]': '^[E]At least 3 tags required!',
    '^_rating': '^[E]You forgot rating tags!',
    'safe+_rating[>1]': '^[E]You cannot use "safe" with any other rating tags!',
    'suggestive,questionable,explicit[[>1]]': '^[E]You cannot use more than one sexual ratings tag!',
    'grimdark+semi-grimdark': '^[E]You cannot use more than one grimdark ratings tag!'
  }, {
    '[{[version]}]': '0.0',
    '^artist:*,screencap,artist needed,anonymous artist': '^[E]No origin provided!',
    '^_character,_oc,no pony': '^[E]No character tag!',

    '_character,oc:*[[1]]': 'solo',
    'safe+solo female,solo male, solo futa': 'solo+^[E]%tag:solo *% should be used only in sexual context. Use just %tag:solo% and correct gender tag!',
    'suggestive,questionable,explicit+solo+female': 'solo female',
    'suggestive,questionable,explicit+solo+male': 'solo male',
    'suggestive,questionable,explicit+solo+futa': 'solo futa',
    'solo+male,female,futa[[>1]]': '^[E]%tag:female%, %tag:futa%, %tag:male% with %tag:solo%.',
    'solo+_character,oc:*[[>1]]+-fusion': '^[E]Multiple characters while %tag:solo% tagged.',

    '_character,oc:*[[2]]+-shipping': 'duo',
    'duo+female+-male+-intersex+-futa': 'duo female',
    'duo+male+-female+-intersex+-futa': 'duo male',
    'duo+futa+-female+-male': 'duo futa',

    '^_species,equestria girls,no pony': '^No species tag!',

    '^male,female,futa,intersex': '^No gender tag!',
    'pony+female+-mare,filly': 'mare+filly',
    'pony+male+-stallion,colt': 'stallion+colt',
    'solo+pony+mare+filly+-fusion': 'Expected either %tag:mare% or %tag:filly%.',
    'solo+pony+stallion+colt+-fusion': 'Expected either %tag:stallion% or %tag:colt%.',

    '_oc': 'oc',
    '_oc+-_character': 'oc only',
  }]
}
