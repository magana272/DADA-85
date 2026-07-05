import * as THREE from "three";
import type { StageContext, TerminalScreen, ViewName } from "../types";
import { LAPTOP_X, LAPTOP_Z } from "../config";
import { freeze } from "../utils/freeze";
import { targetsFace } from "./gestureGate";

export interface LaptopFocus {
    hitProxy: THREE.Mesh;
    setFocus(value: boolean): void;
    dispose(): void;
}


export function attachLaptopFocus(
    container: HTMLElement,
    camera: THREE.Camera,
    terminal: TerminalScreen | null,
    getView: () => ViewName,
    getElapsed: () => number,
    ctx: StageContext,
): LaptopFocus {
    let focused = false;

    const hitProxy = new THREE.Mesh(
        new THREE.BoxGeometry(520, 360, 460),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
    );
    hitProxy.position.set(LAPTOP_X, 150, LAPTOP_Z);
    freeze(hitProxy);

    const setFocus = (value: boolean) => {
        if (focused === value || terminal === null) return;
        focused = value;
        terminal.setFocused(value);
        terminal.update(getElapsed());
        ctx.invalidate();
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pressX = 0;
    let pressY = 0;
    const onDown = (event: PointerEvent) => {
        pressX = event.clientX;
        pressY = event.clientY;
    };
    const onUp = (event: PointerEvent) => {
        if (Math.hypot(event.clientX - pressX, event.clientY - pressY) > 8) return;
        if (targetsFace(event)) {
            setFocus(false);
            return;
        }
        pointer.set(
            (event.clientX / container.clientWidth) * 2 - 1,
            -(event.clientY / container.clientHeight) * 2 + 1,
        );
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObject(hitProxy, false).length > 0;
        setFocus(hit || getView() === "laptop");
    };
    const onKeyDownCapture = (event: KeyboardEvent) => {
        if (!focused || terminal === null) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        terminal.handleKey(event.key);
        if (event.key === "Escape" && getView() !== "laptop") setFocus(false);
        terminal.update(getElapsed());
        event.stopPropagation();
        event.preventDefault();
    };

    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKeyDownCapture, true);

    return {
        hitProxy,
        setFocus,
        dispose() {
            container.removeEventListener("pointerdown", onDown);
            container.removeEventListener("pointerup", onUp);
            window.removeEventListener("keydown", onKeyDownCapture, true);
            hitProxy.geometry.dispose();
            (hitProxy.material as THREE.Material).dispose();
        },
    };
}
