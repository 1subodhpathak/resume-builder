/**
 * Robust JSON parser for LLM outputs.
 * Strips markdown code blocks (```json ... ```), removes preamble/postamble text,
 * fixes trailing commas, and handles BOM / edge cases.
 */
export const cleanAndParseJson = (rawContent, fallback = null) => {
  if (rawContent === null || rawContent === undefined) {
    if (fallback !== null) return fallback;
    throw new Error('No content returned from AI service to parse as JSON.');
  }

  // If already an object (e.g. parsed upstream), return directly
  if (typeof rawContent === 'object') {
    return rawContent;
  }

  let text = String(rawContent).trim();

  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1).trim();
  }

  // 1. Direct parse attempt
  try {
    return JSON.parse(text);
  } catch (_) {
    // Continue
  }

  // 2. Strip standard markdown code blocks (```json ... ``` or ``` ... ```)
  const stripped = text
    .replace(/^```(?:json|JSON)?\s*\n?/i, '')
    .replace(/\n?\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(stripped);
  } catch (_) {
    // Continue
  }

  // 3. Extract JSON object substring between first '{' and last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1).trim();
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // 3b. Try fixing trailing commas: e.g. [1, 2,] or {"a": 1,}
      const fixedTrailingCommas = candidate.replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(fixedTrailingCommas);
      } catch (_) {
        // Continue
      }
    }
  }

  // 4. Extract JSON array substring between first '[' and last ']'
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const candidate = text.slice(firstBracket, lastBracket + 1).trim();
    try {
      return JSON.parse(candidate);
    } catch (_) {
      const fixedTrailingCommas = candidate.replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(fixedTrailingCommas);
      } catch (_) {
        // Continue
      }
    }
  }

  // 5. If fallback provided, return it
  if (fallback !== null) {
    return fallback;
  }

  // 6. Last resort: try parsing the stripped version to provide a standard error
  return JSON.parse(stripped);
};
