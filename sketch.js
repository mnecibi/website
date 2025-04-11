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

        // Draw a larger white circle at the mouse position
        p5.fill(255)
        p5.noStroke()
        p5.circle(p5.mouseX, p5.mouseY, 30)
    }
}


new p5(sketch);;