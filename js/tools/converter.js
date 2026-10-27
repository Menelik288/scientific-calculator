/**
 * Unit Converter Module for All-in-One Tools App
 * Supports Length, Weight/Mass, Temperature, Distance/Area, Speed, and Volume.
 */

class UnitConverter {
  constructor() {
    this.definitions = {
      length: {
        name: 'Length & Distance',
        icon: '📏',
        baseUnit: 'm',
        units: {
          m: { name: 'Meter (m)', factor: 1 },
          km: { name: 'Kilometer (km)', factor: 1000 },
          cm: { name: 'Centimeter (cm)', factor: 0.01 },
          mm: { name: 'Millimeter (mm)', factor: 0.001 },
          um: { name: 'Micrometer (µm)', factor: 1e-6 },
          nm: { name: 'Nanometer (nm)', factor: 1e-9 },
          mi: { name: 'Mile (mi)', factor: 1609.344 },
          yd: { name: 'Yard (yd)', factor: 0.9144 },
          ft: { name: 'Foot (ft)', factor: 0.3048 },
          in: { name: 'Inch (in)', factor: 0.0254 },
          nmi: { name: 'Nautical Mile (nmi)', factor: 1852 }
        },
        defaultFrom: 'm',
        defaultTo: 'ft'
      },
      weight: {
        name: 'Weight & Mass',
        icon: '⚖️',
        baseUnit: 'kg',
        units: {
          kg: { name: 'Kilogram (kg)', factor: 1 },
          g: { name: 'Gram (g)', factor: 0.001 },
          mg: { name: 'Milligram (mg)', factor: 1e-6 },
          t: { name: 'Metric Ton (t)', factor: 1000 },
          lb: { name: 'Pound (lb)', factor: 0.45359237 },
          oz: { name: 'Ounce (oz)', factor: 0.028349523125 },
          st: { name: 'Stone (st)', factor: 6.35029318 },
          ct: { name: 'Carat (ct)', factor: 0.0002 }
        },
        defaultFrom: 'kg',
        defaultTo: 'lb'
      },
      temperature: {
        name: 'Temperature',
        icon: '🌡️',
        isNonLinear: true,
        units: {
          C: { name: 'Celsius (°C)', symbol: '°C' },
          F: { name: 'Fahrenheit (°F)', symbol: '°F' },
          K: { name: 'Kelvin (K)', symbol: 'K' },
          R: { name: 'Rankine (°R)', symbol: '°R' }
        },
        defaultFrom: 'C',
        defaultTo: 'F'
      },
      distance: {
        name: 'Area & Land',
        icon: '📐',
        baseUnit: 'sq_m',
        units: {
          sq_m: { name: 'Square Meter (m²)', factor: 1 },
          sq_km: { name: 'Square Kilometer (km²)', factor: 1e6 },
          sq_cm: { name: 'Square Centimeter (cm²)', factor: 0.0001 },
          sq_ft: { name: 'Square Foot (ft²)', factor: 0.09290304 },
          sq_yd: { name: 'Square Yard (yd²)', factor: 0.83612736 },
          acre: { name: 'Acre (ac)', factor: 4046.8564224 },
          ha: { name: 'Hectare (ha)', factor: 10000 },
          sq_mi: { name: 'Square Mile (mi²)', factor: 2589988.110336 }
        },
        defaultFrom: 'sq_m',
        defaultTo: 'sq_ft'
      },
      speed: {
        name: 'Speed & Velocity',
        icon: '⚡',
        baseUnit: 'm_s',
        units: {
          m_s: { name: 'Meters per second (m/s)', factor: 1 },
          km_h: { name: 'Kilometers per hour (km/h)', factor: 1 / 3.6 },
          mph: { name: 'Miles per hour (mph)', factor: 0.44704 },
          knot: { name: 'Knot (kn)', factor: 0.514444444 },
          ft_s: { name: 'Feet per second (ft/s)', factor: 0.3048 }
        },
        defaultFrom: 'km_h',
        defaultTo: 'mph'
      },
      volume: {
        name: 'Volume & Capacity',
        icon: '🧪',
        baseUnit: 'l',
        units: {
          l: { name: 'Liter (L)', factor: 1 },
          ml: { name: 'Milliliter (mL)', factor: 0.001 },
          cu_m: { name: 'Cubic Meter (m³)', factor: 1000 },
          cu_cm: { name: 'Cubic Centimeter (cm³)', factor: 0.001 },
          gal_us: { name: 'US Gallon (gal)', factor: 3.785411784 },
          qt_us: { name: 'US Quart (qt)', factor: 0.946352946 },
          pt_us: { name: 'US Pint (pt)', factor: 0.473176473 },
          cup_us: { name: 'US Cup', factor: 0.2365882365 },
          fl_oz_us: { name: 'US Fluid Ounce (fl oz)', factor: 0.0295735295625 },
          tbsp_us: { name: 'US Tablespoon (tbsp)', factor: 0.01478676478125 },
          tsp_us: { name: 'US Teaspoon (tsp)', factor: 0.00492892159375 }
        },
        defaultFrom: 'l',
        defaultTo: 'gal_us'
      }
    };

    this.currentCategory = 'length';
    this.currentFrom = 'm';
    this.currentTo = 'ft';
    this.lastActiveInput = 'from';
  }

