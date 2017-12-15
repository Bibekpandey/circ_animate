const canvas = document.getElementById('flappy');
const context = canvas.getContext('2d');

const globals = {
    game_running: false,
    vertical_spacing: 175,
    gravity: 10,
    horizontal_spacing: 375,
    background: 'black',
    total_pipes: 5,
    counter: 0,
    width: canvas.width,
    height: canvas.height,
    pipe_width: 75,
    interval_id: 0,
    bird_size: 20,
    bird_color: 'green',
    pipe_color: 'red',
    speed: 20,
    vx: 10,
    vy: 10,
    ay: 1.7
};

const elements = {
    pipes: [],
    bird: {
        x: 100,
        y: 100,
    },
};


function start () {
    globals.game_running=true;
    initialize();
    globals.interval_id = setInterval(update, 1000/globals.speed);
}

function initialize() {
    elements.pipes = [];
    elements.bird = {x:100, y:100};
    // first initialize with 5 pipe pairs
    elements.pipes = Array.from(Array(globals.total_pipes).keys()).map(
        (x, i) => get_pipes_pair(i)
    );
}

function get_pipes_pair(x) {
    const top_height = parseInt(Math.random()*globals.height/2) + 50;
    return {
        top_height: top_height,
        bottom_height: top_height + globals.vertical_spacing,
        x_pos: globals.width - globals.pipe_width + x*globals.horizontal_spacing,
    }
}

function update() {
    updateBirdPosition();
    updatePipesPosition();
    spawnPipe();
    renderElements();
    if (checkCollision()) {
        clearInterval(globals.interval_id);
        globals.game_running = false;
        return;
    }
    //requestAnimationFrame(update);
}

function spawnPipe() {
    if(elements.pipes[0].x_pos < -globals.pipe_width) {
        // remove it from the list
        elements.pipes.splice(0, 1);
        // add new to last position
        elements.pipes.push(get_pipes_pair(globals.total_pipes-1));
    }
}

function renderElements() {
    context.clearRect(0,0, globals.width, globals.height);
    renderBackground();

    renderBird();
    renderPipes();
}

function renderBackground() {
    context.fillStyle = globals.background;
    context.fillRect(0,0, canvas.width, canvas.height);
}

function renderBird() {
    context.fillStyle = globals.bird_color;
    context.fillRect(elements.bird.x,elements.bird.y, globals.bird_size, globals.bird_size);
}

function renderPipes() {
    for (let x=0;x<elements.pipes.length;x++) {
        renderPipe(elements.pipes[x]);
    }
}

function renderPipe(pipe) {
    context.fillStyle = globals.pipe_color;
    context.fillRect(pipe.x_pos,0, globals.pipe_width, pipe.top_height);
    context.fillRect(pipe.x_pos, pipe.bottom_height, globals.pipe_width, globals.height, pipe.bottom_height);
}

function checkCollision() {
    if(elements.bird.y <=0 || elements.bird.y >= globals.height) return true;
    // check if any of the corner of the bird(rectangle) falls within pipes(check first pipe only)
    const size = globals.bird_size;
    let corners = [
        {x: elements.bird.x, y:elements.bird.y},
        {x: elements.bird.x+size, y:elements.bird.y+size},
        {x: elements.bird.x, y:elements.bird.y+size},
        {x: elements.bird.x+size, y:elements.bird.y},
    ]
    // get first pipe
    const pipe = elements.pipes[0];
    for(let x=0;x<corners.length;x++) {
        if(corners[x].x >= pipe.x_pos && corners[x].x <= pipe.x_pos + globals.pipe_width) {
            if (corners[x].y >= 0 && corners[x].y <= pipe.top_height) return true;
            if (corners[x].y >= pipe.bottom_height && corners[x].y <= globals.height) return true;
        }
    }
    return false;
}

function updateBirdPosition() {
    globals.vy += globals.ay;
    elements.bird.y += globals.vy;
}

function updatePipesPosition() {
    for (let x=0;x<elements.pipes.length;x++) {
        elements.pipes[x].x_pos -= globals.vx;
    }
}
