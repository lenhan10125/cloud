(() => {
  const scrollbarStyle = document.createElement('style');
  scrollbarStyle.id = 'mini-scrollbar-style';
  scrollbarStyle.textContent = `
    html, body, * {
      scrollbar-width: thin !important;
      scrollbar-color: transparent transparent !important;
    }
    html.mini-scrollbar-active,
    body.mini-scrollbar-active,
    *.mini-scrollbar-active {
      scrollbar-color: #6366f1 transparent !important;
    }
    *::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }
    *::-webkit-scrollbar-track {
      background: transparent !important;
    }
    *::-webkit-scrollbar-thumb {
      background: transparent !important;
      border: 1px solid transparent !important;
      border-radius: 999px !important;
    }
    *.mini-scrollbar-active::-webkit-scrollbar-thumb {
      background: #6366f1 !important;
      border-color: transparent !important;
    }
    *::-webkit-scrollbar-corner {
      background: transparent !important;
    }
  `;
  document.head.appendChild(scrollbarStyle);

  const scrollTimeouts = new WeakMap();
  document.addEventListener('scroll', event => {
    const target = event.target instanceof Element ? event.target : document.documentElement;
    target.classList.add('mini-scrollbar-active');
    const timeout = scrollTimeouts.get(target);
    if (timeout) clearTimeout(timeout);
    scrollTimeouts.set(target, setTimeout(() => {
      target.classList.remove('mini-scrollbar-active');
      scrollTimeouts.delete(target);
    }, 700));
  }, true);

  const pageInitializers = {
  'home': function () {
  // Internal search — indexes the existing link lists already on the page
  (function(){
    const searchBtn = document.getElementById('searchBtn');
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const resultsEl = document.getElementById('searchResults');
    const closeBtn = document.getElementById('searchClose');

    function buildIndex(){
      const items = [];
      document.querySelectorAll('.grid .card').forEach(card => {
        items.push({
          title: card.querySelector('h3')?.textContent.trim() || '',
          desc: card.querySelector('p')?.textContent.trim() || '',
          tag: card.querySelector('.card-tag')?.textContent.trim() || '',
          url: card.getAttribute('href')
        });
      });
      document.querySelectorAll('nav.main-nav a').forEach(a => {
        const label = a.textContent.trim();
        items.push({
          title: label,
          desc: 'Chuyển tới mục "' + label + '" trên trang.',
          tag: 'Trang',
          url: a.getAttribute('href')
        });
      });
      return items;
    }
    const index = buildIndex();

    function normalize(str){
      return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd');
    }
    function escapeHtml(str){
      return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
    function highlight(text, query){
      const safe = escapeHtml(text);
      if(!query) return safe;
      const nText = normalize(text), nQuery = normalize(query);
      const i = nText.indexOf(nQuery);
      if(i === -1) return safe;
      return escapeHtml(text.slice(0,i)) + '<mark>' + escapeHtml(text.slice(i, i+query.length)) + '</mark>' + escapeHtml(text.slice(i+query.length));
    }

    let activeIndex = -1;

    function render(query){
      const q = query.trim();
      if(!q){
        resultsEl.innerHTML = '<div class="search-hint">Gõ để tìm công cụ hoặc trang trong ORCcop…</div>';
        activeIndex = -1;
        return;
      }
      const nq = normalize(q);
      const matches = index.filter(item =>
        normalize(item.title).includes(nq) ||
        normalize(item.desc).includes(nq) ||
        normalize(item.tag).includes(nq)
      );
      if(matches.length === 0){
        resultsEl.innerHTML = '<div class="search-empty">Không tìm thấy kết quả cho "' + escapeHtml(q) + '".</div>';
        activeIndex = -1;
        return;
      }
      resultsEl.innerHTML = matches.map(item => (
        '<a class="search-result" href="' + item.url + '">' +
          '<span class="search-result-tag mono">' + escapeHtml(item.tag) + '</span>' +
          '<span class="search-result-title">' + highlight(item.title, q) + '</span>' +
          '<span class="search-result-desc">' + highlight(item.desc, q) + '</span>' +
        '</a>'
      )).join('');
      activeIndex = -1;
    }

    function setActive(i){
      const items = resultsEl.querySelectorAll('.search-result');
      items.forEach(el => el.classList.remove('is-active'));
      if(items[i]){
        items[i].classList.add('is-active');
        items[i].scrollIntoView({block:'nearest'});
      }
      activeIndex = i;
    }

    function openSearch(){
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      searchBtn.setAttribute('aria-expanded', 'true');
      input.value = '';
      render('');
      setTimeout(() => input.focus(), 10);
    }
    function closeSearch(){
      overlay.hidden = true;
      document.body.style.overflow = '';
      searchBtn.setAttribute('aria-expanded', 'false');
      searchBtn.focus();
    }

    searchBtn.addEventListener('click', openSearch);
    closeBtn.addEventListener('click', closeSearch);
    overlay.querySelectorAll('[data-search-close]').forEach(el => el.addEventListener('click', closeSearch));

    input.addEventListener('input', () => render(input.value));

    input.addEventListener('keydown', (e) => {
      const items = resultsEl.querySelectorAll('.search-result');
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        if(items.length) setActive((activeIndex + 1) % items.length);
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        if(items.length) setActive((activeIndex - 1 + items.length) % items.length);
      } else if(e.key === 'Enter'){
        const target = activeIndex >= 0 ? items[activeIndex] : items[0];
        if(target){ e.preventDefault(); target.click(); }
      }
    });

    resultsEl.addEventListener('click', (e) => {
      if(e.target.closest('.search-result')) closeSearch();
    });

    document.addEventListener('keydown', (e) => {
      if(!overlay.hidden && e.key === 'Escape'){ closeSearch(); return; }
      const tag = (e.target.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      if(overlay.hidden && !isTyping && (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'))){
        e.preventDefault();
        openSearch();
      }
    });
  })();

  // Shared popup notice system — newest notice wins, auto-hides if empty, can snooze for 2 hours.
  (function(){
    const NOTICE_STORAGE_KEY = 'orccop:shared:notifications';
    const NOTICE_SNOOZE_KEY = 'orccop:notification:snoozeUntil';
    const NOTICE_SNOOZE_MS = 2 * 60 * 60 * 1000;
    let snoozeTimer = 0;

    function safeLocalStorageGet(key){
      try{ return localStorage.getItem(key); }catch(error){
        console.error('Không thể đọc dữ liệu thông báo trong localStorage.', error);
        return null;
      }
    }

    function safeLocalStorageSet(key, value){
      try{
        localStorage.setItem(key, value);
        return true;
      }catch(error){
        console.error('Không thể lưu tùy chọn thông báo trong localStorage.', error);
        return false;
      }
    }

    function readNotices(){
      try{
        const raw = safeLocalStorageGet(NOTICE_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if(!Array.isArray(parsed)) return [];
        return parsed.filter(Boolean);
      }catch(error){
        console.error('Không thể phân tích danh sách thông báo đã lưu.', error);
        return [];
      }
    }

    function writeNotices(list){
      localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('orccop:notifications-changed'));
    }

    function pruneNotices(list){
      const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return list.filter((item) => {
        if(!item || typeof item !== 'object') return false;
        const createdAt = Number(item.createdAt || 0);
        return createdAt && createdAt >= cutoff;
      });
    }

    function getSnoozeUntil(){
      const raw = safeLocalStorageGet(NOTICE_SNOOZE_KEY);
      const value = Number(raw || 0);
      return Number.isFinite(value) ? value : 0;
    }

    function setSnoozeUntil(until){
      safeLocalStorageSet(NOTICE_SNOOZE_KEY, String(until));
    }

    function normalizeNotice(input){
      const now = Date.now();
      const createdAt = Number(input && input.createdAt ? input.createdAt : now);
      const notice = {
        id: input && input.id ? String(input.id).slice(0, 120) : 'notice-' + createdAt + '-' + Math.random().toString(16).slice(2, 8),
        title: input && input.title ? String(input.title).trim().slice(0, 100) : 'Thông báo',
        message: input && input.message ? String(input.message).trim().slice(0, 1000) : '',
        createdAt,
        source: input && input.source ? String(input.source).slice(0, 100) : 'system'
      };
      return notice;
    }

    function getNotices(){
      return pruneNotices(readNotices())
        .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
        .map(normalizeNotice);
    }

    function getLatestNotice(){
      const list = getNotices();
      return list.length && list[0].message ? list[0] : null;
    }

    function shouldSkipNotice(){
      return Date.now() < getSnoozeUntil();
    }

    function ensureStyles(){
      if(document.getElementById('orccop-global-toast-style')) return;
      const style = document.createElement('style');
      style.id = 'orccop-global-toast-style';
      style.textContent = `
        .orccop-global-toast-stack {
          position: fixed;
          right: 20px;
          bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 2147483647;
          pointer-events: none;
        }
        .orccop-global-toast {
          width: min(360px, calc(100vw - 32px));
          background: rgba(10, 12, 15, 0.94);
          border: 1px solid rgba(0, 243, 255, 0.35);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
          padding: 14px 16px 12px;
          color: #fff;
          transform: translateX(120%);
          opacity: 0;
          animation: orccopToastIn 0.35s ease forwards;
          pointer-events: auto;
          backdrop-filter: blur(10px);
        }
        .orccop-global-toast.is-hiding {
          animation: orccopToastOut 0.28s ease forwards;
        }
        .orccop-global-toast-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }
        .orccop-global-toast-title {
          font-size: 14px;
          font-weight: 800;
          color: #00f3ff;
          letter-spacing: 0.02em;
        }
        .orccop-global-toast-close,
        .orccop-global-toast-snooze {
          border: none;
          background: rgba(255,255,255,0.06);
          color: #dfeaf0;
          border-radius: 8px;
          cursor: pointer;
          font: inherit;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .orccop-global-toast-close {
          width: 28px;
          height: 28px;
          font-size: 18px;
          line-height: 1;
        }
        .orccop-global-toast-snooze {
          padding: 5px 8px;
          font-size: 11px;
          font-weight: 700;
          margin-top: 8px;
        }
        .orccop-global-toast-close:hover,
        .orccop-global-toast-snooze:hover {
          background: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }
        .orccop-global-toast-message {
          font-size: 13px;
          line-height: 1.55;
          color: rgba(255,255,255,0.9);
        }
        @keyframes orccopToastIn {
          from { opacity: 0; transform: translateX(140%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes orccopToastOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(140%); }
        }
      `;
      document.head.appendChild(style);
    }

    function ensureToastContainer(){
      ensureStyles();
      let container = document.getElementById('orccop-global-toast-stack');
      if(!container){
        container = document.createElement('div');
        container.id = 'orccop-global-toast-stack';
        container.className = 'orccop-global-toast-stack';
        document.body.appendChild(container);
      }
      return container;
    }

    function hideToast(){
      const container = document.getElementById('orccop-global-toast-stack');
      if(!container) return;
      container.innerHTML = '';
    }

    function showNotice(notice){
      if(!notice || shouldSkipNotice()){
        hideToast();
        return;
      }
      const container = ensureToastContainer();
      const existing = Array.from(container.children).find(item => item.dataset.noticeId === notice.id);
      if(existing && existing.dataset.noticeTitle === notice.title && existing.dataset.noticeMessage === notice.message) return;
      if(existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = 'orccop-global-toast';
      toast.dataset.noticeId = notice.id;
      toast.dataset.noticeTitle = notice.title;
      toast.dataset.noticeMessage = notice.message;
      const header = document.createElement('div');
      header.className = 'orccop-global-toast-header';
      const title = document.createElement('div');
      title.className = 'orccop-global-toast-title';
      title.textContent = notice.title || 'Thông báo';
      const closeBtn = document.createElement('button');
      closeBtn.className = 'orccop-global-toast-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Đóng thông báo');
      closeBtn.textContent = '×';
      header.append(title, closeBtn);
      const message = document.createElement('div');
      message.className = 'orccop-global-toast-message';
      message.textContent = notice.message;
      const snoozeBtn = document.createElement('button');
      snoozeBtn.className = 'orccop-global-toast-snooze';
      snoozeBtn.type = 'button';
      snoozeBtn.textContent = 'Không hiển thị trong 2 giờ';
      toast.append(header, message, snoozeBtn);

      closeBtn.addEventListener('click', () => {
        toast.classList.add('is-hiding');
        setTimeout(() => toast.remove(), 250);
      });

      snoozeBtn.addEventListener('click', () => {
        if(!setSnoozeUntil(Date.now() + NOTICE_SNOOZE_MS)) return;
        toast.classList.add('is-hiding');
        setTimeout(() => toast.remove(), 250);
        window.clearTimeout(snoozeTimer);
        snoozeTimer = window.setTimeout(refreshLatestNotice, NOTICE_SNOOZE_MS);
      });

      const previous = container.firstElementChild;
      if(previous) previous.remove();
      container.appendChild(toast);
      setTimeout(() => {
        if (toast.isConnected) {
          toast.classList.add('is-hiding');
          setTimeout(() => toast.remove(), 250);
        }
      }, 5000);
    }

    function refreshLatestNotice(){
      const latest = getLatestNotice();
      if(!latest || shouldSkipNotice()){
        hideToast();
        return;
      }
      showNotice(latest);
    }

    function addNotice(input){
      const list = pruneNotices(readNotices());
      const notice = normalizeNotice(input);
      if(!notice.message) throw new TypeError('Nội dung thông báo không được để trống.');
      list.push(notice);
      if(list.length > 100) list.splice(0, list.length - 100);
      writeNotices(list);
      refreshLatestNotice();
      return notice;
    }

    function publishNotice(input){
      const notice = normalizeNotice(input);
      if(!notice.message) return null;
      const list = pruneNotices(readNotices());
      const previous = list.find(item => String(item.id) === notice.id);
      if(previous && String(previous.title || '') === notice.title && String(previous.message || '') === notice.message){
        refreshLatestNotice();
        return normalizeNotice(previous);
      }
      const index = list.findIndex(item => String(item.id) === notice.id);
      if(index >= 0) list.splice(index, 1);
      list.push(notice);
      if(list.length > 100) list.splice(0, list.length - 100);
      writeNotices(list);
      refreshLatestNotice();
      return notice;
    }

    function removeNotice(id){
      const notices = readNotices();
      const remaining = notices.filter(item => String(item && item.id) !== String(id));
      if(remaining.length === notices.length) return;
      writeNotices(remaining);
      refreshLatestNotice();
    }

    function renderNoticeManager(){
      const listElement = document.getElementById('noticeManagerList');
      if(!listElement) return;
      listElement.replaceChildren();
      const notices = getNotices();
      if(!notices.length){
        const empty = document.createElement('p');
        empty.className = 'cache-empty';
        empty.textContent = 'Chưa có thông báo đã lưu.';
        listElement.appendChild(empty);
        return;
      }
      notices.forEach(notice => {
        const row = document.createElement('div');
        row.className = 'notice-manager-item';
        const content = document.createElement('div');
        content.className = 'notice-manager-item-content';
        const title = document.createElement('div');
        title.className = 'notice-manager-item-title';
        title.textContent = notice.title;
        const message = document.createElement('div');
        message.className = 'notice-manager-item-message';
        message.textContent = notice.message;
        const meta = document.createElement('div');
        meta.className = 'notice-manager-item-meta';
        meta.textContent = new Date(notice.createdAt).toLocaleString() + ' · ' + notice.source;
        content.append(title, message, meta);
        const remove = document.createElement('button');
        remove.className = 'cache-entry-delete';
        remove.type = 'button';
        remove.textContent = 'Xóa';
        remove.addEventListener('click', () => {
          try{
            removeNotice(notice.id);
            renderNoticeManager();
          }catch(error){
            console.error('Không thể xóa thông báo đã lưu.', error);
          }
        });
        row.append(content, remove);
        listElement.appendChild(row);
      });
    }

    function initializeNoticeManager(){
      const form = document.getElementById('noticeManagerForm');
      const titleInput = document.getElementById('noticeTitleInput');
      const messageInput = document.getElementById('noticeMessageInput');
      const clearButton = document.getElementById('noticeManagerClearBtn');
      const status = document.getElementById('noticeManagerStatus');
      if(!form || !titleInput || !messageInput || !clearButton || !status) return;
      renderNoticeManager();
      form.addEventListener('submit', event => {
        event.preventDefault();
        const title = titleInput.value.trim();
        const message = messageInput.value.trim();
        if(!title || !message) return;
        try{
          addNotice({ title, message, source: 'home-manager' });
          titleInput.value = '';
          messageInput.value = '';
          renderNoticeManager();
          status.textContent = 'Đã lưu và phát thông báo trên các trang dùng chung.';
          status.classList.remove('is-error');
        }catch(error){
          console.error('Không thể lưu thông báo.', error);
          status.textContent = 'Không thể lưu thông báo. Hãy kiểm tra dung lượng cache của trình duyệt.';
          status.classList.add('is-error');
        }
      });
      clearButton.addEventListener('click', () => {
        try{
          clearNotices();
          renderNoticeManager();
          status.textContent = 'Đã xóa toàn bộ thông báo đã lưu.';
          status.classList.remove('is-error');
        }catch(error){
          console.error('Không thể xóa thông báo.', error);
          status.textContent = 'Không thể xóa thông báo đã lưu.';
          status.classList.add('is-error');
        }
      });
      window.addEventListener('orccop:notifications-changed', () => {
        renderNoticeManager();
        status.textContent = '';
      });
    }

    function clearNotices(){
      writeNotices([]);
      hideToast();
    }

    window.orccopNotifications = Object.freeze({
      add: addNotice,
      addNote: addNotice,
      publish: publishNotice,
      list: getNotices,
      remove: removeNotice,
      latest: getLatestNotice,
      refresh: refreshLatestNotice,
      snoozeForTwoHours: () => {
        if(!setSnoozeUntil(Date.now() + NOTICE_SNOOZE_MS)) return false;
        hideToast();
        window.clearTimeout(snoozeTimer);
        snoozeTimer = window.setTimeout(refreshLatestNotice, NOTICE_SNOOZE_MS);
        return true;
      },
      clear: clearNotices
    });

    function isNoticeProviderPage(){
      return window.location.pathname.toLowerCase().endsWith('/test.html');
    }

    function startTestNoticeFrame(){
      if(isNoticeProviderPage()) return;
      const script = document.currentScript || document.getElementById('java-data-function');
      if(!script || !script.src) return;

      const providerUrl = new URL('../../test.html?noticeProvider=1', script.src);
      const frame = document.createElement('iframe');
      frame.title = 'Nguồn thông báo mới nhất';
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-2px;bottom:-2px;opacity:0;pointer-events:none;border:0;';
      window.addEventListener('message', event => {
        if(event.source !== frame.contentWindow || event.origin !== window.location.origin) return;
        const data = event.data;
        if(!data || data.type !== 'orccop:test-notice' ||
           !['third-party:main-notice', 'third-party:footer-update'].includes(data.id) ||
           typeof data.message !== 'string') return;
        try{
          if(data.message.trim()){
            publishNotice({
              id: data.id,
              title: data.id === 'third-party:main-notice' ? 'Thông báo mới' : 'Cập nhật mới',
              message: data.message,
              source: data.id === 'third-party:main-notice' ? 'third-party-note' : 'third-party-update'
            });
          }else{
            removeNotice(data.id);
          }
        }catch(error){
          console.error('Không thể lưu thông báo lấy từ trang test.', error);
        }
      });
      frame.src = providerUrl.href;
      document.body.appendChild(frame);
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', startTestNoticeFrame, { once: true });
    }else{
      startTestNoticeFrame();
    }

    window.addEventListener('storage', (event) => {
      if(event.key === NOTICE_STORAGE_KEY || event.key === NOTICE_SNOOZE_KEY){
        refreshLatestNotice();
        renderNoticeManager();
      }
    });

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', () => {
        refreshLatestNotice();
        initializeNoticeManager();
      }, { once: true });
    } else {
      refreshLatestNotice();
      initializeNoticeManager();
    }
    window.addEventListener('focus', refreshLatestNotice);
    document.addEventListener('visibilitychange', () => {
      if(!document.hidden) refreshLatestNotice();
    });
  })();

  // Display settings — theme (light/dark/system), custom wallpaper, cache, privacy
  (function(){
    const STORAGE_KEY = 'orccop:settings';
    const root = document.documentElement;
    const wallpaperLayer = document.getElementById('wallpaperLayer');
    const wallpaperScrim = document.getElementById('wallpaperScrim');
    const settingsBtn = document.getElementById('settingsBtn');
    const overlay = document.getElementById('settingsOverlay');
    const closeBtn = document.getElementById('settingsClose');
    const themeOptions = document.querySelectorAll('.settings-option[data-theme-choice]');
    const themePickerOverlay = document.getElementById('themePickerOverlay');
    const themePickerClose = document.getElementById('themePickerClose');
    const themePickerSearch = document.getElementById('themePickerSearch');
    const themePickerOptions = document.getElementById('themePickerOptions');
    const themePickerEmpty = document.getElementById('themePickerEmpty');
    const quickThemeBtn = document.getElementById('quickThemeBtn');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const wallpaperInput = document.getElementById('wallpaperInput');
    const wallpaperPreview = document.getElementById('wallpaperPreview');
    const wallpaperRemoveBtn = document.getElementById('wallpaperRemoveBtn');
    const privacyToggle = document.getElementById('privacyToggle');
    const saveBtn = document.getElementById('settingsSaveBtn');
    const clearBtn = document.getElementById('settingsClearBtn');
    const statusEl = document.getElementById('settingsStatus');
    const cacheInspectorToggle = document.getElementById('cacheInspectorToggle');
    const cacheInspector = document.getElementById('cacheInspector');
    const cacheUsageLabel = document.getElementById('cacheUsageLabel');
    const cacheUsageProgress = document.getElementById('cacheUsageProgress');
    const cacheLimitAlert = document.getElementById('cacheLimitAlert');
    const cacheSummary = document.getElementById('cacheSummary');
    const cacheInspectorRefresh = document.getElementById('cacheInspectorRefresh');
    const cacheEntryList = document.getElementById('cacheEntryList');
    const cacheLimitInput = document.getElementById('cacheLimitInput');
    const cacheLimitSaveBtn = document.getElementById('cacheLimitSaveBtn');
    const searchOverlay = document.getElementById('searchOverlay');

    const defaults = { theme: 'system', wallpaper: null, privacy: false, cacheLimitMb: 50 };
    let state = Object.assign({}, defaults);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function readStorage(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      }catch(e){ return null; }
    }

    function writeStorage(target){
      try{
        const payload = JSON.stringify(state);
        if(target === 'local'){
          localStorage.setItem(STORAGE_KEY, payload);
          sessionStorage.removeItem(STORAGE_KEY);
        } else {
          sessionStorage.setItem(STORAGE_KEY, payload);
          localStorage.removeItem(STORAGE_KEY);
        }
      }catch(e){ /* storage unavailable or full */ }
    }

    function persist(showStatus){
      if(state.privacy){
        writeStorage('session');
        if(showStatus) setStatus('Chế độ riêng tư đang bật — cài đặt chỉ lưu tạm cho phiên này, không ghi vào cache lâu dài.');
      } else {
        writeStorage('local');
        if(showStatus) setStatus('Đã lưu cài đặt vào bộ nhớ đệm.');
      }
      refreshCacheIfOpen();
    }

    function setStatus(msg, isError){
      statusEl.textContent = msg;
      statusEl.classList.toggle('is-error', !!isError);
    }

    function applyTheme(){
      let effective = state.theme;
      if(effective === 'system'){
        effective = mediaQuery.matches ? 'dark' : 'light';
      }
      if(effective === 'dark'){
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      themeOptions.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.themeChoice === state.theme);
        btn.setAttribute('aria-checked', String(btn.dataset.themeChoice === state.theme));
      });
    }

    function openThemePicker(){
      if(!overlay.hidden){
        overlay.hidden = true;
        settingsBtn.setAttribute('aria-expanded', 'false');
      }
      if(!searchOverlay.hidden){
        searchOverlay.hidden = true;
        document.getElementById('searchBtn').setAttribute('aria-expanded', 'false');
      }
      themePickerOverlay.hidden = false;
      document.body.style.overflow = 'hidden';
      themePickerSearch.value = '';
      filterThemeOptions('');
      window.setTimeout(() => themePickerSearch.focus(), 10);
    }

    function closeThemePicker(){
      themePickerOverlay.hidden = true;
      if(overlay.hidden && searchOverlay.hidden) document.body.style.overflow = '';
      quickThemeBtn.focus();
    }

    function filterThemeOptions(query){
      const normalizedQuery = query.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      let visibleCount = 0;
      themePickerOptions.querySelectorAll('[data-theme-choice]').forEach(option => {
        const name = option.textContent.trim().toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        option.hidden = !name.includes(normalizedQuery);
        if(!option.hidden) visibleCount += 1;
      });
      themePickerEmpty.hidden = visibleCount > 0;
    }

    function applyWallpaper(){
      if(state.wallpaper){
        wallpaperLayer.style.backgroundImage = 'url(' + state.wallpaper + ')';
        wallpaperLayer.classList.add('is-active');
        wallpaperScrim.classList.add('is-active');
        root.classList.add('has-wallpaper');
        wallpaperPreview.style.backgroundImage = 'url(' + state.wallpaper + ')';
        wallpaperPreview.textContent = '';
      } else {
        wallpaperLayer.style.backgroundImage = '';
        wallpaperLayer.classList.remove('is-active');
        wallpaperScrim.classList.remove('is-active');
        root.classList.remove('has-wallpaper');
        wallpaperPreview.style.backgroundImage = '';
        wallpaperPreview.textContent = 'Chưa có';
      }
    }

    function applyAll(){
      applyTheme();
      applyWallpaper();
      privacyToggle.checked = !!state.privacy;
      cacheLimitInput.value = state.cacheLimitMb;
    }

    // Init from cache (or session, if privacy mode was on)
    const saved = readStorage();
    if(saved) state = Object.assign({}, defaults, saved);
    applyAll();

    mediaQuery.addEventListener('change', () => {
      if(state.theme === 'system') applyTheme();
    });

    themeOptions.forEach(btn => {
      btn.addEventListener('click', () => {
        state.theme = btn.dataset.themeChoice;
        applyTheme();
        persist(false);
        setStatus('Đã áp dụng giao diện: ' + btn.textContent.trim() + '.');
        if(!themePickerOverlay.hidden) closeThemePicker();
      });
    });

    quickThemeBtn.addEventListener('click', () => {
      const effectiveTheme = state.theme === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : state.theme;
      state.theme = effectiveTheme === 'dark' ? 'light' : 'dark';
      applyTheme();
      persist(false);
    });
    themePickerClose.addEventListener('click', closeThemePicker);
    themePickerOverlay.querySelectorAll('[data-theme-picker-close]').forEach(el => {
      el.addEventListener('click', closeThemePicker);
    });
    themePickerSearch.addEventListener('input', () => filterThemeOptions(themePickerSearch.value));
    themePickerSearch.addEventListener('keydown', event => {
      if(event.key === 'Enter'){
        const firstVisible = themePickerOptions.querySelector('[data-theme-choice]:not([hidden])');
        if(firstVisible){
          event.preventDefault();
          firstVisible.click();
        }
      }
    });
    document.addEventListener('keydown', event => {
      const tag = (event.target.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || event.target.isContentEditable;
      if(event.ctrlKey && event.altKey && event.key.toLowerCase() === 'l' && !isTyping){
        event.preventDefault();
        if(themePickerOverlay.hidden) openThemePicker();
        else closeThemePicker();
      } else if(!themePickerOverlay.hidden && event.key === 'Escape'){
        closeThemePicker();
      }
    });

    function updateBackToTopVisibility(){
      backToTopBtn.hidden = window.scrollY < 240;
    }
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    updateBackToTopVisibility();

    wallpaperInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      if(!file.type.startsWith('image/')){
        setStatus('Vui lòng chọn một tệp hình ảnh hợp lệ.', true);
        return;
      }
      if(file.size > 4 * 1024 * 1024){
        setStatus('Hình ảnh quá lớn (tối đa 4MB) để lưu vào cache.', true);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        state.wallpaper = reader.result;
        applyWallpaper();
        persist(true);
      };
      reader.onerror = () => setStatus('Không thể đọc tệp hình ảnh này.', true);
      reader.readAsDataURL(file);
    });

    wallpaperRemoveBtn.addEventListener('click', () => {
      state.wallpaper = null;
      wallpaperInput.value = '';
      applyWallpaper();
      persist(true);
    });

    privacyToggle.addEventListener('change', () => {
      state.privacy = privacyToggle.checked;
      if(state.privacy){
        try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
        persist(false);
        setStatus('Đã bật quyền riêng tư — dữ liệu cache trước đó (nếu có) đã được xóa.');
      } else {
        persist(false);
        setStatus('Đã tắt quyền riêng tư — cài đặt sẽ được lưu vào cache như bình thường.');
      }
    });

    saveBtn.addEventListener('click', () => persist(true));

    clearBtn.addEventListener('click', () => {
      try{
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('orccop:cache-changed'));
      }catch(e){}
      state = Object.assign({}, defaults, { privacy: state.privacy });
      applyAll();
      setStatus('Đã xóa toàn bộ dữ liệu đã lưu trong cache.');
      refreshCacheIfOpen();
    });

    function formatBytes(bytes){
      if(!bytes) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
      return (bytes / Math.pow(1024, index)).toFixed(index ? 2 : 0) + ' ' + units[index];
    }

    function byteLength(value){
      return new Blob([String(value)]).size;
    }

    function addCacheEntry(name, type, size, removeEntry){
      const entry = document.createElement('div');
      entry.className = 'cache-entry';

      const info = document.createElement('div');
      info.className = 'cache-entry-info';
      const nameEl = document.createElement('span');
      nameEl.className = 'cache-entry-name';
      nameEl.textContent = name;
      nameEl.title = name;
      const metaEl = document.createElement('span');
      metaEl.className = 'cache-entry-meta';
      metaEl.textContent = type + ' · ' + formatBytes(size);
      info.append(nameEl, metaEl);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'cache-entry-delete';
      deleteBtn.type = 'button';
      deleteBtn.textContent = 'Xóa';
      deleteBtn.addEventListener('click', async () => {
        deleteBtn.disabled = true;
        try{
          await removeEntry();
          window.dispatchEvent(new Event('orccop:cache-changed'));
          entry.remove();
          if(!cacheEntryList.children.length) cacheEntryList.innerHTML = '<p class="cache-empty">Không còn dữ liệu trong danh sách.</p>';
          await inspectCache();
        }catch(e){
          deleteBtn.disabled = false;
          setStatus('Không thể xóa mục này.', true);
        }
      });

      entry.append(info, deleteBtn);
      cacheEntryList.appendChild(entry);
    }

    function getStorageEntries(storage, label){
      const entries = [];
      for(let index = 0; index < storage.length; index++){
        const key = storage.key(index);
        if(key === null) continue;
        const value = storage.getItem(key) || '';
        entries.push({
          name: label + ': ' + key,
          type: label,
          size: byteLength(value),
          remove: () => storage.removeItem(key)
        });
      }
      return entries;
    }

    function cacheEntryType(request, response){
      const contentType = response && response.headers.get('content-type');
      if(contentType) return contentType.split(';')[0];
      if(request.destination) return request.destination;
      return 'request';
    }

    async function inspectCache(){
      cacheEntryList.replaceChildren();
      let entries = [];
      let cacheBytes = 0;
      let totalBytes = 0;

      try{
        entries = entries.concat(getStorageEntries(localStorage, 'localStorage'));
        entries = entries.concat(getStorageEntries(sessionStorage, 'sessionStorage'));
        totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
      }catch(e){
        setStatus('Không thể đọc bộ nhớ trình duyệt.', true);
      }

      if('caches' in window){
        try{
          const cacheNames = await caches.keys();
          for(const cacheName of cacheNames){
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            for(const request of requests){
              const response = await cache.match(request);
              const contentLength = response && response.headers.get('content-length');
              const size = contentLength ? Number(contentLength) : (response ? (await response.clone().blob()).size : 0);
              cacheBytes += size;
              totalBytes += size;
              entries.push({
                name: cacheName + ': ' + request.url,
                type: cacheEntryType(request, response),
                size,
                remove: () => cache.delete(request)
              });
            }
          }
        }catch(e){
          setStatus('Không thể đọc Cache Storage.', true);
        }
      }

      const limitBytes = state.cacheLimitMb * 1024 * 1024;
      const usagePercent = Math.min(100, (totalBytes / limitBytes) * 100);
      const isOverLimit = totalBytes > limitBytes;
      cacheUsageProgress.value = usagePercent;
      cacheUsageLabel.textContent = formatBytes(totalBytes) + ' / ' + formatBytes(limitBytes);
      cacheLimitAlert.hidden = !isOverLimit;
      cacheLimitAlert.textContent = isOverLimit
        ? 'Cảnh báo: dữ liệu đang dùng ' + formatBytes(totalBytes) + ', đã vượt hạn mức ' + state.cacheLimitMb + ' MB. Hãy xóa bớt dữ liệu cache.'
        : '';
      const limitWarning = isOverLimit ? ' Đã vượt hạn mức.' : ' Trong hạn mức.';
      cacheSummary.textContent = entries.length + ' mục dữ liệu · Tổng: ' + formatBytes(totalBytes) + ' · Cache Storage: ' + formatBytes(cacheBytes) + ' ·' + limitWarning;

      if(!entries.length){
        cacheEntryList.innerHTML = '<p class="cache-empty">Không có dữ liệu cache hoặc bộ nhớ trang.</p>';
        return;
      }
      entries.forEach(entry => addCacheEntry(entry.name, entry.type, entry.size, entry.remove));
    }

    function refreshCacheIfOpen(){
      if(!cacheInspector.hidden) inspectCache();
    }

    window.addEventListener('orccop:notifications-changed', refreshCacheIfOpen);
    window.addEventListener('orccop:cache-changed', () => {
      refreshCacheIfOpen();
      if(typeof window.orccopNotifications !== 'undefined') window.orccopNotifications.refresh();
    });
    window.addEventListener('storage', refreshCacheIfOpen);

    cacheInspectorToggle.addEventListener('click', () => {
      const isOpen = cacheInspectorToggle.getAttribute('aria-expanded') === 'true';
      cacheInspectorToggle.setAttribute('aria-expanded', String(!isOpen));
      cacheInspector.hidden = isOpen;
      if(!isOpen) inspectCache();
    });
    cacheInspectorRefresh.addEventListener('click', inspectCache);

    cacheLimitSaveBtn.addEventListener('click', () => {
      const limit = Number(cacheLimitInput.value);
      if(!Number.isInteger(limit) || limit < 1 || limit > 2048){
        setStatus('Hạn mức cache phải là số nguyên từ 1 đến 2048 MB.', true);
        cacheLimitInput.focus();
        return;
      }
      state.cacheLimitMb = limit;
      persist(false);
      setStatus('Đã lưu hạn mức cache: ' + limit + ' MB.');
      if(!cacheInspector.hidden) inspectCache();
    });

    function openSettings(){
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      settingsBtn.setAttribute('aria-expanded', 'true');
      setStatus('');
    }
    function closeSettings(){
      overlay.hidden = true;
      document.body.style.overflow = '';
      settingsBtn.setAttribute('aria-expanded', 'false');
      settingsBtn.focus();
    }

    settingsBtn.addEventListener('click', openSettings);
    closeBtn.addEventListener('click', closeSettings);
    overlay.querySelectorAll('[data-settings-close]').forEach(el => el.addEventListener('click', closeSettings));
    document.addEventListener('keydown', (e) => {
      if(!overlay.hidden && e.key === 'Escape') closeSettings();
      const tag = (e.target.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      if(!isTyping && e.key.toLowerCase() === 's' && (overlay.hidden ? searchOverlay.hidden : true)){
        e.preventDefault();
        if(overlay.hidden) openSettings();
        else closeSettings();
      }
    });
  })();

  // Mobile menu toggle
  const menuBtn = document.querySelector('.menu-btn');
  const mainNav = document.querySelector('nav.main-nav');

  function closeMenu(){
    mainNav.classList.remove('is-open');
    menuBtn.classList.remove('is-active');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  function openMenu(){
    mainNav.classList.add('is-open');
    menuBtn.classList.add('is-active');
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mainNav.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  // Close after picking a link
  mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Close on outside tap
  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('is-open') &&
        !mainNav.contains(e.target) && e.target !== menuBtn) {
      closeMenu();
    }
  });

  // Close if resized back to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });

  // Terminal typing signature
  const lines = [
    { prompt: '$ ', text: 'whoami', color: null },
    { prompt: '', text: 'orccop — dự án học thuật của ORICHIIN Studio', comment: true },
    { prompt: '$ ', text: 'cat mission.md', color: null },
    { prompt: '', text: 'Chia sẻ tri thức lập trình, công cụ và tài liệu kỹ thuật.', comment: true },
    { prompt: '$ ', text: 'domain --migrate', color: null },
    { prompt: '', text: 'oriciin.cloud  →  oriciin.cloud', comment: true },
    { prompt: '$ ', text: 'status', color: null },
    { prompt: '', text: 'Đã cập nhật tên miền mới: oriciin.cloud', comment: true },
  ];

  const body = document.getElementById('terminal-body');
  let li = 0, ci = 0;

  function typeNext() {
    if (li >= lines.length) {
      // restart after a pause
      setTimeout(() => { body.innerHTML = ''; li = 0; ci = 0; typeNext(); }, 2200);
      return;
    }
    const line = lines[li];
    const full = line.prompt + line.text;
    if (ci === 0) {
      const p = document.createElement('p');
      p.className = 'terminal-line';
      p.innerHTML = (line.prompt ? `<span class="prompt">${line.prompt}</span>` : '');
      body.appendChild(p);
    }
    const p = body.lastChild;
    ci++;
    const shown = full.slice(0, ci);
    const promptPart = line.prompt;
    const textPart = shown.slice(promptPart.length);
    p.innerHTML = (promptPart ? `<span class="prompt">${promptPart}</span>` : '') +
                  (line.comment ? `<span class="comment">${textPart}</span>` : textPart) +
                  '<span class="cursor"></span>';
    if (ci < full.length) {
      setTimeout(typeNext, 18 + Math.random() * 22);
    } else {
      li++; ci = 0;
      setTimeout(typeNext, 420);
    }
  }
  typeNext();
  },
  'lenhan': function () {
    const searchBtn = document.getElementById('searchBtn');
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const resultsEl = document.getElementById('searchResults');
    const closeBtn = document.getElementById('searchClose');
    if(!searchBtn || !overlay || !input || !resultsEl || !closeBtn) return;

    let indexReady = Array.isArray(window.LENHAN_SEARCH_INDEX);
    let indexError = window.LENHAN_SEARCH_INDEX_ERROR || '';
    let index = indexReady ? window.LENHAN_SEARCH_INDEX : [];
    let activeIndex = -1;
    let visibleLimit = 30;

    function normalize(value){
      return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    }
    function escapeHtml(value){
      return String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
    }
    function render(query){
      const q = query.trim();
      if(!q){
        resultsEl.innerHTML = '<div class="search-hint">Nhập tên hoặc mô tả sinh vật để tìm hồ sơ.</div>';
        activeIndex = -1;
        return;
      }
      if(!indexReady){
        resultsEl.innerHTML = '<div class="search-hint">Đang tải dữ liệu tìm kiếm…</div>';
        activeIndex = -1;
        return;
      }
      if(indexError){
        resultsEl.innerHTML = '<div class="search-empty">Không tải được dữ liệu tìm kiếm. Vui lòng thử tải lại trang.</div>';
        activeIndex = -1;
        return;
      }
      const normalizedQuery = normalize(q);
      const matches = index.filter(item =>
        normalize(item.title).includes(normalizedQuery) ||
        normalize(item.desc).includes(normalizedQuery) ||
        normalize(item.tag).includes(normalizedQuery)
      );
      if(!matches.length){
        resultsEl.innerHTML = '<div class="search-empty">Không tìm thấy hồ sơ phù hợp.</div>';
        activeIndex = -1;
        return;
      }
      const visibleMatches = matches.slice(0, visibleLimit).map(item => {
        const url = new URL(item.url, window.location.href);
        if(url.origin !== window.location.origin) return '';
        return '<a class="search-result" href="' + escapeHtml(url.href) + '">' +
          '<span class="search-result-tag">' + escapeHtml(item.tag) + '</span>' +
          '<span class="search-result-title">' + escapeHtml(item.title) + '</span>' +
          '<span class="search-result-desc">' + escapeHtml(item.desc) + '</span></a>';
      }).join('');
      const loadMore = visibleLimit < matches.length
        ? '<button class="load-more search-load-more" type="button" data-search-more>Tải thêm ' + Math.min(10, matches.length - visibleLimit) + ' kết quả (' + Math.min(visibleLimit, matches.length) + '/' + matches.length + ')</button>'
        : '';
      resultsEl.innerHTML = '<div class="search-result-count">' + Math.min(visibleLimit, matches.length) + ' / ' + matches.length + ' kết quả</div>' + visibleMatches + loadMore;
      activeIndex = -1;
    }
    function setActive(nextIndex){
      const items = resultsEl.querySelectorAll('.search-result');
      items.forEach(item => item.classList.remove('is-active'));
      if(items[nextIndex]){
        items[nextIndex].classList.add('is-active');
        items[nextIndex].scrollIntoView({block:'nearest'});
      }
      activeIndex = nextIndex;
    }
    function openSearch(){
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      searchBtn.setAttribute('aria-expanded', 'true');
      input.value = '';
      render('');
      input.focus();
    }
    function closeSearch(){
      overlay.hidden = true;
      document.body.style.overflow = '';
      searchBtn.setAttribute('aria-expanded', 'false');
      searchBtn.focus();
    }

    searchBtn.addEventListener('click', openSearch);
    closeBtn.addEventListener('click', closeSearch);
    overlay.querySelectorAll('[data-search-close]').forEach(element => element.addEventListener('click', closeSearch));
    input.addEventListener('input', () => {
      visibleLimit = 30;
      render(input.value);
    });
    input.addEventListener('keydown', event => {
      const items = resultsEl.querySelectorAll('.search-result');
      if(event.key === 'ArrowDown'){
        event.preventDefault();
        if(items.length) setActive((activeIndex + 1) % items.length);
      }else if(event.key === 'ArrowUp'){
        event.preventDefault();
        if(items.length) setActive((activeIndex - 1 + items.length) % items.length);
      }else if(event.key === 'Enter'){
        const target = activeIndex >= 0 ? items[activeIndex] : items[0];
        if(target){event.preventDefault();target.click();}
      }
    });
    resultsEl.addEventListener('click', event => {
      if(event.target.closest('[data-search-more]')){
        visibleLimit += 10;
        render(input.value);
        return;
      }
      const result = event.target.closest('.search-result');
      if(!result) return;
      const destination = new URL(result.href, window.location.href);
      if(destination.pathname === window.location.pathname && destination.hash && typeof window.LENHAN_OPEN_CARD === 'function'){
        const id = decodeURIComponent(destination.hash.slice(1));
        if(window.LENHAN_OPEN_CARD(id)) event.preventDefault();
      }
      closeSearch();
    });
    document.addEventListener('keydown', event => {
      if(!overlay.hidden && event.key === 'Escape'){closeSearch();return;}
      const tag = (event.target.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || event.target.isContentEditable;
      if(overlay.hidden && !isTyping && (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'))){
        event.preventDefault();
        openSearch();
      }
    });
    window.addEventListener('lenhan:search-index-ready', event => {
      index = Array.isArray(event.detail) ? event.detail : [];
      indexError = window.LENHAN_SEARCH_INDEX_ERROR || '';
      indexReady = true;
      if(!overlay.hidden) render(input.value);
    });
  },
  'index': function () {
        const dotCanvas = document.getElementById("dot-background");
        const dotContext = dotCanvas.getContext("2d");
        const dotSpacing = 10;
        const dotRadius = 1.5;
        const highlightRadius = 50;
        let dots = [];
        let mousePosition = { x: -100, y: -100 };

        function createDots() {
            const pixelRatio = window.devicePixelRatio || 1;
            dotCanvas.width = window.innerWidth * pixelRatio;
            dotCanvas.height = window.innerHeight * pixelRatio;
            dotCanvas.style.width = `${window.innerWidth}px`;
            dotCanvas.style.height = `${window.innerHeight}px`;
            dotContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            dots = [];

            let rowIndex = 0;
            for (let y = dotSpacing / 2; y < window.innerHeight; y += dotSpacing) {
                const rowOffset = rowIndex % 2 ? dotSpacing / 2 : 0;
                for (let x = dotSpacing / 2 + rowOffset; x < window.innerWidth; x += dotSpacing) {
                    dots.push({ x, y });
                }
                rowIndex++;
            }
            drawDots();
        }

        function drawDots() {
            dotContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (const dot of dots) {
                const distance = Math.hypot(dot.x - mousePosition.x, dot.y - mousePosition.y);
                dotContext.beginPath();
                dotContext.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
                dotContext.fillStyle = distance <= highlightRadius ? "#f28c28" : "#D9D9D9";
                dotContext.fill();
            }
        }

        window.addEventListener("resize", createDots);
        window.addEventListener("mousemove", (event) => {
            mousePosition = { x: event.clientX, y: event.clientY };
            drawDots();
        });
        createDots();

        const cacheSizeElement = document.getElementById("cache-size");

        function formatBytes(bytes) {
            if (!bytes) return "0 B";
            const units = ["B", "KB", "MB", "GB"];
            const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
            return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex ? 2 : 0)} ${units[unitIndex]}`;
        }

        async function getCacheSize() {
            if (!("caches" in window)) {
                cacheSizeElement.textContent = "Trình duyệt không hỗ trợ Cache Storage.";
                return;
            }

            try {
                const cacheNames = await caches.keys();
                let totalBytes = 0;
                let totalEntries = 0;

                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    totalEntries += requests.length;

                    for (const request of requests) {
                        const response = await cache.match(request);
                        const contentLength = response && response.headers.get("content-length");
                        totalBytes += contentLength ? Number(contentLength) : (response ? (await response.clone().blob()).size : 0);
                    }
                }

                let quotaText = "";
                if (navigator.storage && navigator.storage.estimate) {
                    const estimate = await navigator.storage.estimate();
                    quotaText = ` Tổng bộ nhớ đã dùng: ${formatBytes(estimate.usage || 0)} / ${formatBytes(estimate.quota || 0)}.`;
                }

                cacheSizeElement.textContent = `${formatBytes(totalBytes)} trong ${totalEntries} mục cache.${quotaText}`;
            } catch (error) {
                cacheSizeElement.textContent = "Không thể đọc dung lượng cache của trình duyệt.";
            }
        }

        function isImageRequest(request, response) {
            const contentType = response && response.headers.get("content-type");
            if (contentType && contentType.toLowerCase().startsWith("image/")) return true;
            if (request.destination === "image") return true;
            return /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)(\?.*)?$/i.test(request.url);
        }

        async function clearOldCache() {
            if (!("caches" in window)) {
                cacheSizeElement.textContent = "Trình duyệt không hỗ trợ Cache Storage.";
                return;
            }

            const clearButton = document.getElementById("clear-cache");
            clearButton.disabled = true;
            clearButton.textContent = "Đang xóa...";

            try {
                let deletedEntries = 0;
                const cacheNames = await caches.keys();

                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();

                    for (const request of requests) {
                        const response = await cache.match(request);
                        if (!isImageRequest(request, response) && await cache.delete(request)) {
                            deletedEntries++;
                        }
                    }
                }

                cacheSizeElement.textContent = `Đã xóa ${deletedEntries} mục cache cũ, giữ lại hình ảnh và dữ liệu người dùng.`;
                await getCacheSize();
            } catch (error) {
                cacheSizeElement.textContent = "Không thể xóa cache cũ.";
            } finally {
                clearButton.disabled = false;
                clearButton.textContent = "Xóa cache cũ";
            }
        }

        document.getElementById("refresh-cache").addEventListener("click", getCacheSize);
        document.getElementById("clear-cache").addEventListener("click", clearOldCache);
        getCacheSize();
        setTimeout(() => {
            try {
                window.siteAccess.issueToken();
                window.location.href = "https://oriciin.cloud/home";
            } catch (error) {
                console.error("Không thể tạo token truy cập.", error);
                document.getElementById("redirect-status").textContent =
                    "Không thể tạo token truy cập. Vui lòng kiểm tra cài đặt trình duyệt rồi tải lại trang.";
            }
        }, 1000);
    
  },
  'root': function () {
		class NoiDungNgoai extends HTMLElement {
			static observedAttributes = ['src'];
			connectedCallback(){this.renderContent();}
			attributeChangedCallback(){if(this.isConnected) this.renderContent();}
			renderContent(){
				const source = this.getAttribute('src');
				const shadow = this.shadowRoot || this.attachShadow({mode:'open'});
				shadow.innerHTML = '<style>:host{display:block;width:100%;height:100%;background:#fffefa} iframe{display:block;width:100%;height:100%;border:0;background:#fffefa}</style>';
				if(!source) return;
				const frame = document.createElement('iframe');
				frame.src = source;
				frame.title = 'Padlet preview';
				frame.loading = 'lazy';
				frame.referrerPolicy = 'no-referrer';
				shadow.append(frame);
			}
		}
		customElements.define('noi-dung-ngoai', NoiDungNgoai);

		const padletBase = 'https://padlet.com/';
		const corsProxies = [
			url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
			url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`
		];
		const input = document.querySelector('#nameInput');
		const loopInput = document.querySelector('#loopInput');
		const results = document.querySelector('#results');
		const count = document.querySelector('#resultCount');
		const searchButton = document.querySelector('#searchForm button');
		const preview = document.querySelector('#preview');
		const previewFrame = document.querySelector('#previewFrame');
		const previewTitle = document.querySelector('#previewTitle');
		const previewUrl = document.querySelector('#previewUrl');
		const openExternal = document.querySelector('#openExternal');
		const requestLog = document.querySelector('#requestLog');
		const directPadletInput = document.querySelector('#directPadletInput');
		const directPadletError = document.querySelector('#directPadletError');
		let activePreviewUrl = '';
		let logLines = [];
		const clean = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
		const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
		const safePadletUrl = value => {try{const url = new URL(value);return url.origin === 'https://padlet.com' ? url.href : '';}catch(error){return '';}};

		function buildCandidates(value, loops){
			const base = clean(value);
			if(!base) return [];
			const candidates = [base];
			// Excel-style lowercase suffixes: a..z, aa..az, ba..; loops are capped at 100.
			const alphabetSuffix = index => {
				let suffix = '';
				let current = index;
				do{
					suffix = String.fromCharCode(97 + (current % 26)) + suffix;
					current = Math.floor(current / 26) - 1;
				}while(current >= 0);
				return suffix;
			};
			for(let round = 0; round < loops; round += 1){
				candidates.push(`${base}${alphabetSuffix(round)}`);
			}
			return candidates;
		}

		async function checkPadlet(username){
			const url = `${padletBase}${encodeURIComponent(username)}`;
			for(let index = 0; index < corsProxies.length; index += 1){
				const proxyUrl = corsProxies[index](url);
				appendLog(`→ GET ${proxyUrl}`, 'request-line');
				try{
					const response = await fetch(proxyUrl, {method:'GET', mode:'cors', cache:'no-store'});
					if(!response.ok) throw new Error(`Proxy HTTP ${response.status}`);
					const data = await response.json().catch(() => null);
					const status = Number(data?.status?.http_code ?? data?.status);
					const contents = typeof data?.contents === 'string' ? data.contents : (typeof data?.data === 'string' ? data.data : '');
					const documentSize = contents.length;
					if(!Number.isFinite(status)) throw new Error(`Response không có mã HTTP / document ${documentSize} bytes`);
					appendLog(`← HTTP ${status} / document ${documentSize} bytes`, 'response-line');
					const profile = status === 404 ? {displayName:'', username, frequency:0} : parseProfileDocument(contents, username);
					return {username, url, status, state:status === 404 ? 'missing' : 'confirmed', displayName:profile.displayName, profileUsername:profile.username, frequency:profile.frequency};
				}catch(error){
					appendLog(`← Proxy ${index + 1} lỗi: ${error.message || 'CORS/mạng'}`, 'error-line');
				}
			}
			return {username, url, status:0, state:'unknown'};
		}

		function appendLog(message, className){
			logLines.push({message, className});
			if(logLines.length > 80) logLines = logLines.slice(-80);
			requestLog.innerHTML = logLines.map(line => `<span class="${line.className}">${escapeHtml(line.message)}</span>`).join('\n');
			requestLog.scrollTop = requestLog.scrollHeight;
		}

		function parseProfileDocument(contents, fallbackUsername){
			if(typeof contents !== 'string' || !contents) return {displayName:'', username:fallbackUsername, frequency:0};
			const documentNode = new DOMParser().parseFromString(contents, 'text/html');
			const title = documentNode.querySelector('title')?.textContent?.trim() || '';
			const titleMatch = title.match(/^(.+?)\s+\(([^)]*)\)\s+profile\s*\|\s*Padlet$/i);
			const metadataTitle = documentNode.querySelector('meta[property="og:title"]')?.content || '';
			const metadataMatch = metadataTitle.match(/^(.+?)\s+\(([^)]*)\)\s+profile\s*\|\s*Padlet$/i);
			const match = titleMatch || metadataMatch;
			const username = match?.[2]?.trim() || fallbackUsername;
			const source = contents.toLowerCase();
			const needle = username.toLowerCase();
			let frequency = 0;
			let offset = 0;
			while(needle && (offset = source.indexOf(needle, offset)) !== -1){frequency += 1;offset += needle.length;}
			return {displayName:match?.[1]?.trim() || '', username, frequency};
		}

		function resultMarkup(item, index){
			const labels = {confirmed:'Không trả về 404', missing:'404 - Không tìm thấy', unknown:'Chưa xác minh (CORS/mạng)'};
			const label = labels[item.state] || labels.unknown;
			const safeUrl = safePadletUrl(item.url);
			const profileName = item.displayName || item.username;
			const profileUsername = item.profileUsername || item.username;
			return `<article class="result ${item.state === 'confirmed' ? 'confirmed' : ''} reveal" style="animation-delay:${index * 35}ms"><div class="site-icon">P</div><div class="result-main"><div class="site-name">${escapeHtml(profileName)}</div><div class="handle">@${escapeHtml(profileUsername)} · ${escapeHtml(safeUrl || item.url)} · Tần suất: ${escapeHtml(item.frequency || 0)}</div></div><div class="result-side"><span class="status ${escapeHtml(item.state)}">${escapeHtml(label)}${item.status ? ` · HTTP ${escapeHtml(item.status)}` : ''}</span><button class="open preview-trigger" data-url="${escapeHtml(safeUrl)}" data-username="${escapeHtml(profileUsername)}">Xem cửa sổ nhỏ</button><button class="use-name" type="button" data-username="${escapeHtml(profileUsername)}">Dùng tên này</button></div></article>`;
		}

		function showPreview(url, username){
			const safeUrl = safePadletUrl(url);
			if(!safeUrl) return;
			activePreviewUrl = safeUrl;
			previewTitle.textContent = `Padlet / ${username}`;
			previewUrl.textContent = safeUrl;
			previewFrame.setAttribute('src', safeUrl);
			preview.hidden = false;
		}
		function hidePreview(){preview.hidden = true;previewFrame.removeAttribute('src');activePreviewUrl = '';}

		function getDirectPadletUrl(value){
			const rawValue = value.trim();
			if(!rawValue) return null;
			if(/^https?:\/\//i.test(rawValue)) return safePadletUrl(rawValue);
			const username = clean(rawValue);
			return username ? `${padletBase}${encodeURIComponent(username)}` : null;
		}

		async function searchPadlet(){
			const candidates = buildCandidates(input.value, Math.min(100, Math.max(1, Number(loopInput.value) || 1)));
			if(!candidates.length){
				results.innerHTML='<div class="empty"><strong>Tên không hợp lệ</strong>Hãy nhập ít nhất một chữ cái tiếng Anh hoặc chữ số.</div>';
				count.textContent='0 tên';
				return;
			}
			searchButton.disabled = true;
			searchButton.textContent = 'Đang kiểm tra...';
			results.innerHTML = '<div class="empty"><strong>Đang hỏi Padlet...</strong>Đang kiểm tra từng username.</div>';
			const checked = [];
			for(const candidate of candidates){
				const item = await checkPadlet(candidate);
				checked.push(item);
				if(item.state === 'confirmed') break;
			}
			const confirmed = checked.filter(item => item.state === 'confirmed');
			results.innerHTML = confirmed.length ? confirmed.map(resultMarkup).join('') : '<div class="empty"><strong>Chưa có tên được xác nhận</strong>Các tên 404 hoặc lỗi mạng đã được kiểm tra theo thứ tự.</div>';
			count.textContent = `${confirmed.length} tên xanh / ${checked.length} trên ${candidates.length} candidate`;
			searchButton.disabled = false;
			searchButton.innerHTML = 'Tìm trên Padlet <span aria-hidden="true">→</span>';
			document.querySelectorAll('.preview-trigger').forEach(button => button.addEventListener('click', () => showPreview(button.dataset.url, button.dataset.username)));
			document.querySelectorAll('.use-name').forEach(button => button.addEventListener('click', () => {input.value = button.dataset.username;input.focus();input.select()}));
		}

		document.querySelector('#searchForm').addEventListener('submit', event => {event.preventDefault();searchPadlet()});
		document.querySelector('#addLoop').addEventListener('click', () => {loopInput.value = Math.min(100, (Number(loopInput.value) || 1) + 1);loopInput.focus()});
		document.querySelector('#clearLog').addEventListener('click', () => {logLines = [];requestLog.textContent = 'Log đã được xóa.';});
		document.querySelector('#directPadletForm').addEventListener('submit', event => {
			event.preventDefault();
			const url = getDirectPadletUrl(directPadletInput.value);
			if(!url){directPadletError.textContent = 'Hãy nhập username hoặc URL thuộc padlet.com.';return;}
			directPadletError.textContent = '';
			const username = new URL(url).pathname.split('/').filter(Boolean).pop() || 'Padlet';
			showPreview(url, username);
		});
		document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {input.value=button.dataset.example;input.focus()}));
		document.querySelector('#closePreview').addEventListener('click', hidePreview);
		document.querySelector('#openExternal').addEventListener('click', () => {const safeUrl = safePadletUrl(activePreviewUrl);if(safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer')});
		preview.addEventListener('click', event => {if(event.target === preview) hidePreview()});
		document.addEventListener('keydown', event => {if(event.key === 'Escape' && !preview.hidden) hidePreview()});
	
  },
  'analyzer': function () {
// ═══ STATE ═══
let rawText = '';
let questions = [];
let activeFilter = 'all';
let editingIdx = null;
let dragSrcIdx = null;
let pendingFixes = [];
let docSettings = { font:"'Nunito',sans-serif", size:'15px', lh:'1.7', spacing:'12px', optLayout:'2', numStyle:'roman' };
let pvQuestions = [], pvCur = 0, pvAnswers = {}, pvTab = 'quiz';
let aiSolutions = {};

// ═══ FILE ═══
window.onload = () => {
  const zone = document.getElementById('dropZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag');
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  });
};

function handleFile(input) { if (input.files[0]) processFile(input.files[0]); }

async function processFile(file) {
  showStatus('Đang đọc file...', 'info');
  const pill = document.getElementById('filePill');
  pill.textContent = '📎 ' + file.name;
  pill.classList.add('show');
  try {
    if (file.name.endsWith('.txt')) {
      rawText = await file.text();
    } else if (file.name.match(/\.docx?$/i)) {
      const ab = await file.arrayBuffer();
      // MODIFIED: Dùng convertToHtml để giữ lại thẻ Bold, sau đó chuyển thẻ Bold thành dấu ** để parser có thể nhận dạng 
      const result = await mammoth.convertToHtml({ arrayBuffer: ab });
      let htmlStr = result.value;
      htmlStr = htmlStr.replace(/<\/?(?:b|strong)[^>]*>/gi, '**');
      htmlStr = htmlStr.replace(/<\/?(?:p|div|h[1-6]|tr|li)[^>]*>/gi, '\n');
      htmlStr = htmlStr.replace(/<br[^>]*>/gi, '\n');
      htmlStr = htmlStr.replace(/<[^>]+>/g, '');
      const txtArea = document.createElement("textarea");
      txtArea.innerHTML = htmlStr;
      rawText = txtArea.value.replace(/\n\s*\n/g, '\n').trim();
    } else { showStatus('❌ Chỉ hỗ trợ .txt và .docx', 'err'); return; }
    
    analyzeFileStructure(rawText, file.name);
    showStatus(`✅ Đã tải: ${file.name} · ${rawText.length.toLocaleString()} ký tự`, 'ok');
    document.getElementById('parseBtn').disabled = false;
  } catch (e) { showStatus('❌ Lỗi: ' + e.message, 'err'); }
}

function showStatus(msg, type) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg; el.className = 'status-msg ' + type;
}

