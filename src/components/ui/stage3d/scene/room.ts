import * as THREE from "three";
import type { StageContext } from "../types";
import { LCD_GREEN, ROOM_SIZE, ROOM_HEIGHT, RUNNER_HALF_WIDTH, RUNNER_Z_START, RUNNER_Z_END } from "../config";
import { freeze } from "../utils/freeze";

function loadCarpetTexture(
    url: string,
    material: THREE.MeshStandardMaterial,
    repeat: [number, number],
    bumpScale: number,
    anisotropy: number,
    ctx: StageContext,
): void {
    new THREE.TextureLoader().load(url, (tex) => {
        if (ctx.isDisposed()) {
            tex.dispose();
            return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(...repeat);
        tex.anisotropy = anisotropy;
        material.map = tex;
        material.bumpMap = tex;
        material.bumpScale = bumpScale;
        material.color.set(0xffffff);
        material.needsUpdate = true;
        ctx.invalidate();
    });
}

export interface RugRoom {
    mesh: THREE.Mesh;
    setFloorY(floorY: number): void;
    dispose(): void;
}

export function createRugRoom(anisotropy: number, ctx: StageContext): RugRoom {
    const material = new THREE.MeshStandardMaterial({ color: 0x8a8578, roughness: 1, side: THREE.BackSide });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE), material);
    mesh.receiveShadow = true;
    loadCarpetTexture("/rug/carpet_baseColor.jpeg", material, [4, 2], 0.6, anisotropy, ctx);
    return {
        mesh,
        setFloorY(floorY) {
            mesh.position.y = floorY + ROOM_HEIGHT / 2;
            freeze(mesh);
        },
        dispose() {
            mesh.geometry.dispose();
            material.map?.dispose();
            material.dispose();
        },
    };
}

export interface Runner {
    mesh: THREE.Mesh;
    dispose(): void;
}

export function createRunner(anisotropy: number, ctx: StageContext): Runner {
    const material = new THREE.MeshStandardMaterial({ color: 0x9c8f7a, roughness: 1 });
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(RUNNER_HALF_WIDTH * 2, RUNNER_Z_START - RUNNER_Z_END),
        material,
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 4, (RUNNER_Z_START + RUNNER_Z_END) / 2);
    mesh.receiveShadow = true;
    freeze(mesh);
    loadCarpetTexture(
        "/rug/persian_malayer_carpet/textures/carpet_baseColor.jpeg",
        material,
        [1, 6],
        0.4,
        anisotropy,
        ctx,
    );
    return {
        mesh,
        dispose() {
            mesh.geometry.dispose();
            material.map?.dispose();
            material.dispose();
        },
    };
}

export interface StageLights {
    objects: THREE.Object3D[];
    dispose(): void;
}

export function createStageLights(): StageLights {
    const spot = new THREE.SpotLight(0xfff2d0, 2.4);
    spot.decay = 0;
    spot.angle = Math.PI / 5.5;
    spot.penumbra = 0.4;
    spot.position.set(-350, 1500, 750);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.camera.near = 200;
    spot.shadow.camera.far = 4500;
    freeze(spot);
    freeze(spot.target);
    const ambient = new THREE.AmbientLight(LCD_GREEN, 0.3);
    return {
        objects: [spot, spot.target, ambient],
        dispose() {
            spot.shadow.dispose();
        },
    };
}
