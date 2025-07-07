// credits to https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/

export function randomColor() {
    return hsv_to_hex(Math.random(), 0.5, 0.95)
}

function hsv_to_hex(h: number, s: number, v: number) {
    const h_i = Math.floor(h * 6)
    const f = h * 6 - h_i;
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)
    let r, g, b;
    switch (h_i) {
        case 0:
            r = v; g = t; b = p;
            break;
        case 1:
            r = q; g = v; b = p;
            break;
        case 2:
            r = p; g = v; b = t;
            break;
        case 3:
            r = p; g = q; b = v;
            break;
        case 4:
            r = t; g = p; b = v;
            break;
        default: // 5
            r = v; g = p; b = q;
            break;
    }
    function hex(c: number) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    return "#" + hex(Math.floor(r * 256)) + hex(Math.floor(g * 256)) + hex(Math.floor(b * 256));
}