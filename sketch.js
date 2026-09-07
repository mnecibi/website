import p5 from "p5/lib/p5.min";
import Flock from "./boid";
import Hawk from "./hawk";
import Sky from "./sky";

const PLATE_PADDING = 46;
const reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sketch = (p) => {
    let flock;
    let hawk;
    let sky;
    let ctx;
    let avoid = null;
    let frames = 0;
    let slowRun = 0;

    // The greeting is real DOM, not painted text. Birds are told to keep out
    // of its box, which is why the page needs no white card.
    const measurePlate = () => {
        const el = document.querySelector(".plate");
        if (!el) return;

        const r = el.getBoundingClientRect();
        avoid = {
            x: r.left - PLATE_PADDING,
            y: r.top - PLATE_PADDING,
            w: r.width + PLATE_PADDING * 2,
            h: r.height + PLATE_PADDING * 2
        };
    };

    const build = () => {
        flock = new Flock(p.width, p.height);
        hawk = new Hawk(p.width, p.height);
        sky = new Sky(ctx, p.width, p.height, flock.n);
        sky.clear();
        measurePlate();
    };

    p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
        canvas.elt.setAttribute("aria-hidden", "true");

        ctx = p.drawingContext;
        build();

        if (reduced) {
            // No animation: settle the flock, then show one still frame.
            for (let i = 0; i < 240; i++) flock.step(i * 16, hawk, avoid);
            sky.clear();
            sky.drawFlock(flock);
            p.noLoop();
        }
    };

    p.draw = () => {
        if (reduced) return;

        const t = p.millis();

        hawk.update(t, p.width, p.height);
        flock.step(t, hawk, avoid);

        sky.fade();
        sky.drawFlock(flock);
        hawk.draw(ctx);

        frames++;
        if (frames % 90 === 0) {
            if (p.frameRate() < 42) {
                slowRun++;
                if (slowRun >= 2) {
                    flock.shed(350);
                    slowRun = 0;
                }
            } else {
                slowRun = 0;
            }
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        ctx = p.drawingContext;
        build();
    };

    const point = (e) => {
        hawk.point(e.clientX, e.clientY);
        const hint = document.getElementById("hint");
        if (hint) hint.classList.add("gone");
    };

    window.addEventListener("pointermove", point, { passive: true });
    window.addEventListener("pointerdown", point, { passive: true });
    window.addEventListener("pointerleave", () => hawk.release(), { passive: true });
    window.addEventListener("resize", measurePlate, { passive: true });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(measurePlate);
    }
};

new p5(sketch);
