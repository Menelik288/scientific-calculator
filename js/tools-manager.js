/**
 * Tools Manager & Application Router for OmniTools (All-in-One Tools App)
 * Handles catalog, routing, search, favorites, recents, settings, and view lifecycle.
 */

class ToolsManager {
  constructor() {
    this.catalog = [
      {
        id: 'calculator',
        name: 'Scientific Calculator',
        shortName: 'Calculator',
        category: 'math',
        categoryName: 'Math & Finance',
        icon: '🧮',
        badge: 'Scientific 3D',
        desc: 'Advanced scientific math, trigonometry, base-n conversions, matrices, equation solvers & statistics.',
        tags: ['math', 'calculate', 'scientific', 'trig', 'equation', 'matrix', 'base-n', 'hex', 'algebra']
      },
      {
        id: 'converter',
        name: 'Unit Converter',
        shortName: 'Converter',
        category: 'math',
        categoryName: 'Math & Finance',
        icon: '📐',
        badge: 'Instant',
        desc: 'Convert length, weight/mass, temperature, area, speed, and volume with high precision.',
        tags: ['unit', 'converter', 'metric', 'imperial', 'length', 'weight', 'temperature', 'speed', 'volume', 'area', 'miles', 'km', 'kg', 'lbs']
      },
      {
        id: 'percentage',
        name: 'Percentage & Discount',
        shortName: 'Percentage',
        category: 'math',
        categoryName: 'Math & Finance',
        icon: '🏷️',
        badge: 'Finance',
        desc: 'Calculate percentages, sales discounts, taxes, percentage increases, and differences.',
        tags: ['percent', 'percentage', 'discount', 'sale', 'tax', 'price', 'savings', 'increase', 'decrease', 'margin']
      },
      {
        id: 'qr',
        name: 'QR Scanner & Studio',
        shortName: 'QR Studio',
        category: 'daily',
        categoryName: 'Daily & Utilities',
        icon: '📷',
        badge: 'Camera & File',
        desc: 'Scan QR codes with live camera, generate QR codes (text, URL, vCard, Wi-Fi), and decode images.',
        tags: ['qr', 'code', 'barcode', 'scan', 'camera', 'generator', 'decode', 'wifi', 'vcard', 'url', 'share']
      },
      {
        id: 'timer',
        name: 'Timer & Stopwatch',
        shortName: 'Timer & Laps',
        category: 'daily',
        categoryName: 'Daily & Utilities',
        icon: '⏱️',
        badge: 'Acoustic',
        desc: 'Countdown timer with sound alarms and presets, plus millisecond stopwatch with lap splits.',
        tags: ['timer', 'stopwatch', 'clock', 'countdown', 'lap', 'alarm', 'pomodoro', 'seconds', 'time']
      },
      {
        id: 'date',
        name: 'Date & Age Calculator',
        shortName: 'Date & Age',
        category: 'daily',
        categoryName: 'Daily & Utilities',
        icon: '📅',
        badge: 'Calendar',
        desc: 'Calculate exact age from birthdate, calendar & workdays between dates, and event countdowns.',
        tags: ['date', 'age', 'birthday', 'calendar', 'countdown', 'days', 'workdays', 'time remaining', 'difference']
      },
      {
        id: 'text',
        name: 'Text Tools & Counter',
        shortName: 'Text Tools',
        category: 'text',
        categoryName: 'Text & Code',
        icon: '📝',
        badge: 'One-Tap',
        desc: 'Word, char & line counter, reading time, uppercase/lowercase converters, and whitespace cleaner.',
        tags: ['text', 'words', 'counter', 'characters', 'uppercase', 'lowercase', 'title case', 'spaces', 'clean', 'reading time']
      },
      {
        id: 'flashlight',
        name: 'Flashlight & Torch',
        shortName: 'Flashlight',
        category: 'sensors',
        categoryName: 'Sensors & Hardware',
        icon: '🔦',
        badge: 'Hardware & Screen',
        desc: 'Ultra-bright screen flashlight with custom colors, strobe, SOS beacon, and camera LED torch.',
        tags: ['flashlight', 'torch', 'light', 'screen', 'led', 'camera', 'strobe', 'sos', 'night light']
      },
      {
        id: 'compass',
        name: 'Compass & Bubble Level',
        shortName: 'Compass & Level',
        category: 'sensors',
        categoryName: 'Sensors & Hardware',
        icon: '🧭',
        badge: 'Device Sensors',
        desc: 'Digital 16-point magnetic compass and 2D bullseye spirit level with haptic alignment.',
        tags: ['compass', 'level', 'bubble level', 'clinometer', 'heading', 'degrees', 'pitch', 'roll', 'orientation']
      },
      {
        id: 'speedtest',
        name: 'Internet Speed Test',
        shortName: 'Speed Test',
        category: 'sensors',
        categoryName: 'Sensors & Hardware',
        icon: '🚀',
        badge: 'Real-time',
        desc: 'Test real download bandwidth (Mbps), ping latency (ms), and jitter with live gauge analytics.',
        tags: ['speed', 'internet', 'speed test', 'bandwidth', 'ping', 'latency', 'mbps', 'wifi', 'network', 'download']
      }
    ];

    this.instances = {};
    this.favorites = new Set(JSON.parse(localStorage.getItem('omnitools_favs') || '["calculator", "converter", "qr"]'));
    this.recents = JSON.parse(localStorage.getItem('omnitools_recents') || '["calculator"]');
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.activeView = 'home';
    this.activeToolId = null;

    // Settings
    this.soundEnabled = localStorage.getItem('calc_sound') !== 'false';
    this.hapticsEnabled = localStorage.getItem('omnitools_haptics') !== 'false';
    this.theme = localStorage.getItem('calc_theme') || 'nebula';
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.applyTheme(this.theme);
    this.renderHomeTools();
    this.renderFavorites();
    this.renderRecents();

    // Route on initial load
    this.handleRoute();
  }

