const STEPS = 150;
const noiseZoom = 0.00085;

function hslToRgb(h, s, l) {
    /*
     * COPIED
     * h within 360
     * s and l within 100
    */
    var r, g, b;
    h = h/360;
    s = s/100;
    l = l/100;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


function colorArrayToStr(arr) {
    return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
}

function getRandomColorShades(steps=6) {
    const lum = 75;
    const sat = parseInt(Math.random() * 70) + 30;
    const hue = parseInt(Math.random() * 360);
    const shades = [[hue, sat, lum]];
    for(let i=1; i<=steps; i++) {
        shades.push([hue, sat, lum - (i*10)]);
    }
    const s = shades.map(x=> hslToRgb(x[0], x[1], x[2]));
    return s;
}

function isWithinCanvas(canvas, obj) {
    return obj.prevX >= 0 && obj.prevX <= canvas.width && obj.prevY >=0 && obj.prevY <= canvas.height;
}


class Hazer {
    constructor(numparticles=100, context) {
        this.shades = getRandomColorShades();
        this.particles = [...Array(numparticles)].map(x=> Particle.random(this.shades, context));
        this.context = context;
        this.runcount = 0;
        this.reqId = null;

        seed(Math.floor(Math.random()*1000));

        this.run = this.run.bind(this);
        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
    }

    update(t) {
        this.particles.map(x=> x.update(t))
        this.particles = this.particles.filter(x=>isWithinCanvas(this.context.canvas, x));
    }

    render() {
        //this.context.fillStyle = 'black';
        //this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.particles.map(x=> x.render())
    }

    run(t) {
        this.reqId = requestAnimationFrame(this.run);
        this.update(t);
        this.render();
        this.runcount += 1;
        if (this.runcount > STEPS) {
            cancelAnimationFrame(this.reqId);
        }
    }
}


class Particle {
    constructor(x, y, r, color, context) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = 0.1;
        this.vy = 0.1;
        this.prevX = null;
        this.prevY = null;
        this.color = color;
        this.context = context;
        this.dir = Math.random() > 0.5 ? 1: -1;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    update(t) {
        this.prevX = this.x;
        this.prevY = this.y;
        const rand = Math.random()*Math.random();
        const rand1 = Math.random();
        this.x = (this.x + this.vx);
        this.y = (this.y + this.vy);
        // this.y += 0.5 + PERLIN.noiseAt(t/(STEPS*10));
        this.direction = 2 * Math.PI * perlin2(this.x * noiseZoom, this.y * noiseZoom);
        this.vx += Math.cos(this.direction);
        this.vy += Math.sin(this.direction);
    }

    static random(colorShades=COLOR_PALETTE, context, i=0) {
        const radius = parseInt(Math.random() * 2.5) + 1;
        const randx = 0; // parseInt(Math.random() * context.canvas.width);
        const randy =  i== 0 ? parseInt(Math.random() * context.canvas.height) : y;
        const randindex = parseInt(Math.random() * colorShades.length);
        const color = colorArrayToStr(colorShades[randindex]);
        return new Particle(randx, randy, radius, color, context)
    }

    render() {
        if (this.x > this.context.canvas.width || this.y>this.context.canvas.height) {
            return;
        }
        this.context.beginPath();
        this.context.moveTo(this.prevX, this.prevY);
        this.context.lineTo(this.x, this.y);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.r;
        this.context.stroke();
        // this.context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
        // this.context.fillStyle = this.color
        // this.context.fill();
    }
}
