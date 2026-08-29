export class ModeSwitcher {
  constructor() {
    this.mode = 1; // 0: crisis, 1: impact
    this.toggleEl = null;
    this.handleEl = null;
    this.labelCrisis = null;
    this.labelImpact = null;
    this.onModeChangeCallback = null;
  }

  init(onModeChange) {
    this.onModeChangeCallback = onModeChange;
    this.toggleEl = document.getElementById('mode-toggle');
    this.handleEl = document.querySelector('.mode-toggle-handle');
    this.labelCrisis = document.querySelector('.mode-label--crisis');
    this.labelImpact = document.querySelector('.mode-label--impact');

    if (this.toggleEl) {
      this.toggleEl.addEventListener('click', () => this.toggleMode());
      this.toggleEl.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.toggleMode();
      }, { passive: false });
    }

    if (this.labelCrisis) {
      this.labelCrisis.addEventListener('click', () => {
        if (this.mode !== 0) this.toggleMode();
      });
      this.labelCrisis.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (this.mode !== 0) this.toggleMode();
      }, { passive: false });
    }

    if (this.labelImpact) {
      this.labelImpact.addEventListener('click', () => {
        if (this.mode !== 1) this.toggleMode();
      });
      this.labelImpact.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (this.mode !== 1) this.toggleMode();
      }, { passive: false });
    }

    this._applyMode();
  }

  toggleMode() {
    this.mode = this.mode === 0 ? 1 : 0;
    this._applyMode();

    if (this.onModeChangeCallback) {
      this.onModeChangeCallback(this.mode);
    }
  }

  _applyMode() {
    const html = document.documentElement;
    const crisisContent = document.querySelectorAll('.mode-content--crisis');
    const impactContent = document.querySelectorAll('.mode-content--impact');

    if (this.mode === 0) {
      // Crisis mode (amber)
      html.classList.add('mode-crisis');
      html.classList.remove('mode-impact');

      if (this.handleEl) {
        this.handleEl.style.transform = 'translateX(0)';
        this.handleEl.style.backgroundColor = '#ff7700';
        this.handleEl.style.boxShadow = '0 0 16px rgba(255, 119, 0, 0.5)';
      }
      if (this.labelCrisis) {
        this.labelCrisis.style.opacity = '1';
        this.labelCrisis.style.fontWeight = 'bold';
      }
      if (this.labelImpact) {
        this.labelImpact.style.opacity = '0.35';
        this.labelImpact.style.fontWeight = 'normal';
      }

      crisisContent.forEach(el => {
        el.style.display = 'block';
        el.style.opacity = '1';
      });
      impactContent.forEach(el => {
        el.style.display = 'none';
      });
    } else {
      // Impact mode (cyan)
      html.classList.add('mode-impact');
      html.classList.remove('mode-crisis');

      if (this.handleEl) {
        this.handleEl.style.transform = 'translateX(40px)';
        this.handleEl.style.backgroundColor = '#00e5ff';
        this.handleEl.style.boxShadow = '0 0 16px rgba(0, 229, 255, 0.5)';
      }
      if (this.labelCrisis) {
        this.labelCrisis.style.opacity = '0.35';
        this.labelCrisis.style.fontWeight = 'normal';
      }
      if (this.labelImpact) {
        this.labelImpact.style.opacity = '1';
        this.labelImpact.style.fontWeight = 'bold';
      }

      crisisContent.forEach(el => {
        el.style.display = 'none';
      });
      impactContent.forEach(el => {
        el.style.display = 'block';
        el.style.opacity = '1';
      });
    }
  }
}
