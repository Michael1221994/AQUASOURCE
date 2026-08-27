// src/scripts/webgl/shaders.js
// High-visibility, luminous water droplet and caustics shaders

export const waterParticleVertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uMouse;
  uniform float uMode;

  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec3 pos = position;
    vRandom = aRandom;

    // Upward moisture floating in impact mode, downward settlement in crisis mode
    float direction = mix(-1.0, 1.0, uMode);
    float speed = aRandom * 0.4 + 0.15;

    pos.y += uTime * speed * direction;
    pos.y = mod(pos.y + 60.0, 120.0) - 60.0;

    // Fluid undulation
    pos.x += sin(pos.y * 0.06 + uTime * 0.4 + aRandom * 6.28) * 2.5;
    pos.z += cos(pos.x * 0.06 + uTime * 0.3 + aRandom * 6.28) * 2.0;

    // Active fluid mouse repulsion wave
    vec2 mouseWorld = uMouse * vec2(40.0, 30.0);
    vec2 diff = pos.xy - mouseWorld;
    float dist = length(diff) + 0.001;
    float radius = 30.0;
    if (dist < radius) {
      float force = 1.0 - (dist / radius);
      pos.xy += (diff / dist) * (force * force * 12.0);
    }

    // Scroll parallax
    pos.y += uScrollProgress * 8.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float depth = max(-mvPosition.z, 1.0);

    // Large, prominent point sizes for droplets
    gl_PointSize = aSize * (360.0 / depth);

    // Distance fade (clamp between 0.4 and 1.0)
    vAlpha = clamp(1.0 - (depth - 5.0) / 75.0, 0.4, 1.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const waterParticleFragmentShader = `
  precision mediump float;

  uniform float uMode;

  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    // Pure procedural glowing droplet equation (zero texture dependencies, 100% reliable)
    float core = 1.0 - smoothstep(0.0, 0.25, dist);
    float body = 1.0 - smoothstep(0.1, 0.50, dist);
    float glow = exp(-dist * 3.5);

    float alpha = clamp((core * 0.6 + body * 0.4 + glow * 0.3) * vAlpha, 0.0, 1.0);

    // Luminous Glacial Cyan (#00f0ff) for impact vs Radiant Solar Amber (#ff7700) for crisis
    vec3 impactColor = vec3(0.0, 0.94, 1.0);
    vec3 crisisColor = vec3(1.0, 0.48, 0.05);
    vec3 baseColor = mix(crisisColor, impactColor, uMode);

    // Bright specular liquid white highlight in center
    vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), core * 0.85);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const causticsVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const causticsFragmentShader = `
  precision mediump float;

  uniform float uTime;
  uniform float uMode;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 3.5;
    float time = uTime * 0.3;

    // Layered liquid wave caustics
    float c1 = sin(p.x * 2.0 + time) + cos(p.y * 2.0 + time);
    float c2 = sin(p.y * 2.5 - time * 0.7) + cos(p.x * 2.5 - time * 0.7);
    float caustics = smoothstep(0.1, 2.0, (c1 + c2) * 0.5);

    // Deep atmospheric ocean blue vs Dark amber background
    vec3 impactBg = vec3(0.006, 0.03, 0.065);
    vec3 crisisBg = vec3(0.055, 0.015, 0.003);
    vec3 baseColor = mix(crisisBg, impactBg, uMode);

    vec3 impactLight = vec3(0.0, 0.55, 0.75);
    vec3 crisisLight = vec3(0.65, 0.25, 0.02);
    vec3 lightColor = mix(crisisLight, impactLight, uMode);

    vec3 finalColor = baseColor + lightColor * caustics * 0.22;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
