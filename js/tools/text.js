/**
 * Text Tools Module for All-in-One Tools App
 * Features real-time text analysis (words, characters, lines, reading time)
 * and one-tap transformations (case conversions, extra space removal, copy, clear).
 */

class TextTools {
  constructor() {
    this.text = '';
  }

  initUI(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="text-tools-card glass-panel">
        <!-- Live Analytics Counter Bar -->
        <div class="text-stats-bar">
          <div class="text-stat-item">
            <span class="text-stat-val" id="stat-words">0</span>
            <span class="text-stat-lbl">Words</span>
          </div>
          <div class="text-stat-item">
            <span class="text-stat-val" id="stat-chars">0</span>
            <span class="text-stat-lbl">Characters</span>
          </div>
          <div class="text-stat-item">
            <span class="text-stat-val" id="stat-chars-nospace">0</span>
            <span class="text-stat-lbl">Chars (no space)</span>
          </div>
          <div class="text-stat-item">
            <span class="text-stat-val" id="stat-lines">0</span>
            <span class="text-stat-lbl">Lines</span>
          </div>
          <div class="text-stat-item">
            <span class="text-stat-val" id="stat-reading">0s</span>
            <span class="text-stat-lbl">Read Time</span>
          </div>
        </div>

        <!-- Main Text Input Area -->
        <div class="text-input-wrapper">
          <textarea id="text-main-input" class="text-editor" rows="7" placeholder="Type or paste your text here to analyze and transform..."></textarea>
        </div>

        <!-- Action Quick Buttons (Copy & Clear) -->
        <div class="text-quick-actions">
          <button id="text-btn-copy" class="text-btn-action text-btn-highlight" title="Copy text to clipboard">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Text
          </button>
          <button id="text-btn-clear" class="text-btn-action text-btn-danger" title="Clear all text">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear Text
          </button>
        </div>

        <!-- Transformation Tools Grid -->
        <div class="text-tools-section">
          <div class="text-section-title">Case Conversions</div>
          <div class="text-actions-grid">
            <button class="text-transform-btn" data-action="upper">UPPERCASE</button>
            <button class="text-transform-btn" data-action="lower">lowercase</button>
            <button class="text-transform-btn" data-action="title">Title Case</button>
            <button class="text-transform-btn" data-action="sentence">Sentence case</button>
            <button class="text-transform-btn" data-action="camel">camelCase</button>
            <button class="text-transform-btn" data-action="kebab">kebab-case</button>
            <button class="text-transform-btn" data-action="snake">snake_case</button>
          </div>
        </div>

        <!-- Cleaners & Utilities -->
        <div class="text-tools-section">
          <div class="text-section-title">Cleaners & Utilities</div>
          <div class="text-actions-grid">
            <button class="text-transform-btn" data-action="spaces">Remove Extra Spaces</button>
            <button class="text-transform-btn" data-action="lines">Remove Empty Lines</button>
            <button class="text-transform-btn" data-action="strip-html">Strip HTML Tags</button>
            <button class="text-transform-btn" data-action="reverse">Reverse Text</button>
          </div>
        </div>
      </div>
    `;

    this.dom = {
      textarea: container.querySelector('#text-main-input'),
      words: container.querySelector('#stat-words'),
      chars: container.querySelector('#stat-chars'),
      charsNoSpace: container.querySelector('#stat-chars-nospace'),
      lines: container.querySelector('#stat-lines'),
      reading: container.querySelector('#stat-reading'),
      copyBtn: container.querySelector('#text-btn-copy'),
      clearBtn: container.querySelector('#text-btn-clear'),
      transformBtns: container.querySelectorAll('.text-transform-btn')
    };

    this.bindEvents();
    this.analyze();
  }

  bindEvents() {
    this.dom.textarea.addEventListener('input', () => this.analyze());

    // One-tap copy
    this.dom.copyBtn.addEventListener('click', () => {
      const val = this.dom.textarea.value;
      if (!val) {
        if (window.toolsManager) window.toolsManager.showToast('Text is empty.');
        return;
      }
      navigator.clipboard.writeText(val).then(() => {
        if (window.toolsManager) window.toolsManager.showToast('Copied text to clipboard!');
        if (window.soundEngine) window.soundEngine.playKeyClick();
      });
    });

    // One-tap clear
    this.dom.clearBtn.addEventListener('click', () => {
      this.dom.textarea.value = '';
      this.analyze();
      if (window.toolsManager) window.toolsManager.showToast('Text cleared');
      if (window.soundEngine) window.soundEngine.playSpecialClick();
    });

    // Transform buttons
    this.dom.transformBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.applyTransform(action);
        if (window.soundEngine) window.soundEngine.playKeyClick();
      });
    });
  }

  analyze() {
    const text = this.dom.textarea.value;
    const trimmed = text.trim();

    // Words
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    // Chars
    const chars = text.length;
    // Chars without spaces
    const charsNoSpace = text.replace(/\s/g, '').length;
    // Lines
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    // Reading time (approx 200 wpm)
    const readingSecs = Math.ceil((words / 200) * 60);
    const readingTimeStr = readingSecs < 60 ? `${readingSecs}s` : `${Math.ceil(readingSecs / 60)}m`;

    this.dom.words.textContent = words.toLocaleString();
    this.dom.chars.textContent = chars.toLocaleString();
    this.dom.charsNoSpace.textContent = charsNoSpace.toLocaleString();
    this.dom.lines.textContent = lines.toLocaleString();
    this.dom.reading.textContent = readingTimeStr;
  }

  applyTransform(action) {
    const val = this.dom.textarea.value;
    if (!val) return;

    let result = val;
    switch (action) {
      case 'upper':
        result = val.toUpperCase();
        break;
      case 'lower':
        result = val.toLowerCase();
        break;
      case 'title':
        result = val.toLowerCase().replace(/\b(\w)/g, c => c.toUpperCase());
        break;
      case 'sentence':
        result = val.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        break;
      case 'camel':
        result = val
          .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
          .replace(/^([A-Z])/, c => c.toLowerCase());
        break;
      case 'kebab':
        result = val
          .trim()
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();
        break;
      case 'snake':
        result = val
          .trim()
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/[\s-]+/g, '_')
          .toLowerCase();
        break;
      case 'spaces':
        // Remove extra spaces & trim each line
        result = val.replace(/[ \t]+/g, ' ').replace(/^\s+|\s+$/gm, '');
        break;
      case 'lines':
        // Remove empty lines
        result = val.split(/\r?\n/).filter(line => line.trim().length > 0).join('\n');
        break;
      case 'strip-html':
        result = val.replace(/<[^>]*>/g, '');
        break;
      case 'reverse':
        result = [...val].reverse().join('');
        break;
    }

    this.dom.textarea.value = result;
    this.analyze();
    if (window.toolsManager) window.toolsManager.showToast(`Applied ${action}!`);
  }
}

window.TextTools = TextTools;
