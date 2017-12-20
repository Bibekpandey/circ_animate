const canvas = document.getElementById('flappy');
const context = canvas.getContext('2d');
const scoreElem = document.getElementById('score');

const globalConfig = {
    vertical_spacing: 175,
    horizontal_spacing: 375,
    fps : 60,
    pipes_stored: 5,
    background: 'black',
    ay: 1.3,
    vx: 10,
    pipe_width: 75,
    jump_velocity: 15,
}

class PipePair {
    constructor(x) {
        this.width = 75;
        this.color = 'red';

        const top_height = parseInt(Math.random()*canvas.height/2) + 50;

        this.top_height = top_height;
        this.bottom_height = this.top_height + globalConfig.vertical_spacing;
        this.x = x;
    }

    render() {
        context.fillStyle = this.color;
        context.fillRect(
            this.x,
            0,
            globalConfig.pipe_width,
            this.top_height
        );
        context.fillRect(
            this.x,
            this.bottom_height,
            globalConfig.pipe_width,
            canvas.height - this.bottom_height,
        );
    }
    updatePosition ()  {
        this.x -= globalConfig.vx;
        return this;
    }
};

const colors = ["orange", "skyblue", "maroon", "green", "lightgreen", "blue", "teal", "brown"];

class Bird {
    constructor(config={}) {
        this.chromosome = config.chromosome || {};
        this.alive  = true;
        this.size = config.size || 20;
        this.color = config.color || colors[Math.round(Math.random()*colors.length)];
        this.vx = 10;
        this.vy = config.vy || Math.random()*15;
        this.score = 0;
        this.scoreUpdate = true;
        this.x = config.x || 200;
        this.y = config.y || canvas.height/2;
    }
    render()  {
        context.fillStyle = this.color;
        context.fillRect(this.x,this.y, this.size, this.size);
    }

    decideJump(pipes) {
        // get dx with first pipe
        const dx = pipes[0].x - (this.x + this.size);
        const dy = pipes[0].top_height - this.height;
        const max_horz_diff =  globalConfig.horizontal_spacing;
        const max_vert_diff =  canvas.height;

        const unit = max_horz_diff/this.chromosome.length;
        let gene = parseInt(dx/unit);
        gene = gene < 0 ? 0: gene;
        gene = gene >= this.chromosome.length ? this.chromosome.length-1 : gene;
        //console.log(this.x.toString() + " "+ unit.toString() + " " + max_horz_diff + " " + gene);
        // find which chromosome does dx dy relate to
        return this.chromosome[gene] == 1 ? -globalConfig.jump_velocity:this.vy;
    }

    updatePosition (auto, pipes)  {
        if (! this.alive) {
            // move it outside the screen
            this.y = 0;
            this.color='grey';
            return this;
        }
        if (auto) {
            this.vy = this.decideJump(pipes);
        }
        this.vy += globalConfig.ay;
        this.y += this.vy;
        return this;
    }

    checkCollision (pipes)  {
        if(this.y <=0 || this.y >= canvas.height) {
            this.alive = false;
            return this;
        }
        // check if any of the corner of the bird(rectangle) falls within pipes(check first pipe only)
        const size = this.size;
        let corners = [
            {x: this.x, y:this.y},
            {x: this.x+size, y:this.y+size},
            {x: this.x, y:this.y+size},
            {x: this.x+size, y:this.y},
        ]
        // get first pipe
        const pipe = pipes[0];
        for(let x=0;x<corners.length;x++) {
            if(corners[x].x >= pipe.x && corners[x].x <= pipe.x + globalConfig.pipe_width) {
                if (corners[x].y >= 0 && corners[x].y <= pipe.top_height) {
                    this.alive = false;
                    return this;
                }
                else if (corners[x].y >= pipe.bottom_height && corners[x].y <= canvas.height){
                    this.alive = false;
                    return this;
                }
            }
        }
        this.alive = true;
        return this;
    }
    updateScore (ind) {
        if (this.alive) {
            this.score += 1;
            document.getElementById('bird'+ind+'score').innerHTML = this.score;
        }
        return this;
    }
}