// ═══ FILE ANALYSIS ═══
function analyzeFileStructure(text, filename) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  // Cập nhật thống kê để đếm đúng cả trường hợp MCQ nằm chung trên 1 dòng
  const splitRegex = /\s+(?=(?:\*\*)*[A-D](?:\*\*)*\s*[\.\)](?:\s|$))/gi;
  let expanded = [];
  for(let l of lines) { expanded.push(...l.split(splitRegex).map(p=>p.trim()).filter(p=>p)); }

  const stats = { total: lines.length, qLines: 0, mcqOpts: 0, tfItems: 0, ansLines: 0 };
  const Q_RE   = /^(câu\s*\d+|question\s*\d+|\d{1,3}[\.\)]\s+\S)/i;
  const MCQ_RE = /^(?:\*\*)*[A-D](?:\*\*)*\s*[\.\)]\s*.+/i;
  const TF_RE  = /^(?:\*\*)*[a-d](?:\*\*)*\s*[\)\.](.+)/i;
  const ANS_RE = /(?:đáp\s*án|answer|key)\s*[:.\-]?\s*[A-D]/i;
  const CTX_RE = /tư\s*liệu|đoạn\s*văn|passage/i;
  const BOOL_RE= /\((?:đúng|sai|true|false)\)/i;
  let hasMCQ=false,hasTF=false,hasAns=false,hasCtx=false,hasBold=false;
  
  for (const l of expanded) {
    if (Q_RE.test(l))   stats.qLines++;
    if (MCQ_RE.test(l)) { stats.mcqOpts++; hasMCQ=true; if(l.includes('**')) hasBold=true; }
    if (TF_RE.test(l))  { stats.tfItems++; hasTF=true; }
    if (ANS_RE.test(l)) { stats.ansLines++; hasAns=true; }
    if (CTX_RE.test(l)) hasCtx=true;
    if (BOOL_RE.test(l)) hasTF=true;
  }
  
  const panel = document.getElementById('fileAnalysis');
  panel.classList.add('show');
  document.getElementById('faGrid').innerHTML = `
    <div class="fa-stat"><div class="n">${stats.qLines}</div><div class="l">Câu hỏi</div></div>
    <div class="fa-stat"><div class="n">${stats.mcqOpts}</div><div class="l">Lựa chọn MCQ</div></div>
    <div class="fa-stat"><div class="n">${stats.tfItems}</div><div class="l">Ý T/F</div></div>
    <div class="fa-stat"><div class="n">${stats.ansLines}</div><div class="l">Đáp án rõ</div></div>`;
  const tags = [];
  if (hasMCQ) tags.push('<span class="fa-tag ok">✓ Có câu trắc nghiệm</span>');
  if (hasTF)  tags.push('<span class="fa-tag ok">✓ Có câu Đúng/Sai</span>');
  if (hasAns) tags.push('<span class="fa-tag ok">✓ Có đáp án rõ ràng</span>');
  else if (hasBold) tags.push('<span class="fa-tag ok">✓ Bắt đáp án qua tô đậm (Bold)</span>');
  else          tags.push('<span class="fa-tag warn">⚠ Thiếu đáp án</span>');
  if (hasCtx) tags.push('<span class="fa-tag">📌 Có đoạn văn/tư liệu</span>');
  
  document.getElementById('faTags').innerHTML = tags.join('');
  const pats = [];
  if (hasMCQ && !hasAns && !hasBold) pats.push('<span>⚠ Câu MCQ</span> không có dòng "Đáp án:" — cần điền thủ công');
  if (hasTF)  pats.push('<span>✓ Câu Đúng/Sai</span> dạng a) b) c) d) được phát hiện');
  if (stats.qLines > 0) pats.push(`<span>${stats.qLines} câu hỏi</span> bắt đầu bằng số/từ "Câu"/"Question"`);
  if (filename.match(/\.docx?$/i)) pats.push('<span>📄 File Word</span> — đã trích xuất văn bản & giữ định dạng (Bold)');
  document.getElementById('faPatterns').innerHTML = pats.length ? pats.join('<br>') : 'Không phát hiện cấu trúc đặc biệt — sẽ thử phân tích tự do.';
}

