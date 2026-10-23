import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useAuth, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

// --- LANDING COMPONENTS (The Dark UI) ---
import ResumeBuilderLanding from './components/landing/pages/ResumeBuilderLanding';
import ResumeExamplesIndexPage from './components/landing/pages/ResumeExamplesIndexPage';
import ResumeExamplePage from './components/landing/pages/ResumeExamplePage';
import NotFoundPage from './components/landing/pages/NotFoundPage';
import { ResumeGuidePage, ResumeGuidesIndexPage } from './components/landing/pages/ResumeGuidesPage';
import SEO from './components/SEO';
import ResumeSelection from './components/builder/ResumeSelection';
import ResumeUpload from './components/landing/features/ResumeUpload';
import JDUpload from './components/landing/features/JDUpload';

// --- TARGETED RESUME COMPONENT ---
import TargetedResumeUI from './components/resume/TargetedResumeUI';

// --- BUILDER COMPONENTS (The Clean UI) ---
import ResumeImportOptions from './components/builder/ResumeImportOptions';
import TemplateGallery from './components/builder/TemplateGallery';
import Editor from './components/builder/Editor';
import DataReview from './components/builder/DataReview';
import ResumeRepository from './components/builder/ResumeRepository';
import BuilderNavbar from './components/builder/BuilderNavbar';
import WelcomeTokensModal from './components/common/WelcomeTokensModal';

// --- LOGIC ---
import {
  enhanceResumeData,
  extractResumeData,
  extractResumeDataVerbatim,
} from './services/groqService';
import {
  saveUploadedResume,
  syncWithCloudBackend,
  getResumeRecord,
  saveResumeRecord,
  appendATSResult,
} from './services/resumeRepositoryService';
import { extractTextFromFile } from './utils/fileParser';
import { scrollToLandingSection } from './components/landing/utils/scrollToLandingSection';
import {
  buildRoleResumeData,
  getResumeSeoExampleByPath,
  RESUME_EXAMPLE_ROLES,
  STUDENT_RESUME_EXAMPLES,
  RESUME_TEMPLATE_EXAMPLES,
} from './data/resumeExampleSeo';
import { getResumeGuideByPath } from './data/resumeGuideSeo';
import { trackSeoConversion, trackSeoPageView } from './utils/seoAnalytics';

const PATH_TO_VIEW_MAP = {
  '/': 'landing',
  '/landing': 'landing',
  '/dashboard': 'repository',
  '/repository': 'repository',
  '/select': 'selection',
  '/selection': 'selection',
  '/create': 'selection',
  '/upload': 'upload',
  '/upload-options': 'upload-options',
  '/tailor': 'tailor',
  '/target': 'tailor',
  '/jd-upload': 'jd-upload',
  '/review': 'review',
  '/templates': 'gallery',
  '/gallery': 'gallery',
  '/builder': 'builder',
  '/editor': 'builder',
};

const VIEW_TO_PATH_MAP = {
  landing: '/',
  repository: '/dashboard',
  selection: '/select',
  upload: '/upload',
  'upload-options': '/upload-options',
  tailor: '/tailor',
  'jd-upload': '/jd-upload',
  review: '/review',
  gallery: '/templates',
  builder: '/builder',
};

function AuthStoreSynchronizer() {
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();

  React.useEffect(() => {
    if (isLoaded) {
      if (typeof window !== 'undefined') {
        window.clerkGetToken = getToken;
        window.clerkUserId = userId;
      }
      if (isSignedIn) {
        syncWithCloudBackend(getToken, userId);
      }
    }
  }, [isLoaded, userId, getToken, isSignedIn]);

  return null;
}

