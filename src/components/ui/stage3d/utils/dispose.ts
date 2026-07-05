import type * as THREE from "three";

export function disposeObject(root: THREE.Object3D): void {
    root.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
            const standard = material as THREE.MeshStandardMaterial;
            standard.map?.dispose();
            standard.normalMap?.dispose();
            standard.roughnessMap?.dispose();
            standard.metalnessMap?.dispose();
            standard.aoMap?.dispose();
            material.dispose();
        }
    });
}
