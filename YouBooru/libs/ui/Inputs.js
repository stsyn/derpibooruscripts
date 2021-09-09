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

YDB_api.UI.checkbox = props => {
  const { label, fieldLabel, value, ...otherProps } = props;
  const id = otherProps.id || `${otherProps.name}-${Math.floor(Math.random() * 10000)}`;

  return ['.field', [
    label ? ['label', { for: id }, label + ' '] : null,
    ['input', { ...otherProps, type: 'checkbox', checked: value , id }],
    fieldLabel ? ['div', [
      ['i', fieldLabel],
    ]] : null,
  ]]
}

YDB_api.UI.fuckIe = () => (
  ['input', { type: 'hidden', id: 'fuck_ie', name: 'fuck_ie[fuck_ie]', value: 'fuck_ie'}]
)

YDB_api.UI.button = (props, content) => {
  const { bold, state, className, ...otherProps } = props;

  return [
    'button.button',
    {
      ...otherProps,
      className: (className ? className : '') + ' ' + (bold ? 'button--bold ': '') + (state ? 'button--state-' + state : ''),
    },
    content,
  ]
}
