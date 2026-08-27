import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SmoothScroller — Lenis-powered kinetic momentum scroller
 * with GSAP ScrollTrigger integration for chapter-based storytelling.
 */
export class SmoothScroller {
  constructor() {
    this.lenis = null;
    this.scrollProgress = 0;
    this.scrollVelocity = 0;
    this.onScrollCallbacks = [];
  }

  init() {
    // Initialize Lenis smooth scroll
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    // Connect Lenis to GSAP ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      if (this.lenis) {
        this.lenis.raf(time * 1000);
      }
    });

    gsap.ticker.lagSmoothing(0);

    // Track global scroll progress and velocity
    this.lenis.on('scroll', ({ progress, velocity }) => {
      this.scrollProgress = progress;
      this.scrollVelocity = velocity;
      this.onScrollCallbacks.forEach((cb) => cb(progress, velocity));
    });

    this._setupStatTriggers();
    this._setupSceneIndicator();
  }

  onScroll(callback) {
    this.onScrollCallbacks.push(callback);
  }

  /**
   * Stat counter animations
   */
  _setupStatTriggers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat) => {
      const target = parseInt(stat.dataset.target, 10) || 0;
      const suffix = stat.dataset.suffix || '';
      const prefix = stat.dataset.prefix || '';

      ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(
            { val: 0 },
            {
              val: target,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: function () {
                stat.textContent = prefix + Math.round(this.targets()[0].val).toLocaleString() + suffix;
              },
            }
          );
        },
      });
    });
  }

  /**
   * Side navigation indicator that tracks the current chapter
   */
  _setupSceneIndicator() {
    const indicators = document.querySelectorAll('.scene-indicator-dot');
    const sections = [
      '#hero',
      '#chapter-01',
      '#chapter-02',
      '#chapter-03',
      '#mode-switch',
      '#dispatches',
      '#fund'
    ].map(id => document.querySelector(id)).filter(Boolean);

    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => this._setActiveIndicator(indicators, index),
        onEnterBack: () => this._setActiveIndicator(indicators, index),
      });
    });
  }

  _setActiveIndicator(indicators, activeIndex) {
    indicators.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
    });
  }

  /**
   * Scroll to a specific element safely
   */
  scrollTo(target) {
    if (this.lenis) {
      this.lenis.scrollTo(target, { duration: 1.4, offset: -20 });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
