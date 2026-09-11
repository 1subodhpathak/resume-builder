const normalizeSkillItems = (value) =>
  (Array.isArray(value) ? value : [])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

const mergeSkillItems = (...lists) => {
  const seen = new Set();

  return lists
    .flatMap((list) => normalizeSkillItems(list))
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const normalizeResumeSkills = (skills = {}) => {
  const technical = normalizeSkillItems(skills?.technical);
  const core = mergeSkillItems(skills?.core, skills?.soft);
  const soft = normalizeSkillItems(skills?.soft).filter(
    (item) => !core.some((coreItem) => coreItem.toLowerCase() === item.toLowerCase())
  );

  return { technical, core, soft };
};

const splitResumeLines = (value = '') =>
  String(value)
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

export const condenseResumeLines = (value = '', maxLines = 2) =>
  splitResumeLines(value)
    .slice(0, Math.max(1, maxLines))
    .join('\n');

export const trimResumeSkills = (skills = {}, totalLimit = 14) => {
  const normalized = normalizeResumeSkills(skills);
  const technicalCap = Math.min(
    normalized.technical.length,
    Math.max(6, Math.round(totalLimit * 0.65))
  );
  const technical = normalized.technical.slice(0, technicalCap);
  const remaining = Math.max(0, totalLimit - technical.length);
  const core = normalized.core.slice(0, remaining);

  return {
    technical,
    core,
    soft: [],
  };
};

const getSkillCount = (skills = {}) => {
  const normalized = normalizeResumeSkills(skills);
  return normalized.technical.length + normalized.core.length;
};

const getCondensedRoleCount = (beforeExperience = [], afterExperience = []) =>
  afterExperience.reduce((count, item, index) => {
    const previous = beforeExperience[index];
    if (!previous) return count;
    return item?.desc !== previous?.desc ? count + 1 : count;
  }, 0);

export const applyTemplateAction = (resumeData, actionId) => {
  if (!resumeData || !actionId) return resumeData;

  if (actionId === 'trim-skills') {
    return {
      ...resumeData,
      skills: trimResumeSkills(resumeData.skills, 14),
    };
  }

  if (actionId === 'condense-older-roles') {
    return {
      ...resumeData,
      experience: (resumeData.experience || []).map((item, index) => {
        if (index < 2) return item;

        const nextDesc = condenseResumeLines(item?.desc, 2);
        if (nextDesc === (item?.desc || '')) return item;

        return {
          ...item,
          fullDescBackup: item.fullDescBackup || item.desc || '',
          desc: nextDesc,
        };
      }),
    };
  }

  if (actionId === 'optimize-layout') {
    return applyTemplateAction(
      applyTemplateAction(resumeData, 'trim-skills'),
      'condense-older-roles'
    );
  }

  return resumeData;
};

export const applyTemplateActionWithDetails = (resumeData, actionId) => {
  const nextResumeData = applyTemplateAction(resumeData, actionId);
  if (!resumeData || !actionId) {
    return {
      resumeData: nextResumeData,
      details: null,
    };
  }

  const initialSkillCount = getSkillCount(resumeData.skills);
  const nextSkillCount = getSkillCount(nextResumeData.skills);
  const condensedRoleCount = getCondensedRoleCount(
    resumeData.experience || [],
    nextResumeData.experience || []
  );

  return {
    resumeData: nextResumeData,
    details: {
      actionId,
      initialSkillCount,
      nextSkillCount,
      trimmedSkillCount: Math.max(0, initialSkillCount - nextSkillCount),
      condensedRoleCount,
    },
  };
};