  convert(val, fromUnit, toUnit, catKey) {
    if (val === '' || isNaN(val)) return '';
    const num = parseFloat(val);
    const cat = this.definitions[catKey];
    if (!cat) return '';

    if (cat.isNonLinear) {
      return this.convertTemperature(num, fromUnit, toUnit);
    }

    const factorFrom = cat.units[fromUnit]?.factor || 1;
    const factorTo = cat.units[toUnit]?.factor || 1;
    const inBase = num * factorFrom;
    const result = inBase / factorTo;

    return this.formatNumber(result);
  }

  convertTemperature(val, from, to) {
    let inCelsius;
    switch (from) {
      case 'C': inCelsius = val; break;
      case 'F': inCelsius = (val - 32) * (5 / 9); break;
      case 'K': inCelsius = val - 273.15; break;
      case 'R': inCelsius = (val - 491.67) * (5 / 9); break;
      default: inCelsius = val;
    }

    let outVal;
    switch (to) {
      case 'C': outVal = inCelsius; break;
      case 'F': outVal = (inCelsius * 9 / 5) + 32; break;
      case 'K': outVal = inCelsius + 273.15; break;
      case 'R': outVal = (inCelsius + 273.15) * (9 / 5); break;
      default: outVal = inCelsius;
    }

    return this.formatNumber(outVal);
  }

