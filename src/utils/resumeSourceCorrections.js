const KNOWN_SECTION_HEADINGS = new Map([
  ['summary', 'summary'],
  ['professional summary', 'summary'],
  ['profile', 'summary'],
  ['career summary', 'summary'],
  ['functional area', 'area_of_expertise'],
  ['functional areas', 'area_of_expertise'],
  ['functional expertise', 'area_of_expertise'],
  ['experience', 'experience'],
  ['professional experience', 'experience'],
  ['work experience', 'experience'],
  ['education', 'education'],
  ['area of expertise', 'area_of_expertise'],
  ['areas of expertise', 'area_of_expertise'],
  ['technical proficiency', 'technical_proficiency'],
  ['skills', 'skills'],
  ['technical skills', 'technical_proficiency'],
  ['projects undertaken', 'projects'],
  ['projects', 'projects'],
  ['achievements', 'achievements'],
  ['highlights', 'highlights'],
  ['summer internship', 'internship'],
  ['certifications', 'certifications'],
  ['languages', 'languages'],
  ['volunteering', 'volunteering'],
]);

const normalizeHeading = (line = '') =>
  line
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const cleanLine = (line = '') =>
  line
    .replace(/^[-*•·▪◦]\s*/, '')
    .replace(/^o\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const splitLines = (rawText = '') =>
  rawText
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim());

const isHeadingLine = (line = '') => KNOWN_SECTION_HEADINGS.has(normalizeHeading(line));

const collectSections = (rawText = '') => {
  const sections = {};
  const lines = splitLines(rawText);
  let currentSection = null;

  for (const originalLine of lines) {
    const line = originalLine.trim();
    if (!line) continue;

    const normalized = normalizeHeading(line);
    const nextSection = KNOWN_SECTION_HEADINGS.get(normalized);

    if (nextSection) {
      currentSection = nextSection;
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      continue;
    }

    if (!currentSection) continue;
    sections[currentSection].push(line);
  }

  return sections;
};

const uniqueMerge = (...lists) => {
  const output = [];
  const seen = new Set();

  for (const list of lists) {
    for (const item of list || []) {
      const cleaned = cleanLine(item);
      if (!cleaned) continue;
      const key = cleaned.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(cleaned);
    }
  }

  return output;
};

const extractSummaryFromSections = (sections) => {
  const lines = (sections.summary || [])
    .map((line) => cleanLine(line))
    .filter(Boolean)
    .filter((line) => !isHeadingLine(line));

  const firstBulletIndex = lines.findIndex((line) => /^[-*•·▪◦o]\s+/i.test(line) || /^Developed\b|^Built\b|^Spearheaded\b|^Engineered\b|^Designed\b|^Applied\b|^Implemented\b/i.test(line));

  if (firstBulletIndex > 0) {
    return lines.slice(0, firstBulletIndex).join('\n');
  }

  return lines.join('\n');
};

const splitSkillLine = (line = '') =>
  line
    .split(/[•|]|(?<!\w)·|▪|◦|,\s*|\s+and\s+/i)
    .map((item) => cleanLine(item))
    .filter(Boolean);

const extractExpertiseSkills = (sections) =>
  (sections.area_of_expertise || [])
    .flatMap((line) => splitSkillLine(line))
    .filter((line) => !isHeadingLine(line));

const stripTechnicalLeadIn = (line = '') =>
  line
    .replace(/^reporting tools including,?\s*/i, '')
    .replace(/^reporting tools\s*/i, '')
    .replace(/^advance knowledge of\s*/i, '')
    .replace(/^accounting tools including\s*/i, '')
    .replace(/^accounting tools\s*/i, '')
    .replace(/^programming\s*/i, '')
    .replace(/^etl tools\s*[-:]?\s*/i, '')
    .replace(/^big data\s*[-:]?\s*/i, '')
    .replace(/^python libraries\s*[-:]?\s*/i, '')
    .replace(/^nlp\s*[-:]?\s*/i, '')
    .replace(/^mlops\s*[-:]?\s*/i, '')
    .trim();

const extractTechnicalSkills = (sections) => {
  const lines = sections.technical_proficiency || sections.skills || [];
  const skills = [];

  for (const line of lines) {
    const cleaned = stripTechnicalLeadIn(cleanLine(line)).replace(/\.$/, '');
    if (!cleaned) continue;

    cleaned
      .split(/,\s*|\s+and\s+/i)
      .map((item) => cleanLine(item))
      .filter(Boolean)
      .forEach((item) => skills.push(item));
  }

  return skills;
};

export const applyResumeSourceCorrections = (parsedData, rawText = '') => {
  if (!parsedData || !rawText) return parsedData;

  const sections = collectSections(rawText);
  const summary = extractSummaryFromSections(sections);
  const expertiseSkills = extractExpertiseSkills(sections);
  const technicalSkills = extractTechnicalSkills(sections);

  const nextData = {
    ...parsedData,
    personal: {
      ...(parsedData.personal || {}),
    },
    skills: {
      technical: Array.isArray(parsedData.skills?.technical) ? parsedData.skills.technical : [],
      core: Array.isArray(parsedData.skills?.core) ? parsedData.skills.core : [],
      soft: Array.isArray(parsedData.skills?.soft) ? parsedData.skills.soft : [],
    },
  };

  if (summary) {
    nextData.personal.summary = summary;
  }

  nextData.skills.technical = uniqueMerge(nextData.skills.technical, technicalSkills);
  nextData.skills.core = uniqueMerge(nextData.skills.core, expertiseSkills);

  return nextData;
};

export default applyResumeSourceCorrections;
