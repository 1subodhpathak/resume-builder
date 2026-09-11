import {
  fetchAllUserDataFromBackend,
  updateBackendProfile,
  saveBackendResumeRecord,
  deleteBackendResumeRecord,
  saveBackendResumeUpload,
  deleteBackendResumeUpload,
  saveBackendJobDescription,
  deleteBackendJobDescription,
  logBackendAtsHistory,
  logBackendInterviewPrepHistory,
  markBackendResumePrinted,
} from './resumeApiService';

import { getSubscriptionStatus } from './subscriptionService';

const getStorageKey = () => {
  if (typeof window === 'undefined') return 'careersense_resume_repo_unauthenticated';

  // Wipe out any legacy mock data or unauthenticated keys from old localstorage
  try {
    const legacyKeys = [
      'careersense_resume_repository_v1',
      'careersense_resume_repo_guest',
      'resume_builder_workspace_snapshot_guest',
      'careersense_points'
    ];
    legacyKeys.forEach(k => {
      if (window.localStorage.getItem(k)) {
        window.localStorage.removeItem(k);
      }
    });
  } catch (e) {
    // ignore
  }

  const uid = typeof window !== 'undefined' ? (window.clerkUserId || window.sessionStorage?.getItem('careersense_clerk_id')) : null;
  return uid ? `careersense_resume_repo_${uid}` : 'careersense_resume_repo_unauthenticated';
};

export const CAREER_POINTS_PER_USD = 50000;
export const AI_TOKENS_PER_USD = 50000;
const MAX_STORED_UPLOADS = 20;
const MAX_STORED_READINESS_SNAPSHOTS = 25;
const MAX_STORED_ANALYTICS_ENTRIES = 500;
const MAX_STORED_AI_HISTORY_ENTRIES = 10;

const createId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

// Asynchronously dispatch cloud updates in the background without blocking UI
const dispatchCloudSync = (syncFn) => {
  if (typeof window === 'undefined') return;
  Promise.resolve().then(() => syncFn()).catch((err) => {
    console.warn('[ResumeBuilder Cloud Sync Warning]', err.message);
  });
};

