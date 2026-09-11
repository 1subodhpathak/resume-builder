import { BarChart3, Brain, Briefcase, Coins, FileWarning, FolderOpen, Layout, PenTool, ScanLine, Target, UploadCloud, UserRound, Zap } from 'lucide-react';
import anjaliImage from '../../../assets/Anjali.png';
import poojaImage from '../../../assets/Pooja.png';
import rohanImage from '../../../assets/Rohan.png';
import vikramImage from '../../../assets/Vikram.png';
import nehaImage from '../../../assets/neha.png';
import arjunImage from '../../../assets/arjun.png';
import snehaImage from '../../../assets/Sneha.png';
import karanImage from '../../../assets/karan.png';

// --- DUMMY DATA FOR LANDING PAGE PREVIEWS ---
export const PREVIEW_DATA = {
  personal: {
    name: "Pooja Bansal",
    title: "Business Intelligence Leader",
    email: "p.bansal@careersense.com",
    phone: "+1 555 0199 283",
    location: "New York, USA",
    photo: poojaImage,
    summary:
      "Business Intelligence leader with 10+ years of experience turning complex data into commercial strategy. Proven success leading analytics teams, building executive dashboards, improving reporting operations, and delivering measurable revenue impact."
  },

  experience: [
    {
      id: 1,
      role: "Senior BI Manager",
      company: "Global Tech Solutions",
      date: "2020 - Present",
      desc:
        "• Lead a 10-member analytics team supporting executive reporting across sales, finance, and operations.\n" +
        "• Built automated Tableau dashboards that reduced reporting effort by 15 hours per week and improved KPI visibility.",
      pageBreak: false
    },
    {
      id: 2,
      role: "Business Data Analyst",
      company: "FinStream Corp",
      date: "2017 - 2020",
      desc:
        "• Analyzed customer behavior and market trends, contributing to a successful $2M product launch.\n" +
        "• Developed SQL reporting pipelines across multiple data sources while maintaining 99.9% reporting accuracy.",
      pageBreak: false
    },
    {
      id: 3,
      role: "BI Analyst",
      company: "Northstar Analytics",
      date: "2015 - 2017",
      desc:
        "• Created Power BI and Excel dashboards for sales, customer, and operational performance reporting.\n" +
        "• Automated recurring management reports, reducing monthly preparation time by approximately 30%.",
      pageBreak: false
    },
    {
      id: 4,
      role: "Junior Data Analyst",
      company: "Insight Consulting Group",
      date: "2013 - 2015",
      desc:
        "• Prepared weekly business performance reports and performed data validation for client analytics projects.\n" +
        "• Supported forecasting, trend analysis, and executive presentations using SQL and Excel.",
      pageBreak: false
    }
  ],

  education: [
    {
      id: 1,
      degree: "MBA, Business Intelligence",
      school: "Stern School of Business",
      date: "2017",
      pageBreak: false
    },
    {
      id: 2,
      degree: "B.S. in Data Science",
      school: "New York University",
      date: "2013",
      pageBreak: false
    }
  ],

  skills: {
    core: [
      "Business Intelligence",
      "Data Strategy",
      "KPI Design",
      "Market Analysis",
      "Revenue Operations"
    ],
    technical: [
      "SQL",
      "Python",
      "Tableau",
      "Power BI",
      "Excel",
      "Google Analytics"
    ],
    soft: [
      "Leadership",
      "Stakeholder Management",
      "Strategic Thinking",
      "Communication"
    ]
  },

  projects: [
    {
      id: 1,
      name: "Global BI Dashboard",
      desc:
        "Built a centralized dashboard combining sales and operational KPIs across 12 international regions.",
      pageBreak: false
    },
    {
      id: 2,
      name: "Executive Reporting Automation",
      desc:
        "Automated recurring leadership reports and reduced manual reporting turnaround by 40%.",
      pageBreak: false
    }
  ],

  awards: [
    {
      id: 1,
      name: "Leadership Excellence Award",
      issuer: "Global Tech Solutions",
      pageBreak: false
    },
    {
      id: 2,
      name: "Analytics Impact Award",
      issuer: "FinStream Corp",
      pageBreak: false
    }
  ],

  certifications: [
    {
      id: 1,
      name: "Certified Business Intelligence Professional",
      issuer: "TDWI",
      date: "2019",
      pageBreak: false
    },
    {
      id: 2,
      name: "Microsoft Power BI Data Analyst",
      issuer: "Microsoft",
      date: "2022",
      pageBreak: false
    }
  ],

  languages: [
    {
      name: "English",
      level: "Native"
    },
    {
      name: "Spanish",
      level: "Conversational"
    }
  ],

  volunteering: [
    {
      id: 1,
      role: "Analytics Mentor",
      org: "Women in Data",
      date: "2021 - Present",
      desc:
        "Mentor early-career analysts in SQL, dashboards, and career development.",
      pageBreak: false
    }
  ]
};