  formatNumber(n) {
    if (isNaN(n)) return '';
    if (Math.abs(n) === 0) return '0';
    if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && Math.abs(n) > 0)) {
      return n.toExponential(6).replace(/\.?0+e/, 'e');
    }
    const fixed = parseFloat(n.toFixed(8));
    return fixed.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }

  initUI(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="converter-card glass-panel">
        <!-- Category Tab Bar -->
        <div class="converter-categories" role="tablist">
          ${Object.keys(this.definitions).map(key => {
            const cat = this.definitions[key];
            const isActive = key === this.currentCategory;
            return `
              <button class="conv-cat-btn ${isActive ? 'active' : ''}" data-cat="${key}">
                <span class="conv-cat-icon">${cat.icon}</span>
                <span class="conv-cat-name">${cat.name.split(' ')[0]}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Conversion Fields -->
        <div class="converter-body">
          <!-- From Field -->
          <div class="converter-field-group">
            <label class="conv-label" for="conv-input-from">From</label>
            <div class="conv-input-row">
              <input type="number" step="any" id="conv-input-from" class="conv-input" value="1" placeholder="0" inputmode="decimal" />
              <select id="conv-select-from" class="conv-select" aria-label="From Unit"></select>
            </div>
          </div>

          <!-- Swap Button -->
          <div class="conv-swap-wrap">
            <button id="conv-btn-swap" class="conv-swap-btn" title="Swap Units" aria-label="Swap Units">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
                <polyline points="17 14 12 9 7 14"></polyline>
                <line x1="12" y1="9" x2="12" y2="21"></line>
              </svg>
            </button>
          </div>

          <!-- To Field -->
          <div class="converter-field-group">
            <label class="conv-label" for="conv-input-to">To</label>
            <div class="conv-input-row">
              <input type="number" step="any" id="conv-input-to" class="conv-input" placeholder="0" inputmode="decimal" />
              <select id="conv-select-to" class="conv-select" aria-label="To Unit"></select>
            </div>
          </div>
        </div>

        <!-- Formula & Quick Copy Bar -->
        <div class="converter-footer">
          <div class="conv-formula" id="conv-formula-text">1 Meter = 3.28084 Feet</div>
          <button id="conv-btn-copy" class="conv-copy-btn" title="Copy result to clipboard">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
        </div>

        <!-- Quick Multi-Unit Reference Table -->
        <div class="conv-quick-table-wrap">
          <div class="conv-quick-title">Common Equivalents:</div>
          <div class="conv-quick-grid" id="conv-quick-grid"></div>
        </div>
      </div>
    `;

    this.dom = {
      fromInput: container.querySelector('#conv-input-from'),
      toInput: container.querySelector('#conv-input-to'),
      fromSelect: container.querySelector('#conv-select-from'),
      toSelect: container.querySelector('#conv-select-to'),
      swapBtn: container.querySelector('#conv-btn-swap'),
      copyBtn: container.querySelector('#conv-btn-copy'),
      formulaText: container.querySelector('#conv-formula-text'),
      quickGrid: container.querySelector('#conv-quick-grid'),
      catButtons: container.querySelectorAll('.conv-cat-btn')
    };

    this.populateUnits();
    this.recalculate('from');
    this.bindEvents();
  }

  populateUnits() {
    const cat = this.definitions[this.currentCategory];
    if (!cat) return;

    const optionsHtml = Object.keys(cat.units).map(key => {
      const u = cat.units[key];
      return `<option value="${key}">${u.name}</option>`;
    }).join('');

    this.dom.fromSelect.innerHTML = optionsHtml;
    this.dom.toSelect.innerHTML = optionsHtml;

    this.currentFrom = cat.defaultFrom;
    this.currentTo = cat.defaultTo;

    this.dom.fromSelect.value = this.currentFrom;
    this.dom.toSelect.value = this.currentTo;
  }

  recalculate(source = 'from') {
    this.lastActiveInput = source;
    const cat = this.definitions[this.currentCategory];
    if (!cat) return;

    if (source === 'from') {
      const val = this.dom.fromInput.value;
      if (val === '' || isNaN(val)) {
        this.dom.toInput.value = '';
      } else {
        const res = this.convert(val, this.currentFrom, this.currentTo, this.currentCategory);
        this.dom.toInput.value = res.replace(/,/g, '');
      }
    } else {
      const val = this.dom.toInput.value;
      if (val === '' || isNaN(val)) {
        this.dom.fromInput.value = '';
      } else {
        const res = this.convert(val, this.currentTo, this.currentFrom, this.currentCategory);
        this.dom.fromInput.value = res.replace(/,/g, '');
      }
    }

    this.updateFormula();
    this.updateQuickTable();
  }

  updateFormula() {
    const cat = this.definitions[this.currentCategory];
    const unit1Name = cat.units[this.currentFrom]?.name || this.currentFrom;
    const unit2Name = cat.units[this.currentTo]?.name || this.currentTo;
    const equiv = this.convert(1, this.currentFrom, this.currentTo, this.currentCategory);
    this.dom.formulaText.textContent = `1 ${unit1Name.split(' ')[0]} = ${equiv} ${unit2Name.split(' ')[0]}`;
  }

  updateQuickTable() {
    const cat = this.definitions[this.currentCategory];
    const baseVal = parseFloat(this.dom.fromInput.value) || 1;
    const units = Object.keys(cat.units).filter(u => u !== this.currentFrom).slice(0, 6);

    this.dom.quickGrid.innerHTML = units.map(u => {
      const converted = this.convert(baseVal, this.currentFrom, u, this.currentCategory);
      const name = cat.units[u].name;
      return `
        <div class="conv-quick-item" title="Click to set as destination unit" data-set-to="${u}">
          <span class="conv-quick-val">${converted}</span>
          <span class="conv-quick-unit">${name.split('(')[0].trim()}</span>
        </div>
      `;
    }).join('');

    this.dom.quickGrid.querySelectorAll('.conv-quick-item').forEach(item => {
      item.addEventListener('click', () => {
        const u = item.getAttribute('data-set-to');
        if (u) {
          this.currentTo = u;
          this.dom.toSelect.value = u;
          this.recalculate('from');
          if (window.soundEngine) window.soundEngine.playKeyClick();
        }
      });
    });
  }

  bindEvents() {
    // Category Switcher
    this.dom.catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const catKey = btn.getAttribute('data-cat');
        if (catKey && catKey !== this.currentCategory) {
          this.dom.catButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentCategory = catKey;
          this.populateUnits();
          this.recalculate('from');
          if (window.soundEngine) window.soundEngine.playOperatorClick();
        }
      });
    });

    // Inputs
    this.dom.fromInput.addEventListener('input', () => this.recalculate('from'));
    this.dom.toInput.addEventListener('input', () => this.recalculate('to'));

    // Selects
    this.dom.fromSelect.addEventListener('change', (e) => {
      this.currentFrom = e.target.value;
      this.recalculate('from');
    });

    this.dom.toSelect.addEventListener('change', (e) => {
      this.currentTo = e.target.value;
      this.recalculate('from');
    });

    // Swap Units
    this.dom.swapBtn.addEventListener('click', () => {
      const tempUnit = this.currentFrom;
      this.currentFrom = this.currentTo;
      this.currentTo = tempUnit;

      this.dom.fromSelect.value = this.currentFrom;
      this.dom.toSelect.value = this.currentTo;

      this.recalculate(this.lastActiveInput);
      if (window.soundEngine) window.soundEngine.playSpecialClick();
    });

    // Copy Result
    this.dom.copyBtn.addEventListener('click', () => {
      const val = this.dom.toInput.value;
      const cat = this.definitions[this.currentCategory];
      const unitName = cat.units[this.currentTo]?.name || '';
      const textToCopy = `${val} ${unitName}`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        if (window.toolsManager) {
          window.toolsManager.showToast('Copied conversion result!');
        }
        if (window.soundEngine) window.soundEngine.playKeyClick();
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (window.toolsManager) window.toolsManager.showToast('Copied to clipboard!');
      });
    });
  }
}

window.UnitConverter = UnitConverter;
