// src/scripts/webgl/shaders.js

export const waterParticleVertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uMouse;
  uniform float uMode;

  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec3 pos = position;

    // Movement based on time and mode (up for impact, down for crisis)
    float direction = mix(-1.0, 1.0, uMode);
    float speed = aRandom * 0.5 + 0.1;
    
    pos.y += uTime * speed * direction;
    pos.y = mod(pos.y + 50.0, 100.0) - 50.0;

    // Displacement noise
    float noise = snoise(vec2(pos.x * 0.05, pos.y * 0.05 + uTime * 0.1));
    pos.x += noise * 2.0;
    pos.z += snoise(vec2(pos.y * 0.05, pos.z * 0.05 + uTime * 0.1)) * 2.0;

    // Mouse interaction
    float distToMouse = distance(pos.xy, uMouse * 20.0);
    float mouseEffect = smoothstep(10.0, 0.0, distToMouse);
    pos.xy += normalize(pos.xy - uMouse * 20.0) * mouseEffect * 2.0;

    // Scroll effect
    pos.y += uScrollProgress * 10.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Distance based sizing
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    
    // Distance alpha fade
    vAlpha = smoothstep(100.0, 10.0, -mvPosition.z) * 0.8;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const waterParticleFragmentShader = `
  uniform float uMode;
  
  varying float vAlpha;
  
  void main() {
    // Soft circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
    
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
  uniform float uTime;
  uniform float uMode;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 5.0;
    
    float time = uTime * 0.5;
    
    // Sine wave interference
    float c1 = sin(p.x * 2.0 + time) + cos(p.y * 2.0 + time);
    float c2 = sin(p.y * 3.0 - time) + cos(p.x * 3.0 - time);
    float c3 = sin(p.x * 1.5 + p.y * 1.5 + time);
    
    float caustics = c1 + c2 + c3;
    caustics = smoothstep(0.5, 3.0, caustics);
    
    vec3 impactBg = vec3(0.01, 0.05, 0.1);
    vec3 crisisBg = vec3(0.1, 0.02, 0.0);
    vec3 baseColor = mix(crisisBg, impactBg, uMode);
    
    vec3 impactLight = vec3(0.0, 0.5, 0.8);
    vec3 crisisLight = vec3(0.8, 0.3, 0.0);
    vec3 lightColor = mix(crisisLight, impactLight, uMode);
    
    vec3 finalColor = baseColor + lightColor * caustics * 0.3;
    
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
  uniform sampler2D tDiffuse;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv;
    
    // Chromatic aberration
    float amount = 0.002;
    float r = texture2D(tDiffuse, p + vec2(amount, 0.0)).r;
    float g = texture2D(tDiffuse, p).g;
    float b = texture2D(tDiffuse, p - vec2(amount, 0.0)).b;
    vec4 color = vec4(r, g, b, 1.0);
    
    // Vignette
    vec2 center = p - 0.5;
    float dist = length(center);
    float vignette = smoothstep(0.8, 0.3, dist);
    
    gl_FragColor = color * vignette;
  }
`;
