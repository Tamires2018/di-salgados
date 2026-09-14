import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import '../styles/theme.css';

const STORAGE_KEY = 'di-salgados-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme =
    localStorage.getItem(STORAGE_KEY);

  if (
    savedTheme === 'dark' ||
    savedTheme === 'light'
  ) {
    return savedTheme;
  }

  return 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    getInitialTheme
  );

  /*
   * Aplica o tema sempre que ele mudar.
   */
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(
      STORAGE_KEY,
      theme
    );
  }, [theme]);

  /*
   * Sincroniza os ThemeToggle que estão
   * dentro da mesma página.
   */
  useEffect(() => {
    const syncTheme = (event) => {
      const nextTheme = event.detail;

      if (
        nextTheme === 'dark' ||
        nextTheme === 'light'
      ) {
        setTheme(nextTheme);
      }
    };

    window.addEventListener(
      'di-salgados-theme-change',
      syncTheme
    );

    return () => {
      window.removeEventListener(
        'di-salgados-theme-change',
        syncTheme
      );
    };
  }, []);

  /*
   * Sincroniza também entre abas/janelas
   * diferentes do navegador.
   */
  useEffect(() => {
    const syncStorageTheme = () => {
      const nextTheme =
        localStorage.getItem(STORAGE_KEY);

      if (
        nextTheme === 'dark' ||
        nextTheme === 'light'
      ) {
        setTheme(nextTheme);
      }
    };

    window.addEventListener(
      'storage',
      syncStorageTheme
    );

    return () => {
      window.removeEventListener(
        'storage',
        syncStorageTheme
      );
    };
  }, []);

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark
      ? 'light'
      : 'dark';

    setTheme(nextTheme);

    applyTheme(nextTheme);

    localStorage.setItem(
      STORAGE_KEY,
      nextTheme
    );

    /*
     * Avisa todos os outros ThemeToggle
     * existentes na página.
     */
    window.dispatchEvent(
      new CustomEvent(
        'di-salgados-theme-change',
        {
          detail: nextTheme
        }
      )
    );
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? 'Ativar modo claro'
          : 'Ativar modo escuro'
      }
      title={
        isDark
          ? 'Modo claro'
          : 'Modo escuro'
      }
    >
      {isDark ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}
    </button>
  );
}