import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import CoraAssistant from './CoraAssistant.jsx';
import { scrollToLandingSection } from '../utils/scrollToLandingSection';
import {
  askCora,
  CORA_MAX_QUESTION_CHARS,
  CORA_MAX_QUESTION_WORDS,
} from '../../../services/coraService';

const CORA_SESSION_KEY = 'careersense_cora_open';

const CORA_QUESTIONS = [
  {
    id: 'how-it-works',
    label: 'How does CareerSense work?',
    answer:
      'Choose how you want to begin, review your information, select a template, edit the live resume, and export it as a PDF. You can switch templates without re-entering your content.',
    action: { label: 'See how it works', type: 'section', value: 'how-it-works' },
  },
  {
    id: 'choose-path',
    label: 'Which resume option should I choose?',
    answer:
      'Build from Scratch is best for a new resume. Exact Import preserves the wording in an existing resume. AI Optimized Import improves that wording, while Targeted Resume adapts an existing resume to a specific job description.',
    action: { label: 'Choose a starting point', type: 'start' },
  },
  {
    id: 'exact-import',
    label: 'What is Exact Import?',
    answer:
      'Exact Import maps your uploaded resume into editable fields while keeping the original information and wording as closely as possible. It is the right choice when your content is already final.',
    action: { label: 'Import my resume', type: 'section', value: 'import' },
  },
  {
    id: 'optimized-import',
    label: 'What is AI Optimized Import?',
    answer:
      'AI Optimized Import extracts your information and creates a stronger starting draft by improving summaries and experience bullets. You review and edit every result before export.',
    action: { label: 'Import my resume', type: 'section', value: 'import' },
  },
  {
    id: 'targeted-resume',
    label: 'How does Targeted Resume work?',
    answer:
      'Upload a base resume and add a job description. CareerSense compares both, identifies relevant skills and experience, and prepares a role-focused draft for you to review.',
    action: { label: 'Create a targeted resume', type: 'start' },
  },
  {
    id: 'best-resume-format',
    label: 'Which resume format should I use?',
    answer:
      'Use reverse chronological order when your recent experience supports the role. A combination format can help career changers highlight transferable skills while retaining a clear work history. Keep headings familiar and the layout easy to scan.',
    action: { label: 'Browse templates', type: 'templates' },
  },
  {
    id: 'job-specific-template',
    label: 'Which template fits my target job?',
    answer:
      'Choose a clean, structured template for corporate, technical, healthcare, or operations roles. A more expressive layout can suit design or brand-focused work, provided it remains readable. Prioritize the structure that presents your strongest, most relevant evidence first.',
    action: { label: 'Compare templates', type: 'templates' },
  },
  {
    id: 'targeted-benefits',
    label: 'Why create a job-specific resume?',
    answer:
      'A job-specific resume makes your most relevant skills, experience, and outcomes easier to find. It helps recruiters quickly connect your background to the role and prevents unrelated information from distracting from your strongest qualifications.',
    action: { label: 'Tailor my resume', type: 'start' },
  },
  {
    id: 'ats-friendly',
    label: 'How do I make my resume ATS-friendly?',
    answer:
      'Use recognizable section headings, readable fonts, consistent dates, and straightforward formatting. Include relevant terms from the job description naturally and avoid placing essential information only inside images or decorative graphics.',
    action: { label: 'Browse ATS-safe templates', type: 'templates' },
  },
  {
    id: 'resume-length',
    label: 'Should my resume be one or two pages?',
    answer:
      'Use one page when you can present your relevant experience clearly without crowding. Two pages are appropriate when additional experience, projects, or qualifications directly strengthen your application. Relevance matters more than forcing a specific length.',
  },
  {
    id: 'font-and-spacing',
    label: 'What font size and spacing should I use?',
    answer:
      'Choose a readable professional font and keep sizing consistent. Body text should remain comfortable to read, headings should create a clear hierarchy, and line spacing should prevent dense sections. Use Print Preview to catch crowding and awkward page breaks.',
    action: { label: 'Start editing', type: 'start' },
  },
  {
    id: 'resume-keywords',
    label: 'How should I use job-description keywords?',
    answer:
      'Identify the role’s recurring skills, tools, qualifications, and responsibilities. Use only the terms that truthfully match your experience, placing them in relevant summaries, skills, and achievement bullets rather than copying the job description word for word.',
    action: { label: 'Create a targeted resume', type: 'start' },
  },
  {
    id: 'section-order',
    label: 'Which resume section should come first?',
    answer:
      'Lead with the information most valuable for your target role. Experienced candidates usually place experience near the top, while students may prioritize education, internships, or projects. Contact details and a focused headline should remain easy to find.',
  },
  {
    id: 'resume-photo',
    label: 'Should I add a photo to my resume?',
    answer:
      'Photo expectations vary by country and industry. If employers in your target market do not normally request one, a text-focused resume is usually the safer choice. Check local hiring conventions before selecting a photo-based template.',
    action: { label: 'View template options', type: 'templates' },
  },
  {
    id: 'customize-each-role',
    label: 'Do I need to customize every application?',
    answer:
      'You do not need to rewrite everything. Keep a strong base resume, then adjust the headline, summary, skills, and selected achievements for each important role. Focus your effort on applications where tailoring meaningfully improves alignment.',
    action: { label: 'Tailor for a role', type: 'start' },
  },
  {
    id: 'points',
    label: 'How many points will I need?',
    answer:
      'Starting from scratch uses 0 points initially. Import Resume is typically 6,000–24,000 points, while Targeted Resume is usually 20,000–35,000. Actual usage varies with document length and generated output.',
  },
  {
    id: 'privacy',
    label: 'Is my resume information private?',
    answer:
      'Saved workspace records stay in your browser in the current version. Resume or job-description content is sent to the configured AI service only when you choose an AI-powered action. Avoid uploading information you do not want processed.',
    action: { label: 'Read privacy details', type: 'footer' },
  },
  {
    id: 'templates',
    label: 'Can I change templates later?',
    answer:
      'Yes. Your resume information stays separate from the design, so you can switch templates in the gallery or editor without typing your content again.',
    action: { label: 'Browse templates', type: 'templates' },
  },
  {
    id: 'export',
    label: 'How do I export my resume?',
    answer:
      'Open your resume in the editor, use Print Preview to check page breaks, then choose Export PDF. Review the exported file before submitting it to an employer.',
    action: { label: 'Start a resume', type: 'start' },
  },
];

