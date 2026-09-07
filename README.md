# My Personal website

A starling murmuration over Brussels. A few thousand boids follow Reynolds'
three rules — separation, alignment, cohesion — and your cursor is the hawk
they flee from. Inspired by 'flocking' from the Nature of Code.

## Layout

| file        | what it does                                                  |
|-------------|---------------------------------------------------------------|
| `sketch.js` | p5 entry point: canvas, draw loop, pointer, resize             |
| `boid.js`   | flock state and the three rules, over typed arrays             |
| `hawk.js`   | the predator — follows the pointer, hunts on its own without   |
| `sky.js`    | renderer: dusk gradient, banded silhouettes, trails            |
| `config.js` | all tuning: radii, weights, palette, density                   |

The flock is structure-of-arrays with a linked-list spatial hash rather than one
object per bird, which is what makes a few thousand birds affordable instead of
a hundred.

## First use

```shell
npm install
```

## Usage

Build `index.js` (esbuild) and `output.css` (Tailwind):

```shell
npm run build
```

Rebuild on change:

```shell
npm run dev
```

Serve:

```shell
npm run start
```

`index.js` and `output.css` are build outputs but are committed, because the
Dockerfile copies them straight into nginx and CI does not run a build step.
Run `npm run build` before pushing.
