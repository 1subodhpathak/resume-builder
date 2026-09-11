import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import careerSenseLogo from '../../../assets/cs_logo.png';
import footerBg from '../../../assets/FooterLight.png';
import { scrollToLandingSection } from '../utils/scrollToLandingSection';

const FooterLink = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-fit text-left text-[12px] font-semibold text-[#5F7288] transition-colors hover:text-[#173A62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F3]"
  >
    {children}
  </button>
);

const TrustItem = ({ icon: Icon, title, children }) => (
  <div className="flex gap-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#A77924]" aria-hidden="true" />
    <div>
      <div className="text-[11px] font-bold text-[#173A62]">{title}</div>
      <p className="mt-1 max-w-[34ch] text-[10px] leading-[1.6] text-[#667A91]">{children}</p>
    </div>
  </div>
);

export default function LandingFooterSection({ onOpenRepository, onStart, onViewTemplates }) {
  const goTo = (sectionId) => scrollToLandingSection(sectionId);

  return (
    <footer className="relative isolate mt-auto overflow-hidden border-t border-[#D8E0EA] bg-[#F8F7F3] text-[#071A31]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img src={footerBg} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(250,248,242,0.91),rgba(249,249,248,0.86)_48%,rgba(239,244,249,0.83))]" />
        <div className="absolute inset-0 opacity-[0.022] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative mx-auto max-w-[1350px] px-6 py-12 sm:py-14">
        <div className="grid gap-10 border-b border-[#CCD7E2]/80 pb-10 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1.2fr]">
          <section>
            <button
              type="button"
              onClick={() => goTo('top')}
              className="group flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]"
              aria-label="Go to the top of the CareerSense home page"
            >
              <img
                src={careerSenseLogo}
                alt=""
                aria-hidden="true"
                className="h-12 w-12 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-105"
              />
              <span>
                <span className="block text-[1.35rem] font-black leading-none tracking-[-0.045em] text-[#071426]">
                  Career<span className="text-[#123B6D]">Sense</span>
                </span>
                <span className="mt-1.5 block text-[9px] font-extrabold uppercase tracking-[0.26em] text-[#D4AD55]">
                  Resume Builder
                </span>
              </span>
            </button>

            <p className="mt-5 max-w-[42ch] text-[12px] font-medium leading-[1.75] text-[#5F7288]">
              Build, import, tailor, review, and export a professional resume from one guided workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#123B6D] px-4 text-[11px] font-black text-[#F7F9FB] shadow-[0_8px_20px_rgba(18,59,109,0.16)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F3]"
              >
                Create a resume
                <ArrowRight size={14} aria-hidden="true" />
              </button>
              {onOpenRepository ? (
                <button
                  type="button"
                  onClick={onOpenRepository}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C9D6E2] bg-white/45 px-4 text-[11px] font-bold text-[#315D88] transition-colors hover:border-[#C49A43]/60 hover:bg-[#FFF8E9]/70 hover:text-[#8F671F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]"
                >
                  <LayoutDashboard size={14} aria-hidden="true" />
                  Open dashboard
                </button>
              ) : null}
            </div>
          </section>

          <nav aria-label="Footer product navigation">
            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9A7628]">Product</h2>
            <div className="mt-5 flex flex-col gap-3">
              <FooterLink onClick={onStart}>Resume builder</FooterLink>
              <FooterLink onClick={onViewTemplates}>Resume templates</FooterLink>
              <FooterLink onClick={() => goTo('import')}>Exact Import</FooterLink>
              <FooterLink onClick={() => goTo('how-it-works')}>How it works</FooterLink>
            </div>
          </nav>

          <nav aria-label="Footer resource navigation">
            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9A7628]">Resources</h2>
            <div className="mt-5 flex flex-col gap-3">
              <FooterLink onClick={() => goTo('anatomy')}>Resume guide</FooterLink>
              <FooterLink onClick={() => goTo('examples')}>Resume examples</FooterLink>
              <FooterLink onClick={() => goTo('testimonials')}>Success stories</FooterLink>
              <FooterLink onClick={() => goTo('faq')}>Help and FAQ</FooterLink>
            </div>
          </nav>

          <section aria-labelledby="footer-trust-title">
            <h2 id="footer-trust-title" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9A7628]">
              What to expect
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <TrustItem icon={FileCheck2} title="Supported files">
                Upload PDF, DOCX, or TXT resumes and review the extracted fields before export.
              </TrustItem>
              <TrustItem icon={Gauge} title="Transparent AI usage">
                Point estimates appear before AI-assisted flows and vary with document length.
              </TrustItem>
              <TrustItem icon={CheckCircle2} title="You stay in control">
                Imported and AI-assisted content remains editable throughout the builder.
              </TrustItem>
            </div>
          </section>
        </div>

        <div className="grid gap-6 border-b border-[#CCD7E2]/80 py-7 md:grid-cols-2">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[11px] font-bold text-[#173A62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]">
              <ShieldCheck size={14} className="text-[#A77924]" aria-hidden="true" />
              Privacy and data use
              <span className="text-[9px] text-[#8293A6] group-open:hidden">Read summary</span>
            </summary>
            <p className="mt-3 max-w-[70ch] text-[10px] leading-[1.7] text-[#667A91]">
              CareerSense stores saved workspace records and usage history in your browser. Resume or job-description content is sent to the configured AI service when you choose an AI-powered extraction, optimization, scoring, interview-preparation, or tailoring action. Avoid uploading information you do not want processed.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[11px] font-bold text-[#173A62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]">
              <ShieldCheck size={14} className="text-[#A77924]" aria-hidden="true" />
              Terms and responsible use
              <span className="text-[9px] text-[#8293A6] group-open:hidden">Read summary</span>
            </summary>
            <p className="mt-3 max-w-[70ch] text-[10px] leading-[1.7] text-[#667A91]">
              CareerSense provides drafting and formatting assistance, not a guarantee of ATS performance, interviews, or employment. Review every generated claim for accuracy before applying. AI point estimates are approximate and depend on source length and generated output.
            </p>
          </details>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[10px] font-medium text-[#71849A] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CareerSense. All rights reserved.</span>
          <button
            type="button"
            onClick={() => goTo('top')}
            className="inline-flex w-fit items-center gap-2 font-bold text-[#315D88] transition-colors hover:text-[#9A7628] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]"
          >
            Back to top
            <ArrowUp size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
