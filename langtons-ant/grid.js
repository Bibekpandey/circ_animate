function Grid(canvasid, rule, state_map) {
    var UP=0,LEFT=1,DOWN=2,RIGHT=3;
    var cols = 33; // TODO: from parameters
    var rows = 33; // TODO: from parameters
    var grid_size = 16; // 32 px grid size
    this.fps = 60;
    var pos = {x:0,y:0};
    var dir = UP;
    this.state = 0;
    var h2 = document.getElementById('counter');
    var time = 5; // milli seconds
    var MAXDOUBLE = 2;
    var double = 0;
    var interval_func;

    var canvas, context, elements;
    var reverse_state_map = {
    };
    // create reverse map;
    for(k in state_map) reverse_state_map[state_map[k]] = k;

    this.counter = 0;

    this.initialize = function() {
        'use strict';
        canvas = document.getElementById(canvasid);
        canvas.height = rows*grid_size;
        canvas.width = cols*grid_size;
        context = canvas.getContext('2d');
        elements = new Array(cols*rows);
        for(var x=0;x<elements.length;x++)elements[x]=0;
        context.fillStyle="white";
        context.fillRect(0,0,canvas.width, canvas.height);
        interval_func = setInterval(this.update, time);
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
        cols = cols*2-1;
        rows = rows*2-1;
        var new_elements = new Array(cols*rows);
        canvas.height = rows*grid_size;
        canvas.width = cols*grid_size;
        // first set all to zero
        for(var i=0;i<rows*cols;i++) new_elements[i] = 0;

        // copy old elements
        for(var y=0;y<oldrows;y++) {
            for(var x=0;x<oldcols;x++) {
                var oldindex = y*oldcols+x;
                var newindex = (parseInt(oldcols/2)+y)*cols + parseInt(oldrows/2)+x;
                new_elements[newindex] = elements[oldindex];
            }
        }
        elements = new_elements;
        return;

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

    function translateCoord(x,y) {
        var a = {x:x-parseInt(cols/2), y:parseInt(rows/2)-y};
        //console.log('translated', x, y, a);
        return a;
    }

    this.renderNth = function (index) {
        // first get position of the indexed elem
        var x = index%cols;
        var y = parseInt(index/cols);
        renderCell(translateCoord(x,y), elements[index]);
    }

    var position = function(pos) { // translate origin to center
        //console.log('position', pos);
        return {x:pos.x+canvas.width/2-grid_size/2, y:-pos.y+canvas.height/2-grid_size/2};
    }

    function renderCell(pos, state, col) {
        context.fillStyle = col || reverse_state_map[state];
        var x1 = pos.x*grid_size;
        var y1 = pos.y*grid_size;
        var newpos = position({x:x1, y:y1});
        //console.log(pos, 'NEWPOS', newpos);
        context.fillRect(newpos.x,newpos.y, grid_size, grid_size);
    }

    function moveLeft() {
        //console.log('moveleft');
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
    }

    function moveRight() {
        //console.log('moveirhgt');
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
    }

    function getState(pos) {
        return elements[(parseInt(rows/2)-pos.y)*cols+parseInt(cols/2)+pos.x];
    }

    function setState(pos, state) {
        elements[(parseInt(rows/2)-pos.y)*cols+parseInt(cols/2)+pos.x] = state;
    }

    function checkBoundary() {
        'use strict';
        if(Math.abs(pos.x)>parseInt(cols/2) || Math.abs(pos.y)>parseInt(rows/2)) {
            //alert('doubling');
            return true;
        }
        return false;
    }

    this.update = function() {
        h2.innerHTML = this.counter;
        this.counter++;
        //console.log('update, pos', pos);
        var state = reverse_state_map[getState(pos)];
        //console.log('update, state', state);
        var newstate = rule[state].state;
        var dirn;
        renderCell(pos, state_map[newstate]);
        setState(pos, state_map[newstate]);
        var move = rule[state].move;
        direction[move]();
        renderCell(pos, 0,'black');

        // check if boundary
        if(checkBoundary()) {
            if(double>MAXDOUBLE) {
                alert('THATS IT BRUH!!');
                clearInterval(interval_func);
                return;
            }
            this.doubleSize();
            double++;
            this.renderElements();
        }
    }

    this.stop = function() {
        clearInterval(interval_func);
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
