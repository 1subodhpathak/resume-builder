import React, { useState } from 'react';
import {
  Code,
  Database,
  BarChart3,
  Users,
  Calculator,
  PenTool,
  GraduationCap,
  Building2,
  ShoppingBag,
  Wrench,
} from 'lucide-react';

import ResumePreview from '../../resume/ResumePreview';
import poojaImage from '../../../assets/Pooja.png';


/* -------------------------------------------------------
   CATEGORIES
------------------------------------------------------- */

const CATEGORIES = [
  {
    id: 'bi',
    templateId: 'business-analyst',
    label: 'Business Intelligence',
    icon: BarChart3,
    name: 'POOJA BANSAL',
    title: 'Business Intelligence Lead',
    company: 'Global Tech Solutions',
    role: 'Lead BI Analyst',
    skills: ['Tableau', 'PowerBI', 'SQL', 'Python', 'ETL'],
  },
  {
    id: 'data',
    templateId: 'data-scientist',
    label: 'Data Scientist',
    icon: Database,
    name: 'ALEX CHEN',
    title: 'Senior Data Scientist',
    company: 'AI Innovations Lab',
    role: 'Principal Data Scientist',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'AWS'],
  },
  {
    id: 'pm',
    templateId: 'product-manager',
    label: 'Product Manager',
    icon: Users,
    name: 'SARAH MILLER',
    title: 'Group Product Manager',
    company: 'TechStart SaaS',
    role: 'Group Product Manager',
    skills: ['JIRA', 'Figma', 'SQL', 'Roadmapping', 'Agile'],
  },
  {
    id: 'dev',
    templateId: 'software-engineer',
    label: 'Software Engineer',
    icon: Code,
    name: 'DAVID LEE',
    title: 'Senior Full Stack Engineer',
    company: 'CloudScale Systems',
    role: 'Senior Software Engineer',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
  },
  {
    id: 'sales',
    templateId: 'sales',
    label: 'Sales Executive',
    icon: ShoppingBag,
    name: 'JESSICA WONG',
    title: 'Regional Sales Director',
    company: 'Global SaaS Corp',
    role: 'Regional Sales Director',
    skills: ['Salesforce', 'HubSpot', 'Negotiation', 'Closing', 'CRM'],
  },
  {
    id: 'teacher',
    templateId: 'teacher',
    label: 'Teacher',
    icon: GraduationCap,
    name: 'MICHAEL BROWN',
    title: 'Senior History Teacher',
    company: 'Lincoln High School',
    role: 'Head of History Department',
    skills: [
      'Curriculum Design',
      'LMS',
      'Classroom Management',
      'Mentoring',
    ],
  },
  {
    id: 'eng',
    templateId: 'engineer',
    label: 'Engineer',
    icon: Wrench,
    name: 'EMILY DAVIS',
    title: 'Senior Mechanical Engineer',
    company: 'AutoParts Global',
    role: 'Lead Design Engineer',
    skills: ['SolidWorks', 'AutoCAD', 'ANSYS', 'MATLAB', 'GD&T'],
  },
  {
    id: 'acc',
    templateId: 'accounting',
    label: 'Accounting',
    icon: Calculator,
    name: 'ROBERT WILSON',
    title: 'Certified Public Accountant',
    company: 'Financial Services LLP',
    role: 'Audit Manager',
    skills: ['QuickBooks', 'NetSuite', 'SAP', 'Excel', 'Tax Research'],
  },
  {
    id: 'design',
    templateId: 'designer',
    label: 'Designer',
    icon: PenTool,
    name: 'OLIVIA TAYLOR',
    title: 'Senior Product Designer',
    company: 'Creative Tech Agency',
    role: 'Senior Product Designer',
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'HTML/CSS'],
  },
  {
    id: 'marketing',
    templateId: 'marketing',
    label: 'Marketing',
    icon: Building2,
    name: 'DANIEL GARCIA',
    title: 'Digital Marketing Manager',
    company: 'TechStartup Inc.',
    role: 'Marketing Manager',
    skills: [
      'Google Analytics',
      'Google Ads',
      'HubSpot',
      'SEO',
      'Canva',
    ],
  },
];

