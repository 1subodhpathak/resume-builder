const SECTION_DEFINITIONS = [
  { id: 'summary', labels: ['summary', 'professional summary', 'profile', 'about me', 'about', 'objective', 'career objective'] },
  { id: 'experience', labels: ['experience', 'work experience', 'professional experience', 'employment history', 'employment'] },
  { id: 'education', labels: ['education', 'academic background', 'academic qualifications'] },
  { id: 'skills', labels: ['skills', 'technical skills', 'core competencies', 'competencies', 'skills and tools'] },
  { id: 'projects', labels: ['projects', 'project experience', 'key projects', 'personal projects'] },
  { id: 'certifications', labels: ['certifications', 'certificates', 'licenses', 'licenses and certifications'] },
  { id: 'awards', labels: ['awards', 'honors', 'achievements', 'awards and honors'] },
  { id: 'languages', labels: ['languages', 'language proficiency'] },
  { id: 'volunteering', labels: ['volunteering', 'volunteer experience', 'community involvement'] },
];

const MONTH_PATTERN = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DATE_PATTERNS = [
  new RegExp(`${MONTH_PATTERN}\\s+\\d{4}\\s*(?:-|–|—|to)\\s*(?:present|current|${MONTH_PATTERN}\\s+\\d{4}|\\d{4})`, 'i'),
  /\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:present|current|\b(?:19|20)\d{2}\b)/i,
  new RegExp(`${MONTH_PATTERN}\\s+\\d{4}`, 'i'),
  /\b(?:19|20)\d{2}\b/,
];

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const linkedinPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|•·]+/i;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/;

const createEmptyResume = () => ({
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    linkedin: '',
  },
  experience: [],
  education: [],
  skills: {
    technical: [],
    core: [],
    soft: [],
  },
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  volunteering: [],
});

const normalizeHeading = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9/&+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const detectSectionHeading = (line = '') => {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const directHeading = normalizeHeading(trimmed.replace(/[:\-–—]+$/, ''));
  for (const definition of SECTION_DEFINITIONS) {
    if (definition.labels.includes(directHeading)) {
      return { id: definition.id, remainder: '' };
    }
  }

  const headingMatch = trimmed.match(/^([A-Za-z0-9/&+ ]{3,40})\s*[:\-–—]\s*(.+)$/);
  if (!headingMatch) return null;

  const [, headingPart, remainder] = headingMatch;
  const normalized = normalizeHeading(headingPart);

  for (const definition of SECTION_DEFINITIONS) {
    if (definition.labels.includes(normalized)) {
      return { id: definition.id, remainder: remainder.trim() };
    }
  }

  return null;
};

const sanitizeLines = (rawText = '') =>
  rawText
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.replace(/\t/g, ' ').trim());

const compactLines = (lines = []) => {
  const compacted = [];
  let previousWasEmpty = true;

  for (const line of lines) {
    if (!line) {
      if (!previousWasEmpty) {
        compacted.push('');
      }
      previousWasEmpty = true;
      continue;
    }

    compacted.push(line);
    previousWasEmpty = false;
  }

  while (compacted[0] === '') compacted.shift();
  while (compacted[compacted.length - 1] === '') compacted.pop();
  return compacted;
};

const splitIntoSections = (rawText = '') => {
  const sections = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: [],
    languages: [],
    volunteering: [],
  };

  const lines = sanitizeLines(rawText);
  let currentSection = 'header';

  for (const line of lines) {
    if (!line) {
      sections[currentSection].push('');
      continue;
    }

    const heading = detectSectionHeading(line);
    if (heading) {
      currentSection = heading.id;
      if (heading.remainder) {
        sections[currentSection].push(heading.remainder);
      }
      continue;
    }

    sections[currentSection].push(line);
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, compactLines(value)])
  );
};

const splitBlocks = (lines = []) => {
  const blocks = [];
  let currentBlock = [];

  for (const line of lines) {
    if (!line) {
      if (currentBlock.length) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
      continue;
    }

    currentBlock.push(line);
  }

  if (currentBlock.length) {
    blocks.push(currentBlock);
  }

  return blocks;
};

const looksLikeBulletLine = (line = '') => /^[-*•·▪◦]\s+/.test(line);
const removeBulletPrefix = (line = '') => line.replace(/^[-*•·▪◦]\s+/, '').trim();

const splitMetaTokens = (line = '') =>
  line
    .split(/\s*[|•·]\s*|\s{2,}/)
    .map((token) => token.trim())
    .filter(Boolean);

const cleanMetadataValue = (value = '') =>
  value
    .replace(/[|•·,\-–—\s]+$/, '')
    .trim();

const extractDateText = (line = '') => {
  for (const pattern of DATE_PATTERNS) {
    const match = line.match(pattern);
    if (match) return match[0].trim();
  }
  return '';
};