// ═══ PARSE ═══
async function triggerParse() {
  if (!rawText.trim()) return;
  aiSolutions = {};
  const useAI = document.getElementById('aiToggle').checked;
  if (useAI) await parseWithAI(); else parseLocal();
}

async function parseWithAI() {
    const API_KEY = 'sk-ant-YOUR_API_KEY_HERE'; // ⭐ THÊM API KEY
  document.getElementById('aiSpin').classList.add('show');
  document.getElementById('parseBtn').disabled = true;
  showStatus('Đang gửi tới AI...', 'info');
  const prompt = `Bạn là hệ thống phân tích đề thi thông minh. Hãy phân tích văn bản đề thi sau và trả về JSON.

VĂN BẢN ĐỀ THI:
${rawText.slice(0, 8000)}

NHIỆM VỤ: Phân tích TỪNG câu hỏi và trả về mảng JSON với cấu trúc sau:
- type: "mcq" | "tf" | "short"
- question: nội dung câu hỏi (đã bỏ prefix)
- context: đoạn văn/tư liệu nếu có (null nếu không)
- options: mảng ["A text","B text","C text","D text"] chỉ cho MCQ (null nếu không)
- answer: index 0-3 cho MCQ (-1 nếu không rõ), null cho loại khác
- statements: mảng [{text:"a) ...",answer:true/false},...] chỉ cho TF (null nếu không)
- note: ghi chú cho short answer (null nếu không)
- confidence: "high"|"mid"|"low"

QUAN TRỌNG: Trả về CHỈ JSON array, không có text nào khác, không có markdown backticks`;
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await resp.json();
    const txt = data.content?.map(c => c.text || '').join('') || '';
    let cleaned = txt.replace(/```json|```/gi, '').trim();
    const arr = JSON.parse(cleaned);
    if (!Array.isArray(arr) || !arr.length) throw new Error('Dữ liệu không hợp lệ');
    questions = arr.map(sanitizeQ);
    finishParse('AI');
  } catch (e) {
    showStatus('⚠️ AI lỗi → chuyển local: ' + e.message.slice(0,50), 'info');
    parseLocal();
  } finally {
    document.getElementById('aiSpin').classList.remove('show');
    document.getElementById('parseBtn').disabled = false;
  }
}