const CAREER_HISTORY = {
  bi: [
    ['Senior BI Specialist', 'FinStream Corp'],
    ['Business Intelligence Analyst', 'Northstar Retail Group'],
    ['Reporting Analyst', 'Metro Financial Services'],
  ],
  data: [
    ['Machine Learning Scientist', 'DataForge Labs'],
    ['Data Scientist', 'Northstar Analytics'],
    ['Junior Data Analyst', 'Metro Insights'],
  ],
  pm: [
    ['Senior Product Manager', 'CloudWorks Platform'],
    ['Product Manager', 'Northstar Digital'],
    ['Associate Product Manager', 'LaunchPad Technologies'],
  ],
  dev: [
    ['Software Engineer II', 'CloudWorks Platform'],
    ['Full Stack Developer', 'Northstar Digital'],
    ['Junior Software Developer', 'LaunchPad Technologies'],
  ],
  sales: [
    ['Sales Manager', 'RevenueWorks'],
    ['Account Executive', 'Northstar Software'],
    ['Sales Development Representative', 'LaunchPad CRM'],
  ],
  teacher: [
    ['History Teacher', 'Roosevelt Academy'],
    ['Social Studies Teacher', 'Northstar Middle School'],
    ['Teaching Assistant', 'New York Learning Center'],
  ],
  eng: [
    ['Mechanical Engineer II', 'Precision Manufacturing Co.'],
    ['Design Engineer', 'Northstar Engineering'],
    ['Graduate Engineer', 'Metro Industrial Systems'],
  ],
  acc: [
    ['Senior Accountant', 'FinStream Corp'],
    ['Staff Accountant', 'Northstar Holdings'],
    ['Audit Associate', 'Metro Advisory LLP'],
  ],
  design: [
    ['Product Designer', 'Northstar Digital'],
    ['UX/UI Designer', 'Studio Meridian'],
    ['Junior Visual Designer', 'LaunchPad Creative'],
  ],
  marketing: [
    ['Growth Marketing Manager', 'Northstar Software'],
    ['Marketing Specialist', 'Brightline Media'],
    ['Marketing Coordinator', 'LaunchPad Brands'],
  ],
};

const EXPERIENCE_DATES = ['2017 - 2020', '2014 - 2017', '2012 - 2014'];

const EXPERIENCE_ACHIEVEMENTS = [
  (category) => `• Managed major ${category.label.toLowerCase()} initiatives from planning through delivery while maintaining quality and timeline discipline.\n• Improved team workflows through clearer documentation, stakeholder alignment, and performance tracking.`,
  (category) => `• Delivered day-to-day ${category.label.toLowerCase()} programs and translated business requirements into practical solutions.\n• Created repeatable processes that improved collaboration, visibility, and execution consistency.`,
  (category) => `• Supported senior team members with research, analysis, coordination, and client-ready deliverables.\n• Built strong foundations in ${category.skills.slice(0, 2).join(' and ')} while consistently meeting project deadlines.`,
];


/* -------------------------------------------------------
   BUILD RESUME EXAMPLE DATA
------------------------------------------------------- */

const buildExampleContent = (category) => ({
  personal: {
    name: category.name,
    title: category.title,
    email: `${category.name
      .toLowerCase()
      .replace(/\s+/g, '.')}@careersense.com`,
    phone: '+1 555 0199 283',
    location: 'New York, USA',
    photo: poojaImage,
    summary: `${category.title} with strong experience in strategy, execution, stakeholder collaboration, and measurable business outcomes. Skilled at turning complex requirements into clear, high-impact work across fast-moving professional environments.`,
  },

  experience: [
    {
      id: 1,
      role: category.role,
      company: category.company,
      date: '2020 - Present',
      desc: `• Led high-impact initiatives across cross-functional teams and improved operational performance.
• Built structured reporting, planning, or execution workflows that increased efficiency and reduced manual effort.
• Partnered with senior stakeholders to define priorities, track outcomes, and deliver measurable results.`,
      pageBreak: false,
    },
    ...(CAREER_HISTORY[category.id] || []).map(([role, company], index) => ({
      id: index + 2,
      role,
      company,
      date: EXPERIENCE_DATES[index],
      desc: EXPERIENCE_ACHIEVEMENTS[index](category),
      pageBreak: false,
    })),
  ],

  education: [
    {
      id: 1,
      degree: 'Bachelor of Science',
      school: 'New York University',
      date: '2016',
      pageBreak: false,
    },
  ],

  skills: {
    core: category.skills.slice(0, 3),
    technical: category.skills,
    soft: [
      'Leadership',
      'Communication',
      'Problem Solving',
      'Stakeholder Management',
    ],
  },

  projects: [
    {
      id: 1,
      name: `${category.label} Optimization Project`,
      desc: `Designed and delivered a structured initiative that improved workflow quality, reduced manual effort, and created measurable business impact.`,
      pageBreak: false,
    },
  ],

  awards: [
    {
      id: 1,
      name: 'Performance Excellence Award',
      issuer: category.company,
      pageBreak: false,
    },
  ],

  certifications: [
    {
      id: 1,
      name: `${category.label} Professional Certification`,
      issuer: 'Professional Institute',
      date: '2019',
      pageBreak: false,
    },
  ],

  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Conversational' },
  ],
});


