const zeroVector = {x: 0, y: 0};
const Color = (r, g, b) => ({r, g, b});

const COLORS = {
    skyblue: Color(0, 191, 255),
    red: Color(255, 0, 0),
};

const ParticleProps = (
        size=1,
        position=zeroVector,
        velocity=zeroVector,
        acceleration=zeroVector,
        color=COLORS.skyblue,
    ) => ({ size, position, velocity, acceleration, color,});

class Force {
    constructor(position={x:1000,y:1000}, radius=35, maxMagnitude=3) {
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
        const mag = this.maxMagnitude *(1- Math.pow(2, m*dist - c));
        return mag < 0 ? 0 : mag;
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

        this.elements = this.elements.map((e) => {
            e.updateSelf(force);
            return e;
        });
    }

    animate(t=0) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
        this.update();
        this.elements.map((x) => x.render(t));
        window.setTimeout(() => this.animate(t+1), 1000/60);
    }
}


class Particle {
    constructor(ctx, props = ParticleProps()) {
        this.ctx = ctx;
        this.initialPosition = props.position;
        this.damping = 0.009;

        this.state = {
            ...props,
            lastPositions: [], // History of positions
        };
        this.state.position = {
            x: this.state.position.x + Math.random() * 1.8,
            y: this.state.position.y + Math.random() * 1.8,
        }

        this.oscillateDir = Math.random() * Math.PI * 2; // It's original direction
        this.K = Math.random()*0.1; //  F = -Kx

        this.render = this.render.bind(this);
        this.clear = this.clear.bind(this);
        this.updateSelf = this.updateSelf.bind(this);
    }

    updateSelf(force) {
        const dist = distance(this.state.position, force.position);
        const particleDir = normalized(direction(force.position, this.state.position));
        const fangle = vecToAngle(particleDir);
        const forceMag = force.getMagnitude(dist);
        const acceleration = {
            x: Math.cos(fangle) * forceMag,
            y: Math.sin(fangle) * forceMag,
        };

        // it's own force, force like of spring, equilibrium position is its initial position
        const distWithOriginalPos = distance(this.initialPosition, this.state.position);
        const dirFromOriginalPos = normalized(direction(this.initialPosition, this.state.position));

        const angle = vecToAngle(dirFromOriginalPos);

        const {x, y} = this.state.acceleration;
        this.state.acceleration = {
            x: acceleration.x -this.K * distWithOriginalPos * Math.cos(angle) - this.state.velocity.x * this.damping,
            y: acceleration.y -this.K * distWithOriginalPos * Math.sin(angle) - this.state.velocity.y * this.damping,
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
        const {x, y} = getCanvasPosition(this.state.position, this.ctx.canvas);
        ctx.fillRect(x,y, 1*this.state.size, 1*this.state.size);
    }

    render(t=0) {
        //this.updateSelf();
        //this.update(t);
        const {x, y} = getCanvasPosition(this.state.position, this.ctx.canvas);
        const vel = distance(this.state.velocity, zeroVector);
        const color = interpolate(COLORS.skyblue, COLORS.red, vel/1000);
        ctx.fillStyle = colorToStr(this.state.color); // colorToStr(this.state.color)
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
    for(let i=-X+1; i<X; i++) {
        for(let j=-Y+1; j< Y; j++) {
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

const colorToInt = ({r, g, b}) => b + g*256 + r* 256*256;
const intToColor = (i) => ({b:i%256, g: parseInt(i/256)%256, r: parseInt(i/(256*256))});
const colorToStr = ({r, g, b}) => `rgb(${r}, ${g}, ${b})`;

const interpolate = (colora, colorb, t)  => {
    const a = colorToInt(colora);
    const b = colorToInt(colorb);
    return intToColor(b * t + (1-t)*a);
}
