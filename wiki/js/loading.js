/* WIKI ORI loading screen — chỉ cần gắn file này, không cần thêm HTML/CSS.
   Cách gắn: <script src="js/loading.js"></script>  (đặt trong <head> hoặc đầu <body>) */
(function () {
  'use strict';

  /* ===== Cấu hình ===== */
  var CONFIG = {
    cycle: 5200,        // ms cho 1 vòng viết chữ
    minShow: 2600,      // thời gian hiện tối thiểu (ms) để kịp thấy chữ
    autoHide: true,     // tự ẩn khi trang tải xong
    themeStorageKey: 'wiki-ori-loader-theme',
    sessionCode: 'C21H23K132M',
    defaultTheme: 'logo',
    themes: {
      logo: {
        inkLight: '#1b2a41',
        accentLight: '#2f6df6',
        inkDark: '#e8eefb',
        accentDark: '#6ea0ff',
        bgLight: '#f5f7fa',
        bgDark: '#0e1522'
      },
      ocen: {
        inkLight: '#342a16',
        accentLight: '#b8892c',
        inkDark: '#f2eee5',
        accentDark: '#e2bd61',
        bgLight: '#faf8f1',
        bgDark: '#141414'
      }
    }
  };

  var lastShowTime = Date.now();
  var loaded = false;
  var activeTasks = new Map();
  var nextTaskId = 0;
  var hideTimer = 0;
  var wrap;
  var style;

  /* ===== CSS ===== */
  var css =
    '#wiki-ori-loader{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;' +
    'background:var(--wo-bg-light,#f5f7fa);transition:opacity .5s ease;' +
    '--wo-ink:var(--wo-ink-light,#1b2a41);--wo-accent:var(--wo-accent-light,#2f6df6)}' +
    '@media (prefers-color-scheme:dark){#wiki-ori-loader{background:var(--wo-bg-dark,#0e1522);' +
    '--wo-ink:var(--wo-ink-dark,#e8eefb);--wo-accent:var(--wo-accent-dark,#6ea0ff)}}' +
    '#wiki-ori-loader.wo-hide{opacity:0;pointer-events:none}' +
    '#wiki-ori-loader .wo-content{display:grid;justify-items:center;gap:18px;width:min(88vw,600px)}' +
    '#wiki-ori-loader svg{width:min(80vw,560px);height:auto;overflow:visible}' +
    '#wiki-ori-loader-label{color:var(--wo-accent);font:500 14px/1.5 Arial,sans-serif;text-align:center}' +
    '#wiki-ori-loader path{fill:none;stroke:var(--wo-ink);stroke-width:7;stroke-linecap:round;' +
    'stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}' +
    '#wiki-ori-loader path.wo-accent{stroke:var(--wo-accent)}' +
    '#wiki-ori-loader .wo-meta{display:grid;gap:4px;color:var(--wo-accent);font:500 11px/1.5 Arial,sans-serif;text-align:center}' +
    '#wiki-ori-loader .wo-session{opacity:.8}';

  function ensureLoader() {
    if (wrap) return;

    style = document.createElement('style');
    style.id = 'wiki-ori-loader-style';
    style.textContent = css;
    document.head ? document.head.appendChild(style) : document.documentElement.appendChild(style);

    wrap = document.createElement('div');
    wrap.id = 'wiki-ori-loader';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.setAttribute('aria-label', 'Đang tải');
    wrap.innerHTML =
      '<div class="wo-content"><svg viewBox="0 0 470 120" aria-hidden="true">' +
      '<path pathLength="1" d="M10 20 L30 100 L50 40 L70 100 L90 20"/>' +
      '<path pathLength="1" d="M115 20 V100"/>' +
      '<path pathLength="1" d="M145 20 V100"/>' +
      '<path pathLength="1" d="M185 20 L147 62 L187 100"/>' +
      '<path pathLength="1" d="M220 20 V100"/>' +
      '<path class="wo-accent" pathLength="1" d="M300 20 A32 40 0 1 0 300 100 A32 40 0 1 0 300 20"/>' +
      '<path class="wo-accent" pathLength="1" d="M360 100 V20 H385 C417 20 417 62 385 62 H360"/>' +
      '<path class="wo-accent" pathLength="1" d="M388 62 L420 100"/>' +
      '<path class="wo-accent" pathLength="1" d="M452 20 V100"/>' +
      '</svg><span id="wiki-ori-loader-label"></span>' +
      '<div class="wo-meta"><time id="wiki-ori-loader-clock"></time>' +
      '<span class="wo-session">Mã phiên: ' + CONFIG.sessionCode + '</span></div></div>';
    document.documentElement.appendChild(wrap);

    var clock = document.getElementById('wiki-ori-loader-clock');
    var clockFormatter;
    try {
      clockFormatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch (error) {
      clockFormatter = null;
    }
    function updateClock() {
      var now = new Date();
      clock.textContent = (clockFormatter ? clockFormatter.format(now) : now.toLocaleString()) +
        ' (giờ địa phương)';
    }
    updateClock();
    window.setInterval(updateClock, 1000);

    var paths = wrap.querySelectorAll('path');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !paths[0].animate) {
      for (var k = 0; k < paths.length; k++) paths[k].style.strokeDashoffset = 0;
    } else {
      var DRAW_END = 0.62, HOLD_END = 0.82, n = paths.length;
      Array.prototype.forEach.call(paths, function (p, i) {
        var slot = DRAW_END / n;
        var start = i * slot;
        var end = Math.min(start + slot * 1.15, DRAW_END);
        p.animate([
          { strokeDashoffset: 1, offset: 0 },
          { strokeDashoffset: 1, offset: start },
          { strokeDashoffset: 0, offset: end, easing: 'ease-in-out' },
          { strokeDashoffset: 0, offset: HOLD_END },
          { strokeDashoffset: -1, offset: 1, easing: 'ease-in' }
        ], { duration: CONFIG.cycle, iterations: Infinity });
      });
    }
  }

  function show(label) {
    ensureLoader();
    window.clearTimeout(hideTimer);
    lastShowTime = Date.now();
    wrap.setAttribute('aria-hidden', 'false');
    wrap.setAttribute('aria-label', label || 'Đang tải');
    var labelElement = document.getElementById('wiki-ori-loader-label');
    if (labelElement) labelElement.textContent = label || '';
    wrap.classList.remove('wo-hide');
  }

  function hide() {
    if (!wrap) return;
    wrap.classList.add('wo-hide');
    wrap.setAttribute('aria-hidden', 'true');
  }

  function start(label) {
    var id = ++nextTaskId;
    activeTasks.set(id, Date.now());
    show(label);
    return id;
  }

  function finish(id) {
    if (!activeTasks.has(id)) return;
    activeTasks.delete(id);
    if (activeTasks.size || !loaded) return;
    scheduleAutoHide();
  }

  function scheduleAutoHide() {
    if (!loaded || activeTasks.size) return;
    var minimumDisplay = Math.max(CONFIG.minShow, CONFIG.cycle);
    var elapsed = Date.now() - lastShowTime;
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hide, Math.max(350, minimumDisplay - elapsed));
  }

  function applyTheme(themeId) {
    if (!Object.prototype.hasOwnProperty.call(CONFIG.themes, themeId)) {
      throw new TypeError('Giao diện loading không hợp lệ.');
    }
    var theme = CONFIG.themes[themeId];
    wrap.style.setProperty('--wo-ink-light', theme.inkLight);
    wrap.style.setProperty('--wo-accent-light', theme.accentLight);
    wrap.style.setProperty('--wo-ink-dark', theme.inkDark);
    wrap.style.setProperty('--wo-accent-dark', theme.accentDark);
    wrap.style.setProperty('--wo-bg-light', theme.bgLight);
    wrap.style.setProperty('--wo-bg-dark', theme.bgDark);
  }

  function getTheme() {
    try {
      var savedTheme = window.localStorage.getItem(CONFIG.themeStorageKey);
      return Object.prototype.hasOwnProperty.call(CONFIG.themes, savedTheme)
        ? savedTheme
        : CONFIG.defaultTheme;
    } catch (error) {
      console.error('Không thể đọc giao diện loading đã lưu:', error);
      return CONFIG.defaultTheme;
    }
  }

  function setTheme(themeId) {
    if (!Object.prototype.hasOwnProperty.call(CONFIG.themes, themeId)) {
      throw new TypeError('Giao diện loading không hợp lệ.');
    }
    window.localStorage.setItem(CONFIG.themeStorageKey, themeId);
    applyTheme(themeId);
  }

  window.WikiOriLoader = {
    show: show,
    hide: hide,
    start: start,
    finish: finish,
    getTheme: getTheme,
    setTheme: setTheme,
    sessionCode: CONFIG.sessionCode
  };
  ensureLoader();
  applyTheme(getTheme());
  show('Đang tải dữ liệu…');

  if (typeof window.fetch === 'function') {
    var nativeFetch = window.fetch;
    window.fetch = function () {
      var taskId = start('Đang tải dữ liệu…');
      try {
        return nativeFetch.apply(this, arguments).finally(function () {
          finish(taskId);
        });
      } catch (error) {
        finish(taskId);
        throw error;
      }
    };
  }

  if (CONFIG.autoHide) {
    window.addEventListener('load', function () {
      loaded = true;
      scheduleAutoHide();
    });
  }
})();