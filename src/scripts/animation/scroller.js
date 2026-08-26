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
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });

    // Connect Lenis to GSAP ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Track global scroll progress and velocity
    this.lenis.on('scroll', ({ progress, velocity }) => {
      this.scrollProgress = progress;
      this.scrollVelocity = velocity;
      this.onScrollCallbacks.forEach((cb) => cb(progress, velocity));
    });

    this._setupChapterTriggers();
  }

  /**
   * Register a callback to be called on each scroll update
   */
  onScroll(callback) {
    this.onScrollCallbacks.push(callback);
  }

  /**
   * Setup GSAP ScrollTrigger timelines for each chapter section
   */
  _setupChapterTriggers() {
    // Reveal text elements as they enter the viewport
    const revealElements = document.querySelectorAll('.reveal-text');
    revealElements.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        end: 'bottom 20%',
        onEnter: () => el.classList.add('is-visible'),
        onLeaveBack: () => el.classList.remove('is-visible'),
      });
    });

    // Chapter-specific scroll-linked animations
    const chapters = document.querySelectorAll('.chapter');
    chapters.forEach((chapter, index) => {
      // Fade in chapter content
      const content = chapter.querySelector('.chapter-content');
      if (!content) return;

      gsap.fromTo(
        content,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: chapter,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 0.5,
          },
        }
      );

      // Parallax background elements within chapters
      const parallaxEls = chapter.querySelectorAll('.parallax');
      parallaxEls.forEach((pEl) => {
        gsap.fromTo(
          pEl,
          { y: 80 },
          {
            y: -80,
            ease: 'none',
            scrollTrigger: {
              trigger: chapter,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    });

    // Stat counter animations
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat) => {
      const target = parseInt(stat.dataset.target, 10) || 0;
      const suffix = stat.dataset.suffix || '';
      const prefix = stat.dataset.prefix || '';

      ScrollTrigger.create({
        trigger: stat,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(
            { val: 0 },
            {
              val: target,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                stat.textContent = prefix + Math.round(this.targets()[0].val).toLocaleString() + suffix;
              },
            }
          );
        },
      });
    });

    // Scene navigation indicator update
    this._setupSceneIndicator();
  }

  /**
   * Side navigation indicator that tracks the current chapter
   */
  _setupSceneIndicator() {
    const indicators = document.querySelectorAll('.scene-indicator-dot');
    const chapters = document.querySelectorAll('.chapter');

    chapters.forEach((chapter, index) => {
      ScrollTrigger.create({
        trigger: chapter,
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
   * Scroll to a specific element
   */
  scrollTo(target) {
    if (this.lenis) {
      this.lenis.scrollTo(target, { duration: 1.6 });
    }
  }

  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
