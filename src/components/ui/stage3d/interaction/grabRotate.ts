import { targetsFace, type ClickSuppressor } from "./gestureGate";

export interface GrabRotate {
    dispose(): void;
}

export function attachGrabRotate(
    container: HTMLElement,
    setRotation: (x: number, y: number) => void,
    suppressor: ClickSuppressor,
): GrabRotate {
    let grabbing = false;
    let grabMoved = false;
    let lastX = 0;
    let lastY = 0;
    let rotY = 0;
    let rotX = 0;

    const onDown = (event: PointerEvent) => {
        if (!targetsFace(event)) return;
        grabbing = true;
        grabMoved = false;
        lastX = event.clientX;
        lastY = event.clientY;
    };
    const onMove = (event: PointerEvent) => {
        if (!grabbing) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        if (!grabMoved && Math.hypot(dx, dy) < 5) return;
        grabMoved = true;
        lastX = event.clientX;
        lastY = event.clientY;
        rotY += dx * 0.006;
        rotX = Math.max(-1.1, Math.min(1.1, rotX + dy * 0.004));
        setRotation(rotX, rotY);
    };
    const onUp = () => {
        if (grabbing && grabMoved) suppressor.arm();
        grabbing = false;
    };

    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return {
        dispose() {
            container.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        },
    };
}
