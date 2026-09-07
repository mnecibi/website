import { CFG, SKY, BANDS, BAND } from "./config.js";

// Renderer. Draws the dusk gradient and the flock as banded silhouettes.
//
// Birds are batched into BANDS stroke buckets and each bucket is one path and
// one stroke() call, so a few thousand birds cost seven draw calls per frame
// instead of a few thousand.
export default class Sky {
    constructor(ctx, width, height, n) {
        this.ctx = ctx;
        this.resize(width, height, n);
    }

    resize(width, height, n) {
        this.w = width;
        this.h = height;

        this.gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        for (const [stop, color] of SKY) {
            this.gradient.addColorStop(stop, color);
        }

        this.buckets = [];
        this.counts = new Int32Array(BANDS);
        for (let b = 0; b < BANDS; b++) {
            this.buckets.push(new Int32Array(n));
        }
    }

    clear() {
        const { ctx } = this;
        ctx.fillStyle = this.gradient;
        ctx.fillRect(0, 0, this.w, this.h);
    }

    // Repaint the sky at low alpha instead of clearing: the residue is the
    // birds' trails.
    fade() {
        const { ctx } = this;
        ctx.globalAlpha = CFG.trail;
        ctx.fillStyle = this.gradient;
        ctx.fillRect(0, 0, this.w, this.h);
        ctx.globalAlpha = 1;
    }

    drawFlock(flock) {
        const { ctx, buckets, counts } = this;
        const { x, y, vx, vy, z, n } = flock;

        counts.fill(0);

        for (let i = 0; i < n; i++) {
            const sp = Math.hypot(vx[i], vy[i]) || 1;

            // A bird turning broadside shows its wingspan and reads heavy; one
            // flying edge-on nearly disappears. Depth does the rest.
            const broadside = Math.abs(vx[i] / sp);
            const score = z[i] * 0.62 + broadside * 0.38;

            let band = (score * BANDS) | 0;
            if (band > BANDS - 1) band = BANDS - 1;
            else if (band < 0) band = 0;

            buckets[band][counts[band]++] = i;
        }

        ctx.lineCap = "round";

        for (let b = 0; b < BANDS; b++) {
            const count = counts[b];
            if (!count) continue;

            const bucket = buckets[b];
            const tail = BAND.tail[b];

            ctx.strokeStyle = BAND.stroke[b];
            ctx.lineWidth = BAND.width[b];
            ctx.beginPath();

            for (let k = 0; k < count; k++) {
                const i = bucket[k];
                const sp = Math.hypot(vx[i], vy[i]) || 1;
                const ux = vx[i] / sp;
                const uy = vy[i] / sp;
                ctx.moveTo(x[i] - ux * tail, y[i] - uy * tail);
                ctx.lineTo(x[i], y[i]);
            }

            ctx.stroke();
        }
    }
}
