const ROLE_EXAMPLES = [
  ['doctor', 'Doctor', 'doctor-profile', ['Patient Care', 'Clinical Diagnosis', 'Treatment Planning', 'EMR'], ['Attending Physician', 'Resident Physician', 'Clinical Fellow', 'Medical Intern']],
  ['healthcare', 'Healthcare Professional', 'medical', ['Patient Care', 'Clinical Documentation', 'HIPAA', 'Care Coordination'], ['Clinical Team Lead', 'Senior Healthcare Specialist', 'Healthcare Coordinator', 'Clinical Assistant']],
  ['actor', 'Actor', 'actor-spotlight', ['Screen Acting', 'Stage Performance', 'Voice Work', 'Improvisation'], ['Lead Actor', 'Supporting Actor', 'Theatre Performer', 'Acting Apprentice']],
  ['sql-developer', 'SQL Developer', 'sql-terminal', ['SQL', 'PostgreSQL', 'ETL', 'Database Optimization'], ['Lead SQL Developer', 'Senior Database Developer', 'SQL Developer', 'Junior Data Developer']],
  ['data-analyst', 'Data Analyst', 'reporting-mis', ['SQL', 'Tableau', 'Power BI', 'Data Modeling'], ['Lead Data Analyst', 'Senior Data Analyst', 'Business Data Analyst', 'Reporting Analyst']],
  ['software-engineer', 'Software Engineer', 'software-engineer', ['JavaScript', 'React', 'Node.js', 'AWS'], ['Lead Software Engineer', 'Senior Software Engineer', 'Full Stack Developer', 'Junior Developer']],
  ['data-scientist', 'Data Scientist', 'data-scientist', ['Python', 'Machine Learning', 'SQL', 'TensorFlow'], ['Principal Data Scientist', 'Senior Data Scientist', 'Data Scientist', 'Data Analyst']],
  ['accountant', 'Accountant', 'accounting', ['Financial Reporting', 'Excel', 'ERP', 'Reconciliation'], ['Accounting Manager', 'Senior Accountant', 'Staff Accountant', 'Audit Associate']],
  ['teacher', 'Teacher', 'teacher', ['Curriculum Design', 'Classroom Management', 'Assessment', 'Mentoring'], ['Department Head', 'Senior Teacher', 'Classroom Teacher', 'Teaching Assistant']],
  ['lawyer', 'Lawyer', 'lawyer-trial', ['Legal Research', 'Litigation', 'Contract Review', 'Client Counsel'], ['Senior Counsel', 'Associate Attorney', 'Junior Attorney', 'Legal Intern']],
  ['sales-executive', 'Sales Executive', 'sales', ['Salesforce', 'Negotiation', 'Pipeline Management', 'CRM'], ['Regional Sales Director', 'Sales Manager', 'Account Executive', 'Sales Representative']],
  ['product-manager', 'Product Manager', 'product-manager', ['Product Strategy', 'Roadmapping', 'Agile', 'Analytics'], ['Group Product Manager', 'Senior Product Manager', 'Product Manager', 'Associate Product Manager']],
  ['graphic-designer', 'Graphic Designer', 'designer', ['Figma', 'Adobe Creative Suite', 'Brand Design', 'Typography'], ['Creative Director', 'Senior Graphic Designer', 'Graphic Designer', 'Junior Designer']],
  ['digital-marketing', 'Digital Marketing Manager', 'marketing', ['SEO', 'Google Analytics', 'Paid Media', 'HubSpot'], ['Marketing Director', 'Growth Marketing Manager', 'Marketing Specialist', 'Marketing Coordinator']],
  ['architect', 'Architect', 'Architect', ['AutoCAD', 'Revit', 'Design Development', 'Construction Documents'], ['Principal Architect', 'Senior Architect', 'Project Architect', 'Architectural Designer']],
  ['mechanical-engineer', 'Mechanical Engineer', 'engineer', ['SolidWorks', 'AutoCAD', 'ANSYS', 'GD&T'], ['Lead Mechanical Engineer', 'Mechanical Engineer II', 'Design Engineer', 'Graduate Engineer']],
  ['photographer', 'Photographer', 'photographer-resume', ['Portrait Photography', 'Lightroom', 'Photoshop', 'Art Direction'], ['Lead Photographer', 'Commercial Photographer', 'Studio Photographer', 'Photography Assistant']],
  ['chef', 'Chef', 'chef-menu', ['Menu Development', 'Kitchen Operations', 'Food Safety', 'Team Leadership'], ['Executive Chef', 'Sous Chef', 'Chef de Partie', 'Commis Chef']],
  ['student', 'Student', 'student-notes', ['Research', 'Presentations', 'Teamwork', 'Microsoft Office'], ['Student Project Lead', 'Research Assistant', 'Campus Volunteer', 'Student Intern']],
  ['executive', 'Executive', 'executive', ['Business Strategy', 'P&L Management', 'Leadership', 'Transformation'], ['Chief Operating Officer', 'Vice President', 'Senior Director', 'Director']],
  ['business-analyst', 'Business Analyst', 'business-analyst', ['Requirements Gathering', 'SQL', 'Process Mapping', 'Stakeholder Management'], ['Lead Business Analyst', 'Senior Business Analyst', 'Business Analyst', 'Junior Business Analyst']],
  ['chartered-accountant', 'Chartered Accountant', 'chartered-accountant', ['Financial Reporting', 'Taxation', 'Audit', 'Risk Management'], ['Finance Controller', 'Senior Chartered Accountant', 'Audit Associate', 'Article Assistant']],
  ['frontend-developer', 'Frontend Developer', 'developer', ['JavaScript', 'React', 'CSS', 'Web Performance'], ['Frontend Lead', 'Senior Frontend Developer', 'Frontend Developer', 'Web Development Intern']],
  ['marketing-manager', 'Marketing Manager', 'marketing', ['Campaign Strategy', 'Analytics', 'Content Marketing', 'Brand Management'], ['Marketing Director', 'Senior Marketing Manager', 'Marketing Manager', 'Marketing Executive']],
  ['human-resources', 'Human Resources Professional', 'professional-columns', ['Talent Acquisition', 'Employee Relations', 'HRIS', 'Performance Management'], ['HR Director', 'HR Business Partner', 'HR Generalist', 'HR Coordinator']],
  ['civil-engineer', 'Civil Engineer', 'engineer', ['AutoCAD', 'Project Planning', 'Quantity Surveying', 'Site Management'], ['Project Engineering Lead', 'Senior Civil Engineer', 'Site Engineer', 'Graduate Engineer']],
  ['financial-analyst', 'Financial Analyst', 'accounting', ['Financial Modeling', 'Excel', 'Forecasting', 'Valuation'], ['Finance Manager', 'Senior Financial Analyst', 'Financial Analyst', 'Finance Intern']],
  ['consultant', 'Management Consultant', 'consulting-line', ['Strategy', 'Market Analysis', 'Problem Solving', 'Client Management'], ['Engagement Manager', 'Senior Consultant', 'Consultant', 'Business Analyst']],
  ['operations-manager', 'Operations Manager', 'professional', ['Process Improvement', 'Supply Chain', 'Team Leadership', 'KPI Management'], ['Operations Director', 'Senior Operations Manager', 'Operations Manager', 'Operations Analyst']],
  ['career-change', 'Career Change', 'career-launch', ['Transferable Skills', 'Relevant Projects', 'Adaptability', 'Industry Knowledge'], ['Target-Role Project Lead', 'Cross-Functional Contributor', 'Previous-Industry Specialist', 'Career Transition Candidate']],
];

