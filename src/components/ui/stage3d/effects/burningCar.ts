import * as THREE from "three";
import type { SceneEffect } from "../types";
import { CAR_X, CAR_Z } from "../config";
import { SMOKE_FRAGMENT } from "../shaders/smoke.glsl";
import { makeFlame } from "./flame";
import { makeEmbers } from "./embers";
import { freeze } from "../utils/freeze";

export function makeBurningCar(): SceneEffect {
    const group = new THREE.Group();

    const flames = [
        makeFlame(680, 1050, 0),
        makeFlame(520, 800, 1),
        makeFlame(400, 640, 2),
        // smoke rises above the flames
        makeFlame(950, 1500, 3, SMOKE_FRAGMENT, false),
    ];
    flames[0].mesh.position.set(CAR_X + 200, 560, CAR_Z + 100);
    flames[1].mesh.position.set(CAR_X - 380, 680, CAR_Z - 160);
    flames[2].mesh.position.set(CAR_X + 640, 500, CAR_Z - 40);
    flames[3].mesh.position.set(CAR_X - 60, 980, CAR_Z - 80);
    for (const flame of flames) {
        group.add(flame.mesh);
        freeze(flame.mesh);
    }

    const embers = makeEmbers(48, 1300, 500, 1500);
    if (embers !== null) {
        embers.points.position.set(CAR_X, 640, CAR_Z);
        group.add(embers.points);
        freeze(embers.points);
    }

    const fireLight = new THREE.PointLight(0xff7726, 1.3, 2600, 1);
    fireLight.position.set(CAR_X, 980, CAR_Z);
    group.add(fireLight);
    freeze(fireLight);

    freeze(group);

    return {
        object: group,
        update(elapsed) {
            for (const flame of flames) flame.material.uniforms.uTime.value = elapsed;
            embers?.update(elapsed);
            fireLight.intensity = 1.1 + Math.sin(elapsed * 17) * 0.2 + Math.sin(elapsed * 29 + 1.7) * 0.15;
        },
        dispose() {
            for (const flame of flames) {
                flame.mesh.geometry.dispose();
                flame.material.dispose();
            }
            embers?.dispose();
        },
    };
}
