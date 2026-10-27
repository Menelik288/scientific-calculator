/**
 * Timer & Stopwatch Module for All-in-One Tools App
 * Features accurate countdown timer with audio chime & circular ring,
 * and high-precision stopwatch with lap recording.
 */

class TimerStopwatch {
  constructor() {
    this.activeMode = 'timer'; // 'timer' or 'stopwatch'

    // Timer State
    this.timerTotalMs = 300000; // 5 mins default
    this.timerRemainingMs = 300000;
    this.timerInterval = null;
    this.timerEndTime = null;
    this.isTimerRunning = false;

    // Stopwatch State
    this.swStartTime = 0;
    this.swElapsedBeforePause = 0;
    this.swInterval = null;
    this.isSwRunning = false;
    this.laps = [];
  }

  initUI(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="time-card glass-panel">
        <!-- Mode Tabs -->
        <div class="time-tabs" role="tablist">
          <button class="time-tab active" data-mode="timer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Countdown Timer
          </button>
          <button class="time-tab" data-mode="stopwatch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="13" r="8"></circle>
              <path d="M12 9v4l2 2"></path>
              <path d="M5 3L2 6"></path>
              <path d="M22 6l-3-3"></path>
              <path d="M12 2v3"></path>
            </svg>
            Stopwatch
          </button>
        </div>

        <!-- Timer Panel -->
        <div class="time-pane active" id="pane-timer">
          <!-- Circular Progress Ring Display -->
          <div class="timer-ring-container">
            <svg class="timer-ring-svg" viewBox="0 0 260 260">
              <circle class="timer-ring-bg" cx="130" cy="130" r="115"></circle>
              <circle class="timer-ring-progress" id="timer-ring-bar" cx="130" cy="130" r="115"></circle>
            </svg>
            <div class="timer-display-content">
              <div class="timer-time-text" id="timer-time-display">05:00</div>
              <div class="timer-sub-label" id="timer-status-label">Ready</div>
            </div>
          </div>

          <!-- Quick Presets -->
          <div class="timer-presets-row">
            <button class="timer-preset-chip" data-time="60">+1m</button>
            <button class="timer-preset-chip" data-time="300">+5m</button>
            <button class="timer-preset-chip" data-time="600">+10m</button>
            <button class="timer-preset-chip" data-time="1500">+25m (Pomodoro)</button>
            <button class="timer-preset-chip" data-time="1800">+30m</button>
          </div>

          <!-- Custom Time Inputs -->
          <div class="timer-input-group" id="timer-input-group">
            <div class="timer-digit-box">
              <input type="number" id="timer-in-h" class="timer-digit-input" min="0" max="99" value="0" />
              <label>Hours</label>
            </div>
            <span class="timer-colon">:</span>
            <div class="timer-digit-box">
              <input type="number" id="timer-in-m" class="timer-digit-input" min="0" max="59" value="5" />
              <label>Mins</label>
            </div>
            <span class="timer-colon">:</span>
            <div class="timer-digit-box">
              <input type="number" id="timer-in-s" class="timer-digit-input" min="0" max="59" value="0" />
              <label>Secs</label>
            </div>
          </div>

          <!-- Control Buttons -->
          <div class="time-controls-row">
            <button id="timer-btn-reset" class="time-btn time-btn-reset" title="Reset Timer">Reset</button>
            <button id="timer-btn-toggle" class="time-btn time-btn-start" title="Start Timer">Start</button>
          </div>
        </div>

        <!-- Stopwatch Panel -->
        <div class="time-pane" id="pane-stopwatch">
          <!-- Stopwatch Digital Display -->
          <div class="sw-display-box">
            <div class="sw-time-digits">
              <span id="sw-hours">00</span>:<span id="sw-mins">00</span>:<span id="sw-secs">00</span>.<span id="sw-ms" class="sw-ms">00</span>
            </div>
          </div>

          <!-- Stopwatch Controls -->
          <div class="time-controls-row">
            <button id="sw-btn-reset" class="time-btn time-btn-reset">Reset</button>
            <button id="sw-btn-lap" class="time-btn time-btn-lap" disabled>Lap</button>
            <button id="sw-btn-toggle" class="time-btn time-btn-start">Start</button>
          </div>

          <!-- Laps Table -->
          <div class="sw-laps-wrapper" id="sw-laps-wrapper">
            <div class="sw-laps-header">
              <span>Lap</span>
              <span>Split Time</span>
              <span>Total Time</span>
            </div>
            <div class="sw-laps-list" id="sw-laps-list"></div>
          </div>
        </div>
      </div>
    `;

    this.dom = {
      tabs: container.querySelectorAll('.time-tab'),
      panes: container.querySelectorAll('.time-pane'),
      // Timer
      timerDisplay: container.querySelector('#timer-time-display'),
      timerStatus: container.querySelector('#timer-status-label'),
      timerBar: container.querySelector('#timer-ring-bar'),
      timerInH: container.querySelector('#timer-in-h'),
      timerInM: container.querySelector('#timer-in-m'),
      timerInS: container.querySelector('#timer-in-s'),
      timerInputGroup: container.querySelector('#timer-input-group'),
      timerToggleBtn: container.querySelector('#timer-btn-toggle'),
      timerResetBtn: container.querySelector('#timer-btn-reset'),
      timerPresets: container.querySelectorAll('.timer-preset-chip'),
      // Stopwatch
      swHours: container.querySelector('#sw-hours'),
      swMins: container.querySelector('#sw-mins'),
      swSecs: container.querySelector('#sw-secs'),
      swMs: container.querySelector('#sw-ms'),
      swToggleBtn: container.querySelector('#sw-btn-toggle'),
      swLapBtn: container.querySelector('#sw-btn-lap'),
      swResetBtn: container.querySelector('#sw-btn-reset'),
      swLapsList: container.querySelector('#sw-laps-list')
    };

    // Calculate circle circumference for SVG progress
    this.ringRadius = 115;
    this.ringCircumference = 2 * Math.PI * this.ringRadius;
    this.dom.timerBar.style.strokeDasharray = `${this.ringCircumference} ${this.ringCircumference}`;
    this.setTimerProgress(1);

    this.bindEvents();
  }

  bindEvents() {
    // Mode tabs
    this.dom.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode');
        this.dom.tabs.forEach(t => t.classList.remove('active'));
        this.dom.panes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const pane = document.getElementById(`pane-${mode}`);
        if (pane) pane.classList.add('active');

        this.activeMode = mode;
        if (window.soundEngine) window.soundEngine.playOperatorClick();
      });
    });

    // Timer controls
    this.dom.timerToggleBtn.addEventListener('click', () => this.toggleTimer());
    this.dom.timerResetBtn.addEventListener('click', () => this.resetTimer());

    [this.dom.timerInH, this.dom.timerInM, this.dom.timerInS].forEach(input => {
      input.addEventListener('change', () => this.updateTimerFromInputs());
      input.addEventListener('input', () => this.updateTimerFromInputs());
    });

    this.dom.timerPresets.forEach(preset => {
      preset.addEventListener('click', () => {
        const addSecs = parseInt(preset.getAttribute('data-time'), 10) || 60;
        this.setTimerPreset(addSecs);
        if (window.soundEngine) window.soundEngine.playKeyClick();
      });
    });

    // Stopwatch controls
    this.dom.swToggleBtn.addEventListener('click', () => this.toggleStopwatch());
    this.dom.swResetBtn.addEventListener('click', () => this.resetStopwatch());
    this.dom.swLapBtn.addEventListener('click', () => this.recordLap());
  }

  // Timer Methods
  updateTimerFromInputs() {
    if (this.isTimerRunning) return;
    const h = parseInt(this.dom.timerInH.value, 10) || 0;
    const m = parseInt(this.dom.timerInM.value, 10) || 0;
    const s = parseInt(this.dom.timerInS.value, 10) || 0;

    const totalMs = (h * 3600 + m * 60 + s) * 1000;
    this.timerTotalMs = totalMs > 0 ? totalMs : 60000;
    this.timerRemainingMs = this.timerTotalMs;
    this.updateTimerDisplay();
  }

  setTimerPreset(seconds) {
    if (this.isTimerRunning) {
      this.timerTotalMs += seconds * 1000;
      this.timerRemainingMs += seconds * 1000;
      this.timerEndTime += seconds * 1000;
    } else {
      this.timerTotalMs = seconds * 1000;
      this.timerRemainingMs = this.timerTotalMs;

      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;

      this.dom.timerInH.value = h;
      this.dom.timerInM.value = m;
      this.dom.timerInS.value = s;
    }
    this.updateTimerDisplay();
  }

  toggleTimer() {
    if (this.isTimerRunning) {
      // Pause
      this.pauseTimer();
    } else {
      // Start
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timerRemainingMs <= 0) {
      this.updateTimerFromInputs();
    }
    if (this.timerRemainingMs <= 0) return;

    this.isTimerRunning = true;
    this.timerEndTime = Date.now() + this.timerRemainingMs;
    this.dom.timerToggleBtn.textContent = 'Pause';
    this.dom.timerToggleBtn.classList.remove('time-btn-start');
    this.dom.timerToggleBtn.classList.add('time-btn-pause');
    this.dom.timerStatus.textContent = 'Running';

    this.timerInterval = setInterval(() => {
      const now = Date.now();
      this.timerRemainingMs = Math.max(0, this.timerEndTime - now);
      this.updateTimerDisplay();

      if (this.timerRemainingMs <= 0) {
        this.onTimerFinished();
      }
    }, 100);

    if (window.soundEngine) window.soundEngine.playSpecialClick();
  }

  pauseTimer() {
    this.isTimerRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;

    this.dom.timerToggleBtn.textContent = 'Resume';
    this.dom.timerToggleBtn.classList.remove('time-btn-pause');
    this.dom.timerToggleBtn.classList.add('time-btn-start');
    this.dom.timerStatus.textContent = 'Paused';

    if (window.soundEngine) window.soundEngine.playKeyClick();
  }

  resetTimer() {
    this.pauseTimer();
    this.updateTimerFromInputs();
    this.dom.timerToggleBtn.textContent = 'Start';
    this.dom.timerStatus.textContent = 'Ready';
    this.setTimerProgress(1);
    if (window.soundEngine) window.soundEngine.playSpecialClick();
  }

  onTimerFinished() {
    this.pauseTimer();
    this.dom.timerStatus.textContent = 'Time Up!';
    this.dom.timerToggleBtn.textContent = 'Start';
    this.setTimerProgress(0);

    // Audio chime alarm
    this.playAlarmChime();

    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    if (window.toolsManager) window.toolsManager.showToast('⏰ Countdown Timer Finished!');
  }

  playAlarmChime() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.65);
      });
    } catch (e) {}
  }

  updateTimerDisplay() {
    const totalSecs = Math.ceil(this.timerRemainingMs / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    const pad = n => String(n).padStart(2, '0');
    let formatted = `${pad(m)}:${pad(s)}`;
    if (h > 0) formatted = `${pad(h)}:${formatted}`;

    this.dom.timerDisplay.textContent = formatted;

    const progressRatio = this.timerTotalMs > 0 ? this.timerRemainingMs / this.timerTotalMs : 0;
    this.setTimerProgress(progressRatio);
  }

  setTimerProgress(ratio) {
    const offset = this.ringCircumference * (1 - Math.max(0, Math.min(1, ratio)));
    this.dom.timerBar.style.strokeDashoffset = offset;
  }

  // Stopwatch Methods
  toggleStopwatch() {
    if (this.isSwRunning) {
      // Pause
      this.isSwRunning = false;
      cancelAnimationFrame(this.swInterval);
      this.swElapsedBeforePause += performance.now() - this.swStartTime;

      this.dom.swToggleBtn.textContent = 'Resume';
      this.dom.swToggleBtn.classList.remove('time-btn-pause');
      this.dom.swToggleBtn.classList.add('time-btn-start');
      this.dom.swLapBtn.disabled = true;
      if (window.soundEngine) window.soundEngine.playKeyClick();
    } else {
      // Start
      this.isSwRunning = true;
      this.swStartTime = performance.now();
      this.dom.swToggleBtn.textContent = 'Pause';
      this.dom.swToggleBtn.classList.remove('time-btn-start');
      this.dom.swToggleBtn.classList.add('time-btn-pause');
      this.dom.swLapBtn.disabled = false;

      const loop = () => {
        if (!this.isSwRunning) return;
        const currentElapsed = this.swElapsedBeforePause + (performance.now() - this.swStartTime);
        this.renderStopwatchTime(currentElapsed);
        this.swInterval = requestAnimationFrame(loop);
      };
      this.swInterval = requestAnimationFrame(loop);

      if (window.soundEngine) window.soundEngine.playSpecialClick();
    }
  }

  renderStopwatchTime(totalMs) {
    const ms = Math.floor((totalMs % 1000) / 10);
    const totalSecs = Math.floor(totalMs / 1000);
    const s = totalSecs % 60;
    const m = Math.floor((totalSecs / 60) % 60);
    const h = Math.floor(totalSecs / 3600);

    const pad = n => String(n).padStart(2, '0');
    this.dom.swHours.textContent = pad(h);
    this.dom.swMins.textContent = pad(m);
    this.dom.swSecs.textContent = pad(s);
    this.dom.swMs.textContent = pad(ms);
  }

  resetStopwatch() {
    this.isSwRunning = false;
    cancelAnimationFrame(this.swInterval);
    this.swElapsedBeforePause = 0;
    this.laps = [];

    this.renderStopwatchTime(0);
    this.dom.swToggleBtn.textContent = 'Start';
    this.dom.swToggleBtn.classList.remove('time-btn-pause');
    this.dom.swToggleBtn.classList.add('time-btn-start');
    this.dom.swLapBtn.disabled = true;
    this.dom.swLapsList.innerHTML = '';

    if (window.soundEngine) window.soundEngine.playSpecialClick();
  }

  recordLap() {
    if (!this.isSwRunning) return;

    const totalElapsed = this.swElapsedBeforePause + (performance.now() - this.swStartTime);
    const previousTotal = this.laps.length > 0 ? this.laps[0].totalMs : 0;
    const lapTime = totalElapsed - previousTotal;

    const lapObj = {
      index: this.laps.length + 1,
      lapMs: lapTime,
      totalMs: totalElapsed
    };

    this.laps.unshift(lapObj); // newest first
    this.renderLaps();

    if (window.soundEngine) window.soundEngine.playKeyClick();
  }

  renderLaps() {
    if (this.laps.length === 0) {
      this.dom.swLapsList.innerHTML = '';
      return;
    }

    // Determine fastest and slowest
    let fastestLapIdx = -1;
    let slowestLapIdx = -1;
    if (this.laps.length >= 2) {
      let minMs = Infinity;
      let maxMs = -Infinity;
      this.laps.forEach(l => {
        if (l.lapMs < minMs) { minMs = l.lapMs; fastestLapIdx = l.index; }
        if (l.lapMs > maxMs) { maxMs = l.lapMs; slowestLapIdx = l.index; }
      });
    }

    const formatLap = ms => {
      const millis = Math.floor((ms % 1000) / 10);
      const totalSecs = Math.floor(ms / 1000);
      const s = totalSecs % 60;
      const m = Math.floor((totalSecs / 60) % 60);
      const pad = n => String(n).padStart(2, '0');
      return `${pad(m)}:${pad(s)}.${pad(millis)}`;
    };

    this.dom.swLapsList.innerHTML = this.laps.map(lap => {
      let badgeClass = '';
      if (lap.index === fastestLapIdx) badgeClass = 'lap-fastest';
      if (lap.index === slowestLapIdx) badgeClass = 'lap-slowest';

      return `
        <div class="sw-lap-row ${badgeClass}">
          <span class="lap-num">Lap ${lap.index}</span>
          <span class="lap-split">${formatLap(lap.lapMs)}</span>
          <span class="lap-total">${formatLap(lap.totalMs)}</span>
        </div>
      `;
    }).join('');
  }
}

window.TimerStopwatch = TimerStopwatch;