function sanitizeQ(q) {
  return {
    type: ['mcq','tf','short'].includes(q.type) ? q.type : 'short',
    question: (q.question || '').trim() || '(câu hỏi)',
    context: q.context || null,
    options: q.options || null,
    answer: q.answer !== undefined ? q.answer : (q.type === 'mcq' ? -1 : null),
    statements: q.statements || null,
    note: q.note || null,
    confidence: q.confidence || 'mid'
  };
}

function parseLocal() {
  questions = [];
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
  const blocks = segmentBlocks(lines);
  for (const b of blocks) { const q = classifyBlock(b); if (q) questions.push(q); }
  if (!questions.length) { showStatus('⚠️ Không tìm thấy câu hỏi. Kiểm tra định dạng.', 'err'); return; }
  finishParse('local');
}

function finishParse(source) {
  if (!questions.length) return;
  aiSolutions = {};
  runAutoFix();
  updateStats();
  renderAll();
  document.getElementById('exportBtn').disabled = false;
  document.getElementById('exportJsonBtn').disabled = false;
  document.getElementById('solveAllBtn').disabled = false;
  document.getElementById('docSettingsBar').style.display = 'flex';
  document.getElementById('reorderHint').style.display = 'flex';
  showStatus(`✅ ${source==='AI'?'🤖 AI':'⚙️ Local'}: ${questions.length} câu`, 'ok');
  document.getElementById('mainSub').textContent = `${questions.length} câu · nguồn: ${source}`;
}

