import * as THREE from "three";

export interface Embers {
    points: THREE.Points;
    update: (elapsed: number) => void;
    dispose: () => void;
}

export function makeEmbers(count: number, spreadX: number, spreadZ: number, rise: number): Embers | null {
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const spriteCtx = spriteCanvas.getContext("2d");
    if (spriteCtx === null) return null;
    const gradient = spriteCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    spriteCtx.fillStyle = gradient;
    spriteCtx.fillRect(0, 0, 32, 32);
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseX = new Float32Array(count);
    const baseZ = new Float32Array(count);
    const speed = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        baseX[i] = (Math.random() - 0.5) * spreadX;
        baseZ[i] = (Math.random() - 0.5) * spreadZ;
        speed[i] = 0.14 + Math.random() * 0.2;
        phase[i] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
        size: 26,
        map: sprite,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;

    const update = (elapsed: number) => {
        for (let i = 0; i < count; i++) {
            const life = (elapsed * speed[i] + phase[i]) % 1;
            const sway = Math.sin(elapsed * (1.3 + speed[i] * 4) + i) * (30 + life * 90);
            positions[i * 3] = baseX[i] + sway;
            positions[i * 3 + 1] = life * rise;
            positions[i * 3 + 2] = baseZ[i] + Math.cos(elapsed * 1.1 + i * 2.1) * 30 * life;
            const fade = (1 - life) * (life < 0.08 ? life / 0.08 : 1);
            colors[i * 3] = fade;
            colors[i * 3 + 1] = fade * 0.55;
            colors[i * 3 + 2] = fade * 0.16;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    };
    update(0);

    return {
        points,
        update,
        dispose: () => {
            geometry.dispose();
            material.dispose();
            sprite.dispose();
        },
    };
}
