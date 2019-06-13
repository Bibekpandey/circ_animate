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

const BONUS_FOOD_TIMEOUT = 100;


class Game extends MethodBinded {
    constructor(canvas, level) {
        super();

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.level = parseInt(level);
        
        this.gridHeight = parseInt(canvas.height / CELL_SIZE);
        this.gridWidth = parseInt(canvas.width / CELL_SIZE);

        this.timeout = null;

        this.init();

        this.bindMethods([
            'run', 'init', 'stop', 'render', 'update',
            'foodEaten', 'keyHandler', 'upClick', 'downClick',
            'leftClick', 'rightClick', 'cleanUp', 'generateFood',
        ]);
    }

    init() {
        this.state = {
            time: 0,
            score: 0,
            snake: new Snake(this.ctx, this.gridWidth, this.gridHeight),
            food: [],
            highscore: parseInt(localStorage.getItem('highscore') || 0),
        };

        document.getElementById('level-text').innerHTML = this.level;

        this.cleanUp();

        document.addEventListener('keydown', this.keyHandler.bind(this));

        document.getElementById('up-button').addEventListener('click', this.upClick.bind(this));
        document.getElementById('down-button').addEventListener('click', this.downClick.bind(this));
        document.getElementById('left-button').addEventListener('click', this.leftClick.bind(this));
        document.getElementById('right-button').addEventListener('click', this.rightClick.bind(this));
    }

    cleanUp() {
        document.removeEventListener('keydown', this.keyHandler);

        document.getElementById('up-button').removeEventListener('click', this.upClick);
        document.getElementById('down-button').removeEventListener('click', this.downClick);
        document.getElementById('left-button').removeEventListener('click', this.leftClick);
        document.getElementById('right-button').removeEventListener('click', this.rightClick);
    }

    generateFood(snake) {
        const food = [];

        while(true) {
            const x = randomInt(this.gridWidth);
            const y = randomInt(this.gridHeight);

            const bodyPoints = snake.getCellPositions().filter((xx, yy) => xx == x && yy == y);
            if (bodyPoints.length == 0){
                food.push(new Food(this.ctx, [x,y], this.level, this.state.time));
                break;
            }
        };
        // After every 10 food eaten, generate a bonus food
        if(parseInt(this.state.score/this.level) % 10 == 0) {
            while(true) {
                const x = randomInt(this.gridWidth-1);
                const y = randomInt(this.gridHeight-1);

                const bodyPoints = snake.getCellPositions().filter(
                    (xx, yy) => Math.abs(xx - x) <= 2 && Math.abs(yy - y) <= 2
                );
                if (bodyPoints.length == 0){
                    food.push(new Food(this.ctx, [x, y], this.level*3, this.state.time, 'BONUS'));
                    break;
                }
            }
        }
        return food;
    }

    upClick() {
        this.state.snake.handleMovement(KEY_UP);
    }

    downClick() {
        this.state.snake.handleMovement(KEY_DOWN);
    }

    leftClick() {
        this.state.snake.handleMovement(KEY_LEFT);
    }

    rightClick() {
        this.state.snake.handleMovement(KEY_RIGHT);
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
            if(this.state.score > this.state.highscore) {
                localStorage.setItem('highscore', this.state.score);
            }
            alert('Game Over');
            return;
        }
        this.timeout = setTimeout(this.run, 1000/(6*this.level));
    }

    stop() {
        this.cleanUp();
        if(this.state.score > this.state.highscore) {
            localStorage.setItem('highscore', this.state.score);
        }
        clearTimeout(this.timeout)
    }

    render() {
        clear(this.ctx);
        const { food, time } = this.state;

        // render food
        if (food) food.map(x => x.render(time));

        this.state.snake.render(time);
    }

    update(time) {
        const { food, snake } = this.state;

        if (food.length == 0) {
            this.state.food = [
                ...this.generateFood(snake),
                ...this.state.food,
            ];
        }

        const snakePosistions = snake.getCellPositions();
        const headPos = snakePosistions[0];

        const [score, foodNotEaten] = this.state.food.reduce((acc, food) => {
            const [score, notEatenFood] = acc;
            if(food.isTimedOut(this.state.time)) {
                return [score, notEatenFood];
            }
            if(!food.isEaten(headPos)) {
                return [score, [...notEatenFood, food]];
            }
            else {
                return [score + food.points, notEatenFood];
            }
        }, [0, []]);
        
        this.state.food = foodNotEaten;
        this.state.score += score;
        document.getElementById('score').innerHTML = this.state.score;
        this.state.snake.update(score);
        this.state.time += 1;
    }
}
