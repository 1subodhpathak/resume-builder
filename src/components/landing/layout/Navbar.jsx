import React, { useCallback, useEffect, useState } from 'react';
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import {
  ArrowRight,
  Menu,
  X,
  Zap,
  ChevronDown,
  FileCheck,
  ScrollText,
  MessagesSquare,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { scrollToLandingSection } from '../utils/scrollToLandingSection';
import { getRepositoryStats, getTokenUsageEntries, listResumeRecords } from '../../../services/resumeRepositoryService';
import { getSubscriptionStatus, getSubscriptionLedger, calculateResumeBuilderUsage, formatUsd } from '../../../services/subscriptionService';
import careerSenseLogo from '../../../assets/cs_logo.png';
import CustomUserButton from '../../common/CustomUserButton';

const careerSenseTools = [
  {
    name: 'ATS Score Checker',
    desc: 'Analyze & optimize resume keyword match',
    href: 'https://ats.careersenseai.com/',
    icon: FileCheck,
    badge: 'Popular',
    color: 'text-blue-700 bg-blue-50 border-blue-100',
  },
  {
    name: 'Cover Letter Builder',
    desc: 'Generate tailored AI cover letters in seconds',
    href: 'https://coverletter.careersenseai.com/',
    icon: ScrollText,
    badge: 'AI Powered',
    color: 'text-violet-700 bg-violet-50 border-violet-100',
  },
  {
    name: 'Interview Simulator',
    desc: 'Practice realistic AI voice & chat interviews',
    href: 'https://careersenseai.com/interview-simulator',
    icon: MessagesSquare,
    color: 'text-amber-700 bg-amber-50 border-amber-100',
  },
  {
    name: 'Skill Certification',
    desc: 'Validate skills & earn verifiable certificates',
    href: 'https://certifi.careersenseai.com/',
    icon: Award,
    color: 'text-cyan-700 bg-cyan-50 border-cyan-100',
  },
];

const Navbar = ({
  onOpenRepository,
  onNavigateLandingSection,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [repositoryStats, setRepositoryStats] = useState(() => getRepositoryStats());

  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));

  const refreshRepositoryStats = useCallback(() => {
    setRepositoryStats(getRepositoryStats());
  }, []);

  const navigateToSection = useCallback((sectionId) => {
    if (onNavigateLandingSection) {
      onNavigateLandingSection(sectionId);
      return;
    }
    scrollToLandingSection(sectionId);
  }, [onNavigateLandingSection]);

  const handleNavClick = useCallback((action) => {
    setMobileMenuOpen(false);
    setToolsOpen(false);
    action();
  }, []);

  const navItems = [
    {
      id: 'features',
      label: 'Features',
      action: () => navigateToSection('features'),
    },
    {
      id: 'templates',
      label: 'Templates',
      action: () => navigateToSection('templates'),
    },
    {
      id: 'faqs',
      label: 'FAQs',
      action: () => navigateToSection('faqs'),
    },
    {
      id: 'pricing',
      label: 'Pricing',
      action: () => {
        window.location.href = 'https://careersenseai.com/pricing';
      },
    },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.addEventListener('careersense:repository-updated', refreshRepositoryStats);
    return () => {
      window.removeEventListener('careersense:repository-updated', refreshRepositoryStats);
    };
  }, [refreshRepositoryStats]);

  const { user } = useUser();
  const [subData, setSubData] = useState({ plan: 'free', tokensRemaining: 30000 });
  const [totalBillUsd, setTotalBillUsd] = useState(0);

  useEffect(() => {
    const refreshUsage = (ledger = []) => {
      const localUsage = getTokenUsageEntries?.() || [];
      const resumes = listResumeRecords?.() || [];
      const usage = calculateResumeBuilderUsage(ledger, localUsage, resumes);
      setTotalBillUsd(usage.totalBillUsd);
    };

    if (user?.id) {
      getSubscriptionStatus(user.id).then((sub) => {
        if (sub) {
          setSubData({
            plan: sub.plan || 'free',
            tokensRemaining: sub.tokensRemaining ?? 30000,
          });
        }
      });
      getSubscriptionLedger(user.id).then((res) => {
        refreshUsage(res?.ledger || []);
      }).catch(() => {
        refreshUsage([]);
      });
    } else {
      refreshUsage([]);
    }
  }, [user?.id]);

  return (
    <nav
      data-landing-navbar="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 transition-all duration-300"
    >
      <div
        className={`pointer-events-auto w-full border-b border-[#E1E7EF] bg-white/94 backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'shadow-[0_10px_30px_rgba(7,20,38,0.12)]' : 'shadow-[0_4px_18px_rgba(7,20,38,0.07)]'
          }`}
      >
        <div className={`mx-auto flex max-w-[1420px] items-center justify-between gap-4 px-4 transition-[padding] duration-300 sm:px-5 ${scrolled ? 'py-2.5' : 'py-3'}`}>

          {/* Logo */}
          <div
            className="flex cursor-pointer items-center gap-3"
            onClick={() => handleNavClick(() => {
              navigateToSection('top');
            })}
          >
            <img
              src={careerSenseLogo}
              alt=""
              aria-hidden="true"
              className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_5px_10px_rgba(7,20,38,0.14)] sm:h-12 sm:w-12"
            />
            <div className="min-w-0">
              <div className="whitespace-nowrap text-[1.2rem] font-black leading-none tracking-[-0.045em] sm:text-[1.45rem]">
                <span className="text-[#071426]">Career</span><span className="text-[#123B6D]">Sense</span>
              </div>
              <div className="mt-1.5 whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#9A7628] sm:text-[10px]">
                Resume Builder
              </div>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 rounded-full px-1 text-sm font-semibold text-[#475569] lg:flex">
            {/* CareerSense Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setToolsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-all duration-200 hover:bg-[#E8EEF7] hover:text-[#071426] ${toolsOpen ? 'bg-[#E8EEF7] text-[#071426]' : ''
                  }`}
              >
                <span>CareerSense Tools</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${toolsOpen ? 'rotate-180 text-[#071426]' : 'text-[#64748B]'}`}
                />
              </button>

              {/* Dropdown Menu */}
              {toolsOpen && (
                <div className="absolute left-0 top-full z-50 w-[340px] pt-2">
                  <div className="overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white p-2.5 shadow-[0_20px_50px_rgba(7,20,38,0.16)]">
                    <div className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A7628]">
                      CareerSense Platform Tools
                    </div>
                    <div className="space-y-1">
                      {careerSenseTools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <a
                            key={tool.name}
                            href={tool.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setToolsOpen(false)}
                            className="group flex items-center justify-between rounded-xl p-2.5 transition-all hover:bg-[#F8FAFC]"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tool.color}`}
                              >
                                <Icon size={18} />
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#071426] group-hover:text-[#123B6D]">
                                    {tool.name}
                                  </span>
                                  {tool.badge && (
                                    <span className="rounded-full bg-[#FAF5E8] px-1.5 py-0.2 text-[9px] font-extrabold text-[#9A7628] border border-[#E9DCB8]">
                                      {tool.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] font-medium text-[#64748B] line-clamp-1">
                                  {tool.desc}
                                </p>
                              </div>
                            </div>
                            <ArrowUpRight
                              size={14}
                              className="text-[#94A3B8] opacity-0 transition-all group-hover:opacity-100 group-hover:text-[#071426]"
                            />
                          </a>
                        );
                      })}
                    </div>

                    <div className="mt-1.5 border-t border-[#E1E7EF] pt-2">
                      <a
                        href="https://careersenseai.com/#career-tools"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setToolsOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-[#9A7628] hover:bg-[#FAF5E8] transition"
                      >
                        <span>Explore all career tools</span>
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.action)}
                className={`rounded-full px-3.5 py-2 transition-all duration-200 hover:bg-[#E8EEF7] hover:text-[#071426] ${item.active ? 'bg-[#E8EEF7] text-[#071426]' : ''
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <SignedIn>
              <div className="hidden h-11 items-center gap-2 rounded-xl border border-[#E1E7EF] bg-[#F8FAFC] px-4 text-[11px] font-bold shadow-sm xl:flex">
                <Zap size={14} className="text-[#9A7628]" />
                <span className="uppercase tracking-[0.18em] text-[#64748B]">AI Tokens</span>
                <span className="font-black text-[#071426]">{formatNumber(subData.tokensRemaining)}</span>
              </div>
              <div className="hidden h-11 items-center gap-2 rounded-xl border border-[#E1E7EF] bg-[#F8FAFC] px-4 text-[11px] font-bold shadow-sm xl:flex">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-black text-xs">
                  $
                </div>
                <span className="uppercase tracking-[0.18em] text-[#64748B]">Bills</span>
                <span className="font-black text-[#071426]">{formatUsd(totalBillUsd)}</span>
              </div>
              {onOpenRepository && (
                <button
                  type="button"
                  onClick={onOpenRepository}
                  className="landing-dashboard-cta group inline-flex h-11 items-center justify-center gap-3 rounded-xl border px-5 text-sm font-bold text-[#F7F8FA] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9964A] focus-visible:ring-offset-2"
                >
                  <span>Dashboard</span>
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={2.4} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              )}

              <div className="ml-1 flex items-center">
                <CustomUserButton onOpenDashboard={onOpenRepository} />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="landing-dashboard-cta group inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border px-5 text-sm font-bold text-[#F7F8FA] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span>Sign In</span>
                  <ArrowRight aria-hidden="true" size={17} strokeWidth={2.4} />
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E7EF] bg-white text-[#071426] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mx-auto mt-3 flex max-w-[calc(100vw-1.5rem)] flex-col gap-3 rounded-[1.2rem] border border-[#E1E7EF] bg-white p-4 shadow-2xl md:hidden">
          <SignedIn>
            <div className="flex items-center justify-between border-b border-[#E1E7EF] pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Account</div>
              <CustomUserButton onOpenDashboard={onOpenRepository} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-control-bg)] px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--theme-text-muted)]">AI Tokens</div>
                <div className="mt-2 text-lg font-black tracking-tight text-[color:var(--theme-text-primary)]">{formatNumber(subData.tokensRemaining)}</div>
              </div>
              <div className="rounded-2xl border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-control-bg)] px-4 py-3">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--theme-text-muted)]">
                  <span className="text-emerald-600 font-bold">$</span> Bills
                </div>
                <div className="mt-2 text-lg font-black tracking-tight text-[#071426]">{formatUsd(totalBillUsd)}</div>
              </div>
            </div>
          </SignedIn>

          {/* CareerSense Tools in Mobile Drawer */}
          <div className="rounded-xl border border-[#E1E7EF] bg-[#F8FAFC] p-2.5">
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A7628]">
              CareerSense Platform Tools
            </div>
            <div className="mt-1 space-y-1">
              {careerSenseTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <a
                    key={tool.name}
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold text-[#071426] hover:bg-white transition"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${tool.color}`}>
                        <Icon size={14} />
                      </span>
                      <span>{tool.name}</span>
                    </span>
                    <ArrowUpRight size={13} className="text-[#94A3B8]" />
                  </a>
                );
              })}
              <a
                href="https://careersenseai.com/#career-tools"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between border-t border-[#E1E7EF] px-2.5 pt-2 text-[11px] font-bold text-[#9A7628]"
              >
                <span>Explore all career tools</span>
                <ArrowRight size={12} />
              </a>
            </div>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.action)}
              className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-[color:var(--theme-control-hover)] ${item.active ? 'text-[color:var(--theme-text-primary)]' : 'text-[color:var(--theme-text-secondary)]'
                }`}
            >
              {item.label}
            </button>
          ))}

          <SignedIn>
            {onOpenRepository && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRepository();
                }}
                className="landing-dashboard-cta group mt-1 inline-flex h-12 items-center justify-center gap-3 rounded-xl border px-6 text-sm font-bold text-[#F7F8FA] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9964A] focus-visible:ring-offset-2"
              >
                <span>Dashboard</span>
                <ArrowRight aria-hidden="true" size={19} strokeWidth={2.4} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            )}
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="landing-dashboard-cta group mt-1 inline-flex h-12 items-center justify-center gap-3 rounded-xl border px-6 text-sm font-bold text-[#F7F8FA] transition-all duration-200"
              >
                <span>Sign In</span>
                <ArrowRight aria-hidden="true" size={19} strokeWidth={2.4} />
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
