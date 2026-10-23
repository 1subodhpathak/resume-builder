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

const JOB_CATEGORIES = [
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

const COLLEGE_CATEGORIES = [
  { id: 'college-iit', templateId: 'iit', label: 'Indian Institute of Technology (IIT)', icon: GraduationCap, name: 'AARAV SHARMA', title: 'B.Tech Computer Science', company: 'Innovation Lab', role: 'Research Intern', skills: ['Python', 'Machine Learning', 'Algorithms', 'SQL', 'Git'] },
  { id: 'college-iim', templateId: 'iim', label: 'Indian Institute of Management (IIM)', icon: Building2, name: 'ANSHUL MEHTA', title: 'MBA Candidate', company: 'Strategy Consulting Group', role: 'Management Intern', skills: ['Strategy', 'Analytics', 'Finance', 'Excel', 'Leadership'] },
  { id: 'college-bits', templateId: 'bits', label: 'BITS Pilani', icon: GraduationCap, name: 'ROHINI KAPOOR', title: 'B.E. Computer Science', company: 'Product Engineering Lab', role: 'Software Engineering Intern', skills: ['React', 'Node.js', 'Python', 'Data Structures', 'Cloud'] },
  { id: 'college-xlri', templateId: 'xlri', label: 'XLRI', icon: Building2, name: 'ISHA VERMA', title: 'PGDM Candidate', company: 'People Strategy Practice', role: 'HR Strategy Intern', skills: ['People Analytics', 'Strategy', 'Excel', 'Research', 'Communication'] },
  { id: 'college-mdi', templateId: 'mdi-gurgaon', label: 'MDI Gurgaon', icon: Building2, name: 'KARLEEN MALHOTRA', title: 'PGDM Candidate', company: 'Business Advisory Group', role: 'Consulting Intern', skills: ['Consulting', 'Market Research', 'Power BI', 'Finance', 'Presentation'] },
  { id: 'college-nmims', templateId: 'nmims', label: 'Narsee Monjee University (NMIMS)', icon: GraduationCap, name: 'RIYA SHAH', title: 'MBA Candidate', company: 'Growth Strategy Team', role: 'Business Analyst Intern', skills: ['Business Analysis', 'Marketing', 'SQL', 'Excel', 'Storytelling'] },
  { id: 'college-banasthali', templateId: 'banasthali', label: 'Banasthali Vidyapith', icon: GraduationCap, name: 'MEERA JOSHI', title: 'B.Tech Information Technology', company: 'Digital Innovation Centre', role: 'Technology Intern', skills: ['Java', 'Web Development', 'Databases', 'Research', 'Teamwork'] },
  { id: 'college-bhu', templateId: 'bhu', label: 'Banaras Hindu University', icon: GraduationCap, name: 'ADITYA SINGH', title: 'M.Sc. Data Science', company: 'Analytics Research Centre', role: 'Research Associate', skills: ['Statistics', 'Python', 'NLP', 'Visualization', 'Research'] },
  { id: 'college-lpu', templateId: 'lpu', label: 'Lovely Professional University', icon: GraduationCap, name: 'SIMRAN KAUR', title: 'B.Tech AI & ML', company: 'Applied AI Studio', role: 'AI Engineering Intern', skills: ['Machine Learning', 'Python', 'Deep Learning', 'GitHub', 'Cloud'] },
  { id: 'college-nit', templateId: 'nit', label: 'National Institute of Technology', icon: GraduationCap, name: 'ARJUN NAIR', title: 'B.Tech Computer Science and Engineering', company: 'Engineering Innovation Lab', role: 'Software Engineering Intern', skills: ['C++', 'Python', 'Data Structures', 'React', 'Cloud'] },
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

const buildExampleContent = (category) => {
 const isCollege = category.id.startsWith('college-');
 const collegeHistory = [
   ['Student Researcher', 'Centre for Applied Research'],
   ['Technical Coordinator', 'Student Innovation Council'],
 ];
 return ({
  personal: {
    name: category.name,
    title: category.title,
    email: `${category.name
      .toLowerCase()
      .replace(/\s+/g, '.')}@careersense.com`,
    phone: '+1 555 0199 283',
    location: isCollege ? 'India' : 'New York, USA',
    linkedin: 'linkedin.com/in/candidate-profile',
    github: 'github.com/candidate-portfolio',
    website: 'candidate-portfolio.com',
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
    ...(CAREER_HISTORY[category.id] || (isCollege ? collegeHistory : [])).map(([role, company], index) => ({
      id: index + 2,
      role,
      company,
      date: EXPERIENCE_DATES[index],
      desc: EXPERIENCE_ACHIEVEMENTS[index](category),
      pageBreak: false,
    })),
  ],

  education: isCollege ? [
    {
      id: 1,
      degree: category.title,
      specialization: category.skills[0],
      school: category.label,
      grade: '8.7 / 10',
      date: '2022 - 2026',
      pageBreak: false,
    },
    {
      id: 2,
      degree: 'Senior Secondary Education',
      specialization: 'Science and Mathematics',
      school: 'National Public School',
      grade: '94.2%',
      date: '2022',
      pageBreak: false,
    },
  ] : [
    {
      id: 1,
      degree: 'Bachelor of Science',
      school: 'New York University',
      date: '2016',
      pageBreak: false,
    },
  ],

  internships: isCollege ? [
    {
      id: 1,
      role: category.role,
      company: category.company,
      location: 'India',
      date: 'May 2025 - Jul 2025',
      desc: `• Delivered a live project using ${category.skills.slice(0, 2).join(' and ')} to solve a measurable business problem.\n• Presented findings to senior mentors and incorporated feedback into the final implementation.`,
      pageBreak: false,
    },
  ] : [],

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
      url: 'candidate-portfolio.com/optimization-project',
      repositoryUrl: 'github.com/candidate-portfolio/optimization-project',
      desc: `Designed and delivered a structured initiative that improved workflow quality, reduced manual effort, and created measurable business impact.`,
      pageBreak: false,
    },
    ...(isCollege ? [{
      id: 2,
      name: 'Campus Analytics and Automation Platform',
      url: 'candidate-portfolio.com/campus-project',
      repositoryUrl: 'github.com/candidate-portfolio/campus-project',
      desc: `Built an end-to-end solution using ${category.skills.slice(0, 3).join(', ')} and improved reporting turnaround by 35%.`,
      pageBreak: false,
    }] : []),
  ],

  awards: [
    {
      id: 1,
      name: 'Performance Excellence Award',
      issuer: category.company,
      pageBreak: false,
    },
    ...(isCollege ? [{ id: 2, name: 'Dean’s Merit Recognition', issuer: category.label, date: '2024', pageBreak: false }] : []),
  ],

  certifications: [
    {
      id: 1,
      name: `${category.label} Professional Certification`,
      issuer: 'Professional Institute',
      date: '2019',
      pageBreak: false,
    },
    ...(isCollege ? [{ id: 2, name: `${category.skills[0]} Foundations`, issuer: 'Online Learning Academy', date: '2024', pageBreak: false }] : []),
  ],

  responsibilities: isCollege ? [
    { id: 1, role: 'Student Coordinator', organization: 'Innovation and Entrepreneurship Cell', date: '2024 - Present', desc: 'Led a 12-member student team, organized industry workshops, and coordinated mentor engagement for campus projects.' },
    { id: 2, role: 'Core Committee Member', organization: 'Placement and Career Committee', date: '2023 - 2024', desc: 'Supported employer outreach, student preparation sessions, and placement-event operations.' },
  ] : [],

  extracurriculars: isCollege ? [
    { id: 1, name: 'National Case Competition Finalist', description: 'Developed and presented a data-backed growth strategy.', date: '2025' },
    { id: 2, name: 'Community Mentoring Volunteer', description: 'Mentored school students in digital literacy and career awareness.', date: '2024' },
  ] : [],

  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Conversational' },
  ],
 });
};


