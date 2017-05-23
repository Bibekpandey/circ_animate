function Grid(canvasid, rule) {
    var UP=0,LEFT=1,DOWN=2,RIGHT=3;
    var cols = 2; // TODO: from parameters
    var rows = 2; // TODO: from parameters
    var grid_size = 32; // 32 px grid size
    this.fps = 60;
    var pos = {x:0,y:0};
    var dir = UP;
    this.state = 0;

    var canvas, context, elements;

    var color = ['white', 'red'];
    this.printelements = function() {
        console.log(elements);
    }

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
        elements[1] = 1;
        //setInterval(this.update, 2000);
    }
    this.renderElements = function() {
        for(var x=0;x<elements.length;x++) {
            renderNth(x);
        }
    }

    this.doubleSize = function() {
        grid_size/=2;
        var oldcols = cols;
        var oldrows = rows;
        cols*=2;
        rows*=2;
        var new_elements = new Array(cols*rows);

        // first set all to zero
        for(var i=0;i<rows*cols;i++) new_elements[i] = 0;

        // copy old elements
        for(var y=0;y<oldrows;y++) {
            for(var x=0;x<oldcols;x++) {
                var oldindex = y*oldcols+x;
                var newindex = (oldcols/2+y)*cols + oldrows/2+x;
                new_elements[newindex] = elements[oldindex];
            }
        }
        elements = new_elements;

        var oldpos = pos;
        pos = {x:oldcols/2+oldpos.x,y:oldrows/2+y};

        var olddir = dir;
        // render old elements
        // clear first
        context.fillStyle="#aaaaaa"; // light grey
        context.fillRect(0,0,canvas.width, canvas.height);
        // now fill elements
        for(var y=0;y<oldrows;y++) {
            for(var x=0;x<oldcols;x++) {
                var newindex = (oldcols/2+y)*cols + oldrows/2+x;
                var state = elements[newindex];
                var p = {x:oldcols/2+x, y:oldrows/2+y};
                renderCell(p, state);
            }
        }
    }

    this.renderNth = function (index) {
        // first get position of the indexed elem
        var x = index%cols;
        var y = parseInt(index/cols);
        console.log('render', x,y, elements[index]);
        renderCell({x:x,y:y}, elements[index]);
    }

    var position = function(pos) { // translate origin to center
        return {x:pos.x+canvas.width/2, y:-pos.y+canvas.height/2};
    }

    function renderCell(pos, state) {
        context.fillStyle = color[state];
        var x1 = pos.x*grid_size;
        var y1 = pos.y*grid_size;
        console.log('cell', x1, y1, grid_size);
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

    function checkBoundary() {
        // TODO: check if ant hits boundary
        return false;
    }

    this.update = function() {
        var state = getState(pos);
        var newstate = rule[state].state;
        var dirn;
        renderCell(pos, newstate);
        setState(pos, newstate);
        var move = rule[state].move;
        direction[move]();

        // check if boundary
        if(checkBoundary()) {
            doubleSize();
        }
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
