import type * as THREE from "three";

export function freeze(object: THREE.Object3D): void {
    object.updateMatrix();
    object.matrixAutoUpdate = false;
}
