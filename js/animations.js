/**
 * GSAP 3 Physics, 3D Spatial Rig & Motion Design for Apple iOS 26 Liquid Glass Calculator
 */

class MotionController {
  constructor() {
    this.calcCard = document.querySelector('.calculator-card');
    this.scene = document.querySelector('.scene-3d');
    this.floorShadow = document.querySelector('.floor-shadow');
    this.specularGlare = document.querySelector('.specular-glare');
    this.displayVal = document.querySelector('.display-value');
    this.toast = document.querySelector('.copied-toast');
    this.historyDrawer = document.querySelector('.history-drawer');
    
    this.tiltEnabled = true;
    this.maxTilt = 16; // degrees
    this.currentTiltX = 0;
    this.currentTiltY = 0;

    this.init();
  }

  init() {
    this.setup3DTilt();
    this.playEntranceAnimation();
  }

  // 3D Spatial Perspective Parallax
  setup3DTilt() {
    if (!this.calcCard || !this.scene) return;

    const onPointerMove = (e) => {
      if (!this.tiltEnabled) return;

      const rect = this.calcCard.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      // Normalized coordinates from -1 to 1 relative to card center
      const normX = (e.clientX - cardCenterX) / (window.innerWidth * 0.45);
      const normY = (e.clientY - cardCenterY) / (window.innerHeight * 0.45);

      const clampedX = Math.max(-1, Math.min(1, normX));
      const clampedY = Math.max(-1, Math.min(1, normY));

      const targetRotY = clampedX * this.maxTilt;
      const targetRotX = -clampedY * this.maxTilt;

      // Animate card tilt with GSAP
      gsap.to(this.calcCard, {
        rotateX: targetRotX,
        rotateY: targetRotY,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Opposite shadow displacement
      if (this.floorShadow) {
        gsap.to(this.floorShadow, {
          x: -clampedX * 32,
          y: -clampedY * 18,
          scale: 1 - Math.abs(clampedY) * 0.08,
          opacity: 0.8 - Math.abs(clampedX) * 0.2,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // Specular glare reflection moving counter to perspective
      if (this.specularGlare) {
        const glareX = 50 + clampedX * 35;
        const glareY = 20 + clampedY * 35;
        this.specularGlare.style.background = `radial-gradient(circle 380px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 70%)`;
      }

      // Solar cell reactive glint
      const solarGlint = document.querySelector('.solar-glint');
      if (solarGlint) {
        solarGlint.style.transform = `skewX(-25deg) translateX(${-40 + clampedX * 90}%)`;
      }
    };

    window.addEventListener('pointermove', onPointerMove);

    // Return to neutral level on pointer leave
    window.addEventListener('pointerleave', () => {
      this.resetTilt();
    });

    // Mobile / Gyroscope tilt support
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', (e) => {
        if (!this.tiltEnabled || !e.gamma || !e.beta) return;
        const rotY = Math.max(-this.maxTilt, Math.min(this.maxTilt, e.gamma * 0.5));
        const rotX = Math.max(-this.maxTilt, Math.min(this.maxTilt, (e.beta - 45) * 0.4));
        gsap.to(this.calcCard, {
          rotateX: rotX,
          rotateY: rotY,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    }
  }

  resetTilt() {
    gsap.to(this.calcCard, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
    if (this.floorShadow) {
      gsap.to(this.floorShadow, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.8,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  }

  toggleTilt(enable) {
    this.tiltEnabled = enable !== undefined ? enable : !this.tiltEnabled;
    if (!this.tiltEnabled) {
      this.resetTilt();
    }
    return this.tiltEnabled;
  }

  // Spectacular Opening Entrance Animation
  playEntranceAnimation() {
    const tl = gsap.timeline();

    tl.fromTo(
      this.calcCard,
      {
        y: 60,
        scale: 0.88,
        opacity: 0,
        rotateX: 18,
        z: -60
      },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        rotateX: 0,
        z: 0,
        duration: 1.1,
        ease: 'back.out(1.4)'
      }
    );

    if (this.floorShadow) {
      tl.fromTo(
        this.floorShadow,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 0.8, duration: 1, ease: 'power2.out' },
        '-=0.9'
      );
    }

    // Stagger button appearance
    const buttons = document.querySelectorAll('.standard-grid .key-btn');
    tl.fromTo(
      buttons,
      {
        opacity: 0,
        scale: 0.7,
        z: -25
      },
      {
        opacity: 1,
        scale: 1,
        z: 16,
        duration: 0.45,
        stagger: {
          grid: [5, 4],
          from: 'center',
          amount: 0.35
        },
        ease: 'back.out(2)'
      },
      '-=0.7'
    );
  }

  // Tactile 3D Button Press
  animateButtonPress(btn, event) {
    if (!btn) return;

    // 1. Tactile 3D sink & rebound
    gsap.killTweensOf(btn);
    gsap.timeline()
      .to(btn, {
        z: 6,
        scale: 0.94,
        duration: 0.08,
        ease: 'power1.in'
      })
      .to(btn, {
        z: 16,
        scale: 1,
        duration: 0.35,
        ease: 'back.out(2.4)'
      });

    // 2. Liquid glass ripple effect
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'liquid-ripple';

    const clickX = event ? (event.clientX - rect.left) : (rect.width / 2);
    const clickY = event ? (event.clientY - rect.top) : (rect.height / 2);

    ripple.style.left = `${clickX}px`;
    ripple.style.top = `${clickY}px`;
    btn.appendChild(ripple);

    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 0.85 },
      {
        scale: 24,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      }
    );
  }

  // Display value bounce punch
  animateDisplayUpdate() {
    if (!this.displayVal) return;
    gsap.killTweensOf(this.displayVal);
    gsap.fromTo(
      this.displayVal,
      { scale: 1.1, filter: 'brightness(1.4)' },
      { scale: 1, filter: 'brightness(1)', duration: 0.28, ease: 'power2.out' }
    );
  }

  // Error Shake
  animateError() {
    if (!this.calcCard) return;
    const tl = gsap.timeline();
    tl.to(this.calcCard, { x: -14, duration: 0.05, ease: 'power1.inOut' })
      .to(this.calcCard, { x: 14, duration: 0.05, ease: 'power1.inOut' })
      .to(this.calcCard, { x: -8, duration: 0.05, ease: 'power1.inOut' })
      .to(this.calcCard, { x: 8, duration: 0.05, ease: 'power1.inOut' })
      .to(this.calcCard, { x: 0, duration: 0.08, ease: 'power1.out' });

    if (this.displayVal) {
      gsap.fromTo(
        this.displayVal,
        { color: '#ff453a' },
        { color: '#ffffff', duration: 0.6, delay: 0.2 }
      );
    }
  }

  // Toggle Scientific Mode Drawer
  animateScientificToggle(isOpen) {
    const sciButtons = document.querySelectorAll('.scientific-drawer .key-btn');
    if (isOpen) {
      gsap.fromTo(
        sciButtons,
        { opacity: 0, y: -12, scale: 0.85 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.02,
          duration: 0.35,
          ease: 'back.out(1.8)',
          delay: 0.1
        }
      );
    }
  }

  // Flyout History Drawer
  animateHistoryDrawer(open) {
    if (!this.historyDrawer) return;
    gsap.killTweensOf(this.historyDrawer);

    if (open) {
      this.historyDrawer.classList.add('open');
      gsap.fromTo(
        this.historyDrawer,
        { x: '105%', opacity: 0, rotateY: 15 },
        { x: '0%', opacity: 1, rotateY: 0, duration: 0.45, ease: 'power3.out' }
      );

      const items = this.historyDrawer.querySelectorAll('.history-item');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, stagger: 0.04, duration: 0.3, ease: 'power2.out', delay: 0.15 }
        );
      }
    } else {
      gsap.to(this.historyDrawer, {
        x: '105%',
        opacity: 0,
        rotateY: 15,
        duration: 0.35,
        ease: 'power3.in',
        onComplete: () => {
          this.historyDrawer.classList.remove('open');
        }
      });
    }
  }

  // Show "Copied!" Toast
  showCopiedToast() {
    if (!this.toast) return;
    gsap.killTweensOf(this.toast);
    gsap.timeline()
      .fromTo(
        this.toast,
        { y: 12, scale: 0.8, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
      )
      .to(this.toast, {
        y: -10,
        opacity: 0,
        duration: 0.25,
        delay: 0.9,
        ease: 'power2.in'
      });
  }
}

window.MotionController = MotionController;
