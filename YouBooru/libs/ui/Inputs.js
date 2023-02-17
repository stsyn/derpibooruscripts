var YDB_api = YDB_api || {};
YDB_api.UI = YDB_api.UI || {};

YDB_api.UI.input = props => {
  const { label, fieldLabel, fullWidth, className, onchange, inline, _redraw, ...otherProps } = props;
  const id = otherProps.id || `${otherProps.name}-${Math.floor(Math.random() * 10000)}`;

  if (inline) {
    return ['input.input', { ...otherProps, oninput: onchange, onchange, _redraw, className: (fullWidth ? 'input--wide' : '') + (className || '') , id }];
  }

  return ['.field', { _redraw }, [
    label ? ['label', { for: id }, label + ' '] : null,
    ['input.input', { ...otherProps, oninput: onchange, onchange, className: (fullWidth ? 'input--wide' : '') + (className || '') , id }],
    fieldLabel ? ['div', [
      ['i', fieldLabel],
    ]] : null,
  ]]
}

YDB_api.UI.textarea = props => {
  const { label, fieldLabel, fullWidth, className, onchange, _redraw, ...otherProps } = props;
  const id = otherProps.id || `${otherProps.name}-${Math.floor(Math.random() * 10000)}`;

  return ['.field', { _redraw }, [
    label ? ['label', { for: id }, label + ' '] : null,
    ['textarea.input', { ...otherProps, oninput: onchange, onchange, className: (fullWidth ? 'input--wide ' : '') + (className || ''), id }],
    fieldLabel ? ['div', [
      ['i', fieldLabel],
    ]] : null,
  ]]
}

YDB_api.UI.select = props => {
  const { label, fieldLabel, fullWidth, className, _redraw, inline, options, ...otherProps } = props;
  const id = otherProps.id || `${otherProps.name}-${Math.floor(Math.random() * 10000)}`;

  if (inline) {
    return ['select.input', { ...otherProps, _redraw, className: (fullWidth ? 'input--wide' : '') + (className || '') , id }, options.map(option => (
      ['option', { value: option.value, checked: option.checked }, [option.name]]
    ))];
  }

  return ['.field', { _redraw }, [
    label ? ['label', { for: id }, label + ' '] : null,
    ['select.input', { ...otherProps, className: (fullWidth ? 'input--wide' : '') + (className || '') , id }, options.map(option => (
      ['option', { value: option.value, checked: option.checked }, [option.name]]
    ))],
    fieldLabel ? ['div', [
      ['i', fieldLabel],
    ]] : null,
  ]]
}

YDB_api.UI.checkbox = props => {
  const { label, fieldLabel, value, _redraw, ...otherProps } = props;
  const id = otherProps.id || `${otherProps.name}-${Math.floor(Math.random() * 10000)}`;

  return ['.field', { _redraw }, [
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
  const { bold, state, className, onclick, ...otherProps } = props;
  const handleOnclick = (e) => {
    if (onclick) {
      e.preventDefault();
      e.stopPropagation();
      onclick(e);
    }
  }

  return [
    'button.button',
    {
      ...otherProps,
      onclick: handleOnclick,
      className: (className || '') + ' ' + (bold ? 'button--bold ': '') + (state ? 'button--state-' + state : ''),
    },
    content,
  ]
}
