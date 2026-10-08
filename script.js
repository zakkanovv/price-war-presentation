/* ============================================================
   MARKETING MANAGEMENT — Presentation Script (final)
   ============================================================ */
(function () {
  'use strict';

  function refreshIcons() {
    if (window.lucide && typeof lucide.createIcons === 'function') {
      try { lucide.createIcons(); } catch (e) {}
    }
  }

  const deck = document.getElementById('deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const progressFill = document.getElementById('progressFill');
  const currentSlideEl = document.getElementById('currentSlide');
  const totalSlidesEl = document.getElementById('totalSlides');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const toTopBtn = document.getElementById('toTopBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const themeBtn = document.getElementById('themeBtn');
  const printBtn = document.getElementById('printBtn');
  const presenterBtn = document.getElementById('presenterBtn');
  const helpBtn = document.getElementById('helpBtn');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarNav = document.getElementById('sidebarNav');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const helpOverlay = document.getElementById('helpOverlay');
  const helpClose = document.getElementById('helpClose');
  const infoModal = document.getElementById('infoModal');
  const infoBody = document.getElementById('infoBody');
  const infoClose = document.getElementById('infoClose');
  const dotsWrap = document.getElementById('controlsDots');
  const navLinks = Array.from(document.querySelectorAll('.topnav__link'));

  const total = slides.length;
  totalSlidesEl.textContent = String(total).padStart(2, '0');

  let current = 0;
  let lastHashIndex = -1;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';

  const sectionColors = {
    cover: 'linear-gradient(90deg, var(--green-500), var(--green-700) 60%, var(--accent))',
    t1:    'linear-gradient(90deg, var(--green-500), var(--green-700))',
    t2:    'linear-gradient(90deg, var(--navy-700), var(--navy-800))',
    t3:    'linear-gradient(90deg, var(--accent), #e06a4e)',
    final: 'linear-gradient(90deg, var(--green-700), var(--navy-900))'
  };

  let infoData = {};
  try {
    const raw = document.getElementById('infoData');
    if (raw) infoData = JSON.parse(raw.textContent);
  } catch (e) { infoData = {}; }

  /* ---------- Sidebar ---------- */
  const sectionLabels = { cover: 'Обложка', t1: 'Task 01 · Price War', t2: 'Task 02 · Promotion', t3: 'Task 03 · ROI', final: 'Финал' };
  let lastSection = null;
  slides.forEach((s, i) => {
    const section = s.dataset.section || 'cover';
    if (section !== lastSection) {
      const heading = document.createElement('div');
      heading.className = 'sidebar__group';
      heading.textContent = sectionLabels[section] || section;
      sidebarNav.appendChild(heading);
      lastSection = section;
    }
    const titleEl = s.querySelector('.slide__title, .divider__title, .cover__title, .final__title, .verdict__title, .decision__title, .custjourney__title, .comm__headline');
    const title = titleEl ? titleEl.textContent : ('Слайд ' + (i + 1));
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'sidebar__item';
    item.innerHTML = '<span class="sidebar__item-num">' + String(i + 1).padStart(2, '0') + '</span><span class="sidebar__item-title">' + title.replace(/\s+/g, ' ').trim().slice(0, 60) + '</span>';
    item.addEventListener('click', () => { goToSlide(i); closeSidebar(); });
    sidebarNav.appendChild(item);
  });

  function openSidebar() { sidebar.classList.add('is-open'); sidebarBackdrop.classList.add('is-open'); sidebar.setAttribute('aria-hidden', 'false'); }
  function closeSidebar() { sidebar.classList.remove('is-open'); sidebarBackdrop.classList.remove('is-open'); sidebar.setAttribute('aria-hidden', 'true'); }
  menuBtn && menuBtn.addEventListener('click', openSidebar);
  sidebarClose && sidebarClose.addEventListener('click', closeSidebar);
  sidebarBackdrop && sidebarBackdrop.addEventListener('click', closeSidebar);

  /* ---------- Help ---------- */
  function openHelp() { helpOverlay.classList.add('is-open'); }
  function closeHelp() { helpOverlay.classList.remove('is-open'); }
  helpBtn && helpBtn.addEventListener('click', openHelp);
  helpClose && helpClose.addEventListener('click', closeHelp);
  helpOverlay && helpOverlay.addEventListener('click', (e) => { if (e.target === helpOverlay) closeHelp(); });

  /* ---------- Info modal ---------- */
  document.querySelectorAll('[data-info]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.info;
      const data = infoData[key];
      if (!data) return;
      infoBody.innerHTML = '<h2>' + data.title + '</h2>' + data.body;
      infoModal.classList.add('is-open');
    });
  });
  function closeInfo() { infoModal.classList.remove('is-open'); }
  infoClose && infoClose.addEventListener('click', closeInfo);
  infoModal && infoModal.addEventListener('click', (e) => { if (e.target === infoModal) closeInfo(); });

  /* ---------- Theme ---------- */
  const themeKey = 'mm-theme';
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeBtn) {
      themeBtn.innerHTML = '<i data-lucide="' + (theme === 'dark' ? 'sun' : 'moon') + '"></i>';
      refreshIcons();
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0f1a17' : '#17483a');
  }
  const savedTheme = localStorage.getItem(themeKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  themeBtn && themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(themeKey, next);
  });

  /* ---------- Print ---------- */
  printBtn && printBtn.addEventListener('click', () => window.print());

  /* ---------- Presenter view ---------- */
  let presenterWindow = null;
  let presenterChannel = null;
  if ('BroadcastChannel' in window) presenterChannel = new BroadcastChannel('mm-presenter');

  function openPresenterView() {
    if (presenterWindow && !presenterWindow.closed) { presenterWindow.focus(); return; }
    const notesList = slides.map((s, i) => {
      const titleEl = s.querySelector('.slide__title, .divider__title, .cover__title, .final__title, .verdict__title, .decision__title, .custjourney__title, .comm__headline');
      return {
        idx: i,
        title: titleEl ? titleEl.textContent : 'Слайд ' + (i + 1),
        notes: s.dataset.notes || '',
        section: s.dataset.section
      };
    });
    const html = '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Режим докладчика</title><style>' +
      'body{font-family:-apple-system,system-ui,sans-serif;margin:0;background:#0d1412;color:#e8f0ec;padding:22px;min-height:100vh;box-sizing:border-box;display:flex;flex-direction:column;gap:18px}' +
      'h1{font-size:16px;margin:0;color:#8fc4a9;letter-spacing:.1em;text-transform:uppercase}' +
      '.timer{font-family:ui-monospace,monospace;font-size:60px;font-weight:700;letter-spacing:-.02em;color:#fff;text-align:center}' +
      '.timer.over{color:#e8873a}' +
      '.cur{background:#173029;border-radius:16px;padding:22px;flex:1;display:flex;flex-direction:column;gap:10px}' +
      '.cur h2{margin:0;font-size:26px}' +
      '.cur .num{color:#8fc4a9;font-size:13px;letter-spacing:.15em}' +
      '.cur .notes{font-size:17px;line-height:1.6;color:#c5d6ce;white-space:pre-wrap}' +
      '.next{background:#1a1f1e;border-radius:16px;padding:18px}' +
      '.next h3{margin:0 0 6px;font-size:12px;color:#8fc4a9;letter-spacing:.1em;text-transform:uppercase}' +
      '.next p{margin:0;font-size:15px;color:#8a9992}' +
      '.btns{display:flex;gap:8px}' +
      '.btns button{flex:1;padding:12px;border-radius:10px;border:1px solid #2a3833;background:#173029;color:#e8f0ec;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}' +
      '.btns button:hover{background:#1e4235}' +
      '</style></head><body>' +
      '<h1>Presenter View</h1>' +
      '<div class="timer" id="timer">00:00</div>' +
      '<div class="cur"><span class="num" id="curNum">01 / ' + String(total).padStart(2, '0') + '</span><h2 id="curTitle">—</h2><p class="notes" id="curNotes">—</p></div>' +
      '<div class="next"><h3>Следующий</h3><p id="nextTitle">—</p></div>' +
      '<div class="btns"><button id="startTimer">▶ Старт</button><button id="resetTimer">↺ Сброс</button><button id="closeWin">Закрыть</button></div>' +
      '<script>' +
      'var notes=' + JSON.stringify(notesList) + ';' +
      'var ch = "BroadcastChannel" in window ? new BroadcastChannel("mm-presenter") : null;' +
      'var startTime=0, elapsed=0, running=false, timerInt=null;' +
      'var tEl=document.getElementById("timer");' +
      'function fmt(s){var m=Math.floor(s/60);var ss=s%60;return (m<10?"0":"")+m+":"+(ss<10?"0":"")+ss;}' +
      'function tick(){if(running){elapsed=Math.floor((Date.now()-startTime)/1000);var over=elapsed>30*60;tEl.textContent=fmt(elapsed);tEl.classList.toggle("over",over);}}' +
      'document.getElementById("startTimer").onclick=function(){if(running){running=false;this.textContent="▶ Старт";clearInterval(timerInt);}else{running=true;this.textContent="⏸ Пауза";startTime=Date.now()-elapsed*1000;timerInt=setInterval(tick,250);}};' +
      'document.getElementById("resetTimer").onclick=function(){running=false;elapsed=0;tEl.textContent="00:00";tEl.classList.remove("over");document.getElementById("startTimer").textContent="▶ Старт";clearInterval(timerInt);};' +
      'document.getElementById("closeWin").onclick=function(){window.close();};' +
      'function update(i){var c=notes[i]||{};var n=notes[i+1]||{};document.getElementById("curNum").textContent=String(i+1).padStart(2,"0")+" / "+String(notes.length).padStart(2,"0");document.getElementById("curTitle").textContent=(c.title||"").trim().replace(/\\s+/g," ");document.getElementById("curNotes").textContent=c.notes||"(нет заметок)";document.getElementById("nextTitle").textContent=n.title?n.title.trim().replace(/\\s+/g," "):"—";}' +
      'if(ch) ch.onmessage=function(e){if(e.data&&typeof e.data.idx==="number")update(e.data.idx);};' +
      'update(0);' +
      '<\/script></body></html>';
    presenterWindow = window.open('', 'mm-presenter', 'width=520,height=760');
    if (presenterWindow) {
      presenterWindow.document.open();
      presenterWindow.document.write(html);
      presenterWindow.document.close();
    }
  }
  presenterBtn && presenterBtn.addEventListener('click', openPresenterView);

  /* ---------- Dots ---------- */
  const dots = [];
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'dot-nav';
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', 'Слайд ' + (i + 1) + ' из ' + total);
    d.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(d);
    dots.push(d);
  });

  /* ---------- Navigation ---------- */
  function goToSlide(index) {
    index = Math.max(0, Math.min(total - 1, index));
    const slide = slides[index];
    if (!slide) return;
    slide.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }

  prevBtn.addEventListener('click', () => goToSlide(current - 1));
  nextBtn.addEventListener('click', () => goToSlide(current + 1));
  toTopBtn.addEventListener('click', () => goToSlide(0));

  document.querySelectorAll('[data-goto]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(el.getAttribute('data-goto'), 10);
      if (!isNaN(idx)) goToSlide(idx);
    });
  });

  /* ---------- Keyboard ---------- */
  window.addEventListener('keydown', (e) => {
    const t = e.target;
    const tag = (t && t.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.key === 'Escape') { closeSidebar(); closeHelp(); closeInfo(); return; }
    if ((e.key === ' ' || e.key === 'Enter') && t && t.closest && t.closest('button, a, [role="button"], [data-toggle]')) return;

    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
        e.preventDefault(); goToSlide(current + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); goToSlide(current - 1); break;
      case 'Home': e.preventDefault(); goToSlide(0); break;
      case 'End': e.preventDefault(); goToSlide(total - 1); break;
      case '1': goToSlide(1); break;
      case '2': goToSlide(13); break;
      case '3': goToSlide(25); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'p': case 'P': window.print(); break;
      case 'd': case 'D': themeBtn && themeBtn.click(); break;
      case 'm': case 'M': sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar(); break;
      case 'n': case 'N': openPresenterView(); break;
      case '?': openHelp(); break;
    }
  });

  /* ---------- Fullscreen ---------- */
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen && document.exitFullscreen();
    else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
  }
  function updateFullscreenIcon() {
    if (!fullscreenBtn) return;
    const isFs = !!document.fullscreenElement;
    fullscreenBtn.innerHTML = '<i data-lucide="' + (isFs ? 'minimize' : 'maximize') + '"></i>';
    fullscreenBtn.setAttribute('aria-label', isFs ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим');
    refreshIcons();
  }
  fullscreenBtn && fullscreenBtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenIcon);

  /* ---------- UI sync ---------- */
  function updateUI() {
    currentSlideEl.textContent = String(current + 1).padStart(2, '0');

    const pct = total > 1 ? (current / (total - 1)) * 100 : 0;
    progressFill.style.width = pct + '%';

    const section = slides[current].dataset.section || 'cover';
    progressFill.style.background = sectionColors[section] || sectionColors.cover;

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    toTopBtn.classList.toggle('is-visible', current > 0);

    dots.forEach((d, i) => {
      const active = i === current;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const activeDot = dots[current];
    if (activeDot && dotsWrap) {
      const target = activeDot.offsetLeft - (dotsWrap.clientWidth / 2) + (activeDot.offsetWidth / 2);
      const max = dotsWrap.scrollWidth - dotsWrap.clientWidth;
      const left = Math.max(0, Math.min(target, max));
      dotsWrap.scrollTo({ left: left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }

    navLinks.forEach((l) => {
      const targetIdx = parseInt(l.getAttribute('data-goto'), 10);
      const targetSection = slides[targetIdx] ? slides[targetIdx].dataset.section : null;
      l.classList.toggle('is-active', targetSection === section);
    });

    document.querySelectorAll('.sidebar__item').forEach((el, i) => {
      el.classList.toggle('is-active', i === current);
    });

    if (lastHashIndex !== current) {
      lastHashIndex = current;
      const anchor = slides[current].dataset.anchor;
      const newHash = anchor ? '#' + anchor : '#slide-' + current;
      if (location.hash !== newHash) history.replaceState(null, '', newHash);
    }

    if (presenterChannel) presenterChannel.postMessage({ idx: current });
  }

  function onSlideChange(prev, nextIdx) {
    ensureCharts(nextIdx);
  }

  /* ---------- Observer ---------- */
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = slides.indexOf(entry.target);
        if (idx !== -1 && idx !== current) {
          const prev = current;
          current = idx;
          updateUI();
          onSlideChange(prev, current);
        }
      }
    });
  }, { root: deck, rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  slides.forEach((s) => slideObserver.observe(s));

  /* ---------- Reveal ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- Counters ---------- */
  function groupThousands(intStr, sep) {
    return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const sep = el.dataset.sep || '\u00A0';
    const duration = reducedMotion.matches ? 0 : parseInt(el.dataset.duration || '1500', 10);
    const start = performance.now();
    function render(val) {
      let text = decimals > 0 ? val.toFixed(decimals) : groupThousands(String(Math.round(val)), sep);
      el.textContent = prefix + text + suffix;
    }
    if (duration === 0) { render(target); return; }
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      render(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(frame); else render(target);
    }
    requestAnimationFrame(frame);
  }
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

  /* ---------- Reason cards ---------- */
  document.querySelectorAll('[data-toggle]').forEach((el) => {
    el.setAttribute('aria-expanded', 'false');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    const toggle = () => {
      const open = el.classList.toggle('is-open');
      el.setAttribute('aria-expanded', String(open));
    };
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* ---------- Charts ---------- */
  let chartsReady = false;
  const initedCharts = new Set();

  function initChartDefaults() {
    if (chartsReady || !window.Chart) return;
    Chart.defaults.font.family = "'Manrope', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#5d6b64';
    chartsReady = true;
  }

  function makeChart(id, factory) {
    const c = document.getElementById(id);
    if (!c) return;
    factory(c);
  }

  const chartInits = {
    6: () => makeChart('chart-market-share', (c) => new Chart(c, {
      type: 'bar',
      data: { labels: ['До ценовой войны', 'Во время'], datasets: [{ data: [100000, 120000], backgroundColor: ['#8fc4a9', '#e8873a'], borderRadius: 10, maxBarThickness: 72 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => x.parsed.y.toLocaleString('ru-RU') + ' ед.' } } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString('ru-RU') }, grid: { color: '#edf1ee' } }, x: { grid: { display: false } } }
      }
    })),
    22: () => makeChart('chart-budget', (c) => new Chart(c, {
      type: 'doughnut',
      data: { labels: ['Digital', 'Торговля', 'Influencer', 'Дегустации', 'Материалы', 'Контент'], datasets: [{ data: [300000, 200000, 200000, 150000, 100000, 50000], backgroundColor: ['#17483a', '#2f7d63', '#8fc4a9', '#24406e', '#e8873a', '#9aa8b5'], borderWidth: 0, hoverOffset: 10 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '66%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => x.label + ': ' + x.parsed.toLocaleString('ru-RU') + ' KZT' } } } }
    })),
    28: () => makeChart('chart-revenue', (c) => new Chart(c, {
      type: 'bar',
      data: { labels: ['До', 'Во время'], datasets: [{ data: [50000, 59500], backgroundColor: ['#8fc4a9', '#17483a'], borderRadius: 10, maxBarThickness: 80 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => '$' + x.parsed.y.toLocaleString('en-US') } } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => '$' + v.toLocaleString('en-US') }, grid: { color: '#edf1ee' } }, x: { grid: { display: false } } } }
    })),
    29: () => makeChart('chart-contribution', (c) => new Chart(c, {
      type: 'bar',
      data: { labels: ['До', 'Во время'], datasets: [{ data: [25000, 24500], backgroundColor: ['#8fc4a9', '#c2473a'], borderRadius: 10, maxBarThickness: 80 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => '$' + x.parsed.y.toLocaleString('en-US') } } }, scales: { y: { beginAtZero: false, min: 20000, ticks: { callback: (v) => '$' + v.toLocaleString('en-US') }, grid: { color: '#edf1ee' } }, x: { grid: { display: false } } } }
    }))
  };

  function ensureCharts(idx) {
    if (initedCharts.has(idx)) return;
    const fn = chartInits[idx];
    if (!fn) return;
    initChartDefaults();
    if (!chartsReady) return;
    try { fn(); initedCharts.add(idx); } catch (e) {}
  }

  /* ---------- Break-even slider ---------- */
  const sliderDiscount = document.getElementById('sliderDiscount');
  if (sliderDiscount) {
    const PRICE = 500, VAR = 300, BASE_UNITS = 10000, CURRENT_GROWTH = 0.25;
    const el = {
      discountVal: document.getElementById('discountVal'),
      priceAfter: document.getElementById('priceAfter'),
      marginAfter: document.getElementById('marginAfter'),
      sliderVal: document.getElementById('sliderDiscountVal'),
      beUnitProfit: document.getElementById('beUnitProfit'),
      beGrowth: document.getElementById('beGrowth'),
      beVolume: document.getElementById('beVolume'),
      beBarFill: document.getElementById('beBarFill'),
      beHint: document.getElementById('beHint')
    };
    function fmt(n) { return Math.round(n).toLocaleString('ru-RU'); }
    function update() {
      const discPct = parseInt(sliderDiscount.value, 10);
      const newPrice = PRICE * (1 - discPct / 100);
      const newMargin = newPrice - VAR;
      const baseMargin = PRICE - VAR;
      const delta = baseMargin - newMargin;
      const requiredGrowthPct = (baseMargin / newMargin - 1) * 100;
      const requiredVolume = Math.ceil(BASE_UNITS * (baseMargin / newMargin));

      el.discountVal.textContent = Math.round(delta);
      el.priceAfter.textContent = Math.round(newPrice) + ' KZT';
      el.marginAfter.textContent = Math.round(newMargin) + ' KZT';
      el.sliderVal.textContent = discPct + '%';
      el.beUnitProfit.textContent = Math.round(newMargin) + ' KZT';
      el.beGrowth.textContent = '+' + requiredGrowthPct.toFixed(0) + '%';
      el.beVolume.textContent = fmt(requiredVolume) + ' ед.';
      const fillPct = Math.min(100, (CURRENT_GROWTH * 100) / requiredGrowthPct * 100);
      el.beBarFill.style.width = fillPct + '%';
      el.beBarFill.style.background = fillPct >= 100 ? 'linear-gradient(90deg, #2f7d63, #8fc4a9)' : 'linear-gradient(90deg, #c2473a, #e8873a)';
      el.beHint.textContent = fillPct >= 100
        ? 'Текущий рост продаж покрывает скидку.'
        : 'Скидка ' + discPct + '% требует роста продаж минимум на ' + requiredGrowthPct.toFixed(0) + '%, чтобы не потерять прибыль.';
    }
    sliderDiscount.addEventListener('input', update);
    update();
  }

  /* ---------- ROI calculator ---------- */
  const roiDiscount = document.getElementById('roiDiscount');
  if (roiDiscount) {
    const BASE_PRICE = 5, VAR_COST = 2.5, BASE_UNITS = 10000, BASE_MARGIN = (BASE_PRICE - VAR_COST) * BASE_UNITS;
    const el = {
      discount: roiDiscount,
      discountVal: document.getElementById('roiDiscountVal'),
      growth: document.getElementById('roiGrowth'),
      growthVal: document.getElementById('roiGrowthVal'),
      budget: document.getElementById('roiBudget'),
      budgetVal: document.getElementById('roiBudgetVal'),
      marginBefore: document.getElementById('roiMarginBefore'),
      marginDuring: document.getElementById('roiMarginDuring'),
      net: document.getElementById('roiNet'),
      result: document.getElementById('roiResult'),
      resultBox: document.getElementById('roiResultBox'),
      hint: document.getElementById('roiHint')
    };
    function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
    function update() {
      const discPct = parseInt(el.discount.value, 10);
      const growthPct = parseInt(el.growth.value, 10);
      const budget = parseInt(el.budget.value, 10);

      const newPrice = BASE_PRICE * (1 - discPct / 100);
      const newMargin = newPrice - VAR_COST;
      const newUnits = BASE_UNITS * (1 + growthPct / 100);
      const newContribution = newMargin * newUnits;
      const deltaContribution = newContribution - BASE_MARGIN;
      const net = deltaContribution - budget;
      const roi = budget > 0 ? (net / budget) * 100 : (net > 0 ? Infinity : 0);

      el.discountVal.textContent = discPct + '%';
      el.growthVal.textContent = growthPct + '%';
      el.budgetVal.textContent = budget === 0 ? '$0' : fmt(budget);
      el.marginBefore.textContent = fmt(BASE_MARGIN);
      el.marginDuring.textContent = fmt(newContribution);
      el.net.textContent = (net >= 0 ? '+' : '−') + fmt(Math.abs(net));
      el.net.style.color = net >= 0 ? 'var(--green-700)' : 'var(--danger)';

      if (!isFinite(roi)) el.result.textContent = '—';
      else el.result.textContent = (roi >= 0 ? '+' : '−') + Math.abs(roi).toFixed(1) + '%';

      el.resultBox.classList.toggle('is-positive', net >= 0 && isFinite(roi));
      el.resultBox.classList.toggle('is-negative', net < 0 || !isFinite(roi));
      el.hint.textContent = net >= 0 && isFinite(roi)
        ? 'Кампания прибыльна. Дополнительный вклад покрывает расходы на продвижение.'
        : 'Отрицательный ROI: дополнительный экономический эффект не покрыл расходы.';
    }
    [el.discount, el.growth, el.budget].forEach((s) => s.addEventListener('input', update));
    update();
  }

  /* ---------- Init ---------- */
  refreshIcons();

  (function initFromHash() {
    let idx = 0;
    const hash = location.hash;
    const m = hash.match(/^#slide-(\d+)$/);
    if (m) idx = parseInt(m[1], 10);
    else if (hash) {
      const anchor = hash.slice(1);
      const found = slides.findIndex((s) => s.dataset.anchor === anchor);
      if (found >= 0) idx = found;
    }
    if (isNaN(idx) || idx < 0 || idx >= total) idx = 0;
    requestAnimationFrame(() => {
      current = idx;
      lastHashIndex = idx;
      const prev = deck.style.scrollBehavior;
      deck.style.scrollBehavior = 'auto';
      slides[idx].scrollIntoView({ block: 'start' });
      deck.style.scrollBehavior = prev;
      updateUI();
      ensureCharts(idx);
    });
  })();

  window.addEventListener('beforeunload', () => {
    if (presenterWindow && !presenterWindow.closed) presenterWindow.close();
  });
})();