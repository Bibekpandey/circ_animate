function Grid(canvasid) {
    this.cols = 100; // TODO: from parameters
    this.rows = 100; // TODO: from parameters
    this.grid_size = 32; // 32 px grid size
    this.color = "red";
    this.fps = 60;

    this.initialize = function() {
        this.canvas = document.getElementById(canvasid);
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.context = this.canvas.getContext('2d');
        this.elements = new Array(this.cols*this.rows);
        this.position = {x:this.cols/2,y:this.rows/2};
        this.context.fillStyle="#aaaaaa"; // light grey
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);

        this.setCell({x:0, y:0}, 'blue');
    }

    var position = function(pos) { // translate origin to center
        return {x:pos.x+this.canvas.width/2, y:-pos.y+this.canvas.height/2};
    }

    this.setCell = function(pos, color) {
        this.context.fillStyle = color || this.color;
        var x1 = pos.x*this.grid_size;
        var y1 = pos.y*this.grid_size;
        var newpos = position({x:x1, y:y1});
        this.context.fillRect(newpos.x,newpos.y, this.grid_size,this.grid_size);
    }

    var renderGrid = function() {
    }
    return this;
}
