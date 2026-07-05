import { NOISE_GLSL } from "./noise.glsl";

export const SMOKE_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uSeed;
varying vec2 vUv;
${NOISE_GLSL}
void main() {
    vec2 uv = vUv;
    float x = uv.x * 2.0 - 1.0;
    float t = uTime * 0.4 + uSeed * 11.0;
    float n = fbm(vec2(x * 1.6 + uSeed, uv.y * 2.6 - t));
    float column = 1.0 - abs(x * (0.7 + uv.y * 0.9) + (n - 0.5) * 1.1);
    float fade = smoothstep(0.0, 0.25, uv.y) * (1.0 - smoothstep(0.55, 1.0, uv.y));
    float alpha = clamp(column, 0.0, 1.0) * fade * n * 0.32;
    if (alpha < 0.01) discard;
    vec3 color = mix(vec3(0.09, 0.09, 0.1), vec3(0.24, 0.23, 0.24), n);
    gl_FragColor = vec4(color, alpha);
}
`;
