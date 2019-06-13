class MethodBinded {
    bindMethods(methods) {
        methods.forEach((method) => {
            this[method] = this[method].bind(this);
        });
    }
}

function getUnit(direction) {
    if (direction == Direction.LEFT) return [-1, 0];
    if (direction == Direction.RIGHT) return [1, 0];
    if (direction == Direction.UP) return [0, -1];
    if (direction == Direction.DOWN) return [0, 1];
    return [0, 0];
}


function getModuloPosition(position, gridWidth, gridHeight) {
    let [posx, posy] = position;
    return [(posx + gridWidth) % gridWidth, (posy + gridHeight) % gridHeight];
}


function clear(ctx, bg=DEFAULT_BACKGROUND) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}


function renderCell(ctx, posX, posY, ratio=1, color=DEFAULT_SNAKE_COLOR, cellW=CELL_SIZE, cellH=CELL_SIZE) {
    // NOTE: top left is 0,0, with +y down and +x right
    ctx.fillStyle = color;
    const { width, height } = ctx.canvas;
    const cellSize = ONE_THIRD_CELL + (cellW - ONE_THIRD_CELL) * ratio;
    const position = [
        posX * cellW + (cellW - cellSize) / 2,
        posY*cellH + (cellH - cellSize) / 2,
    ];
    ctx.fillRect(...position, cellSize - 1, cellSize - 1);
}

function randomInt(maxval) {
    return parseInt(Math.random() * maxval);
}
