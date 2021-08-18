var YDB_api = YDB_api || {};
YDB_api.UI = YDB_api.UI || {};

YDB_api.UI.input = props => {
  const { label, fieldLabel, fullWidth, ...otherProps } = props;
  const id = otherProps.id || `${otherProps.name}-${Math.floor(Math.random() * 10000)}`;

  return ['.field', [
    label ? ['label', { for: id }, label + ' '] : null,
    ['input.input', { ...otherProps, className: fullWidth ? 'input--wide' : '' , id }],
    fieldLabel ? ['div', [
      ['i', fieldLabel],
    ]] : null,
  ]]
}

YDB_api.UI.textarea = props => {
  const { label, fieldLabel, fullWidth, ...otherProps } = props;
  const id = otherProps.id || `${otherProps.name}-${Math.floor(Math.random() * 10000)}`;

  return ['.field', [
    label ? ['label', { for: id }, label + ' '] : null,
    ['textarea.input', { ...otherProps, className: fullWidth ? 'input--wide' : '' , id }],
    fieldLabel ? ['div', [
      ['i', fieldLabel],
    ]] : null,
  ]]
}
