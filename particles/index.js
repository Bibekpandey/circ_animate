import { drawText, sampleCanvas } from './text-sampling.js';

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
        damping=0.05,
        K=() => 0.01, 
    ) => ({ size, position, velocity, acceleration, color, damping, K});

class Force {
    constructor(position={x:1000,y:1000}, radius=40, maxMagnitude=3) {
        this.position = position;
        this.radius = radius;
        this.maxMagnitude = maxMagnitude;

        this.positionHistory = [{x:1000, y:1000}, {x:1000, y:1000},{x:1000, y:1000},];

        // these are not used
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
        return normalizedDir(this.positionHistory[2], this.position);
    }
}

export class ParticlesRenderer {
    constructor(canvas, elems=[], fps=80) {
        this.elements = elems;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.render = () => { this.elements.map(x => x.render()) };
        this.force = new Force();
        this.fps = fps;

        this.update = this.update.bind(this);
        this.drawText = this.drawText.bind(this);
        this.animate = this.animate.bind(this);
    }

    renderTextParticles(text) {
        drawText(this.ctx, text);
        const sample = sampleCanvas(tctx);
        this.elements = createParticlesFromSample(this.ctx, sample);
        this.animate();
    }

    createParticles(x,y) {
        this.elements = createParticles(this.ctx, x, y);
    }

    drawText(text) {
        drawText(this.ctx, text);
    }

    update(t) {
        // TODO: conside force direction as well
        this.elements = this.elements.map((e) => {
            e.update(this.force, t);
            return e;
        });
    }

    animate(t=0) {
        this.ctx.fillStyle = 'black'; // TODO: no hardcode
        // clear canvas
        this.ctx.fillRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);

        // update and render elements
        this.update(t);
        this.elements.map((x) => x.render());

        window.setTimeout(() => this.animate(t+1), 1000/this.fps);
    }
}


class Particle {
    constructor(ctx,
            props = ParticleProps(),
    ) {
        this.ctx = ctx;
        this.initialPosition = props.position;
        //this.damping = damping()
        this.K = props.K();

        this.state = {
            ...props,
            lastPositions: [], // History of positions, not used now
        };

        // set random position initially
        const plusMinus = (x) => Math.random() > 0.5 ? x : -x;
        this.state.position = {
            x: plusMinus(Math.random() * 800),
            y: plusMinus(Math.random() * 800),
        }

        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
    }

    update(force, t) {

        const {position, velocity, damping} = this.state;

        const dist = distance(position, force.position);
        const particleDir = normalizedDir(force.position, position);

        const forceAngle = vecToAngle(particleDir);
        const forceMag = force.getMagnitude(dist);

        // acceleration due to force
        const accDueToForce = {
            x: Math.cos(forceAngle) * forceMag,
            y: Math.sin(forceAngle) * forceMag,
        };

        // Calculating acceleration due to its displaced position (Same as spring mechanics)
        const distWithOriginalPos = difference(position, this.initialPosition);

        this.state.acceleration = {
            x: accDueToForce.x - this.K * distWithOriginalPos.x - velocity.x * damping,
            y: accDueToForce.y - this.K * distWithOriginalPos.y - velocity.y * damping,
        };

        this.state.velocity = {
            x: velocity.x + this.state.acceleration.x,
            y: velocity.y + this.state.acceleration.y,
        };

        this.state.position = {
            x: position.x + this.state.velocity.x,
            y: position.y + this.state.velocity.y,
        };
    }

    render(t=0) {
        const {x, y} = getCanvasPosition(this.state.position, this.ctx.canvas);
        // TODO: can interpolate color based on distance from original position
        ctx.fillStyle = colorToStr(this.state.color);

        ctx.fillRect(x,y, 1*this.state.size, 1*this.state.size);
    }
}


/*************************************************
 * HELPERS
*************************************************/

const distance = (a, b) => Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
const difference = (a, b) => ({
    x: a.x - b.x,
    y: a.y - b.y,
});

const direction = (from, to) => ({x: to.x - from.x, y: to.y - from.y});
const normalized = ({x, y}) => ({x: x/(x*x + y*y), y: y/(x*x+y*y)});
const normalizedDir = (from, to) => normalized(direction(from, to));

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

function createParticles(ctx, X, Y, offx=0, offy=0, dist=5) {
    // create from -x to +x and -y to +y
    let particles = [];
    let props;

    let x, y;
    for(let i=-X+1; i<X; i++) {
        for(let j=-Y+1; j< Y; j++) {
            x = dist * i + offx;
            y = dist * j + offy;
            props = ParticleProps(1.5,{x, y}); // size and position
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

function createParticlesFromSample(ctx, sample, dist=5) {
    let particles = [];
    sample.forEach((row, j) => {
        row.forEach((cell, i) => {
            if (cell === 1) {
                const x = dist * i;
                const y = -dist * j;
                props = ParticleProps(size=2,position={x, y});
                particles.push(new Particle(ctx, props));
            }
        });
    });
    return particles;
}
