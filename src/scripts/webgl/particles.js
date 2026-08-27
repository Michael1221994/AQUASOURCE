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
      uMode: { value: 1.0 }, // 1 = impact (cyan), 0 = crisis (amber)
    };

    this.targetMode = 1.0;

    this.material = new THREE.ShaderMaterial({
      vertexShader: waterParticleVertexShader,
      fragmentShader: waterParticleFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    // Layer 1: Ambient floating moisture field (1,500 particles, sizes 6.0 to 14.0)
    this.createLayer(1500, 6.0, 14.0, 95, 95, 45, -8.0);

    // Layer 2: Large prominent radiant water droplets (450 droplets, sizes 24.0 to 56.0)
    this.createLayer(450, 24.0, 56.0, 80, 80, 30, -3.0);
  }

  createLayer(count, minSize, maxSize, spreadX, spreadY, spreadZ, offsetZ) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ + offsetZ;

      randoms[i] = Math.random();
      sizes[i] = minSize + Math.random() * (maxSize - minSize);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const points = new THREE.Points(geometry, this.material);
    points.renderOrder = 10;
    this.container.add(points);
  }

  update(time, scrollProgress, mouseX, mouseY) {
    this.uniforms.uTime.value = time;
    this.uniforms.uScrollProgress.value = scrollProgress;

    // Smooth responsive mouse interpolation
    const targetX = Math.max(-1.5, Math.min(1.5, mouseX));
    const targetY = Math.max(-1.5, Math.min(1.5, mouseY));
    this.uniforms.uMouse.value.x += (targetX - this.uniforms.uMouse.value.x) * 0.08;
    this.uniforms.uMouse.value.y += (targetY - this.uniforms.uMouse.value.y) * 0.08;

    // Smooth mode color transition
    const currentMode = this.uniforms.uMode.value;
    this.uniforms.uMode.value = currentMode + (this.targetMode - currentMode) * 0.04;
    this.uniforms.uMode.value = Math.max(0, Math.min(1, this.uniforms.uMode.value));
  }

  setMode(mode) {
    this.targetMode = mode === 0 ? 0.0 : 1.0;
  }
}
