export class RegularPolygon {
    constructor(props={sides:5, radius:150, center:{x:500, y:500}, points:null }) {
        this.props = {
            ...props,
            angle: Math.PI * 2 / props.sides
        };

        if(!this.props.points) {
            // calculate start point
            const  halfAngle = this.props.angle/2;
            this.props.sideLength = 2* props.radius* Math.sin(halfAngle);
            const verticallyDown = {
                x: this.props.center.x,
                y: this.props.center.y - this.props.radius,
            };
            this.props.startPoint = verticallyDown;
            this.props.points = this.getPoints();
        }
        else {
            this.props.startPoint = this.props.points[0];
        }

        this.getPoints = this.getPoints.bind(this);
        this.render = this.render.bind(this);
        this.scale = this.scale.bind(this);
        this.rotate = this.rotate.bind(this);
    }

    scale(factor) {
        const { sideLength, points: oldPoints, center } = this.props;
        const points = oldPoints.map(x => interpolateLine(center, x, factor));
        const newProps = {
            ...this.props,
            sideLength: sideLength * factor,
            points,
        };
        return new RegularPolygon(newProps);
    }

    rotate(angle) {
        const { center, points: oldPoints } = this.props;
        const points = oldPoints.map(x => rotateAnti(x, angle, center));
        const newProps = {
            ...this.props,
            startPoint: null,
            points,
        };
        return new RegularPolygon(newProps);
    }

    getPoints() {
        const { points, center, sides, startPoint, angle } = this.props;
        if(points === null) {
            const calculatedPoints = [];
            for(let i=0;i<sides;i++) {
                calculatedPoints.push(rotateAnti(startPoint, angle*i, center));
            }
            this.props.points = calculatedPoints;
        }
        return this.props.points;
    }

    render(ctx, color=white) {
        let { points, sides } = this.props;
        if (points === null) {
            points = this.getPoints();
        }
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = 'white';

        ctx.moveTo(points[0].x, points[0].y);

        for(let i=0;i<sides-1;i++) {
            ctx.lineTo(points[i+1].x, points[i+1].y);
        }
        ctx.lineTo(points[sides-1].x, points[sides-1].y);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.closePath();
        ctx.fill();
    }
}

export const rotateAnti = (point, angle=0, center) => {
    const x = point.x - center.x;
    const y = point.y - center.y;

    const xx = x * Math.cos(angle) - y * Math.sin(angle);
    const yy = y * Math.cos(angle) + x * Math.sin(angle);
    return {
        x: center.x + xx,
        y: center.y + yy,
    };
};

export const distance = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.pow(dx*dx + dy*dy, 0.5);
}

export const getTheta = (point, center) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    let theta = 0;
    if (dx == 0) {
        theta = Math.PI / 2;
    } else {
        theta = Math.atan(dy/dx);
    }
    if (dx < 0 && dy < 0) return Math.PI + theta;
    if (dx < 0 && dy >= 0) return Math.PI - theta;
    if (dx >= 0 && dy >= 0) return theta;
    if (dx >= 0 && dy < 0) return 2 * Math.PI - theta;
};

export const interpolateLine = (a, b, factor) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return {
        x: a.x + dx * factor,
        y: a.y + dy * factor,
    }
};

export const polygonRotateAngleForScaleDown = (factor=0.1, theta) => {
    const half = theta/2;
    return half - Math.acos(Math.cos(half)/factor);
}

export const hexToRgb = (hex) => {
    const r = parseInt(hex.substr(0,2), 16);
    const g = parseInt(hex.substr(2,4), 16);
    const b = parseInt(hex.substr(4,6), 16);
    return { r, g, b };
}

export const rgbToHex = ({r, g, b}) => {
    return r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

export const interpolateColor = (c1, c2, totalSteps, step) => {
    const { r:r1, g:g1, b:b1 } = c1;
    const { r:r2, g:g2, b:b2 } = c2;
    const factor = step/totalSteps;
    return {
        r: r1 + Math.round((r2-r1)*factor),
        g: g1 + Math.round((g2-g1)*factor),
        b: b1 + Math.round((b2-b1)*factor),
    };
}
