import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { StageContext, TerminalScreen } from "../types";
import { PROPS } from "../config";
import { freeze } from "../utils/freeze";
import { disposeObject } from "../utils/dispose";

export interface Props {
    dispose(): void;
}

export function loadProps(group: THREE.Group, terminal: TerminalScreen | null, ctx: StageContext): Props {
    const loaded: THREE.Group[] = [];
    const loader = new GLTFLoader();

    for (const prop of PROPS) {
        loader.load(
            prop.url,
            (gltf) => {
                if (ctx.isDisposed()) return;
                const model = gltf.scene;
                model.rotation.y = prop.rotationY;
                if (prop.normalize !== undefined) {
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    model.scale.setScalar(prop.normalize / Math.max(size.x, size.y, size.z));
                    const scaled = new THREE.Box3().setFromObject(model);
                    const center = scaled.getCenter(new THREE.Vector3());
                    model.position.set(
                        prop.position[0] - center.x,
                        prop.position[1] - scaled.min.y,
                        prop.position[2] - center.z,
                    );
                } else {
                    model.scale.setScalar(prop.scale ?? 1);
                    model.position.set(...prop.position);
                }
                model.traverse((child) => {
                    const mesh = child as THREE.Mesh;
                    if (mesh.isMesh) {
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        if (!Array.isArray(mesh.material)) {
                            const maps = mesh.material as THREE.MeshStandardMaterial;
                            for (const map of [maps.map, maps.normalMap, maps.roughnessMap, maps.aoMap]) {
                                if (map) map.anisotropy = 8;
                            }
                        }
                        if (
                            terminal !== null &&
                            !Array.isArray(mesh.material) &&
                            mesh.material.name === "classic_laptop_screen"
                        ) {
                            mesh.material.dispose();
                            terminal.texture.wrapS = THREE.RepeatWrapping;
                            terminal.texture.wrapT = THREE.RepeatWrapping;
                            mesh.material = new THREE.MeshBasicMaterial({
                                map: terminal.texture,
                                side: THREE.DoubleSide,
                            });
                        }
                    }
                    freeze(child);
                });
                group.add(model);
                loaded.push(model);
                ctx.requestShadowUpdate();
                ctx.recompileAndRender();
            },
            undefined,
            () => undefined,
        );
    }

    return {
        dispose() {
            for (const model of loaded) disposeObject(model);
        },
    };
}
