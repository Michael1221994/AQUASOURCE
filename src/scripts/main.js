/**
 * AQUASOURCE // 01 — Main Application Orchestrator
 * 
 * Initializes and coordinates all subsystems:
 * - WebGL Scene (Three.js particles, caustics, post-processing)
 * - Smooth Scroll (Lenis + GSAP ScrollTrigger)
 * - Chapter Transitions (reveal animations, stat counters)
 * - UI Components (3D cubes, mode switcher, donation engine, dev HUD)
 */

import { WebGLScene } from './webgl/scene.js';
import { SmoothScroller } from './animation/scroller.js';
import { Transitions } from './animation/transitions.js';
import { CubeManager } from './ui/cubeManager.js';
import { ModeSwitcher } from './ui/modeSwitcher.js';
import { DonationEngine } from './ui/donation.js';

class AquasourceApp {
  constructor() {
    this.scene = null;
    this.scroller = null;
    this.transitions = null;
    this.cubeManager = null;
    this.modeSwitcher = null;
    this.donationEngine = null;

    this.mouse = { x: 0, y: 0 };
  }

  async init() {
    console.log(
      '%c AQUASOURCE // 01 %c Clean Water Initiative ',
      'background: #00e5ff; color: #0a0a0a; font-weight: bold; padding: 4px 8px;',
      'background: #0a0a0a; color: #00e5ff; padding: 4px 8px;'
    );

    try {
      // 1. Initialize WebGL Scene
      const webglContainer = document.getElementById('webgl');
      this.scene = new WebGLScene(webglContainer);
      console.log('✓ WebGL scene initialized');

      // 2. Initialize Smooth Scroller
      this.scroller = new SmoothScroller();
      this.scroller.init();
      this.scroller.onScroll((progress, velocity) => {
        if (this.scene) {
          this.scene.onScroll(progress);
        }
      });
      console.log('✓ Smooth scroll initialized');

      // 3. Initialize Transitions
      this.transitions = new Transitions();
      this.transitions.init();
      console.log('✓ Transitions initialized');

      // 4. Initialize 3D Cube Manager
      this.cubeManager = new CubeManager();
      this.cubeManager.init();
      console.log('✓ Cube manager initialized');

      // 5. Initialize Mode Switcher
      this.modeSwitcher = new ModeSwitcher();
      this.modeSwitcher.init((mode) => {
        // mode: 0 = crisis, 1 = impact
        if (this.scene) {
          this.scene.setMode(mode);
        }
      });
      console.log('✓ Mode switcher initialized');

      // 6. Initialize Donation Engine
      this.donationEngine = new DonationEngine();
      this.donationEngine.init();
      console.log('✓ Donation engine initialized');

      // 7. Global event listeners
      this._setupEventListeners();

      console.log(
        '%c ✓ All systems online ',
        'background: #00e676; color: #0a0a0a; font-weight: bold; padding: 4px 12px; border-radius: 4px;'
      );
    } catch (error) {
      console.error('AQUASOURCE initialization error:', error);
    }
  }

  _setupEventListeners() {
    // Mouse tracking for WebGL parallax
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (this.scene) {
        this.scene.onMouseMove(this.mouse.x, this.mouse.y);
      }
    });

    // Touch tracking for mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        if (this.scene) {
          this.scene.onMouseMove(this.mouse.x, this.mouse.y);
        }
      }
    }, { passive: true });

    // Navigation scroll-to links
    document.querySelectorAll('[data-scroll-to]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.scrollTo;
        if (this.scroller) {
          this.scroller.scrollTo(target);
        }
      });
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        document.body.classList.toggle('mobile-nav-open');
      });
    }
  }
}

// ─── Bootstrap ──────────────────────────────────────────────
const app = new AquasourceApp();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
