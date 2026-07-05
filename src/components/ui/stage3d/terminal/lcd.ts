export const LCD_PALETTE: Array<[number, number, number]> = [
    [8, 20, 12],
    [26, 58, 34],
    [52, 102, 60],
    [88, 152, 94],
    [140, 204, 146],
    [200, 248, 206],
];

export const BAYER4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
];

export function toGreenLcd(image: HTMLImageElement, targetWidth: number): HTMLCanvasElement | null {
    const width = targetWidth;
    const height = Math.max(1, Math.round((image.height / image.width) * targetWidth));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return null;
    ctx.drawImage(image, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height);
    const pixels = data.data;

    const luminances = new Float32Array(pixels.length / 4);
    let min = 255;
    let max = 0;
    for (let i = 0; i < luminances.length; i++) {
        const l = 0.299 * pixels[i * 4] + 0.587 * pixels[i * 4 + 1] + 0.114 * pixels[i * 4 + 2];
        luminances[i] = l;
        if (l < min) min = l;
        if (l > max) max = l;
    }
    const range = Math.max(1, max - min);
    const levels = LCD_PALETTE.length;
    for (let i = 0; i < luminances.length; i++) {
        const x = i % width;
        const y = Math.floor(i / width);
        const normalized = (luminances[i] - min) / range;
        const dither = ((BAYER4[y % 4][x % 4] + 0.5) / 16 - 0.5) * 1.1;
        const level = Math.min(levels - 1, Math.max(0, Math.round(normalized * (levels - 1) + dither)));
        const [r, g, b] = LCD_PALETTE[level];
        pixels[i * 4] = r;
        pixels[i * 4 + 1] = g;
        pixels[i * 4 + 2] = b;
    }
    ctx.putImageData(data, 0, 0);
    return canvas;
}
