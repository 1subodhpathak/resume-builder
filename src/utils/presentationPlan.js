import { enrichTemplatesWithMetadata } from '../data/templates';
import { getResumeInsights } from './resumeInsights';

const splitLines = (value = '') =>
  String(value)
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

const pickSkillLimit = (templateDensity, predictedPagePressure, mode) => {
  if (mode === 'tailor') {
    if (templateDensity === 'compact') return 10;
    if (templateDensity === 'spacious') return 16;
    return 12;
  }

  if (predictedPagePressure === 'high') {
    if (templateDensity === 'compact') return 8;
    if (templateDensity === 'spacious') return 14;
    return 10;
  }

  if (templateDensity === 'compact') return 12;
  if (templateDensity === 'spacious') return 20;
  return 16;
};

const pickRoleCompression = (insights, targetPages) => {
  if (targetPages >= 2 && insights.seniorityLevel !== 'entry') return 'moderate';
  if (insights.yearsExperienceEstimate >= 10 || insights.predictedPagePressure === 'high') return 'aggressive';
  if (insights.yearsExperienceEstimate >= 5) return 'moderate';
  return 'none';
};

const buildSectionStrategies = ({
  resumeData,
  insights,
  mode,
  resolvedTargetPages,
  skillsLimit,
  maxProjects,
  maxCertifications,
  maxBulletsPerRecentRole,
  maxBulletsPerOlderRole,
  recentRolesFull,
}) => {
  const experienceItems = Array.isArray(resumeData?.experience) ? resumeData.experience : [];
  const projectItems = Array.isArray(resumeData?.projects) ? resumeData.projects : [];
  const certificationItems = Array.isArray(resumeData?.certifications) ? resumeData.certifications : [];
  const summaryWordGap = (insights.summaryWords || 0) - 80;
  const overloadedRoles = experienceItems.filter((item, index) => {
    const lineCount = splitLines(item?.desc).length;
    const cap = index < recentRolesFull ? maxBulletsPerRecentRole : maxBulletsPerOlderRole;
    return lineCount > cap;
  }).length;
  const weakVerbScore = (insights.resumeScoreBreakdown || []).find((item) => item.key === 'verbs')?.score || 0;

  const strategies = [];

  strategies.push(
    summaryWordGap > 12
      ? {
          key: 'summary',
          label: 'Summary',
          action: 'trim',
          reason: `Current summary is running longer than the target for a ${resolvedTargetPages}-page resume.`,
          actionId: 'tighten-summary',
          actionLabel: 'Tighten summary',
        }
      : mode === 'tailor' || weakVerbScore < 68
        ? {
            key: 'summary',
            label: 'Summary',
            action: 'rewrite',
            reason: mode === 'tailor'
              ? 'Lead with sharper role alignment so the first scan feels more targeted.'
              : 'Rewrite for stronger positioning and a more recruiter-ready first impression.',
            actionId: 'review-summary',
            actionLabel: 'Review summary',
          }
        : {
            key: 'summary',
            label: 'Summary',
            action: 'keep',
            reason: 'Summary length and signal are already in a healthy range for this template.',
          }
  );

  strategies.push(
    overloadedRoles > 0 || insights.experienceCount > recentRolesFull + 1
      ? {
          key: 'experience',
          label: 'Experience',
          action: 'trim',
          reason: overloadedRoles > 0
            ? `${overloadedRoles} role${overloadedRoles === 1 ? '' : 's'} currently exceed the bullet budget for this layout.`
            : 'Older roles should be condensed so recent experience stays strongest on the page.',
          actionId: 'condense-roles',
          actionLabel: 'Condense roles',
        }
      : weakVerbScore < 68
        ? {
            key: 'experience',
            label: 'Experience',
            action: 'rewrite',
            reason: 'Bullet quality is weaker than it should be, so stronger achievement language will help.',
            actionId: 'rewrite-weakest-bullets',
            actionLabel: 'AI rewrite bullets',
          }
        : {
            key: 'experience',
            label: 'Experience',
            action: 'keep',
            reason: 'Experience depth fits the current page target without heavy compression.',
          }
  );

  strategies.push(
    insights.totalSkillCount > skillsLimit
      ? {
          key: 'skills',
          label: 'Skills',
          action: 'trim',
          reason: `${insights.totalSkillCount} visible skills is heavier than the target cap of ${skillsLimit}.`,
          actionId: 'trim-skills',
          actionLabel: 'Trim skills',
        }
      : {
          key: 'skills',
          label: 'Skills',
          action: 'keep',
          reason: 'Skill count is selective enough for this layout.',
        }
  );

  strategies.push(
    projectItems.length > maxProjects
      ? {
          key: 'projects',
          label: 'Projects',
          action: 'trim',
          reason: `Only the top ${maxProjects} project${maxProjects === 1 ? '' : 's'} should stay visible in this presentation plan.`,
          actionId: 'review-projects',
          actionLabel: 'Review projects',
        }
      : insights.projectDepth === 'high' && resolvedTargetPages === 1
        ? {
            key: 'projects',
            label: 'Projects',
            action: 'rewrite',
            reason: 'Project details are worth keeping, but they should be tightened to avoid crowding the page.',
            actionId: 'review-projects',
            actionLabel: 'Review projects',
          }
        : {
            key: 'projects',
            label: 'Projects',
            action: 'keep',
            reason: 'Project content is within the expected space for this template.',
          }
  );

  strategies.push(
    certificationItems.length > maxCertifications
      ? {
          key: 'certifications',
          label: 'Certifications',
          action: 'trim',
          reason: `Visible certifications should be capped around ${maxCertifications} for cleaner balance.`,
          actionId: 'review-certifications',
          actionLabel: 'Review certifications',
        }
      : {
          key: 'certifications',
          label: 'Certifications',
          action: 'keep',
          reason: 'Certification volume is already in a clean range.',
        }
  );

  return strategies;
};

