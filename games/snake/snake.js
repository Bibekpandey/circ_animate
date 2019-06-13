
class Snake extends MethodBinded {
    constructor(ctx, gridWidth, gridHeight) {
        super();
        this.state = {
            size: DEFAULT_SNAKE_SIZE,
            direction: DEFAULT_DIRECTION,
            position: [0, 0], // position of head
            body: Array.from({length: DEFAULT_SNAKE_SIZE - 1 }, (e, i) => DEFAULT_DIRECTION),
        }
        this.ctx = ctx;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.collided = false;
        this.keyHandled = true;

        this.bindMethods([
            'render', 'update', 'getCellPositions',
            'handleMovement',
        ]);
    }

    hasCollided() {
        return false;
    }

    handleMovement(key) {
        if (!this.keyHandled) return;

        this.keyHandled = false;

        let dir = -1;
        if (key == KEY_LEFT) dir = Direction.LEFT;
        else if (key == KEY_RIGHT) dir = Direction.RIGHT;
        else if (key == KEY_UP) dir = Direction.UP;
        else if (key == KEY_DOWN) dir = Direction.DOWN;

        const { direction, body, position } = this.state;
        const dirPlus1 = direction + 1;
        const dirMinus1 = direction + 3;

        if (dir < 0 || (dirPlus1 % 4 !== dir) && (dirMinus1 % 4 !== dir)) {
            this.keyHandled = true;
            return;
        }

        const moveUnit = getUnit(dir);
        this.state = {
            ...this.state,
            direction: dir,
            body:[dir, ...body.slice(1)]
        };
    }

    getCellPositions() {
        const { position, direction } = this.state;
        let moveUnit = getUnit(direction);
        const headpos = getModuloPosition(
            [position[0] + moveUnit[0], position[1] + moveUnit[1]],
            this.gridWidth, this.gridHeight,
        );
        const cells = [headpos];

        // let renderDir = direction + 2 % 4; // if head is up, go to down, if left go right
        let currPos = [position[0] + moveUnit[0], position[1] + moveUnit[1]];
        this.state.body.forEach((elem) => {
            moveUnit = getUnit((elem + 2) % 4); // +2 gives opposite direction
            currPos = [currPos[0]+moveUnit[0], currPos[1]+moveUnit[1]];
            currPos = getModuloPosition(currPos, this.gridWidth, this.gridHeight);
            if (currPos[0] === headpos[0] && currPos[1] === headpos[1]) {
                this.collided = true;
            }
            cells.push(currPos);
        });
        return cells;
    }

    renderHead(ctx, position) {
        renderCell(ctx, ...position, 1, DEFAULT_HEAD_COLOR);
        // TODO: Make eyes
    }

    render() {
        const cells = this.getCellPositions();
        this.renderHead(this.ctx, cells[0]);
        const bodySize = this.state.body.length;
        cells.splice(1).map(
            (cell, i) =>
                renderCell(this.ctx, ...cell, ((bodySize - i - 1) / bodySize))
        );
    }

    update(score) {
        const { direction, position, body } = this.state;
        const moveUnit = getUnit(direction);

        let posx = position[0] + moveUnit[0];
        let posy = position[1] + moveUnit[1];

        this.state.position = getModuloPosition([posx, posy], this.gridWidth, this.gridHeight);
        
        this.state.body = [direction, ...body.slice(0, body.length-1)];
        // Whatever the score, increases by one for now
        if(score > 0) {
            this.state.body = [...this.state.body, this.state.body[body.length-1]];
        }
        this.keyHandled = true;
    }
}
