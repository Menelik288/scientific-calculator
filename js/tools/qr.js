/**
 * QR Code Scanner, Generator & Decoder Module for All-in-One Tools App
 * Uses local vendor/qrcode.min.js and vendor/jsQR.min.js
 */

class QRStudio {
  constructor() {
    this.currentMode = 'generate'; // 'generate', 'scan', 'decode'
    this.videoStream = null;
    this.scanAnimFrame = null;
    this.facingMode = 'environment'; // 'environment' or 'user'
    this.isTorchOn = false;
    this.qrInstance = null;
  }

  initUI(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="qr-card glass-panel">
        <!-- Sub-Mode Tab Bar -->
        <div class="qr-tabs" role="tablist">
          <button class="qr-tab active" data-tab="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Generate
          </button>
          <button class="qr-tab" data-tab="scan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            Live Camera Scan
          </button>
          <button class="qr-tab" data-tab="decode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Decode Image
          </button>
        </div>

        <!-- Tab 1: Generate QR -->
        <div class="qr-pane active" id="pane-qr-generate">
          <!-- Template selector -->
          <div class="qr-type-selector">
            <button class="qr-type-btn active" data-type="text">Text</button>
            <button class="qr-type-btn" data-type="url">URL</button>
            <button class="qr-type-btn" data-type="contact">Contact (vCard)</button>
            <button class="qr-type-btn" data-type="wifi">Wi-Fi</button>
            <button class="qr-type-btn" data-type="email">Email</button>
          </div>

          <!-- Dynamic Form Inputs -->
          <div class="qr-form-wrap" id="qr-form-wrap">
            <div class="qr-field" id="qr-field-text">
              <label class="qr-label">Enter Text or Message:</label>
              <textarea id="qr-input-text" class="qr-textarea" rows="3" placeholder="Type text to generate QR code...">https://calculator-teal-xi-43.vercel.app</textarea>
            </div>
          </div>

          <!-- QR Preview & Output -->
          <div class="qr-preview-container">
            <div class="qr-canvas-holder" id="qr-output-box"></div>
          </div>

          <!-- Actions -->
          <div class="qr-actions-row">
            <button id="qr-btn-download" class="qr-action-btn" title="Save QR as PNG image">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Save Image
            </button>
            <button id="qr-btn-share" class="qr-action-btn" title="Share via Device Share Sheet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share
            </button>
            <button id="qr-btn-copy" class="qr-action-btn" title="Copy QR content to clipboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy Text
            </button>
          </div>
        </div>

        <!-- Tab 2: Live Camera Scan -->
        <div class="qr-pane" id="pane-qr-scan">
          <div class="qr-camera-viewport">
            <video id="qr-video" playsinline muted></video>
            <canvas id="qr-scan-canvas" style="display:none;"></canvas>
            
            <!-- Reticle Overlay -->
            <div class="qr-scan-reticle">
              <div class="qr-reticle-corner tl"></div>
              <div class="qr-reticle-corner tr"></div>
              <div class="qr-reticle-corner bl"></div>
              <div class="qr-reticle-corner br"></div>
              <div class="qr-laser-line"></div>
            </div>

            <div class="qr-camera-controls">
              <button id="qr-btn-switch-cam" class="qr-cam-ctrl-btn" title="Flip Camera">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path>
                  <polyline points="16 12 20 8 16 4"></polyline>
                </svg>
              </button>
              <button id="qr-btn-torch" class="qr-cam-ctrl-btn" title="Toggle Flashlight Torch">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </button>
            </div>

            <!-- Permission / Loading Banner -->
            <div class="qr-camera-placeholder" id="qr-cam-msg">
              <span class="qr-cam-icon">📷</span>
              <p>Tap below to start camera scanner</p>
              <button id="qr-btn-start-camera" class="qr-start-cam-btn">Start Camera</button>
            </div>
          </div>

          <!-- Scan Result Display -->
          <div class="qr-scan-result" id="qr-scan-result-box" style="display:none;">
            <div class="qr-result-header">
              <span class="qr-result-badge">Scanned Result</span>
              <span class="qr-result-type" id="qr-res-type">URL</span>
            </div>
            <div class="qr-result-content" id="qr-res-text"></div>
            <div class="qr-result-actions">
              <button id="qr-res-btn-copy" class="qr-action-btn">Copy</button>
              <a id="qr-res-btn-open" class="qr-action-btn" target="_blank" rel="noopener">Open Link</a>
            </div>
          </div>
        </div>

        <!-- Tab 3: Decode from Image -->
        <div class="qr-pane" id="pane-qr-decode">
          <div class="qr-dropzone" id="qr-dropzone">
            <input type="file" id="qr-file-input" accept="image/*" style="display:none;" />
            <div class="qr-drop-icon">🖼️</div>
            <p class="qr-drop-text">Click or drag & drop a QR code image here</p>
            <button id="qr-btn-select-file" class="qr-file-btn">Choose Image File</button>
          </div>

          <div class="qr-decode-preview" id="qr-decode-preview-box" style="display:none;">
            <img id="qr-decode-img" class="qr-preview-thumb" alt="Uploaded QR" />
            <div class="qr-scan-result" id="qr-file-result-box">
              <div class="qr-result-header">
                <span class="qr-result-badge">Decoded Data</span>
              </div>
              <div class="qr-result-content" id="qr-file-res-text"></div>
              <div class="qr-result-actions">
                <button id="qr-file-btn-copy" class="qr-action-btn">Copy</button>
                <a id="qr-file-btn-open" class="qr-action-btn" target="_blank" rel="noopener">Open Link</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.dom = {
      tabs: container.querySelectorAll('.qr-tab'),
      panes: container.querySelectorAll('.qr-pane'),
      typeButtons: container.querySelectorAll('.qr-type-btn'),
      formWrap: container.querySelector('#qr-form-wrap'),
      outputBox: container.querySelector('#qr-output-box'),
      downloadBtn: container.querySelector('#qr-btn-download'),
      shareBtn: container.querySelector('#qr-btn-share'),
      copyBtn: container.querySelector('#qr-btn-copy'),
      // Scanner
      video: container.querySelector('#qr-video'),
      canvas: container.querySelector('#qr-scan-canvas'),
      startCamBtn: container.querySelector('#qr-btn-start-camera'),
      camMsg: container.querySelector('#qr-cam-msg'),
      switchCamBtn: container.querySelector('#qr-btn-switch-cam'),
      torchBtn: container.querySelector('#qr-btn-torch'),
      resultBox: container.querySelector('#qr-scan-result-box'),
      resText: container.querySelector('#qr-res-text'),
      resType: container.querySelector('#qr-res-type'),
      resCopyBtn: container.querySelector('#qr-res-btn-copy'),
      resOpenBtn: container.querySelector('#qr-res-btn-open'),
      // Decoder
      dropzone: container.querySelector('#qr-dropzone'),
      fileInput: container.querySelector('#qr-file-input'),
      selectFileBtn: container.querySelector('#qr-btn-select-file'),
      decodePreview: container.querySelector('#qr-decode-preview-box'),
      decodeImg: container.querySelector('#qr-decode-img'),
      fileResText: container.querySelector('#qr-file-res-text'),
      fileCopyBtn: container.querySelector('#qr-file-btn-copy'),
      fileOpenBtn: container.querySelector('#qr-file-btn-open')
    };

    this.bindEvents();
    this.renderGenerator();
  }

