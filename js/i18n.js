/* ============================================
   Lightweight i18n for static site
   Supports: en, zh-CN, zh-TW
   Stores user choice in localStorage
   ============================================ */

(function () {
  const SUPPORTED = ['en', 'zh-CN', 'zh-TW'];
  const DEFAULT_LANG = 'zh-CN';
  const STORAGE_KEY = 'site_lang';

  // Get user's saved language, or default
  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    return DEFAULT_LANG;
  }

  // Save and apply language
  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  // Look up a nested key like "home.hero_title" in a dict
  function lookup(dict, key) {
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), dict);
  }

  // Fetch the JSON file for a language and apply translations
  function applyLang(lang) {
    fetch('lang/' + lang + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + lang + '.json');
        return res.json();
      })
      .then(function (dict) {
        // Set html lang attribute (affects font-family rules in custom.css)
        document.documentElement.setAttribute('lang', lang);

        // Translate every element with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
          const key = el.getAttribute('data-i18n');
          const value = lookup(dict, key);
          if (value !== null) {
            if (el.tagName === 'TITLE') {
              document.title = value;
            } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
              el.placeholder = value;
            } else {
              el.textContent = value;
            }
          }
        });

        // Update active state on language buttons
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
          if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      })
      .catch(function (err) {
        console.error('i18n error:', err);
      });
  }

  // Wire up the language buttons after DOM is ready
  function init() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
    applyLang(getLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();