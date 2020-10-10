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

// of the form ax + by = c
const renderLineEq = (grid, a, b, c, color, width) => {
    if(a == 0 && b == 0) {
        return;
    } else if(a == 0) {
        // render horizontal line
        renderLine(grid, grid.xrange[0], c/b, grid.xrange[1], c/b, color, width);
    } else if(b == 0) {
        // render vertical line
        renderLine(grid, c/a, grid.yrange[0], c/a, grid.yrange[1], color, width);
    } else {
        const y1 = (c - a * grid.xrange[0]) / b;
        const y2 = (c - a * grid.xrange[1]) / b;
        renderLine(grid, grid.xrange[0], y1, grid.xrange[1], y2, color, width);
    }
    console.warn('lineq');
};

const getLineEq = (x1, y1, x2, y2) => {
    const dx = x2-x1;
    const dy = y2-y1;
    return {
        a: -dy,
        b: dx,
        c: y1*dx - x1*dy,
    };
};

const renderExtendedLine = (grid, x1, y1, x2, y2, color, width) => {
    const lineEq = getLineEq(x1, y1, x2, y2);
    renderLineEq(grid, lineEq.a, lineEq.b, lineEq.c, color, width);
};

const renderPolygon = (grid, points, color) => {
    const ctx = grid.canvas.getContext('2d');
    const [first, ...rest] = points;
    ctx.fillStyle = color || '#22ff2225';
    ctx.beginPath();
    ctx.moveTo(...transformCoords(grid, ...first));
    rest.map(x => ctx.lineTo(...transformCoords(grid, ...x)));
    ctx.closePath();
    ctx.fill();
};

const renderPolygonOutline = (grid, points, color, lineWidth) => {
    const ctx = grid.canvas.getContext('2d');
    const [first, ...rest] = points;
    ctx.strokeStyle = color || 'skyblue';
    ctx.lineWidth = lineWidth || 2;
    ctx.beginPath();
    ctx.moveTo(...transformCoords(grid, ...first));
    rest.map(x => ctx.lineTo(...transformCoords(grid, ...x)));
    ctx.closePath();
    ctx.stroke();
};
