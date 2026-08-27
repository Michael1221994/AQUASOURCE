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

    // Floating vertical motion: rises upward in impact mode, settles down in crisis mode
    float direction = mix(-1.0, 1.0, uMode);
    float speed = aRandom * 0.45 + 0.18;

    pos.y += uTime * speed * direction;
    pos.y = mod(pos.y + 60.0, 120.0) - 60.0;

    // Organic liquid undulation waves
    pos.x += sin(pos.y * 0.05 + uTime * 0.5 + aRandom * 6.28) * 3.0;
    pos.z += cos(pos.x * 0.05 + uTime * 0.4 + aRandom * 6.28) * 2.0;

    // Dynamic mouse repulsion wave (droplets actively part around the cursor)
    vec2 mouseWorld = uMouse * vec2(40.0, 30.0);
    vec2 diff = pos.xy - mouseWorld;
    float dist = length(diff) + 0.001;
    float radius = 28.0;
    if (dist < radius) {
      float force = (1.0 - dist / radius);
      pos.xy += (diff / dist) * (force * force * 10.0);
    }

    // Scroll parallax interaction
    pos.y += uScrollProgress * 8.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float depth = max(-mvPosition.z, 1.0);

    // Large, prominent point sizes for droplets
    gl_PointSize = aSize * (360.0 / depth);

    // Stable distance fade
    vAlpha = clamp(1.0 - (depth - 5.0) / 70.0, 0.4, 1.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const waterParticleFragmentShader = `
  precision mediump float;

  uniform sampler2D tDroplet;
  uniform float uMode;

  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec4 texColor = texture2D(tDroplet, gl_PointCoord);
    if (texColor.a < 0.01) discard;

    // Vibrant Glacial Cyan (#00f0ff) for impact vs Radiant Solar Amber (#ff7700) for crisis
    vec3 impactColor = vec3(0.0, 0.94, 1.0);
    vec3 crisisColor = vec3(1.0, 0.48, 0.05);
    vec3 baseColor = mix(crisisColor, impactColor, uMode);

    // Tint texture with mode color while preserving bright specular white center
    vec3 finalColor = mix(baseColor * texColor.rgb, vec3(1.0, 1.0, 1.0), texColor.r * 0.7);

    gl_FragColor = vec4(finalColor, texColor.a * vAlpha);
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
