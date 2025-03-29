import p5 from "p5/lib/p5.min";
import Boid from './boid';

const flock = []

let sketch = (p5) => {
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)

        for (let i = 0; i < 100; i++) {
            flock.push(new Boid(p5))
        }

    }

    p5.draw = () => {
        p5.background(0)

        for (let boid of flock) {
            boid.update()
            boid.borders(p5)
            boid.show(p5)
            boid.flock(p5, flock)
        }
    }
}


new p5(sketch);;