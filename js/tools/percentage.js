/**
 * Percentage & Discount Calculator Module for All-in-One Tools App
 * Features 4 dedicated calculators:
 * 1. Simple Percentage ("What is X% of Y?" & "X is what % of Y?")
 * 2. Discount & Sales Tax (Original Price + % Off + Tax -> Final Price & Savings)
 * 3. Percentage Increase / Decrease (From Value A to Value B -> % Change & Difference)
 * 4. Percentage Difference (Difference between two numbers relative to average)
 */

class PercentageCalculator {
  constructor() {
    this.activeCard = 'pct-basic';
  }

  initUI(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="pct-container glass-panel">
        <!-- Sub-Tool Navigation Pills -->
        <div class="pct-nav-tabs" role="tablist">
          <button class="pct-tab active" data-tab="basic">Percent of Value</button>
          <button class="pct-tab" data-tab="discount">Discount & Tax</button>
          <button class="pct-tab" data-tab="change">Increase / Decrease</button>
          <button class="pct-tab" data-tab="difference">Percent Difference</button>
        </div>

        <!-- 1. Basic Percentage Card -->
        <div class="pct-card active" id="pane-pct-basic">
          <div class="pct-card-title">What is X% of Y?</div>
          <div class="pct-calc-row">
            <span class="pct-word">What is</span>
            <input type="number" id="pct-basic-pct" class="pct-input" value="15" step="any" placeholder="%" />
            <span class="pct-word">% of</span>
            <input type="number" id="pct-basic-val" class="pct-input" value="200" step="any" placeholder="Value" />
            <span class="pct-word">?</span>
          </div>
          <div class="pct-result-box">
            <span class="pct-result-label">Result:</span>
            <span class="pct-result-val" id="pct-basic-res">30</span>
            <button class="pct-copy-btn" data-copy-target="#pct-basic-res" title="Copy result">Copy</button>
          </div>

          <div class="pct-divider"></div>

          <div class="pct-card-title">X is what % of Y?</div>
          <div class="pct-calc-row">
            <input type="number" id="pct-rev-x" class="pct-input" value="45" step="any" placeholder="X" />
            <span class="pct-word">is what % of</span>
            <input type="number" id="pct-rev-y" class="pct-input" value="180" step="any" placeholder="Y" />
            <span class="pct-word">?</span>
          </div>
          <div class="pct-result-box">
            <span class="pct-result-label">Result:</span>
            <span class="pct-result-val" id="pct-rev-res">25%</span>
            <button class="pct-copy-btn" data-copy-target="#pct-rev-res" title="Copy result">Copy</button>
          </div>
        </div>

        <!-- 2. Discount & Tax Card -->
        <div class="pct-card" id="pane-pct-discount">
          <div class="pct-card-title">Discount & Sales Tax Calculator</div>
          <div class="pct-form-grid">
            <div class="pct-field">
              <label>Original Price ($):</label>
              <input type="number" id="disc-price" class="pct-input" value="120" step="any" placeholder="100.00" />
            </div>
            <div class="pct-field">
              <label>Discount (% off):</label>
              <input type="number" id="disc-percent" class="pct-input" value="25" step="any" placeholder="20" />
            </div>
            <div class="pct-field">
              <label>Sales Tax (% optional):</label>
              <input type="number" id="disc-tax" class="pct-input" value="8" step="any" placeholder="0" />
            </div>
          </div>

          <div class="pct-breakdown-card">
            <div class="pct-breakdown-row">
              <span>Final Price:</span>
              <strong class="pct-highlight-val" id="disc-res-final">$97.20</strong>
            </div>
            <div class="pct-breakdown-row">
              <span>You Save:</span>
              <span class="pct-savings" id="disc-res-savings">$30.00 (25%)</span>
            </div>
            <div class="pct-breakdown-row">
              <span>Tax Amount:</span>
              <span id="disc-res-tax">$7.20</span>
            </div>
          </div>
        </div>

        <!-- 3. Percentage Increase / Decrease -->
        <div class="pct-card" id="pane-pct-change">
          <div class="pct-card-title">Percentage Increase or Decrease</div>
          <div class="pct-calc-row">
            <span class="pct-word">From:</span>
            <input type="number" id="change-v1" class="pct-input" value="50" step="any" placeholder="Initial" />
            <span class="pct-word">To:</span>
            <input type="number" id="change-v2" class="pct-input" value="75" step="any" placeholder="Final" />
          </div>
          <div class="pct-breakdown-card">
            <div class="pct-breakdown-row">
              <span>Percentage Change:</span>
              <strong class="pct-highlight-val" id="change-res-pct">+50.00% (Increase)</strong>
            </div>
            <div class="pct-breakdown-row">
              <span>Difference:</span>
              <span id="change-res-diff">+25</span>
            </div>
          </div>
        </div>

        <!-- 4. Percentage Difference -->
        <div class="pct-card" id="pane-pct-difference">
          <div class="pct-card-title">Percentage Difference Between Two Values</div>
          <div class="pct-calc-row">
            <span class="pct-word">Value 1:</span>
            <input type="number" id="diff-v1" class="pct-input" value="80" step="any" placeholder="First" />
            <span class="pct-word">Value 2:</span>
            <input type="number" id="diff-v2" class="pct-input" value="100" step="any" placeholder="Second" />
          </div>
          <div class="pct-breakdown-card">
            <div class="pct-breakdown-row">
              <span>Percentage Difference:</span>
              <strong class="pct-highlight-val" id="diff-res-pct">22.22%</strong>
            </div>
            <div class="pct-breakdown-row">
              <span>Formula:</span>
              <span class="pct-formula-note">|V1 - V2| ÷ ((V1 + V2) / 2) × 100</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.calcBasic();
    this.calcDiscount();
    this.calcChange();
    this.calcDifference();
  }

