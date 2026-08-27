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
      uMode: { value: 1.0 } // 1 = impact (cyan), 0 = crisis (amber)
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

    // Layer 1: Ambient floating moisture particles (1,500 count, size 3 to 9)
    this.createLayer(1500, 3.0, 9.0, 90, 90, 45);

    // Layer 2: Large luminous water droplets (350 count, size 16 to 38)
    this.createLayer(350, 16.0, 38.0, 75, 75, 30);
  }

  createLayer(count, minSize, maxSize, spreadX, spreadY, spreadZ) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ - 10.0;

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

    // Smooth responsive mouse interpolation
    const targetX = Math.max(-1.5, Math.min(1.5, mouseX));
    const targetY = Math.max(-1.5, Math.min(1.5, mouseY));
    this.uniforms.uMouse.value.x += (targetX - this.uniforms.uMouse.value.x) * 0.06;
    this.uniforms.uMouse.value.y += (targetY - this.uniforms.uMouse.value.y) * 0.06;

    // Smooth mode color transition
    const currentMode = this.uniforms.uMode.value;
    this.uniforms.uMode.value = currentMode + (this.targetMode - currentMode) * 0.04;
    this.uniforms.uMode.value = Math.max(0, Math.min(1, this.uniforms.uMode.value));
  }

  setMode(mode) {
    this.targetMode = mode === 0 ? 0.0 : 1.0;
  }
}
