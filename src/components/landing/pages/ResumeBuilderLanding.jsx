import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';
import SEO from '../../SEO.jsx';
import FAQSection from '../sections/FAQSection.jsx';
import CoraChatbot from '../features/CoraChatbot.jsx';
import FinalCtaSection from '../sections/FinalCtaSection.jsx';
import HeroSection from '../sections/HeroSection.jsx';
import HowItWorksSection from '../sections/HowItWorksSection.jsx';
import ImportResumeSection from '../sections/ImportResumeSection.jsx';
import LaptopShowcaseSection from '../sections/LaptopShowcaseSection.jsx';
import LogoStripSection from '../sections/LogoStripSection.jsx';
import ProblemSection from '../sections/ProblemSection.jsx';
import RepositoryShowcaseSection from '../sections/RepositoryShowcaseSection.jsx';
import ResumeAnatomySection from '../sections/ResumeAnatomySection.jsx';
import ResumeExamplesSection from '../sections/ResumeExamplesSection.jsx';
import TemplateShowcaseSection from '../sections/TemplateShowcaseSection.jsx';
import TestimonialsSection from '../sections/TestimonialsSection.jsx';
import { useHeroWordRotation } from '../hooks/useHeroWordRotation.js';
import { useRepositoryShowcase } from '../hooks/useRepositoryShowcase.js';
import { useTemplateScroller } from '../hooks/useTemplateScroller.js';
import { useTestimonials } from '../hooks/useTestimonials.js';
import '../styles/landingTheme.css';

const ResumeBuilderLanding = ({
  onStart,
  onViewTemplates,
  onUseTemplate,
  onFileSelect,
  onOpenRepository,
}) => {
  const { wordIndex, wordVisible } = useHeroWordRotation();
  const { scrollRef, scrollTemplates } = useTemplateScroller();
  const testimonialState = useTestimonials();
  const repositoryState = useRepositoryShowcase();

  return (
    <div className="theme-app-shell min-h-screen overflow-y-auto custom-scrollbar scroll-smooth font-sans text-[color:var(--theme-text-primary)]">
      <Navbar
        onOpenRepository={onOpenRepository}
      />

      <SEO
        title="Free AI Resume Builder | Create a Professional CV in Minutes - CareerSense"
        description="Upload PDF, DOCX, DOC, or TXT resumes, choose Exact Import or AI Optimized drafting, switch across 100 templates, and export a polished PDF with CareerSense."
        keywords="resume builder, AI resume, CV maker"
      />

      <HeroSection
        heroWordIdx={wordIndex}
        heroWordVisible={wordVisible}
        onStart={onStart}
        onViewTemplates={onViewTemplates}
      />
      <ProblemSection onStart={onStart} />
      <LogoStripSection />
      <TemplateShowcaseSection
        onViewTemplates={onViewTemplates}
        onUseTemplate={onUseTemplate}
        scroll={scrollTemplates}
        scrollRef={scrollRef}
      />
      <ResumeAnatomySection />
      <TestimonialsSection
        currentPage={testimonialState.currentPage}
        handleNextTestimonial={testimonialState.showNextTestimonials}
        handlePrevTestimonial={testimonialState.showPreviousTestimonials}
        itemsPerPage={testimonialState.itemsPerPage}
        numPages={testimonialState.numberOfPages}
        onViewTemplates={onViewTemplates}
        testimonialIndex={testimonialState.testimonialIndex}
      />
      <ResumeExamplesSection onStart={onStart} />
      <ImportResumeSection onFileSelect={onFileSelect} />
      <LaptopShowcaseSection />
      <RepositoryShowcaseSection
        {...repositoryState}
        onOpenRepository={onOpenRepository}
      />
      <HowItWorksSection />
      <FAQSection />
      <FinalCtaSection
        onStart={onStart}
        onViewTemplates={onViewTemplates}
      />
      <Footer
        onOpenRepository={onOpenRepository}
        onStart={onStart}
        onViewTemplates={onViewTemplates}
      />
      <CoraChatbot
        onOpenRepository={onOpenRepository}
        onStart={onStart}
        onViewTemplates={onViewTemplates}
      />
    </div>
  );
};

export default ResumeBuilderLanding;
