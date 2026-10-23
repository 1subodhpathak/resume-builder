import Navbar from './Navbar';
import Footer from './Footer';

const goToLandingSection = (sectionId = 'top') => {
  const target = sectionId === 'top' ? '/' : `/#${sectionId}`;
  window.location.assign(target);
};

const SeoPageShell = ({ children, onStart }) => {
  const start = onStart || (() => window.location.assign('/select'));

  return (
    <div className="theme-app-shell min-h-screen overflow-x-hidden font-sans text-[color:var(--theme-text-primary)]">
      <Navbar
        onOpenRepository={() => window.location.assign('/dashboard')}
        onNavigateLandingSection={goToLandingSection}
      />
      <main className="pt-[73px] sm:pt-[77px]">
        {children}
      </main>
      <Footer
        onOpenRepository={() => window.location.assign('/dashboard')}
        onNavigateLandingSection={goToLandingSection}
        onStart={start}
        onViewTemplates={() => window.location.assign('/resume-templates')}
      />
    </div>
  );
};

export default SeoPageShell;
