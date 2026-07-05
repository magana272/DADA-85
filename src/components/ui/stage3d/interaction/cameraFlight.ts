import * as THREE from "three";
import type { ViewName } from "../types";
import {
    CALC_SCALE,
    CALC_VIEW_HEIGHT_FACTOR,
    CALC_VIEW_MIN_DISTANCE,
    LAPTOP_X,
    LAPTOP_Z,
    LAPTOP_VIEW_TARGET_Y,
    LAPTOP_VIEW_OFFSET,
} from "../config";

export interface CameraFlight {
    setView(next: ViewName): void;
    currentView(): ViewName;
    flyTo(position: THREE.Vector3, lookAt: THREE.Vector3): void;
    step(dt: number): void;
    cancel(): void;
}

export function createCameraFlight(
    camera: THREE.PerspectiveCamera,
    target: THREE.Vector3,
    getFloorY: () => number,
    getCalcHeight: () => number,
    onViewChange: (next: ViewName) => void,
): CameraFlight {
    const goalPosition = new THREE.Vector3();
    const goalTarget = new THREE.Vector3();
    let flying = false;
    let view: ViewName = "calculator";

    return {
        setView(next) {
            view = next;
            if (next === "laptop") {
                const y = getFloorY();
                goalTarget.set(LAPTOP_X, y + LAPTOP_VIEW_TARGET_Y, LAPTOP_Z);
                goalPosition.set(
                    LAPTOP_X + LAPTOP_VIEW_OFFSET[0],
                    y + LAPTOP_VIEW_OFFSET[1],
                    LAPTOP_Z + LAPTOP_VIEW_OFFSET[2],
                );
            } else {
                const distance = Math.max(CALC_VIEW_MIN_DISTANCE, getCalcHeight() * CALC_SCALE * CALC_VIEW_HEIGHT_FACTOR);
                goalTarget.set(0, 0, 0);
                goalPosition.set(0, 70, distance);
            }
            flying = true;
            onViewChange(next);
        },
        currentView() {
            return view;
        },
        flyTo(position, lookAt) {
            goalPosition.copy(position);
            goalTarget.copy(lookAt);
            flying = true;
        },
        step(dt) {
            if (!flying) return;
            const k = 1 - Math.exp(-3.5 * dt);
            camera.position.lerp(goalPosition, k);
            target.lerp(goalTarget, k);
            if (camera.position.distanceTo(goalPosition) < 2 && target.distanceTo(goalTarget) < 2) {
                flying = false;
            }
        },
        cancel() {
            flying = false;
        },
    };
}
