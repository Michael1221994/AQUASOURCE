// src/scripts/webgl/particles.js
import * as THREE from 'three';
import { waterParticleVertexShader, waterParticleFragmentShader } from './shaders.js';

export class ParticleSystem {
  constructor() {
    this.container = new THREE.Group();

    this.uniforms = {
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMode: { value: 1.0 } // 1 = impact, 0 = crisis
    };

    this.targetMode = 1.0;

    this.material = new THREE.ShaderMaterial({
      vertexShader: waterParticleVertexShader,
      fragmentShader: waterParticleFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Layer 1: Small particles (1500 — reduced from 3000)
    this.createLayer(1500, 1.0, 4.0);

    // Layer 2: Large droplets (300 — reduced from 500)
    this.createLayer(300, 2.5, 8.0);
  }

  createLayer(count, minSize, maxSize) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 15;

      randoms[i] = Math.random();
      sizes[i] = minSize + Math.random() * (maxSize - minSize);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const points = new THREE.Points(geometry, this.material);
    this.container.add(points);
  }

  update(time, scrollProgress, mouseX, mouseY) {
    this.uniforms.uTime.value = time;
    this.uniforms.uScrollProgress.value = scrollProgress;

    // Smooth mouse follow (clamped to prevent extreme values)
    const targetX = Math.max(-1, Math.min(1, mouseX));
    const targetY = Math.max(-1, Math.min(1, mouseY));
    this.uniforms.uMouse.value.x += (targetX - this.uniforms.uMouse.value.x) * 0.03;
    this.uniforms.uMouse.value.y += (targetY - this.uniforms.uMouse.value.y) * 0.03;

    // Lerp mode (clamped 0-1)
    const currentMode = this.uniforms.uMode.value;
    this.uniforms.uMode.value = currentMode + (this.targetMode - currentMode) * 0.03;
    this.uniforms.uMode.value = Math.max(0, Math.min(1, this.uniforms.uMode.value));
  }

  setMode(mode) {
    this.targetMode = mode === 0 ? 0.0 : 1.0;
  }
}
