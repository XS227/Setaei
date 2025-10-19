(function () {
  function getLabel(source, fallback) {
    if (!source) return fallback;
    const text = typeof source === 'string' ? source : source.textContent;
    return (text || fallback).trim();
  }

  function enhanceShell(i18n) {
    const nav = document.getElementById('primaryNav');
    const toggle = document.querySelector('.nav-toggle');
    if (!nav || !toggle) {
      return;
    }

    const closedTextEl = toggle.querySelector('.nav-toggle-text--closed');
    const openTextEl = toggle.querySelector('.nav-toggle-text--open');
    const mediaQuery = window.matchMedia('(max-width: 720px)');

    const getClosedLabel = () => {
      if (i18n?.t) {
        const label = i18n.t('navToggleAriaClosed');
        if (label && label !== 'navToggleAriaClosed') {
          return label;
        }
      }
      return getLabel(closedTextEl, 'Open navigation menu');
    };

    const getOpenLabel = () => {
      if (i18n?.t) {
        const label = i18n.t('navToggleAriaOpen');
        if (label && label !== 'navToggleAriaOpen') {
          return label;
        }
      }
      return getLabel(openTextEl, 'Close navigation menu');
    };

    const setAriaLabel = (isOpen) => {
      toggle.setAttribute('aria-label', isOpen ? getOpenLabel() : getClosedLabel());
    };

    const closeNav = () => {
      nav.dataset.open = 'false';
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      setAriaLabel(false);
    };

    const openNav = () => {
      nav.dataset.open = 'true';
      toggle.classList.add('is-active');
      toggle.setAttribute('aria-expanded', 'true');
      setAriaLabel(true);
    };

    const handleMediaChange = (event) => {
      if (!event.matches) {
        nav.dataset.open = 'true';
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        setAriaLabel(false);
        return;
      }

      closeNav();
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.dataset.open === 'true';
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (mediaQuery.matches) {
          closeNav();
        }
      });
    });

    handleMediaChange(mediaQuery);
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleMediaChange);
    }

    if (i18n?.onChange) {
      i18n.onChange(() => {
        const isOpen = nav.dataset.open === 'true';
        setAriaLabel(isOpen);
      });
    } else {
      const isOpen = nav.dataset.open === 'true';
      setAriaLabel(isOpen);
    }
  }

  window.enhanceShell = enhanceShell;
})();
