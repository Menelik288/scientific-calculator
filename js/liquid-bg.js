/**
 * Liquid Glass Ambient Background Simulation for Apple iOS 26
 * Interactive organic fluid orbs, chromatic refraction caustics, and theme synchronization.
 */

class LiquidBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Mouse interaction
    this.mouse = {
      x: this.width / 2,
      y: this.height / 2,
      targetX: this.width / 2,
      targetY: this.height / 2,
      speed: 0
    };

    // Fluid blobs
    this.blobs = [];
    this.numBlobs = 6;
    this.animationId = null;
    this.isPaused = false;
    this.time = 0;

    // Theme color palettes
    this.themes = {
      nebula: [
        { r: 121, g: 40, b: 202 },   // Violet
        { r: 0, g: 112, b: 243 },     // Azure
        { r: 255, g: 0, b: 128 },     // Magenta
        { r: 0, g: 223, b: 216 }      // Cyan
      ],
      frost: [
        { r: 226, g: 232, b: 240 },   // Ice Platinum
        { r: 148, g: 163, b: 184 },   // Cool Slate
        { r: 51, g: 65, b: 85 },      // Deep Slate
        { r: 203, g: 213, b: 225 }    // Frost Silver
      ],
      amber: [
        { r: 255, g: 87, b: 34 },     // Deep Orange
        { r: 255, g: 152, b: 0 },     // Solar Amber
        { r: 233, g: 30, b: 99 },     // Sunset Rose
        { r: 255, g: 193, b: 7 }      // Golden Glow
      ],
      aurora: [
        { r: 0, g: 230, b: 118 },     // Neon Emerald
        { r: 0, g: 176, b: 255 },     // Polar Blue
        { r: 29, g: 233, b: 182 },    // Turquoise
        { r: 118, g: 255, b: 3 }      // Lime Aurora
      ]
    };

    this.currentTheme = 'nebula';
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse & Touch tracking
    window.addEventListener('pointermove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

    // Handle tab visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    this.createBlobs();
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      // Re-tint existing blobs
      this.blobs.forEach((blob, i) => {
        const palette = this.themes[themeName];
        blob.targetColor = palette[i % palette.length];
      });
    }
  }

  createBlobs() {
    this.blobs = [];
    const palette = this.themes[this.currentTheme];

    for (let i = 0; i < this.numBlobs; i++) {
      const color = palette[i % palette.length];
      this.blobs.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: (Math.min(this.width, this.height) * 0.28) + Math.random() * 180,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        color: { ...color },
        targetColor: { ...color },
        pulseSpeed: 0.001 + Math.random() * 0.002,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  // Liquid pulse triggered on button press or calculation
  pulseRipple(x, y) {
    if (this.blobs.length > 0) {
      const nearest = this.blobs.reduce((prev, curr) => {
        const d1 = Math.hypot(prev.x - x, prev.y - y);
        const d2 = Math.hypot(curr.x - x, curr.y - y);
        return d1 < d2 ? prev : curr;
      });
      nearest.radius += 45;
      setTimeout(() => {
        nearest.radius = Math.max(150, nearest.radius - 45);
      }, 350);
    }
  }

  update() {
    this.time += 0.008;

    // Smooth mouse interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.blobs.forEach((blob, idx) => {
      // Color transition lerp
      blob.color.r += (blob.targetColor.r - blob.color.r) * 0.05;
      blob.color.g += (blob.targetColor.g - blob.color.g) * 0.05;
      blob.color.b += (blob.targetColor.b - blob.color.b) * 0.05;

      // Gentle organic drift
      blob.x += blob.vx + Math.sin(this.time + idx) * 0.6;
      blob.y += blob.vy + Math.cos(this.time + idx * 1.5) * 0.6;

      // Mouse gentle gravitational pull
      const dx = this.mouse.x - blob.x;
      const dy = this.mouse.y - blob.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 400 && dist > 10) {
        const force = (400 - dist) / 400 * 0.012;
        blob.x += dx * force;
        blob.y += dy * force;
      }

      // Screen boundary wrap
      const margin = blob.radius * 0.8;
      if (blob.x < -margin) blob.x = this.width + margin;
      if (blob.x > this.width + margin) blob.x = -margin;
      if (blob.y < -margin) blob.y = this.height + margin;
      if (blob.y > this.height + margin) blob.y = -margin;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Deep background base
    this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--theme-bg-1') || '#0a0b1e';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw chromatic fluid orbs with screen/lighter composite
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';

    this.blobs.forEach((blob) => {
      const currentRadius = blob.radius + Math.sin(this.time * 2 + blob.pulseOffset) * 20;
      const grad = this.ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, currentRadius
      );

      const { r, g, b } = blob.color;
      grad.addColorStop(0, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.45)`);
      grad.addColorStop(0.4, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.22)`);
      grad.addColorStop(0.7, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.06)`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(blob.x, blob.y, currentRadius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  loop() {
    if (this.isPaused) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  start() {
    if (!this.animationId) {
      this.isPaused = false;
      this.loop();
    }
  }

  stop() {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

window.LiquidBackground = LiquidBackground;
