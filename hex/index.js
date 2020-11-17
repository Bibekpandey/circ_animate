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
    if(col < 0 || row < 0) return;

    try {
        conf.grid.map(cols => cols.map(cell => cell.fill = false));
        conf.hexagons.map(cols => cols.map(cell => cell.fill = false));
        // Get 3 hexagons touched by the cell
        const hex1r = row + 1, hex1c = col + 1;
        const hex2r = row + (col % 2 == 0 ? 0 : 1), hex2c = col;
        const hex3r = row + (col % 2 == 0 ? 1 : 2), hex3c = col;
        conf.grid[col][row].fill = true;
        conf.hexagons[hex1c][hex1r].fill = true;
        conf.hexagons[hex2c][hex2r].fill = true;
        conf.hexagons[hex3c][hex3r].fill = true;
    }
    catch(e) {
        console.warn(e);
        console.log({col, row, rows: conf.rows});
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