  bindEvents(container) {
    // Tabs
    const tabs = container.querySelectorAll('.pct-tab');
    const panes = container.querySelectorAll('.pct-card');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = container.querySelector(`#pane-pct-${target}`);
        if (targetPane) targetPane.classList.add('active');

        if (window.soundEngine) window.soundEngine.playOperatorClick();
      });
    });

    // 1. Basic
    const basicPct = container.querySelector('#pct-basic-pct');
    const basicVal = container.querySelector('#pct-basic-val');
    [basicPct, basicVal].forEach(el => el.addEventListener('input', () => this.calcBasic()));

    const revX = container.querySelector('#pct-rev-x');
    const revY = container.querySelector('#pct-rev-y');
    [revX, revY].forEach(el => el.addEventListener('input', () => this.calcReverse()));

    // 2. Discount
    const discPrice = container.querySelector('#disc-price');
    const discPct = container.querySelector('#disc-percent');
    const discTax = container.querySelector('#disc-tax');
    [discPrice, discPct, discTax].forEach(el => el.addEventListener('input', () => this.calcDiscount()));

    // 3. Change
    const changeV1 = container.querySelector('#change-v1');
    const changeV2 = container.querySelector('#change-v2');
    [changeV1, changeV2].forEach(el => el.addEventListener('input', () => this.calcChange()));

    // 4. Difference
    const diffV1 = container.querySelector('#diff-v1');
    const diffV2 = container.querySelector('#diff-v2');
    [diffV1, diffV2].forEach(el => el.addEventListener('input', () => this.calcDifference()));

    // Copy buttons
    container.querySelectorAll('.pct-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-copy-target');
        const targetEl = container.querySelector(sel);
        if (targetEl) {
          navigator.clipboard.writeText(targetEl.textContent.trim());
          if (window.toolsManager) window.toolsManager.showToast('Copied percentage result!');
          if (window.soundEngine) window.soundEngine.playKeyClick();
        }
      });
    });
  }

  calcBasic() {
    const p = parseFloat(document.getElementById('pct-basic-pct')?.value) || 0;
    const v = parseFloat(document.getElementById('pct-basic-val')?.value) || 0;
    const res = (p / 100) * v;
    const resEl = document.getElementById('pct-basic-res');
    if (resEl) resEl.textContent = this.format(res);
  }

  calcReverse() {
    const x = parseFloat(document.getElementById('pct-rev-x')?.value) || 0;
    const y = parseFloat(document.getElementById('pct-rev-y')?.value) || 0;
    const resEl = document.getElementById('pct-rev-res');
    if (!resEl) return;
    if (y === 0) {
      resEl.textContent = 'Undefined';
    } else {
      const res = (x / y) * 100;
      resEl.textContent = `${this.format(res)}%`;
    }
  }

  calcDiscount() {
    const price = parseFloat(document.getElementById('disc-price')?.value) || 0;
    const disc = parseFloat(document.getElementById('disc-percent')?.value) || 0;
    const tax = parseFloat(document.getElementById('disc-tax')?.value) || 0;

    const discountAmount = price * (disc / 100);
    const salePrice = price - discountAmount;
    const taxAmount = salePrice * (tax / 100);
    const finalPrice = salePrice + taxAmount;

    const finalEl = document.getElementById('disc-res-final');
    const savingsEl = document.getElementById('disc-res-savings');
    const taxEl = document.getElementById('disc-res-tax');

    if (finalEl) finalEl.textContent = `$${this.format(finalPrice)}`;
    if (savingsEl) savingsEl.textContent = `$${this.format(discountAmount)} (${disc}%)`;
    if (taxEl) taxEl.textContent = `$${this.format(taxAmount)}`;
  }

  calcChange() {
    const v1 = parseFloat(document.getElementById('change-v1')?.value);
    const v2 = parseFloat(document.getElementById('change-v2')?.value);
    const pctEl = document.getElementById('change-res-pct');
    const diffEl = document.getElementById('change-res-diff');
    if (!pctEl || !diffEl) return;

    if (isNaN(v1) || isNaN(v2)) {
      pctEl.textContent = '---';
      diffEl.textContent = '---';
      return;
    }

    const diff = v2 - v1;
    diffEl.textContent = (diff > 0 ? '+' : '') + this.format(diff);

    if (v1 === 0) {
      pctEl.textContent = 'Undefined (Initial value is 0)';
      return;
    }

    const pctChange = (diff / Math.abs(v1)) * 100;
    const isIncrease = pctChange >= 0;
    pctEl.textContent = `${isIncrease ? '+' : ''}${this.format(pctChange)}% (${isIncrease ? 'Increase' : 'Decrease'})`;
    pctEl.style.color = isIncrease ? '#34c759' : '#ff453a';
  }

  calcDifference() {
    const v1 = parseFloat(document.getElementById('diff-v1')?.value);
    const v2 = parseFloat(document.getElementById('diff-v2')?.value);
    const resEl = document.getElementById('diff-res-pct');
    if (!resEl) return;

    if (isNaN(v1) || isNaN(v2)) {
      resEl.textContent = '---';
      return;
    }

    const avg = (v1 + v2) / 2;
    if (avg === 0) {
      resEl.textContent = '0%';
      return;
    }

    const pctDiff = (Math.abs(v1 - v2) / Math.abs(avg)) * 100;
    resEl.textContent = `${this.format(pctDiff)}%`;
  }

  format(num) {
    if (isNaN(num)) return '0';
    return Number(num.toFixed(4)).toLocaleString('en-US', { maximumFractionDigits: 4 });
  }
}

window.PercentageCalculator = PercentageCalculator;