/* -------------------------------------------------------
   PREGENERATED EXAMPLE CONTENT
------------------------------------------------------- */

const ALL_CATEGORIES = [...JOB_CATEGORIES, ...COLLEGE_CATEGORIES];

const EXAMPLE_CONTENT = ALL_CATEGORIES.reduce((acc, category) => {
  acc[category.id] = buildExampleContent(category);
  return acc;
}, {});


/* -------------------------------------------------------
   RESUME EXAMPLES COMPONENT
------------------------------------------------------- */

const ResumeExamples = ({ onStart }) => {
  const [exampleType, setExampleType] = useState('job');
  const [activeTab, setActiveTab] = useState('teacher');

  const activeCategories = exampleType === 'college' ? COLLEGE_CATEGORIES : JOB_CATEGORIES;

  const activeCategory =
    activeCategories.find((category) => category.id === activeTab) ||
    activeCategories[0];

  const activeContent =
    EXAMPLE_CONTENT[activeCategory.id] || EXAMPLE_CONTENT.bi;

  const activePreviewContent = {
    ...activeContent,
    personal: {
      ...activeContent.personal,
      photo: activeContent.personal.photo || poojaImage,
    },
  };

  const activeTemplateId =
    activeCategory.templateId || 'professional';

  const selectExampleType = (type) => {
    const categories = type === 'college' ? COLLEGE_CATEGORIES : JOB_CATEGORIES;
    setExampleType(type);
    setActiveTab(categories[0].id);
  };


  return (
    <div className="relative overflow-hidden bg-transparent py-2">

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-14">

        {/* ------------------------------------------------
            LEFT CONTENT
        ------------------------------------------------ */}
        <div className="lg:col-span-5">

          {/* EYEBROW */}
          <div className="mb-3 bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[10px] font-black uppercase tracking-[0.23em] text-transparent">
            {exampleType === 'college' ? 'College-Inspired Examples' : 'Profession-Based Examples'}
          </div>


          {/* HEADING */}
          <h2 className="mb-5 text-[1.9rem] font-black leading-[1.07] tracking-[-0.04em] sm:text-[2.15rem] lg:text-[2.4rem]">

            <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
              Resume examples
            </span>

            <br />

            <span className="bg-gradient-to-b from-[#E7C86E] via-[#BA8B32] to-[#88601B] bg-clip-text text-transparent">
              {exampleType === 'college' ? 'inspired by Top colleges.' : 'tailored for your job.'}
            </span>

          </h2>


          {/* DESCRIPTION */}
          <p className="mb-6 max-w-[560px] text-[14px] font-medium leading-[1.75] text-[#53657E] sm:text-[15px]">
            {exampleType === 'college'
              ? 'Explore structured campus-style resumes inspired by leading colleges. Select a format, preview the complete template, and start building your own.'
              : 'Explore polished resume examples across popular roles, industries, and career paths. Pick a direction, preview the structure, and start building with a professional template.'}
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
          <div className="mb-3 grid grid-cols-2 rounded-xl border border-[#CAD7E5] bg-[#EDF2F7] p-1" role="group" aria-label="Resume example type">
            {[
              { id: 'college', label: 'College Inspired' },
              { id: 'job', label: 'Job Inspired' },
            ].map((option) => {
              const selected = exampleType === option.id;
              return <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectExampleType(option.id)}
                className={`min-h-[40px] rounded-lg px-3 py-2 text-[11px] font-extrabold transition-colors ${selected
                  ? 'bg-[#0C2D50] text-white shadow-[0_5px_14px_rgba(6,23,44,0.16)]'
                  : 'text-[#536980] hover:bg-white hover:text-[#123B68]'}`}
              >{option.label}</button>;
            })}
          </div>

          <div className="grid grid-cols-2 gap-2.5">

            {activeCategories.map((category) => {
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
