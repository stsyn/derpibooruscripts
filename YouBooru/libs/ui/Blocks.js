var YDB_api = YDB_api || {};
YDB_api.UI = YDB_api.UI || {};

YDB_api.UI.flash = (props, children) => {
  const { type, ...otherProps } = props;

  return ['.field', { className: 'flash--' + type, ...otherProps }, children]
}

const blockHeader = (_, children) => {
  return ['.block__header', { className: children.length === 1 ? 'block__header--single-item' : '' }, children];
}

const blockContent = (_, children) => {
  return ['.block__content', children];
}

YDB_api.UI.block = (props, children = []) => {
  const { headless, ...otherProps } = props;

  return ['.block', otherProps, [
    !headless ? [blockHeader, [children[0]]] : undefined,
    [blockContent, headless ? children : children.slice(1)],
  ]]
}

YDB_api.UI.blockTitle = (props, children) => {
  return ['.block__header__title', props, children];
}
