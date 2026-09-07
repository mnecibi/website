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

## Deploy

Pushing to `main` builds `mnecibi/website` and pushes it to Docker Hub
(`.github/workflows/docker-image.yml`).

The image is built in two stages: node builds `index.js` and `output.css`, then
nginx serves them alongside the static files. Build outputs are not committed --
pushing source is enough.

`nginx.conf` gzips the bundle (1.0 MB -> 264 KB) and sets cache headers.
