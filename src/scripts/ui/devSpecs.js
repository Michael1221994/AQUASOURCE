export class DevSpecs {
  constructor() {
    this.scene = null;
    this.panel = null;
    this.contentEl = null;
    this.isOpen = false;
    this.fpsEl = null;
    this.drawCallsEl = null;
    this.trianglesEl = null;
    this.particlesEl = null;
    this.scrollEl = null;
    this.modeEl = null;
    this.wireframeOn = false;

    this.lastTime = performance.now();
    this.frames = 0;
    this.fps = 0;
  }

  init(scene) {
    this.scene = scene;
    this.createPanel();
    this.attachListeners();
    this.updateLoop();
  }

  createPanel() {
    // Toggle button (always visible)
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'ds-toggle';
    toggleBtn.innerHTML = '{ }';
    toggleBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(0, 229, 255, 0.08);
      border: 1px solid rgba(0, 229, 255, 0.25);
      color: #00e5ff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: all 0.2s ease;
    `;

    // Panel (hidden by default)
    const panel = document.createElement('div');
    panel.id = 'ds-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 64px;
      right: 20px;
      z-index: 9999;
      width: 220px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(10, 10, 10, 0.85);
      border: 1px solid rgba(0, 229, 255, 0.15);
      backdrop-filter: blur(20px);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(245, 245, 245, 0.7);
      display: none;
      flex-direction: column;
      gap: 8px;
    `;

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="color:#00e5ff;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;">Dev Specs</span>
      </div>
      <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.35);">FPS</span><span id="ds-fps" style="color:#00e5ff;">0</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.35);">Draw Calls</span><span id="ds-draw" style="color:#00e5ff;">0</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.35);">Triangles</span><span id="ds-tri" style="color:#00e5ff;">0</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.35);">Particles</span><span id="ds-part" style="color:#00e5ff;">3,500</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.35);">Scroll</span><span id="ds-scroll" style="color:#00e5ff;">0%</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.35);">Mode</span><span id="ds-mode" style="color:#00e5ff;">IMPACT</span></div>
      <div style="border-top:1px solid rgba(255,255,255,0.05);margin:6px 0;"></div>
      <button id="ds-wireframe" style="
        width:100%;
        padding:6px;
        border-radius:6px;
        background:rgba(0,229,255,0.08);
        border:1px solid rgba(0,229,255,0.2);
        color:#00e5ff;
        font-family:inherit;
        font-size:10px;
        cursor:pointer;
        letter-spacing:0.1em;
        text-transform:uppercase;
      ">Wireframe: OFF</button>
      <details style="margin-top:4px;">
        <summary style="cursor:pointer;color:#00e5ff;font-size:10px;letter-spacing:0.1em;">▸ Architecture</summary>
        <ul style="padding-left:14px;margin-top:6px;color:rgba(255,255,255,0.3);font-size:10px;line-height:1.8;">
          <li>Three.js r170 + Custom GLSL</li>
          <li>Lenis + GSAP ScrollTrigger</li>
          <li>Tailwind CSS v4</li>
          <li>Vite + ES Modules</li>
          <li>CSS 3D Cube Engine</li>
        </ul>
      </details>
    `;

    document.body.appendChild(toggleBtn);
    document.body.appendChild(panel);

    this.panel = panel;
    this.toggleBtn = toggleBtn;
    this.fpsEl = document.getElementById('ds-fps');
    this.drawCallsEl = document.getElementById('ds-draw');
    this.trianglesEl = document.getElementById('ds-tri');
    this.particlesEl = document.getElementById('ds-part');
    this.scrollEl = document.getElementById('ds-scroll');
    this.modeEl = document.getElementById('ds-mode');
    this.wireframeBtn = document.getElementById('ds-wireframe');
  }

  attachListeners() {
    this.toggleBtn.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.panel.style.display = this.isOpen ? 'flex' : 'none';
      this.toggleBtn.style.background = this.isOpen
        ? 'rgba(0, 229, 255, 0.2)'
        : 'rgba(0, 229, 255, 0.08)';
    });

    if (this.wireframeBtn) {
      this.wireframeBtn.addEventListener('click', () => {
        this.wireframeOn = !this.wireframeOn;
        this.wireframeBtn.textContent = `Wireframe: ${this.wireframeOn ? 'ON' : 'OFF'}`;
        this.wireframeBtn.style.background = this.wireframeOn
          ? 'rgba(0, 229, 255, 0.25)'
          : 'rgba(0, 229, 255, 0.08)';
        if (this.scene && typeof this.scene.setWireframe === 'function') {
          this.scene.setWireframe(this.wireframeOn);
        }
      });
    }

    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPos = window.scrollY;
      const progress = docHeight > 0 ? (scrollPos / docHeight) * 100 : 0;
      if (this.scrollEl) this.scrollEl.innerText = `${Math.round(progress)}%`;
    });
  }

  updateLoop() {
    const now = performance.now();
    this.frames++;

    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      if (this.fpsEl) this.fpsEl.innerText = this.fps;
      this.frames = 0;
      this.lastTime = now;
    }

    if (this.scene && this.scene.renderer) {
      if (this.drawCallsEl) this.drawCallsEl.innerText = this.scene.renderer.info.render.calls;
      if (this.trianglesEl) this.trianglesEl.innerText = this.scene.renderer.info.render.triangles;
    }

    if (this.modeEl) {
      this.modeEl.innerText = document.documentElement.classList.contains('mode-impact') ? 'IMPACT' : 'CRISIS';
    }

    requestAnimationFrame(() => this.updateLoop());
  }
}