const createEmptyRepository = () => ({
  profile: {
    id: 'default-profile',
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    photo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  analytics: {
    tokenUsage: [],
  },
  resumes: [],
  uploads: {
    resumes: [],
    jobDescriptions: [],
  },
});

const safeReadStorage = () => {
  if (typeof window === 'undefined') return createEmptyRepository();

  try {
    const key = getStorageKey();
    const raw = window.localStorage.getItem(key);
    if (!raw) return createEmptyRepository();

    const parsed = JSON.parse(raw);
    return {
      ...createEmptyRepository(),
      ...parsed,
      profile: {
        ...createEmptyRepository().profile,
        ...(parsed?.profile || {}),
      },
      analytics: {
        ...createEmptyRepository().analytics,
        ...(parsed?.analytics || {}),
        tokenUsage: Array.isArray(parsed?.analytics?.tokenUsage) ? parsed.analytics.tokenUsage : [],
      },
      resumes: Array.isArray(parsed?.resumes) ? parsed.resumes : [],
      uploads: {
        ...createEmptyRepository().uploads,
        ...(parsed?.uploads || {}),
        resumes: Array.isArray(parsed?.uploads?.resumes) ? parsed.uploads.resumes : [],
        jobDescriptions: Array.isArray(parsed?.uploads?.jobDescriptions)
          ? parsed.uploads.jobDescriptions
          : [],
      },
    };
  } catch (error) {
    console.warn('Unable to read resume repository', error);
    return createEmptyRepository();
  }
};

const withoutEmbeddedResumeSnapshot = (entry = {}) => {
  const { resumeSnapshot, ...compactEntry } = entry;
  return compactEntry;
};

const compactRepositoryForStorage = (repository) => ({
  ...repository,
  profile: {
    ...(repository.profile || {}),
    // The same photo is already present on the saved resume. Avoid storing a
    // second multi-megabyte data URL on the shared profile record.
    photo: String(repository.profile?.photo || '').startsWith('data:')
      ? null
      : repository.profile?.photo || null,
  },
  analytics: {
    ...(repository.analytics || {}),
    tokenUsage: (repository.analytics?.tokenUsage || []).slice(0, MAX_STORED_ANALYTICS_ENTRIES),
  },
  resumes: (repository.resumes || []).map((record) => ({
    ...record,
    atsHistory: (record.atsHistory || [])
      .slice(0, MAX_STORED_AI_HISTORY_ENTRIES)
      .map(withoutEmbeddedResumeSnapshot),
    interviewPrepHistory: (record.interviewPrepHistory || [])
      .slice(0, MAX_STORED_AI_HISTORY_ENTRIES)
      .map(withoutEmbeddedResumeSnapshot),
    exportReadinessHistory: (record.exportReadinessHistory || []).slice(
      0,
      MAX_STORED_READINESS_SNAPSHOTS
    ),
  })),
});

const safeWriteStorage = (repository) => {
  if (typeof window === 'undefined') return repository;

  const key = getStorageKey();
  const storageRepository = compactRepositoryForStorage(repository);

  try {
    window.localStorage.setItem(key, JSON.stringify(storageRepository));
    return storageRepository;
  } catch (error) {
    const isQuotaError =
      error?.name === 'QuotaExceededError' ||
      error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22 ||
      error?.code === 1014;

    if (isQuotaError) {
      const compactRepository = {
        ...storageRepository,
        analytics: {
          ...(storageRepository.analytics || {}),
          tokenUsage: (storageRepository.analytics?.tokenUsage || []).slice(0, 100),
        },
        uploads: {
          ...(storageRepository.uploads || {}),
          resumes: (storageRepository.uploads?.resumes || []).slice(0, 5),
          jobDescriptions: (storageRepository.uploads?.jobDescriptions || []).slice(0, 5),
        },
      };

      try {
        window.localStorage.setItem(key, JSON.stringify(compactRepository));
        return compactRepository;
      } catch (compactError) {
        console.warn('Unable to save compacted resume repository', compactError);
        return safeReadStorage();
      }
    }

    console.warn('Unable to save resume repository', error);
    return safeReadStorage();
  }
};


const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const mergeProfileField = (existingValue, nextValue) => {
  const trimmedNextValue = toTrimmedString(nextValue);
  return trimmedNextValue || existingValue || '';
};

const mergeProfileFromResume = (currentProfile, resumeData, updatedAt) => {
  const personal = resumeData?.personal || {};

  return {
    ...currentProfile,
    name: mergeProfileField(currentProfile?.name, personal.name),
    title: mergeProfileField(currentProfile?.title, personal.title),
    email: mergeProfileField(currentProfile?.email, personal.email),
    phone: mergeProfileField(currentProfile?.phone, personal.phone),
    location: mergeProfileField(currentProfile?.location, personal.location),
    linkedin: mergeProfileField(currentProfile?.linkedin, personal.linkedin),
    photo: personal.photo || currentProfile?.photo || null,
    updatedAt: updatedAt || new Date().toISOString(),
  };
};

const buildResumeTitle = (resumeData, templateId) => {
  const name = toTrimmedString(resumeData?.personal?.name);
  const title = toTrimmedString(resumeData?.personal?.title);

  if (name && title) return `${name} · ${title}`;
  if (name) return `${name} · Resume`;
  if (title) return `${title} Resume`;
  if (templateId) return `${templateId} Resume`;
  return 'Untitled Resume';
};

const normalizeStoredText = (value) => (typeof value === 'string' ? value.trim() : '');

const buildUploadedResumeName = ({ name, text } = {}) => {
  const fileName = toTrimmedString(name);
  if (fileName) return fileName;

  const firstLine = normalizeStoredText(text)
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? `${firstLine.slice(0, 72)} Resume` : 'Uploaded Resume';
};

const buildUploadedJobDescriptionTitle = ({ title, sourceName, text } = {}) => {
  const explicitTitle = toTrimmedString(title);
  if (explicitTitle) return explicitTitle;

  const fileName = toTrimmedString(sourceName);
  if (fileName) return fileName;

  const firstLine = normalizeStoredText(text)
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? firstLine.slice(0, 72) : 'Job Description';
};

const sortByUpdatedAtDesc = (items = []) =>
  [...items].sort(
    (left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() -
      new Date(left.updatedAt || left.createdAt || 0).getTime()
  );

const upsertStoredUpload = ({ collectionKey, entry, idPrefix }) => {
  const text = normalizeStoredText(entry?.text);
  if (!text) return null;

  const repository = safeReadStorage();
  const uploads = repository.uploads || createEmptyRepository().uploads;
  const currentCollection = Array.isArray(uploads[collectionKey]) ? uploads[collectionKey] : [];
  const now = new Date().toISOString();
  const existingRecord = currentCollection.find(
    (record) =>
      record.id === entry.id ||
      (normalizeStoredText(record.text) === text &&
        (toTrimmedString(record.name) === toTrimmedString(entry.name) ||
          toTrimmedString(record.title) === toTrimmedString(entry.title) ||
          toTrimmedString(record.sourceName) === toTrimmedString(entry.sourceName)))
  );

  const nextRecord = {
    ...existingRecord,
    ...entry,
    id: existingRecord?.id || entry.id || createId(idPrefix),
    text,
    textLength: text.length,
    createdAt: existingRecord?.createdAt || entry.createdAt || now,
    updatedAt: now,
  };

  const nextCollection = [
    nextRecord,
    ...currentCollection.filter((record) => record.id !== nextRecord.id),
  ].slice(0, MAX_STORED_UPLOADS);

  const nextRepository = safeWriteStorage({
    ...repository,
    uploads: {
      ...uploads,
      [collectionKey]: nextCollection,
    },
  });

  return nextRepository.uploads[collectionKey][0] || nextRecord;
};

export const getResumeRepository = () => safeReadStorage();

const startOfDayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const startOfMonthKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const formatDayLabel = (dateKey) => {
  if (!dateKey) return 'Unknown';

  try {
    return new Date(`${dateKey}T00:00:00`).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateKey;
  }
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey) return 'Unknown';

  const [year, month] = monthKey.split('-');
  try {
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString([], {
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return monthKey;
  }
};

const createUsageAccumulator = (key, label) => ({
  key,
  label,
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
  calls: 0,
});

const aggregateUsage = (entries, getKey, getLabel, limit) => {
  const grouped = entries.reduce((map, entry) => {
    const key = getKey(entry.createdAt);
    if (!key) return map;

    if (!map.has(key)) {
      map.set(key, createUsageAccumulator(key, getLabel(key)));
    }

    const bucket = map.get(key);
    bucket.totalTokens += entry.totalTokens || 0;
    bucket.promptTokens += entry.promptTokens || 0;
    bucket.completionTokens += entry.completionTokens || 0;
    bucket.calls += 1;
    return map;
  }, new Map());

  return Array.from(grouped.values())
    .sort((left, right) => right.key.localeCompare(left.key))
    .slice(0, limit)
    .reverse();
};

const aggregateUsageByOperation = (entries) => {
  const grouped = entries.reduce((map, entry) => {
    const key = entry.operation || 'unknown_operation';
    if (!map.has(key)) {
      map.set(key, {
        operation: key,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        calls: 0,
      });
    }

    const bucket = map.get(key);
    bucket.totalTokens += entry.totalTokens || 0;
    bucket.promptTokens += entry.promptTokens || 0;
    bucket.completionTokens += entry.completionTokens || 0;
    bucket.calls += 1;
    return map;
  }, new Map());

  return Array.from(grouped.values()).sort((left, right) => right.totalTokens - left.totalTokens);
};

const normalizeUsageNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

export const convertCareerPointsToUsd = (careerPoints = 0) =>
  normalizeUsageNumber(careerPoints) / CAREER_POINTS_PER_USD;

export const formatUsdAmount = (usdAmount = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(Number(usdAmount || 0));

export const formatUsdFromCareerPoints = (careerPoints = 0) =>
  formatUsdAmount(convertCareerPointsToUsd(careerPoints));

export const getResumeProfile = () => safeReadStorage().profile;

export const getTokenUsageEntries = () =>
  [...(safeReadStorage().analytics?.tokenUsage || [])].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

export const recordAiTokenUsage = ({
  provider = 'groq',
  source = 'ai',
  operation = 'unknown_operation',
  model = '',
  usage = {},
  metadata = {},
}) => {
  const promptTokens = normalizeUsageNumber(usage?.prompt_tokens ?? usage?.input_tokens);
  const completionTokens = normalizeUsageNumber(usage?.completion_tokens ?? usage?.output_tokens);
  const totalTokens = normalizeUsageNumber(usage?.total_tokens) || promptTokens + completionTokens;

  if (!promptTokens && !completionTokens && !totalTokens) {
    return null;
  }

  const repository = safeReadStorage();
  const entry = {
    id: createId('usage'),
    createdAt: new Date().toISOString(),
    provider,
    source,
    operation,
    model: model || '',
    promptTokens,
    completionTokens,
    totalTokens,
    metadata,
  };

  const nextRepository = safeWriteStorage({
    ...repository,
    analytics: {
      ...repository.analytics,
      tokenUsage: [entry, ...(repository.analytics?.tokenUsage || [])].slice(
        0,
        MAX_STORED_ANALYTICS_ENTRIES
      ),
    },
  });

  return nextRepository.analytics.tokenUsage[0] || entry;
};

export const getTokenUsageAnalytics = () => {
  const entries = getTokenUsageEntries();
  const now = new Date();
  const todayKey = startOfDayKey(now);
  const currentMonthKey = startOfMonthKey(now);

  const totalTokens = entries.reduce((sum, entry) => sum + (entry.totalTokens || 0), 0);
  const totalPromptTokens = entries.reduce((sum, entry) => sum + (entry.promptTokens || 0), 0);
  const totalCompletionTokens = entries.reduce((sum, entry) => sum + (entry.completionTokens || 0), 0);
  const totalCalls = entries.length;
  const todayTokens = entries
    .filter((entry) => startOfDayKey(entry.createdAt) === todayKey)
    .reduce((sum, entry) => sum + (entry.totalTokens || 0), 0);
  const currentMonthTokens = entries
    .filter((entry) => startOfMonthKey(entry.createdAt) === currentMonthKey)
    .reduce((sum, entry) => sum + (entry.totalTokens || 0), 0);

  return {
    totalTokens,
    totalPromptTokens,
    totalCompletionTokens,
    totalCalls,
    todayTokens,
    currentMonthTokens,
    averageTokensPerCall: totalCalls ? Math.round(totalTokens / totalCalls) : 0,
    dailyUsage: aggregateUsage(entries, startOfDayKey, formatDayLabel, 7),
    monthlyUsage: aggregateUsage(entries, startOfMonthKey, formatMonthLabel, 6),
    operationUsage: aggregateUsageByOperation(entries).slice(0, 8),
    recentUsage: entries.slice(0, 10),
  };
};

export const syncWithCloudBackend = async (getToken, clerkUserId = null) => {
  try {
    if (typeof window !== 'undefined' && clerkUserId) {
      window.clerkUserId = clerkUserId;
    }
    const cloudData = await fetchAllUserDataFromBackend(getToken);
    if (!cloudData) return null;

    const local = safeReadStorage();
    
    // Safely merge cloud resumes with local resumes so active local edits aren't wiped
    const cloudResumes = Array.isArray(cloudData.resumes) ? cloudData.resumes : [];
    const localResumes = Array.isArray(local.resumes) ? local.resumes : [];
    const resumeMap = new Map();

    cloudResumes.forEach((r) => {
      if (!r?.id) return;
      const normalizedCloudResume = {
        ...r,
        atsHistory: (r.atsHistory || []).map((entry) => {
          const score = Number(entry?.score ?? entry?.result?.score ?? r.atsScore ?? 0);
          const feedback = entry?.feedback || entry?.result?.feedback || r.atsFeedback || '';
          const matchedKeywords = Array.isArray(entry?.matchedKeywords)
            ? entry.matchedKeywords
            : (Array.isArray(entry?.result?.matched_keywords)
              ? entry.result.matched_keywords
              : (Array.isArray(entry?.result?.matchedKeywords) ? entry.result.matchedKeywords : []));
          const missingKeywords = Array.isArray(entry?.missingKeywords)
            ? entry.missingKeywords
            : (Array.isArray(entry?.result?.missing_keywords)
              ? entry.result.missing_keywords
              : (Array.isArray(entry?.result?.missingKeywords) ? entry.result.missingKeywords : []));
          return {
            ...entry,
            score,
            feedback,
            matchedKeywords,
            missingKeywords,
            result: entry?.result || {
              score,
              feedback,
              matched_keywords: matchedKeywords,
              missing_keywords: missingKeywords,
              matchedKeywords,
              missingKeywords,
            },
          };
        }),
        interviewPrepHistory: (r.interviewPrepHistory || []).map((entry) => {
          const questions = Array.isArray(entry?.questions)
            ? entry.questions
            : (Array.isArray(entry?.result?.questions) ? entry.result.questions : []);
          return {
            ...entry,
            questions,
            result: entry?.result || { questions },
          };
        }),
      };
      resumeMap.set(r.id, normalizedCloudResume);
    });

    localResumes.forEach((r) => {
      if (!r?.id) return;
      const existing = resumeMap.get(r.id);
      if (!existing) {
        resumeMap.set(r.id, r);
        dispatchCloudSync(() => saveBackendResumeRecord(r));
      } else {
        const localTime = new Date(r.updatedAt || 0).getTime();
        const cloudTime = new Date(existing.updatedAt || 0).getTime();
        const hasContent = Boolean(r.resumeData?.personal?.name || r.resumeData?.experience?.length);

        // Smart merge histories so scans are never wiped
        const mergedAtsHistory = [...(r.atsHistory || [])];
        (existing.atsHistory || []).forEach((cEntry) => {
          if (!mergedAtsHistory.some((lEntry) => lEntry.id === cEntry.id)) {
            mergedAtsHistory.push(cEntry);
          }
        });

        const mergedPrepHistory = [...(r.interviewPrepHistory || [])];
        (existing.interviewPrepHistory || []).forEach((cEntry) => {
          if (!mergedPrepHistory.some((lEntry) => lEntry.id === cEntry.id)) {
            mergedPrepHistory.push(cEntry);
          }
        });

        const chosenResume = (localTime >= cloudTime && hasContent) ? r : existing;
        const mergedResume = {
          ...chosenResume,
          atsScore: chosenResume.atsScore ?? existing.atsScore ?? r.atsScore ?? (mergedAtsHistory[0]?.score ?? null),
          atsFeedback: chosenResume.atsFeedback || existing.atsFeedback || r.atsFeedback || (mergedAtsHistory[0]?.feedback || ''),
          matchedKeywords: chosenResume.matchedKeywords?.length ? chosenResume.matchedKeywords : (existing.matchedKeywords?.length ? existing.matchedKeywords : (r.matchedKeywords || [])),
          missingKeywords: chosenResume.missingKeywords?.length ? chosenResume.missingKeywords : (existing.missingKeywords?.length ? existing.missingKeywords : (r.missingKeywords || [])),
          atsHistory: mergedAtsHistory.slice(0, MAX_STORED_AI_HISTORY_ENTRIES),
          interviewPrepHistory: mergedPrepHistory.slice(0, MAX_STORED_AI_HISTORY_ENTRIES),
        };

        resumeMap.set(r.id, mergedResume);
      }
    });

    const userResumes = Array.from(resumeMap.values()).sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );

    const userProfile = {
      ...local.profile,
      ...(cloudData.profile || {}),
    };

    const userUploads = {
      resumes: cloudData.uploads?.resumes?.length ? cloudData.uploads.resumes : (local.uploads?.resumes || []),
      jobDescriptions: cloudData.uploads?.jobDescriptions?.length ? cloudData.uploads.jobDescriptions : (local.uploads?.jobDescriptions || []),
    };

    const userAnalytics = {
      tokenUsage: Array.isArray(cloudData.analytics?.tokenUsage) && cloudData.analytics.tokenUsage.length
        ? cloudData.analytics.tokenUsage
        : (local.analytics?.tokenUsage || []),
    };

    const syncedRepository = {
      profile: userProfile,
      resumes: userResumes,
      uploads: userUploads,
      analytics: userAnalytics,
    };

    safeWriteStorage(syncedRepository);
    return cloudData;
  } catch (err) {
    console.warn('[ResumeBuilder syncWithCloudBackend error]', err.message);
    return null;
  }
};

export const updateResumeProfile = (patch = {}) => {
  const repository = safeReadStorage();
  const nextProfile = {
    ...repository.profile,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const savedProfile = safeWriteStorage({
    ...repository,
    profile: nextProfile,
  }).profile;

  dispatchCloudSync(() => updateBackendProfile(nextProfile));
  return savedProfile;
};

export const upsertProfileFromResume = (resumeData) => {
  const repository = safeReadStorage();
  const currentProfile = repository.profile || createEmptyRepository().profile;
  const nextProfile = mergeProfileFromResume(currentProfile, resumeData);

  const savedProfile = safeWriteStorage({
    ...repository,
    profile: nextProfile,
  }).profile;

  dispatchCloudSync(() => updateBackendProfile(nextProfile));
  return savedProfile;
};

export const saveUploadedResume = ({ name = '', type = '', size = 0, text = '' } = {}) => {
  const storedText = normalizeStoredText(text);
  if (!storedText) return null;

  const record = upsertStoredUpload({
    collectionKey: 'resumes',
    idPrefix: 'resume_upload',
    entry: {
      name: buildUploadedResumeName({ name, text: storedText }),
      sourceName: toTrimmedString(name),
      type: type || '',
      size: Number(size || 0),
      text: storedText,
    },
  });

  if (record) {
    dispatchCloudSync(() => saveBackendResumeUpload(record));
  }
  return record;
};

export const listUploadedResumes = () =>
  sortByUpdatedAtDesc(safeReadStorage().uploads?.resumes || []);

export const getUploadedResume = (uploadId) => {
  if (!uploadId) return null;
  return (safeReadStorage().uploads?.resumes || []).find((record) => record.id === uploadId) || null;
};

export const saveUploadedJobDescription = ({
  title = '',
  sourceName = '',
  type = '',
  size = 0,
  text = '',
} = {}) => {
  const storedText = normalizeStoredText(text);
  if (!storedText) return null;

  const record = upsertStoredUpload({
    collectionKey: 'jobDescriptions',
    idPrefix: 'jd_upload',
    entry: {
      title: buildUploadedJobDescriptionTitle({ title, sourceName, text: storedText }),
      sourceName: toTrimmedString(sourceName),
      type: type || '',
      size: Number(size || 0),
      text: storedText,
    },
  });

  if (record) {
    dispatchCloudSync(() => saveBackendJobDescription(record));
  }
  return record;
};

export const listUploadedJobDescriptions = () =>
  sortByUpdatedAtDesc(safeReadStorage().uploads?.jobDescriptions || []);

export const getUploadedJobDescription = (uploadId) => {
  if (!uploadId) return null;
  return (safeReadStorage().uploads?.jobDescriptions || []).find((record) => record.id === uploadId) || null;
};

export const saveResumeRecord = ({
  resumeId,
  resumeData,
  selectedTemplate,
  mode = 'scratch',
  importMode = 'ai-enhanced',
  jdText = '',
}) => {
  const repository = safeReadStorage();
  const now = new Date().toISOString();
  const nextId = resumeId || createId('resume');
  const existingRecord = repository.resumes.find((record) => record.id === nextId);

  const hasIncomingContent = Boolean(
    String(resumeData?.personal?.name || '').trim() ||
    String(resumeData?.personal?.email || '').trim() ||
    (Array.isArray(resumeData?.experience) && resumeData.experience.length > 0) ||
    (Array.isArray(resumeData?.skills?.technical) && resumeData.skills.technical.length > 0)
  );

  const effectiveResumeData = hasIncomingContent
    ? resumeData
    : (existingRecord?.resumeData || resumeData);

  const rawAtsHistory = Array.isArray(existingRecord?.atsHistory) ? existingRecord.atsHistory : [];
  const normalizedAtsHistory = rawAtsHistory.map((entry) => {
    const score = Number(entry?.score ?? entry?.result?.score ?? existingRecord?.atsScore ?? 0);
    const feedback = entry?.feedback || entry?.result?.feedback || existingRecord?.atsFeedback || '';
    const matchedKeywords = Array.isArray(entry?.matchedKeywords)
      ? entry.matchedKeywords
      : (Array.isArray(entry?.result?.matched_keywords)
        ? entry.result.matched_keywords
        : (Array.isArray(entry?.result?.matchedKeywords) ? entry.result.matchedKeywords : []));
    const missingKeywords = Array.isArray(entry?.missingKeywords)
      ? entry.missingKeywords
      : (Array.isArray(entry?.result?.missing_keywords)
        ? entry.result.missing_keywords
        : (Array.isArray(entry?.result?.missingKeywords) ? entry.result.missingKeywords : []));

    return {
      id: entry?.id || createId('ats'),
      resumeId: entry?.resumeId || nextId,
      jdText: entry?.jdText || jdText || existingRecord?.jdText || '',
      score,
      feedback,
      matchedKeywords,
      missingKeywords,
      result: entry?.result || {
        score,
        feedback,
        matched_keywords: matchedKeywords,
        missing_keywords: missingKeywords,
        matchedKeywords,
        missingKeywords,
      },
      createdAt: entry?.createdAt || now,
    };
  });

  const rawPrepHistory = Array.isArray(existingRecord?.interviewPrepHistory) ? existingRecord.interviewPrepHistory : [];
  const normalizedPrepHistory = rawPrepHistory.map((entry) => {
    const questions = Array.isArray(entry?.questions)
      ? entry.questions
      : (Array.isArray(entry?.result?.questions) ? entry.result.questions : []);

    return {
      id: entry?.id || createId('prep'),
      resumeId: entry?.resumeId || nextId,
      jdText: entry?.jdText || jdText || existingRecord?.jdText || '',
      questions,
      result: entry?.result || { questions },
      createdAt: entry?.createdAt || now,
    };
  });

  const nextAtsScore = existingRecord?.atsScore != null
    ? Number(existingRecord.atsScore)
    : (normalizedAtsHistory[0]?.score != null ? normalizedAtsHistory[0].score : null);

  const nextRecord = {
    id: nextId,
    title: buildResumeTitle(effectiveResumeData, selectedTemplate || existingRecord?.selectedTemplate),
    mode: mode || existingRecord?.mode || 'scratch',
    importMode: importMode || existingRecord?.importMode || 'ai-enhanced',
    selectedTemplate: selectedTemplate || existingRecord?.selectedTemplate || 'professional',
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now,
    lastOpenedAt: now,
    lastPrintedAt: existingRecord?.lastPrintedAt || null,
    personalSnapshot: {
      name: toTrimmedString(effectiveResumeData?.personal?.name),
      title: toTrimmedString(effectiveResumeData?.personal?.title),
      email: toTrimmedString(effectiveResumeData?.personal?.email),
      phone: toTrimmedString(effectiveResumeData?.personal?.phone),
      location: toTrimmedString(effectiveResumeData?.personal?.location),
    },
    jdText: jdText || existingRecord?.jdText || '',
    atsScore: nextAtsScore,
    atsFeedback: existingRecord?.atsFeedback || (normalizedAtsHistory[0]?.feedback || ''),
    matchedKeywords: Array.isArray(existingRecord?.matchedKeywords) && existingRecord.matchedKeywords.length
      ? existingRecord.matchedKeywords
      : (normalizedAtsHistory[0]?.matchedKeywords || []),
    missingKeywords: Array.isArray(existingRecord?.missingKeywords) && existingRecord.missingKeywords.length
      ? existingRecord.missingKeywords
      : (normalizedAtsHistory[0]?.missingKeywords || []),
    resumeData: effectiveResumeData,
    atsHistory: normalizedAtsHistory,
    interviewPrepHistory: normalizedPrepHistory,
    exportReadinessHistory: Array.isArray(existingRecord?.exportReadinessHistory) ? existingRecord.exportReadinessHistory : [],
  };

  const nextResumes = existingRecord
    ? repository.resumes.map((record) => (record.id === nextId ? nextRecord : record))
    : [nextRecord, ...repository.resumes];

  const nextRepository = safeWriteStorage({
    ...repository,
    profile: mergeProfileFromResume(
      repository.profile || createEmptyRepository().profile,
      resumeData,
      now
    ),
    resumes: nextResumes,
  });

  const savedRecord = nextRepository.resumes.find((record) => record.id === nextId);
  if (savedRecord) {
    dispatchCloudSync(() => saveBackendResumeRecord(savedRecord));
  }
  return savedRecord?.updatedAt === now ? savedRecord : null;
};

export const getResumeRecord = (resumeId) => {
  if (!resumeId) return null;
  return safeReadStorage().resumes.find((record) => record.id === resumeId) || null;
};

export const listResumeRecords = () =>
  [...safeReadStorage().resumes].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );

export const deleteResumeRecord = (resumeId) => {
  const repository = safeReadStorage();
  const nextRepository = safeWriteStorage({
    ...repository,
    resumes: repository.resumes.filter((record) => record.id !== resumeId),
  });

  dispatchCloudSync(() => deleteBackendResumeRecord(resumeId));
  return nextRepository.resumes;
};

export const markResumePrinted = (resumeId) => {
  if (!resumeId) return null;

  const repository = safeReadStorage();
  const now = new Date().toISOString();
  const nextResumes = repository.resumes.map((record) =>
    record.id === resumeId
      ? { ...record, lastPrintedAt: now, updatedAt: now }
      : record
  );

  safeWriteStorage({
    ...repository,
    resumes: nextResumes,
  });

  dispatchCloudSync(() => markBackendResumePrinted(resumeId));
  return nextResumes.find((record) => record.id === resumeId) || null;
};

export const appendATSResult = ({ resumeId, jdText = '', result }) => {
  if (!resumeId || !result) return null;

  const repository = safeReadStorage();
  const sourceRecord = repository.resumes.find((record) => record.id === resumeId) || null;
  const score = Number(result?.score ?? 0);
  const feedback = result?.feedback || '';
  const matchedKeywords = Array.isArray(result?.matched_keywords)
    ? result.matched_keywords
    : (Array.isArray(result?.matchedKeywords) ? result.matchedKeywords : []);
  const missingKeywords = Array.isArray(result?.missing_keywords)
    ? result.missing_keywords
    : (Array.isArray(result?.missingKeywords) ? result.missingKeywords : []);

  const entry = {
    id: createId('ats'),
    resumeId,
    createdAt: new Date().toISOString(),
    jdText,
    score,
    feedback,
    matchedKeywords,
    missingKeywords,
    result: {
      score,
      feedback,
      matched_keywords: matchedKeywords,
      missing_keywords: missingKeywords,
      matchedKeywords,
      missingKeywords,
    },
    resumeTitle: sourceRecord?.title || 'Saved Resume',
    selectedTemplate: sourceRecord?.selectedTemplate || '',
  };

  const nextResumes = repository.resumes.map((record) =>
    record.id === resumeId
      ? {
          ...record,
          jdText: jdText || record.jdText || '',
          atsScore: score,
          atsFeedback: feedback,
          matchedKeywords,
          missingKeywords,
          updatedAt: entry.createdAt,
          atsHistory: [entry, ...(record.atsHistory || []).filter((h) => h.id !== entry.id)].slice(
            0,
            MAX_STORED_AI_HISTORY_ENTRIES
          ),
        }
      : record
  );

  safeWriteStorage({
    ...repository,
    resumes: nextResumes,
  });

  const updatedSavedRecord = nextResumes.find((r) => r.id === resumeId);
  if (updatedSavedRecord) {
    dispatchCloudSync(() => saveBackendResumeRecord(updatedSavedRecord));
  }
  dispatchCloudSync(() => logBackendAtsHistory(resumeId, jdText, result));
  return entry;
};

export const appendInterviewPrepResult = ({ resumeId, jdText = '', result }) => {
  if (!resumeId || !result) return null;

  const repository = safeReadStorage();
  const sourceRecord = repository.resumes.find((record) => record.id === resumeId) || null;
  const questions = Array.isArray(result?.questions) ? result.questions : [];

  const entry = {
    id: createId('prep'),
    resumeId,
    createdAt: new Date().toISOString(),
    jdText,
    questions,
    result: {
      questions,
    },
    resumeTitle: sourceRecord?.title || 'Saved Resume',
    selectedTemplate: sourceRecord?.selectedTemplate || '',
  };

  const nextResumes = repository.resumes.map((record) =>
    record.id === resumeId
      ? {
          ...record,
          jdText: jdText || record.jdText || '',
          updatedAt: entry.createdAt,
          interviewPrepHistory: [entry, ...(record.interviewPrepHistory || []).filter((h) => h.id !== entry.id)].slice(
            0,
            MAX_STORED_AI_HISTORY_ENTRIES
          ),
        }
      : record
  );

  safeWriteStorage({
    ...repository,
    resumes: nextResumes,
  });

  const updatedSavedRecord = nextResumes.find((r) => r.id === resumeId);
  if (updatedSavedRecord) {
    dispatchCloudSync(() => saveBackendResumeRecord(updatedSavedRecord));
  }
  dispatchCloudSync(() => logBackendInterviewPrepHistory(resumeId, jdText, result));
  return entry;
};

export const appendExportReadinessSnapshot = ({
  resumeId,
  summary = {},
  items = [],
  source = 'manual_check',
  snapshot = {},
} = {}) => {
  if (!resumeId) return null;

  const repository = safeReadStorage();
  const sourceRecord = repository.resumes.find((record) => record.id === resumeId) || null;
  if (!sourceRecord) return null;

  const entry = {
    id: createId('readiness'),
    createdAt: new Date().toISOString(),
    source,
    summary: {
      blockerCount: Number(summary.blockerCount || 0),
      warningCount: Number(summary.warningCount || 0),
      ready: Boolean(summary.ready),
    },
    items: Array.isArray(items)
      ? items.map((item) => ({
          key: item.key || '',
          label: item.label || '',
          status: item.status || 'warning',
        }))
      : [],
    snapshot: {
      resumeScore: Number(snapshot.resumeScore || 0),
      summaryWords: Number(snapshot.summaryWords || 0),
      totalSkills: Number(snapshot.totalSkills || 0),
      technicalSkills: Number(snapshot.technicalSkills || 0),
      coreSkills: Number(snapshot.coreSkills || 0),
      experienceCount: Number(snapshot.experienceCount || 0),
      projectCount: Number(snapshot.projectCount || 0),
      certificationCount: Number(snapshot.certificationCount || 0),
      roleFamily: snapshot.roleFamily || '',
      seniorityLevel: snapshot.seniorityLevel || '',
      predictedPagePressure: snapshot.predictedPagePressure || '',
      targetPages: Number(snapshot.targetPages || 0),
      summaryExcerpt: snapshot.summaryExcerpt || '',
      topSkills: Array.isArray(snapshot.topSkills) ? snapshot.topSkills.slice(0, 8) : [],
      sectionStatuses:
        snapshot.sectionStatuses && typeof snapshot.sectionStatuses === 'object'
          ? snapshot.sectionStatuses
          : {},
    },
    resumeTitle: sourceRecord.title || 'Saved Resume',
    selectedTemplate: sourceRecord.selectedTemplate || '',
  };

  const nextResumes = repository.resumes.map((record) =>
    record.id === resumeId
      ? {
          ...record,
          updatedAt: entry.createdAt,
          exportReadinessHistory: [entry, ...(record.exportReadinessHistory || [])].slice(0, MAX_STORED_READINESS_SNAPSHOTS),
        }
      : record
  );

  safeWriteStorage({
    ...repository,
    resumes: nextResumes,
  });

  return entry;
};

export const getRepositoryStats = () => {
  const repository = safeReadStorage();
  const resumes = repository.resumes || [];
  const tokenUsage = repository.analytics?.tokenUsage || [];
  const totalCareerPoints = tokenUsage.reduce((count, entry) => count + (entry.totalTokens || 0), 0);
  const totalBillUsd = convertCareerPointsToUsd(totalCareerPoints);

  return {
    totalResumes: resumes.length,
    totalResumeUploads: repository.uploads?.resumes?.length || 0,
    totalJobDescriptionUploads: repository.uploads?.jobDescriptions?.length || 0,
    scratchCount: resumes.filter((record) => record.mode === 'scratch').length,
    uploadCount: resumes.filter((record) => record.mode === 'upload').length,
    tailorCount: resumes.filter((record) => record.mode === 'tailor').length,
    atsRuns: resumes.reduce((count, record) => count + (record.atsHistory?.length || 0), 0),
    interviewPrepRuns: resumes.reduce((count, record) => count + (record.interviewPrepHistory?.length || 0), 0),
    totalTokens: totalCareerPoints,
    totalCareerPoints,
    totalBillUsd,
    totalBillUsdFormatted: formatUsdAmount(totalBillUsd),
    totalAiCalls: tokenUsage.length,
  };
};
