import { NOISE_GLSL } from "./noise.glsl";

export const FLAME_VERTEX = /* glsl */ `
uniform vec2 uSize;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mvPosition.xy += vec2(position.x * uSize.x, (position.y + 0.5) * uSize.y);
    gl_Position = projectionMatrix * mvPosition;
}
`;

export const FLAME_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uSeed;
varying vec2 vUv;
${NOISE_GLSL}
void main() {
    vec2 uv = vUv;
    float x = uv.x * 2.0 - 1.0;
    float t = uTime + uSeed * 37.0;

    float turbulence = fbm(vec2(x * 2.2 + uSeed, uv.y * 4.5 - t * 2.1));
    turbulence = 0.6 * turbulence + 0.4 * fbm(vec2(x * 5.5 - uSeed * 3.0, uv.y * 9.0 - t * 3.6));

    float xx = x * (1.0 + uv.y * 1.4) + (turbulence - 0.5) * (0.35 + uv.y * 1.9);
    float body = 1.0 - abs(xx);
    float envelope = pow(max(1.0 - uv.y, 0.0), 0.8);
    float intensity = clamp(body * envelope * 2.6 - 0.62, 0.0, 1.0);
    // whole-flame flicker, like real combustion
    float flicker = 0.82 + 0.36 * noise(vec2(t * 3.1, uSeed * 7.0));
    intensity = pow(intensity, 1.2) * flicker;
    if (intensity < 0.012) discard;

    vec3 color = vec3(0.55, 0.04, 0.0);
    color = mix(color, vec3(1.0, 0.45, 0.02), smoothstep(0.05, 0.4, intensity));
    color = mix(color, vec3(1.0, 0.85, 0.35), smoothstep(0.45, 0.8, intensity));
    color = mix(color, vec3(1.0, 0.98, 0.85), smoothstep(0.82, 0.98, intensity));
    gl_FragColor = vec4(color, intensity);
}
`;
