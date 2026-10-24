/* WIKI ORI loader — hiệu ứng viết chữ cho ẢNH và DỮ LIỆU đang tải.
   Gắn 1 dòng trong <head>:  <script src="js/loading.js"></script>

   1) Ảnh: tự động. Mọi <img> chưa tải xong sẽ hiện chữ WIKI ORI đang được viết,
      tải xong thì ảnh hiện dần. Bỏ qua 1 ảnh: thêm thuộc tính data-no-loader.
   2) Dữ liệu (fetch, API...):
        WikiOriLoader.show(el)  /  WikiOriLoader.hide(el)
        WikiOriLoader.track(el, fetch('/api/x').then(r => r.json()))
        hoặc bật/tắt bằng thuộc tính HTML:  el.setAttribute('data-wo-loading', '')
                                          el.removeAttribute('data-wo-loading')
*/
(function () {
  'use strict';
  if (window.WikiOriLoader) return;

  /* ===== Cấu hình ===== */
  var CONFIG = {
    autoImages: true,       // tự động phủ loading lên ảnh
    imageSelector: 'img',   // chọn ảnh nào được áp dụng (vd: '.gallery img')
    minSize: 64,            // ảnh nhỏ hơn (icon, avatar bé) thì bỏ qua
    cycle: 4200,            // ms cho 1 vòng viết chữ
    fade: 400,              // ms hiệu ứng mờ khi tải xong
    light: { ink: '#1b2a41', accent: '#2f6df6', bg: 'rgba(245,247,250,.94)' },
    dark:  { ink: '#e8eefb', accent: '#6ea0ff', bg: 'rgba(14,21,34,.94)' }
  };

  /* ===== CSS ===== */
  var css =
    ':root{--wo-ink:' + CONFIG.light.ink + ';--wo-accent:' + CONFIG.light.accent + ';--wo-bg:' + CONFIG.light.bg + '}' +
    '@media (prefers-color-scheme:dark){:root{--wo-ink:' + CONFIG.dark.ink + ';--wo-accent:' + CONFIG.dark.accent + ';--wo-bg:' + CONFIG.dark.bg + '}}' +
    '.wo-overlay{position:absolute;top:0;right:0;bottom:0;left:0;z-index:5;display:grid;place-items:center;' +
    'background:var(--wo-bg);opacity:1;transition:opacity ' + CONFIG.fade + 'ms ease;overflow:hidden}' +
    '.wo-overlay.wo-out{opacity:0;pointer-events:none}' +
    '.wo-overlay svg{width:min(70%,240px);max-height:70%;height:auto;overflow:visible}' +
    '.wo-overlay path{fill:none;stroke:var(--wo-ink);stroke-width:7;stroke-linecap:round;stroke-linejoin:round;' +
    'stroke-dasharray:1;stroke-dashoffset:1}' +
    '.wo-overlay path.wo-accent{stroke:var(--wo-accent)}' +
    '.wo-img-wrap{position:relative;overflow:hidden;vertical-align:top;max-width:100%}';

  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Tạo lớp phủ có chữ WIKI ORI ===== */
  function createOverlay() {
    var ov = document.createElement('div');
    ov.className = 'wo-overlay';
    ov.setAttribute('role', 'status');
    ov.setAttribute('aria-label', 'Đang tải');
    ov.innerHTML =
      '<svg viewBox="0 0 470 120" aria-hidden="true">' +
      '<path pathLength="1" d="M10 20 L30 100 L50 40 L70 100 L90 20"/>' +
      '<path pathLength="1" d="M115 20 V100"/>' +
      '<path pathLength="1" d="M145 20 V100"/>' +
      '<path pathLength="1" d="M185 20 L147 62 L187 100"/>' +
      '<path pathLength="1" d="M220 20 V100"/>' +
      '<path class="wo-accent" pathLength="1" d="M300 20 A32 40 0 1 0 300 100 A32 40 0 1 0 300 20"/>' +
      '<path class="wo-accent" pathLength="1" d="M360 100 V20 H385 C417 20 417 62 385 62 H360"/>' +
      '<path class="wo-accent" pathLength="1" d="M388 62 L420 100"/>' +
      '<path class="wo-accent" pathLength="1" d="M452 20 V100"/>' +
      '</svg>';

    var paths = ov.querySelectorAll('path');
    if (reduce || !paths[0].animate) {
      for (var k = 0; k < paths.length; k++) paths[k].style.strokeDashoffset = 0;
    } else {
      var DRAW_END = 0.62, HOLD_END = 0.82, n = paths.length;
      Array.prototype.forEach.call(paths, function (p, i) {
        var slot = DRAW_END / n, start = i * slot;
        var end = Math.min(start + slot * 1.15, DRAW_END);
        p.animate([
          { strokeDashoffset: 1,  offset: 0 },
          { strokeDashoffset: 1,  offset: start },
          { strokeDashoffset: 0,  offset: end, easing: 'ease-in-out' },
          { strokeDashoffset: 0,  offset: HOLD_END },
          { strokeDashoffset: -1, offset: 1, easing: 'ease-in' }
        ], { duration: CONFIG.cycle, iterations: Infinity });
      });
    }
    return ov;
  }

  /* ===== show / hide / track cho BẤT KỲ phần tử nào ===== */
  function show(el) {
    if (!el) return;
    if (el.__wo) { el.__wo.count++; return; }
    var setPos = getComputedStyle(el).position === 'static';
    var state = { ov: createOverlay(), count: 1, setPos: setPos, prevPos: el.style.position };
    if (setPos) el.style.position = 'relative';
    el.appendChild(state.ov);
    el.setAttribute('aria-busy', 'true');
    el.__wo = state;
  }

  function hide(el) {
    var s = el && el.__wo;
    if (!s) return;
    if (--s.count > 0) return;
    delete el.__wo;
    s.ov.classList.add('wo-out');
    setTimeout(function () {
      if (s.ov.parentNode) s.ov.parentNode.removeChild(s.ov);
      if (s.setPos && !el.__wo) el.style.position = s.prevPos;
      if (!el.__wo) el.removeAttribute('aria-busy');
    }, CONFIG.fade + 20);
  }

  function track(el, job) {
    show(el);
    var p;
    try { p = typeof job === 'function' ? job() : job; } catch (e) { hide(el); throw e; }
    return Promise.resolve(p).then(
      function (v) { hide(el); return v; },
      function (e) { hide(el); throw e; }
    );
  }

  /* ===== Tự động cho ảnh ===== */
  var seen = typeof WeakSet === 'function' ? new WeakSet() : { has: function () { return false; }, add: function () {} };

  function handleImg(img) {
    if (seen.has(img)) return;
    seen.add(img);
    if (!CONFIG.autoImages || img.hasAttribute('data-no-loader')) return;
    if (img.complete) return;                       // đã tải xong (hoặc không có src)
    var parent = img.parentNode;
    if (!parent) return;

    var cs = getComputedStyle(img);
    if (cs.display === 'none') return;
    var rect = img.getBoundingClientRect();
    if (rect.width > 0 && rect.width < CONFIG.minSize) return;

    var wrap = document.createElement('span');
    wrap.className = 'wo-img-wrap';
    wrap.style.display = cs.display === 'inline' ? 'inline-block' : cs.display;
    if (rect.width > 0) wrap.style.width = rect.width + 'px'; else wrap.style.minWidth = '140px';
    wrap.style.minHeight = rect.height >= 60 ? rect.height + 'px' : '140px';

    var prevOpacity = img.style.opacity, prevTransition = img.style.transition;
    parent.insertBefore(wrap, img);
    wrap.appendChild(img);
    img.style.transition = 'opacity ' + CONFIG.fade + 'ms ease';
    img.style.opacity = '0';
    show(wrap);

    function done() {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
      requestAnimationFrame(function () {
        img.style.opacity = '1';
        hide(wrap);
        setTimeout(function () {
          if (wrap.parentNode) { wrap.parentNode.insertBefore(img, wrap); wrap.parentNode.removeChild(wrap); }
          img.style.opacity = prevOpacity;
          img.style.transition = prevTransition;
        }, CONFIG.fade + 50);
      });
    }
    img.addEventListener('load', done);
    img.addEventListener('error', done);
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches(CONFIG.imageSelector)) handleImg(root);
    if (root.querySelectorAll) {
      Array.prototype.forEach.call(root.querySelectorAll(CONFIG.imageSelector), handleImg);
      Array.prototype.forEach.call(root.querySelectorAll('[data-wo-loading]'), attrOn);
    }
    if (root.hasAttribute && root.hasAttribute('data-wo-loading')) attrOn(root);
  }

  /* ===== Bật/tắt bằng thuộc tính data-wo-loading ===== */
  function attrOn(el)  { if (!el.__woAttr) { el.__woAttr = true;  show(el); } }
  function attrOff(el) { if (el.__woAttr)  { el.__woAttr = false; hide(el); } }

  var observer = new MutationObserver(function (list) {
    list.forEach(function (m) {
      if (m.type === 'attributes') {
        if (m.target.hasAttribute('data-wo-loading')) attrOn(m.target); else attrOff(m.target);
      } else {
        Array.prototype.forEach.call(m.addedNodes, scan);
      }
    });
  });
  observer.observe(document.documentElement, {
    childList: true, subtree: true,
    attributes: true, attributeFilter: ['data-wo-loading']
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scan(document.documentElement); });
  } else {
    scan(document.documentElement);
  }

  /* ===== API công khai ===== */
  window.WikiOriLoader = { show: show, hide: hide, track: track, config: CONFIG };
})();