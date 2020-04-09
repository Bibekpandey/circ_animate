const STEPS = 30;
const FPS = 30;

class ParticlesMotion {
    constructor(particlesCount, context) {
        this.numParticles = particlesCount;
        this.context = context;

        this.particles = [...Array(particlesCount)].map(x=> Particle.random(context));
        controlDirection(this.particles, context);

        this.stepCount = 0;

        this.run = this.run.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    run(t) {
        if (this.stepCount >= STEPS) return;
        this.stepCount += 1;
        this.render();
        this.update(t);
        requestAnimationFrame(this.run);
    }

    render() {
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.particles.map(x => x.render());
    }

    update(t) {
        this.particles.map(x => x.update());
    }
}

function controlDirection(particles, context) {
    // Try to arrange particles in center circle of given radius
    const circRadius = 150;
    const cx = Math.floor(context.canvas.width/2);
    const cy = Math.floor(context.canvas.height/2);

    for(let i=0;i<particles.length; i++) {
        const angle = i*Math.PI*2/particles.length;
        const destX = cx + circRadius*Math.cos(angle);
        const destY = cy + circRadius*Math.sin(angle);
        particles[i].state.vx = (destX - particles[i].state.x) / STEPS;
        particles[i].state.vy = (destY - particles[i].state.y) / STEPS;
    }
}

function defaultState() {
    return {x: 10, y: 10, vx: 0, vy: 0, size: 2, color: 'red'};
}

class Particle {
    constructor(state={}, context) {
        this.context = context;
        this.state = {
            ...defaultState(),
            ...state,
        };

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    static random(context) {
        const w = context.canvas.width;
        const h = context.canvas.height;
        const state = {
            x: (w/4) + Math.random() * w/2,
            y: (h/4) + Math.random() * h/2,
        }
        return new Particle(state, context)
    }

    render() {
        this.context.beginPath();
        this.context.fillStyle = this.state.color;
        this.context.fillRect(this.state.x, this.state.y, this.state.size, this.state.size);
    }

    update(t) {
        this.state.x += this.state.vx;
        this.state.y += this.state.vy;
    }
}
