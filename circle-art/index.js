class Renderable {
    constructor() {
        this.render = this.render.bind(this);
        this.vibrate = this.vibrate.bind(this);
        this.bulge = this.bulge.bind(this);
    }
    render () { }
    vibrate () { }
    bulge () { }
}

class Circle extends Renderable {
    constructor(radius, posx, posy, color='white') {
        super();
        this.radius = radius;
        this.color = color;
        this.posx = posx;
        this.posy = posy;
        this.state = {
            prevx: this.posx,
            prevy: this.posy,
            prevr: this.radius,
            x: this.posx,
            y: this.posy,
            radius: this.radius
        };
        
    }

    render (ctx, translator) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        let {x, y} = translator.translate(this.state.x, this.state.y);
        ctx.arc(x, y, this.state.radius, 2*Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }

    clear(ctx, translator, color='black') {
        let {x, y} = translator.translate(this.state.x, this.state.y);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, this.state.radius+1, 2*Math.PI, false); // radius + 1 for clearing out border, without it, some border persisted
        ctx.fill();
        ctx.closePath();
    }

    vibrate(ctx, translator, amplitude = 2, speed = 10 /* pixels per frame */, fps = 60) {
        const direction = 2 * Math.PI * Math.random();
        // generate animation function with time as parameter
        const f = (t) => {
            this.clear(ctx, translator);
            let displacement = amplitude * Math.sin(t*speed/fps);
            const dx = displacement * Math.cos(direction);
            const dy = displacement * Math.sin(direction);
            this.state.x = this.posx + dx;
            this.state.y = this.posy + dy;
            this.render(ctx, translator);
            window.setTimeout(() => f(t+fps), fps); 
        }
        f(0);
    }

    bulge (ctx, translator, speed = 1, fps = 60) {
        const amplitude = this.radius * 0.05; // 10% of the radius
        const f = (t) => {
            this.clear(ctx, translator);
            let dr = amplitude * Math.sin(t*speed/fps);
            this.state.radius = this.radius + dr;
            this.render(ctx, translator);
            window.setTimeout(() => f(t+fps), fps);
        }
        f(0)
    }
}

class Ring {
    constructor(radius, nCircles=10, color='white') {
        this.radius = radius;
        this.color = color;
        this.nCircles = nCircles;
        this.dTheta = Math.PI * 2 / nCircles;
        this.circleRad = radius / (1 / Math.sin(this.dTheta/2) + 1)
        this.circles = null;

        this.getCircles = this.getCircles.bind(this);
        this.renderCircles = this.renderCircles.bind(this);
        this.next = this.next.bind(this);
    }

    getCircles() {
        if (this.circles !== null) {
            return this.circles;
        }
        let circs = [];
        const sumr = this.radius + this.circleRad;
        const offset = Math.random(); // offset angle between circles
        for (let x=0;x<this.nCircles;x+=1) {
            let angle = offset + this.dTheta * x;
            let centerx = sumr * Math.cos(angle);
            let centery = sumr * Math.sin(angle);
            circs.push(new Circle(this.circleRad, centerx, centery, this.color));
        }
        this.circles = circs;
        return circs;
    }

    renderCircles (ctx, translator) {
        this.getCircles().map((x) => x.render(ctx, translator));
    }

    next (nCircles=null, color=null) {
        let offset = 15;
        color = color || this.color; 
        nCircles = nCircles || this.nCircles;
        return new Ring(this.radius + this.circleRad*2 + offset, nCircles, color);
    }
}

class Translator {
    constructor(w, h) {
        this.translate = (x, y) => ({ x: w/2 + x, y: h/2 - y });
    }
}
