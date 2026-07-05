import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { SceneEffect, StageContext, Stage3DProps, TerminalMode, ViewName } from "./types";
import {
    CAMERA_FOV,
    CAMERA_START,
    CALC_SCALE,
    FLOOR_DROP,
    LAPTOP_X,
    LAPTOP_Z,
    LOGIN_VIEW_TARGET_Y,
    LOGIN_VIEW_OFFSET,
} from "./config";
import { freeze } from "./utils/freeze";
import { makeTerminalScreen } from "./terminal/terminal";
import { makeBurningCar } from "./effects/burningCar";
import { createCalculatorCard } from "./scene/calculatorCard";
import { createRugRoom, createRunner, createStageLights } from "./scene/room";
import { loadProps } from "./scene/props";
import { createClickSuppressor, targetsFace } from "./interaction/gestureGate";
import { attachGrabRotate } from "./interaction/grabRotate";
import { attachLaptopFocus } from "./interaction/laptopFocus";
import { createCameraFlight, type CameraFlight } from "./interaction/cameraFlight";
import "./Stage3D.css";


function makeFace(extraClass: string): HTMLDivElement {
    const el = document.createElement("div");
    el.className = `stage3d-face ${extraClass}`;
    return el;
}

function Stage3D({ children, back, view = "calculator" }: Stage3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [frontTarget] = useState(() => makeFace("stage3d-front"));
    const [backTarget] = useState(() => makeFace("stage3d-back"));
    const [webglFailed, setWebglFailed] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [loadDone, setLoadDone] = useState(false);
    const viewApi = useRef<((next: ViewName) => void) | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (container === null || webglFailed) return;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                stencil: false,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: true,
            });
        } catch {
            setWebglFailed(true);
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.debug.checkShaderErrors = import.meta.env.DEV;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMap.autoUpdate = false;
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.className = "stage3d-canvas";
        container.appendChild(renderer.domElement);

        const cssRenderer = new CSS3DRenderer();
        cssRenderer.domElement.className = "stage3d-css";
        cssRenderer.domElement.style.pointerEvents = "none";
        container.appendChild(cssRenderer.domElement);

        const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 50, 10000);
        camera.position.set(...CAMERA_START);

        const glScene = new THREE.Scene();
        glScene.fog = new THREE.Fog(0x0b0c0e, 1600, 5200);
        const cssScene = new THREE.Scene();


        let ready = false;
        let disposed = false;
        const ctx: StageContext = {
            invalidate() {
                if (!ready) return;
                renderer.render(glScene, camera);
                cssRenderer.render(cssScene, camera);
            },
            requestShadowUpdate() {
                renderer.shadowMap.needsUpdate = true;
            },
            recompileAndRender() {
                renderer.compileAsync(glScene, camera).catch(() => undefined).then(() => {
                    if (!disposed) ctx.invalidate();
                });
            },
            isDisposed: () => disposed,
        };

        let assetsDone = false;
        let compiled = false;
        const maybeReveal = () => {
            if (assetsDone && compiled && !disposed) setLoadDone(true);
        };
        const manager = THREE.DefaultLoadingManager;
        manager.onProgress = (_url, loaded, total) => {
            if (!disposed && total > 0) setLoadProgress(loaded / total);
        };
        manager.onLoad = () => {
            assetsDone = true;
            maybeReveal();
        };
        manager.onError = () => {
            assetsDone = true;
            maybeReveal();
        };

        const card = createCalculatorCard(frontTarget, backTarget, ctx);
        cssScene.add(card.cssGroup);
        glScene.add(card.glGroup);

        const lights = createStageLights();
        glScene.add(...lights.objects);

        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        const room = createRugRoom(maxAnisotropy, ctx);
        glScene.add(room.mesh);

        const propsGroup = new THREE.Group();
        glScene.add(propsGroup);
        freeze(propsGroup);

        const runner = createRunner(maxAnisotropy, ctx);
        propsGroup.add(runner.mesh);

        const burningCar = makeBurningCar();
        propsGroup.add(burningCar.object);
        const effects: SceneEffect[] = [burningCar];

        let flight: CameraFlight | null = null;
        let lastTerminalMode: TerminalMode = "boot";
        const terminal = makeTerminalScreen((mode) => {
            if (mode === "granted") {
                const y = propsGroup.position.y;
                flight?.flyTo(
                    new THREE.Vector3(
                        LAPTOP_X + LOGIN_VIEW_OFFSET[0],
                        y + LOGIN_VIEW_OFFSET[1],
                        LAPTOP_Z + LOGIN_VIEW_OFFSET[2],
                    ),
                    new THREE.Vector3(LAPTOP_X, y + LOGIN_VIEW_TARGET_Y + 60, LAPTOP_Z),
                );
            } else if (mode === "password" && lastTerminalMode === "memorial" && flight !== null) {
                flight.setView(flight.currentView());
            }
            lastTerminalMode = mode;
        });
        const props = loadProps(propsGroup, terminal, ctx);

        let envTarget: THREE.WebGLRenderTarget | null = null;
        const envTimer = window.setTimeout(() => {
            const pmrem = new THREE.PMREMGenerator(renderer);
            envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
            pmrem.dispose();
            glScene.environment = envTarget.texture;
            glScene.environmentIntensity = 0.35;
            ctx.recompileAndRender();
        }, 400);

        const gate = (event: Event) => {
            controls.enabled = !targetsFace(event);
        };
        container.addEventListener("pointerdown", gate);
        container.addEventListener("wheel", gate);
        const controls = new OrbitControls(camera, container);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.enablePan = false;
        controls.minDistance = 240;
        controls.maxDistance = 2600;
        controls.minPolarAngle = Math.PI * 0.12;
        controls.maxPolarAngle = Math.PI * 0.88;

        const suppressor = createClickSuppressor(container);
        const grab = attachGrabRotate(container, card.setRotation, suppressor);

        let elapsed = 0;
        let calcHeight = 440;
        const focus = attachLaptopFocus(
            container,
            camera,
            terminal,
            () => flight?.currentView() ?? "calculator",
            () => elapsed,
            ctx,
        );
        propsGroup.add(focus.hitProxy);

        flight = createCameraFlight(
            camera,
            controls.target,
            () => propsGroup.position.y,
            () => calcHeight,
            (next) => focus.setFocus(next === "laptop"),
        );
        viewApi.current = flight.setView;
        const cancelFlight = () => flight?.cancel();
        controls.addEventListener("start", cancelFlight);

        const measure = new ResizeObserver(() => {
            const width = frontTarget.offsetWidth;
            const height = frontTarget.offsetHeight;
            if (width === 0 || height === 0) return;
            backTarget.style.width = `${width}px`;
            backTarget.style.height = `${height}px`;
            card.rebuild(width, height);
            calcHeight = height;
            const floorY = -(height * CALC_SCALE) / 2 - FLOOR_DROP;
            room.setFloorY(floorY);
            propsGroup.position.y = floorY;
            freeze(propsGroup);
            ctx.requestShadowUpdate();
            if (flight?.currentView() === "calculator") flight.setView("calculator");
            ctx.invalidate();
        });
        measure.observe(frontTarget);

        const clock = new THREE.Clock();
        let lastTerminalPaint = -1;
        function tick() {
            const dt = Math.min(clock.getDelta(), 0.05);
            elapsed += dt;
            flight?.step(dt);
            for (const effect of effects) effect.update?.(elapsed, dt);
            if (terminal !== null && elapsed - lastTerminalPaint > 1 / 15) {
                lastTerminalPaint = elapsed;
                terminal.update(elapsed);
            }
            controls.update();
            ctx.invalidate();
        }

        const resize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            cssRenderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            ctx.invalidate();
        };
        resize();
        window.addEventListener("resize", resize);

        const onContextLost = (event: Event) => {
            event.preventDefault();
            renderer.setAnimationLoop(null);
        };
        const onContextRestored = () => {
            ctx.requestShadowUpdate();
            renderer.setAnimationLoop(tick);
        };
        renderer.domElement.addEventListener("webglcontextlost", onContextLost);
        renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

        renderer.compileAsync(glScene, camera).catch(() => undefined).then(() => {
            if (disposed) return;
            ready = true;
            compiled = true;
            maybeReveal();
            ctx.requestShadowUpdate();
            renderer.setAnimationLoop(tick);
            if (import.meta.env.DEV) {
                ctx.invalidate();
                console.info(
                    `[Stage3D] draw calls: ${renderer.info.render.calls}, triangles: ${renderer.info.render.triangles}`,
                );
            }
        });

        return () => {
            disposed = true;
            manager.onProgress = undefined as unknown as typeof manager.onProgress;
            manager.onLoad = undefined as unknown as typeof manager.onLoad;
            manager.onError = undefined as unknown as typeof manager.onError;
            window.clearTimeout(envTimer);
            renderer.setAnimationLoop(null);
            renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
            renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
            window.removeEventListener("resize", resize);
            measure.disconnect();
            container.removeEventListener("pointerdown", gate);
            container.removeEventListener("wheel", gate);
            grab.dispose();
            focus.dispose();
            suppressor.dispose();
            viewApi.current = null;
            controls.removeEventListener("start", cancelFlight);
            controls.dispose();
            for (const effect of effects) effect.dispose();
            props.dispose();
            terminal?.texture.dispose();
            card.dispose();
            runner.dispose();
            room.dispose();
            lights.dispose();
            envTarget?.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);
            container.removeChild(cssRenderer.domElement);
        };
    }, [webglFailed, frontTarget, backTarget]);

    useEffect(() => {
        viewApi.current?.(view);
    }, [view]);

    if (webglFailed) {
        return (
            <div className="stage3d stage3d-fallback">
                <div>{children}</div>
            </div>
        );
    }

    const barCells = Math.round(loadProgress * 20);
    return (
        <div ref={containerRef} className="stage3d">
            {createPortal(<div className="stage3d-scale">{children}</div>, frontTarget)}
            {back !== undefined &&
                createPortal(<div className="stage3d-scale stage3d-scale-fill">{back}</div>, backTarget)}
            <div className={`stage3d-loading${loadDone ? " stage3d-loading-done" : ""}`} aria-hidden={loadDone}>
                <div>
                    DADA-85 BOOTING
                    <br />
                    {"█".repeat(barCells)}
                    {"░".repeat(20 - barCells)} {Math.round(loadProgress * 100)}%
                    <span className="stage3d-loading-cursor">█</span>
                </div>
            </div>
        </div>
    );
}
export default Stage3D;
