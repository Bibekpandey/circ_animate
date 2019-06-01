const Direction = {
    // THIS ORDER IS TO BE MAINTAINED adding 2 mod 4 gives opposite direction
    UP: 0,
    LEFT: 1,
    DOWN: 2,
    RIGHT: 3,
};

const CELL_SIZE = 15;

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const DEFAULT_SNAKE_SIZE = 10;
const DEFAULT_DIRECTION = Direction.RIGHT;


export class Game {
    constructor(canvas, level) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.level = parseInt(level);
        this.state = {
            points: 0,
        };
        this.gridHeight = parseInt(canvas.height / CELL_SIZE);
        this.gridWidth = parseInt(canvas.width / CELL_SIZE);

        this.snake = new Snake(this.gridWidth, this.gridHeight);

        this.food = null;
        this.score = 0;

        this.timeout = null;

        this.run = this.run.bind(this);
        this.stop = this.stop.bind(this);
        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
        this.foodEaten = this.foodEaten.bind(this);
        this.keyHandler = this.keyHandler.bind(this);

        document.removeEventListener('keydown', this.keyHandler);

        document.addEventListener('keydown', this.keyHandler);
    }

    generateFood(snake) {
        // TODO: break loop
        while(true) {
            const x = -this.gridWidth/2 + parseInt(Math.random() * this.gridWidth);
            const y = -this.gridHeight/2 + parseInt(Math.random() * this.gridHeight);

            const bodyPoints = snake.getCellPositions().filter((xx, yy) => xx == x && yy == y);
            if (bodyPoints.length == 0){
                return [x,y];
            }
        };
    }

    keyHandler(ev) {
        this.snake.handleMovement(ev.keyCode);
    }

    foodEaten() {
        const snakeHead = this.snake.getCellPositions()[0];
        return snakeHead[0] == this.food[0] && snakeHead[1] == this.food[1];
    }

    run() {
        this.render();
        this.update();
        if (this.snake.collided) {
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
        this.fillStyle = 'white';

        // render food
        if (this.food) renderCell(this.ctx, ...this.food, 'blue');
        this.snake.render(this.ctx);
    }

    update() {
        if (this.food == null) {
            this.food = this.generateFood(this.snake);
        }
        const foodEaten = this.foodEaten();
        if (foodEaten) {
            this.food = null;
            this.score += this.level;
        }
        document.getElementById('score').innerHTML = this.score;
        this.snake.update(foodEaten);
    }
}


export class Snake {
    constructor(gridWidth, gridHeight) {
        this.state = {
            size: DEFAULT_SNAKE_SIZE,
            speed: 1, // 1 cell per second
            direction: DEFAULT_DIRECTION,
            position: [0, 0], // position of head
            body: Array.from({length: DEFAULT_SNAKE_SIZE - 1 }, (e, i) => DEFAULT_DIRECTION),
        }
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.collided = false;

        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
        this.handleMovement = this.handleMovement.bind(this);
    }

    hasCollided() {
        return false;
    }

    handleMovement(key) {
        let dir = -1;
        if (key == KEY_LEFT) dir = Direction.LEFT;
        else if (key == KEY_RIGHT) dir = Direction.RIGHT;
        else if (key == KEY_UP) dir = Direction.UP;
        else if (key == KEY_DOWN) dir = Direction.DOWN;

        const { direction, body, position } = this.state;
        const dirPlus1 = direction + 1;
        const dirMinus1 = direction + 3;

        if (dir < 0 || (dirPlus1 % 4 !== dir) && (dirMinus1 % 4 !== dir)) {
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
        renderCell(ctx, ...cells[0], 'red');
        cells.splice(1).map(cell => renderCell(ctx, ...cell));
    }

    update(foodEaten) {
        const { direction, position, body } = this.state;
        const moveUnit = getUnit(direction);

        let posx = position[0] + moveUnit[0];
        let posy = position[1] + moveUnit[1];

        if (posx * 2 >= this.gridWidth) posx = posx - this.gridWidth;
        if (posx * 2 <= -this.gridWidth) posx = posx + this.gridWidth;

        if (posy * 2 >= this.gridHeight) posy = posy - this.gridHeight;
        if (posy * 2 <= -this.gridHeight) posy = posy + this.gridHeight;

        this.state.position = [posx, posy];
        
        this.state.body = [direction, ...body.slice(0, body.length-1)];
        if(foodEaten) {
            this.state.body = [...this.state.body, this.state.body[body.length-1]];
        }
    }
}

function getUnit(direction) {
    if (direction == Direction.LEFT) return [-1, 0];
    if (direction == Direction.RIGHT) return [1, 0];
    if (direction == Direction.UP) return [0, 1];
    if (direction == Direction.DOWN) return [0, -1];
    return [0, 0];
}


function clear(ctx, bg='white') {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}


function renderCell(ctx, posX, posY, color='black', cellW=CELL_SIZE, cellH=CELL_SIZE) {
    // NOTE: center is 0,0, with +y up and +x right
    ctx.fillStyle = color;
    const { width, height } = ctx.canvas;
    const position = [
        posX * cellW + width / 2 + 1,
        -posY*cellH + height / 2 + 1
    ];
    ctx.fillRect(...position, cellW - 1, cellH - 1);
}
