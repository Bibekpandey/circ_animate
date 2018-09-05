const zeroVector = () => ({x: 0, y: 0});

const ParticleProps = (
        size=1,
        position=zeroVector(),
        velocity=zeroVector(),
        acceleration=zeroVector(),
        color='skyblue',
    ) => ({ size, position, velocity, acceleration, color,});


class Scene {
    constructor(ctx, elems=[]) {
        this.elements = elems;
        this.ctx = ctx;
        this.render = () => { this.elements.map(x => x.render()) };

        this.update = this.update.bind(this);
        this.animate = this.animate.bind(this);
        this.setForce = (f) => {this.force = f;};
    }

    update() {
        const force = this.getForce();
        const forceRad = force.radius; // the radius of the force circle
        const dir = force.direction; // normalized {x, y}

        // The force will have effect of an exponential function, very high near its center,
        // and decaying rapidly outwards its radius

        this.elements.map((x) => {
            const dist = distance(x.state.position, force.position);
            const particleDir = direction(force.position, x.state.position);
            const forceMag = calculateMagnitude(forceRad, force.magnitude, dist);
        });
    }

    animate() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
        this.elements.map((x) => x.render());
        window.setTimeout(this.animate, 1000/30);
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
            x: this.state.position.x + Math.random() * 2,
            y: this.state.position.y + Math.random() * 2,
        }

        this.oscillateDir = Math.random() * Math.PI * 2; // It's original direction
        this.K = Math.random(); //  F = -Kx

        this.render = this.render.bind(this);
        this.clear = this.clear.bind(this);
        this.getCanvasPosition = this.getCanvasPosition.bind(this);
        this.updateSelf = this.updateSelf.bind(this);
    }

    getCanvasPosition() {
        return {
            x: this.ctx.canvas.clientWidth/2 + this.state.position.x,
            y: this.ctx.canvas.clientHeight/2 - this.state.position.y
        };
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

    clear () {
        ctx.fillStyle = 'black';
        const {x, y} = this.getCanvasPosition();
        ctx.fillRect(x,y, 1*this.state.size, 1*this.state.size);
    }

    render(t=0) {
        this.updateSelf(t);
        const {x, y} = this.getCanvasPosition();
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

const calculateMagnitude = (rad, maxMag, dist) => {
    // Equation of force is f = 1 - 2 ^ (mx - c)
    // to find values for m and c, we have the following condition:
    // when x = 0, f = 0.999 [can't keep 1 or power will give value 0]
    // when x = rad, f = 0.85*maxMag
    // which gives, c = 9.966 and m = log2(150) / rad
    const c = 9.966;
    const m = Math.log2(150) / rad;
    return maxMag * Math.pow(2, m*dist - c);
}

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
    const offset = 20;

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
