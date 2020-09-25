function GetDerpibooruRuleset() {
  return [{
    '[{[version]}]': '0.0',
    '^*[>2]': '^[E]At least 3 tags required!',
    '^_rating': '^[E]You forgot rating tags!',
    'safe+_rating[>1]': '^[E]You cannot use "safe" with any other rating tags!',
    'suggestive,questionable,explicit[[>1]]': '^[E]You cannot use more than one sexual ratings tag!',
    'grimdark+semi-grimdark': '^[E]You cannot use more than one grimdark ratings tag!'
  }, {
    '[{[version]}]': '1.1',
    '[{[categories]}]': {
      'sexual': 'suggestive,questionable,explicit',
      'genders': 'male,female,futa,intersex',
      'characters': '_character,oc:*',
    },
    '^artist:*,screencap,artist needed,anonymous artist': '^[E]No origin provided!',
    '^__characters,no pony': '^[E]No character tag!',

    '__characters[1]': 'solo',
    'safe+solo female,solo male,solo futa': 'solo+^[E]%tag:solo *% should be used only in sexual context. Use just %tag:solo% and correct gender tag!',
    '__sexual+solo+female': 'solo female',
    '__sexual+solo+male': 'solo male',
    '__sexual+solo+futa': 'solo futa',
    'solo+__characters[>1]+-fusion': '^[E]Multiple characters while %tag:solo% tagged.',
    'solo+__genders[>1]': '^[E]Multiple genders while %tag:solo% tagged.',

    '__characters[2]+-shipping': 'duo',
    'duo+female+-__genders,!female': 'duo female',
    'duo+male+-__genders,!male': 'duo male',
    'duo+futa+-female,male': 'duo futa',

    '__characters[3]+-shipping': 'trio',
    'trio+female+-__genders,!female': 'trio female',
    'trio+male+-__genders,!male': 'trio male',
    'trio+futa+-female,male': 'trio futa',

    '__sexual+__characters[>3]+-__genders,!female': 'females only',
    '__sexual+__characters[>3]+-__genders,!male': 'males only',
    '__sexual+__characters[>3]+-female,male': 'futa only',

    '^_species,equestria girls,no pony': '^No species tag!',

    '^__genders': '^No gender tag!',
    'pony+female+-mare,filly': 'mare+filly',
    'pony+male+-stallion,colt': 'stallion+colt',
    'solo+pony+mare+filly+-fusion': '^Expected either %tag:mare% or %tag:filly%.',
    'solo+pony+stallion+colt+-fusion': '^Expected either %tag:stallion% or %tag:colt%.',

    '_oc': 'oc',
    '_oc+-_character': 'oc only',
  }]
}
