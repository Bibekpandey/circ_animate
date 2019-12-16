const BLACK = [10, 10, 10];

const COLOR_PALETTE = [
    [32, 0, 40],
    [82, 15, 125],
    [99, 53, 126],
    [102, 10, 150],
    [132, 26, 200],
    [165, 32, 250],
    [196, 106, 251],
];
const FPS = 60;


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



class Hazer {
    constructor(numcircles=100, context) {
        this.shades = getRandomColorShades();
        this.circles = [...Array(numcircles)].map(x=> Circle.random(this.shades));
        this.context = context;
        this.runcount = 0;
        this.reqId = null;

        this.run = this.run.bind(this);
        this.render = this.render.bind(this);
        this.update = this.update.bind(this);

    }


    update(t) {
        this.circles.map(x=> x.update(t))
    }

    render() {
        this.circles.map(x=> x.render(this.context))
    }

    run(t) {
        this.reqId = requestAnimationFrame(this.run);
        this.render();
        this.update(t);
        this.runcount += 1;
        if (this.runcount > 140) {
            cancelAnimationFrame(this.reqId);
        }
    }
}


class Circle {
    constructor(x, y, r, color) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color
        this.dir = Math.random() > 0.5 ? 1: -1;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    update(t) {
        const rand = Math.random()*Math.random();
        const rand1 = Math.random();
        this.x += (this.dir*rand1);
        this.y += rand;
    }

    static random(colorShades=COLOR_PALETTE) {
        const radius = parseInt(Math.random() * 2.5) + 1;
        const randx = parseInt(Math.random() * context.canvas.width);
        const randy = parseInt(Math.random() * context.canvas.height);
        const randindex = parseInt(Math.random() * colorShades.length);
        const color = colorArrayToStr(colorShades[randindex]);
        return new Circle(randx, randy, radius, color)
    }

    render(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
        context.fillStyle = this.color
        context.fill();
    }
}

function colorArrayToStr(arr) {
    return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
}
