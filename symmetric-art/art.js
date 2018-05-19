const IDLE = 0;
const DRAWING = 1;

class DrawHandler {
    constructor (canvas, symmetries) {
        this.state = IDLE; // initial state: not drawing
        this.canvas = canvas;
        this.symmetries = symmetries;

        this.dTheta = 2 * Math.PI / symmetries;
        this.ctx = canvas.getContext('2d');
        this.currentPos = null;
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.center = {x: canvas.width/2, y:canvas.height/2};
        this.color = 'white';
        this.strokeSize = 1;
        // TODO: draw a dot on the center
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.dragStart = null;  // this is used not to draw a point at the end of drawing
    }

    setColor(color) {
        this.color = color;
    }
    
    setSize(val) {
        this.strokeSize = val;
    }

    getMousePos(e) {
        return {
            x: e.clientX - this.canvasRect.left,
            y: e.clientY - this.canvasRect.top
        };
    }

    handleMouseClick(e) {
        const pos = this.getMousePos(e);
        if (pos.x !== this.dragStart.x | pos.y !== this.dragStart.y) return;
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.color;
        for(let x=0; x<this.symmetries;x++) {
            let newpt = rotateAbout(pos, x*this.dTheta, this.center);
            this.drawPoint(newpt);
        }
        
    }

    handleMouseDown(e) {
        this.state = DRAWING;
        // get position
        this.currentPos = this.getMousePos(e);
        this.dragStart = this.currentPos;
    }

    handleMouseUp(e) {
        this.state = IDLE;
        this.currentPos = null;
    }
    
    handleMouseOut(e) {
        this.state = IDLE;
    }

    handleMouseMove(e) {
        if (this.state === DRAWING) {
            const newpos = this.getMousePos(e);
            this.drawSymmetries(this.currentPos, newpos);
            this.currentPos = newpos;
        }
    }

    drawSymmetries(from, to) {
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.strokeSize;
        for(let x=0; x<this.symmetries;x++) {
            let newfrom = rotateAbout(from, x*this.dTheta, this.center);
            let newto = rotateAbout(to, x*this.dTheta, this.center);
            this.drawLine(newfrom, newto);
        }
    }

    drawPoint(point) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.strokeSize, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawLine(from, to) {
        this.ctx.beginPath();
        const {x, y} = from;
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
    }

    download(a_elem) {
        let dt = this.canvas.toDataURL('image/jpeg');
        a_elem.href = dt;
    }
}

function translatePoint(point, dx, dy) {
    let {x, y} = point;
    x+=dx; y+=dy;
    return {x, y};
}


function rotateAbout(point, angle, center) {
    let translated = translatePoint(point, -center.x, -center.y);
    let rotated = rotatePoint(translated, angle);
    return translatePoint(rotated, center.x, center.y);
}


function rotatePoint(point, angle) {
    var {x, y} = point;
    xx = x*Math.cos(angle) + y*Math.sin(angle);
    yy = y*Math.cos(angle) - x*Math.sin(angle);
    return {x:xx, y:yy};
}
