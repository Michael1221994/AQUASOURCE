// src/scripts/webgl/scene.js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { ParticleSystem } from './particles.js';
import { causticsVertexShader, causticsFragmentShader, vignetteVertexShader, vignetteFragmentShader } from './shaders.js';

export class WebGLScene {
  constructor(containerElement) {
    this.container = containerElement;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Stats
    this.stats = {
      fps: 0,
      drawCalls: 0
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
      // Cap pixel ratio to 1.5 to prevent GPU overload on high-DPI screens
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5);

      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: pixelRatio <= 1, // disable AA on high-DPI (already crisp)
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(pixelRatio);
      this.container.appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 500);
      this.camera.position.z = 30;

      this.scene = new THREE.Scene();

      // Caustics Background
      this.initBackground();

      // Particles
      this.particleSystem = new ParticleSystem();
      this.scene.add(this.particleSystem.container);

      // Post-processing
      this.initPostProcessing();

      // Bindings
      this.onResize = this.onResize.bind(this);
      this.animate = this.animate.bind(this);

      window.addEventListener('resize', this.onResize);

      this.animate();
    } catch (error) {
      console.error('WebGL initialization failed:', error);
    }
  }

  initBackground() {
    this.bgUniforms = {
      uTime: { value: 0 },
      uMode: { value: 1.0 }
    };

    const bgGeometry = new THREE.PlaneGeometry(150, 150);
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader: causticsVertexShader,
      fragmentShader: causticsFragmentShader,
      uniforms: this.bgUniforms,
      depthWrite: false,
      depthTest: false
    });

    this.bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    this.bgMesh.position.z = -40;
    this.scene.add(this.bgMesh);
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const vignetteShader = {
      uniforms: {
        tDiffuse: { value: null }
      },
      vertexShader: vignetteVertexShader,
      fragmentShader: vignetteFragmentShader
    };

    this.vignettePass = new ShaderPass(vignetteShader);
    this.composer.addPass(this.vignettePass);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
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
    this.particleSystem.setMode(m);
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
    // Clamp delta to prevent huge jumps if tab was backgrounded
    const clampedDelta = Math.min(delta, 0.1);
    this.time += clampedDelta;

    // Update FPS (guarded against division by zero)
    this.stats.fps = delta > 0 ? Math.round(1 / delta) : 0;
    this.stats.drawCalls = this.renderer.info.render.calls;

    // Subtle parallax camera (clamped movement)
    const targetCamX = this.mouseX * 1.5;
    const targetCamY = this.mouseY * 1.5;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.03;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.03;
    this.camera.lookAt(0, 0, 0);

    // Background mode lerp (clamped)
    const currentBgMode = this.bgUniforms.uMode.value;
    this.bgUniforms.uMode.value = Math.max(0, Math.min(1,
      currentBgMode + (this.targetBgMode - currentBgMode) * 0.03
    ));
    this.bgUniforms.uTime.value = this.time;

    // Update particles
    this.particleSystem.update(this.time, this.scrollProgress, this.mouseX, this.mouseY);

    // Render
    this.composer.render();
  }
}
