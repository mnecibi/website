import { CFG } from "./config.js";

// Boid rules and flock state.
//
// This used to be a `Boid` class holding p5.Vectors, one object per bird. That
// tops out around a hundred birds before the allocator and the O(n^2) neighbour
// search dominate the frame. A murmuration needs thousands, so the flock is now
// structure-of-arrays over Float32Arrays with a linked-list spatial hash, and
// the three rules share a single neighbour pass instead of walking the whole
// flock three times.
//
// The rules themselves are unchanged Reynolds: separation, alignment, cohesion.

export default class Flock {
    constructor(width, height) {
        this.resize(width, height);
    }

    resize(width, height) {
        this.w = width;
        this.h = height;

        this.n = Math.max(
            CFG.minN,
            Math.min(CFG.maxN, Math.round((width * height) / CFG.density))
        );

        const n = this.n;
        this.x = new Float32Array(n);
        this.y = new Float32Array(n);
        this.vx = new Float32Array(n);
        this.vy = new Float32Array(n);
        this.z = new Float32Array(n);
        this.speed = new Float32Array(n);

        for (let i = 0; i < n; i++) {
            this.x[i] = rand(-width * 0.30, width * 0.78);
            this.y[i] = rand(height * 0.04, height * 0.92);

            const a = rand(-0.45, 0.45);
            const s = rand(2.2, 3.4);
            this.vx[i] = Math.cos(a) * s;
            this.vy[i] = Math.sin(a) * s;

            this.z[i] = Math.random();
            this.speed[i] = CFG.baseSpeed * (0.82 + 0.36 * this.z[i]) * rand(0.92, 1.08);
        }

        this.cols = Math.ceil(width / CFG.cell) + 1;
        this.rows = Math.ceil(height / CFG.cell) + 1;
        this.heads = new Int32Array(this.cols * this.rows);
        this.next = new Int32Array(n);
    }

    // Shed birds when the frame budget is blown (weak GPU, 5K display).
    shed(count) {
        this.n = Math.max(CFG.minN, this.n - count);
    }

    buildGrid() {
        const { heads, next, x, y, cols, rows, n } = this;
        const c = CFG.cell;

        heads.fill(-1);

        for (let i = 0; i < n; i++) {
            let cx = (x[i] / c) | 0;
            let cy = (y[i] / c) | 0;
            if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
            if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;

            const cell = cy * cols + cx;
            next[i] = heads[cell];
            heads[cell] = i;
        }
    }