  bindEvents() {
    // Mode tabs
    this.dom.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.dom.tabs.forEach(t => t.classList.remove('active'));
        this.dom.panes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const pane = document.getElementById(`pane-qr-${targetTab}`);
        if (pane) pane.classList.add('active');

        if (targetTab !== 'scan') {
          this.stopCamera();
        } else {
          this.startCamera();
        }

        if (window.soundEngine) window.soundEngine.playOperatorClick();
      });
    });

    // Generator Type Buttons
    this.dom.typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-type');
        this.renderFormForType(type);
        if (window.soundEngine) window.soundEngine.playKeyClick();
      });
    });

    // Actions
    this.dom.downloadBtn.addEventListener('click', () => this.downloadQR());
    this.dom.shareBtn.addEventListener('click', () => this.shareQR());
    this.dom.copyBtn.addEventListener('click', () => this.copyQRContent());

    // Camera actions
    this.dom.startCamBtn.addEventListener('click', () => this.startCamera());
    this.dom.switchCamBtn.addEventListener('click', () => {
      this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
      this.stopCamera();
      this.startCamera();
    });

    this.dom.torchBtn.addEventListener('click', () => this.toggleTorch());

    this.dom.resCopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.dom.resText.textContent);
      if (window.toolsManager) window.toolsManager.showToast('Copied scanned data!');
    });

    // File Decode actions
    this.dom.selectFileBtn.addEventListener('click', () => this.dom.fileInput.click());
    this.dom.dropzone.addEventListener('click', () => this.dom.fileInput.click());

    this.dom.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.decodeImageFile(file);
    });

    this.dom.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dom.dropzone.classList.add('drag-over');
    });

    this.dom.dropzone.addEventListener('dragleave', () => {
      this.dom.dropzone.classList.remove('drag-over');
    });

    this.dom.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dom.dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files.length) {
        this.decodeImageFile(e.dataTransfer.files[0]);
      }
    });

    this.dom.fileCopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.dom.fileResText.textContent);
      if (window.toolsManager) window.toolsManager.showToast('Copied decoded data!');
    });
  }

  renderFormForType(type) {
    let formHtml = '';
    switch (type) {
      case 'url':
        formHtml = `
          <div class="qr-field">
            <label class="qr-label">Website URL:</label>
            <input type="url" id="qr-input-url" class="qr-input" value="https://calculator-teal-xi-43.vercel.app" placeholder="https://example.com" />
          </div>
        `;
        break;
      case 'contact':
        formHtml = `
          <div class="qr-field-grid">
            <div class="qr-field">
              <label class="qr-label">Full Name:</label>
              <input type="text" id="qr-input-name" class="qr-input" placeholder="Jane Doe" value="Menelik Alemayehu" />
            </div>
            <div class="qr-field">
              <label class="qr-label">Phone:</label>
              <input type="tel" id="qr-input-phone" class="qr-input" placeholder="+1 234 567 8900" />
            </div>
            <div class="qr-field">
              <label class="qr-label">Email:</label>
              <input type="email" id="qr-input-email" class="qr-input" placeholder="jane@example.com" />
            </div>
            <div class="qr-field">
              <label class="qr-label">Organization / Title:</label>
              <input type="text" id="qr-input-org" class="qr-input" placeholder="Software Engineer" />
            </div>
          </div>
        `;
        break;
      case 'wifi':
        formHtml = `
          <div class="qr-field-grid">
            <div class="qr-field">
              <label class="qr-label">Network Name (SSID):</label>
              <input type="text" id="qr-input-ssid" class="qr-input" placeholder="MyHomeWiFi" />
            </div>
            <div class="qr-field">
              <label class="qr-label">Password:</label>
              <input type="text" id="qr-input-wifipass" class="qr-input" placeholder="WiFiPassword" />
            </div>
            <div class="qr-field">
              <label class="qr-label">Encryption:</label>
              <select id="qr-input-wificrypt" class="qr-select">
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open)</option>
              </select>
            </div>
          </div>
        `;
        break;
      case 'email':
        formHtml = `
          <div class="qr-field-grid">
            <div class="qr-field">
              <label class="qr-label">Recipient Email:</label>
              <input type="email" id="qr-input-mailto" class="qr-input" placeholder="contact@example.com" />
            </div>
            <div class="qr-field">
              <label class="qr-label">Subject:</label>
              <input type="text" id="qr-input-mailsub" class="qr-input" placeholder="Hello from OmniTools" />
            </div>
            <div class="qr-field" style="grid-column: 1 / -1;">
              <label class="qr-label">Body:</label>
              <textarea id="qr-input-mailbody" class="qr-textarea" rows="2" placeholder="Email message..."></textarea>
            </div>
          </div>
        `;
        break;
      case 'text':
      default:
        formHtml = `
          <div class="qr-field">
            <label class="qr-label">Enter Text or Message:</label>
            <textarea id="qr-input-text" class="qr-textarea" rows="3" placeholder="Type text to generate QR code...">https://calculator-teal-xi-43.vercel.app</textarea>
          </div>
        `;
        break;
    }

    this.dom.formWrap.innerHTML = formHtml;
    this.dom.formWrap.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => this.renderGenerator());
      el.addEventListener('change', () => this.renderGenerator());
    });

    this.renderGenerator();
  }

  getCompiledPayload() {
    const activeTypeBtn = this.dom.formWrap.closest('.qr-pane').querySelector('.qr-type-btn.active');
    const type = activeTypeBtn ? activeTypeBtn.getAttribute('data-type') : 'text';

    switch (type) {
      case 'url': {
        const el = document.getElementById('qr-input-url');
        return el?.value.trim() || 'https://calculator-teal-xi-43.vercel.app';
      }
      case 'contact': {
        const name = document.getElementById('qr-input-name')?.value.trim() || 'User';
        const phone = document.getElementById('qr-input-phone')?.value.trim() || '';
        const email = document.getElementById('qr-input-email')?.value.trim() || '';
        const org = document.getElementById('qr-input-org')?.value.trim() || '';
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${org}\nEND:VCARD`;
      }
      case 'wifi': {
        const ssid = document.getElementById('qr-input-ssid')?.value.trim() || 'WiFi';
        const pass = document.getElementById('qr-input-wifipass')?.value || '';
        const type = document.getElementById('qr-input-wificrypt')?.value || 'WPA';
        return `WIFI:T:${type};S:${ssid};P:${pass};;`;
      }
      case 'email': {
        const to = document.getElementById('qr-input-mailto')?.value.trim() || '';
        const sub = encodeURIComponent(document.getElementById('qr-input-mailsub')?.value.trim() || '');
        const body = encodeURIComponent(document.getElementById('qr-input-mailbody')?.value.trim() || '');
        return `mailto:${to}?subject=${sub}&body=${body}`;
      }
      case 'text':
      default: {
        const el = document.getElementById('qr-input-text');
        return el?.value || 'Hello from OmniTools';
      }
    }
  }

  renderGenerator() {
    const payload = this.getCompiledPayload();
    this.dom.outputBox.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      try {
        this.qrInstance = new QRCode(this.dom.outputBox, {
          text: payload,
          width: 200,
          height: 200,
          colorDark: "#ffffff",
          colorLight: "rgba(0,0,0,0)",
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (err) {
        this.dom.outputBox.innerHTML = `<span style="color:#ff453a; font-size:12px;">Payload too long for QR Code.</span>`;
      }
    } else {
      this.dom.outputBox.textContent = payload;
    }
  }

  downloadQR() {
    const canvas = this.dom.outputBox.querySelector('canvas');
    const img = this.dom.outputBox.querySelector('img');

    let dataUrl = '';
    if (canvas) {
      // Paint onto white background so dark QR scanner can read it when saved
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width + 40;
      exportCanvas.height = canvas.height + 40;
      const ctx = exportCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.drawImage(canvas, 20, 20);
      dataUrl = exportCanvas.toDataURL('image/png');
    } else if (img && img.src) {
      dataUrl = img.src;
    }

    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `omnitools-qrcode-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    if (window.toolsManager) window.toolsManager.showToast('Saved QR Code image!');
    if (window.soundEngine) window.soundEngine.playSpecialClick();
  }

  shareQR() {
    const payload = this.getCompiledPayload();
    if (navigator.share) {
      navigator.share({
        title: 'OmniTools QR Code',
        text: payload,
        url: payload.startsWith('http') ? payload : undefined
      }).catch(() => {});
    } else {
      this.copyQRContent();
    }
  }

  copyQRContent() {
    const payload = this.getCompiledPayload();
    navigator.clipboard.writeText(payload).then(() => {
      if (window.toolsManager) window.toolsManager.showToast('Copied QR data to clipboard!');
      if (window.soundEngine) window.soundEngine.playKeyClick();
    });
  }

  // Camera Scanning Subsystem
  async startCamera() {
    this.dom.camMsg.style.display = 'none';
    this.dom.resultBox.style.display = 'none';

    try {
      const constraints = {
        video: {
          facingMode: { ideal: this.facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.dom.video.srcObject = this.videoStream;
      this.dom.video.setAttribute('playsinline', 'true');
      await this.dom.video.play();

      this.scanLoop();
    } catch (err) {
      this.dom.camMsg.style.display = 'flex';
      this.dom.camMsg.innerHTML = `
        <span class="qr-cam-icon">⚠️</span>
        <p style="color:#ff453a;">Camera access not granted or not available.</p>
        <button id="qr-btn-retry-cam" class="qr-start-cam-btn">Try Again</button>
      `;
      const retry = document.getElementById('qr-btn-retry-cam');
      if (retry) retry.addEventListener('click', () => this.startCamera());
    }
  }

  stopCamera() {
    if (this.scanAnimFrame) {
      cancelAnimationFrame(this.scanAnimFrame);
      this.scanAnimFrame = null;
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    if (this.dom.video) {
      this.dom.video.srcObject = null;
    }
    this.isTorchOn = false;
  }

  scanLoop() {
    if (!this.videoStream || this.dom.video.readyState !== this.dom.video.HAVE_ENOUGH_DATA) {
      this.scanAnimFrame = requestAnimationFrame(() => this.scanLoop());
      return;
    }

    const video = this.dom.video;
    const canvas = this.dom.canvas;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (typeof jsQR !== 'undefined') {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data) {
        this.onScanSuccess(code.data);
        return; // stop scanning after detection
      }
    }

    this.scanAnimFrame = requestAnimationFrame(() => this.scanLoop());
  }

  onScanSuccess(data) {
    if (window.soundEngine) window.soundEngine.playEqualsSuccess();
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);

    this.dom.resultBox.style.display = 'block';
    this.dom.resText.textContent = data;

    const isUrl = data.startsWith('http://') || data.startsWith('https://');
    this.dom.resType.textContent = isUrl ? 'Website Link' : 'Text Data';

    if (isUrl) {
      this.dom.resOpenBtn.style.display = 'inline-flex';
      this.dom.resOpenBtn.href = data;
    } else {
      this.dom.resOpenBtn.style.display = 'none';
    }

    if (window.toolsManager) window.toolsManager.showToast('QR Code Scanned!');
  }

  async toggleTorch() {
    if (!this.videoStream) return;
    const track = this.videoStream.getVideoTracks()[0];
    if (!track) return;

    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    if (capabilities.torch) {
      this.isTorchOn = !this.isTorchOn;
      try {
        await track.applyConstraints({ advanced: [{ torch: this.isTorchOn }] });
        this.dom.torchBtn.classList.toggle('active', this.isTorchOn);
      } catch (err) {}
    } else {
      if (window.toolsManager) window.toolsManager.showToast('Hardware torch not supported on this lens');
    }
  }

  // Image File Decoder Subsystem
  decodeImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.dom.decodePreview.style.display = 'block';
        this.dom.decodeImg.src = img.src;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (typeof jsQR !== 'undefined') {
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            this.dom.fileResText.textContent = code.data;
            const isUrl = code.data.startsWith('http://') || code.data.startsWith('https://');
            if (isUrl) {
              this.dom.fileOpenBtn.style.display = 'inline-flex';
              this.dom.fileOpenBtn.href = code.data;
            } else {
              this.dom.fileOpenBtn.style.display = 'none';
            }
            if (window.soundEngine) window.soundEngine.playEqualsSuccess();
            if (window.toolsManager) window.toolsManager.showToast('QR Code Decoded Successfully!');
          } else {
            this.dom.fileResText.textContent = 'No QR Code found in this image.';
            this.dom.fileOpenBtn.style.display = 'none';
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

window.QRStudio = QRStudio;
