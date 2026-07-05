import * as THREE from "three";
import type { TerminalMode, TerminalScreen } from "../types";
import {
    TERMINAL_LINES,
    TERMINAL_CPS,
    MEMORIAL_PHOTO_URL,
    MEMORIAL_YEARS,
    MEMORIAL_LINES,
    MEMORIAL_CPS,
} from "../config";
import { toGreenLcd } from "./lcd";

export function makeTerminalScreen(onModeChange?: (mode: TerminalMode) => void): TerminalScreen | null {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return null;
    ctx.scale(2, 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.anisotropy = 8;

    let mode: TerminalMode = "boot";
    let modeAt = 0;
    let lastElapsed = 0;
    let focused = false;
    let password = "";
    let photo: HTMLCanvasElement | null = null;

    new THREE.ImageLoader().load(MEMORIAL_PHOTO_URL, (image) => {
        photo = toGreenLcd(image, 350);
    });

    const bootChars = TERMINAL_LINES.reduce((n, line) => n + line.length, 0);

    const enterMode = (next: TerminalMode) => {
        mode = next;
        modeAt = lastElapsed;
        onModeChange?.(next);
    };

    const text = (value: string, x: number, y: number, glow = true) => {
        ctx.shadowBlur = glow ? 5 : 0;
        ctx.fillText(value, x, y);
        ctx.shadowBlur = 0;
    };

    const update = (elapsed: number) => {
        lastElapsed = elapsed;
        const blink = Math.floor(elapsed * 2) % 2 === 0;
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#041409";
        ctx.fillRect(0, 0, 320, 240);
        ctx.font = "16px 'VT323', monospace";
        ctx.fillStyle = "#8dffab";
        ctx.shadowColor = "#4dff7c";

        if (mode === "boot") {
            let budget = Math.floor((elapsed - modeAt) * TERMINAL_CPS);
            let y = 26;
            for (const line of TERMINAL_LINES) {
                if (budget <= 0) break;
                text(`> ${line.slice(0, budget)}`, 12, y);
                budget -= line.length;
                y += 20;
            }
            if (blink && y <= 240) ctx.fillRect(12, y - 12, 10, 14);
            if ((elapsed - modeAt) * TERMINAL_CPS > bootChars + TERMINAL_CPS) {
                enterMode("password");
            }
        } else if (mode === "password") {
            text("DADA-85 SECURE TERMINAL", 12, 30);
            text("=======================", 12, 48);
            text("ENTER PASSWORD:", 12, 92);
            const mask = "*".repeat(password.length);
            text(`> ${mask}`, 12, 116);
            if (focused && blink) ctx.fillRect(30 + ctx.measureText(mask).width, 104, 10, 14);
            if (!focused) {
                text(blink ? "[ CLICK THE LAPTOP, THEN TYPE ]" : "[ CLICK THE LAPTOP ]", 12, 170);
            }
        } else if (mode === "granted") {
            text("ACCESS GRANTED", 12, 40);
            if (elapsed - modeAt > 1.2) enterMode("memorial");
        } else {
            ctx.font = "13px 'VT323', monospace";
            text(MEMORIAL_YEARS, (320 - ctx.measureText(MEMORIAL_YEARS).width) / 2, 16);
            if (photo !== null) {
                const scale = Math.min(300 / photo.width, 124 / photo.height);
                const w = Math.floor(photo.width * scale) - 20;
                const h = Math.floor(photo.height * scale) - 20;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(photo, Math.floor((320 - w) / 2), 22, w, h);
            }
            ctx.font = "11px 'VT323', monospace";
            let budget = Math.floor((elapsed - modeAt) * MEMORIAL_CPS);
            let y = 162;
            for (const line of MEMORIAL_LINES) {
                if (budget <= 0) break;
                text(line.slice(0, budget), 16, y);
                budget -= line.length;
                y += 16;
            }
            if (budget >= 0 && blink && y <= 240) {
                ctx.fillRect(16, y - 10, 8, 11);
            }
            ctx.font = "12px 'VT323', monospace";
            text("ESC TO LOGOUT", 236, 234, false);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        for (let row = 0; row < 240; row += 4) {
            ctx.fillRect(0, row, 320, 1);
        }
        if (focused) {
            ctx.strokeStyle = "#8dffab";
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, 316, 236);
        }
        texture.needsUpdate = true;
    };

    const handleKey = (key: string) => {
        if (mode === "boot") {
            enterMode("password");
            return;
        }
        if (mode === "password") {
            if (key === "Enter" && password.length > 0) {
                password = "";
                enterMode("granted");
            } else if (key === "Backspace") {
                password = password.slice(0, -1);
            } else if (key.length === 1 && password.length < 24) {
                password += key;
            }
            return;
        }
        if (mode === "memorial" && key === "Escape") {
            enterMode("password");
        }
    };

    const setFocused = (value: boolean) => {
        focused = value;
    };

    update(0);
    return { texture, update, handleKey, setFocused };
}
