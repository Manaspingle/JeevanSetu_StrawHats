import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'default' | 'clinical';
export type TextSize = 'sm' | 'base' | 'lg';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  cycleTextSize: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('js_theme_mode');
    return saved === 'clinical' ? 'clinical' : 'default';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('js_high_contrast') === 'true';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    const saved = localStorage.getItem('js_text_size');
    return (saved === 'sm' || saved === 'lg') ? saved : 'base';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Apply Theme
    if (themeMode === 'clinical') {
      root.setAttribute('data-theme', 'clinical');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('js_theme_mode', themeMode);

    // Apply High Contrast
    if (highContrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }
    localStorage.setItem('js_high_contrast', highContrast.toString());

    // Apply Text Scale
    root.setAttribute('data-text-size', textSize);
    localStorage.setItem('js_text_size', textSize);
  }, [themeMode, highContrast, textSize]);

  const toggleThemeMode = () => {
    setThemeModeState(prev => prev === 'default' ? 'clinical' : 'default');
  };

  const toggleHighContrast = () => {
    setHighContrastState(prev => !prev);
  };

  const cycleTextSize = () => {
    setTextSizeState(prev => {
      if (prev === 'sm') return 'base';
      if (prev === 'base') return 'lg';
      return 'sm';
    });
  };

  return (
    <ThemeContext.Provider value={{
      themeMode,
      setThemeMode: setThemeModeState,
      toggleThemeMode,
      highContrast,
      toggleHighContrast,
      textSize,
      setTextSize: setTextSizeState,
      cycleTextSize
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