const COMPANY_NAMES = ['Northstar Group', 'Meridian Partners', 'Brightline Systems', 'LaunchPoint Labs'];
const EXPERIENCE_DATES = ['2021 – Present', '2018 – 2021', '2015 – 2018', '2012 – 2015'];

const toTitle = (role) => `${role} Resume Template and Example`;

export const RESUME_EXAMPLE_ROLES = ROLE_EXAMPLES.map(
  ([slug, role, templateId, skills, experienceRoles]) => ({
    slug,
    path: `/resume-examples/${slug}`,
    family: 'role',
    role,
    templateId,
    seoTitle: `${toTitle(role)} | CareerSense`,
    description: `Build a professional ${role.toLowerCase()} resume with a role-specific example, skills, achievement bullets, ATS guidance, and an editable CareerSense template.`,
    skills,
    experienceRoles,
  })
);

const STUDENT_EXAMPLES = [
  ['iit-resume', 'IIT Student', 'iit', ['Engineering Projects', 'Technical Skills', 'Research', 'Leadership'], ['Technical Project Lead', 'Research Intern', 'Student Coordinator', 'Engineering Student'], 'Create an IIT resume that presents technical projects, internships, positions of responsibility, education, and measurable achievements in a concise campus-ready format.'],
  ['iim-resume', 'IIM Student', 'iim', ['Case Analysis', 'Strategy', 'Financial Modeling', 'Leadership'], ['Consulting Project Lead', 'Management Intern', 'Student Committee Lead', 'MBA Candidate'], 'Build an IIM resume with impact-focused bullets for internships, live projects, case competitions, leadership, and academic distinctions.'],
  ['nit-resume', 'NIT Student', 'nit', ['Engineering Design', 'Programming', 'Core Technical Skills', 'Teamwork'], ['Engineering Project Lead', 'Technical Intern', 'Club Coordinator', 'Undergraduate Student'], 'Use an NIT resume format designed to highlight engineering projects, internships, technical skills, campus leadership, and academic performance.'],
  ['bits-pilani-resume', 'BITS Pilani Student', 'bits', ['Practice School', 'Product Development', 'Research', 'Problem Solving'], ['Practice School Intern', 'Project Lead', 'Research Assistant', 'Undergraduate Student'], 'Create a BITS Pilani resume that clearly presents Practice School experience, technical projects, research, coursework, and campus achievements.'],
  ['xlri-resume', 'XLRI Student', 'xlri', ['Human Resources', 'Business Strategy', 'Analytics', 'Leadership'], ['Business Project Lead', 'Management Intern', 'Committee Coordinator', 'Management Student'], 'Build an XLRI resume for consulting, HR, finance, marketing, or general management opportunities with concise, outcome-led experience bullets.'],
  ['mdi-gurgaon-resume', 'MDI Gurgaon Student', 'mdi-gurgaon', ['Business Analysis', 'Market Research', 'Strategy', 'Stakeholder Management'], ['Live Project Lead', 'Summer Intern', 'Student Coordinator', 'MBA Candidate'], 'Create an MDI Gurgaon resume that prioritizes summer internships, live projects, competitions, leadership roles, and measurable business outcomes.'],
  ['nmims-resume', 'NMIMS Student', 'nmims', ['Business Research', 'Financial Analysis', 'Marketing', 'Presentations'], ['Business Project Lead', 'Management Intern', 'Committee Member', 'Management Student'], 'Use an NMIMS resume format for internships and placements, with space for projects, certifications, leadership, academics, and role-relevant skills.'],
  ['bhu-resume', 'BHU Student', 'bhu', ['Academic Research', 'Subject Knowledge', 'Projects', 'Communication'], ['Research Project Lead', 'Academic Intern', 'Society Coordinator', 'University Student'], 'Create a BHU student resume that balances education, research, internships, projects, extracurricular work, and professional skills.'],
  ['lpu-resume', 'LPU Student', 'lpu', ['Applied Projects', 'Industry Tools', 'Internships', 'Communication'], ['Capstone Project Lead', 'Industry Intern', 'Campus Volunteer', 'University Student'], 'Build an LPU resume for placements or internships using clear sections for projects, industry exposure, certifications, technical skills, and achievements.'],
  ['banasthali-resume', 'Banasthali Student', 'banasthali', ['Academic Projects', 'Research', 'Leadership', 'Digital Skills'], ['Project Team Lead', 'Research Intern', 'Student Coordinator', 'University Student'], 'Create a Banasthali student resume with a structured presentation of academics, internships, projects, leadership, skills, and extracurricular achievements.'],
  ['college-student-resume', 'College Student', 'student-notes', ['Coursework', 'Projects', 'Teamwork', 'Communication'], ['Student Project Lead', 'Research Assistant', 'Campus Volunteer', 'College Student'], 'Build a college student resume that turns coursework, projects, volunteering, clubs, and part-time work into evidence of job-ready skills.'],
  ['fresher-resume', 'Fresher', 'career-launch', ['Projects', 'Technical Skills', 'Communication', 'Problem Solving'], ['Graduate Project Lead', 'Intern', 'Campus Coordinator', 'Recent Graduate'], 'Create a fresher resume for jobs in India with a strong objective, relevant skills, internships, projects, certifications, and education.'],
  ['internship-resume', 'Internship Candidate', 'associate-prime', ['Relevant Coursework', 'Projects', 'Research', 'Teamwork'], ['Student Project Lead', 'Volunteer', 'Club Member', 'Internship Candidate'], 'Build an internship resume that connects coursework, projects, campus involvement, and transferable skills to the opportunity you are targeting.'],
  ['final-year-student-resume', 'Final-Year Student', 'Academic', ['Capstone Project', 'Industry Tools', 'Research', 'Presentations'], ['Capstone Project Lead', 'Industry Intern', 'Student Mentor', 'Final-Year Student'], 'Create a final-year student resume for placements with a focused summary, capstone work, internships, certifications, skills, and leadership.'],
  ['resume-with-no-experience', 'Student With No Experience', 'career-launch', ['Academic Projects', 'Volunteering', 'Transferable Skills', 'Coursework'], ['Academic Project Lead', 'Campus Volunteer', 'Society Member', 'Student'], 'Make a resume with no formal work experience by presenting projects, coursework, volunteering, activities, and transferable skills as credible evidence.'],
];

