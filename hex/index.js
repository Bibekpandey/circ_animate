const SIXTY = Math.PI / 3;
const cos = Math.cos;
const sin = Math.sin;

const hexHeight = (size) => 2 * size * sin(SIXTY);

function onCanvasMouseOver(conf, e) {
    const { x, y } = e.target.getBoundingClientRect();
    const canvasX = e.x - x;
    const canvasY = e.y - y;
    // Find the row number and column number of overlay grid
    const col = Math.floor((canvasX - conf.r/2) / (1.5*conf.r));
    const row = Math.floor(((col%2 === 0 ? 0 : -conf.v/2) + canvasY) / hexHeight(conf.r));
    if(col < 0 || row < 0 || col >= conf.cols || row >= conf.rows) return;
    // conf.grid.map(cols => cols.map(cell => cell.fill = false));
    conf.hexagons.map(cols => cols.map(cell => cell.fill = false));
    // Get 3 hexagons touched by the cell
    const hex1r = row + 1, hex1c = col + 1;
    const hex2r = row + (col % 2 == 0 ? 0 : 1), hex2c = col;
    const hex3r = row + (col % 2 == 0 ? 1 : 2), hex3c = col;
    // conf.grid[col][row].fill = true;

    const d1 = conf.hexagons[hex1c][hex1r].distanceSq(canvasX, canvasY);
    let d2 = d3 = 9999999999;

    if (hex2r < conf.rows) {
        // conf.hexagons[hex2c][hex2r].fill = true;
        d2 = conf.hexagons[hex2c][hex2r].distanceSq(canvasX, canvasY);
    }
    if (hex3r < conf.rows) {
        // conf.hexagons[hex3c][hex3r].fill = true;
        d3 = conf.hexagons[hex3c][hex3r].distanceSq(canvasX, canvasY);
    }

    if (d1 <= d2 && d1 <= d3) {
        conf.hexagons[hex1c][hex1r].fill = true;
    }
    else if (d2 <= d3 && d2 <= d1) {
        conf.hexagons[hex2c][hex2r].fill = true;
    }
    else if (d3 <= d2 && d3 <= d1) {
        conf.hexagons[hex3c][hex3r].fill = true;
    }
}

class OverlayCell {
    constructor(col, row, width, height) {
        this.fill = false;
        this.col = col;
        this.row = row;
        this.width = width;
        this.height = height;
        this.x = this.width / 3 + this.col * this.width;
        this.y = this.col % 2 == 0 ? this.row * this.height : this.height/2 + this.row * this.height;
    }

    draw(context) {
        context.beginPath();
        context.fillStyle = "#7799cc66";
        context.strokeStyle = "#7799ccdd";
        context.rect(this.x, this.y, this.width, this.height);
        if(this.fill) context.fill();
        else context.stroke();
    }
}

class Hexagon {
    constructor(col, row, size) {
        this.fill = false;
        this.col = col;
        this.row = row;
        this.x = this.col * 1.5 * size;
        const h = hexHeight(size);
        this.y = this.col % 2 == 0 ? h * this.row : h * (this.row - 0.5 );
        this.size = size;

        this.draw = this.draw.bind(this);
    }

    distanceSq(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx*dx + dy*dy;
    }

    draw(context) {
        context.fillStyle = "skyblue";
        context.strokeStyle = "skyblue";
        context.beginPath();
        context.moveTo(this.x + this.size, this.y);
        for (let i=1; i<7; i++) {
            context.lineTo(
                this.x + this.size* cos(i * SIXTY), this.y + this.size * sin(i*SIXTY));
        }
        if(this.fill) context.fill();
        else context.stroke();
    }
}
