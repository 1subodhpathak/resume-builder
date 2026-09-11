import React from 'react';
import { ArrowRight, FileCheck2, Search, Sparkles } from 'lucide-react';
import SEO from '../../SEO';
import { RESUME_EXAMPLE_ROLES } from '../../../data/resumeExampleSeo';

const ResumeExamplesIndexPage = ({ onStart }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Professional Resume Examples by Job',
    description: 'Role-specific resume examples, skills, achievement ideas, and editable templates for popular careers.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: RESUME_EXAMPLE_ROLES.map((example, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${example.role} Resume Example`,
        url: `/resume-examples/${example.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-[#071426]">
      <SEO
        title="Professional Resume Examples by Job | CareerSense"
        description="Explore professional resume examples by job, including doctor, actor, SQL developer, data analyst, teacher, accountant, and more."
        canonical="/resume-examples"
        schema={schema}
      />

      <header className="border-b border-white/10 bg-[#071A31] text-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8">
          <a href="/" className="text-sm font-black uppercase tracking-[0.16em] text-[#E2BB61]">CareerSense</a>
          <button onClick={onStart} className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-[#123B6D]">Build my resume</button>
        </div>
      </header>

      <section className="border-b border-[#D7E0EA] bg-[radial-gradient(circle_at_85%_10%,rgba(38,91,145,0.18),transparent_34%),linear-gradient(145deg,#071426,#123B6D)] text-white">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E2BB61]/30 bg-[#E2BB61]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#E2BB61]">
            <Search size={13} /> Resume library
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-6xl">Professional resume examples for your job</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">Choose your profession to see a complete four-role career history, relevant skills, writing guidance, and an editable resume template.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            [FileCheck2, 'Role-specific content', 'Examples use skills and experience suited to each profession.'],
            [Sparkles, 'Editable templates', 'Start with the shown layout and customize every section.'],
            [Search, 'ATS-ready guidance', 'Write clear job titles, keywords, and measurable achievements.'],
          ].map(([Icon, title, copy]) => (
            <div key={title} className="rounded-2xl border border-[#D7E0EA] bg-white p-5 shadow-[0_8px_24px_rgba(7,20,38,0.05)]">
              <Icon size={19} className="text-[#A87922]" />
              <h2 className="mt-3 text-sm font-black text-[#123B6D]">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-[#60738A]">{copy}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RESUME_EXAMPLE_ROLES.map((example) => (
            <a key={example.slug} href={`/resume-examples/${example.slug}`} className="group flex min-h-[118px] items-center justify-between rounded-2xl border border-[#D7E0EA] bg-white p-5 shadow-[0_7px_20px_rgba(7,20,38,0.04)] transition hover:-translate-y-0.5 hover:border-[#B9964A] hover:shadow-[0_12px_28px_rgba(7,20,38,0.08)]">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#A87922]">Resume example</div>
                <h2 className="mt-2 text-lg font-black tracking-tight text-[#102F52]">{example.role}</h2>
                <p className="mt-1 text-xs text-[#708196]">Skills, experience and template</p>
              </div>
              <ArrowRight size={18} className="text-[#8EA0B2] transition group-hover:translate-x-1 group-hover:text-[#A87922]" />
            </a>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ResumeExamplesIndexPage;
