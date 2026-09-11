import { useEffect, useMemo, useState } from 'react';
import {
  getRepositoryStats,
  getResumeProfile,
  getTokenUsageAnalytics,
  listResumeRecords,
} from '../../../services/resumeRepositoryService';
import { REPOSITORY_SHOWCASE_VIEWS } from '../data/landingData.jsx';

const findLatestHistoryEntry = (records, historyKey) =>
  records
    .flatMap((record) =>
      (record[historyKey] || []).map((entry) => ({
        ...entry,
        resumeTitle: entry.resumeTitle || record.title,
      }))
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )[0] || null;

export const useRepositoryShowcase = () => {
  const [repositoryStats, setRepositoryStats] = useState(() => getRepositoryStats());
  const [repositoryProfile, setRepositoryProfile] = useState(() => getResumeProfile());
  const [repositoryRecords, setRepositoryRecords] = useState(() => listResumeRecords());
  const [repositoryAnalytics, setRepositoryAnalytics] = useState(() => getTokenUsageAnalytics());
  const [showcaseView, setShowcaseView] = useState('resumes');
  const [lastRepositorySync, setLastRepositorySync] = useState(() => new Date());

  useEffect(() => {
    const refreshRepositoryPreview = () => {
      setRepositoryStats(getRepositoryStats());
      setRepositoryProfile(getResumeProfile());
      setRepositoryRecords(listResumeRecords());
      setRepositoryAnalytics(getTokenUsageAnalytics());
      setLastRepositorySync(new Date());
    };

    refreshRepositoryPreview();
    const refreshIntervalId = window.setInterval(refreshRepositoryPreview, 15000);
    const cycleIntervalId = window.setInterval(() => {
      setShowcaseView((currentView) => {
        const currentIndex = REPOSITORY_SHOWCASE_VIEWS.findIndex(
          (view) => view.id === currentView
        );
        return REPOSITORY_SHOWCASE_VIEWS[
          (currentIndex + 1) % REPOSITORY_SHOWCASE_VIEWS.length
        ].id;
      });
    }, 3600);

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshRepositoryPreview();
    };

    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('storage', refreshRepositoryPreview);

    return () => {
      window.clearInterval(refreshIntervalId);
      window.clearInterval(cycleIntervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('storage', refreshRepositoryPreview);
    };
  }, []);

  const latestAtsEntry = useMemo(
    () => findLatestHistoryEntry(repositoryRecords, 'atsHistory'),
    [repositoryRecords]
  );
  const latestInterviewEntry = useMemo(
    () => findLatestHistoryEntry(repositoryRecords, 'interviewPrepHistory'),
    [repositoryRecords]
  );
  const topOperationUsage = useMemo(
    () => (repositoryAnalytics.operationUsage || []).slice(0, 4),
    [repositoryAnalytics]
  );
  const recentResumes = useMemo(
    () => repositoryRecords.slice(0, 3),
    [repositoryRecords]
  );
  const showcaseIndex = REPOSITORY_SHOWCASE_VIEWS.findIndex(
    (view) => view.id === showcaseView
  );

  return {
    lastRepositorySync,
    latestAtsEntry,
    latestInterviewEntry,
    recentResumes,
    repositoryAnalytics,
    repositoryProfile,
    repositoryStats,
    setShowcaseView,
    showcaseIndex,
    showcaseView,
    topOperationUsage,
  };
};
