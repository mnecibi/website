import { CFG } from "./config.js";

// The predator. Follows the pointer when there is one, hunts on its own when
// there is not, so the flock is already reacting the moment the page opens.
export default class Hawk {
    constructor(w, h) {
        this.x = w * 0.62;
        this.y = h * 0.4;
        this.vx = 0;
        this.vy = 0;
        this.live = false;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    point(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.live = true;
    }

    release() {
        this.live = false;
    }

    update(t, w, h) {
        let tx;
        let ty;

        if (this.live) {
            tx = this.targetX;
            ty = this.targetY;
        } else {
            tx = w * (0.5 + 0.34 * Math.sin(t * 0.00031));
            ty = h * (0.44 + 0.26 * Math.sin(t * 0.00047 + 1.1));
        }

        const ease = this.live ? 0.16 : 0.035;
        const nx = this.x + (tx - this.x) * ease;
        const ny = this.y + (ty - this.y) * ease;

        this.vx = nx - this.x;
        this.vy = ny - this.y;
        this.x = nx;
        this.y = ny;
    }

    draw(ctx) {
        const speed = Math.hypot(this.vx, this.vy);
        const heading = speed > 0.05 ? Math.atan2(this.vy, this.vx) : -0.4;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(heading);
        ctx.fillStyle = "rgba(12,17,26,.96)";
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-6.5, 11);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-6.5, -11);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    get radius() {
        return CFG.hawkR;
    }
}
