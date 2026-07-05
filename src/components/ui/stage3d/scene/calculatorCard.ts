import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import type { StageContext } from "../types";
import { CASE_DEPTH, CALC_SCALE } from "../config";
import { freeze } from "../utils/freeze";
import { roundedRectShape } from "../utils/roundedRect";

export interface CalculatorCard {
    cssGroup: THREE.Group;
    glGroup: THREE.Group;
    rebuild(width: number, height: number): void;
    setRotation(x: number, y: number): void;
    dispose(): void;
}
export function createCalculatorCard(
    frontTarget: HTMLElement,
    backTarget: HTMLElement,
    ctx: StageContext,
): CalculatorCard {
    const cssGroup = new THREE.Group();
    cssGroup.scale.setScalar(CALC_SCALE);
    const glGroup = new THREE.Group();
    glGroup.scale.setScalar(CALC_SCALE);
    freeze(cssGroup);
    freeze(glGroup);

    const frontObject = new CSS3DObject(frontTarget);
    frontObject.position.z = CASE_DEPTH / 2;
    frontObject.scale.setScalar(0.5);
    cssGroup.add(frontObject);
    freeze(frontObject);

    const backObject = new CSS3DObject(backTarget);
    backObject.rotation.y = Math.PI;
    backObject.position.z = -CASE_DEPTH / 2;
    backObject.scale.setScalar(0.5);
    cssGroup.add(backObject);
    freeze(backObject);

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x26282c,
        roughness: 0.35,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25,
    })
    const cutoutMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        blending: THREE.NoBlending,
        side: THREE.DoubleSide,
    });
    let bodyMesh: THREE.Mesh | null = null;
    let cutoutMeshes: THREE.Mesh[] = [];

    const rebuild = (width: number, height: number) => {
        if (bodyMesh !== null) {
            glGroup.remove(bodyMesh);
            bodyMesh.geometry.dispose();
        }
        for (const cutout of cutoutMeshes) {
            glGroup.remove(cutout);
            cutout.geometry.dispose();
        }
        const geometry = new THREE.ExtrudeGeometry(
            roundedRectShape(width - 8, height - 8, 26),
            { depth: CASE_DEPTH - 4, bevelEnabled: false },
        );
        geometry.translate(0, 0, -(CASE_DEPTH - 4) / 2);
        bodyMesh = new THREE.Mesh(geometry, bodyMaterial);
        bodyMesh.castShadow = true;
        glGroup.add(bodyMesh);
        freeze(bodyMesh);

        cutoutMeshes = [CASE_DEPTH / 2, -CASE_DEPTH / 2].map((z) => {
            const cutout = new THREE.Mesh(
                new THREE.ShapeGeometry(roundedRectShape(width - 2, height - 2, 30)),
                cutoutMaterial,
            );
            cutout.position.z = z;
            glGroup.add(cutout);
            freeze(cutout);
            return cutout;
        });
        ctx.requestShadowUpdate();
    };

    const setRotation = (x: number, y: number) => {
        cssGroup.rotation.set(x, y, 0);
        glGroup.rotation.set(x, y, 0);
        cssGroup.updateMatrix();
        glGroup.updateMatrix();
        ctx.requestShadowUpdate();
    };

    return {
        cssGroup,
        glGroup,
        rebuild,
        setRotation,
        dispose() {
            bodyMesh?.geometry.dispose();
            bodyMaterial.dispose();
            for (const cutout of cutoutMeshes) cutout.geometry.dispose();
            cutoutMaterial.dispose();
        },
    };
}