export const LIVE_TEMPLATE_COUNT = 100;

export const testimonials = [
  {
    name: "Pooja Bansal",
    role: "Business Intelligence Leader",
    text: "CareerSense made my job hunt so much easier. The AI tailoring helped me land interviews at three top tech firms in just two weeks.",
    image: poojaImage
  },
  {
    name: "Rohan Mehta",
    role: "Software Engineer @ Google",
    text: "The ATS scoring is a game changer. I could finally see why my resume was being filtered out and fixed it instantly.",
    image: rohanImage
  },
  {
    name: "Anjali Sharma",
    role: "Product Manager @ Zomato",
    text: "The templates are stunning and professional. I love how I can switch designs without re-entering my work history.",
    image: anjaliImage
  },
  {
    name: "Vikram Singh",
    role: "Data Scientist @ Amazon",
    text: "Importing my old resume was seamless. The AI optimization suggested better ways to describe my technical projects.",
    image: vikramImage
  },
  {
    name: "Neha Kapoor",
    role: "Senior Marketing Manager",
    text: "I created a role-specific resume in minutes. CareerSense helped me highlight the achievements that actually mattered for the position I was targeting.",
    image: nehaImage
  },
  {
    name: "Arjun Rao",
    role: "Full Stack Developer",
    text: "I had been using the same resume for years. CareerSense helped me restructure my experience, strengthen my project descriptions, and make everything much more concise.",
    image: arjunImage
  },
  {
    name: "Sneha Iyer",
    role: "Financial Analyst",
    text: "The job-description matching feature is incredibly useful. I could immediately see which skills were missing and tailor my resume before applying.",
    image: snehaImage
  },
  {
    name: "Karan Malhotra",
    role: "Operations Manager",
    text: "What I liked most was having everything in one place: resume building, ATS checks, interview preparation, and multiple professional templates.",
    image: karanImage
  }
];

// --- FAQ DATA ---

export // --- FAQ DATA ---
const FAQ_DATA = [{
  q: "Which files can I upload into CareerSense?",
  a: "You can currently upload PDF, DOCX, DOC, and TXT files. The builder extracts those files into editable resume sections before you choose a template."
}, {
  q: "What is the difference between Exact Import and AI Optimized?",
  a: "Exact Import preserves the wording from your existing resume as closely as possible. AI Optimized builds a stronger editable draft from the same source content, but you still review and edit every section before export."
}, {
  q: "Do I need a job description to use the builder?",
  a: "No. A job description is only needed when you want role tailoring, ATS score checks, or interview prep tied to a specific opportunity."
}, {
  q: "Can I switch templates after importing my resume?",
  a: "Yes. Your content stays editable while you move across templates, so you can compare different visual directions without starting over."
}, {
  q: "Can I edit the resume directly on the preview?",
  a: "Yes. The editor supports both form-based editing and live editing on the resume preview, so you can refine wording where you see it."
}, {
  q: "What does My Repository save for me?",
  a: "My Repository stores saved resumes, profile basics, ATS scan history, interview prep history, operation analysis, and Career Point usage so you can reopen work later."
}, {
  q: "Is the AI output final?",
  a: "No. AI output is always treated as a draft. You can review, edit, replace, or ignore suggestions before saving or exporting the final resume."
}, {
  q: "How does PDF export work?",
  a: "The builder uses the same live A4 preview you see in the editor, then opens the browser print engine so you can save a selectable PDF when the layout looks right."
}];

