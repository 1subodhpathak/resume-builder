import React from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';

const ThemeToggleButton = ({ className = '', showLabel = false, iconOnly = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? SunMedium : Moon;
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={toggleTheme}
      className={`theme-toggle-button ${iconOnly ? 'theme-toggle-button--icon-only' : ''} ${className}`.trim()}
    >
      <span className="theme-toggle-button__icon">
        <Icon size={16} />
      </span>
      {showLabel ? (
        <span className="theme-toggle-button__label">
          {isDark ? 'Light' : 'Dark'}
        </span>
      ) : null}
    </button>
  );
};

export default ThemeToggleButton;
