import React from 'react';

const PreviewEditableField = ({
  as: Component = 'span',
  path,
  label,
  multiline = false,
  className,
  style,
  children,
  ...rest
}) => (
  <Component
    data-edit-path={path}
    data-edit-label={label || ''}
    data-edit-multiline={multiline ? 'true' : 'false'}
    className={className}
    style={style}
    {...rest}
  >
    {children}
  </Component>
);

export default PreviewEditableField;
