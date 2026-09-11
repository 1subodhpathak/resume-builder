export const LIST_MODES = {
  PLAIN: 'plain',
  BULLET: 'bullet',
  NUMBER: 'number',
};

const BULLET_PREFIX_PATTERN = /^\s*[•●▪◦*-](?:\s+|$)/;
const NUMBER_PREFIX_PATTERN = /^\s*\d+[.)](?:\s+|$)/;
const ANY_LIST_PREFIX_PATTERN = /^\s*(?:[•●▪◦*-]|\d+[.)])(?:\s+|$)/;

export const stripListPrefix = (line = '') =>
  String(line).replace(ANY_LIST_PREFIX_PATTERN, '');

export const getCleanTextLines = (text = '') =>
  String(text)
    .split('\n')
    .map((line) => stripListPrefix(line).trim())
    .filter(Boolean);

export const detectListMode = (text = '') => {
  const nonEmptyLines = String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!nonEmptyLines.length) {
    return LIST_MODES.PLAIN;
  }

  const bulletCount = nonEmptyLines.filter((line) => BULLET_PREFIX_PATTERN.test(line)).length;
  const numberCount = nonEmptyLines.filter((line) => NUMBER_PREFIX_PATTERN.test(line)).length;
  const majorityThreshold = Math.ceil(nonEmptyLines.length / 2);

  if (numberCount >= majorityThreshold && numberCount >= bulletCount) {
    return LIST_MODES.NUMBER;
  }

  if (bulletCount >= majorityThreshold) {
    return LIST_MODES.BULLET;
  }

  if (numberCount > 0 && bulletCount === 0) {
    return LIST_MODES.NUMBER;
  }

  if (bulletCount > 0 && numberCount === 0) {
    return LIST_MODES.BULLET;
  }

  return LIST_MODES.PLAIN;
};

export const formatTextWithListMode = (text = '', mode = LIST_MODES.PLAIN) => {
  const lines = String(text).split('\n');
  let nextNumber = 0;

  return lines
    .map((line) => {
      if (!line.trim()) {
        return '';
      }

      const content = stripListPrefix(line).trim();

      if (!content) {
        return '';
      }

      if (mode === LIST_MODES.PLAIN) {
        return content;
      }

      if (mode === LIST_MODES.BULLET) {
        return `• ${content}`;
      }

      nextNumber += 1;
      return `${nextNumber}. ${content}`;
    })
    .join('\n');
};

export const getListInsertion = (text = '', selectionStart = 0, mode = LIST_MODES.PLAIN) => {
  if (mode === LIST_MODES.PLAIN) {
    return '\n';
  }

  if (mode === LIST_MODES.BULLET) {
    return '\n• ';
  }

  const linesBeforeCursor = String(text).slice(0, selectionStart).split('\n');
  const nextNumber = linesBeforeCursor.filter((line) => NUMBER_PREFIX_PATTERN.test(line.trim())).length + 1;

  return `\n${nextNumber}. `;
};

export const getModePlaceholder = (mode = LIST_MODES.PLAIN, plainPlaceholder = '') => {
  if (mode === LIST_MODES.BULLET) {
    return '• Add a point...';
  }

  if (mode === LIST_MODES.NUMBER) {
    return '1. Add a point...';
  }

  return plainPlaceholder || 'Write here...';
};

export const getInitialListValue = (mode = LIST_MODES.PLAIN) => {
  if (mode === LIST_MODES.BULLET) {
    return '• ';
  }

  if (mode === LIST_MODES.NUMBER) {
    return '1. ';
  }

  return '';
};
