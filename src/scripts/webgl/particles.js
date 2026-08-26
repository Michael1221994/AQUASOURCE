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
    
    // Layer 1: Small particles (3000)
    this.createLayer(3000, 1.0, 5.0);
    
    // Layer 2: Large droplets (500)
    this.createLayer(500, 3.0, 12.0);
  }
  
  createLayer(count, minSize, maxSize) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20; // push slightly back
      
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
    
    // Smooth mouse follow
    this.uniforms.uMouse.value.x += (mouseX - this.uniforms.uMouse.value.x) * 0.05;
    this.uniforms.uMouse.value.y += (mouseY - this.uniforms.uMouse.value.y) * 0.05;
    
    // Lerp mode
    this.uniforms.uMode.value += (this.targetMode - this.uniforms.uMode.value) * 0.05;
  }
  
  setMode(mode) {
    this.targetMode = mode;
  }
}