  cacheDom() {
    this.dom = {
      viewHome: document.getElementById('view-home'),
      viewTool: document.getElementById('view-tool'),
      modalSettings: document.getElementById('modal-settings'),
      // Header
      btnSettings: document.getElementById('btn-open-settings'),
      btnThemeToggle: document.getElementById('btn-header-theme'),
      btnSoundToggle: document.getElementById('btn-header-sound'),
      // Home elements
      searchInput: document.getElementById('home-search-input'),
      searchClearBtn: document.getElementById('home-search-clear'),
      categoryTabs: document.querySelectorAll('.home-cat-chip'),
      favsSection: document.getElementById('home-favorites-section'),
      favsGrid: document.getElementById('home-favorites-grid'),
      recentsSection: document.getElementById('home-recents-section'),
      recentsGrid: document.getElementById('home-recents-grid'),
      allToolsGrid: document.getElementById('home-all-tools-grid'),
      toolsEmptyState: document.getElementById('home-tools-empty'),
      // Tool View elements
      toolHeaderIcon: document.getElementById('tool-header-icon'),
      toolHeaderTitle: document.getElementById('tool-header-title'),
      toolHeaderBadge: document.getElementById('tool-header-badge'),
      toolHeaderFavBtn: document.getElementById('tool-header-fav-btn'),
      toolBtnBack: document.getElementById('tool-btn-back'),
      toolBodyContainers: document.querySelectorAll('.tool-content-wrapper'),
      // Bottom Navigation
      navItems: document.querySelectorAll('.bottom-nav-item'),
      // Global Toast
      toastEl: document.getElementById('omni-toast')
    };
  }

