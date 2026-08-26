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
    
    this.init();
  }
  
  init() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
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
  }
  
  initBackground() {
    this.bgUniforms = {
      uTime: { value: 0 },
      uMode: { value: 1.0 }
    };
    
    const bgGeometry = new THREE.PlaneGeometry(200, 200);
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader: causticsVertexShader,
      fragmentShader: causticsFragmentShader,
      uniforms: this.bgUniforms,
      depthWrite: false,
      depthTest: false
    });
    
    this.bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    this.bgMesh.position.z = -50; // Place behind everything
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
    // Accept normalized -1 to 1 values from the application
    this.mouseX = x;
    this.mouseY = y;
  }
  
  onScroll(progress) {
    this.scrollProgress = progress;
  }
  
  setMode(mode) { // 0 = crisis, 1 = impact
    this.particleSystem.setMode(mode);
    this.targetBgMode = mode;
  }
  
  setWireframe(enabled) {
    this.particleSystem.material.wireframe = enabled;
  }
  
  animate() {
    requestAnimationFrame(this.animate);
    
    const delta = this.clock.getDelta();
    this.time += delta;
    
    // Update FPS
    this.stats.fps = Math.round(1 / delta);
    this.stats.drawCalls = this.renderer.info.render.calls;
    
    // Parallax camera effect
    const targetCamX = this.mouseX * 2; // ~2 degrees max shift conceptually mapping
    const targetCamY = this.mouseY * 2;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);
    
    // Update mode lerp for background
    if (this.targetBgMode !== undefined) {
      this.bgUniforms.uMode.value += (this.targetBgMode - this.bgUniforms.uMode.value) * 0.05;
    }
    this.bgUniforms.uTime.value = this.time;
    
    // Update particles
    this.particleSystem.update(this.time, this.scrollProgress, this.mouseX, this.mouseY);
    
    // Render
    this.composer.render();
  }
}
