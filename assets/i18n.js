(function () {
  const defaultDir = 'ltr';

  function applyTranslations(state) {
    const { lang, translations, directionMap } = state;
    const locale = translations[lang];
    if (!locale) return;

    document.documentElement.lang = lang;
    document.documentElement.dir = directionMap[lang] || defaultDir;

    document.querySelectorAll('[data-i18n-key]').forEach((el) => {
      const key = el.getAttribute('data-i18n-key');
      const value = locale.strings?.[key];
      if (typeof value === 'string') {
        if (el.hasAttribute('data-i18n-html')) {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const key = el.getAttribute('data-i18n-key');
      const attrSpec = el.getAttribute('data-i18n-attr');
      if (!attrSpec || !key) return;
      const value = locale.strings?.[key];
      if (typeof value !== 'string') return;
      attrSpec.split(',').forEach((attr) => {
        const target = attr.trim();
        if (target) {
          el.setAttribute(target, value);
        }
      });
    });
  }

  window.createI18n = function createI18n(options) {
    const {
      translations = {},
      defaultLang = 'en',
      directionMap = {},
    } = options || {};

    const listeners = new Set();
    const state = { lang: defaultLang, translations, directionMap };

    function notify() {
      applyTranslations(state);
      listeners.forEach((fn) => {
        try {
          fn(state.lang, translations[state.lang]);
        } catch (error) {
          console.error('i18n listener failed', error);
        }
      });
    }

    function setLanguage(lang) {
      if (!translations[lang]) return;
      if (state.lang === lang) {
        applyTranslations(state);
        return;
      }
      state.lang = lang;
      notify();
    }

    function onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }

    function t(key) {
      const locale = translations[state.lang];
      return locale?.strings?.[key] ?? key;
    }

    function data() {
      return translations[state.lang] || {};
    }

    // Initial translation flush once DOM is ready.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => applyTranslations(state));
    } else {
      applyTranslations(state);
    }

    return {
      setLanguage,
      onChange,
      t,
      data,
      get lang() {
        return state.lang;
      },
      get translations() {
        return translations;
      },
    };
  };
})();
