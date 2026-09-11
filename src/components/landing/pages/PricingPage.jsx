import React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Check,
  FileStack,
  Infinity,
  Layers3,
  ScanSearch,
  Sparkles,
  Stars,
  Users,
} from 'lucide-react';
import SEO from '../../SEO';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const plans = [
  {
    id: 'free',
    name: 'Free',
    subtitle: 'Great for testing the workflow before you scale up.',
    price: '$0',
    cadence: '/month',
    badge: 'Get started',
    accent: 'teal',
    cta: 'Start Free',
    featureGroups: [
      {
        title: 'CareerSense AI access',
        items: [
          '5,000 Career Points included',
          'AI Enhancements up to 5 times',
          'Manual resume creation and extraction',
        ],
      },
      {
        title: 'Templates and storage',
        items: [
          'Access to top 3 templates',
          '1 Resume Storege',
          '1 month repository access',
        ],
      },
      {
        title: 'Workspace essentials',
        items: [
          'Global profile creation',
          'Live editor and PDF export',
        ],
      },
    ],
  },
  {
    id: 'payg',
    name: 'Pay and Go',
    subtitle: 'One-time access for focused resume work without a subscription.',
    price: '$0.99',
    cadence: 'one time',
    badge: 'Flexible',
    accent: 'sky',
    cta: 'Choose Pay and Go',
    featureGroups: [
      {
        title: 'CareerSense AI access',
        items: [
          '50,000 Career Points included',
          'AI Resume Extraction and Creation',
          'Advanced AI resume creation',
          'AI Enhancements up to 10 times',
        ],
      },
      {
        title: 'Templates and storage',
        items: [
          'Access to 50+ templates',
          '10 Resume Storage',
          'Lifetime storage access',
        ],
      },
      {
        title: 'Workspace essentials',
        items: [
          'Global profile creation',
          'Template switching and live editing',
        ],
      },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'Best for active job seekers who want AI plus repository analytics.',
    price: '$4.99',
    cadence: '/month',
    badge: 'Most popular',
    accent: 'emerald',
    featured: true,
    cta: 'Go Premium',
    featureGroups: [
      {
        title: 'CareerSense AI access',
        items: [
          '1.5 million Career Points',
          'Create up to 30 resumes',
          'Unlimited AI Enhancements',
          'AI Resume Extraction and Creation',
        ],
      },
      {
        title: 'Advanced builder tools',
        items: [
          'Resume creation from job description',
          'ATS Score Checker',
          'Interview question suggestions',
          'Usage analysis and operation analysis',
        ],
      },
      {
        title: 'Templates and storage',
        items: [
          'Access to 100+ templates',
          '30 Resume Storage',
          'Lifetime storage access',
          'Global profile creation',
        ],
      },
    ],
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    subtitle: 'Full access for power users, learners, and heavy AI usage.',
    price: '$9.99',
    cadence: '/month',
    badge: 'Best value',
    accent: 'violet',
    cta: 'Unlock Exclusive',
    featureGroups: [
      {
        title: 'Everything in Premium, plus',
        items: [
          'Unlimited Career Points',
          'Unlimited Resume storage',
          'Refer and Earn up to $100 per month',
        ],
      },
      {
        title: 'Learning and growth',
        items: [
          'Access to 50+ learning courses',
          'Exclusive AI workshops',
          'Learning games and challenge sessions',
        ],
      },
      {
        title: 'All-access experience',
        items: [
          'Unlimited ATS and interview prep usage',
          'Priority access to new experiences',
          'Global profile and repository insights',
        ],
      },
    ],
  },
];

const platformHighlights = [
  {
    icon: BriefcaseBusiness,
    title: 'Resume flows for every style',
    text: 'Build from scratch, extract from an old resume, or generate from a target job description.',
  },
  {
    icon: ScanSearch,
    title: 'ATS and interview intelligence',
    text: 'Run ATS scans, keep score history, and revisit interview prep answers inside My Repository.',
  },
  {
    icon: FileStack,
    title: 'Storage that actually stays organized',
    text: 'Saved resumes, profile details, analysis history, and Career Point usage all live in one place.',
  },
  {
    icon: BarChart3,
    title: 'Usage visibility',
    text: 'Track Career Points, operation analysis, and AI activity without leaving the workspace.',
  },
];

const planIcons = {
  free: Sparkles,
  payg: Layers3,
  premium: BadgeCheck,
  exclusive: Infinity,
};

const accentClasses = {
  teal: {
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    button: 'theme-primary-button',
    ring: 'border-teal-200 shadow-[0_24px_60px_rgba(69,143,131,0.12)]',
    icon: 'bg-teal-50 text-teal-700',
  },
  sky: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    button: 'bg-sky-600 text-white hover:bg-sky-700',
    ring: 'border-sky-200 shadow-[0_24px_60px_rgba(14,116,144,0.10)]',
    icon: 'bg-sky-50 text-sky-700',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700',
    ring: 'border-emerald-300 shadow-[0_28px_70px_rgba(22,163,74,0.16)]',
    icon: 'bg-emerald-50 text-emerald-700',
  },
  violet: {
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    button: 'bg-violet-600 text-white hover:bg-violet-700',
    ring: 'border-violet-200 shadow-[0_24px_60px_rgba(124,58,237,0.12)]',
    icon: 'bg-violet-50 text-violet-700',
  },
};