export const STUDENT_RESUME_EXAMPLES = STUDENT_EXAMPLES.map(
  ([slug, role, templateId, skills, experienceRoles, description]) => ({
    slug,
    path: `/student-resume-examples/${slug}`,
    family: 'student',
    role,
    templateId,
    seoTitle: `${role} Resume Sample and Format | CareerSense`,
    description,
    skills,
    experienceRoles,
  })
);

const FORMAT_EXAMPLES = [
  ['ats-resume-template', 'ATS-Friendly', 'Ats', ['Keyword Alignment', 'Standard Headings', 'Readable Formatting', 'Quantified Results'], 'Use an ATS-friendly resume template with standard sections, selectable text, clear chronology, and space for job-specific keywords.'],
  ['one-page-resume-template', 'One-Page', 'minimal', ['Concise Writing', 'Prioritization', 'Clear Hierarchy', 'Impact Bullets'], 'Create a one-page resume that prioritizes the most relevant experience, skills, education, and achievements without overcrowding the page.'],
  ['modern-resume-template', 'Modern', 'modern', ['Visual Hierarchy', 'Professional Branding', 'Skills', 'Achievements'], 'Use a modern resume template with a polished visual hierarchy, clear sections, and an editable structure for contemporary job applications.'],
  ['professional-resume-template', 'Professional', 'professional', ['Professional Summary', 'Experience', 'Core Skills', 'Achievements'], 'Build a professional resume with a credible summary, reverse-chronological experience, relevant skills, and measurable accomplishments.'],
  ['academic-resume-template', 'Academic', 'Academic', ['Research', 'Publications', 'Education', 'Teaching'], 'Create an academic resume for research, teaching, higher education, or postgraduate applications with room for publications, projects, and credentials.'],
];

