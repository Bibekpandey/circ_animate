export class Main {
    constructor(canvas, overlayCanvas=null, fps = 45) {
        this.canvas = canvas;
        this.overlayCanvas = overlayCanvas;
        this.context = canvas.getContext('2d');
        this.overlayContext = overlayCanvas ? overlayCanvas.getContext('2d'): null;
        this.elements = [];
        this.timer = 0;
        this.fps = fps;

        this.addElement = this.addElement.bind(this);
        this.addElements = this.addElements.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.run = this.run.bind(this);
    }

    addElement(e) {
        this.elements.push(e);
    }

    addElements(elems) {
        this.elements = [...this.elements, ...elems];
    }

    update() {
        this.timer += 1;
        this.elements.map(x => x.update(this.timer));
    }

    render() {
        this.elements.map(x => x.render(this.context));

        if(this.overlayCanvas) {
            const positions = this.elements.map(x => x.globalPositionAt(this.timer));
            const ctx = this.overlayContext;
            ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

            positions.forEach(x => {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(x.x, x.y, 5, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    }

    run() {
        this.update();
        this.render()
        window.setTimeout(this.run, 1000/this.fps);
    }
}


export class Parametric {
    constructor(xFunc = (t) => t, yFunc = (t) => t, conf = {}) {
        // xFunc and yFunc are the functions of time
        this.x = xFunc;
        this.y = yFunc;
        this.properties = { // thickness, color, speed and so on
            xPos: 0,
            yPos: 0,
            boundWidth: 200,
            boundHeight: 200,
            speed: 1,
            color: [0, 0, 0],
            ...conf,
        };
        this.speedCount = 0;

        this.previousPosition = null;
        this.currentPosition = {
            x: this.x(0),
            y: this.y(0),
        };

        this.positionAt = this.positionAt.bind(this);
        this.globalPositionAt = this.globalPositionAt.bind(this);
        this.update = this.update.bind(this);
        this.toGlobalPosition = this.toGlobalPosition.bind(this);
    }

    positionAt(t) {
        const time = t*this.properties.speed;
        return {
            x: this.x(time),
            y: this.y(time),
        };
    }

    toGlobalPosition(position) {
        const { xPos, yPos, boundWidth, boundHeight } = this.properties;
        return {
            x: position.x + xPos + boundWidth / 2,
            y: position.y + yPos + boundHeight / 2,
        }
    }

    globalPositionAt(t) {
        return this.toGlobalPosition(this.positionAt(t));
    }

    update(t) {
        this.previousPosition = { ...this.currentPosition };
        this.currentPosition = this.positionAt(t);
    }

    render(ctx) {
        // TODO: render each points without skipping intermediate points even if
        // speed is great in order to draw nice shapes

        // Basically draw line from previous position to current
        if (! this.previousPosition) return;

        const { x: prevX, y: prevY } = this.toGlobalPosition(this.previousPosition);
        const { x, y } = this.toGlobalPosition(this.currentPosition);
        const {color } = this.properties;

        ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}