const LoadingStep = ({
  icon: Icon,
  title,
  description,
  active = false,
  complete = false,
}) => (
  <div
    className={`relative overflow-hidden rounded-[0.85rem] border px-3.5 py-3 transition-all ${
      active
        ? 'border-[#D8B45E]/50 bg-[#FFF9EC] shadow-[0_5px_16px_rgba(185,150,74,0.10)]'
        : complete
          ? 'border-[#C8D9E8] bg-[#EEF5FB]'
          : 'border-[#DCE4EC] bg-white'
    }`}
  >
    {active ? (
      <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-[linear-gradient(180deg,#123B6D_0%,#B9964A_100%)]" />
    ) : null}

    <div className="flex items-start gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border ${
          active
            ? 'border-[#D8B45E]/45 bg-white text-[#9A7225]'
            : complete
              ? 'border-[#C8D9E8] bg-white text-[#123B6D]'
              : 'border-[#E1E7EF] bg-[#F8FAFC] text-[#8797A8]'
        }`}
      >
        {complete ? <CheckCircle2 size={15} /> : <Icon size={15} />}
      </div>

      <div className="min-w-0">
        <div
          className={`text-[11px] font-extrabold ${
            active
              ? 'text-[#173A62]'
              : complete
                ? 'text-[#173A62]'
                : 'text-[#74879B]'
          }`}
        >
          {title}
        </div>

        <p className="mt-0.5 text-[9.5px] leading-4 text-[#8393A3]">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [selectedMode, setSelectedMode] = useState(null);
  const [resumeImportMode, setResumeImportMode] = useState('ai-enhanced');
  const [pendingResumeFile, setPendingResumeFile] = useState(null);
  const [resumeUploadSource, setResumeUploadSource] = useState('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeResumeRecordId, setActiveResumeRecordId] = useState(null);
  const [currentJDText, setCurrentJDText] = useState('');
  const [repositoryReturnView, setRepositoryReturnView] = useState('landing');
  const [builderReturnView, setBuilderReturnView] = useState('gallery');
  const [builderEntrySmartAction, setBuilderEntrySmartAction] = useState('');
  const [builderEntrySmartActionDetails, setBuilderEntrySmartActionDetails] =
    useState(null);
  const [selectionHelpRequest, setSelectionHelpRequest] = useState(0);
  const [uploadHelpRequest, setUploadHelpRequest] = useState(0);
  const [targetedHelpRequest, setTargetedHelpRequest] = useState(0);

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const currentView = PATH_TO_VIEW_MAP[normalizedPath] || 'landing';

  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackSeoPageView(`${location.pathname}${location.search}`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

  const resetRepositoryTracking = () => {
    setActiveResumeRecordId(null);
    setCurrentJDText('');
    setBuilderReturnView('gallery');
  };

  const openRepository = (returnView = currentView, tab = 'dashboard') => {
    setRepositoryReturnView(returnView);
    navigate(`/dashboard?tab=${tab}`);
  };

  const navigateToLandingSection = (sectionId = 'top') => {
    if (normalizedPath !== '/' && normalizedPath !== '/landing') {
      navigate('/');
    }

    window.setTimeout(() => {
      scrollToLandingSection(sectionId);
    }, 80);
  };

  // Synchronize URL search params with builder state if accessed directly
  useEffect(() => {
    if (currentView === 'builder') {
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams.get('id');
      const template = searchParams.get('template');

      if (id && id !== activeResumeRecordId) {
        const record = getResumeRecord(id);
        if (record) {
          setActiveResumeRecordId(record.id);
          if (record.resumeData) {
            setResumeData(record.resumeData);
          }
          if (record.selectedTemplate) {
            setSelectedTemplate(record.selectedTemplate);
          }
          if (record.mode) {
            setSelectedMode(record.mode);
          }
          if (record.importMode) {
            setResumeImportMode(record.importMode);
          }
          if (record.jdText) {
            setCurrentJDText(record.jdText);
          }
        }
      } else if (template && template !== selectedTemplate && !activeResumeRecordId) {
        setSelectedTemplate(template);
      }
    }
  }, [currentView, location.search, activeResumeRecordId, selectedTemplate]);

  // Navigation Helpers
  const handleBack = () => {
    if (currentView === 'repository') {
      navigate(VIEW_TO_PATH_MAP[repositoryReturnView] || '/');
      return;
    }

    if (currentView === 'builder') {
      if (builderReturnView === 'repository') {
        navigate('/dashboard?tab=resumes');
      } else {
        navigate(VIEW_TO_PATH_MAP[builderReturnView] || '/templates');
      }
      return;
    }

    if (currentView === 'upload-options') {
      setPendingResumeFile(null);
      navigate(resumeUploadSource === 'landing' ? '/' : '/upload');
      return;
    }

    const backMap = {
      builder: '/templates',
      gallery: '/select',
      review: '/upload',
      upload: '/select',
      'upload-options': '/upload',
      tailor: '/select',
      'jd-upload': '/select',
      selection: '/',
      repository: '/',
    };

    navigate(backMap[currentView] || '/');
  };

  const openResumeImportOptions = (file, source = 'upload') => {
    if (!file) return;

    setSelectedMode('upload');
    resetRepositoryTracking();
    setPendingResumeFile(file);
    setResumeUploadSource(source);
    navigate('/upload-options');
  };

  const createStoredResumeSource = (record) => ({
    name: record?.name || record?.sourceName || 'Saved Resume',
    type: record?.type || 'text/plain',
    size: record?.size || record?.textLength || 0,
    storedText: record?.text || '',
    repositoryUploadId: record?.id || '',
  });

  const readResumeSourceText = async (source) => {
    if (typeof source?.storedText === 'string') {
      return source.storedText;
    }

    return extractTextFromFile(source);
  };

  // File Processing Logic (For Standard Upload)
  const handleResumeImport = async (importMode) => {
    if (!pendingResumeFile) return;

    setResumeImportMode(importMode);
    setIsAnalyzing(true);
    setLoadingMessage('Reading your resume...');

    try {
      // Step A: Extract Text
      const rawText = await readResumeSourceText(pendingResumeFile);

      if (!rawText.trim()) {
        throw new Error('No readable resume text was found.');
      }

      if (!pendingResumeFile?.repositoryUploadId) {
        saveUploadedResume({
          name: pendingResumeFile?.name,
          type: pendingResumeFile?.type,
          size: pendingResumeFile?.size,
          text: rawText,
        });
      }

      let jsonData = null;

      if (importMode === 'verbatim') {
        setLoadingMessage(
          'Extracting your resume without rewriting the content...'
        );
        jsonData = await extractResumeDataVerbatim(rawText);
      } else {
        setLoadingMessage('CareerSense AI is extracting your profile...');
        const extractedData = await extractResumeData(rawText, {
          preserveFullContent: true,
        });

        setLoadingMessage(
          'CareerSense AI is strengthening your resume content...'
        );
        jsonData = await enhanceResumeData(extractedData);
      }

      if (jsonData) {
        setResumeData(jsonData);
        setCurrentJDText('');
        navigate('/review');
      }
    } catch (error) {
      alert('Error: ' + error.message);
      console.error(error);
    } finally {
      setPendingResumeFile(null);
      setIsAnalyzing(false);
    }
  };

  const renderBuilderFrame = (
    children,
    currentStep = 'import',
    modeOverride = selectedMode || 'upload',
    onHelp = null
  ) => (
    <div className="theme-app-shell relative min-h-screen overflow-hidden bg-[linear-gradient(rgba(18,59,109,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.03)_1px,transparent_1px),radial-gradient(circle_at_82%_4%,rgba(18,59,109,0.12),transparent_34%),radial-gradient(circle_at_11%_12%,rgba(185,150,74,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#F2F5F8_100%)] bg-[size:36px_36px,36px_36px,auto,auto,auto] font-sans text-[#071426]">
      <BuilderNavbar
        currentStep={currentStep}
        mode={modeOverride || 'upload'}
        onHelp={onHelp}
        onHome={() => navigateToLandingSection('top')}
        onDashboard={() => openRepository(currentView, 'dashboard')}
        onBack={handleBack}
      />

      <div className="relative min-h-[calc(100dvh-64px)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,150,74,0.28),transparent)]" />
        {children}
      </div>
    </div>
  );

  const normalizedLoadingMessage = loadingMessage.toLowerCase();
  const readingComplete =
    normalizedLoadingMessage.includes('extract') ||
    normalizedLoadingMessage.includes('strengthening');
  const extractingActive =
    normalizedLoadingMessage.includes('extract') &&
    !normalizedLoadingMessage.includes('strengthening');
  const extractingComplete = normalizedLoadingMessage.includes('strengthening');
  const strengtheningActive = normalizedLoadingMessage.includes('strengthening');

  const handleWorkspaceSnapshotChange = useCallback(({
    resume,
    jdText: nextJdText,
    selectedTemplate: nextTemplate,
  }) => {
    setResumeData(resume);
    setCurrentJDText(nextJdText || '');

    if (nextTemplate) {
      setSelectedTemplate(nextTemplate);
    }
  }, []);

  const resumeExample = getResumeSeoExampleByPath(decodeURIComponent(normalizedPath));
  const resumeGuide = getResumeGuideByPath(decodeURIComponent(normalizedPath));

  const startFromSeoPage = (templateId, example = null) => {
    trackSeoConversion(templateId ? 'seo_template_use' : 'seo_resume_start', {
      content_group: example?.family || 'seo_hub',
      content_slug: example?.slug || normalizedPath,
      template_id: templateId || 'not_selected',
    });
    resetRepositoryTracking();
    const data = example ? buildRoleResumeData(example) : null;
    setResumeData(data);
    setSelectedMode('scratch');
    setResumeImportMode('ai-enhanced');
    setSelectedTemplate(templateId || 'professional');
    setBuilderEntrySmartAction('');
    setBuilderEntrySmartActionDetails(null);
    if (templateId) {
      const savedRecord = saveResumeRecord({
        resumeData: data,
        selectedTemplate: templateId,
        mode: 'scratch',
        importMode: 'ai-enhanced',
        jdText: '',
      });
      if (savedRecord?.id) {
        setActiveResumeRecordId(savedRecord.id);
        navigate(`/builder?id=${encodeURIComponent(savedRecord.id)}&template=${encodeURIComponent(templateId)}`);
      } else {
        navigate(`/builder?template=${encodeURIComponent(templateId)}`);
      }
    } else {
      navigate('/select');
    }
  };

  if (normalizedPath === '/resume-examples') {
    return <ResumeExamplesIndexPage examples={RESUME_EXAMPLE_ROLES} onStart={() => startFromSeoPage()} />;
  }

  if (normalizedPath === '/student-resume-examples') {
    return (
      <ResumeExamplesIndexPage
        examples={STUDENT_RESUME_EXAMPLES}
        title="Student and Fresher Resume Examples"
        description="Explore editable resume samples for college students, freshers, interns, final-year candidates, and students from leading Indian institutes."
        eyebrow="Student resume library"
        canonical="/student-resume-examples"
        onStart={() => startFromSeoPage()}
      />
    );
  }

  if (normalizedPath === '/resume-templates') {
    return (
      <ResumeExamplesIndexPage
        examples={RESUME_TEMPLATE_EXAMPLES}
        title="Resume Templates for Every Application"
        description="Choose an editable ATS-friendly, one-page, modern, professional, or academic resume template and customize it in CareerSense."
        eyebrow="Resume template library"
        canonical="/resume-templates"
        onStart={() => startFromSeoPage()}
      />
    );
  }

  if (normalizedPath === '/resume-guides') {
    return <ResumeGuidesIndexPage />;
  }

  if (resumeGuide) {
    return <ResumeGuidePage guide={resumeGuide} onStart={() => startFromSeoPage()} />;
  }

  if (resumeExample) {
    return (
      <ResumeExamplePage
        example={resumeExample}
        onStart={() => startFromSeoPage()}
        onUseTemplate={(templateId) => startFromSeoPage(templateId, resumeExample)}
      />
    );
  }

  const isKnownAppPath = Object.prototype.hasOwnProperty.call(PATH_TO_VIEW_MAP, normalizedPath);

  if (!isKnownAppPath) {
    return <NotFoundPage />;
  }

  return (
    <div className="theme-app-shell relative min-h-screen font-sans text-[#071426]">
      {currentView !== 'landing' ? (
        <SEO
          title="CareerSense Resume Workspace"
          description="Create, edit, tailor, and manage your resume in the private CareerSense workspace."
          robots="noindex,nofollow"
        />
      ) : null}
      <AuthStoreSynchronizer />
      <WelcomeTokensModal />
      {/* VIEW: LANDING */}
          {currentView === 'landing' && (
            <ResumeBuilderLanding
              onStart={() => {
                resetRepositoryTracking();
                setResumeData(null);
                setSelectedMode(null);
                navigate('/select');
              }}
              onFileSelect={(f) => openResumeImportOptions(f, 'landing')}
              onViewTemplates={() => {
                resetRepositoryTracking();
                setResumeData(null);
                setSelectedMode('scratch');
                setResumeImportMode('ai-enhanced');
                navigate('/templates');
              }}
              onUseTemplate={(templateId) => {
                resetRepositoryTracking();
                setResumeData(null);
                setSelectedMode('scratch');
                setResumeImportMode('ai-enhanced');
                setSelectedTemplate(templateId);
                setBuilderEntrySmartAction('');
                setBuilderEntrySmartActionDetails(null);
                const savedRecord = saveResumeRecord({
                  resumeData: null,
                  selectedTemplate: templateId,
                  mode: 'scratch',
                  importMode: 'ai-enhanced',
                  jdText: '',
                });
                if (savedRecord?.id) {
                  setActiveResumeRecordId(savedRecord.id);
                  navigate(`/builder?id=${encodeURIComponent(savedRecord.id)}&template=${encodeURIComponent(templateId)}`);
                } else {
                  navigate(`/builder?template=${encodeURIComponent(templateId)}`);
                }
              }}
              onOpenRepository={(tab) => openRepository('landing', tab || 'dashboard')}
            />
          )}

          {/* VIEW: SELECTION */}
          {currentView === 'selection' &&
            renderBuilderFrame(
              <ResumeSelection
                helpRequest={selectionHelpRequest}
                onSelect={(mode) => {
                  setSelectedMode(mode);

                  if (mode === 'scratch') {
                    resetRepositoryTracking();
                    setResumeImportMode('ai-enhanced');
                    setResumeData(null);
                    navigate('/templates');
                  } else if (mode === 'tailor') {
                    resetRepositoryTracking();
                    setResumeImportMode('ai-enhanced');
                    navigate('/tailor');
                  } else {
                    resetRepositoryTracking();
                    navigate('/upload');
                  }
                }}
              />,
              'import',
              'upload',
              () => setSelectionHelpRequest((request) => request + 1)
            )}

          {/* VIEW: UPLOAD */}
          {currentView === 'upload' && (
            <>
              <SignedIn>
                {renderBuilderFrame(
                  <ResumeUpload
                    helpRequest={uploadHelpRequest}
                    onFileUpload={(file) => openResumeImportOptions(file, 'upload')}
                    onStoredResumeSelect={(record) =>
                      openResumeImportOptions(
                        createStoredResumeSource(record),
                        'upload'
                      )
                    }
                    onBack={handleBack}
                  />,
                  'import',
                  selectedMode || 'upload',
                  () => setUploadHelpRequest((request) => request + 1)
                )}
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}

          {/* VIEW: IMPORT OPTIONS */}
          {currentView === 'upload-options' && (
            <>
              <SignedIn>
                {renderBuilderFrame(
                  <ResumeImportOptions
                    file={pendingResumeFile}
                    onBack={handleBack}
                    onSelectOption={handleResumeImport}
                  />,
                  'import',
                  selectedMode || 'upload'
                )}
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}

          {/* VIEW: TAILOR */}
          {currentView === 'tailor' && (
            <>
              <SignedIn>
                {renderBuilderFrame(
                  <TargetedResumeUI
                    helpRequest={targetedHelpRequest}
                    onCancel={handleBack}
                    onComplete={(finalTailoredJson, jdText, atsResult) => {
                      setResumeImportMode('ai-enhanced');
                      setSelectedMode('tailor');
                      setResumeData(finalTailoredJson);
                      setCurrentJDText(jdText || '');

                      const savedRecord = saveResumeRecord({
                        resumeData: finalTailoredJson,
                        selectedTemplate,
                        mode: 'tailor',
                        importMode: 'ai-enhanced',
                        jdText: jdText || '',
                      });

                      if (savedRecord?.id) {
                        setActiveResumeRecordId(savedRecord.id);
                        if (atsResult) {
                          appendATSResult({
                            resumeId: savedRecord.id,
                            jdText: jdText || '',
                            result: atsResult,
                          });
                        }
                      }

                      navigate('/review');
                    }}
                  />,
                  'import',
                  selectedMode || 'upload',
                  () => setTargetedHelpRequest((request) => request + 1)
                )}
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}

          {/* VIEW: JD UPLOAD */}
          {currentView === 'jd-upload' && (
            <>
              <SignedIn>
                {renderBuilderFrame(
                  <JDUpload onSubmit={() => {}} onBack={handleBack} />,
                  'import',
                  selectedMode || 'upload'
                )}
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}

          {/* VIEW: REVIEW DATA */}
          {currentView === 'review' && (
            <>
              <SignedIn>
                <DataReview
                  extractedData={resumeData}
                  importMode={resumeImportMode}
                  mode={selectedMode}
                  onBack={handleBack}
                  onHome={() => navigateToLandingSection('top')}
                  onOpenRepository={(tab) => openRepository('review', tab || 'dashboard')}
                  onComplete={(data) => {
                    setResumeData(data);
                    const savedRecord = saveResumeRecord({
                      resumeId: activeResumeRecordId,
                      resumeData: data,
                      selectedTemplate,
                      mode: selectedMode || 'scratch',
                      importMode: resumeImportMode,
                      jdText: currentJDText,
                    });
                    if (savedRecord?.id) {
                      setActiveResumeRecordId(savedRecord.id);
                    }
                    navigate('/templates');
                  }}
                />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}

          {/* VIEW: GALLERY */}
          {currentView === 'gallery' && (
            <>
              <SignedIn>
                <TemplateGallery
                  resumeData={resumeData}
                  mode={selectedMode}
                  jdText={currentJDText}
                  onHome={() => navigateToLandingSection('top')}
                  onOpenRepository={(tab) => openRepository('gallery', tab || 'dashboard')}
                  onSelectTemplate={(tpl, options = {}) => {
                    setBuilderReturnView('gallery');

                    const currentData = options.resumeDataOverride || resumeData;
                    if (options.resumeDataOverride) {
                      setResumeData(options.resumeDataOverride);
                    }

                    setBuilderEntrySmartAction(options.actionId || '');
                    setBuilderEntrySmartActionDetails(options.actionDetails || null);
                    setSelectedTemplate(tpl);

                    let targetId = activeResumeRecordId;
                    if (currentData) {
                      const savedRecord = saveResumeRecord({
                        resumeId: activeResumeRecordId,
                        resumeData: currentData,
                        selectedTemplate: tpl,
                        mode: selectedMode || 'scratch',
                        importMode: resumeImportMode,
                        jdText: currentJDText,
                      });
                      if (savedRecord?.id) {
                        targetId = savedRecord.id;
                        setActiveResumeRecordId(savedRecord.id);
                      }
                    }

                    const queryParams = new URLSearchParams();
                    queryParams.set('template', tpl);
                    if (targetId) {
                      queryParams.set('id', targetId);
                    }
                    navigate(`/builder?${queryParams.toString()}`);
                  }}
                  onBack={handleBack}
                />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}

          {/* VIEW: REPOSITORY */}
          {currentView === 'repository' && (
            <>
              <SignedIn>
                <ResumeRepository
                  mode={selectedMode || 'upload'}
                  onBack={handleBack}
                  onHome={() => navigateToLandingSection('top')}
                  onStartNew={() => {
                    resetRepositoryTracking();
                    setResumeData(null);
                    setSelectedMode(null);
                    navigate('/select');
                  }}
                  onViewTemplates={() => {
                    resetRepositoryTracking();
                    setResumeData(null);
                    setSelectedMode('scratch');
                    setResumeImportMode('ai-enhanced');
                    navigate('/templates');
                  }}
                  onOpenResume={(record) => {
                    setResumeData(record.resumeData || null);
                    setSelectedTemplate(record.selectedTemplate || 'professional');
                    setSelectedMode(record.mode || 'scratch');
                    setResumeImportMode(record.importMode || 'ai-enhanced');
                    setCurrentJDText(record.jdText || '');
                    setActiveResumeRecordId(record.id);
                    setBuilderEntrySmartAction('');
                    setBuilderEntrySmartActionDetails(null);
                    setBuilderReturnView('repository');
                    navigate(`/builder?id=${encodeURIComponent(record.id)}`);
                  }}
                />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}

          {/* VIEW: EDITOR */}
          {currentView === 'builder' && (
            <>
              <SignedIn>
                <Editor
                  initialData={resumeData}
                  selectedTemplate={selectedTemplate}
                  onChangeTemplate={(tplId) => {
                    setSelectedTemplate(tplId);
                    const q = new URLSearchParams(location.search);
                    q.set('template', tplId);
                    if (activeResumeRecordId) {
                      q.set('id', activeResumeRecordId);
                    }
                    navigate(`/builder?${q.toString()}`, { replace: true });
                  }}
                  onBack={handleBack}
                  onHome={() => navigateToLandingSection('top')}
                  mode={selectedMode}
                  importMode={resumeImportMode}
                  initialJDText={currentJDText}
                  initialSmartAction={builderEntrySmartAction}
                  initialSmartActionDetails={builderEntrySmartActionDetails}
                  resumeRecordId={activeResumeRecordId}
                  onResumeRecordChange={setActiveResumeRecordId}
                  onOpenRepository={(tab) => openRepository('builder', tab || 'dashboard')}
                  onWorkspaceSnapshotChange={handleWorkspaceSnapshotChange}
                />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}

          {/* GLOBAL LOADING OVERLAY */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071426]/42 p-4 backdrop-blur-[8px]">
              <div className="w-full max-w-[720px] overflow-hidden rounded-[1.4rem] border border-white/65 bg-white shadow-[0_30px_100px_rgba(7,20,38,0.30)]">
                <div className="flex items-center justify-between gap-4 border-b border-[#DCE4EC] bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#9A7225]">
                      <Sparkles size={19} />
                    </div>

                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A87922]">
                        CareerSense AI
                      </div>
                      <div className="mt-0.5 text-[17px] font-black tracking-tight text-[#173A62]">
                        Preparing your resume
                      </div>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 rounded-full border border-[#C8D9E8] bg-[#EEF5FB] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#173A62] sm:flex">
                    <ShieldCheck size={12} />
                    Secure Processing
                  </div>
                </div>

                <div className="bg-[linear-gradient(rgba(18,59,109,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.025)_1px,transparent_1px),linear-gradient(180deg,#F8FAFC_0%,#F3F6F9_100%)] bg-[size:30px_30px,30px_30px,auto] p-5 sm:p-6">
                  <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="rounded-[1rem] border border-[#173A62] bg-[linear-gradient(150deg,#071426_0%,#102D4F_58%,#173F69_100%)] p-5 text-center text-white shadow-[0_14px_30px_rgba(7,20,38,0.16)]">
                      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-[#D6B25E]/15 blur-xl" />
                        <div className="absolute inset-[4px] rounded-full border border-white/10 bg-white/[0.04]" />
                        <Loader2
                          size={31}
                          className="relative z-10 animate-spin text-[#E1BC68]"
                        />
                      </div>

                      <div className="mt-4 text-[9px] font-black uppercase tracking-[0.18em] text-[#E1BC68]">
                        Processing
                      </div>

                      <p className="mt-2 text-[11px] leading-5 text-white/60">
                        Usually completed in about 10–15 seconds.
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="rounded-[0.9rem] border border-[#D9E3EC] bg-white px-4 py-3.5 shadow-[0_4px_14px_rgba(15,43,75,0.04)]">
                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#A87922]">
                          Current Activity
                        </div>

                        <h2 className="mt-1.5 text-[17px] font-black leading-6 text-[#173A62]">
                          {loadingMessage}
                        </h2>
                      </div>

                      <div className="mt-3 space-y-2">
                        <LoadingStep
                          icon={FileText}
                          title="Read Resume"
                          description="Extract the text and preserve your source information."
                          active={!readingComplete}
                          complete={readingComplete}
                        />

                        <LoadingStep
                          icon={Sparkles}
                          title={
                            resumeImportMode === 'verbatim'
                              ? 'Structure Resume'
                              : 'Build Career Profile'
                          }
                          description={
                            resumeImportMode === 'verbatim'
                              ? 'Map your existing content into editable resume sections.'
                              : 'Identify experience, skills, education and career signals.'
                          }
                          active={extractingActive}
                          complete={extractingComplete}
                        />

                        {resumeImportMode !== 'verbatim' ? (
                          <LoadingStep
                            icon={ShieldCheck}
                            title="Strengthen Content"
                            description="Improve clarity and impact while keeping your career facts intact."
                            active={strengtheningActive}
                            complete={false}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center border-t border-[#DCE4EC] bg-white px-5 py-3 text-center text-[10px] font-medium text-[#7A8CA0]">
                  Keep this window open while CareerSense finishes processing your resume.
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default App;

