// ALL ANGLES ARE IN radian

var Point = function(x, y) {
    this.x = x;
    this.y = y;

    this.translate = function(x, y) {
        return new Point(this.x+x, this.y+y);
    }

    this.scale = function(s) {
        return new Point(this.x*s, this.y*s);
    }

    this.rotate = function(angle, x, y) {
        x = x || 0;
        y = y || 0;

        var point = new Point(this.x-x, this.y-y).rotate_about_origin(angle);
        return point.translate(x, y);
    }

    this.rotate_about_origin = function(angle) {
        var r = this.magnitude();
        return new Point(r*Math.cos(angle), r*Math.sin(angle));
    }

    this.magnitude = function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
}

var Circle = function(x, y, r) {
    this.center = new Point(x, y);
    this.r = r;
    this.curr_position = this.center.translate(r, 0); // means angle 0
    this.velocity = 1; //angular velocity

    this.circumference = 2*Math.PI*r;

    this.offset = function(angle) {
        var currpos = this.curr_position;
        this.curr_position = this.curr_position.rotate(angle, this.center.x, this.center.y);
    }

    this.get_position = function(t) {
        this.curr_position = this.curr_position.rotate(this.velocity*t, this.center.x, this.center.y);
        return this.curr_position;
    }
}
