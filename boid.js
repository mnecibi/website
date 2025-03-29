import { Vector } from "p5/lib/p5.min";

export default class Boid {
    constructor(p5) {
        this.position = p5.createVector(p5.random(p5.windowWidth), p5.random(p5.windowHeight))
        this.velocity = Vector.random2D()
        this.velocity.setMag(p5.random(2, 4))
        this.acceleration = p5.createVector()
        this.maxForce = 0.1
        this.maxSpeed = 3
        this.r = 5
    }

    align(p5, boids) {
        let neighborDistance = 30;
        let count = 0

        let steering = p5.createVector()
        for (let other of boids) {
            let d = Vector.dist(this.position, other.position);
            if (d > 0 && d < neighborDistance) {
                steering.add(other.velocity);
                count++;
            }
        }
        if (count > 0) {
            steering.div(count)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    cohesion(p5, boids) {
        let neighborDistance = 50;
        let count = 0

        let steering = p5.createVector()
        for (let other of boids) {
            let d = Vector.dist(this.position, other.position);
            if (d > 0 && d < neighborDistance) {
                steering.add(other.position);
                count++;
            }
        }
        if (count > 0) {
            steering.div(count)
            steering.sub(this.position)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    separation(p5, boids) {
        let neighborDistance = 40;
        let count = 0

        let steering = p5.createVector()
        for (let other of boids) {
            let d = Vector.dist(this.position, other.position);
            if (d > 0 && d < neighborDistance) {
                const diff = Vector.sub(this.position, other.position)
                diff.div(d)
                steering.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steering.div(count)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    flock(p5, boids) {
        let alignment = this.align(p5, boids)
        let cohesion = this.cohesion(p5, boids)
        let separation = this.separation(p5, boids)
        this.acceleration.mult(0)
        this.acceleration.add(alignment)
        this.acceleration.add(cohesion)
        this.acceleration.add(separation)
    }

    update() {
        this.position.add(this.velocity)
        this.velocity.add(this.acceleration)
        this.velocity.limit(this.maxSpeed)
    }

    show(p5) {
        p5.strokeWeight(this.st);
        p5.push();
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.velocity.heading());
        p5.triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
        p5.pop();
    }

    borders(p5) {
        if (this.position.x < 0) {
            this.position.x = p5.windowWidth
        }

        if (this.position.x > p5.windowWidth) {
            this.position.x = 0
        }

        if (this.position.y < 0) {
            this.position.y = p5.windowHeight
        }

        if (this.position.y > p5.windowHeight) {
            this.position.y = 0
        }
    }
}