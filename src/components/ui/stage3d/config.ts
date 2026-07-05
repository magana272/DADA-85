import type { PropSpec } from "./types";

export const CASE_DEPTH = 30;
export const LCD_GREEN = 0x9fb18c;
export const CALC_SCALE = 0.38;

export const RUNNER_HALF_WIDTH = 340;
export const RUNNER_Z_START = 900;
export const RUNNER_Z_END = -5200;

export const LAPTOP_X = 240;
export const LAPTOP_Z = -780;
export const CAR_X = -1500;
export const CAR_Z = -200;

export const PROPS: PropSpec[] = [
    { url: "/models/classic_laptop/classic_laptop_2k.gltf", scale: 700, position: [LAPTOP_X, 6, LAPTOP_Z], rotationY: 0.6 },
    { url: "/car/nissan_fairlady_z_s30240z_1978/scene.gltf", normalize: 2800, position: [CAR_X, 0, CAR_Z], rotationY: 0.9 },
];

export const TERMINAL_LINES = [
    "BOOT DADA-85 BIOS v1.9.8.5",
    "MEM CHECK ........ OK",
    "LOAD RESUME.SYS .. OK",
    "USER: MANUEL MAGANA",
    "TEMP: 451°F",
    "SMOKE DETECTED: NO",
    "EVERYTHING IS FINE.",
];
export const TERMINAL_CPS = 16;

export const MEMORIAL_PHOTO_URL = "/dad.png";
export const MEMORIAL_YEARS = "1985-2026";
export const MEMORIAL_LINES = [
    "TO THE BEST MAN I'VE EVER KNOWN.",
    "I MISS YOU EVERYDAY.",
    "I LOVE YOU AND CAN'T WAIT TO SEE YOU AGAIN.",
];
export const MEMORIAL_CPS = 9;

export const ROOM_SIZE = 7000;
export const ROOM_HEIGHT = 3400;
export const FLOOR_DROP = 120;

export const CAMERA_FOV = 35;
export const CAMERA_START: [number, number, number] = [0, 90, 1150];
export const CALC_VIEW_HEIGHT_FACTOR = 2.7;
export const CALC_VIEW_MIN_DISTANCE = 420;
export const LAPTOP_VIEW_TARGET_Y = 275;
export const LAPTOP_VIEW_OFFSET: [number, number, number] = [700, 550, 855];
export const LOGIN_VIEW_TARGET_Y = 150;
export const LOGIN_VIEW_OFFSET: [number, number, number] = [300, 300, 460];