  bindEvents() {
    // Router
    window.addEventListener('hashchange', () => this.handleRoute());

    // Search
    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.dom.searchClearBtn.style.display = this.searchQuery ? 'block' : 'none';
        this.renderHomeTools();
      });

      this.dom.searchClearBtn.addEventListener('click', () => {
        this.dom.searchInput.value = '';
        this.searchQuery = '';
        this.dom.searchClearBtn.style.display = 'none';
        this.renderHomeTools();
      });
    }

    // Categories
    this.dom.categoryTabs.forEach(chip => {
      chip.addEventListener('click', () => {
        this.dom.categoryTabs.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.getAttribute('data-cat') || 'all';
        this.renderHomeTools();
        if (window.soundEngine) window.soundEngine.playKeyClick();
      });
    });

    // Back to home
    if (this.dom.toolBtnBack) {
      this.dom.toolBtnBack.addEventListener('click', () => {
        window.location.hash = '';
      });
    }

    // Tool Header Favorite Toggle
    if (this.dom.toolHeaderFavBtn) {
      this.dom.toolHeaderFavBtn.addEventListener('click', () => {
        if (!this.activeToolId) return;
        this.toggleFavorite(this.activeToolId);
        this.updateToolHeaderFavState();
      });
    }

    // Bottom Navigation
    this.dom.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-nav');
        this.dom.navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        switch (target) {
          case 'home':
            window.location.hash = '';
            break;
          case 'favorites':
            window.location.hash = '';
            setTimeout(() => {
              this.dom.favsSection?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            break;
          case 'calculator':
            window.location.hash = '#calculator';
            break;
          case 'settings':
            this.openSettings();
            break;
        }

        if (window.soundEngine) window.soundEngine.playSpecialClick();
      });
    });

    // Header Controls
    if (this.dom.btnSettings) {
      this.dom.btnSettings.addEventListener('click', () => this.openSettings());
    }

    if (this.dom.btnThemeToggle) {
      this.dom.btnThemeToggle.addEventListener('click', () => this.cycleTheme());
    }

    if (this.dom.btnSoundToggle) {
      this.dom.btnSoundToggle.addEventListener('click', () => this.toggleSound());
    }

    // Settings Modal bindings
    this.bindSettingsEvents();
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '').trim();

    if (!hash || hash === 'home') {
      this.showHomeView();
    } else if (hash === 'settings') {
      this.openSettings();
    } else {
      const tool = this.catalog.find(t => t.id === hash);
      if (tool) {
        this.showToolView(tool.id);
      } else {
        this.showHomeView();
      }
    }
  }

  showHomeView() {
    this.activeView = 'home';
    this.activeToolId = null;

    if (this.dom.viewHome) this.dom.viewHome.style.display = 'block';
    if (this.dom.viewTool) this.dom.viewTool.style.display = 'none';
    this.closeSettings();

    // Highlight bottom nav home
    this.updateBottomNav('home');
    this.renderFavorites();
    this.renderRecents();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showToolView(toolId) {
    const tool = this.catalog.find(t => t.id === toolId);
    if (!tool) return;

    this.activeView = 'tool';
    this.activeToolId = toolId;

    if (this.dom.viewHome) this.dom.viewHome.style.display = 'none';
    if (this.dom.viewTool) this.dom.viewTool.style.display = 'block';
    this.closeSettings();

    // Update tool header
    if (this.dom.toolHeaderIcon) this.dom.toolHeaderIcon.textContent = tool.icon;
    if (this.dom.toolHeaderTitle) this.dom.toolHeaderTitle.textContent = tool.name;
    if (this.dom.toolHeaderBadge) this.dom.toolHeaderBadge.textContent = tool.badge;
    this.updateToolHeaderFavState();

    // Show matching tool container
    this.dom.toolBodyContainers.forEach(container => {
      const cId = container.getAttribute('data-tool-id');
      if (cId === toolId) {
        container.style.display = 'block';
        container.classList.add('active');
        this.lazyInitTool(toolId, container);
      } else {
        container.style.display = 'none';
        container.classList.remove('active');
      }
    });

    // Record in recents
    this.recordRecent(toolId);

    // Update bottom nav
    if (toolId === 'calculator') {
      this.updateBottomNav('calculator');
    } else {
      this.updateBottomNav('');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  lazyInitTool(toolId, container) {
    if (this.instances[toolId]) return;

    switch (toolId) {
      case 'converter':
        if (window.UnitConverter) {
          this.instances.converter = new window.UnitConverter();
          this.instances.converter.initUI(container);
        }
        break;
      case 'qr':
        if (window.QRStudio) {
          this.instances.qr = new window.QRStudio();
          this.instances.qr.initUI(container);
        }
        break;
      case 'timer':
        if (window.TimerStopwatch) {
          this.instances.timer = new window.TimerStopwatch();
          this.instances.timer.initUI(container);
        }
        break;
      case 'percentage':
        if (window.PercentageCalculator) {
          this.instances.percentage = new window.PercentageCalculator();
          this.instances.percentage.initUI(container);
        }
        break;
      case 'text':
        if (window.TextTools) {
          this.instances.text = new window.TextTools();
          this.instances.text.initUI(container);
        }
        break;
      case 'date':
        if (window.DateCalculator) {
          this.instances.date = new window.DateCalculator();
          this.instances.date.initUI(container);
        }
        break;
      case 'flashlight':
      case 'compass':
        if (window.SensorUtilities && !this.instances.sensors) {
          this.instances.sensors = new window.SensorUtilities();
          this.instances.sensors.initUI(container);
        }
        break;
      case 'speedtest':
        if (window.SpeedTest) {
          this.instances.speedtest = new window.SpeedTest();
          this.instances.speedtest.initUI(container);
        }
        break;
      case 'calculator':
        // Existing calculator is already wired in app.js
        break;
    }
  }

  renderHomeTools() {
    if (!this.dom.allToolsGrid) return;

    let filtered = this.catalog;

    // Filter by category
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.currentCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(t => {
        const query = this.searchQuery;
        return (
          t.name.toLowerCase().includes(query) ||
          t.desc.toLowerCase().includes(query) ||
          t.categoryName.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }

    if (filtered.length === 0) {
      this.dom.allToolsGrid.style.display = 'none';
      if (this.dom.toolsEmptyState) this.dom.toolsEmptyState.style.display = 'flex';
      return;
    }

    this.dom.allToolsGrid.style.display = 'grid';
    if (this.dom.toolsEmptyState) this.dom.toolsEmptyState.style.display = 'none';

    this.dom.allToolsGrid.innerHTML = filtered.map(tool => {
      const isFav = this.favorites.has(tool.id);
      return `
        <div class="tool-card glass-panel" data-tool-id="${tool.id}">
          <div class="tool-card-header">
            <div class="tool-icon-wrap">${tool.icon}</div>
            <button class="tool-fav-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${tool.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#ffd700' : 'none'}" stroke="${isFav ? '#ffd700' : 'currentColor'}" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="tool-card-content">
            <div class="tool-card-title-row">
              <span class="tool-card-title">${tool.name}</span>
              <span class="tool-card-badge">${tool.badge}</span>
            </div>
            <p class="tool-card-desc">${tool.desc}</p>
          </div>
          <div class="tool-card-footer">
            <span class="tool-card-cat">${tool.categoryName}</span>
            <span class="tool-card-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Attach card clicks
    this.dom.allToolsGrid.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent open if clicking fav button
        if (e.target.closest('.tool-fav-btn')) return;
        const id = card.getAttribute('data-tool-id');
        if (id) {
          window.location.hash = `#${id}`;
          if (window.soundEngine) window.soundEngine.playOperatorClick();
        }
      });
    });

    // Attach favorite button clicks
    this.dom.allToolsGrid.querySelectorAll('.tool-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-fav-id');
        this.toggleFavorite(id);
      });
    });
  }

  renderFavorites() {
    if (!this.dom.favsSection || !this.dom.favsGrid) return;

    if (this.favorites.size === 0) {
      this.dom.favsSection.style.display = 'none';
      return;
    }

    this.dom.favsSection.style.display = 'block';
    const favTools = this.catalog.filter(t => this.favorites.has(t.id));

    this.dom.favsGrid.innerHTML = favTools.map(tool => {
      return `
        <div class="fav-tool-chip glass-panel" data-open-tool="${tool.id}" title="${tool.name}">
          <span class="fav-chip-icon">${tool.icon}</span>
          <span class="fav-chip-name">${tool.shortName || tool.name}</span>
        </div>
      `;
    }).join('');

    this.dom.favsGrid.querySelectorAll('.fav-tool-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.getAttribute('data-open-tool');
        if (id) {
          window.location.hash = `#${id}`;
          if (window.soundEngine) window.soundEngine.playOperatorClick();
        }
      });
    });
  }

  renderRecents() {
    if (!this.dom.recentsSection || !this.dom.recentsGrid) return;

    const recentTools = this.recents
      .map(id => this.catalog.find(t => t.id === id))
      .filter(Boolean)
      .slice(0, 4);

    if (recentTools.length === 0) {
      this.dom.recentsSection.style.display = 'none';
      return;
    }

    this.dom.recentsSection.style.display = 'block';
    this.dom.recentsGrid.innerHTML = recentTools.map(tool => {
      return `
        <div class="recent-tool-item glass-panel" data-open-tool="${tool.id}">
          <span class="recent-item-icon">${tool.icon}</span>
          <div class="recent-item-text">
            <span class="recent-item-name">${tool.shortName || tool.name}</span>
            <span class="recent-item-cat">${tool.categoryName}</span>
          </div>
        </div>
      `;
    }).join('');

    this.dom.recentsGrid.querySelectorAll('.recent-tool-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-open-tool');
        if (id) {
          window.location.hash = `#${id}`;
          if (window.soundEngine) window.soundEngine.playOperatorClick();
        }
      });
    });
  }

  toggleFavorite(toolId) {
    if (this.favorites.has(toolId)) {
      this.favorites.delete(toolId);
      this.showToast('Removed from favorites');
    } else {
      this.favorites.add(toolId);
      this.showToast('Added to favorites ⭐');
    }

    localStorage.setItem('omnitools_favs', JSON.stringify([...this.favorites]));
    this.renderHomeTools();
    this.renderFavorites();
    this.updateToolHeaderFavState();

    if (window.soundEngine) window.soundEngine.playKeyClick();
  }

  updateToolHeaderFavState() {
    if (!this.dom.toolHeaderFavBtn || !this.activeToolId) return;
    const isFav = this.favorites.has(this.activeToolId);
    this.dom.toolHeaderFavBtn.classList.toggle('is-fav', isFav);
    const svg = this.dom.toolHeaderFavBtn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', isFav ? '#ffd700' : 'none');
      svg.setAttribute('stroke', isFav ? '#ffd700' : 'currentColor');
    }
  }

  recordRecent(toolId) {
    this.recents = this.recents.filter(id => id !== toolId);
    this.recents.unshift(toolId);
    if (this.recents.length > 8) this.recents.pop();
    localStorage.setItem('omnitools_recents', JSON.stringify(this.recents));
  }

  updateBottomNav(activeNav) {
    this.dom.navItems.forEach(item => {
      const nav = item.getAttribute('data-nav');
      item.classList.toggle('active', nav === activeNav);
    });
  }

  // Toast Notification
  showToast(message, duration = 2500) {
    if (!this.dom.toastEl) return;
    this.dom.toastEl.textContent = message;
    this.dom.toastEl.classList.add('visible');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.dom.toastEl.classList.remove('visible');
    }, duration);
  }

  // Settings Modal & Controls
  openSettings() {
    if (this.dom.modalSettings) {
      this.dom.modalSettings.classList.add('open');
      if (window.soundEngine) window.soundEngine.playSpecialClick();
    }
  }

  closeSettings() {
    if (this.dom.modalSettings) {
      this.dom.modalSettings.classList.remove('open');
    }
  }

  bindSettingsEvents() {
    const modal = this.dom.modalSettings;
    if (!modal) return;

    // Close button & overlay
    const closeBtn = modal.querySelector('#settings-btn-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeSettings());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeSettings();
    });

    // Theme Options
    modal.querySelectorAll('.settings-theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        modal.querySelectorAll('.settings-theme-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const theme = opt.getAttribute('data-theme');
        this.applyTheme(theme);
        if (window.soundEngine) window.soundEngine.playKeyClick();
      });
    });

    // Sound Toggle
    const soundToggle = modal.querySelector('#toggle-sound-switch');
    if (soundToggle) {
      soundToggle.checked = this.soundEnabled;
      soundToggle.addEventListener('change', (e) => {
        this.soundEnabled = e.target.checked;
        localStorage.setItem('calc_sound', this.soundEnabled);
        if (window.soundEngine) window.soundEngine.enabled = this.soundEnabled;
        this.showToast(`Sound Effects: ${this.soundEnabled ? 'ON' : 'OFF'}`);
      });
    }

    // Haptics Toggle
    const hapticToggle = modal.querySelector('#toggle-haptic-switch');
    if (hapticToggle) {
      hapticToggle.checked = this.hapticsEnabled;
      hapticToggle.addEventListener('change', (e) => {
        this.hapticsEnabled = e.target.checked;
        localStorage.setItem('omnitools_haptics', this.hapticsEnabled);
        if (this.hapticsEnabled && navigator.vibrate) navigator.vibrate(30);
        this.showToast(`Haptic Feedback: ${this.hapticsEnabled ? 'ON' : 'OFF'}`);
      });
    }

    // Clear Data Actions
    const clearFavs = modal.querySelector('#btn-clear-favs');
    if (clearFavs) {
      clearFavs.addEventListener('click', () => {
        this.favorites.clear();
        localStorage.removeItem('omnitools_favs');
        this.renderFavorites();
        this.renderHomeTools();
        this.showToast('Favorites cleared');
      });
    }

    const clearRecents = modal.querySelector('#btn-clear-recents');
    if (clearRecents) {
      clearRecents.addEventListener('click', () => {
        this.recents = [];
        localStorage.removeItem('omnitools_recents');
        this.renderRecents();
        this.showToast('Recent history cleared');
      });
    }
  }

  applyTheme(themeName) {
    this.theme = themeName;
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('calc_theme', themeName);

    // Update settings active swatch if open
    if (this.dom.modalSettings) {
      this.dom.modalSettings.querySelectorAll('.settings-theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-theme') === themeName);
      });
    }
  }

  cycleTheme() {
    const themes = ['nebula', 'frost', 'amber', 'aurora'];
    const idx = themes.indexOf(this.theme);
    const nextTheme = themes[(idx + 1) % themes.length];
    this.applyTheme(nextTheme);
    this.showToast(`Theme: ${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)}`);
    if (window.soundEngine) window.soundEngine.playKeyClick();
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('calc_sound', this.soundEnabled);
    if (window.soundEngine) window.soundEngine.enabled = this.soundEnabled;
    this.showToast(`Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`);
    if (this.dom.btnSoundToggle) {
      this.dom.btnSoundToggle.classList.toggle('active', this.soundEnabled);
    }
  }
}

window.ToolsManager = ToolsManager;
