

export function targetsFace(event: Event): boolean {
    return event.target instanceof Element && event.target.closest(".stage3d-face") !== null;
}

export interface ClickSuppressor {
    arm(): void;
    dispose(): void;
}

export function createClickSuppressor(container: HTMLElement): ClickSuppressor {
    let armed = false;
    const onClickCapture = (event: MouseEvent) => {
        if (armed) {
            armed = false;
            event.stopPropagation();
            event.preventDefault();
        }
    };
    container.addEventListener("click", onClickCapture, true);
    return {
        arm() {
            armed = true;
        },
        dispose() {
            container.removeEventListener("click", onClickCapture, true);
        },
    };
}
