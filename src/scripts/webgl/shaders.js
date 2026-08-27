// src/scripts/webgl/shaders.js
// Optimized for stability and performance

export const waterParticleVertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uMouse;
  uniform float uMode;

  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Gentle movement based on time and mode (up for impact, down for crisis)
    float direction = mix(-1.0, 1.0, uMode);
    float speed = aRandom * 0.3 + 0.05;

    pos.y += uTime * speed * direction;
    pos.y = mod(pos.y + 50.0, 100.0) - 50.0;

    // Simple sine-based displacement (much cheaper than simplex noise)
    pos.x += sin(pos.y * 0.08 + uTime * 0.15) * 1.5 * aRandom;
    pos.z += cos(pos.x * 0.06 + uTime * 0.12) * 1.0 * aRandom;

    // Mouse interaction (safe — no normalize that can produce NaN)
    vec2 diff = pos.xy - uMouse * 15.0;
    float distSq = dot(diff, diff);
    float mouseEffect = 1.0 / (1.0 + distSq * 0.02);
    pos.xy += diff * mouseEffect * 0.3;

    // Scroll effect
    pos.y += uScrollProgress * 5.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Distance based sizing
    gl_PointSize = aSize * (200.0 / max(-mvPosition.z, 1.0));

    // Distance alpha fade
    vAlpha = smoothstep(80.0, 10.0, -mvPosition.z) * 0.6;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const waterParticleFragmentShader = `
  precision mediump float;

  uniform float uMode;

  varying float vAlpha;

  void main() {
    // Soft circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = dot(center, center); // squared distance — cheaper than length()
    if (dist > 0.25) discard; // early discard outside circle radius

    float alpha = smoothstep(0.25, 0.02, dist) * vAlpha;

    // Colors: Cyan for impact (#00e5ff), Amber for crisis (#ff6b00)
    vec3 impactColor = vec3(0.0, 0.898, 1.0);
    vec3 crisisColor = vec3(1.0, 0.42, 0.0);
    vec3 finalColor = mix(crisisColor, impactColor, uMode);

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
    float time = uTime * 0.3;

    // Lightweight sine wave interference (2 layers instead of 3)
    float c1 = sin(p.x * 2.0 + time) + cos(p.y * 2.0 + time);
    float c2 = sin(p.y * 2.5 - time * 0.7) + cos(p.x * 2.5 - time * 0.7);

    float caustics = (c1 + c2) * 0.5;
    caustics = smoothstep(0.3, 2.0, caustics);

    vec3 impactBg = vec3(0.005, 0.025, 0.06);
    vec3 crisisBg = vec3(0.06, 0.015, 0.0);
    vec3 baseColor = mix(crisisBg, impactBg, uMode);

    vec3 impactLight = vec3(0.0, 0.3, 0.5);
    vec3 crisisLight = vec3(0.5, 0.2, 0.0);
    vec3 lightColor = mix(crisisLight, impactLight, uMode);

    vec3 finalColor = baseColor + lightColor * caustics * 0.2;

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

    // Simple vignette (no chromatic aberration — saves 2 extra texture reads)
    vec2 center = vUv - 0.5;
    float dist = dot(center, center);
    float vignette = smoothstep(0.6, 0.15, dist);

    gl_FragColor = vec4(color.rgb * vignette, 1.0);
  }
`;