class Game {
    constructor(birds=[], autoplay=false) {
        this.autoplay = autoplay;
        this.over = false;
        this.interval_id = 0;
        this.elements = {
            birds: birds
        };

        // bind all methods
        this.start = this.start.bind(this);
        this.initialize = this.initialize.bind(this);
        this.update = this.update.bind(this);
        this.spawnPipe = this.spawnPipe.bind(this);
        this.renderElements = this.renderElements.bind(this);
        this.renderBackground = this.renderBackground.bind(this);
        //this.checkCollision = this.checkCollision.bind(this);
        this.updateScore = this.updateScore.bind(this);
        this.checkGameOver = this.checkGameOver.bind(this);
        this.getBirds = this.checkGameOver.bind(this);
    }

    getBirds () {
        return this.elements.birds;
    }

    start () {
        this.initialize();
        this.interval_id = setInterval(this.update, globalConfig.fps);
    }

    initialize ()  {
        // first initialize with 5 pipe pairs
        this.counter = 0;
        const pipestart = 2*canvas.width/3;
        this.elements.pipes = Array.from(Array(globalConfig.pipes_stored).keys()).map(
            (x, i) => {
                return new PipePair(pipestart + i*globalConfig.horizontal_spacing)
            }
        );
    }

    update ()  {
        this.elements.birds = this.elements.birds.map((x, i) => x.updatePosition(this.autoplay, this.elements.pipes)); // get new bird with new position
        this.elements.pipes = this.elements.pipes.map((x, i) => x.updatePosition());
        this.spawnPipe();
        this.renderElements();
        this.elements.birds = this.elements.birds.map((x, i) => x.checkCollision(this.elements.pipes));
        this.checkGameOver();
        if (this.over) {
            clearInterval(this.interval_id);
        }
        this.updateScore();
        this.counter +=1;
    }

    spawnPipe ()  {
        if(this.elements.pipes[0].x < -globalConfig.pipe_width) {
            // remove it from the list
            this.elements.pipes.splice(0, 1);
            // add new to last position
            const pipe = new PipePair(
                this.elements.pipes[globalConfig.pipes_stored-2].x + globalConfig.pipe_width + globalConfig.horizontal_spacing
            )
            this.elements.pipes.push(pipe)
            // TODO
            globalConfig.scoreUpdate = true;
        }
    }

    renderElements ()  {
        context.clearRect(0,0, globalConfig.width, globalConfig.height);
        this.renderBackground();

        this.elements.pipes.map(x => x.render());
        this.elements.birds.map(x => x.render());
    }

    renderBackground ()  {
        context.fillStyle = globalConfig.background;
        context.fillRect(0,0, canvas.width, canvas.height);
    }

    checkCollision ()  {
        for(let y in this.elements.birds) {
            let bird = this.elements.birds[y];
            let alive = true;
            if(bird.y <=0 || bird.y >= canvas.height) {
                console.log('outside');
                this.elements.birds[y].alive = false;
                continue;
            }
            // check if any of the corner of the bird(rectangle) falls within pipes(check first pipe only)
            const size = bird.size;
            let corners = [
                {x: bird.x, y:bird.y},
                {x: bird.x+size, y:bird.y+size},
                {x: bird.x, y:bird.y+size},
                {x: bird.x+size, y:bird.y},
            ]
            // get first pipe
            const pipe = this.elements.pipes[0];
            for(let x=0;x<corners.length;x++) {
                if(corners[x].x >= pipe.x && corners[x].x <= pipe.x + globalConfig.pipe_width) {
                    if (corners[x].y >= 0 && corners[x].y <= pipe.top_height) {
                        console.log('collide');
                        this.elements.birds[y].alive = false;
                        break;
                    }
                    else if (corners[x].y >= pipe.bottom_height && corners[x].y <= canvas.height){
                        console.log('collide');
                        this.elements.birds[y].alive = false;
                        console.log(this.elements.birds);
                        break;
                    }
                }
            }
        }
    }

    updateScore () {
        this.elements.birds = this.elements.birds.map((x, i) => x.updateScore(i));
    }

    checkGameOver() {
        this.over = this.elements.birds.reduce(
            (a, e) => a & e,
            true
        );
    }
}
