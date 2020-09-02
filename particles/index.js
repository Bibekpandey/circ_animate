const zeroVector = () => ({x: 0, y: 0});

const defaultParticleProps = {
    size: 2,
    position: zeroVector(),
    velocity: zeroVector(),
    acceleration: zeroVector(),
    color: 'cyan',
    damping: 0.1,
    K: 0.01, 
    restless: true, // particle won't stay static, will have small random motions even if no force acting
};

const defaultForceProps = {
    position: {x: 1000, y: 1000},
    radius: 20,
    maxMagnitude: 50,
};

class Force {
    constructor(props={}) {
        const forceProps = {
            ...defaultForceProps,
            ...props,
        };
        this.position = forceProps.position;
        this.radius = forceProps.radius;
        this.maxMagnitude = forceProps.maxMagnitude;

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
        // Equation of force is f = 1/(a*dist*dist + b)
        //const c = 9.966;
        //const m = Math.log2(150) / this.radius;
        //let mag = this.maxMagnitude *(1- Math.pow(2, m*dist - c));
        const a = 20/(this.radius*this.radius);
        const b = 1;
        return this.maxMagnitude* 1/(a*dist*dist + b);
    }

    calculateDir() {
        return normalizedDir(this.positionHistory[2], this.position);
    }
}

const defaultRendererProps = {
    fps:80,
    bgColor:'black',
    width:900,
    height:900,
    elements:[],
    particlesSpacing: 2,
};

class ParticlesRenderer {
    constructor( canvas,
        props={},
        particleProps={},
        forceProps={}
    ) {
        this.elements = props.elements;
        this.particleProps = {
            ...defaultParticleProps,
            ...particleProps,
        };

        this.canvas = canvas;

        this.props = {
            ...defaultRendererProps,
            ...props,
        };
        this.canvas.height = this.props.height;
        this.canvas.width = this.props.width;

        this.force = new Force(forceProps);

        // write canvas to dom
        this.ctx = this.canvas.getContext('2d');

        this.render = (t) => { this.elements.map(x => x.render(t)) };

        this.update = this.update.bind(this);
        this.drawText = this.drawText.bind(this);
        this.animate = this.animate.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.cleanUp = this.cleanUp.bind(this);
    }

    start() {
        // add mouse move event to document
        this.canvas.addEventListener('mousemove', this.handleMouseMove, false);
        this.canvas.addEventListener('mouseout', this.handleMouseOut, false);
        this.animate(0);
    }

    handleMouseOut(ev) {
        const position = {x: 10000, y: 10000};
        this.force.position = position;
    }

    handleMouseMove(ev) {
        const rect = this.canvas.getBoundingClientRect();
        const mousex = ev.clientX - rect.left;
        const mousey = ev.clientY - rect.top;
        const newCoord = {
            x: mousex - this.canvas.width/2,
            y: this.canvas.height/2 - mousey
        };
        this.force.addToPositionHistory(newCoord);
        this.force.position = newCoord;
    }

    cleanUp() {
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseout', this.handleMouseOut);
        clearTimeout(this.timeout);
    }

    renderTextParticles(text, fontName='Helvetica', size=60, style='bold') {
        // create a canvas dom element
        const tcanvas = document.createElement('canvas');
        // TODO: make the width and height dynamic
        tcanvas.width = 1000;
        tcanvas.height= 1000;
        const tctx = tcanvas.getContext('2d');
        tctx.fillStyle = 'white';
        tctx.fillRect(0, 0, tcanvas.width, tcanvas.height);

        // draw text in the canvas
        drawText(tctx, text, fontName, size, style);
        // sample the canvas
        const sample = sampleCanvas(tctx);

        this.elements = createParticlesFromSample(this.ctx, sample, {...this.particleProps}, this.props.particlesSpacing);
    }

