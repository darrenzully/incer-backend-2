import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Initialize theme stylesheet before app render
(() => {
  const THEME_LINK_ID = 'theme-css-link';
  const current = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
  if (!current) {
    const pref = (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    const theme = pref === 'system' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : pref;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = THEME_LINK_ID;
    link.href = theme === 'dark' ? '/theme-dark.css' : '/theme-red.css';
    document.head.appendChild(link);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
})();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