const PricingPage = ({
  onStart,
  onOpenRepository,
  onOpenHome,
  onOpenPricing,
  onNavigateLandingSection,
  onViewTemplates,
}) => {
  return (
    <div className="theme-app-shell min-h-screen overflow-y-auto custom-scrollbar font-sans text-slate-900">
      <Navbar
        onStart={onStart}
        onOpenRepository={onOpenRepository}
        onOpenPricing={onOpenPricing}
        onOpenHome={onOpenHome}
        onNavigateLandingSection={onNavigateLandingSection}
        currentPage="pricing"
      />

      <SEO
        title="Pricing | CareerSense Resume Builder"
        description="Compare CareerSense pricing plans for resume creation, AI enhancements, ATS scans, interview prep, templates, storage, and repository analytics."
        keywords="resume builder pricing, careersense pricing, ATS resume plans, AI resume subscription"
      />

      <section className="theme-hero-surface relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <div className="absolute left-10 top-8 h-56 w-56 rounded-full bg-teal-200/30 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-200/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-teal-700 shadow-sm">
              <Stars size={14} />
              CareerSense Pricing
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-[color:var(--theme-text-primary)] sm:text-5xl lg:text-6xl">
              Choose the plan that fits how you build resumes.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[color:var(--theme-text-secondary)] sm:text-lg">
              Start free, unlock more Career Points when you need deeper AI help, or move into a premium workspace with ATS scans,
              interview prep, analytics, and long-term storage.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Bot, label: 'AI resume extraction and creation' },
              { icon: ScanSearch, label: 'ATS and interview tools' },
              { icon: FileStack, label: 'My Repository storage and history' },
              { icon: BookOpen, label: 'Learning and growth in Exclusive' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="theme-section-glass flex items-center gap-3 rounded-2xl px-4 py-4 text-left"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <p className="text-sm font-bold text-[color:var(--theme-text-primary)]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">
            {plans.map((plan) => {
              const PlanIcon = planIcons[plan.id];
              const accent = accentClasses[plan.accent];

              return (
                <article
                  key={plan.id}
                  className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(16,33,43,0.10)] ${accent.ring} ${
                    plan.featured ? 'ring-2 ring-emerald-100' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.icon}`}>
                      <PlanIcon size={24} />
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${accent.badge}`}>
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">{plan.name}</h2>
                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">{plan.subtitle}</p>
                  </div>

                  <div className="mt-7 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight text-slate-900">{plan.price}</span>
                    <span className="pb-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">{plan.cadence}</span>
                  </div>

                  <button
                    type="button"
                    onClick={onStart}
                    className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-[0.18em] transition-all ${accent.button}`}
                  >
                    {plan.cta}
                    <ArrowRight size={16} />
                  </button>

                  <div className="mt-8 flex-1 space-y-6">
                    {plan.featureGroups.map((group) => (
                      <div key={group.title} className="border-t border-slate-100 pt-5">
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{group.title}</div>
                        <div className="mt-4 space-y-3">
                          {group.items.map((item) => (
                            <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                              <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                                <Check size={14} />
                              </span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--theme-border-soft)] bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-teal-700">Built around the actual product</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Every plan maps directly to how CareerSense already works.
              </h2>
            </div>
            <button
              type="button"
              onClick={onViewTemplates}
              className="theme-secondary-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.18em] transition"
            >
              Explore Templates
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {platformHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="theme-section-muted rounded-[1.75rem] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-black tracking-tight text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-sky-50 px-6 py-10 shadow-[0_25px_70px_rgba(69,143,131,0.10)] sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-teal-700">
                <Users size={14} />
                Plan support
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Start with Free today and move up only when your workflow needs more AI power.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Your global profile, repository, saved resumes, and workspace history stay connected as you move between plans, so there is no
                restart cost when you decide to upgrade later.
              </p>
            </div>

            <div className="theme-section-surface rounded-[2rem] p-6 sm:p-8">
              <div className="space-y-4">
                {[
                  'Start with manual creation or resume extraction',
                  'Upgrade for ATS scans, interview prep, and richer analytics',
                  'Keep everything in one My Repository workspace',
                  'Continue editing on desktop or mobile and export to PDF any time',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm font-semibold leading-7 text-slate-700">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={14} />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onStart}
                  className="theme-primary-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.18em]"
                >
                  Start Building
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={onOpenRepository}
                  className="theme-secondary-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.18em]"
                >
                  Open My Repository
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onStart={onStart} onOpenPricing={onOpenPricing} onNavigateLandingSection={onNavigateLandingSection} />
    </div>
  );
};

export default PricingPage;
