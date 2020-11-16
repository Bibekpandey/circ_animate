const SIXTY = Math.PI / 3;
const cos = Math.cos;
const sin = Math.sin;

const hexHeight = (size) => 2 * size * sin(SIXTY);

class Hexagon {
    constructor(col, row, size) {
        this.col = col;
        this.row = row;
        this.x = this.col * 1.5 * size;
        const h = hexHeight(size);
        this.y = this.col % 2 == 0 ? h * this.row : h * (this.row - 0.5 );
        this.size = size;

        this.draw = this.draw.bind(this);
    }

    draw(context) {
        drawHexagon(context, {x: this.x, y: this.y}, this.size)
    }
}

function drawHexagon(context, center, length) {
    context.beginPath();
    context.moveTo(center.x + length, center.y);
    for (let i=1; i<7; i++) {
        context.lineTo(
            center.x + length * cos(i * SIXTY), center.y + length * sin(i*SIXTY));
    }
    // context.fillStyle = "#23234366";
    context.strokeStyle = "#232343";
    context.stroke();
}
