export class ModeSwitcher {
  constructor() {
    this.mode = 1; // Start in impact mode (0: crisis, 1: impact)
    this.toggleEl = null;
    this.handleEl = null;
    this.onModeChangeCallback = null;
  }

  init(onModeChange) {
    this.onModeChangeCallback = onModeChange;
    this.toggleEl = document.getElementById('mode-toggle');
    this.handleEl = document.querySelector('.mode-toggle-handle');

    if (this.toggleEl) {
      this.toggleEl.addEventListener('click', () => this.toggleMode());
    }

    // Set initial state to impact
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
      // Crisis mode
      html.classList.add('mode-crisis');
      html.classList.remove('mode-impact');
      if (this.handleEl) {
        this.handleEl.style.transform = 'translateX(0)';
        this.handleEl.style.backgroundColor = '#ff6b00';
        this.handleEl.style.boxShadow = '0 4px 15px rgba(255, 107, 0, 0.3)';
      }
      crisisContent.forEach(el => el.style.display = '');
      impactContent.forEach(el => el.style.display = 'none');
    } else {
      // Impact mode
      html.classList.add('mode-impact');
      html.classList.remove('mode-crisis');
      if (this.handleEl) {
        this.handleEl.style.transform = 'translateX(40px)';
        this.handleEl.style.backgroundColor = '#00e5ff';
        this.handleEl.style.boxShadow = '0 4px 15px rgba(0, 229, 255, 0.3)';
      }
      crisisContent.forEach(el => el.style.display = 'none');
      impactContent.forEach(el => el.style.display = '');
    }
  }
}