export const RESUME_TEMPLATE_EXAMPLES = FORMAT_EXAMPLES.map(
  ([slug, role, templateId, skills, description]) => ({
    slug,
    path: `/resume-templates/${slug}`,
    family: 'template',
    role: `${role} Resume`,
    templateId,
    seoTitle: `${role} Resume Template | CareerSense`,
    description,
    skills,
    experienceRoles: ['Professional Experience', 'Selected Projects', 'Education and Certifications', 'Skills and Achievements'],
  })
);

export const ALL_RESUME_SEO_EXAMPLES = [
  ...RESUME_EXAMPLE_ROLES,
  ...STUDENT_RESUME_EXAMPLES,
  ...RESUME_TEMPLATE_EXAMPLES,
];

export const getResumeSeoExampleByPath = (path = '') =>
  ALL_RESUME_SEO_EXAMPLES.find((example) => example.path === path) || null;

export const getResumeExampleRole = (slug = '') =>
  RESUME_EXAMPLE_ROLES.find((example) => example.slug === slug) || null;

export const buildRoleResumeData = (example) => ({
  personal: {
    name: 'Pooja Bansal',
    title: example.role,
    email: 'pooja.bansal@example.com',
    phone: '+1 555 0142 880',
    location: 'New York, USA',
    linkedin: 'linkedin.com/in/poojabansal',
    summary: `${example.role} with progressive experience delivering high-quality work, improving team performance, and translating complex requirements into measurable outcomes. Known for clear communication, dependable execution, and strong cross-functional collaboration.`,
  },
  experience: example.experienceRoles.map((role, index) => ({
    id: index + 1,
    role,
    company: COMPANY_NAMES[index],
    date: EXPERIENCE_DATES[index],
    desc: index === 0
      ? `• Led high-priority initiatives that improved quality, delivery speed, and stakeholder outcomes.\n• Established repeatable workflows and performance measures that reduced manual effort.\n• Mentored team members and presented clear recommendations to senior leadership.`
      : `• Delivered role-critical projects while meeting quality, compliance, and timeline expectations.\n• Improved documentation and collaboration across internal and external teams.`,
    pageBreak: false,
  })),
  education: [{ id: 1, degree: `Bachelor's Degree`, school: 'New York University', date: '2012', pageBreak: false }],
  skills: {
    core: example.skills.slice(0, 2),
    technical: example.skills,
    soft: ['Leadership', 'Communication', 'Problem Solving', 'Stakeholder Management'],
  },
  projects: [{ id: 1, name: `${example.role} Performance Initiative`, desc: 'Designed and delivered a structured improvement initiative that increased quality, visibility, and operational consistency.', pageBreak: false }],
  awards: [{ id: 1, name: 'Performance Excellence Award', issuer: 'Northstar Group', date: '2023', pageBreak: false }],
  certifications: [{ id: 1, name: `${example.role} Professional Certification`, issuer: 'Professional Institute', date: '2022', pageBreak: false }],
  languages: [{ name: 'English', level: 'Native' }, { name: 'Spanish', level: 'Conversational' }],
});

