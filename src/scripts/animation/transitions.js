import { gsap } from 'gsap';

/**
 * Transitions — Chapter reveal animations, loading screen sequence,
 * and active navigation management for AQUASOURCE.
 */
export class Transitions {
  constructor() {
    this.isLoaded = false;
    this.activeChapter = 0;
    this.chapterCallbacks = [];
  }

  init() {
    this._setupLoadingScreen();
    this._setupChapterReveals();
    this._setupNavigationLinks();
    this._setupHeroAnimation();
  }

  /**
   * Register a callback for chapter changes
   */
  onChapterChange(callback) {
    this.chapterCallbacks.push(callback);
  }

  /**
   * Cinematic loading screen sequence
   */
  _setupLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingLogo = document.querySelector('.loading-logo');
    const loadingProgress = document.querySelector('.loading-progress-fill');
    const loadingCounter = document.querySelector('.loading-counter');

    if (!loadingScreen) return;

    // Animate progress bar
    const tl = gsap.timeline({
      onComplete: () => {
        this.isLoaded = true;
        // Fade out loading screen
        gsap.to(loadingScreen, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            loadingScreen.style.display = 'none';
            document.body.classList.add('is-loaded');
            this._animateHeroEntrance();
          },
        });
      },
    });

    // Logo pulse animation
    if (loadingLogo) {
      tl.fromTo(
        loadingLogo,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' },
        0
      );
    }

    // Progress bar fill
    if (loadingProgress) {
      tl.to(
        loadingProgress,
        {
          scaleX: 1,
          duration: 2.0,
          ease: 'power1.inOut',
        },
        0.3
      );
    }

    // Counter increment
    if (loadingCounter) {
      tl.to(
        { val: 0 },
        {
          val: 100,
          duration: 2.0,
          ease: 'power1.inOut',
          onUpdate: function () {
            loadingCounter.textContent = Math.round(this.targets()[0].val);
          },
        },
        0.3
      );
    }
  }

  /**
   * Hero section entrance animation (plays after loading completes)
   */
  _animateHeroEntrance() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroTelemetry = document.querySelectorAll('.hero-telemetry-item');
    const heroCta = document.querySelector('.hero-cta');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroTitle) {
      // Split title into spans for character animation
      const chars = heroTitle.querySelectorAll('.char');
      if (chars.length > 0) {
        tl.fromTo(
          chars,
          { opacity: 0, y: 80, rotateX: -90 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.03 },
          0
        );
      } else {
        tl.fromTo(heroTitle, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 }, 0);
      }
    }

    if (heroSubtitle) {
      tl.fromTo(heroSubtitle, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.5);
    }

    if (heroTelemetry.length > 0) {
      tl.fromTo(
        heroTelemetry,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
        0.8
      );
    }

    if (heroCta) {
      tl.fromTo(heroCta, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }, 1.2);
    }
  }

  /**
   * Setup hero section parallax text animation
   */
  _setupHeroAnimation() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const heroTitle = heroSection.querySelector('.hero-title');
    if (heroTitle) {
      gsap.to(heroTitle, {
        y: -100,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }

  /**
   * Chapter reveal animations with staggered children
   */
  _setupChapterReveals() {
    const chapters = document.querySelectorAll('.chapter');

    chapters.forEach((chapter, index) => {
      const heading = chapter.querySelector('.chapter-heading');
      const number = chapter.querySelector('.chapter-number');
      const items = chapter.querySelectorAll('.stagger-item');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: chapter,
          start: 'top 65%',
          end: 'top 25%',
          toggleActions: 'play none none reverse',
        },
        onStart: () => {
          this.activeChapter = index;
          this.chapterCallbacks.forEach((cb) => cb(index));
        },
      });

      // Chapter number wipe-in
      if (number) {
        tl.fromTo(
          number,
          { opacity: 0, x: -40 },
          { opacity: 0.15, x: 0, duration: 0.8, ease: 'power3.out' },
          0
        );
      }

      // Heading reveal
      if (heading) {
        tl.fromTo(
          heading,
          { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' },
          { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power3.out' },
          0.15
        );
      }

      // Staggered children
      if (items.length > 0) {
        tl.fromTo(
          items,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
          0.4
        );
      }
    });
  }

  /**
   * Navigation link smooth scroll and active state
   */
  _setupNavigationLinks() {
    const navLinks = document.querySelectorAll('[data-scroll-to]');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.dataset.scrollTo);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}
