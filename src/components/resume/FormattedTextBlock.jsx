import React from 'react';
import { detectListMode, getCleanTextLines, LIST_MODES } from '../../utils/listTextFormatting';

const FormattedTextBlock = ({
  text,
  plainTag: PlainTag = 'div',
  plainClassName = '',
  unorderedListClassName = '',
  orderedListClassName = '',
  itemClassName = '',
  editablePath,
  editableLabel,
  editableMultiline = true,
}) => {
  if (!text?.trim()) {
    return null;
  }

  const mode = detectListMode(text);
  const editableProps = editablePath ? {
    'data-edit-path': editablePath,
    'data-edit-label': editableLabel || '',
    'data-edit-multiline': editableMultiline ? 'true' : 'false',
  } : {};

  if (mode === LIST_MODES.PLAIN) {
    return <PlainTag className={plainClassName} {...editableProps}>{text}</PlainTag>;
  }

  const lines = getCleanTextLines(text);

  if (!lines.length) {
    return null;
  }

  const ListTag = mode === LIST_MODES.NUMBER ? 'ol' : 'ul';
  const listClassName = mode === LIST_MODES.NUMBER ? orderedListClassName : unorderedListClassName;

  return (
    <ListTag className={listClassName} {...editableProps}>
      {lines.map((line, index) => (
        <li key={`${mode}-${index}`} className={itemClassName}>
          {line}
        </li>
      ))}
    </ListTag>
  );
};

export default FormattedTextBlock;