    // `avoid` is a rect the birds refuse to fly over, so the type stays legible.
    step(t, hawk, avoid) {
        this.buildGrid();

        const { x, y, vx, vy, speed, heads, next, cols, rows, n, w, h } = this;
        const c = CFG.cell;

        const rSep2 = CFG.rSep * CFG.rSep;
        const rAli2 = CFG.rAli * CFG.rAli;
        const rCoh2 = CFG.rCoh * CFG.rCoh;
        const hawkR2 = CFG.hawkR * CFG.hawkR;

        // The roost drifts, so the flock never settles into a static blob.
        const anchorX = w * (0.52 + 0.15 * Math.sin(t * 0.00021));
        const anchorY = h * (0.42 + 0.11 * Math.sin(t * 0.00017 + 1.3));

        for (let i = 0; i < n; i++) {
            const px = x[i];
            const py = y[i];

            let sepX = 0, sepY = 0;
            let aliX = 0, aliY = 0;
            let cohX = 0, cohY = 0;
            let nAli = 0, nCoh = 0;

            let gx = (px / c) | 0;
            let gy = (py / c) | 0;
            if (gx < 0) gx = 0; else if (gx >= cols) gx = cols - 1;
            if (gy < 0) gy = 0; else if (gy >= rows) gy = rows - 1;

            // One pass over the 3x3 cell neighbourhood feeds all three rules.
            for (let oy = gy - 1; oy <= gy + 1; oy++) {
                if (oy < 0 || oy >= rows) continue;
                const row = oy * cols;

                for (let ox = gx - 1; ox <= gx + 1; ox++) {
                    if (ox < 0 || ox >= cols) continue;

                    for (let j = heads[row + ox]; j !== -1; j = next[j]) {
                        if (j === i) continue;

                        const dx = px - x[j];
                        const dy = py - y[j];
                        const d2 = dx * dx + dy * dy;
                        if (d2 > rCoh2 || d2 === 0) continue;

                        if (d2 < rSep2) {
                            const inv = 1 / d2;   // closer neighbours push harder
                            sepX += dx * inv;
                            sepY += dy * inv;
                        }
                        if (d2 < rAli2) {
                            aliX += vx[j];
                            aliY += vy[j];
                            nAli++;
                        }
                        cohX += x[j];
                        cohY += y[j];
                        nCoh++;
                    }
                }
            }

            const ms = speed[i];
            let fx = 0;
            let fy = 0;
            let m;

            if (sepX || sepY) {
                m = Math.hypot(sepX, sepY);
                fx += ((sepX / m) * ms - vx[i]) * CFG.wSep;
                fy += ((sepY / m) * ms - vy[i]) * CFG.wSep;
            }

            if (nAli) {
                aliX /= nAli;
                aliY /= nAli;
                m = Math.hypot(aliX, aliY) || 1;
                fx += ((aliX / m) * ms - vx[i]) * CFG.wAli;
                fy += ((aliY / m) * ms - vy[i]) * CFG.wAli;
            }

            if (nCoh) {
                const dxc = cohX / nCoh - px;
                const dyc = cohY / nCoh - py;
                m = Math.hypot(dxc, dyc) || 1;
                fx += ((dxc / m) * ms - vx[i]) * CFG.wCoh;
                fy += ((dyc / m) * ms - vy[i]) * CFG.wCoh;
            }

            // Clamp flocking only. The forces below must be able to overrule it.
            m = Math.hypot(fx, fy);
            if (m > CFG.maxForce) {
                fx = (fx / m) * CFG.maxForce;
                fy = (fy / m) * CFG.maxForce;
            }

            // Predator: quadratic falloff produces the vacuole and the waves
            // that roll outward through the flock.
            const hdx = px - hawk.x;
            const hdy = py - hawk.y;
            const hd2 = hdx * hdx + hdy * hdy;
            if (hd2 < hawkR2 && hd2 > 0.01) {
                const hd = Math.sqrt(hd2);
                let k = 1 - hd / CFG.hawkR;
                k = k * k * CFG.hawkForce;
                fx += (hdx / hd) * k;
                fy += (hdy / hd) * k;
            }

            // Keep the greeting readable.
            if (avoid && px > avoid.x && px < avoid.x + avoid.w &&
                py > avoid.y && py < avoid.y + avoid.h) {
                const toRight = avoid.x + avoid.w - px;
                const toTop = py - avoid.y;
                if (toRight < toTop) fx += 0.45; else fy -= 0.45;
            }

            fx += (anchorX - px) * CFG.roost;
            fy += (anchorY - py) * CFG.roost;

            if (px < CFG.edge) fx += (CFG.edge - px) * 0.0016;
            else if (px > w - CFG.edge) fx -= (px - (w - CFG.edge)) * 0.0016;
            if (py < CFG.edge) fy += (CFG.edge - py) * 0.0016;
            else if (py > h - CFG.edge) fy -= (py - (h - CFG.edge)) * 0.0016;

            let nvx = vx[i] + fx;
            let nvy = vy[i] + fy;

            // Birds have a cruising speed, not just a ceiling: a floor keeps
            // them from stalling into a hover after a hard turn.
            const sp = Math.hypot(nvx, nvy);
            const ceiling = ms * 1.45;
            const floor = ms * 0.55;
            if (sp > ceiling) {
                nvx = (nvx / sp) * ceiling;
                nvy = (nvy / sp) * ceiling;
            } else if (sp < floor && sp > 0.001) {
                nvx = (nvx / sp) * floor;
                nvy = (nvy / sp) * floor;
            }

            vx[i] = nvx;
            vy[i] = nvy;
            x[i] = px + nvx;
            y[i] = py + nvy;
        }
    }
}

function rand(a, b) {
    return a + Math.random() * (b - a);
}
