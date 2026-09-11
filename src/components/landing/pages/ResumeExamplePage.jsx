import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Target } from 'lucide-react';
import SEO from '../../SEO';
import ResumePreview from '../../resume/ResumePreview';
import { buildRoleResumeData, RESUME_EXAMPLE_ROLES } from '../../../data/resumeExampleSeo';

const ResumeExamplePage = ({ example, onUseTemplate }) => {
  const resumeData = buildRoleResumeData(example);
  const related = RESUME_EXAMPLE_ROLES.filter((item) => item.slug !== example.slug).slice(0, 4);
  const canonical = `/resume-examples/${example.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: `${example.role} Resume Example`, description: example.description, url: canonical },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
          { '@type': 'ListItem', position: 2, name: 'Resume Examples', item: '/resume-examples' },
          { '@type': 'ListItem', position: 3, name: `${example.role} Resume`, item: canonical },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-[#071426]">
      <SEO title={example.seoTitle} description={example.description} canonical={canonical} schema={schema} />
      <header className="border-b border-white/10 bg-[#071A31] text-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8">
          <a href="/" className="text-sm font-black uppercase tracking-[0.16em] text-[#E2BB61]">CareerSense</a>
          <a href="/resume-examples" className="text-xs font-bold text-white/70 hover:text-white">All resume examples</a>
        </div>
      </header>

      <section className="overflow-hidden bg-[radial-gradient(circle_at_80%_10%,rgba(38,91,145,0.16),transparent_30%),linear-gradient(160deg,#F8FAFC,#EDF3F8)]">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-16">
          <div>
            <nav className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#718399]">
              <a href="/resume-examples" className="hover:text-[#123B6D]">Resume examples</a> / {example.role}
            </nav>
            <div className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-[#A87922]">Profession-based example</div>
            <h1 className="mt-3 text-4xl font-black leading-[1.04] tracking-[-0.045em] text-[#0C2948] sm:text-6xl">{example.role} resume example</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#586C83]">Use this complete {example.role.toLowerCase()} resume as a writing guide. It includes four experience levels, relevant skills, a professional summary, projects, education, and achievements.</p>
            <button onClick={() => onUseTemplate(example.templateId)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0B2D52] px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(7,26,49,0.2)] hover:bg-[#123B6D]">
              Use this {example.role} template <ArrowRight size={16} />
            </button>
          </div>
          <div className="relative mx-auto h-[520px] w-full max-w-[610px] overflow-hidden rounded-[1.6rem] border border-[#CAD7E3] bg-white shadow-[0_26px_70px_rgba(7,31,57,0.16)]">
            <div className="absolute left-1/2 top-5 w-[794px] origin-top -translate-x-1/2 scale-[0.60] sm:scale-[0.66]">
              <ResumePreview data={resumeData} template={example.templateId} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.78fr]">
        <article className="rounded-3xl border border-[#D7E0EA] bg-white p-6 shadow-[0_8px_28px_rgba(7,20,38,0.05)] sm:p-8">
          <div className="flex items-center gap-3"><FileText className="text-[#A87922]" size={20} /><h2 className="text-2xl font-black tracking-tight text-[#123B6D]">What to include in a {example.role} resume</h2></div>
          <p className="mt-4 text-sm leading-7 text-[#60738A]">Lead with a concise summary that names your specialty, experience level, and strongest outcome. Then show progression across roles and support each position with specific contributions rather than a list of routine duties.</p>
          <div className="mt-7 space-y-5">
            {example.experienceRoles.map((role, index) => (
              <div key={role} className="border-l-2 border-[#D8B45E] pl-4">
                <h3 className="text-sm font-black text-[#173A62]">{role}</h3>
                <p className="mt-1 text-xs leading-5 text-[#6C7F94]">Show ownership, scope, tools, and a measurable result appropriate to this career stage{index === 0 ? ', including leadership and strategic impact' : ''}.</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-3xl border border-[#173A62] bg-[#0B2848] p-6 text-white sm:p-8">
          <div className="flex items-center gap-3"><Target size={20} className="text-[#E2BB61]" /><h2 className="text-xl font-black">Important {example.role} skills</h2></div>
          <div className="mt-5 flex flex-wrap gap-2">
            {example.skills.map((skill) => <span key={skill} className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-bold">{skill}</span>)}
          </div>
          <h3 className="mt-8 text-sm font-black text-[#E2BB61]">ATS checklist</h3>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-white/75">
            {['Match the job title and role-specific keywords.', 'Use standard section names such as Experience and Skills.', 'Quantify outcomes wherever the facts support it.', 'Keep contact information as selectable text.'].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#E2BB61]" />{item}</li>)}
          </ul>
        </aside>
      </section>

      <section className="border-t border-[#D7E0EA] bg-white">
        <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8">
          <h2 className="text-2xl font-black text-[#123B6D]">Explore more resume examples</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => <a key={item.slug} href={`/resume-examples/${item.slug}`} className="flex items-center justify-between rounded-xl border border-[#D7E0EA] px-4 py-4 text-sm font-black text-[#173A62] hover:border-[#B9964A]">{item.role}<ArrowRight size={15} /></a>)}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResumeExamplePage;
