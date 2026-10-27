/**
 * Hardware Utilities & Sensors Module for All-in-One Tools App
 * Features:
 * 1. Flashlight (Full-screen pure light, color changer, brightness, strobe, SOS & Camera Torch)
 * 2. Digital Compass (Heading degrees, 16-point cardinal rose, interactive fallback)
 * 3. Bubble Level / Clinometer (Pitch & Roll, 2D circular target, tubular vials, level snap)
 */

class SensorUtilities {
  constructor() {
    this.activeUtility = 'flashlight'; // 'flashlight', 'compass', 'level'

    // Flashlight
    this.isLightOn = false;
    this.lightBrightness = 100;
    this.lightColor = '#ffffff';
    this.isStrobeOn = false;
    this.strobeInterval = null;
    this.strobeHz = 5;
    this.isSosOn = false;
    this.sosTimeout = null;
    this.cameraTorchStream = null;
    this.hasHardwareTorch = false;

    // Compass
    this.heading = 0;
    this.compassListening = false;

    // Level
    this.pitch = 0; // beta
    this.roll = 0;  // gamma
    this.levelListening = false;
  }

  initUI(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="sensor-container glass-panel">
        <!-- Sub-Tabs -->
        <div class="sensor-tabs" role="tablist">
          <button class="sensor-tab active" data-tab="flashlight">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6l-6-4-6 4v3l3 2v8h6v-8l3-2V6z"></path>
              <line x1="12" y1="13" x2="12" y2="13.01"></line>
            </svg>
            Flashlight
          </button>
          <button class="sensor-tab" data-tab="compass">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            Compass
          </button>
          <button class="sensor-tab" data-tab="level">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            Bubble Level
          </button>
        </div>

        <!-- 1. Flashlight Pane -->
        <div class="sensor-pane active" id="pane-sensor-flashlight">
          <div class="torch-control-center">
            <!-- Main Power Button -->
            <button id="torch-power-btn" class="torch-power-btn" title="Toggle Flashlight">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                <line x1="12" y1="2" x2="12" y2="12"></line>
              </svg>
            </button>
            <div class="torch-status-text" id="torch-status-text">OFF</div>

            <!-- Hardware Camera Torch Toggle -->
            <button id="torch-btn-camera" class="torch-hw-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>LED Camera Torch</span>
            </button>
          </div>

          <!-- Color Swatches -->
          <div class="torch-options-card">
            <label class="torch-option-label">Light Color:</label>
            <div class="torch-colors-row">
              <button class="torch-color-swatch active" data-color="#ffffff" style="background:#ffffff;" title="Pure White"></button>
              <button class="torch-color-swatch" data-color="#fff4e0" style="background:#fff4e0;" title="Warm White"></button>
              <button class="torch-color-swatch" data-color="#ff9500" style="background:#ff9500;" title="Amber"></button>
              <button class="torch-color-swatch" data-color="#ff3b30" style="background:#ff3b30;" title="Night Vision Red"></button>
              <button class="torch-color-swatch" data-color="#34c759" style="background:#34c759;" title="Emerald"></button>
              <button class="torch-color-swatch" data-color="#007aff" style="background:#007aff;" title="Sapphire"></button>
            </div>

            <!-- Brightness Slider -->
            <label class="torch-option-label" for="torch-brightness-slider">Screen Brightness: <span id="torch-brightness-val">100%</span></label>
            <input type="range" id="torch-brightness-slider" min="10" max="100" value="100" class="torch-slider" />

            <!-- Modes: Strobe & SOS -->
            <div class="torch-modes-row">
              <button id="torch-btn-strobe" class="torch-mode-btn">Strobe</button>
              <button id="torch-btn-sos" class="torch-mode-btn">SOS Morse</button>
            </div>
          </div>
        </div>

        <!-- 2. Compass Pane -->
        <div class="sensor-pane" id="pane-sensor-compass">
          <div class="compass-dial-container">
            <div class="compass-dial" id="compass-dial">
              <div class="compass-arrow-north"></div>
              <div class="compass-arrow-south"></div>
              <div class="compass-cardinal compass-n">N</div>
              <div class="compass-cardinal compass-e">E</div>
              <div class="compass-cardinal compass-s">S</div>
              <div class="compass-cardinal compass-w">W</div>
              <div class="compass-ticks"></div>
            </div>
            <div class="compass-needle-center"></div>
          </div>

          <div class="compass-readout-card">
            <div class="compass-degree-big"><span id="compass-deg-val">0</span>°</div>
            <div class="compass-cardinal-name" id="compass-dir-val">North (N)</div>
            <div class="compass-subtext">Rotate device or drag dial to test</div>
          </div>
        </div>

        <!-- 3. Bubble Level Pane -->
        <div class="sensor-pane" id="pane-sensor-level">
          <!-- Circular 2D Bullseye Level -->
          <div class="bullseye-level-container">
            <div class="bullseye-target">
              <div class="bullseye-cross-h"></div>
              <div class="bullseye-cross-v"></div>
              <div class="bullseye-inner-circle"></div>
              <div class="bullseye-bubble" id="level-bubble-2d"></div>
            </div>
          </div>

          <!-- Tubular Levels & Numerical Readout -->
          <div class="level-readouts-grid">
            <div class="level-axis-card">
              <span class="level-axis-label">Roll (X):</span>
              <span class="level-axis-deg" id="level-val-roll">0.0°</span>
              <!-- Horizontal Tube -->
              <div class="level-tube-h">
                <div class="level-tube-center-marks"></div>
                <div class="level-tube-bubble-h" id="tube-bubble-h"></div>
              </div>
            </div>

            <div class="level-axis-card">
              <span class="level-axis-label">Pitch (Y):</span>
              <span class="level-axis-deg" id="level-val-pitch">0.0°</span>
              <!-- Horizontal representation for pitch -->
              <div class="level-tube-h">
                <div class="level-tube-center-marks"></div>
                <div class="level-tube-bubble-h" id="tube-bubble-v"></div>
              </div>
            </div>
          </div>

          <div class="level-status-pill" id="level-status-pill">Level: Tilting</div>
        </div>
      </div>

      <!-- Full-screen Torch Light Curtain -->
      <div class="torch-fullscreen-overlay" id="torch-fullscreen-overlay">
        <button id="torch-exit-fullscreen" class="torch-exit-btn">Tap to Exit</button>
      </div>
    `;

    this.dom = {
      tabs: container.querySelectorAll('.sensor-tab'),
      panes: container.querySelectorAll('.sensor-pane'),
      // Torch
      powerBtn: container.querySelector('#torch-power-btn'),
      statusText: container.querySelector('#torch-status-text'),
      cameraBtn: container.querySelector('#torch-btn-camera'),
      colorSwatches: container.querySelectorAll('.torch-color-swatch'),
      brightnessSlider: container.querySelector('#torch-brightness-slider'),
      brightnessVal: container.querySelector('#torch-brightness-val'),
      strobeBtn: container.querySelector('#torch-btn-strobe'),
      sosBtn: container.querySelector('#torch-btn-sos'),
      fullscreenOverlay: container.querySelector('#torch-fullscreen-overlay'),
      exitFullscreenBtn: container.querySelector('#torch-exit-fullscreen'),
      // Compass
      dial: container.querySelector('#compass-dial'),
      degVal: container.querySelector('#compass-deg-val'),
      dirVal: container.querySelector('#compass-dir-val'),
      // Level
      bubble2D: container.querySelector('#level-bubble-2d'),
      tubeBubbleH: container.querySelector('#tube-bubble-h'),
      tubeBubbleV: container.querySelector('#tube-bubble-v'),
      valRoll: container.querySelector('#level-val-roll'),
      valPitch: container.querySelector('#level-val-pitch'),
      statusPill: container.querySelector('#level-status-pill')
    };

    this.bindEvents();
    this.initSensors();
  }

  bindEvents() {
    // Mode tabs
    this.dom.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        this.dom.tabs.forEach(t => t.classList.remove('active'));
        this.dom.panes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = document.getElementById(`pane-sensor-${target}`);
        if (targetPane) targetPane.classList.add('active');

        this.activeUtility = target;
        if (window.soundEngine) window.soundEngine.playOperatorClick();
      });
    });

    // Flashlight actions
    this.dom.powerBtn.addEventListener('click', () => this.toggleLight());
    this.dom.exitFullscreenBtn.addEventListener('click', () => this.toggleLight(false));
    this.dom.fullscreenOverlay.addEventListener('click', (e) => {
      if (e.target === this.dom.fullscreenOverlay) this.toggleLight(false);
    });

    this.dom.colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        this.dom.colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.lightColor = swatch.getAttribute('data-color') || '#ffffff';
        this.updateTorchLight();
      });
    });

    this.dom.brightnessSlider.addEventListener('input', (e) => {
      this.lightBrightness = parseInt(e.target.value, 10);
      this.dom.brightnessVal.textContent = `${this.lightBrightness}%`;
      this.updateTorchLight();
    });

    this.dom.cameraBtn.addEventListener('click', () => this.toggleCameraTorch());
    this.dom.strobeBtn.addEventListener('click', () => this.toggleStrobe());
    this.dom.sosBtn.addEventListener('click', () => this.toggleSos());

    // Interactive fallback for Compass (drag on desktop)
    let isDraggingCompass = false;
    let startX = 0;
    this.dom.dial.addEventListener('mousedown', (e) => {
      isDraggingCompass = true;
      startX = e.clientX;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDraggingCompass) return;
      const delta = e.clientX - startX;
      startX = e.clientX;
      this.updateHeading((this.heading + delta * 0.5 + 360) % 360);
    });
    window.addEventListener('mouseup', () => isDraggingCompass = false);
  }

  // Flashlight methods
  toggleLight(forceState) {
    this.isLightOn = forceState !== undefined ? forceState : !this.isLightOn;

    if (this.isLightOn) {
      this.dom.fullscreenOverlay.classList.add('active');
      this.dom.powerBtn.classList.add('active');
      this.dom.statusText.textContent = 'ON';
      this.updateTorchLight();
    } else {
      this.dom.fullscreenOverlay.classList.remove('active');
      this.dom.powerBtn.classList.remove('active');
      this.dom.statusText.textContent = 'OFF';
      this.stopStrobe();
      this.stopSos();
    }

    if (window.soundEngine) window.soundEngine.playSpecialClick();
  }

  updateTorchLight() {
    this.dom.fullscreenOverlay.style.backgroundColor = this.lightColor;
    this.dom.fullscreenOverlay.style.opacity = this.lightBrightness / 100;
  }

  async toggleCameraTorch() {
    try {
      if (!this.cameraTorchStream) {
        this.cameraTorchStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
      }

      const track = this.cameraTorchStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};

      if (capabilities.torch) {
        this.hasHardwareTorch = !this.hasHardwareTorch;
        await track.applyConstraints({ advanced: [{ torch: this.hasHardwareTorch }] });
        this.dom.cameraBtn.classList.toggle('active', this.hasHardwareTorch);
        if (window.toolsManager) window.toolsManager.showToast(`Hardware Torch: ${this.hasHardwareTorch ? 'ON' : 'OFF'}`);
      } else {
        if (window.toolsManager) window.toolsManager.showToast('Hardware torch not supported. Use Screen Light.');
      }
    } catch (e) {
      if (window.toolsManager) window.toolsManager.showToast('Camera permission required for LED torch.');
    }
  }

  toggleStrobe() {
    this.stopSos();
    this.isStrobeOn = !this.isStrobeOn;
    this.dom.strobeBtn.classList.toggle('active', this.isStrobeOn);

    if (this.isStrobeOn) {
      this.toggleLight(true);
      let visible = true;
      this.strobeInterval = setInterval(() => {
        visible = !visible;
        this.dom.fullscreenOverlay.style.visibility = visible ? 'visible' : 'hidden';
      }, 1000 / this.strobeHz);
    } else {
      this.stopStrobe();
    }
  }

  stopStrobe() {
    this.isStrobeOn = false;
    this.dom.strobeBtn.classList.remove('active');
    if (this.strobeInterval) clearInterval(this.strobeInterval);
    this.strobeInterval = null;
    this.dom.fullscreenOverlay.style.visibility = 'visible';
  }

  toggleSos() {
    this.stopStrobe();
    this.isSosOn = !this.isSosOn;
    this.dom.sosBtn.classList.toggle('active', this.isSosOn);

    if (this.isSosOn) {
      this.toggleLight(true);
      // SOS: ... --- ... (short = 150ms, long = 450ms)
      const pattern = [150, 150, 150, 150, 150, 450, 450, 150, 450, 150, 450, 450, 150, 150, 150, 150, 150, 1200];
      let step = 0;

      const runStep = () => {
        if (!this.isSosOn) return;
        const dur = pattern[step];
        const isLight = step % 2 === 0;
        this.dom.fullscreenOverlay.style.visibility = isLight ? 'visible' : 'hidden';

        step = (step + 1) % pattern.length;
        this.sosTimeout = setTimeout(runStep, dur);
      };

      runStep();
    } else {
      this.stopSos();
    }
  }

  stopSos() {
    this.isSosOn = false;
    this.dom.sosBtn.classList.remove('active');
    if (this.sosTimeout) clearTimeout(this.sosTimeout);
    this.sosTimeout = null;
    this.dom.fullscreenOverlay.style.visibility = 'visible';
  }

  // Device Sensors (Compass & Level)
  initSensors() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => this.handleOrientation(e), true);
    }
  }

  handleOrientation(e) {
    // 1. Compass
    let heading = 0;
    if (e.webkitCompassHeading !== undefined) {
      heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      heading = (360 - e.alpha) % 360;
    }
    this.updateHeading(heading);

    // 2. Level (beta: pitch, gamma: roll)
    const pitch = e.beta || 0; // -180 to 180
    const roll = e.gamma || 0; // -90 to 90
    this.updateLevel(pitch, roll);
  }

  updateHeading(deg) {
    this.heading = Math.round(deg);
    if (!this.dom.dial) return;

    this.dom.dial.style.transform = `rotate(${-this.heading}deg)`;
    this.dom.degVal.textContent = this.heading;

    const cardinals = [
      { name: 'North (N)', min: 348.75, max: 360 },
      { name: 'North (N)', min: 0, max: 11.25 },
      { name: 'North-Northeast (NNE)', min: 11.25, max: 33.75 },
      { name: 'Northeast (NE)', min: 33.75, max: 56.25 },
      { name: 'East-Northeast (ENE)', min: 56.25, max: 78.75 },
      { name: 'East (E)', min: 78.75, max: 101.25 },
      { name: 'East-Southeast (ESE)', min: 101.25, max: 123.75 },
      { name: 'Southeast (SE)', min: 123.75, max: 146.25 },
      { name: 'South-Southeast (SSE)', min: 146.25, max: 168.75 },
      { name: 'South (S)', min: 168.75, max: 191.25 },
      { name: 'South-Southwest (SSW)', min: 191.25, max: 213.75 },
      { name: 'Southwest (SW)', min: 213.75, max: 236.25 },
      { name: 'West-Southwest (WSW)', min: 236.25, max: 258.75 },
      { name: 'West (W)', min: 258.75, max: 281.25 },
      { name: 'West-Northwest (WNW)', min: 281.25, max: 303.75 },
      { name: 'Northwest (NW)', min: 303.75, max: 326.25 },
      { name: 'North-Northwest (NNW)', min: 326.25, max: 348.75 }
    ];

    const match = cardinals.find(c => this.heading >= c.min && this.heading < c.max);
    if (match) this.dom.dirVal.textContent = match.name;
  }

  updateLevel(pitch, roll) {
    this.pitch = pitch;
    this.roll = roll;

    if (!this.dom.valPitch) return;

    this.dom.valPitch.textContent = `${pitch.toFixed(1)}°`;
    this.dom.valRoll.textContent = `${roll.toFixed(1)}°`;

    // 2D Bubble translation (scale clamp to target radius ~60px)
    const maxRadius = 60;
    const clampedX = Math.max(-maxRadius, Math.min(maxRadius, (roll / 45) * maxRadius));
    const clampedY = Math.max(-maxRadius, Math.min(maxRadius, (pitch / 45) * maxRadius));

    this.dom.bubble2D.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;

    // 1D Tubular vials
    const tubeRange = 50; // px
    const tubeX = Math.max(-tubeRange, Math.min(tubeRange, (roll / 30) * tubeRange));
    const tubeY = Math.max(-tubeRange, Math.min(tubeRange, (pitch / 30) * tubeRange));

    this.dom.tubeBubbleH.style.transform = `translate(calc(-50% + ${tubeX}px), -50%)`;
    this.dom.tubeBubbleV.style.transform = `translate(calc(-50% + ${tubeY}px), -50%)`;

    // Perfect Level Check (+- 0.5 degrees)
    const isLevel = Math.abs(pitch) <= 0.6 && Math.abs(roll) <= 0.6;
    if (isLevel) {
      this.dom.statusPill.textContent = 'PERFECTLY LEVEL (0.0°)';
      this.dom.statusPill.classList.add('level-perfect');
      this.dom.bubble2D.classList.add('level-perfect');
      if (navigator.vibrate) navigator.vibrate(25);
    } else {
      this.dom.statusPill.textContent = `Tilting (Pitch: ${pitch.toFixed(1)}°, Roll: ${roll.toFixed(1)}°)`;
      this.dom.statusPill.classList.remove('level-perfect');
      this.dom.bubble2D.classList.remove('level-perfect');
    }
  }
}

window.SensorUtilities = SensorUtilities;