const getInitialOpenState = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(CORA_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

const CoraChatbot = ({ onStart, onViewTemplates, onOpenRepository }) => {
  const [isOpen, setIsOpen] = useState(getInitialOpenState);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [answerId, setAnswerId] = useState('welcome');
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState('guided');
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiError, setAiError] = useState('');
  const [isQuestionMenuOpen, setIsQuestionMenuOpen] = useState(false);
  const panelRef = useRef(null);
  const selectRef = useRef(null);
  const questionMenuRef = useRef(null);
  const questionRef = useRef(null);
  const answerTimerRef = useRef(null);
  const titleId = useId();
  const answerRegionId = useId();

  const selectedAnswer = CORA_QUESTIONS.find((item) => item.id === answerId);
  const selectedQuestion = CORA_QUESTIONS.find((item) => item.id === selectedQuestionId);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CORA_SESSION_KEY, String(isOpen));
    } catch {
      // The assistant still works when storage is unavailable.
    }
    if (isOpen) {
      window.setTimeout(() => {
        if (mode === 'ask') questionRef.current?.focus();
        else selectRef.current?.focus();
      }, 160);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (isQuestionMenuOpen) {
        setIsQuestionMenuOpen(false);
        selectRef.current?.focus();
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isQuestionMenuOpen]);

  useEffect(() => {
    if (!isQuestionMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!questionMenuRef.current?.contains(event.target)) setIsQuestionMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isQuestionMenuOpen]);

  useEffect(() => () => {
    if (answerTimerRef.current) window.clearTimeout(answerTimerRef.current);
  }, []);

  const handleQuestionChange = (questionId) => {
    setSelectedQuestionId(questionId);
    setIsQuestionMenuOpen(false);
    setIsThinking(true);

    if (answerTimerRef.current) window.clearTimeout(answerTimerRef.current);
    answerTimerRef.current = window.setTimeout(() => {
      setAnswerId(questionId);
      setIsThinking(false);
      answerTimerRef.current = null;
    }, 420);
  };

  const questionWordCount = customQuestion.trim()
    ? customQuestion.trim().split(/\s+/).length
    : 0;

  const handleCustomQuestionChange = (event) => {
    const nextValue = event.target.value;
    const words = nextValue.trim().split(/\s+/).filter(Boolean);
    if (words.length > CORA_MAX_QUESTION_WORDS) return;
    setCustomQuestion(nextValue);
    setAiError('');
  };

  const handleAskCora = async (event) => {
    event.preventDefault();
    const question = customQuestion.trim();
    if (!question) {
      setAiError('Type a short career question first.');
      questionRef.current?.focus();
      return;
    }

    setIsThinking(true);
    setAiError('');
    setAiAnswer('');
    try {
      setAiAnswer(await askCora(question));
    } catch (error) {
      setAiError(error?.message || 'Cora could not answer right now. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleAction = (action) => {
    if (!action) return;
    setIsOpen(false);

    if (action.type === 'start') onStart?.();
    if (action.type === 'templates') onViewTemplates?.();
    if (action.type === 'dashboard') onOpenRepository?.();
    if (action.type === 'section') scrollToLandingSection(action.value);
    if (action.type === 'footer') {
      document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[240] font-sans sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section
          ref={panelRef}
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={answerRegionId}
          className="cora-panel flex max-h-[min(620px,calc(100dvh-2rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.25rem] border border-[#294B70] bg-[#F8FAFC] shadow-[0_24px_70px_rgba(7,20,38,0.28)]"
        >
          <header className="relative shrink-0 overflow-hidden bg-[#071426] px-5 pb-4 pt-4 text-[#F8FAFC]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(185,150,74,0.18),transparent_32%)]" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
              <div className="relative h-16 w-16 shrink-0">
                <CoraAssistant state={isThinking ? 'thinking' : 'idle'} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#D6B25E]">
                  <span className="h-2 w-2 rounded-full bg-[#D6B25E]" />
                  CareerSense guide
                </div>
                <h2 id={titleId} className="mt-1 text-xl font-black tracking-[-0.035em]">
                  Hi, I’m Cora.
                </h2>
                <p className="mt-0.5 text-sm leading-5 text-[#C9D5E3]">Your career questions, answered.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Cora"
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-xl text-[#B7C5D5] transition-colors duration-150 hover:bg-[#173A62] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B25E]"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#E8EEF5] p-1" role="tablist" aria-label="Cora answer mode">
              <button type="button" role="tab" aria-selected={mode === 'guided'} onClick={() => setMode('guided')} className={`min-h-10 rounded-lg px-3 text-xs font-extrabold transition-colors ${mode === 'guided' ? 'bg-white text-[#173A62] shadow-sm' : 'text-[#60758D] hover:text-[#173A62]'}`}>
                Quick answers
              </button>
              <button type="button" role="tab" aria-selected={mode === 'ask'} onClick={() => { setMode('ask'); setIsQuestionMenuOpen(false); }} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-extrabold transition-colors ${mode === 'ask' ? 'bg-[#123B6D] text-white shadow-sm' : 'text-[#60758D] hover:text-[#173A62]'}`}>
                Ask anything
                <Crown size={13} className="text-[#C89D3D]" aria-hidden="true" />
                <span className="sr-only">Premium feature</span>
              </button>
            </div>

            {mode === 'guided' ? <>
              <label htmlFor={`${titleId}-question`} className="mt-5 block text-sm font-extrabold text-[#173A62]">
                What can I help you with?
              </label>
              <div ref={questionMenuRef} className="relative mt-2">
                <button
                  ref={selectRef}
                  id={`${titleId}-question`}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isQuestionMenuOpen}
                  aria-controls={`${titleId}-question-list`}
                  onClick={() => setIsQuestionMenuOpen((current) => !current)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setIsQuestionMenuOpen(true);
                    }
                  }}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#BECBDC] bg-white py-3 pl-4 pr-3 text-left text-sm font-semibold text-[#173A62] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#B9964A] focus:ring-4 focus:ring-[#B9964A]/15"
                >
                  <span className={selectedQuestion ? '' : 'text-[#8799AC]'}>
                    {selectedQuestion?.label || 'Choose a question'}
                  </span>
                  <ChevronDown className={`shrink-0 text-[#60758D] transition-transform ${isQuestionMenuOpen ? 'rotate-180' : ''}`} size={18} aria-hidden="true" />
                </button>

                {isQuestionMenuOpen ? (
                  <div
                    id={`${titleId}-question-list`}
                    role="listbox"
                    aria-label="CareerSense questions"
                    className="custom-scrollbar absolute left-0 right-0 top-[calc(100%+0.375rem)] z-30 max-h-72 overflow-y-auto rounded-xl border border-[#BECBDC] bg-white p-1.5 shadow-[0_18px_42px_rgba(7,20,38,0.18)]"
                  >
                    {CORA_QUESTIONS.map((question) => {
                      const isSelected = question.id === selectedQuestionId;
                      return (
                        <button
                          key={question.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleQuestionChange(question.id)}
                          className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold leading-5 transition-colors ${isSelected ? 'bg-[#E8EEF5] text-[#173A62]' : 'text-[#40566F] hover:bg-[#F1F5F9] hover:text-[#173A62]'}`}
                        >
                          <span>{question.label}</span>
                          {isSelected ? <Check size={16} className="shrink-0 text-[#A77924]" aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </> : (
              <form onSubmit={handleAskCora} className="mt-5">
                <label htmlFor={`${titleId}-custom-question`} className="block text-sm font-extrabold text-[#173A62]">
                  Ask a career question
                </label>
                <textarea
                  ref={questionRef}
                  id={`${titleId}-custom-question`}
                  value={customQuestion}
                  onChange={handleCustomQuestionChange}
                  maxLength={CORA_MAX_QUESTION_CHARS}
                  rows={3}
                  placeholder="e.g. How can I make my resume summary stronger?"
                  className="mt-2 w-full resize-none rounded-xl border border-[#BECBDC] bg-white px-4 py-3 text-sm font-medium leading-5 text-[#173A62] outline-none transition-[border-color,box-shadow] placeholder:text-[#8799AC] focus:border-[#B9964A] focus:ring-4 focus:ring-[#B9964A]/15"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold text-[#657A91]">{questionWordCount}/{CORA_MAX_QUESTION_WORDS} words · {customQuestion.length}/{CORA_MAX_QUESTION_CHARS} characters</span>
                  <button type="submit" disabled={isThinking || !customQuestion.trim()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#123B6D] px-3.5 text-xs font-extrabold text-white transition-colors hover:bg-[#173F69] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9964A] focus-visible:ring-offset-2">
                    {isThinking ? 'Thinking…' : 'Ask Cora'} <Send size={14} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}

            <div
              id={answerRegionId}
              aria-live="polite"
              aria-busy={isThinking}
              className="mt-5 min-h-[148px] border-t border-[#D7E1EA] pt-5"
            >
              {isThinking ? (
                <div className="flex items-center gap-3 text-sm font-semibold text-[#52677F]">
                  <Sparkles className="cora-thinking text-[#A77924]" size={18} aria-hidden="true" />
                  Cora is finding the clearest answer…
                </div>
              ) : mode === 'ask' && aiError ? (
                <div role="alert">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A7628]">
                    <HelpCircle size={13} aria-hidden="true" /> Cora needs a moment
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#40566F]">{aiError}</p>
                  <button type="button" onClick={handleAskCora} className="mt-3 min-h-10 rounded-lg border border-[#C7D3DF] bg-white px-3.5 text-xs font-extrabold text-[#315D88] hover:border-[#B9964A]">Try again</button>
                </div>
              ) : mode === 'ask' && aiAnswer ? (
                <>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A7628]">
                    <Sparkles size={13} aria-hidden="true" /> Cora’s AI answer
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#40566F]">{aiAnswer}</p>
                </>
              ) : mode === 'ask' ? (
                <>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A7628]">
                    <MessageCircle size={13} aria-hidden="true" /> Short and focused
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#40566F]">Ask one resume, interview, job-search, or CareerSense question. Cora will reply in 70 words or fewer.</p>
                </>
              ) : selectedAnswer ? (
                <>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A7628]">
                    <Sparkles size={13} aria-hidden="true" />
                    Cora’s answer
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#40566F]">{selectedAnswer.answer}</p>
                  {selectedAnswer.action ? (
                    <button
                      type="button"
                      onClick={() => handleAction(selectedAnswer.action)}
                      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#123B6D] px-4 text-sm font-extrabold text-white transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#173F69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9964A] focus-visible:ring-offset-2 active:translate-y-0"
                    >
                      {selectedAnswer.action.label}
                      <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A7628]">
                    <MessageCircle size={13} aria-hidden="true" />
                    Welcome
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#40566F]">
                    Choose a question above and I’ll explain the right CareerSense feature or next step.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={onStart} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#123B6D] px-3.5 text-xs font-extrabold text-white hover:bg-[#173F69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9964A] focus-visible:ring-offset-2">
                      Create resume <ArrowRight size={14} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => handleAction({ type: 'section', value: 'faq' })} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#C7D3DF] bg-white px-3.5 text-xs font-bold text-[#315D88] hover:border-[#B9964A] hover:text-[#8F671F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9964A]">
                      <HelpCircle size={14} aria-hidden="true" /> FAQ
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#D7E1EA] bg-[#EEF3F8] px-5 py-3">
            <span className="text-[11px] font-semibold text-[#657A91]">{mode === 'ask' ? 'AI answer · limited to 70 words' : 'Stored guidance · no AI points used'}</span>
            {onOpenRepository ? (
              <button type="button" onClick={() => handleAction({ type: 'dashboard' })} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-extrabold text-[#315D88] hover:text-[#8F671F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9964A]">
                <LayoutDashboard size={14} aria-hidden="true" /> Dashboard
              </button>
            ) : null}
          </footer>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ask Cora, CareerSense career guide"
          aria-expanded="false"
          className="cora-launcher group flex min-h-14 items-center gap-2 rounded-full border border-[#294B70] bg-[#071426] py-1.5 pl-1.5 pr-4 text-white shadow-[0_16px_42px_rgba(7,20,38,0.30)] transition-[transform,background-color] duration-200 hover:-translate-y-1 hover:bg-[#102D4F] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#D6B25E] focus-visible:ring-offset-4 active:translate-y-0"
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <CoraAssistant state="idle" className="h-12 w-12" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#071426] bg-[#D6B25E]" />
          </span>
          <span className="text-left">
            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#D6B25E]">Need guidance?</span>
            <span className="mt-0.5 block text-sm font-extrabold">Ask Cora</span>
          </span>
        </button>
      )}
    </div>
  );
};

export default CoraChatbot;