export const createPresentationPlan = ({
  resumeData,
  templates = [],
  selectedTemplateId,
  mode = 'scratch',
  targetPages,
} = {}) => {
  const insights = getResumeInsights(resumeData);
  const enrichedTemplates = enrichTemplatesWithMetadata(templates);
  const selectedTemplate =
    enrichedTemplates.find((template) => template.id === selectedTemplateId) ||
    enrichedTemplates[0] ||
    {
      id: selectedTemplateId || 'professional',
      contentDensity: 'balanced',
      multiPageTolerance: 'medium',
      skillsCapacity: 'medium',
    };

  const resolvedTargetPages =
    targetPages || insights.recommendedPageCount || (selectedTemplate.multiPageTolerance === 'high' ? 2 : 1);
  const skillsLimit = pickSkillLimit(selectedTemplate.contentDensity, insights.predictedPagePressure, mode);
  const recentRolesFull =
    insights.seniorityLevel === 'executive' ? 4 : insights.seniorityLevel === 'senior' ? 3 : 2;
  const olderRolesCompression = pickRoleCompression(insights, resolvedTargetPages);
  const maxBulletsPerRecentRole = resolvedTargetPages >= 2 ? 5 : 4;
  const maxBulletsPerOlderRole = olderRolesCompression === 'aggressive' ? 1 : olderRolesCompression === 'moderate' ? 2 : 3;

  const warnings = [];
  if (insights.skillsOverflowRisk === 'high') {
    warnings.push('Visible skills should be curated instead of rendering the full extracted list.');
  }
  if (insights.predictedPagePressure === 'high' && selectedTemplate.contentDensity === 'compact') {
    warnings.push('Selected template may be too compact for current content density.');
  }

  const sectionStrategies = buildSectionStrategies({
    resumeData,
    insights,
    mode,
    resolvedTargetPages,
    skillsLimit,
    maxProjects: resolvedTargetPages >= 2 ? 3 : 2,
    maxCertifications: resolvedTargetPages >= 2 ? 4 : 2,
    maxBulletsPerRecentRole,
    maxBulletsPerOlderRole,
    recentRolesFull,
  });

  return {
    scenario: mode,
    targetPages: resolvedTargetPages,
    templateId: selectedTemplate.id,
    templateDensity: selectedTemplate.contentDensity,
    showSections: ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'],
    skillsLimit,
    skillsStrategy: mode === 'tailor' ? 'jd_weighted' : 'grouped_cap',
    recentRolesFull,
    olderRolesCompression,
    maxBulletsPerRecentRole,
    maxBulletsPerOlderRole,
    maxProjects: resolvedTargetPages >= 2 ? 3 : 2,
    maxCertifications: resolvedTargetPages >= 2 ? 4 : 2,
    summaryTargetWords: insights.seniorityLevel === 'executive' ? 95 : 80,
    atsPriority: mode === 'tailor' ? 'high' : mode === 'scratch' ? 'medium' : 'medium',
    toneProfile: mode === 'tailor' ? 'industry-specific' : insights.seniorityLevel === 'executive' ? 'executive' : 'recruiter-strong',
    templateFitReason: `Matched to ${insights.roleFamily} content with ${insights.predictedPagePressure} page pressure and ${selectedTemplate.contentDensity} density.`,
    warnings,
    sectionStrategies,
    analysisSnapshot: {
      yearsExperienceEstimate: insights.yearsExperienceEstimate,
      roleFamily: insights.roleFamily,
      seniorityLevel: insights.seniorityLevel,
      contentDensity: insights.contentDensity,
      predictedPagePressure: insights.predictedPagePressure,
      skillsOverflowRisk: insights.skillsOverflowRisk,
    },
  };
};