export const SCROLLER_TEMPLATES = [{
  id: 'Ats',
  name: 'ATS Resume',
  style: 'Recruiter-friendly'
},
{
  id: 'bordered-elegant',
  name: 'Executive Resume',
  style: 'Elegant bordered layout'
},
{
  id: 'forest-sidebar',
  name: 'Professional Resume',
  style: 'Modern sidebar layout'
},
{
  id: 'boardroom-one',
  name: 'Linkedin Resume',
  style: 'Professional template'
},
 {
  id: 'infographic',
  name: 'Data Visualization Resume',
  style: 'Infographic layout'
},
{
  id: 'leadership-signature',
  name: 'CEO Resume',
  style: 'Executive C-Suite'
},
{
  id: 'career-launch',
  name: 'career launch',
  style: 'Freshers templates'
},
{
  id: 'magazine-cover',
  name: 'Editorial Resume',
  style: 'Magazine-style layout'
},  {
  id: 'youtube-creator',
  name: 'YouTube Creator Resume',
  style: 'Content creator template'
}, {
  id: 'professional',
  name: 'Modern Professional Resume',
  style: 'Clean corporate layout'
}, {
  id: 'developer',
  name: 'Web Developer Resume',
  style: 'Developer console layout'
}, {
  id: 'gamer-arena',
  name: 'Game Designer Resume',
  style: 'Gaming industry template'
},
{
  id: 'lawyer-trial',
  name: 'Lawyer Resume',
  style: 'Legal career template'
}, {
  id: 'sql-terminal',
  name: 'SQL Developer Resume',
  style: 'Database career template'
}, {
  id: 'newspaper-editorial',
  name: 'Journalist Resume',
  style: 'Newspaper editorial layout'
}, {
  id: 'actor-spotlight',
  name: 'Actor Resume',
  style: 'Film and theatre template'
}, {
  id: 'reporting-mis',
  name: 'Data Analyst Resume',
  style: 'Reporting and MIS layout'
}, {
  id: 'chartered-accountant',
  name: 'Accountant Resume',
  style: 'Finance career template'
}, {
  id: 'info-executive',
  name: 'Leadership Resume',
  style: 'Executive grid layout'
}, {
  id: 'cyan-grid',
  name: 'Product Designer Resume',
  style: 'Visual grid layout'
},
{
  id: 'motion-designer-board',
  name: 'Motion Designer Resume',
  style: 'Creative portfolio layout'
}, {
  id: 'info-navy',
  name: 'Infographic Resume',
  style: 'Visual career timeline'
}, {
  id: 'classic',
  name: 'Academic Resume',
  style: 'Traditional one-column layout'
}, {
  id: 'class-file-dark',
  name: 'Java Developer Resume',
  style: 'Code-inspired layout'
}, {
  id: 'blue-frame',
  name: 'Corporate Resume',
  style: 'Structured blue layout'
}, {
  id: 'amber-visual',
  name: 'Marketing Resume',
  style: 'Visual campaign layout'
}, {
  id: 'professional-columns',
  name: 'Two-Column Resume',
  style: 'Professional split layout'
}, {
  id: 'tech',
  name: 'IT Professional Resume',
  style: 'Dark technical layout'
}, {
  id: 'Architect',
  name: 'Architect Resume',
  style: 'Project-focused layout'
}, {
  id: 'bubble-header',
  name: 'Creative Resume',
  style: 'Modern header layout'
}, {
  id: 'modern-circle',
  name: 'Creative Professional Resume',
  style: 'Circular profile layout'
}, {
  id: 'student-notes',
  name: 'Student Resume',
  style: 'Early-career template'
},
{
  id: 'doctor-profile',
  name: 'Doctor Resume',
  style: 'Physician career template'
},
{
  id: 'chalkboard-artist',
  name: 'Artist Resume',
  style: 'Creative showcase layout'
}, {
  id: 'polaroid-portfolio',
  name: 'Photography Portfolio Resume',
  style: 'Polaroid showcase layout'
}, {
  id: 'influencer-media-kit',
  name: 'Influencer Resume',
  style: 'Media kit layout'
}, {
  id: 'chef-menu',
  name: 'Chef Resume',
  style: 'Culinary career template'
}, {
  id: 'painter-canvas',
  name: 'Painter Resume',
  style: 'Canvas portfolio layout'
}, {
  id: 'portfolio-showcase',
  name: 'Portfolio Resume',
  style: 'Project showcase layout'
}, {
  id: 'photographer-resume',
  name: 'Photographer Resume',
  style: 'Commercial photo template'
}, {
  id: 'software-engineer',
  name: 'Software Engineer Resume',
  style: 'Technical career template'
}, {
  id: 'business-analyst',
  name: 'Business Analyst Resume',
  style: 'Business impact layout'
}, {
  id: 'designer',
  name: 'Graphic Designer Resume',
  style: 'Creative portfolio template'
}, {
  id: 'medical',
  name: 'Healthcare Resume',
  style: 'Clinical career template'
}, {
  id: 'centered-initials',
  name: 'Entry-Level Resume',
  style: 'Clean profile layout'
}, {
  id: 'startup',
  name: 'Startup Resume',
  style: 'Modern growth template'
}, {
  id: 'berlin',
  name: 'Bold Professional Resume',
  style: 'High-impact layout'
}];

