const zeroVector = () => ({x: 0, y: 0});

const ParticleProps = (
        size=1,
        position=zeroVector(),
        velocity=zeroVector(),
        acceleration=zeroVector(),
        color='skyblue',
    ) => ({ size, position, velocity, acceleration, color,});

class Force {
    constructor(position={x:0,y:0}, radius=25, maxMagnitude=1) {
        this.position = position;
        this.radius = radius;
        this.maxMagnitude = maxMagnitude;
        this.positionHistory = [{x:1000, y:1000}, {x:1000, y:1000},{x:1000, y:1000},];
        this.direction = {x: 0, y: 0};

        this.getMagnitude = this.getMagnitude.bind(this);
        this.addToPositionHistory = this.addToPositionHistory.bind(this);
        this.calculateDir = this.calculateDir.bind(this);
    }

    addToPositionHistory(newPos) {
        this.positionHistory[2] = {...this.positionHistory[1]};
        this.positionHistory[1] = {...this.positionHistory[0]};
        this.positionHistory[0] = {...newPos};
    }

    getMagnitude(dist) {
        // Equation of force is f = 1 - 2 ^ (mx - c)
        // to find values for m and c, we have the following condition:
        // when x = 0, f = 0.999 [can't keep 1 or power will give value 0]
        // when x = rad, f = 0.85*maxMag
        // which gives, c = 9.966 and m = log2(150) / rad
        const c = 9.966;
        const m = Math.log2(150) / this.radius;
        return this.maxMagnitude *(1- Math.pow(2, m*dist - c));
    }

    calculateDir() {
        return normalized(direction(this.positionHistory[2], this.position));
    }
}

class Scene {
    constructor(ctx, elems=[]) {
        this.elements = elems;
        this.ctx = ctx;
        this.render = () => { this.elements.map(x => x.render()) };
        this.force = new Force();

        this.update = this.update.bind(this);
        this.animate = this.animate.bind(this);
        this.setForce = (f) => {this.force = f;};
    }

    update() {
        const force = this.force;
        const forceRad = force.radius; // the radius of the force circle
        const dir = force.calculateDir(); // normalized {x, y}

        // The force will have effect of an exponential function, very high near its center,
        // and decaying rapidly outwards its radius

        this.elements = this.elements.map((x) => {
            const dist = distance(x.state.position, force.position);
            const particleDir = normalized(direction(force.position, x.state.position));
            const angle = vecToAngle(particleDir);
            const forceMag = force.getMagnitude(forceRad, force.magnitude, dist);
            const acceleration = {
                x: Math.cos(angle) * forceMag,
                y: Math.sin(angle) * forceMag,
            };
            x.state.acceleration = {...acceleration};
            return x;
        });
    }

    animate() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
        this.update();
        this.elements.map((x) => x.render());
        // render mousePos
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        const {x, y} = getCanvasPosition(this.force.position, this.ctx.canvas);
        this.ctx.arc(x,y,this.force.radius,0,2*Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        window.setTimeout(this.animate, 1000/20);
    }
}


class Particle {
    constructor(ctx, props = ParticleProps()) {
        this.ctx = ctx;
        this.initialPosition = props.position;

        this.state = {
            ...props,
            lastPositions: [], // History of positions
        };
        this.state.position = {
            x: this.state.position.x + Math.random() * 0.8,
            y: this.state.position.y + Math.random() * 0.8,
        }

        this.oscillateDir = Math.random() * Math.PI * 2; // It's original direction
        this.K = Math.random(); //  F = -Kx

        this.render = this.render.bind(this);
        this.clear = this.clear.bind(this);
        this.updateSelf = this.updateSelf.bind(this);
    }

    updateSelf(t) {
        // it's own force, force like of spring, equilibrium position is its initial position
        const distWithOriginalPos = distance(this.initialPosition, this.state.position);
        const dirFromOriginalPos = normalized(direction(this.initialPosition, this.state.position));

        const angle = vecToAngle(dirFromOriginalPos);

        const {x, y} = this.state.acceleration;
        this.state.acceleration = {
            x: -this.K * distWithOriginalPos * Math.cos(angle),
            y: -this.K * distWithOriginalPos * Math.sin(angle),
        };
        this.state.velocity = {
            x: this.state.velocity.x + this.state.acceleration.x,
            y: this.state.velocity.y + this.state.acceleration.y,
        };
        this.state.position = {
            x: this.state.position.x + this.state.velocity.x,
            y: this.state.position.y + this.state.velocity.y,
        };
    }

    update(t) {
        this.state.velocity = {
            x: this.state.velocity.x + this.state.acceleration.x,
            y: this.state.velocity.y + this.state.acceleration.y,
        };
        this.state.position = {
            x: this.state.position.x + this.state.velocity.x,
            y: this.state.position.y + this.state.velocity.y,
        };
    }

    clear () {
        ctx.fillStyle = 'black';
        const {x, y} = getCanvasPosition(this.state.position, this.ctx.canvas);
        ctx.fillRect(x,y, 1*this.state.size, 1*this.state.size);
    }

    render(t=0) {
        // this.updateSelf(t);
        this.update(t);
        const {x, y} = getCanvasPosition(this.state.position, this.ctx.canvas);
        ctx.fillStyle = this.state.color;
        ctx.fillRect(x,y, 1*this.state.size, 1*this.state.size);
    }
}


/*************************************************
 * HELPERS
*************************************************/

const distance = (a, b) => Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));

const direction = (from, to) => ({x: to.x - from.x, y: to.y - from.y});
const normalized = ({x, y}) => ({x: x/(x*x + y*y), y: y/(x*x+y*y)});

const vecToAngle = ({x, y}) => {
    let angle;
    if (x !== 0) {
        angle = Math.atan(Math.abs(y)/Math.abs(x));
    } else {
        angle = Math.PI / 2;
    }
    if (x >= 0) {
        return y >= 0 ? angle : Math.PI * 2 - angle;
    } else {
        return y >= 0 ? Math.PI - angle : Math.PI + angle;
    }
};

function createParticles(ctx, X, Y) {
    // create from -x to +x and -y to +y
    const offset = 7;
    let props;
    let particles = [];

    let x, y;
    for(let i=-X; i<X; i++) {
        for(let j=-Y; j< Y; j++) {
            x = offset * i;
            y = offset * j;
            props = ParticleProps(size=2,position={x, y});
            particles.push(new Particle(ctx, props));
        }
    }
    return particles;
}

const getCanvasPosition = (pos, canvas) => ({
    x: canvas.clientWidth/2 + pos.x,
    y: canvas.clientHeight/2 - pos.y
});
