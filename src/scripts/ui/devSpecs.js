export class DevSpecs {
    constructor() {
        this.scene = null;
        this.panel = null;
        this.isOpen = false;
        this.fpsEl = null;
        this.drawCallsEl = null;
        this.trianglesEl = null;
        this.particlesEl = null;
        this.scrollEl = null;
        this.modeEl = null;
        
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
        const container = document.createElement('div');
        container.className = 'dev-specs-container glass';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: var(--font-mono);
            font-size: 0.75rem;
            color: var(--color-pure-white);
            border-color: var(--color-impact-cyan);
            display: flex;
            flex-direction: column;
            transform: translateX(calc(100% - 40px));
            transition: transform 0.3s ease;
        `;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'dev-specs-toggle';
        toggleBtn.innerText = '{ }';
        toggleBtn.style.cssText = `
            background: transparent;
            border: none;
            color: var(--color-impact-cyan);
            cursor: pointer;
            padding: 10px;
            width: 40px;
            text-align: center;
            align-self: flex-start;
        `;
        
        const content = document.createElement('div');
        content.className = 'dev-specs-content';
        content.style.cssText = `
            padding: 20px;
            display: grid;
            gap: 10px;
        `;
        
        content.innerHTML = `
            <div>FPS: <span id="ds-fps">0</span></div>
            <div>Draw Calls: <span id="ds-draw">0</span></div>
            <div>Triangles: <span id="ds-tri">0</span></div>
            <div>Particles: <span id="ds-part">0</span></div>
            <div>Scroll: <span id="ds-scroll">0%</span></div>
            <div>Mode: <span id="ds-mode">CRISIS</span></div>
            <button id="ds-wireframe" style="margin-top:10px; background:var(--color-impact-cyan); color:black; border:none; padding:5px; cursor:pointer;">Toggle Wireframe</button>
            <details style="margin-top:10px;">
                <summary style="cursor:pointer; color:var(--color-impact-cyan);">Architecture</summary>
                <ul style="padding-left:15px; margin-top:5px;">
                    <li>Three.js WebGL</li>
                    <li>Tailwind CSS v4</li>
                    <li>Vanilla JS ES6+</li>
                    <li>Custom CSS 3D Engine</li>
                </ul>
            </details>
        `;
        
        container.appendChild(toggleBtn);
        container.appendChild(content);
        document.body.appendChild(container);
        
        this.panel = container;
        this.fpsEl = document.getElementById('ds-fps');
        this.drawCallsEl = document.getElementById('ds-draw');
        this.trianglesEl = document.getElementById('ds-tri');
        this.particlesEl = document.getElementById('ds-part');
        this.scrollEl = document.getElementById('ds-scroll');
        this.modeEl = document.getElementById('ds-mode');
        
        this.toggleBtn = toggleBtn;
        this.wireframeBtn = document.getElementById('ds-wireframe');
    }

    attachListeners() {
        this.toggleBtn.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            this.panel.style.transform = this.isOpen ? 'translateX(0)' : 'translateX(calc(100% - 40px))';
        });
        
        this.wireframeBtn.addEventListener('click', () => {
            if (this.scene && typeof this.scene.setWireframe === 'function') {
                this.scene.setWireframe();
            }
        });
        
        window.addEventListener('scroll', () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPos = window.scrollY;
            const progress = (scrollPos / docHeight) * 100;
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
        
        // Mocking or fetching from real scene object
        if (this.scene && this.scene.renderer) {
            if (this.drawCallsEl) this.drawCallsEl.innerText = this.scene.renderer.info.render.calls;
            if (this.trianglesEl) this.trianglesEl.innerText = this.scene.renderer.info.render.triangles;
        }
        if (this.scene && this.scene.particlesCount !== undefined) {
            if (this.particlesEl) this.particlesEl.innerText = this.scene.particlesCount;
        }
        
        if (this.modeEl) {
            this.modeEl.innerText = document.documentElement.classList.contains('mode-impact') ? 'IMPACT' : 'CRISIS';
        }
        
        requestAnimationFrame(() => this.updateLoop());
    }
}
