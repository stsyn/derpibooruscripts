function GetTVRulesets() {
  return (origin) => {
    if (origin === 'furbooru.org') {
      return GetFurbooruRuleset();
    } else if (origin === 'derpibooru.org') {
      return GetDerpibooruRuleset();
    }
    return GetDerpibooruRuleset();
  };
}