export const HERO_WORDS = ['Tailored', 'Polished', 'Targeted', 'ATS-Ready'];

export const HERO_STATS = [{
  icon: Zap,
  value: '60%',
  label: 'Faster'
}, {
  icon: Layout,
  value: '100+',
  label: 'Pro Templates'
}, {
  icon: Brain,
  value: 'ATS',
  label: 'Optimized'
}, {
  icon: Briefcase,
  value: 'JOB',
  label: 'Ready'
}];

export const HERO_ACTION_CARDS = [{
  icon: PenTool,
  title: 'Build from scratch',
  description: 'Go straight into template selection and write every section yourself with full control.',
  action: 'Start empty draft',
  mode: 'scratch'
}, {
  icon: UploadCloud,
  title: 'Import Resume',
  description: 'Upload PDF, DOCX, or TXT and choose between Exact or AI Optimized starting drafts.',
  action: 'Upload your file',
  mode: 'upload'
}, {
  icon: Briefcase,
  title: 'Tailor to Role',
  description: 'Combine your base resume with a JD to build a highly aligned, ATS-ready application.',
  action: 'Open JD tailor',
  mode: 'tailor'
}];

export const entryPathsData = HERO_ACTION_CARDS;

export const painPoints = [{
  icon: FileWarning,
  text: 'Generic resumes miss the role-specific language recruiters and ATS tools scan for.'
}, {
  icon: Layout,
  text: 'Manual formatting steals time and often breaks when exporting or changing templates.'
}, {
  icon: Target,
  text: 'Applicants need stronger alignment between their base resume and each job description.'
}];

export const addresses = ['Resume Import', 'AI Optimization', 'JD Tailoring', 'Template Switching', 'ATS Review', 'PDF Export'];

export const REPOSITORY_SHOWCASE_VIEWS = [{
  id: 'resumes',
  label: 'Resumes',
  icon: FolderOpen
}, {
  id: 'history',
  label: 'Analysis',
  icon: ScanLine
}, {
  id: 'usage',
  label: 'My Usage',
  icon: Coins
}, {
  id: 'operations',
  label: 'Operations',
  icon: BarChart3
}, {
  id: 'profile',
  label: 'Profile',
  icon: UserRound
}];

export const LANDING_MODE_LABELS = {
  scratch: 'From Scratch',
  upload: 'Using Old Resume',
  tailor: 'Resume + JD'
};

export const formatLandingNumber = value => new Intl.NumberFormat().format(Number(value || 0));

export const formatLandingDate = value => {
  if (!value) return 'Just now';
  try {
    return new Date(value).toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return value;
  }
};

export const formatLandingDateTime = value => {
  if (!value) return 'Not yet';
  try {
    return new Date(value).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return value;
  }
};
