const Direction = {
    // THIS ORDER IS TO BE MAINTAINED adding 2 mod 4 gives opposite direction
    UP: 0,
    LEFT: 1,
    DOWN: 2,
    RIGHT: 3,
};

const CELL_SIZE = 15;
const ONE_THIRD_CELL = CELL_SIZE / 3;

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const DEFAULT_SNAKE_SIZE = 10;
const DEFAULT_DIRECTION = Direction.RIGHT;
const DEFAULT_SNAKE_COLOR = 'lightgreen';
const DEFAULT_HEAD_COLOR = 'darkgreen';
const DEFAULT_BACKGROUND = 'black';
const FOOD_COLOR = 'orange';


class MethodBinded {
    bindMethods(methods) {
        methods.forEach((method) => {
            this[method] = this[method].bind(this);
        });
    }
}


export class Game extends MethodBinded {
    constructor(canvas, level) {
        super();

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.level = parseInt(level);
        
        this.gridHeight = parseInt(canvas.height / CELL_SIZE);
        this.gridWidth = parseInt(canvas.width / CELL_SIZE);

        this.timeout = null;
        this.state = {};

        this.init();

        this.bindMethods([
            'run', 'init', 'stop', 'render', 'update', 'foodEaten', 'keyHandler',
        ]);
    }

    init () {
        this.state = {
            score: 0,
            snake: new Snake(this.gridWidth, this.gridHeight),
            food: null,
        };
        this.food = null;

        document.getElementById('level-text').innerHTML = this.level;

        document.removeEventListener('keydown', this.keyHandler);
        document.addEventListener('keydown', this.keyHandler.bind(this));
    }

    generateFood(snake) {
        // TODO: break loop
        while(true) {
            const x = parseInt(Math.random() * this.gridWidth);
            const y = parseInt(Math.random() * this.gridHeight);

            const bodyPoints = snake.getCellPositions().filter((xx, yy) => xx == x && yy == y);
            if (bodyPoints.length == 0){
                return [x,y];
            }
        };
    }

    keyHandler(ev) {
        this.state.snake.handleMovement(ev.keyCode);
    }

    foodEaten() {
        const { food } = this.state;
        const snakeHead = this.state.snake.getCellPositions()[0];
        return snakeHead[0] == food[0] && snakeHead[1] == food[1];
    }

    run() {
        this.render();
        this.update();
        if (this.state.snake.collided) {
            alert('Game Over');
            return;
        }
        this.timeout = setTimeout(this.run, 1000/(6*this.level));
    }

    stop() {
        clearTimeout(this.timeout)
    }

    render() {
        clear(this.ctx);
        const { food } = this.state;
        // render food
        if (food) renderCell(this.ctx, ...food, 1, FOOD_COLOR);
        this.state.snake.render(this.ctx);
    }

    update() {
        const { food, snake } = this.state;
        if (food == null) {
            this.state.food = this.generateFood(snake);
        }
        const foodEaten = this.foodEaten();
        if (foodEaten) {
            this.state.food = null;
            this.state.score += this.level;
        }
        document.getElementById('score').innerHTML = this.state.score;
        this.state.snake.update(foodEaten);
    }
}


export class Snake extends MethodBinded {
    constructor(gridWidth, gridHeight) {
        super();
        this.state = {
            size: DEFAULT_SNAKE_SIZE,
            direction: DEFAULT_DIRECTION,
            position: [0, 0], // position of head
            body: Array.from({length: DEFAULT_SNAKE_SIZE - 1 }, (e, i) => DEFAULT_DIRECTION),
        }
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.collided = false;
        this.keyHandled = true;

        this.bindMethods([
            'render', 'update', 'handleMovement', 'getCellPositions',
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
        const headpos = [position[0] + moveUnit[0], position[1] + moveUnit[1]];
        const cells = [headpos];

        // let renderDir = direction + 2 % 4; // if head is up, go to down, if left go right
        let currPos = [position[0] + moveUnit[0], position[1] + moveUnit[1]];
        this.state.body.forEach((elem) => {
            moveUnit = getUnit((elem + 2) % 4); // +2 gives opposite direction
            currPos = [currPos[0]+moveUnit[0], currPos[1]+moveUnit[1]];
            currPos = getModuloPosition(currPos, this.gridWidth, this.gridHeight);
            if (currPos[0] === headpos[0] && currPos[1] === headpos[1]) {
                this.collided = true;
                return;
            }
            cells.push(currPos);
        });
        return cells;
    }

    render(ctx) {
        const cells = this.getCellPositions();
        renderCell(ctx, ...cells[0], 1, DEFAULT_HEAD_COLOR);
        const bodySize = this.state.body.length;
        cells.splice(1).map(
            (cell, i) =>
                renderCell(ctx, ...cell, ((bodySize - i - 1) / bodySize))
        );
    }

    update(foodEaten) {
        const { direction, position, body } = this.state;
        const moveUnit = getUnit(direction);

        let posx = position[0] + moveUnit[0];
        let posy = position[1] + moveUnit[1];

        this.state.position = getModuloPosition([posx, posy], this.gridWidth, this.gridHeight);
        
        this.state.body = [direction, ...body.slice(0, body.length-1)];
        if(foodEaten) {
            this.state.body = [...this.state.body, this.state.body[body.length-1]];
        }
        this.keyHandled = true;
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
