import React, { useEffect, useMemo, useState } from 'react';

const THEME_LINK_ID = 'theme-css-link';

type ThemePref = 'light' | 'dark' | 'system';

const getSystemPrefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (pref: ThemePref) => {
  const effective: 'light' | 'dark' = pref === 'system' ? (getSystemPrefersDark() ? 'dark' : 'light') : pref;
  let link = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = THEME_LINK_ID;
    document.head.appendChild(link);
  }
  link.href = effective === 'dark' ? '/theme-dark.css' : '/theme-red.css';
  // Toggle Tailwind dark variant root class for full app support
  if (effective === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', pref);
};

const PreferencesPage: React.FC = () => {
  const initialPref = (localStorage.getItem('theme') as ThemePref) || 'system';
  const [themePref, setThemePref] = useState<ThemePref>(initialPref);

  // Re-aplica al cambiar la preferencia
  useEffect(() => {
    applyTheme(themePref);
  }, [themePref]);

  // Si está en system, ajusta ante cambios del SO
  useEffect(() => {
    if (themePref !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler as any);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler as any);
    };
  }, [themePref]);

  const options = useMemo(() => ([
    { value: 'light' as ThemePref, label: 'Claro' },
    { value: 'dark' as ThemePref, label: 'Oscuro' },
    { value: 'system' as ThemePref, label: 'Seguir sistema' }
  ]), []);

  return (
    <div className="container py-3" style={{ maxWidth: 480 }}>
      <h2 className="mb-3">Preferencias</h2>

      <div className="mb-3">
        <label className="form-label d-block mb-2">Tema</label>
        {options.map(opt => (
          <div className="form-check" key={opt.value}>
            <input
              className="form-check-input"
              type="radio"
              name="themePref"
              id={`theme-${opt.value}`}
              checked={themePref === opt.value}
              onChange={() => setThemePref(opt.value)}
            />
            <label className="form-check-label" htmlFor={`theme-${opt.value}`}>
              {opt.label}
            </label>
          </div>
        ))}
      </div>

      <p className="text-muted small">Tu preferencia se guarda para visitas futuras. Si eliges "Seguir sistema", el tema se adaptará a la configuración del dispositivo.</p>
    </div>
  );
};

export default PreferencesPage;