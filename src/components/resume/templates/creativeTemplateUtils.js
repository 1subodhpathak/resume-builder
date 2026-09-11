import { getCleanTextLines } from '../../../utils/listTextFormatting';

export const splitLines = (text = '') =>
  getCleanTextLines(text);

export const mergeSkills = (skills = {}, limit = 12) =>
  [...(skills.technical || []), ...(skills.core || []), ...(skills.soft || [])]
    .filter(Boolean)
    .slice(0, limit);

export const take = (items = [], count = 4) => (items || []).filter(Boolean).slice(0, count);

export const getNameParts = (name = 'Pooja Bansal') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return ['Pooja', 'Bansal'];
  }

  if (parts.length === 1) {
    return [parts[0], ''];
  }

  return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
};

export const getProgressValue = (index, min = 54, max = 92) => {
  const spread = max - min;
  return min + ((index * 11) % Math.max(spread, 1));
};

export const PRINT_STYLE_BLOCK = `
  @media print {
    @page { size: A4; margin: 0; }
    body {
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .break-inside-avoid { break-inside: avoid; }
  }
`;
