// src/scripts/webgl/shaders.js
// High-performance, luminous water particle and caustics shaders

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

    // Fluid vertical floating: rises upward in impact mode, settles down in crisis mode
    float direction = mix(-1.0, 1.0, uMode);
    float speed = aRandom * 0.35 + 0.12;

    pos.y += uTime * speed * direction;
    pos.y = mod(pos.y + 60.0, 120.0) - 60.0;

    // Organic liquid undulation waves
    pos.x += sin(pos.y * 0.06 + uTime * 0.4 + aRandom * 6.28) * 2.5;
    pos.z += cos(pos.x * 0.06 + uTime * 0.3 + aRandom * 6.28) * 2.0;

    // Interactive mouse repulsion wave (safe, strictly positive distance)
    vec2 mouseWorld = uMouse * vec2(35.0, 25.0);
    vec2 diff = pos.xy - mouseWorld;
    float dist = length(diff) + 0.001;
    float radius = 22.0;
    if (dist < radius) {
      float force = (1.0 - dist / radius);
      pos.xy += (diff / dist) * force * force * 5.5;
    }

    // Scroll interaction
    pos.y += uScrollProgress * 6.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float depth = max(-mvPosition.z, 1.0);

    // Dynamic point sizing for glowing bokeh droplets
    gl_PointSize = aSize * (320.0 / depth);

    // Distance fade (clamp between 0.25 and 0.95 — never 0)
    vAlpha = clamp(1.0 - (depth - 10.0) / 70.0, 0.25, 0.95);

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

    // Luminous water droplet with bright inner core and soft outer glow
    float core = smoothstep(0.35, 0.0, dist);
    float glow = exp(-dist * 3.6);
    float rim = smoothstep(0.48, 0.2, dist) * smoothstep(0.05, 0.25, dist);

    float alpha = (core * 0.5 + glow * 0.45 + rim * 0.35) * vAlpha;

    // Vibrant Glacial Cyan (#00f0ff) for impact vs Radiant Amber (#ff7700) for crisis
    vec3 impactColor = vec3(0.0, 0.93, 1.0);
    vec3 crisisColor = vec3(1.0, 0.46, 0.04);
    vec3 finalColor = mix(crisisColor, impactColor, uMode);

    // Add bright white refraction glint in droplet center
    finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), core * 0.65);

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
    vec2 p = vUv * 4.0;
    float time = uTime * 0.35;

    // Layered liquid wave interference
    float c1 = sin(p.x * 2.2 + time) + cos(p.y * 2.2 + time);
    float c2 = sin(p.y * 2.8 - time * 0.8) + cos(p.x * 2.8 - time * 0.8);
    float caustics = smoothstep(0.2, 2.2, (c1 + c2) * 0.5);

    // Deep atmospheric ocean blue vs Deep arid volcanic dark background
    vec3 impactBg = vec3(0.008, 0.035, 0.075);
    vec3 crisisBg = vec3(0.065, 0.018, 0.004);
    vec3 baseColor = mix(crisisBg, impactBg, uMode);

    vec3 impactLight = vec3(0.0, 0.55, 0.75);
    vec3 crisisLight = vec3(0.65, 0.25, 0.02);
    vec3 lightColor = mix(crisisLight, impactLight, uMode);

    vec3 finalColor = baseColor + lightColor * caustics * 0.28;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const vignetteVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const vignetteFragmentShader = `
  precision mediump float;

  uniform sampler2D tDiffuse;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    // Atmospheric corner vignette
    vec2 center = vUv - 0.5;
    float dist = dot(center, center);
    float vignette = smoothstep(0.65, 0.12, dist);

    gl_FragColor = vec4(color.rgb * vignette, 1.0);
  }
`;