export const RESUME_EXAMPLES_PATH = '/resume-examples';

const ROLE_SEARCH_ALIASES = {
  doctor: ['physician', 'medical doctor', 'clinical resume'],
  healthcare: ['medical', 'healthcare worker', 'clinical professional'],
  actor: ['acting', 'theatre', 'film actor'],
  'sql-developer': ['database developer', 'SQL engineer', 'ETL developer'],
  'data-analyst': ['business intelligence', 'BI analyst', 'reporting analyst'],
  'software-engineer': ['software developer', 'full stack developer', 'programmer'],
  'data-scientist': ['machine learning', 'ML scientist', 'AI engineer'],
  accountant: ['CPA', 'finance', 'audit'],
  teacher: ['educator', 'teaching', 'education'],
  lawyer: ['attorney', 'legal counsel', 'litigation'],
  'sales-executive': ['sales manager', 'account executive', 'business development'],
  'product-manager': ['product management', 'product owner', 'PM'],
  'graphic-designer': ['designer', 'visual designer', 'creative designer'],
  'digital-marketing': ['marketing', 'SEO manager', 'growth marketing'],
  architect: ['architecture', 'project architect', 'revit'],
  'mechanical-engineer': ['engineer', 'design engineer', 'manufacturing engineer'],
  photographer: ['photography', 'commercial photographer', 'photo portfolio'],
  chef: ['cook', 'culinary', 'executive chef'],
  student: ['college student', 'graduate', 'internship'],
  executive: ['CEO', 'director', 'senior leadership'],
};

export const getTemplateSeoMetadata = (templateId) => {
  const example = ALL_RESUME_SEO_EXAMPLES.find((item) => item.templateId === templateId);
  if (!example) return {};

  return {
    seoName: `${example.role} Resume Template`,
    seoSlug: example.slug,
    searchAliases: [example.role, ...(ROLE_SEARCH_ALIASES[example.slug] || [])],
  };
};