/* -------------------------------------------------------
   PREGENERATED EXAMPLE CONTENT
------------------------------------------------------- */

const EXAMPLE_CONTENT = CATEGORIES.reduce((acc, category) => {
  acc[category.id] = buildExampleContent(category);
  return acc;
}, {});


/* -------------------------------------------------------
   RESUME EXAMPLES COMPONENT
------------------------------------------------------- */

const ResumeExamples = ({ onStart }) => {
  const [activeTab, setActiveTab] = useState('teacher');

  const activeCategory =
    CATEGORIES.find((category) => category.id === activeTab) ||
    CATEGORIES[0];

  const activeContent =
    EXAMPLE_CONTENT[activeTab] || EXAMPLE_CONTENT.bi;

  const activePreviewContent = {
    ...activeContent,
    personal: {
      ...activeContent.personal,
      photo: activeContent.personal.photo || poojaImage,
    },
  };

  const activeTemplateId =
    activeCategory.templateId || 'professional';


  return (
    <div className="relative overflow-hidden bg-transparent py-2">

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-14">

        {/* ------------------------------------------------
            LEFT CONTENT
        ------------------------------------------------ */}
        <div className="lg:col-span-5">

          {/* EYEBROW */}
          <div className="mb-3 bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[10px] font-black uppercase tracking-[0.23em] text-transparent">
            Profession-Based Examples
          </div>


          {/* HEADING */}
          <h2 className="mb-5 text-[1.9rem] font-black leading-[1.07] tracking-[-0.04em] sm:text-[2.15rem] lg:text-[2.4rem]">

            <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
              Resume examples
            </span>

            <br />

            <span className="bg-gradient-to-b from-[#E7C86E] via-[#BA8B32] to-[#88601B] bg-clip-text text-transparent">
              tailored for your job.
            </span>

          </h2>


          {/* DESCRIPTION */}
          <p className="mb-6 max-w-[560px] text-[14px] font-medium leading-[1.75] text-[#53657E] sm:text-[15px]">
            Explore polished resume examples across popular roles,
            industries, and career paths. Pick a direction, preview the
            structure, and start building with a professional template.
          </p>


          {/* MAIN CTA */}
          <a
            href="/resume-examples"
            className="group mb-8 inline-flex min-h-[48px] items-center gap-2.5 rounded-[0.9rem] border border-[#244C78] bg-gradient-to-b from-[#294F7C] via-[#14365D] to-[#071A31] px-6 py-3 text-[13px] font-extrabold text-white shadow-[0_12px_28px_rgba(6,23,44,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4778AA] hover:shadow-[0_16px_34px_rgba(6,23,44,0.24)]"
          >
            Browse all examples

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>


          {/* ------------------------------------------------
              PROFESSION SELECTOR
          ------------------------------------------------ */}
          <div className="grid grid-cols-2 gap-2.5">

            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeTab === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveTab(category.id)}
                  className={`
                    group flex min-h-[58px] w-full items-center gap-3
                    rounded-xl border px-3 py-2.5 text-left
                    transition-all duration-300
                    ${
                      isActive
                        ? 'border-[#C49A43]/65 bg-gradient-to-br from-white via-[#FFFCF5] to-[#F5EEDF] shadow-[0_12px_26px_rgba(104,75,18,0.10)]'
                        : 'border-[#D8E1EB] bg-white/70 shadow-[0_5px_14px_rgba(6,23,44,0.04)] hover:-translate-y-0.5 hover:border-[#B9C8D9] hover:bg-white hover:shadow-[0_10px_24px_rgba(6,23,44,0.08)]'
                    }
                  `}
                >

                  {/* CATEGORY ICON */}
                  <div
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-lg border transition-all duration-300
                      ${
                        isActive
                          ? 'border-[#3E648D]/35 bg-gradient-to-b from-[#234B76] via-[#12345A] to-[#071A31] text-[#D9B45A] shadow-[0_5px_12px_rgba(6,23,44,0.16)]'
                          : 'border-[#D7E0EA] bg-[#F5F7FA] text-[#6B7F97] group-hover:border-[#B8C7D7] group-hover:text-[#173A62]'
                      }
                    `}
                  >
                    <Icon size={17} />
                  </div>


                  {/* CATEGORY NAME */}
                  <span
                    className={`
                      text-[12px] font-extrabold leading-tight
                      transition-colors
                      ${
                        isActive
                          ? 'text-[#071A31]'
                          : 'text-[#52657E] group-hover:text-[#102F54]'
                      }
                    `}
                  >
                    {category.label}
                  </span>

                </button>
              );
            })}

          </div>
        </div>



        {/* ------------------------------------------------
            RIGHT RESUME PREVIEW
        ------------------------------------------------ */}
        <div className="relative flex justify-center lg:col-span-7 lg:justify-end">

          {/* BACKGROUND GLOWS */}
          <div className="pointer-events-none absolute right-[8%] top-[8%] -z-10 h-[340px] w-[340px] rounded-full bg-[#285D95]/10 blur-[100px]" />

          <div className="pointer-events-none absolute bottom-[5%] left-[8%] -z-10 h-[260px] w-[260px] rounded-full bg-[#C39A43]/12 blur-[95px]" />


          {/* RESUME CARD */}
          <div className="group relative h-[610px] w-full max-w-[470px] overflow-hidden rounded-[1.5rem] border border-[#CCD8E5] bg-white shadow-[0_30px_75px_rgba(6,23,44,0.15)] transition-all duration-500 hover:-translate-y-1 hover:border-[#C39A43]/55 hover:shadow-[0_38px_90px_rgba(6,23,44,0.20)] sm:h-[650px]">


            {/* GOLD TOP HIGHLIGHT */}
            <div className="pointer-events-none absolute inset-x-16 top-0 z-50 h-px bg-gradient-to-r from-transparent via-[#D9B65F] to-transparent" />


            {/* PREVIEW HEADER */}
            <div className="absolute inset-x-0 top-0 z-20 flex h-[62px] items-center justify-between border-b border-[#DCE3EB] bg-white/90 px-5 backdrop-blur-xl">

              <div>

                <div className="bg-gradient-to-r from-[#A67825] via-[#C49B46] to-[#93691F] bg-clip-text text-[9px] font-black uppercase tracking-[0.18em] text-transparent">
                  Live Example
                </div>

                <div className="mt-0.5 text-[13px] font-black text-[#071A31]">
                  {activeCategory.label}
                </div>

              </div>


              <div className="rounded-full border border-[#C49A43]/35 bg-gradient-to-b from-[#FFFBF1] to-[#F6EBD2] px-3 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#93691F]">
                Preview
              </div>

            </div>


            {/* RESUME PREVIEW AREA */}
            <div className="h-full w-full bg-gradient-to-b from-[#F3F6F9] to-[#E9EFF5] pt-[62px]">

              <div className="relative h-full w-full overflow-hidden bg-white">

                <div className="pointer-events-none h-[297mm] w-[210mm] origin-top-left scale-[0.55] select-none bg-white sm:scale-[0.56] lg:scale-[0.58]">

                  <ResumePreview
                    data={activePreviewContent}
                    template={activeTemplateId}
                  />

                </div>

              </div>

            </div>


            {/* HOVER CTA */}
            <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center bg-gradient-to-t from-[#041225]/0 via-transparent to-transparent pb-7 transition-all duration-300 group-hover:from-[#041225]/20">

              <button
                type="button"
                onClick={onStart}
                className="pointer-events-auto translate-y-4 rounded-[0.9rem] border border-[#345D88] bg-gradient-to-b from-[#284F7D] via-[#13365E] to-[#071A31] px-7 py-3 text-[13px] font-extrabold text-white opacity-0 shadow-[0_16px_38px_rgba(4,18,37,0.28)] transition-all duration-300 hover:border-[#C39A43]/65 group-hover:translate-y-0 group-hover:opacity-100"
              >
                Use This Template
              </button>

            </div>


            {/* BOTTOM GOLD LINE */}
            <div className="absolute inset-x-0 bottom-0 z-40 h-[3px] bg-gradient-to-r from-transparent via-[#B98A32] to-transparent" />

          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeExamples;
