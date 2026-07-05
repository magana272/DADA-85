import * as THREE from "three";
import { FLAME_VERTEX, FLAME_FRAGMENT } from "../shaders/flame.glsl";

export interface Flame {
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
}

export function makeFlame(
    width: number,
    height: number,
    seed: number,
    fragment: string = FLAME_FRAGMENT,
    additive = true,
): Flame {
    const material = new THREE.ShaderMaterial({
        vertexShader: FLAME_VERTEX,
        fragmentShader: fragment,
        uniforms: {
            uTime: { value: 0 },
            uSeed: { value: seed },
            uSize: { value: new THREE.Vector2(width, height) },
        },
        transparent: true,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.frustumCulled = false;
    return { mesh, material };
}
