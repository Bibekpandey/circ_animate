const DEFAULT_TRANSITION = {
    "left": 0.4,
    "right": 0.55,
    "up": 0.5,
    "down": 0.5,
};
const STEPS = 2000000;
const UNITSIZE = 2;


class RandomWalk {
    constructor(color="black", unitsize=UNITSIZE, steps=STEPS, transition=DEFAULT_TRANSITION) {
        this.color = color;
        this.steps = 500;
        this.unitsize = unitsize; // number of pixels to step per unit
        this.transition = transition;
        this.currentPos = {x: 0, y: 0};
    }

    nextPosition() {
        const dx = Math.random() <= this.transition.left ? -1 : 1;
        const dy = Math.random() <= this.transition.up ? -1 : 1;
        var {x, y} = this.currentPos;
        x+=dx; y+=dy;
        this.currentPos = {x, y};
        return this.currentPos;
    }

    drawStep(ctx) {
        console.log('draw');
        ctx.beginPath();
        const {x, y} = this.currentPos;
        ctx.moveTo(x*this.unitsize, y*this.unitsize);
        const nextpos = this.nextPosition();
        ctx.lineTo(nextpos.x*this.unitsize, nextpos.y*this.unitsize);
        ctx.stroke();
    }

    start(context) {
        var c = 0;
        while(c < this.steps) {
            //console.log(this.currentPos);
            this.drawStep(context);
            c++;
        }
    }
};