function segmentBlocks(lines) {
  const Q_RE = /^(câu\s*\d+|question\s*\d+|\d{1,3}[\.\)]\s+\S)/i;
  const blocks = []; let cur = [];
  for (const l of lines) {
    if (Q_RE.test(l) && cur.length > 0) { blocks.push(cur); cur = [l]; }
    else cur.push(l);
  }
  if (cur.length) blocks.push(cur);
  return blocks.filter(b => b.length);
}

// MODIFIED: Thêm phân tích tách cột và đếm cho chuẩn
function classifyBlock(block) {
  let mcqScore=0, tfScore=0;
  
  // Tách các câu MCQ nằm chung trên cùng 1 dòng thành nhiều dòng riêng biệt để phân tích (VD: dạng 2 cột AC | BD)
  const splitRegex = /\s+(?=(?:\*\*)*[A-D](?:\*\*)*\s*[\.\)](?:\s|$))/g;
  let expanded = [];
  for(let l of block) {
     expanded.push(...l.split(splitRegex).map(p=>p.trim()).filter(p=>p));
  }

  const optRe=/^(?:\*\*)*[A-D](?:\*\*)*\s*[\.\)]\s*.+/i;
  const tfRe=/^(?:\*\*)*[a-d](?:\*\*)*\s*[\)\.](.+)/i;
  const ansRe=/(?:đáp\s*án|answer|key)\s*[:.\-]?\s*[A-D]/i;
  const boolRe=/\((?:đúng|sai|true|false)\)/i;
  
  for (const l of expanded) {
    if (optRe.test(l)) mcqScore+=2;
    if (tfRe.test(l))  tfScore+=2;
    if (ansRe.test(l)) mcqScore+=1;
    if (boolRe.test(l)) tfScore+=1;
  }
  
  if (tfScore>mcqScore && tfScore>=2) return parseTF(expanded);
  if (mcqScore>=2) return parseMCQ(expanded);
  if (expanded[0] && expanded[0].length>8) return parseShort(expanded);
  return null;
}

// MODIFIED: Cập nhật hàm parseMCQ để đọc được ký tự In Đậm (**) và sắp xếp đúng thứ tự ABCD sau khi tách cột
function parseMCQ(block) {
  const optRe=/^(?:\*\*)*([A-D])(?:\*\*)*\s*[\.\)]\s*(.+)/i;
  const ansRe=/^(?:đáp\s*án|answer|key)\s*[:.\-]?\s*([A-D])/i;
  let qLines=[], optsObj={}, ansIdx=-1;
  
  for (let l of block) {
    const am=l.match(ansRe); 
    if(am){ ansIdx='ABCD'.indexOf(am[1].toUpperCase()); continue; }
    
    const om=l.match(optRe); 
    if(om){
      let letter = om[1].toUpperCase();
      let txt = om[2].trim();
      let isBolded = l.includes('**');
      
      // Xoá ký tự markdown ** dư thừa
      txt = txt.replace(/\*\*/g, '').replace(/\*+|##|\[x\]|\(x\)/gi,'').trim();
      
      // Khớp theo Index đúng của A,B,C,D thay vì hên xui theo thứ tự duyệt (để giải quyết lỗi dạng cột A C - B D)
      let lIdx = 'ABCDEF'.indexOf(letter);
      if(lIdx >= 0) {
         optsObj[lIdx] = txt;
         if (isBolded && ansIdx === -1) ansIdx = lIdx; // Tìm thấy Bold -> Chọn làm Đáp án luôn
      }
      continue;
    }
    
    if(Object.keys(optsObj).length === 0) qLines.push(l.replace(/\*\*/g, ''));
  }
  
  // Trải phẳng mảng Object sau khi sắp xếp lại theo Index chuẩn A,B,C,D
  let options = [];
  let maxIdx = -1;
  for (let k of Object.keys(optsObj)) { if (parseInt(k) > maxIdx) maxIdx = parseInt(k); }
  for (let i = 0; i <= maxIdx; i++) { options.push(optsObj[i] || "(trống)"); }
  
  const q = cleanPrefix(qLines.join(' ').trim() || (block[0] ? block[0].replace(/\*\*/g, '') : ''));
  if(!q) return null;
  return {type:'mcq', question:q, context:null, options, answer:ansIdx, statements:null, note:null, confidence:'mid'};
}

function parseTF(block) {
  const itemRe=/^(?:\*\*)*([a-d])(?:\*\*)*\s*[\)\.](.+)/i, inlineRe=/\((?:đúng|sai|true|false|[ĐDS])\)/i;
  let qLines=[],stmts=[];
  for (const l of block) {
    const im=l.match(itemRe);
    if(im){
        let txt=im[2].trim().replace(/\*\*/g, '');
        let ans=false;
        const av=txt.match(inlineRe);
        if(av){
            const v=av[0].toLowerCase();
            ans=v.includes('đúng')||v.includes('true')||v.includes('đ');
            txt=txt.replace(inlineRe,'').trim();
        }
        stmts.push({text:`${im[1].toLowerCase()}) ${txt}`,answer:ans});
        continue;
    }
    if(!stmts.length) qLines.push(l.replace(/\*\*/g, ''));
  }
  if(stmts.length<2) return null;
  return {type:'tf',question:cleanPrefix(qLines.join(' ').trim()||(block[0]?block[0].replace(/\*\*/g,''):'')),context:null,options:null,answer:null,statements:stmts,note:null,confidence:'mid'};
}

function parseShort(block) {
  return {type:'short',question:cleanPrefix(block[0].replace(/\*\*/g, '')),context:null,options:null,answer:null,statements:null,note:block.slice(1).join(' ').replace(/\*\*/g,'').trim()||null,confidence:'mid'};
}

function cleanPrefix(s) { return (s||'').replace(/^(câu\s*\d+|question\s*\d+|\d{1,3}[\.\)])\s*/i,'').trim(); }

// ═══ AUTO FIX ═══
function runAutoFix() {
  pendingFixes=[];
  questions.forEach((q,i)=>{
    if(q.type==='mcq'&&q.answer===-1) pendingFixes.push({idx:i,issue:'Chưa có đáp án'});
    if(q.type==='mcq'&&(!q.options||q.options.length<2)) pendingFixes.push({idx:i,issue:'Thiếu lựa chọn'});
    if(!q.question||q.question.length<3) pendingFixes.push({idx:i,issue:'Câu hỏi rỗng'});
  });
  const banner=document.getElementById('fixBanner');
  if(pendingFixes.length>0){document.getElementById('fixMsg').textContent=`🔎 Phát hiện ${pendingFixes.length} vấn đề`;banner.classList.add('show');}
  else banner.classList.remove('show');
}

function applyFixes() {
  const count=pendingFixes.length;
  pendingFixes.forEach(f=>{
    const q=questions[f.idx];
    if(f.issue==='Chưa có đáp án') q.answer=0;
    if(f.issue==='Thiếu lựa chọn'&&(!q.options||!q.options.length)) q.options=['Đáp án A','Đáp án B','Đáp án C','Đáp án D'];
    if(f.issue==='Câu hỏi rỗng') q.question='(câu hỏi cần bổ sung)';
  });
  pendingFixes=[];
  document.getElementById('fixBanner').classList.remove('show');
  renderAll();
  showStatus(`✅ Đã căn chỉnh ${count} vấn đề`,'ok');
}

function dismissFix() { document.getElementById('fixBanner').classList.remove('show'); }
function autoFix() { runAutoFix(); if(!pendingFixes.length) showStatus('✅ Không phát hiện vấn đề','ok'); else applyFixes(); }

// ═══ STATS ═══
function updateStats() {
  const mcq=questions.filter(q=>q.type==='mcq').length;
  const tf=questions.filter(q=>q.type==='tf').length;
  const oth=questions.filter(q=>q.type==='short').length;
  document.getElementById('stTotal').textContent=questions.length;
  document.getElementById('stMCQ').textContent=mcq;
  document.getElementById('stTF').textContent=tf;
  document.getElementById('stOther').textContent=oth;
  document.getElementById('statsGrid').style.display='grid';
}

// ═══ DOC SETTINGS ═══
function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }
function applyDocSettings() {
  docSettings.font=document.getElementById('setFont').value;
  docSettings.size=document.getElementById('setSize').value;
  docSettings.lh=document.getElementById('setLH').value;
  docSettings.optLayout=document.getElementById('setOptLayout').value;
  docSettings.numStyle=document.getElementById('setNumStyle').value;
  const root=document.documentElement;
  root.style.setProperty('--doc-font',docSettings.font);
  root.style.setProperty('--doc-size',docSettings.size);
  root.style.setProperty('--doc-lh',docSettings.lh);
  const sp=document.getElementById('settingPreview');
  sp.style.fontFamily=docSettings.font;
  sp.style.fontSize=docSettings.size;
  sp.style.lineHeight=docSettings.lh;
  renderAll();
}

