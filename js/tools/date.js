/**
 * Date & Age Calculator Module for All-in-One Tools App
 * Features:
 * 1. Age from Date of Birth (Exact Years, Months, Days + Total Stats + Next Birthday Countdown)
 * 2. Days Between Two Dates (Calendar Days, Weeks + Days, Workdays)
 * 3. Time Remaining / Date Countdown (Live ticking countdown to future event)
 * 4. Add / Subtract Days from a Date
 */

class DateCalculator {
  constructor() {
    this.countdownInterval = null;
  }

  initUI(container) {
    if (!container) return;

    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="date-calc-container glass-panel">
        <!-- Sub-Tabs -->
        <div class="date-tabs" role="tablist">
          <button class="date-tab active" data-tab="age">Age Calculator</button>
          <button class="date-tab" data-tab="diff">Days Between Dates</button>
          <button class="date-tab" data-tab="countdown">Date Countdown</button>
          <button class="date-tab" data-tab="addsub">Add/Subtract Days</button>
        </div>

        <!-- 1. Age Calculator Pane -->
        <div class="date-pane active" id="pane-date-age">
          <div class="date-field-grid">
            <div class="date-field">
              <label>Date of Birth:</label>
              <input type="date" id="age-dob-input" class="date-input" value="2000-01-15" />
            </div>
            <div class="date-field">
              <label>Age as of Date:</label>
              <input type="date" id="age-target-input" class="date-input" value="${todayStr}" />
            </div>
          </div>

          <!-- Primary Age Result Box -->
          <div class="date-primary-res-card">
            <div class="date-res-label">Your Exact Age:</div>
            <div class="date-res-main" id="age-res-main">-- Years, -- Months, -- Days</div>
            <div class="date-next-bday" id="age-res-nextbday">Next Birthday in: -- days</div>
          </div>

          <!-- Age Summary Stats -->
          <div class="date-stats-grid">
            <div class="date-stat-card">
              <span class="date-stat-num" id="age-stat-months">--</span>
              <span class="date-stat-name">Total Months</span>
            </div>
            <div class="date-stat-card">
              <span class="date-stat-num" id="age-stat-weeks">--</span>
              <span class="date-stat-name">Total Weeks</span>
            </div>
            <div class="date-stat-card">
              <span class="date-stat-num" id="age-stat-days">--</span>
              <span class="date-stat-name">Total Days</span>
            </div>
            <div class="date-stat-card">
              <span class="date-stat-num" id="age-stat-hours">--</span>
              <span class="date-stat-name">Total Hours</span>
            </div>
          </div>
        </div>

        <!-- 2. Days Between Dates Pane -->
        <div class="date-pane" id="pane-date-diff">
          <div class="date-field-grid">
            <div class="date-field">
              <label>Start Date:</label>
              <input type="date" id="diff-start-input" class="date-input" value="${todayStr}" />
            </div>
            <div class="date-field">
              <label>End Date:</label>
              <input type="date" id="diff-end-input" class="date-input" value="2027-01-01" />
            </div>
          </div>

          <div class="date-primary-res-card">
            <div class="date-res-label">Difference:</div>
            <div class="date-res-main" id="diff-res-days">-- Days</div>
            <div class="date-next-bday" id="diff-res-weeks">-- Weeks and -- Days</div>
          </div>

          <div class="date-stats-grid">
            <div class="date-stat-card">
              <span class="date-stat-num" id="diff-stat-workdays">--</span>
              <span class="date-stat-name">Workdays (Mon-Fri)</span>
            </div>
            <div class="date-stat-card">
              <span class="date-stat-num" id="diff-stat-weekends">--</span>
              <span class="date-stat-name">Weekend Days</span>
            </div>
          </div>
        </div>

        <!-- 3. Date Countdown Pane -->
        <div class="date-pane" id="pane-date-countdown">
          <div class="date-field-grid">
            <div class="date-field">
              <label>Event / Target Date & Time:</label>
              <input type="datetime-local" id="countdown-target-input" class="date-input" value="2027-01-01T00:00" />
            </div>
          </div>

          <div class="countdown-clock-card">
            <div class="countdown-unit">
              <span class="countdown-number" id="cd-days">00</span>
              <span class="countdown-label">Days</span>
            </div>
            <span class="cd-colon">:</span>
            <div class="countdown-unit">
              <span class="countdown-number" id="cd-hours">00</span>
              <span class="countdown-label">Hours</span>
            </div>
            <span class="cd-colon">:</span>
            <div class="countdown-unit">
              <span class="countdown-number" id="cd-mins">00</span>
              <span class="countdown-label">Mins</span>
            </div>
            <span class="cd-colon">:</span>
            <div class="countdown-unit">
              <span class="countdown-number" id="cd-secs">00</span>
              <span class="countdown-label">Secs</span>
            </div>
          </div>
          <div class="countdown-status" id="cd-status">Ticking towards event...</div>
        </div>

        <!-- 4. Add / Subtract Days Pane -->
        <div class="date-pane" id="pane-date-addsub">
          <div class="date-field-grid">
            <div class="date-field">
              <label>Starting Date:</label>
              <input type="date" id="addsub-start-input" class="date-input" value="${todayStr}" />
            </div>
            <div class="date-field">
              <label>Operation:</label>
              <select id="addsub-op-input" class="date-select">
                <option value="add">Add (+)</option>
                <option value="sub">Subtract (-)</option>
              </select>
            </div>
            <div class="date-field">
              <label>Days:</label>
              <input type="number" id="addsub-days-input" class="date-input" value="30" min="0" />
            </div>
          </div>

          <div class="date-primary-res-card">
            <div class="date-res-label">Calculated Date:</div>
            <div class="date-res-main" id="addsub-res-date">--</div>
            <div class="date-next-bday" id="addsub-res-dayname">--</div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.calculateAge();
    this.calculateDiff();
    this.startCountdown();
    this.calculateAddSub();
  }

