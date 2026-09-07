// Tuning for the murmuration. Everything visual or behavioural lives here so
// the simulation files stay about mechanics.

export const CFG = {
    // Neighbourhood radii (px). Separation is tightest, cohesion widest.
    rSep: 13,
    rAli: 26,
    rCoh: 36,

    // Rule weights.
    wSep: 1.75,
    wAli: 1.05,
    wCoh: 0.92,

    maxForce: 0.055,
    baseSpeed: 2.6,

    // Spatial hash cell size. Must be >= rCoh or the 3x3 lookup misses birds.
    cell: 36,

    // The predator. Quadratic falloff is what carves vacuoles in the flock.
    hawkR: 165,
    hawkForce: 1.15,

    // Weak pull toward a drifting roost + soft walls, instead of wrapping.
    roost: 0.00055,
    edge: 110,

    // Alpha of the sky repaint each frame. Lower = longer trails.
    trail: 0.30,

    // One bird per this many square pixels, clamped.
    density: 520,
    minN: 700,
    maxN: 4200
};

// Dusk over the Sonian Forest: dark birds read against a luminous sky, which
// is the opposite of the old black canvas and the reason the flock is visible.
export const SKY = [
    [0.00, "#7f95b3"],
    [0.42, "#a9a8b3"],
    [0.68, "#c9b6ae"],
    [0.86, "#f0cf9b"],
    [1.00, "#f9e6c4"]
];

// Silhouette ramp. Birds are bucketed by depth and how broadside they are to
// the viewer; far / edge-on birds fade into the sky, near / broadside birds go
// to ink. This is what makes a real murmuration shimmer.
export const BANDS = 7;

export const BAND = (() => {
    const far = [150, 162, 178];
    const near = [19, 26, 38];
    const stroke = [];
    const width = [];
    const tail = [];

    for (let b = 0; b < BANDS; b++) {
        const t = b / (BANDS - 1);
        const r = Math.round(far[0] + (near[0] - far[0]) * t);
        const g = Math.round(far[1] + (near[1] - far[1]) * t);
        const bl = Math.round(far[2] + (near[2] - far[2]) * t);
        stroke.push(`rgba(${r},${g},${bl},${(0.30 + 0.62 * t).toFixed(3)})`);
        width.push(0.85 + 1.7 * t);
        tail.push(2.1 + 3.4 * t);
    }

    return { stroke, width, tail };
})();