    renderImage(src, width=1000, height=1000) {
        // create a canvas dom element
        const imageCanvas = document.createElement('canvas');
        imageCanvas.width = width;
        imageCanvas.height = height;
        const ictx = imageCanvas.getContext('2d');

        // load image in canvas
        const image = new Image();
        image.src = src;
        image.onload = () => {
            image.crossOrigin = "anonymous";
            ictx.drawImage(image, 0, 0);
            document.body.appendChild(imageCanvas);
            // sample image
            const sample = sampleImageCanvas(ictx, 5);
            this.elements = createParticlesFromColoredSample(this.ctx, sample, {...this.particleProps}, this.props.particlesSpacing);
            this.start();
        };
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
        this.ctx.fillStyle = this.props.bgColor;
        // clear canvas
        this.ctx.fillRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);

        // update and render elements
        this.update(t);
        this.elements.map((x) => x.render(t));

        this.timeout = window.setTimeout(() => this.animate(t+1), 1000/this.props.fps);
    }
}


class Particle {
    constructor(ctx, props={}) {
        this.ctx = ctx;
        this.initialPosition = props.position;
        this.K = props.K;

        this.state = {
            ...defaultParticleProps,
            ...props,
            lastPositions: [], // History of positions, not used now
        };

        // set random position initially
        this.state.position = {
            x: plusMinus(Math.random() * ctx.canvas.width / 3),
            y: plusMinus(Math.random() * ctx.canvas.height / 2),
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
        if (
            this.state.restless
            && Math.abs(this.state.acceleration.x) <= 0.12
            && Math.abs(this.state.acceleration.y <= 0.12)
            && Math.random() > 0.75
        ) {
            this.state.position = {
                x: this.state.position.x + plusMinus(Math.random()*0.3),
                y: this.state.position.y + Math.random()*0.3,
            }
        }
    }

    render(t) {
        let {x, y} = getCanvasPosition(this.state.position, this.ctx.canvas);
        // TODO: can interpolate color based on distance from original position
        this.ctx.fillStyle = this.state.color;

        this.ctx.fillRect(x,y, 1*this.state.size, 1*this.state.size);
    }
}


/*************************************************
 * HELPERS
*************************************************/

const plusMinus = (x) => Math.random() > 0.5 ? x : -x;
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
    // TODO: send particle props
    // create from -x to +x and -y to +y
    let particles = [];
    let props;

    let x, y;
    for(let i=-X+1; i<X; i++) {
        for(let j=-Y+1; j< Y; j++) {
            x = dist * i + offx;
            y = dist * j + offy;
            props = {
                ...defaultParticleProps,
                size: 1.5,
                position: {x, y}
            }
            particles.push(new Particle(ctx, props));
        }
    }
    return particles;
}

const getCanvasPosition = (pos, canvas) => ({
    x: canvas.clientWidth/2 + pos.x,
    y: canvas.clientHeight/2 - pos.y
});


function createParticlesFromSample(ctx, sample, particleProps=defaultParticleProps, dist=5, offset={x: 0, y: 0}) {
    let particles = [];
    if(!sample) return particles;

    const cols = sample[0].length;
    const rows = sample.length;
    sample.forEach((row, j) => {
        row.forEach((cell, i) => {
            if (cell === 1) {
                const x = offset.x + dist * (i - cols/2);
                const y = offset.y + dist * (rows/2 - j);
                const props = {
                    ...particleProps,
                    position: { x, y }
                };
                particles.push(new Particle(ctx, props));
            }
        });
    });
    return particles;
}

function createParticlesFromColoredSample(ctx, sample, particleProps=defaultParticleProps, dist=5, offset={x:0, y:0}) {
    let particles = [];
    if(!sample) return particles;

    const cols = sample[0].length;
    const rows = sample.length;
    sample.forEach((row, j) => {
        row.forEach((cell, i) => {
            const x = offset.x + dist * (i - cols/2);
            const y = offset.y + dist * (rows/2 - j);
            const {r, g, b, a} = cell;
            const props = {
                ...particleProps,
                position: { x, y },
                color: `rgba(${r}, ${g}, ${b}, ${a})`,
            };
            particles.push(new Particle(ctx, props));
        });
    });
    return particles;
}
