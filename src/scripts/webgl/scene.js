// src/scripts/webgl/scene.js
import * as THREE from 'three';
import { ParticleSystem } from './particles.js';
import { causticsVertexShader, causticsFragmentShader } from './shaders.js';

export class WebGLScene {
  constructor(containerElement) {
    this.container = containerElement || document.getElementById('webgl');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Stats
    this.stats = {
      fps: 60,
      drawCalls: 0,
    };

    this.clock = new THREE.Clock();
    this.time = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.scrollProgress = 0;
    this.targetBgMode = 1.0;

    this.init();
  }

  init() {
    try {
      // Pixel ratio for crisp rendering without overloading mobile GPUs
      const pixelRatio = Math.min(window.devicePixelRatio, 2);

      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setClearColor(0x0a0a0a, 1);

      if (this.container) {
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
      }

      this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 500);
      this.camera.position.z = 30;

      this.scene = new THREE.Scene();

      // Caustics Background (Rendered behind particles)
      this.initBackground();

      // Particles (Rendered in front of background)
      this.particleSystem = new ParticleSystem();
      this.scene.add(this.particleSystem.container);

      // Bindings
      this.onResize = this.onResize.bind(this);
      this.animate = this.animate.bind(this);

      window.addEventListener('resize', this.onResize);

      this.animate();
    } catch (error) {
      console.error('WebGL initialization error:', error);
    }
  }

  initBackground() {
    this.bgUniforms = {
      uTime: { value: 0 },
      uMode: { value: 1.0 },
    };

    const bgGeometry = new THREE.PlaneGeometry(160, 160);
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader: causticsVertexShader,
      fragmentShader: causticsFragmentShader,
      uniforms: this.bgUniforms,
      depthWrite: false,
      depthTest: false,
    });

    this.bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    this.bgMesh.position.z = -45;
    this.bgMesh.renderOrder = -100; // Always render background first
    this.scene.add(this.bgMesh);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(this.width, this.height);
    }
  }

  onMouseMove(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }

  onScroll(progress) {
    this.scrollProgress = progress;
  }

  setMode(mode) {
    const m = mode === 0 ? 0.0 : 1.0;
    if (this.particleSystem) {
      this.particleSystem.setMode(m);
    }
    this.targetBgMode = m;
  }

  setWireframe(enabled) {
    if (this.particleSystem && this.particleSystem.material) {
      this.particleSystem.material.wireframe = enabled;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const clampedDelta = Math.min(delta, 0.1);
    this.time += clampedDelta;

    // Update FPS stat
    this.stats.fps = delta > 0 ? Math.round(1 / delta) : 60;
    if (this.renderer && this.renderer.info) {
      this.stats.drawCalls = this.renderer.info.render.calls;
    }

    // Parallax camera movement
    const targetCamX = this.mouseX * 1.8;
    const targetCamY = this.mouseY * 1.8;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.04;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.04;
    this.camera.lookAt(0, 0, 0);

    // Background mode lerp
    if (this.bgUniforms && this.bgUniforms.uMode) {
      const currentBgMode = this.bgUniforms.uMode.value;
      this.bgUniforms.uMode.value = Math.max(0, Math.min(1,
        currentBgMode + (this.targetBgMode - currentBgMode) * 0.04
      ));
      this.bgUniforms.uTime.value = this.time;
    }

    // Update particles
    if (this.particleSystem) {
      this.particleSystem.update(this.time, this.scrollProgress, this.mouseX, this.mouseY);
    }

    // Direct, ultra-fast 60fps render
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
