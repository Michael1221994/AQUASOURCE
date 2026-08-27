import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Transitions — Loading sequence, hero entrance, and staggered chapter reveals
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
  }

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

    const tl = gsap.timeline({
      onComplete: () => {
        this.isLoaded = true;
        gsap.to(loadingScreen, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            loadingScreen.style.display = 'none';
            document.body.classList.add('is-loaded');
            this._animateHeroEntrance();
          },
        });
      },
    });

    if (loadingLogo) {
      tl.fromTo(
        loadingLogo,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
        0
      );
    }

    if (loadingProgress) {
      tl.to(
        loadingProgress,
        {
          scaleX: 1,
          duration: 1.4,
          ease: 'power1.inOut',
        },
        0.2
      );
    }

    if (loadingCounter) {
      tl.to(
        { val: 0 },
        {
          val: 100,
          duration: 1.4,
          ease: 'power1.inOut',
          onUpdate: function () {
            loadingCounter.textContent = Math.round(this.targets()[0].val);
          },
        },
        0.2
      );
    }
  }

  /**
   * Hero entrance animation
   */
  _animateHeroEntrance() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroTelemetry = document.querySelectorAll('.hero-telemetry-item');
    const heroCta = document.querySelector('.hero-cta');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroTitle) {
      tl.fromTo(heroTitle, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9 }, 0);
    }

    if (heroSubtitle) {
      tl.fromTo(heroSubtitle, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.7 }, 0.3);
    }

    if (heroTelemetry.length > 0) {
      tl.fromTo(
        heroTelemetry,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        0.5
      );
    }

    if (heroCta) {
      tl.fromTo(heroCta, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5 }, 0.8);
    }
  }

  /**
   * Chapter reveals with clean ScrollTrigger animations
   */
  _setupChapterReveals() {
    const chapters = document.querySelectorAll('.chapter');

    chapters.forEach((chapter, index) => {
      const heading = chapter.querySelector('.chapter-heading');
      const number = chapter.querySelector('.chapter-number');
      const items = chapter.querySelectorAll('.stagger-item');

      // Animate chapter number
      if (number) {
        gsap.fromTo(
          number,
          { opacity: 0, x: -30 },
          {
            opacity: 0.15,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: chapter,
              start: 'top 80%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      }

      // Animate heading
      if (heading) {
        gsap.fromTo(
          heading,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: chapter,
              start: 'top 75%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      }

      // Animate stagger items
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: chapter,
              start: 'top 70%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      }
    });
  }
}