  bindEvents(container) {
    // Tabs
    const tabs = container.querySelectorAll('.date-tab');
    const panes = container.querySelectorAll('.date-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = container.querySelector(`#pane-date-${target}`);
        if (targetPane) targetPane.classList.add('active');

        if (window.soundEngine) window.soundEngine.playOperatorClick();
      });
    });

    // 1. Age inputs
    const dob = container.querySelector('#age-dob-input');
    const target = container.querySelector('#age-target-input');
    [dob, target].forEach(el => el.addEventListener('change', () => this.calculateAge()));

    // 2. Diff inputs
    const start = container.querySelector('#diff-start-input');
    const end = container.querySelector('#diff-end-input');
    [start, end].forEach(el => el.addEventListener('change', () => this.calculateDiff()));

    // 3. Countdown
    const cdTarget = container.querySelector('#countdown-target-input');
    cdTarget.addEventListener('change', () => this.startCountdown());

    // 4. Add/Sub
    const asStart = container.querySelector('#addsub-start-input');
    const asOp = container.querySelector('#addsub-op-input');
    const asDays = container.querySelector('#addsub-days-input');
    [asStart, asOp, asDays].forEach(el => {
      el.addEventListener('input', () => this.calculateAddSub());
      el.addEventListener('change', () => this.calculateAddSub());
    });
  }

  calculateAge() {
    const dobVal = document.getElementById('age-dob-input')?.value;
    const targetVal = document.getElementById('age-target-input')?.value;
    if (!dobVal || !targetVal) return;

    const dob = new Date(dobVal + 'T00:00:00');
    const target = new Date(targetVal + 'T00:00:00');

    if (dob > target) {
      document.getElementById('age-res-main').textContent = 'Date of birth cannot be after target date.';
      return;
    }

    let y = target.getFullYear() - dob.getFullYear();
    let m = target.getMonth() - dob.getMonth();
    let d = target.getDate() - dob.getDate();

    if (d < 0) {
      m -= 1;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      d += prevMonth.getDate();
    }

    if (m < 0) {
      y -= 1;
      m += 12;
    }

    document.getElementById('age-res-main').textContent = `${y} Years, ${m} Months, ${d} Days`;

    // Total stats
    const diffMs = target.getTime() - dob.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (y * 12) + m;
    const totalHours = totalDays * 24;

    document.getElementById('age-stat-months').textContent = totalMonths.toLocaleString();
    document.getElementById('age-stat-weeks').textContent = totalWeeks.toLocaleString();
    document.getElementById('age-stat-days').textContent = totalDays.toLocaleString();
    document.getElementById('age-stat-hours').textContent = totalHours.toLocaleString();

    // Next birthday calculation
    const nextBday = new Date(target.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(target.getFullYear() + 1);
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextBdayDayName = dayNames[nextBday.getDay()];

    const nextBdayEl = document.getElementById('age-res-nextbday');
    if (nextBdayEl) {
      if (daysToNextBday === 0) {
        nextBdayEl.textContent = '🎉 Happy Birthday Today!';
      } else {
        nextBdayEl.textContent = `Next Birthday: ${daysToNextBday} day${daysToNextBday > 1 ? 's' : ''} away (on a ${nextBdayDayName})`;
      }
    }
  }

  calculateDiff() {
    const sVal = document.getElementById('diff-start-input')?.value;
    const eVal = document.getElementById('diff-end-input')?.value;
    if (!sVal || !eVal) return;

    const start = new Date(sVal + 'T00:00:00');
    const end = new Date(eVal + 'T00:00:00');

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;

    document.getElementById('diff-res-days').textContent = `${totalDays.toLocaleString()} Days`;
    document.getElementById('diff-res-weeks').textContent = `Equivalent to ${weeks} week${weeks !== 1 ? 's' : ''} and ${remDays} day${remDays !== 1 ? 's' : ''}`;

    // Workdays calculation (Mon-Fri)
    let workdays = 0;
    let weekends = 0;
    const cur = new Date(Math.min(start.getTime(), end.getTime()));
    const stop = new Date(Math.max(start.getTime(), end.getTime()));

    while (cur < stop) {
      const day = cur.getDay();
      if (day === 0 || day === 6) {
        weekends++;
      } else {
        workdays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    document.getElementById('diff-stat-workdays').textContent = workdays.toLocaleString();
    document.getElementById('diff-stat-weekends').textContent = weekends.toLocaleString();
  }

  startCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    const update = () => {
      const targetVal = document.getElementById('countdown-target-input')?.value;
      if (!targetVal) return;

      const target = new Date(targetVal);
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();

      const cdDays = document.getElementById('cd-days');
      const cdHours = document.getElementById('cd-hours');
      const cdMins = document.getElementById('cd-mins');
      const cdSecs = document.getElementById('cd-secs');
      const cdStatus = document.getElementById('cd-status');

      if (!cdDays) return;

      if (diffMs <= 0) {
        cdDays.textContent = '00';
        cdHours.textContent = '00';
        cdMins.textContent = '00';
        cdSecs.textContent = '00';
        if (cdStatus) cdStatus.textContent = 'Target date reached!';
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const d = Math.floor(totalSecs / 86400);
      const h = Math.floor((totalSecs % 86400) / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;

      const pad = n => String(n).padStart(2, '0');
      cdDays.textContent = pad(d);
      cdHours.textContent = pad(h);
      cdMins.textContent = pad(m);
      cdSecs.textContent = pad(s);

      if (cdStatus) cdStatus.textContent = `Target: ${target.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}`;
    };

    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  calculateAddSub() {
    const startVal = document.getElementById('addsub-start-input')?.value;
    const op = document.getElementById('addsub-op-input')?.value || 'add';
    const days = parseInt(document.getElementById('addsub-days-input')?.value, 10) || 0;

    if (!startVal) return;

    const date = new Date(startVal + 'T00:00:00');
    if (op === 'add') {
      date.setDate(date.getDate() + days);
    } else {
      date.setDate(date.getDate() - days);
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);

    const resDateEl = document.getElementById('addsub-res-date');
    const resDayEl = document.getElementById('addsub-res-dayname');

    if (resDateEl) resDateEl.textContent = date.toISOString().split('T')[0];
    if (resDayEl) resDayEl.textContent = dateStr;
  }
}

window.DateCalculator = DateCalculator;
