// ALL ANGLES ARE IN radian

var Point = function(x, y) {
    this.x = x;
    this.y = y;
};

Point.prototype = {
    constructor: Point,
    difference: function(x, y) {
        return new Point(this.x-x, this.y-y);
    },

    translate : function(x, y) {
        return new Point(this.x+x, this.y+y);
    },

    scale : function(s) {
        return new Point(this.x*s, this.y*s);
    },

    rotate : function(angle, x, y) {
        //x = x || 0;
        //y = y || 0;

        var newp = new Point(this.x-x, this.y-y);
        var point = newp.rotate_about_origin(angle);
        return point.translate(x, y);
    },

    rotate_about_origin : function(angle) {
        var x = this.x, y=this.y;
        var curr_angle = x==0?Math.PI/2:Math.atan(y/x);
        if(x<0 && y<0) curr_angle+=Math.PI;
        if(x<0 && y>0) curr_angle+=Math.PI;
        var r = this.magnitude();
        return new Point(r*Math.cos(angle+curr_angle), r*Math.sin(angle+curr_angle));
    },

    magnitude : function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    },
};

var Circle = function(x, y, r) {
    this.child = null;
    this.surface = null;
    this.center = new Point(x, y);
    this.point_position = this.center.translate(r, 0);
    this.curr_center = new Point(x, y);
    this.r = r;
    this.curr_point_position = this.curr_center.translate(r, 0);
    this.velocity = 1;
    this.point_velocity = 1;


    /*this.previous_center = new Point(x, y);*/
    //this.current_center = new Point(x, y);
    //this.r = r;
    //this.curr_point_position = this.current_center.translate(r, 0); // means angle 0
    /*this.new_point_position = null;*/
    this.velocity = 1; //angular velocity

    this.circumference = 2*Math.PI*r;

    this.surface = null;
};

Circle.prototype = {
    constructor: Circle,

    point_offset : function(angle) {
        var currpos = this.curr_point_position;
        this.curr_point_position = currpos.rotate(angle, this.curr_center.x, this.curr_center.y);
    },

    offset : function(x, y) {
    },

    get_position : function(dt) {
        if (this.surface !=null)
            return this.surface.get_point_position(dt);
        else return this.curr_center;
    },

    get_point_position : function(dt) {
        //this.get_position(); // updates center's position
        var centerpos = this.curr_center;
        var angle = this.point_velocity*dt;
        this.point_position = this.point_position.rotate(angle, this.center.x, this.center.y);
        var currpos = this.curr_point_position;
        var d_centerpos = this.curr_center.difference(this.center.x, this.center.y);
        return this.point_position.translate(d_centerpos.x, d_centerpos.y);
        return currpos.rotate(angle, centerpos.x, centerpos.y);
    },

    update_position : function(dt) {
        this.curr_center = this.get_position(dt);
    },

    update_point_position : function(dt) {
        this.curr_point_position = this.get_point_position(dt);
    },

    set_surface: function(surface) {
        this.surface = surface;
        surface.curr_point_position = this.surface.curr_point_position = this.curr_center;
        surface.point_velocity = this.surface.point_velocity = this.velocity;
    },
    set_child: function(shape) {
        shape.surface = this;
        this.curr_point_position = shape.curr_center;
        this.point_velocity = shape.velocity;
    },
    render: function(ctx) {
        // draw circle here
        ctx.beginPath();
        ctx.arc(this.curr_center.x, this.curr_center.y, this.r, 2*Math.PI, false);
        ctx.stroke();
        ctx.closePath();
    }
}

var Plane = function(x1,y1,x2,y2) {
    this.velocity = 15;
    this.start = new Point(x1, y1);
    this.end = new Point(x2, y2);
    this.curr_position = new Point(x1,y1);
    this.new_position = null;
    this.dy = y2-y1;
    this.dx = x2-x1;
    this.vector = new Point(this.dx, this.dy);
    var mag = this.vector.magnitude();
    this.vector.x/=mag;
    this.vector.y/=mag;
    this.surface = null;
}

Plane.prototype = {
    constructor: Plane,
    offset: function(point) {
        this.curr_position = this.curr_position.translate(point.x, point.y);
    },
    get_position : function(t) {
        var scaled = this.vector.scale(t*this.velocity);
        var surface_point = this.surface!=null?this.surface.get_position(t):new Point(0,0);
        this.new_position = this.curr_position.translatee(scaled.x, scaled.y);
        return this.new_position.translate(surface_point.x, surface_point.y);
    },

    update_position : function() {
        this.curr_position = this.new_position;
    },
    set_surface : function(surface) {
        this.surface = surface;
    },
    render: function(t, ctx) {
        var pt = new Point(0,0);
        if(this.surface != null) {
            pt = this.surface.get_position(t);
        }
        var p1 = this.start.translate(pt.x, pt.y);
        var p2 = this.p2.translate(pt.x, pt.y);
        // draw line here
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.closePath();
    }
}
