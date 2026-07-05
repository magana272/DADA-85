import type * as THREE from "three";
import type { ReactNode } from "react";

export interface SceneEffect {
    object: THREE.Object3D;
    update?(elapsed: number, dt: number): void;
    dispose(): void;
}

export interface StageContext {
    invalidate(): void;
    requestShadowUpdate(): void;
    recompileAndRender(): void;
    isDisposed(): boolean;
}

export type ViewName = "calculator" | "laptop";

export interface Stage3DProps {
    children: ReactNode;
    back?: ReactNode;
    view?: ViewName;
}

export interface PropSpec {
    url: string;
    scale?: number;
    normalize?: number;
    position: [number, number, number];
    rotationY: number;
}

export type TerminalMode = "boot" | "password" | "granted" | "memorial";

export interface TerminalScreen {
    texture: THREE.CanvasTexture;
    update: (elapsed: number) => void;
    handleKey: (key: string) => void;
    setFocused: (focused: boolean) => void;
}