const isLikelyContactLine = (line = '') =>
  emailPattern.test(line) ||
  linkedinPattern.test(line) ||
  phonePattern.test(line) ||
  /github\.com|portfolio|behance|dribbble/i.test(line);

const isLikelyLocationFragment = (value = '') =>
  Boolean(value) &&
  !/\d/.test(value) &&
  !/@/.test(value) &&
  !/(linkedin|github|portfolio|behance|dribbble)/i.test(value) &&
  value.length >= 3;

const buildLocationCandidates = (headerLines = [], personal) => {
  const candidates = [];

  for (const line of headerLines) {
    const fragments = line
      .split(/\s*[|•·]\s*/)
      .map((fragment) => fragment.trim())
      .filter(Boolean);

    for (const fragment of fragments) {
      if (
        fragment === personal.name ||
        fragment === personal.title ||
        fragment === personal.email ||
        fragment === personal.phone ||
        fragment === personal.linkedin
      ) {
        continue;
      }

      if (isLikelyLocationFragment(fragment)) {
        candidates.push(fragment);
      }
    }
  }

  const combined = headerLines.find((line) => !isLikelyContactLine(line) && /,/.test(line));
  if (combined && isLikelyLocationFragment(combined)) {
    candidates.unshift(combined);
  }

  return candidates;
};

const tokenizeSkillLine = (line = '') =>
  line
    .split(/[|,;/•·]/)
    .map((token) => token.trim())
    .filter(Boolean);

const parseSkillsSection = (lines = []) => {
  const skillBuckets = {
    technical: [],
    core: [],
    soft: [],
  };

  for (const line of lines.filter(Boolean)) {
    const normalized = normalizeHeading(line);

    if (/^(technical|tools?|technology)/.test(normalized)) {
      const [, remainder = ''] = line.split(/[:\-–—]/);
      skillBuckets.technical.push(...tokenizeSkillLine(remainder));
      continue;
    }

    if (/^(soft|interpersonal)/.test(normalized)) {
      const [, remainder = ''] = line.split(/[:\-–—]/);
      skillBuckets.soft.push(...tokenizeSkillLine(remainder));
      continue;
    }

    if (/^(core|strengths?|competencies)/.test(normalized)) {
      const [, remainder = ''] = line.split(/[:\-–—]/);
      skillBuckets.core.push(...tokenizeSkillLine(remainder));
      continue;
    }

    skillBuckets.technical.push(...tokenizeSkillLine(removeBulletPrefix(line)));
  }

  return {
    technical: Array.from(new Set(skillBuckets.technical)),
    core: Array.from(new Set(skillBuckets.core)),
    soft: Array.from(new Set(skillBuckets.soft)),
  };
};

const createIdFactory = () => {
  let currentId = 1;
  return () => currentId++;
};

const parseHeaderDetails = (sections, rawText) => {
  const personal = createEmptyResume().personal;
  const headerLines = sections.header.filter(Boolean);

  personal.email = rawText.match(emailPattern)?.[0] || '';
  personal.linkedin = rawText.match(linkedinPattern)?.[0] || '';
  personal.phone = rawText.match(phonePattern)?.[0] || '';

  if (headerLines.length) {
    personal.name = headerLines[0];
  }

  const candidateTitle = headerLines.find((line, index) => index > 0 && !isLikelyContactLine(line));
  if (candidateTitle) {
    personal.title = candidateTitle;
  }

  if (sections.summary.length) {
    personal.summary = sections.summary.filter(Boolean).join('\n');
  } else {
    const summaryCandidates = headerLines.filter(
      (line) =>
        line !== personal.name &&
        line !== personal.title &&
        !isLikelyContactLine(line) &&
        line.length > 35
    );
    personal.summary = summaryCandidates.join('\n');
  }

  const locationCandidates = buildLocationCandidates(headerLines, personal);
  personal.location = locationCandidates[0] || '';

  return personal;
};

const mergeMetadataLine = (line = '') => {
  const date = extractDateText(line);
  const withoutDate = date ? cleanMetadataValue(line.replace(date, '')) : cleanMetadataValue(line);
  return { primary: withoutDate, date };
};

