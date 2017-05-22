function Grid(canvasid, rule) {
    var UP=0,LEFT=1,DOWN=2,RIGHT=3;
    var cols = 20; // TODO: from parameters
    var rows = 20; // TODO: from parameters
    var grid_size = 32; // 32 px grid size
    this.fps = 60;
    var pos = {x:0,y:0};
    var dir = UP;
    this.state = 0;

    var canvas, context, elements;

    var color = ['white', 'red'];

    this.initialize = function() {
        'use strict';
        canvas = document.getElementById(canvasid);
        canvas.height = rows*grid_size;
        canvas.width = cols*grid_size;
        context = canvas.getContext('2d');
        elements = new Array(cols*rows);
        for(var x=0;x<elements.length;x++)elements[x]=0;
        context.fillStyle="#aaaaaa"; // light grey
        context.fillRect(0,0,canvas.width, canvas.height);
        setInterval(this.update, 20);
    }

    function doublesize() {
        grid_size/=2;
        cols*=2;
        rows*=2;
        var new_elements = new Array(cols*rows);
        for(var x=0;x<new_elements.length;x++) {
            if(x<elements.length) {
                new_elements[x]=elements[x];
            }
            else new_elements[x] = 0;
        }
        var oldpos = pos;
        var olddir = dir;
        // render old elements
        // clear first
        context.fillStyle="#aaaaaa"; // light grey
        context.fillRect(0,0,canvas.width, canvas.height);
        // now fill elements
        for(var x=0;x<elements.length;x++) {
            renderNth(x);
        }

        elements = new_elements;
    }

    function renderNth(index) {
        // first get position of the indexed elem
    }

    var position = function(pos) { // translate origin to center
        return {x:pos.x+canvas.width/2, y:-pos.y+canvas.height/2};
    }

    function renderCell(pos, state) {
        context.fillStyle = color[state];
        var x1 = pos.x*grid_size;
        var y1 = pos.y*grid_size;
        var newpos = position({x:x1, y:y1});
        context.fillRect(newpos.x,newpos.y, grid_size, grid_size);
    }

    function moveLeft() {
        console.log('moveleft');
        if(dir == UP) {
            pos.x-=1;
            dir = LEFT;
        }
        else if(dir == LEFT) {
            pos.y-=1;
            dir = DOWN;
        }
        else if(dir == DOWN) {
            pos.x+=1;
            dir = RIGHT;
        }
        else if(dir == RIGHT) {
            pos.y+=1;
            dir = UP;
        }
        else console.log('no match');
    }

    function moveRight() {
        console.log('moveirhgt');
        if(dir == UP) {
            pos.x+=1;
            dir = RIGHT;
        }
        else if(dir == RIGHT) {
            pos.y-=1;
            dir = DOWN;
        }
        else if(dir == DOWN) {
            pos.x-=1;
            dir = LEFT;
        }
        else if(dir == LEFT) {
            pos.y+=1;
            dir = UP;
        }
        else console.log('no match');
    }

    function getState(pos) {
        return elements[(rows/2-pos.y)*cols+cols/2+pos.x];
    }

    function setState(pos, state) {
        elements[(rows/2-pos.y)*cols+cols/2+pos.x] = state;
    }

    this.update = function() {
        var state = getState(pos);
        console.log('oldstate', state);
        console.log('oldpos', pos);
        console.log('olddir', dir);
        var newstate = rule[state].state;
        var dirn;
        renderCell(pos, newstate);
        setState(pos, newstate);
        console.log('newstate', getState(pos));
        var move = rule[state].move;
        console.log('move', move);
        direction[move]();
        console.log('newpos', pos);
        console.log('newdir', dir);
        console.log();
    }

    var renderGrid = function() {
    }
    var direction = {
        'left': moveLeft,
        'right': moveRight,
        //'forward': moveForward,
    };
    return this;
}
