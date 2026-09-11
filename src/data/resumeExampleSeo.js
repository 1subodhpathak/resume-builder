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
];

const COMPANY_NAMES = ['Northstar Group', 'Meridian Partners', 'Brightline Systems', 'LaunchPoint Labs'];
const EXPERIENCE_DATES = ['2021 – Present', '2018 – 2021', '2015 – 2018', '2012 – 2015'];

const toTitle = (role) => `${role} Resume Template and Example`;

export const RESUME_EXAMPLE_ROLES = ROLE_EXAMPLES.map(
  ([slug, role, templateId, skills, experienceRoles]) => ({
    slug,
    role,
    templateId,
    seoTitle: `${toTitle(role)} | CareerSense`,
    description: `Build a professional ${role.toLowerCase()} resume with a role-specific example, skills, achievement bullets, ATS guidance, and an editable CareerSense template.`,
    skills,
    experienceRoles,
  })
);

export const getResumeExampleRole = (slug = '') =>
  RESUME_EXAMPLE_ROLES.find((example) => example.slug === slug) || null;

export const buildRoleResumeData = (example) => ({
  personal: {
    name: 'ALEX MORGAN',
    title: example.role,
    email: 'alex.morgan@example.com',
    phone: '+1 555 0142 880',
    location: 'New York, USA',
    linkedin: 'linkedin.com/in/alexmorgan',
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
  const example = RESUME_EXAMPLE_ROLES.find((item) => item.templateId === templateId);
  if (!example) return {};

  return {
    seoName: `${example.role} Resume Template`,
    seoSlug: example.slug,
    searchAliases: [example.role, ...(ROLE_SEARCH_ALIASES[example.slug] || [])],
  };
};