const parseExperienceBlock = (lines, nextId) => {
  const metaLines = [];
  const descLines = [];

  for (const line of lines) {
    if (looksLikeBulletLine(line) || (metaLines.length >= 2 && line.length > 24)) {
      descLines.push(line);
    } else {
      metaLines.push(line);
    }
  }

  if (!metaLines.length && descLines.length) {
    metaLines.push(descLines.shift());
  }

  const [firstLine = '', secondLine = ''] = metaLines;
  const headerTokens = splitMetaTokens(firstLine);

  let role = headerTokens[0] || firstLine;
  let company = '';
  let date = '';

  if (headerTokens.length > 1) {
    date = headerTokens.find((token) => extractDateText(token)) || extractDateText(firstLine);
    const companyTokens = headerTokens
      .slice(1)
      .filter((token) => token !== date && !extractDateText(token));
    company = companyTokens.join(' | ');
  }

  if ((!company || !date) && secondLine) {
    const parsedMeta = mergeMetadataLine(secondLine);
    company = company || parsedMeta.primary;
    date = date || parsedMeta.date;
  }

  const leftoverMeta = metaLines.slice(2);
  const description = [...leftoverMeta, ...descLines]
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

  return {
    id: nextId(),
    role: role.trim(),
    company: cleanMetadataValue(company),
    date: date.trim(),
    desc: description,
  };
};

const parseEducationBlock = (lines, nextId) => {
  const [firstLine = '', secondLine = '', thirdLine = ''] = lines;
  const headerTokens = splitMetaTokens(firstLine);

  let degree = headerTokens[0] || firstLine;
  let school = '';
  let date = '';

  if (headerTokens.length > 1) {
    date = headerTokens.find((token) => extractDateText(token)) || '';
    school = headerTokens
      .slice(1)
      .filter((token) => token !== date && !extractDateText(token))
      .join(' | ');
  }

  if ((!school || !date) && secondLine) {
    const parsedMeta = mergeMetadataLine(secondLine);
    school = school || parsedMeta.primary;
    date = date || parsedMeta.date;
  }

  if (!date && thirdLine) {
    date = extractDateText(thirdLine);
  }

  if (!school && secondLine && secondLine !== date) {
    school = secondLine.replace(date, '').trim() || secondLine;
  }

  return {
    id: nextId(),
    degree: degree.trim(),
    school: cleanMetadataValue(school),
    date: date.trim(),
  };
};

const parseProjectBlock = (lines, nextId) => {
  const [name = '', ...rest] = lines;
  return {
    id: nextId(),
    name: name.trim(),
    desc: rest.join('\n').trim(),
  };
};

const parseCertificationBlock = (lines, nextId) => {
  const [name = '', secondLine = '', thirdLine = ''] = lines;
  const secondLineMeta = mergeMetadataLine(secondLine);
  return {
    id: nextId(),
    name: name.trim(),
    issuer: cleanMetadataValue(secondLineMeta.primary),
    date: (secondLineMeta.date || extractDateText(thirdLine)).trim(),
  };
};

const parseAwardBlock = (lines, nextId) => {
  const [name = '', secondLine = '', thirdLine = ''] = lines;
  const issuer = [secondLine, thirdLine].filter(Boolean).join(' | ');
  return {
    id: nextId(),
    name: name.trim(),
    issuer: cleanMetadataValue(issuer),
  };
};

const parseVolunteeringBlock = (lines, nextId) => {
  const [role = '', secondLine = '', ...rest] = lines;
  const secondLineMeta = mergeMetadataLine(secondLine);
  return {
    id: nextId(),
    role: role.trim(),
    org: cleanMetadataValue(secondLineMeta.primary),
    date: secondLineMeta.date.trim(),
    desc: rest.join('\n').trim(),
  };
};

const parseLanguageLine = (line, nextId) => {
  const cleaned = removeBulletPrefix(line);
  const parts = cleaned.split(/\s*[|•·-]\s*/).map((part) => part.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return {
      id: nextId(),
      name: parts[0],
      level: parts.slice(1).join(' - '),
    };
  }

  return {
    id: nextId(),
    name: cleaned,
    level: '',
  };
};

export const extractResumeDataExact = (rawText = '') => {
  const sections = splitIntoSections(rawText);
  const nextId = createIdFactory();
  const resume = createEmptyResume();

  resume.personal = parseHeaderDetails(sections, rawText);
  resume.skills = parseSkillsSection(sections.skills);
  resume.experience = splitBlocks(sections.experience).map((block) => parseExperienceBlock(block, nextId));
  resume.education = splitBlocks(sections.education).map((block) => parseEducationBlock(block, nextId));
  resume.projects = splitBlocks(sections.projects).map((block) => parseProjectBlock(block, nextId));
  resume.certifications = splitBlocks(sections.certifications).map((block) => parseCertificationBlock(block, nextId));
  resume.awards = splitBlocks(sections.awards).map((block) => parseAwardBlock(block, nextId));
  resume.volunteering = splitBlocks(sections.volunteering).map((block) => parseVolunteeringBlock(block, nextId));
  resume.languages = sections.languages
    .filter(Boolean)
    .map((line) => parseLanguageLine(line, nextId));

  return resume;
};

export default extractResumeDataExact;
