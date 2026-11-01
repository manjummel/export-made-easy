import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('exportease-theme');
    if (savedTheme) {
      return savedTheme;
    }
    return 'cinematic-dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('exportease-theme', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    availableThemes: [
      { id: 'cinematic-dark', label: 'Cinematic Dark', type: 'dark' },
      { id: 'enterprise-light', label: 'Enterprise Light', type: 'light' },
      { id: 'ocean-blue', label: 'Ocean Blue', type: 'dark' },
      { id: 'emerald-forest', label: 'Emerald Forest', type: 'dark' },
      { id: 'executive-slate', label: 'Executive Slate', type: 'dark' },
      { id: 'corporate-light', label: 'Corporate Light', type: 'light' }
    ]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
