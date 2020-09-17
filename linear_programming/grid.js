const newGrid = (canvas) => ({
    xrange: [-20, 20],
    yrange: [-20, 20],
    cellSize: 25,
    canvas: canvas,
});

const transformCoords = (grid, x, y) => {
    return [x*grid.cellSize + grid.canvas.width / 2, grid.canvas.height/2 - y*grid.cellSize]
};

const renderGrid = (grid) => {
    const ctx = grid.canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";

    // Draw y lines
    const [ymin, ymax] = grid.yrange;
    const [xmin, xmax] = grid.xrange;
    // Draw x axis
    renderLine(grid, xmin, 0, xmax, 0, 'gray', 2);

    // Draw other lines
    for(let y = 1; y <= ymax; y++) {
        renderLine(grid, xmin, y, xmax, y, "gray");
    }
    for(let y = 1; y <= Math.abs(ymin); y++) {
        renderLine(grid, xmin, -y, xmax, -y, "gray");
    }

    // Draw x lines
    // Draw y axis
    renderLine(grid, 0, ymin, 0, ymax, 'gray', 2);
    // Draw other lines
    for(let x = 1; x <= xmax; x++) {
        renderLine(grid, x, ymin, x, ymax, 'gray');
    }
    for(let x = 1; x <= Math.abs(xmin); x++) {
        renderLine(grid, -x, ymin, -x, ymax, 'gray');
    }
};


const renderPoint = (grid, x, y, color, r) => {
    const ctx = grid.canvas.getContext('2d');
    const rad = r || 3;
    ctx.beginPath();
    ctx.fillStyle = color || "white";
    ctx.arc(...transformCoords(grid, x, y), rad, 0, 2 * Math.PI);
    ctx.fill();
};

const renderLine = (grid, x1, y1, x2, y2, color, width) => {
    const ctx = grid.canvas.getContext('2d');
    // Draw endpoints
    renderPoint(grid, x1, y1, color, 2);
    renderPoint(grid, x2, y2, color, 2);

    ctx.lineWidth = width || 1;
    ctx.beginPath();
    ctx.strokeStyle = color || "white";
    ctx.moveTo(...transformCoords(grid, x1, y1));
    ctx.lineTo(...transformCoords(grid, x2, y2));
    ctx.stroke();
};

const renderExtendedLine = (grid, x1, y1, x2, y2, color) => {
    // TODO later
};