// ═══ AI SOLVE ═══
async function solveQuestion(idx) {
  const q = questions[idx];
  if (!q) return;

  const btn = document.getElementById(`ai-solve-btn-${idx}`);
  if (btn) { btn.classList.add('solving'); btn.innerHTML = '<span>✦ Đang giải...</span>'; }

  showAIThinking(idx);

  try {
    let prompt = '';
    if (q.type === 'mcq') {
      const L = ['A','B','C','D','E','F'];
      const optsList = (q.options||[]).map((o,i) => `${L[i]}. ${o}`).join('\n');
      prompt = `Bạn là giáo viên giỏi. Hãy giải câu hỏi trắc nghiệm sau và trả về JSON.

Câu hỏi: ${q.question}
${q.context ? `Tư liệu: ${q.context}\n` : ''}Các lựa chọn:
${optsList}

Trả về JSON (CHỈ JSON, không markdown):
{
  "answer_index": <số 0-3 là index đáp án đúng>,
  "answer_label": "<A/B/C/D>",
  "explanation": "<giải thích ngắn gọn tại sao đáp án đó đúng, 2-4 câu>"
}`;
    } else if (q.type === 'tf') {
      const stmtsList = (q.statements||[]).map((s,i) => `${i}. ${s.text}`).join('\n');
      prompt = `Bạn là giáo viên giỏi. Hãy xác định đúng/sai cho từng ý sau và trả về JSON.

Câu hỏi: ${q.question}
${q.context ? `Tư liệu: ${q.context}\n` : ''}Các ý:
${stmtsList}

Trả về JSON (CHỈ JSON, không markdown):
{
  "answers": [<true/false cho từng ý theo thứ tự>],
  "explanation": "<giải thích tổng quát ngắn gọn, 2-3 câu>"
}`;
    } else {
      prompt = `Bạn là giáo viên giỏi. Hãy trả lời câu hỏi sau và trả về JSON.

Câu hỏi: ${q.question}
${q.context ? `Tư liệu: ${q.context}\n` : ''}${q.note ? `Gợi ý: ${q.note}\n` : ''}
Trả về JSON (CHỈ JSON, không markdown):
{
  "answer": "<câu trả lời ngắn gọn>",
  "explanation": "<giải thích chi tiết, 3-5 câu>"
}`;
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await resp.json();
    const txt = (data.content?.map(c => c.text||'').join('') || '').replace(/```json|```/gi,'').trim();
    const result = JSON.parse(txt);
    aiSolutions[idx] = result;

    if (q.type === 'mcq' && result.answer_index !== undefined && q.answer === -1) {
      questions[idx].answer = result.answer_index;
    }
    if (q.type === 'tf' && result.answers && Array.isArray(result.answers)) {
      (q.statements||[]).forEach((s,i) => {
        if (result.answers[i] !== undefined) s.answer = result.answers[i];
      });
    }

    renderSolutionBox(idx, result, q);
  } catch(e) {
    showAIError(idx, e.message);
  } finally {
    const btn2 = document.getElementById(`ai-solve-btn-${idx}`);
    if (btn2) { btn2.classList.remove('solving'); btn2.innerHTML = '✦ AI Giải'; }
  }
}

function showAIThinking(idx) {
  let box = document.getElementById(`ai-sol-${idx}`);
  if (!box) {
    box = document.createElement('div');
    box.id = `ai-sol-${idx}`;
    box.className = 'ai-solution-box';
    const qBody = document.querySelector(`#card-${idx} .q-body`);
    if (qBody) qBody.appendChild(box);
  }
  box.innerHTML = `
    <div class="ai-sol-head">
      <div class="ai-sol-icon">✦</div>
      <span class="ai-sol-title">AI ĐANG PHÂN TÍCH...</span>
    </div>
    <div class="ai-sol-thinking">
      <div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div>
      <span style="color:var(--ink2);font-size:.8rem;">Đang suy nghĩ...</span>
    </div>`;
}

function renderSolutionBox(idx, result, q) {
  let box = document.getElementById(`ai-sol-${idx}`);
  if (!box) {
    box = document.createElement('div');
    box.id = `ai-sol-${idx}`;
    box.className = 'ai-solution-box';
    const qBody = document.querySelector(`#card-${idx} .q-body`);
    if (qBody) qBody.appendChild(box);
  }
  const L = ['A','B','C','D','E','F'];
  let bodyHtml = '';

  if (q.type === 'mcq') {
    const ansIdx = result.answer_index;
    const ansLbl = result.answer_label || (ansIdx >= 0 ? L[ansIdx] : '?');
    const ansText = (q.options||[])[ansIdx] || '';
    bodyHtml = `
      <div class="ans-highlight">✓ Đáp án: ${ansLbl}. ${esc(ansText)}</div>
      <div class="explanation">${esc(result.explanation||'')}</div>`;
    if (ansIdx >= 0) {
      questions[idx].answer = ansIdx;
      document.querySelectorAll(`#card-${idx} .opt`).forEach((el, i) => {
        el.classList.toggle('correct', i === ansIdx);
        const ltr = el.querySelector('.opt-letter');
        if (ltr) ltr.style.color = (i === ansIdx) ? 'var(--green)' : '';
        const ck = el.querySelector('.opt-check');
        if (ck) el.removeChild(ck);
        if (i === ansIdx) {
          const c = document.createElement('span');
          c.className = 'opt-check'; c.textContent = '✓'; el.appendChild(c);
        }
      });
    }
  } else if (q.type === 'tf') {
    const answers = result.answers || [];
    let tfHtml = '<div class="tf-answers">';
    (q.statements||[]).forEach((s, i) => {
      const ans = answers[i];
      tfHtml += `
        <div class="tf-ans-item">
          <span class="lbl">${esc(s.text.split(')')[0])})</span>
          <span class="val ${ans ? 't' : 'f'}">${ans ? '✓ ĐÚNG' : '✗ SAI'}</span>
        </div>`;
      const tfiEl = document.getElementById(`tfi-${idx}-${i}`);
      if (tfiEl) {
        const btns = tfiEl.querySelectorAll('.tf-pill button');
        if (btns[0]) btns[0].classList.toggle('sel', ans === true);
        if (btns[1]) btns[1].classList.toggle('sel', ans === false);
      }
      if (q.statements[i]) q.statements[i].answer = ans;
    });
    tfHtml += '</div>';
    bodyHtml = `${tfHtml}<div class="explanation">${esc(result.explanation||'')}</div>`;
  } else {
    bodyHtml = `
      <div class="ans-highlight">💡 ${esc(result.answer||'')}</div>
      <div class="explanation">${esc(result.explanation||'')}</div>`;
  }

  box.innerHTML = `
    <div class="ai-sol-head">
      <div class="ai-sol-icon">✦</div>
      <span class="ai-sol-title">GỢI Ý AI</span>
      <button class="ai-sol-close" onclick="closeAISol(${idx})" title="Đóng">✕</button>
    </div>
    <div class="ai-sol-body">${bodyHtml}</div>`;
}

function showAIError(idx, msg) {
  let box = document.getElementById(`ai-sol-${idx}`);
  if (box) box.innerHTML = `
    <div class="ai-sol-head">
      <div class="ai-sol-icon" style="background:var(--red);">!</div>
      <span class="ai-sol-title" style="color:var(--red);">LỖI AI</span>
      <button class="ai-sol-close" onclick="closeAISol(${idx})">✕</button>
    </div>
    <div class="ai-sol-body"><div class="explanation" style="color:var(--red);">${esc(msg)}</div></div>`;
}

function closeAISol(idx) {
  const box = document.getElementById(`ai-sol-${idx}`);
  if (box) box.remove();
}

// ═══ SOLVE ALL ═══
async function solveAllQuestions() {
  if (!questions.length) return;
  const banner = document.getElementById('aiGlobalBanner');
  const fill = document.getElementById('aiGlobalFill');
  const textEl = document.getElementById('aiGlobalText');
  banner.classList.add('show');
  document.getElementById('solveAllBtn').disabled = true;

  for (let i = 0; i < questions.length; i++) {
    const pct = Math.round((i / questions.length) * 100);
    fill.style.width = pct + '%';
    textEl.innerHTML = `<strong style="color:var(--ai)">✦ AI đang giải...</strong> Câu ${i+1}/${questions.length}`;
    await solveQuestion(i);
    await new Promise(r => setTimeout(r, 200));
  }

  fill.style.width = '100%';
  textEl.innerHTML = `<strong style="color:var(--green)">✓ Hoàn tất!</strong> Đã giải ${questions.length} câu`;
  setTimeout(() => { banner.classList.remove('show'); fill.style.width = '0%'; }, 3000);
  document.getElementById('solveAllBtn').disabled = false;
}

// ═══ RENDER ═══
function filterBy(type, btn) {
  activeFilter=type;
  document.querySelectorAll('.filter-pill').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderAll();
}

function getQNum(vi) {
  const n=vi+1, s=docSettings.numStyle;
  if(s==='dot') return `${n}.`;
  if(s==='bracket') return `Q${n}`;
  return `Câu ${n}`;
}

function renderAll() {
  const list=document.getElementById('qList');
  const visible=questions.filter(q=>activeFilter==='all'||q.type===activeFilter);
  document.getElementById('toolbarCount').textContent=`${visible.length} câu`;
  if(!visible.length){
    list.innerHTML=`<div class="empty"><div class="empty-icon">🔍</div><h3>Không có câu</h3><p>Thử chọn bộ lọc khác</p></div>`;
    return;
  }
  list.innerHTML=visible.map((q,vi)=>buildCard(q,questions.indexOf(q),vi+1)).join('');
  // Re-render AI solutions
  Object.keys(aiSolutions).forEach(idx => {
    const iNum = parseInt(idx);
    if (aiSolutions[iNum] && questions[iNum]) {
      renderSolutionBox(iNum, aiSolutions[iNum], questions[iNum]);
    }
  });
  list.querySelectorAll('.q-card').forEach(card=>{
    const handle=card.querySelector('.drag-handle');
    if(!handle) return;
    handle.addEventListener('mousedown',()=>card.draggable=true);
    handle.addEventListener('mouseup',()=>card.draggable=false);
    card.addEventListener('dragstart',onDragStart);
    card.addEventListener('dragend',onDragEnd);
    card.addEventListener('dragover',onDragOver);
    card.addEventListener('drop',onDrop);
  });
}

function buildCard(q, idx, num) {
  const typeLabels={mcq:['Trắc nghiệm','mcq'],tf:['Đúng/Sai','tf'],short:['Khác','short']};
  const [tlabel,tcls]=typeLabels[q.type]||['?',''];
  const confHTML=q.confidence?`<span class="conf-badge conf-${q.confidence==='high'?'high':q.confidence==='mid'?'mid':'low'}">${q.confidence==='high'?'✓ Cao':q.confidence==='mid'?'~ Vừa':'⚠ Thấp'}</span>`:'';
  const hasSol = !!aiSolutions[idx];
  let body=`<div class="q-text" id="qt-${idx}" contenteditable="false">${esc(q.question||'(chưa có)')}</div>`;
  const ctxVal=q.context||'';
  body+=`<button class="ctx-toggle" onclick="toggleCtx(${idx})" id="ctxbtn-${idx}">${ctxVal?'📌 Ẩn tư liệu':'+ Thêm tư liệu'}</button>`;
  body+=`<textarea class="ctx-edit-area${ctxVal?' show':''}" id="ctxarea-${idx}" placeholder="Nhập đoạn văn / tư liệu...">${esc(ctxVal)}</textarea>`;
  if(ctxVal) body+=`<div class="ctx-block" id="ctxview-${idx}">${esc(ctxVal).replace(/\n/g,'<br>')}</div>`;
  if(q.type==='mcq')   body+=buildMCQBody(q,idx);
  if(q.type==='tf')    body+=buildTFBody(q,idx);
  if(q.type==='short') body+=`<div class="short-note" id="sn-${idx}" contenteditable="false">${esc(q.note||'')}</div>`;

  return `
<div class="q-card" id="card-${idx}" data-idx="${idx}">
  <div class="q-head">
    <span class="drag-handle" title="Kéo để sắp xếp">⠿</span>
    <span class="q-num">${getQNum(num-1)}</span>
    <span class="badge ${tcls}">${tlabel}</span>
    ${confHTML}
    ${hasSol ? '<span class="conf-badge conf-high" style="background:var(--ai-dim);color:var(--ai);">✦ Đã giải</span>' : ''}
    <select class="type-select" onchange="changeType(${idx},this.value)">
      <option value="mcq" ${q.type==='mcq'?'selected':''}>MCQ</option>
      <option value="tf"  ${q.type==='tf' ?'selected':''}>T/F</option>
      <option value="short" ${q.type==='short'?'selected':''}>Khác</option>
    </select>
    <div class="q-actions">
      <button class="act-btn ai-solve" id="ai-solve-btn-${idx}" onclick="solveQuestion(${idx})"><span>✦ AI Giải</span></button>
      <button class="act-btn edit-btn" onclick="toggleEdit(${idx})" id="editbtn-${idx}">✏️ Sửa</button>
      <button class="act-btn dup-btn" onclick="duplicateQ(${idx})" title="Nhân đôi">⎘ Copy</button>
      <button class="act-btn del" onclick="deleteQ(${idx})">✕ Xoá</button>
    </div>
  </div>
  <div class="q-body">${body}</div>
</div>`;
}

function buildMCQBody(q, idx) {
  const L=['A','B','C','D','E','F'];
  const cols=docSettings.optLayout==='1'?'1fr':docSettings.optLayout==='auto'?'repeat(auto-fit,minmax(200px,1fr))':'1fr 1fr';
  let html=`<div class="opts" style="grid-template-columns:${cols};">`;
  (q.options||[]).forEach((opt,i)=>{
    html+=`<div class="opt ${i===q.answer?'correct':''}" id="opt-${idx}-${i}">
      <span class="opt-letter">${L[i]}.</span>
      <span class="opt-text" id="opttext-${idx}-${i}" contenteditable="false">${esc(opt)}</span>
      ${i===q.answer?'<span class="opt-check">✓</span>':''}
      <button class="opt-del-btn" onclick="deleteOpt(${idx},${i})">✕</button>
    </div>`;
  });
  html+=`</div><button class="opt-add-btn" onclick="addOpt(${idx})">+ Thêm lựa chọn</button>`;
  html+=`<div class="ans-row"><span>Đáp án đúng:</span>
    <select onchange="setAnswer(${idx},parseInt(this.value))">
      ${(q.options||[]).map((_,i)=>`<option value="${i}" ${i===q.answer?'selected':''}>${L[i]}</option>`).join('')}
      <option value="-1" ${q.answer===-1?'selected':''}>Chưa xác định</option>
    </select>
    <span style="color:var(--green);font-weight:700;">${q.answer>=0?'→ '+L[q.answer]:''}</span>
  </div>`;
  return html;
}

function buildTFBody(q, idx) {
  let html=`<div class="tf-list">`;
  (q.statements||[]).forEach((s,si)=>{
    html+=`<div class="tf-item" id="tfi-${idx}-${si}">
      <span class="tf-drag">⠿</span>
      <span class="tf-item-text" id="tft-${idx}-${si}" contenteditable="false">${esc(s.text)}</span>
      <div class="tf-pill">
        <button class="tf-t ${s.answer===true?'sel':''}" onclick="setTFAnswer(${idx},${si},true)">✓ Đúng</button>
        <button class="tf-f ${s.answer===false?'sel':''}" onclick="setTFAnswer(${idx},${si},false)">✗ Sai</button>
      </div>
      <button class="tf-del" onclick="deleteTFItem(${idx},${si})">✕</button>
    </div>`;
  });
  html+=`</div><button class="opt-add-btn" onclick="addTFItem(${idx})" style="margin-top:6px;">+ Thêm ý</button>`;
  return html;
}

// ═══ DRAG REORDER ═══
function onDragStart(e){dragSrcIdx=parseInt(e.currentTarget.dataset.idx);e.currentTarget.classList.add('dragging');e.dataTransfer.effectAllowed='move';}
function onDragEnd(e){e.currentTarget.classList.remove('dragging');document.querySelectorAll('.q-card').forEach(c=>{c.classList.remove('drag-over');c.draggable=false;});}
function onDragOver(e){e.preventDefault();document.querySelectorAll('.q-card').forEach(c=>c.classList.remove('drag-over'));e.currentTarget.classList.add('drag-over');}
function onDrop(e){
  e.preventDefault();
  const t=parseInt(e.currentTarget.dataset.idx);
  if(dragSrcIdx===null||dragSrcIdx===t) return;
  const [r]=questions.splice(dragSrcIdx,1);
  questions.splice(t,0,r);
  // Remap AI solutions after reorder
  const newSol={};
  const lo=Math.min(dragSrcIdx,t), hi=Math.max(dragSrcIdx,t);
  Object.keys(aiSolutions).forEach(k=>{
    const ki=parseInt(k);
    if(ki===dragSrcIdx){ newSol[t]=aiSolutions[ki]; }
    else if(ki>=lo&&ki<=hi){ newSol[ki+(dragSrcIdx<t?-1:1)]=aiSolutions[ki]; }
    else{ newSol[ki]=aiSolutions[ki]; }
  });
  aiSolutions=newSol;
  dragSrcIdx=null;
  updateStats();
  renderAll();
}

// ═══ EDITING ═══
function toggleEdit(idx) {
  if(editingIdx!==null&&editingIdx!==idx) saveEdit(editingIdx);
  const el=document.getElementById(`qt-${idx}`);
  const btn=document.getElementById(`editbtn-${idx}`);
  const q=questions[idx];
  if(!el) return;
  const isEditing=el.contentEditable==='true';
  if(isEditing){
    saveEdit(idx);
    btn.innerHTML='✏️ Sửa';
    btn.classList.remove('save-q');
    editingIdx=null;
  } else {
    el.contentEditable='true';
    el.focus();
    if(q.type==='mcq')(q.options||[]).forEach((_,i)=>{const ot=document.getElementById(`opttext-${idx}-${i}`);if(ot)ot.contentEditable='true';});
    if(q.type==='tf')(q.statements||[]).forEach((_,si)=>{const tt=document.getElementById(`tft-${idx}-${si}`);if(tt)tt.contentEditable='true';});
    if(q.type==='short'){const sn=document.getElementById(`sn-${idx}`);if(sn)sn.contentEditable='true';}
    btn.innerHTML='💾 Lưu';
    btn.classList.add('save-q');
    editingIdx=idx;
  }
}

function saveEdit(idx) {
  const el=document.getElementById(`qt-${idx}`);
  const q=questions[idx];
  if(!el) return;
  el.contentEditable='false';
  q.question=el.textContent.trim();
  if(q.type==='mcq')(q.options||[]).forEach((_,i)=>{const ot=document.getElementById(`opttext-${idx}-${i}`);if(ot){ot.contentEditable='false';q.options[i]=ot.textContent.trim();}});
  if(q.type==='tf')(q.statements||[]).forEach((s,si)=>{const tt=document.getElementById(`tft-${idx}-${si}`);if(tt){tt.contentEditable='false';s.text=tt.textContent.trim();}});
  if(q.type==='short'){const sn=document.getElementById(`sn-${idx}`);if(sn){sn.contentEditable='false';q.note=sn.textContent.trim();}}
  const ca=document.getElementById(`ctxarea-${idx}`);
  if(ca) q.context=ca.value.trim()||null;
}

function toggleCtx(idx) {
  const area=document.getElementById(`ctxarea-${idx}`);
  const btn=document.getElementById(`ctxbtn-${idx}`);
  const view=document.getElementById(`ctxview-${idx}`);
  if(!area) return;
  area.classList.toggle('show');
  const isOpen=area.classList.contains('show');
  btn.textContent=isOpen ? '📌 Ẩn tư liệu' : '+ Thêm tư liệu';
  if(view) view.style.display=isOpen ? 'none' : '';
}

function setAnswer(idx, val) {
  questions[idx].answer=val;
  // Only update answer row label without full re-render
  const L=['A','B','C','D','E','F'];
  document.querySelectorAll(`#card-${idx} .opt`).forEach((el,i)=>{
    el.classList.toggle('correct',i===val);
    const ltr=el.querySelector('.opt-letter');
    if(ltr) ltr.style.color=(i===val)?'var(--green)':'';
    const ck=el.querySelector('.opt-check');
    if(ck) ck.remove();
    if(i===val){const c=document.createElement('span');c.className='opt-check';c.textContent='✓';el.appendChild(c);}
  });
  const label=document.querySelector(`#card-${idx} .ans-row span:last-child`);
  if(label) label.textContent=val>=0?'→ '+L[val]:'';
}

function setTFAnswer(idx, si, val) {
  questions[idx].statements[si].answer=val;
  const tfi=document.getElementById(`tfi-${idx}-${si}`);
  if(tfi){
    const btns=tfi.querySelectorAll('.tf-pill button');
    if(btns[0]) btns[0].classList.toggle('sel',val===true);
    if(btns[1]) btns[1].classList.toggle('sel',val===false);
  }
}

function changeType(idx, newType) {
  const q=questions[idx];
  q.type=newType;
  if(newType==='mcq'&&!q.options) q.options=['Đáp án A','Đáp án B','Đáp án C','Đáp án D'];
  if(newType==='mcq'&&q.answer===null) q.answer=-1;
  if(newType==='tf'&&!q.statements) q.statements=[{text:'a) Ý 1',answer:false},{text:'b) Ý 2',answer:true}];
  delete aiSolutions[idx];
  updateStats();
  renderAll();
}

function deleteQ(idx) { questions.splice(idx,1); delete aiSolutions[idx]; updateStats(); renderAll(); }
function duplicateQ(idx) { questions.splice(idx+1,0,JSON.parse(JSON.stringify(questions[idx]))); updateStats(); renderAll(); }

function addNewQuestion() {
  questions.push({type:'mcq',question:'Câu hỏi mới',context:null,options:['Đáp án A','Đáp án B','Đáp án C','Đáp án D'],answer:0,statements:null,note:null,confidence:'mid'});
  updateStats();
  renderAll();
  setTimeout(()=>document.getElementById('qList').lastElementChild?.scrollIntoView({behavior:'smooth',block:'center'}),50);
}

function addOpt(idx) { if(!questions[idx].options) questions[idx].options=[]; questions[idx].options.push('Đáp án mới'); renderAll(); }
function deleteOpt(idx, oi) { if(questions[idx].options.length<=2) return; questions[idx].options.splice(oi,1); if(questions[idx].answer>=questions[idx].options.length) questions[idx].answer=0; renderAll(); }
function addTFItem(idx) { if(!questions[idx].statements) questions[idx].statements=[]; const n=questions[idx].statements.length, letters='abcdefgh'; questions[idx].statements.push({text:`${letters[n]||n+1}) Ý mới`,answer:false}); renderAll(); }
function deleteTFItem(idx, si) { if(questions[idx].statements.length<=2) return; questions[idx].statements.splice(si,1); renderAll(); }
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ═══ PREVIEW MODAL ═══
function openPreview() {
  pvQuestions=questions.filter(q=>q.type==='mcq'||q.type==='tf');
  if(!pvQuestions.length){showStatus('⚠️ Cần có ít nhất 1 câu MCQ hoặc T/F để xem trước','err');return;}
  pvCur=0; pvAnswers={};
  document.getElementById('previewModal').classList.add('show');
  switchTab('quiz',document.querySelector('.mtab'));
}
function closePreview() { document.getElementById('previewModal').classList.remove('show'); }

function switchTab(tab, btn) {
  pvTab=tab;
  document.querySelectorAll('.mtab').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  document.getElementById('pvNav').style.display=(tab==='quiz')?'flex':'none';
  renderModalTab();
}
function renderModalTab() {
  const body=document.getElementById('modalBody');
  if(pvTab==='quiz') renderPvQuiz(body);
  else if(pvTab==='list') renderPvList(body);
  else renderPvRaw(body);
}

function renderPvQuiz(body) {
  document.getElementById('pvNav').style.display='flex';
  // Show score screen when past last question
  if(pvCur>=pvQuestions.length){
    let correct=0;
    pvQuestions.forEach((q,i)=>{
      if(q.type==='mcq'){
        if(pvAnswers[i]===q.answer) correct++;
      } else {
        if(pvAnswers[i]){
          let ok=true;
          q.statements.forEach((s,si)=>{ if(pvAnswers[i][si]!==s.answer) ok=false; });
          if(ok) correct++;
        }
      }
    });
    const pct=pvQuestions.length>0?Math.round(correct/pvQuestions.length*100):0;
    body.innerHTML=`<div class="pv-score-banner">
      <div class="pv-score-big">${pct}%</div>
      <div class="pv-score-sub">${correct}/${pvQuestions.length} câu đúng</div>
      <div style="margin-top:12px;font-size:1.2rem;">${pct>=90?'🌟 Xuất sắc':pct>=75?'🔥 Giỏi':pct>=60?'👍 Khá':pct>=40?'⚠️ Trung bình':'❌ Cần ôn thêm'}</div>
      <button class="pv-nav-btn primary" style="margin-top:16px;" onclick="pvRestart()">🔄 Làm lại</button>
    </div>`;
    document.getElementById('pvPrev').disabled=true;
    document.getElementById('pvNext').style.display='none';
    return;
  }

  const q=pvQuestions[pvCur];
  const L=['A','B','C','D','E','F'];
  let html=`<div class="quiz-preview-wrap">`;
  html+=`<span class="pv-num">${getQNum(pvCur)}</span><span class="pv-type ${q.type}">${q.type==='mcq'?'Trắc nghiệm':'Đúng/Sai'}</span>`;
  if(q.context) html+=`<div class="pv-ctx">${esc(q.context).replace(/\n/g,'<br>')}</div>`;
  html+=`<div class="pv-q">${esc(q.question)}</div>`;

  const userAns=pvAnswers[pvCur];
  const answered=q.type==='mcq'
    ? userAns!==undefined
    : (userAns && Object.keys(userAns).length===q.statements.length);

  if(q.type==='mcq'){
    html+=`<div class="pv-opts">`;
    (q.options||[]).forEach((opt,i)=>{
      let cls='';
      if(answered){ if(i===q.answer) cls='correct'; else if(i===userAns) cls='wrong'; }
      html+=`<div class="pv-opt ${cls}${answered?' answered':''}" onclick="${answered?'':'pvAnswer('+pvCur+','+i+')'}" style="${answered?'cursor:default;':''}">
        <span class="pv-opt-l">${L[i]}.</span>${esc(opt)}
      </div>`;
    });
    html+=`</div>`;
    if(answered){
      const ok=userAns===q.answer;
      html+=`<div class="pv-feedback ${ok?'ok':'wrong'}">${ok?'✓ Đúng rồi!':'✗ Sai. Đáp án đúng: '+L[q.answer]+'. '+esc(q.options[q.answer])}</div>`;
    }
  } else {
    (q.statements||[]).forEach((s,si)=>{
      const ua=userAns?userAns[si]:undefined;
      const stAnswered=ua!==undefined;
      let itemStyle='';
      if(stAnswered) itemStyle=ua===s.answer?'border-color:rgba(34,197,94,.4);background:var(--green-dim);':'border-color:rgba(239,68,68,.3);background:var(--red-dim);';
      html+=`<div class="pv-tf-item" style="${itemStyle}">
        <span style="flex:1;font-size:.87rem;">${esc(s.text)}</span>
        <div class="pv-tf-btns">
          <button class="pv-tf-t ${ua===true?'sel':''}" onclick="pvAnswerTF(${pvCur},${si},true)" ${stAnswered?'disabled':''}>✓ Đúng</button>
          <button class="pv-tf-f ${ua===false?'sel':''}" onclick="pvAnswerTF(${pvCur},${si},false)" ${stAnswered?'disabled':''}>✗ Sai</button>
        </div>
        ${stAnswered?`<span style="font-size:.75rem;font-weight:800;color:${ua===s.answer?'var(--green)':'var(--red)'};">${ua===s.answer?'✓':('✗ '+(s.answer?'Đúng':'Sai'))}</span>`:''}
      </div>`;
    });
  }
  html+=`</div>`;
  body.innerHTML=html;

  document.getElementById('pvProgBar').style.width=((pvCur+1)/pvQuestions.length*100)+'%';
  document.getElementById('pvCounter').textContent=`${pvCur+1}/${pvQuestions.length}`;
  document.getElementById('pvPrev').disabled=pvCur===0;
  const nextBtn=document.getElementById('pvNext');
  nextBtn.style.display='';
  nextBtn.textContent=pvCur===pvQuestions.length-1?'Xem kết quả →':'Tiếp →';
}

function renderPvList(body) {
  const L=['A','B','C','D','E','F'];
  let html='<div style="padding:16px 20px;">';
  pvQuestions.forEach((q,i)=>{
    html+=`<div class="pv-card"><span class="pv-num">${getQNum(i)}</span><span class="pv-type ${q.type}" style="margin-left:4px;">${q.type==='mcq'?'MCQ':'T/F'}</span><div class="pv-q" style="margin-top:8px;">${esc(q.question)}</div>`;
    if(q.context) html+=`<div class="pv-ctx">${esc(q.context).replace(/\n/g,'<br>')}</div>`;
    if(q.type==='mcq'){
      html+='<div style="display:flex;flex-direction:column;gap:5px;margin-top:8px;">';
      (q.options||[]).forEach((opt,oi)=>{
        html+=`<div style="padding:7px 12px;border-radius:var(--r);border:1px solid ${oi===q.answer?'rgba(34,197,94,.4)':'var(--line)'};background:${oi===q.answer?'var(--green-dim)':'var(--bg)'};font-size:.85rem;display:flex;gap:7px;align-items:flex-start;">
          <span style="font-weight:700;color:${oi===q.answer?'var(--green)':'var(--ink2)'};">${L[oi]}.</span>${esc(opt)}${oi===q.answer?'<span style="margin-left:auto;color:var(--green);font-size:.78rem;font-weight:800;">✓ ĐÁP ÁN</span>':''}
        </div>`;
      });
      html+='</div>';
    } else {
      html+='<div style="display:flex;flex-direction:column;gap:5px;margin-top:8px;">';
      (q.statements||[]).forEach(s=>{
        html+=`<div style="padding:7px 12px;border-radius:var(--r);border:1px solid var(--line);background:var(--bg);font-size:.85rem;display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <span>${esc(s.text)}</span>
          <span style="font-weight:800;padding:3px 9px;border-radius:12px;font-size:.74rem;background:${s.answer?'var(--green-dim)':'var(--red-dim)'};color:${s.answer?'var(--green)':'var(--red)'};">${s.answer?'ĐÚNG':'SAI'}</span>
        </div>`;
      });
      html+='</div>';
    }
    html+='</div>';
  });
  html+='</div>';
  body.innerHTML=html;
}

function renderPvRaw(body) {
  if(!rawText){body.innerHTML='<div style="padding:20px;color:var(--ink2);font-size:.85rem;">Chưa có file gốc</div>';return;}
  const lines=rawText.split('\n');
  const Q_RE=/^(câu\s*\d+|question\s*\d+|\d{1,3}[\.\)]\s+\S)/i;
  const MCQ_RE=/^(?:\*\*)*[A-D](?:\*\*)*\s*[\.\)]\s*.+/i;
  const ANS_RE=/(?:đáp\s*án|answer|key)\s*[:.\-]?\s*[A-D]/i;
  const TF_RE=/^(?:\*\*)*[a-d](?:\*\*)*\s*[\)\.](.+)/i;
  let html='<div class="raw-text-view">';
  for(const l of lines){
    const lt=l.trim();
    if(!lt){html+='\n';continue;}
    let cls='';
    if(Q_RE.test(lt)) cls='raw-line-q';
    else if(MCQ_RE.test(lt)) cls='raw-line-opt';
    else if(ANS_RE.test(lt)) cls='raw-line-ans';
    else if(TF_RE.test(lt)) cls='raw-line-tf';
    html+=cls?`<span class="${cls}">${esc(l)}\n</span>`:esc(l)+'\n';
  }
  html+='</div>';
  body.innerHTML=html;
}

function pvAnswer(qi, oi) { pvAnswers[qi]=oi; renderPvQuiz(document.getElementById('modalBody')); }
function pvAnswerTF(qi, si, val) { if(!pvAnswers[qi]) pvAnswers[qi]={}; pvAnswers[qi][si]=val; renderPvQuiz(document.getElementById('modalBody')); }
function pvNext() { pvCur=Math.min(pvCur+1, pvQuestions.length); renderPvQuiz(document.getElementById('modalBody')); }
function pvPrev() { if(pvCur>0){ pvCur--; renderPvQuiz(document.getElementById('modalBody')); } }
function pvRestart() { pvCur=0; pvAnswers={}; renderPvQuiz(document.getElementById('modalBody')); }

document.getElementById('previewModal').addEventListener('click',function(e){ if(e.target===this) closePreview(); });

// ═══ EXPORT ═══
function exportJSON() {
  if(editingIdx!==null) saveEdit(editingIdx);
  const title=document.getElementById('quizTitle').value.trim()||'quiz';
  const blob=new Blob([JSON.stringify(questions,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=title+'_questions.json';a.click();
  URL.revokeObjectURL(url);
}

function exportQuiz() {
  if(!questions.length) return;
  if(editingIdx!==null) saveEdit(editingIdx);
  const title=document.getElementById('quizTitle').value.trim()||'Ôn Tập';
  const timeSec=(parseInt(document.getElementById('quizTime').value)||60)*60;
  const exportQ=questions.filter(q=>q.type==='mcq'||q.type==='tf');
  if(!exportQ.length){showStatus('⚠️ Không có MCQ/T-F để xuất','err');return;}
  const blob=new Blob([buildQuizHTML(exportQ,title,timeSec)],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=title.replace(/\s+/g,'_')+'_quiz.html';a.click();
  URL.revokeObjectURL(url);
  showStatus(`✅ Xuất ${exportQ.length} câu`,'ok');
}

function buildQuizHTML(data, title, timeLeft) {
  const mcqN=data.filter(q=>q.type==='mcq').length;
  const tfN=data.filter(q=>q.type==='tf').length;
  const mins=Math.round(timeLeft/60);
  const json=JSON.stringify(data);
  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--p:#f97316;--bg:#0f1117;--bg2:#161922;--s:#1e2230;--t:#f0f0f5;--t2:#9ba3c0;--b:#2a3050;--ok:#22c55e;--err:#ef4444;--r:10px;--f:'Nunito',sans-serif;--fd:'Syne',sans-serif;}
*{margin:0;padding:0;box-sizing:border-box;}body{font-family:var(--f);background:var(--bg);color:var(--t);padding:0;}
.sc{display:none;padding:16px;}.sc.on{display:block;}
.card{max-width:700px;margin:0 auto;background:var(--s);border-radius:16px;border:1px solid var(--b);padding:28px;box-shadow:0 8px 40px rgba(0,0,0,.5);}
h1.big{font-size:1.8rem;font-weight:800;text-align:center;color:var(--p);margin-bottom:6px;font-family:var(--fd);}
.sub{text-align:center;color:var(--t2);margin-bottom:20px;font-size:.88rem;}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:14px 0 20px;}
.box{background:var(--bg);border:1px solid var(--b);padding:14px;border-radius:10px;text-align:center;}
.box .n{font-size:1.6rem;font-weight:800;color:var(--p);font-family:var(--fd);}
.btn{border:none;cursor:pointer;padding:12px 16px;border-radius:10px;font-weight:700;transition:.15s;font-family:var(--fd);font-size:.9rem;}
.btn:hover{transform:translateY(-1px);}
.bp{background:var(--p);color:#fff;box-shadow:0 4px 14px rgba(249,115,22,.35);}
.bs{background:var(--bg);color:var(--t);border:1px solid var(--b);}
.bg{background:var(--ok);color:#fff;box-shadow:0 4px 14px rgba(34,197,94,.3);}
.prog{height:5px;background:var(--b);border-radius:999px;overflow:hidden;margin-bottom:12px;}
.prog div{height:100%;background:var(--p);width:0%;transition:.3s;}
.hdr{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;font-weight:600;font-size:.86rem;color:var(--t2);}
.qtext{font-size:1rem;font-weight:600;line-height:1.7;margin-bottom:14px;}
.ctx{padding:10px 14px;background:rgba(245,158,11,.08);border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;margin-bottom:14px;font-size:.86rem;line-height:1.75;font-style:italic;color:#f59e0b;}
.opt{width:100%;text-align:left;padding:12px 14px;border-radius:10px;border:1px solid var(--b);background:var(--bg);margin-bottom:8px;cursor:pointer;font-size:.9rem;transition:.2s;color:var(--t);font-family:var(--f);}
.opt:hover{border-color:var(--p);}.opt.ok{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.4);font-weight:600;}.opt.no{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3);}
.nav{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;}.nav .btn{flex:1;}
.quick{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0;}
.quick button{width:34px;height:34px;border-radius:7px;border:1px solid var(--b);background:var(--bg);font-weight:700;cursor:pointer;font-size:.78rem;transition:.15s;color:var(--t);}
.rev{padding:12px 14px;border-radius:10px;margin-bottom:10px;border-left:4px solid var(--b);background:var(--bg2);}
.rev.c{border-color:var(--ok);background:rgba(34,197,94,.06);}.rev.w{border-color:var(--err);background:rgba(239,68,68,.05);}
.rbar{height:10px;background:var(--b);border-radius:999px;overflow:hidden;margin:14px 0;}
.rbar div{height:100%;background:var(--p);width:0%;transition:.6s;}
.mc{padding:14px;border-radius:10px;border:1px solid var(--b);text-align:center;cursor:pointer;transition:.2s;background:var(--bg);}
.mc.sel{border-color:var(--p);background:rgba(249,115,22,.08);}
.mc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:14px 0;}
.tfs{border:1px solid var(--b);border-radius:10px;padding:12px 14px;margin-bottom:8px;transition:.2s;background:var(--bg);}
.tft{font-weight:600;line-height:1.6;margin-bottom:8px;font-size:.9rem;}
.tfr{display:flex;gap:8px;}
.tfb{flex:1;padding:8px;border-radius:8px;border:1px solid var(--b);background:var(--bg);font-weight:700;cursor:pointer;font-size:.84rem;color:var(--t);transition:.15s;font-family:var(--f);}
.tfb:hover:not(:disabled){transform:translateY(-1px);}
.tfb.st{background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.4);color:var(--ok);}
.tfb.sf{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3);color:var(--err);}
.tfb:disabled{opacity:.7;cursor:default;transform:none;}
.tfs.ac{border-color:rgba(34,197,94,.4);background:rgba(34,197,94,.06);}.tfs.aw{border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.04);}
.hint{margin-top:6px;font-size:.8rem;font-weight:700;}
</style></head><body>
<div id="sw" class="sc on"><div class="card">
<h1 class="big">📚 ${title}</h1><p class="sub">Hệ thống luyện đề thi</p>
<div class="grid">
<div class="box"><div class="n">${data.length}</div>Tổng câu</div>
<div class="box"><div class="n">${mcqN}</div>Trắc nghiệm</div>
<div class="box"><div class="n">${tfN}</div>Đúng/Sai</div>
<div class="box"><div class="n">${mins}'</div>Thời gian</div>
</div>
<button class="btn bp" style="width:100%" onclick="go('sm')">Bắt đầu →</button>
</div></div>
<div id="sm" class="sc"><div class="card">
<h1 class="big">⚙️ Chế độ làm bài</h1>
<div class="mc-grid">
<div class="mc sel" data-m="both" onclick="pm(this)"><h3>Tất cả</h3><p>${data.length} câu</p></div>
${mcqN?`<div class="mc" data-m="mcq" onclick="pm(this)"><h3>Trắc nghiệm</h3><p>${mcqN} câu</p></div>`:''}
${tfN?`<div class="mc" data-m="tf" onclick="pm(this)"><h3>Đúng/Sai</h3><p>${tfN} câu</p></div>`:''}
</div>
<div style="margin:10px 0"><label style="font-size:.8rem;font-weight:700;color:var(--t2);">Thứ tự câu hỏi</label>
<select id="ord" style="width:100%;padding:10px;border-radius:8px;margin-top:6px;font-family:var(--f);border:1px solid var(--b);outline:none;background:var(--bg);color:var(--t);"><option value="mix">Ngẫu nhiên</option><option value="seq">Tuần tự</option></select></div>
<div class="nav"><button class="btn bs" onclick="go('sw')">Quay lại</button><button class="btn bp" onclick="start()">Làm bài</button></div></div></div>
<div id="sq" class="sc"><div class="card">
<div class="prog"><div id="bar"></div></div>
<div class="hdr"><span id="pt"></span><span id="tm">--:--</span><span id="sc2">0đ</span></div>
<div class="quick" id="qk"></div>
<div class="qtext" id="qt"></div>
<div id="qc"></div><div id="qo"></div>
<div class="nav"><button class="btn bs" onclick="prev()">← Trước</button><button class="btn bp" onclick="next()">Tiếp →</button></div>
</div></div>
<div id="sr" class="sc"><div class="card">
<h1 class="big">🎯 Kết quả</h1>
<h1 id="fs" style="text-align:center;font-size:3rem;margin:16px 0;color:var(--p);font-family:var(--fd)">0%</h1>
<div class="grid">
<div class="box"><div class="n" id="rc">0</div>Đúng</div>
<div class="box"><div class="n" id="wc">0</div>Sai</div>
<div class="box"><div class="n" id="sk">0</div>Bỏ qua</div>
</div>
<div class="rbar"><div id="rf"></div></div>
<h2 id="rk" style="text-align:center;margin-top:10px;font-size:1.1rem;"></h2>
<div class="nav"><button class="btn bs" onclick="bRev();go('sv')">Xem đáp án</button><button class="btn bg" onclick="go('sm')">Làm lại</button></div></div></div>
<div id="sv" class="sc"><div class="card">
<h1 class="big">🔍 Đáp án chi tiết</h1>
<div id="rl"></div>
<div class="nav"><button class="btn bp" onclick="go('sr')">Quay lại</button></div>
</div></div>
<script>
const D=${json};
let mode='both',qs=[],cur=0,ans=[],sc=0,tmr,tl=${timeLeft};
function go(id){document.querySelectorAll('.sc').forEach(s=>s.classList.remove('on'));document.getElementById(id).classList.add('on');scrollTo(0,0);}
function pm(el){document.querySelectorAll('.mc').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');mode=el.dataset.m;}
function sh(a){for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function shM(q){
  if(q.type!=='mcq') return q;
  const m=q.options.map((t,i)=>({t,i}));
  sh(m);
  q.options=m.map(x=>x.t);
  if(q.answer>=0) q.answer=m.findIndex(x=>x.i===q.answer);
  return q;
}
function start(){
  qs=D.filter(q=>mode==='both'||q.type===mode);
  if(document.getElementById('ord').value==='mix') sh(qs);
  qs=qs.map(q=>shM(JSON.parse(JSON.stringify(q))));
  cur=0;sc=0;ans=new Array(qs.length).fill(null);tl=${timeLeft};
  clearInterval(tmr);
  tmr=setInterval(()=>{
    tl--;
    document.getElementById('tm').textContent='⏱ '+String(0|tl/60).padStart(2,'0')+':'+String(tl%60).padStart(2,'0');
    if(tl<=0) showR();
  },1000);
  go('sq');render();
}
function render(){
  const q=qs[cur];
  document.getElementById('bar').style.width=((cur+1)/qs.length*100)+'%';
  document.getElementById('pt').textContent='Câu '+(cur+1)+'/'+qs.length;
  document.getElementById('sc2').textContent=sc+'đ';
  document.getElementById('qt').textContent=q.question;
  const cx=document.getElementById('qc');
  cx.innerHTML='';
  if(q.context) cx.innerHTML='<div class="ctx">'+q.context.replace(/\\n/g,'<br>')+'</div>';
  const ob=document.getElementById('qo');
  ob.innerHTML='';
  q.type==='mcq'?rMCQ(q,ob):rTF(q,ob);
  bQk();
}
function rMCQ(q,b){
  const L='ABCD';
  q.options.forEach((o,i)=>{
    const btn=document.createElement('button');
    btn.className='opt';
    btn.textContent=L[i]+'. '+o;
    if(ans[cur]!==null){
      btn.disabled=true;
      if(i===q.answer) btn.classList.add('ok');
      if(i===ans[cur]&&i!==q.answer) btn.classList.add('no');
    }
    btn.onclick=()=>{if(ans[cur]!==null)return;ans[cur]=i;if(i===q.answer)sc++;render();};
    b.appendChild(btn);
  });
}
function rTF(q,b){
  const ca=ans[cur]||{},tot=q.statements.length,all=Object.keys(ca).length===tot;
  q.statements.forEach((s,i)=>{
    const w=document.createElement('div');
    w.className='tfs';
    if(all) w.classList.add(ca[i]===s.answer?'ac':'aw');
    const t=document.createElement('div');t.className='tft';t.textContent=s.text;w.appendChild(t);
    const r=document.createElement('div');r.className='tfr';
    const tb=document.createElement('button');tb.className='tfb';tb.textContent='\\u2713 Đúng';
    const fb=document.createElement('button');fb.className='tfb';fb.textContent='\\u2717 Sai';
    if(ca[i]!==undefined){
      tb.disabled=fb.disabled=true;
      if(ca[i]) tb.classList.add('st'); else fb.classList.add('sf');
    }
    tb.onclick=()=>aTF(i,true);fb.onclick=()=>aTF(i,false);
    r.appendChild(tb);r.appendChild(fb);w.appendChild(r);
    if(all){
      const h=document.createElement('div');h.className='hint';
      const ok=ca[i]===s.answer;
      h.style.color=ok?'#22c55e':'#ef4444';
      h.textContent=ok?'\\u2713 Đáp án: '+(s.answer?'Đúng':'Sai'):'\\u2717 Đáp án đúng: '+(s.answer?'Đúng':'Sai');
      w.appendChild(h);
    }
    b.appendChild(w);
  });
  const pg=document.createElement('div');
  pg.style.cssText='margin-top:8px;padding:6px 10px;background:rgba(255,255,255,.05);border-radius:8px;font-size:.8rem;color:#9ba3c0;font-weight:600;';
  pg.textContent=Object.keys(ca).length===tot?'\\u2705 Đã hoàn thành':'Đã trả lời '+Object.keys(ca).length+'/'+tot+' ý';
  b.appendChild(pg);
}
function aTF(idx,v){
  const q=qs[cur];
  if(ans[cur]===null) ans[cur]={};
  if(ans[cur][idx]!==undefined) return;
  ans[cur][idx]=v;
  if(Object.keys(ans[cur]).length===q.statements.length){
    let ok=true;
    q.statements.forEach((s,i)=>{if(ans[cur][i]!==s.answer)ok=false;});
    if(ok) sc++;
    document.getElementById('sc2').textContent=sc+'đ';
  }
  render();
}
function next(){cur<qs.length-1?(cur++,render()):showR();}
function prev(){cur>0&&(cur--,render());}
function bQk(){
  const qk=document.getElementById('qk');
  qk.innerHTML='';
  qs.forEach((x,i)=>{
    const b=document.createElement('button');
    b.textContent=i+1;
    if(i===cur) b.style.outline='2px solid #f97316';
    const done=x.type==='mcq'?ans[i]!==null:(ans[i]&&Object.keys(ans[i]).length===x.statements.length);
    if(done) b.style.background='rgba(34,197,94,.12)';
    b.onclick=()=>{cur=i;render();};
    qk.appendChild(b);
  });
}
function showR(){
  clearInterval(tmr);
  let c=0,w=0,sk=0;
  qs.forEach((q,i)=>{
    if(q.type==='mcq'){
      if(ans[i]===null){sk++;return;}
      ans[i]===q.answer?c++:w++;
    } else {
      if(!ans[i]||!Object.keys(ans[i]).length){sk++;return;}
      let ok=true;
      q.statements.forEach((s,si)=>{if(ans[i][si]!==s.answer)ok=false;});
      ok?c++:w++;
    }
  });
  const p=Math.round(c/qs.length*100);
  document.getElementById('fs').textContent=p+'%';
  document.getElementById('rc').textContent=c;
  document.getElementById('wc').textContent=w;
  document.getElementById('sk').textContent=sk;
  document.getElementById('rf').style.width=p+'%';
  document.getElementById('rk').textContent=p>=90?'\\uD83C\\uDF1F Xuất sắc':p>=75?'\\uD83D\\uDD25 Giỏi':p>=60?'\\uD83D\\uDC4D Khá':p>=40?'\\u26A0\\uFE0F Trung bình':'\\u274C Cần ôn thêm';
  go('sr');
}
function bRev(){
  const rl=document.getElementById('rl');
  rl.innerHTML='';
  const L='ABCD';
  qs.forEach((q,i)=>{
    const d=document.createElement('div');
    let ok=false;
    if(q.type==='mcq'){
      ok=ans[i]===q.answer;
    } else {
      if(ans[i]&&Object.keys(ans[i]).length>0){
        ok=true;
        q.statements.forEach((s,si)=>{if(ans[i][si]!==s.answer)ok=false;});
      }
    }
    d.className='rev '+(ok?'c':'w');
    let h='<p style="font-weight:700;margin-bottom:8px;">'+(i+1)+'. '+q.question+'</p>';
    if(q.type==='mcq'){
      h+='<p style="color:var(--t2)"><b>Bạn chọn:</b> '+(ans[i]!=null?L[ans[i]]+'. '+q.options[ans[i]]:'Chưa trả lời')+'</p>';
      h+='<p style="color:var(--ok)"><b>Đáp án đúng:</b> '+(q.answer>=0?L[q.answer]+'. '+q.options[q.answer]:'Chưa xác định')+'</p>';
    } else {
      q.statements.forEach((s,si)=>{
        const uA=ans[i]?ans[i][si]:undefined;
        const ck=uA===s.answer;
        h+='<p style="margin-top:5px;">'+s.text+' \\u2192 <b style="color:'+(ck?'#22c55e':'#ef4444')+'">'+
          (s.answer?'Đúng':'Sai')+(uA!==undefined?' | Bạn: '+(uA?'Đúng':'Sai'):' | Chưa TL')+'</b></p>';
      });
    }
    d.innerHTML=h;
    rl.appendChild(d);
  });
}
<\/script>
</body></html>`;
}

    Object.assign(window, {
        addNewQuestion: addNewQuestion,
        applyDocSettings: applyDocSettings,
        applyFixes: applyFixes,
        autoFix: autoFix,
        closePreview: closePreview,
        dismissFix: dismissFix,
        exportJSON: exportJSON,
        exportQuiz: exportQuiz,
        filterBy: filterBy,
        handleFile: handleFile,
        openPreview: openPreview,
        pvNext: pvNext,
        pvPrev: pvPrev,
        solveAllQuestions: solveAllQuestions,
        switchTab: switchTab,
        toggleSettings: toggleSettings,
        triggerParse: triggerParse
    });
  },



  };

  const initializePage = pageInitializers[document.body.id];
  if (initializePage) initializePage();
})();
