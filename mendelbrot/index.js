function getImageData(ctx, width, height, zoom, offset) {
    var imageData = ctx.createImageData(width, height);
    var data = imageData.data;
    var midX = width/2;
    var midY = height/2;
    for(var i=0;i<data.length; i+=4) {
        var x = (i/4) % width - midX;
        var y = midY - Math.round(i/(4*width));
        var normX = 8 * (x - offset.x) / (zoom*width);
        var normY = 8 * (height/width) * (y - offset.y) / (zoom*height);
        var [iterations, z] = complexFunction({x: normX, y: normY}, {x: 0, y: 0}, 0);
        var color = numberToColor(iterations);

        data[i] = color[0];
        data[i+1] = color[1];
        data[i+2] = color[2];
        data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
}

function numberToColor(num) {
    return hslToRgb(num % 360, 100 - num%100, (num)%100);
}

// Complex functions
var MAX_STEP = 400;
function complexFunction(c, z, n) {
    if(n > MAX_STEP) {
        return [0, z];
    }
    if (magnitude(z) > 10) {
        return [n, z];
    }
    return complexFunction(c, sum(prod(z, z), c), n+1)
}

function sum(c1, c2) {
    return { x: c1.x + c2.x, y: c1.y + c2.y };
}

function prod(c1, c2) {
    return {
        x: c1.x*c2.x - c1.y*c2.y,
        y: c1.y*c2.x + c1.x*c2.y,
    };
}

function magnitude(z) {
    return Math.pow(z.x*z.x + z.y*z.y, 0.5);
}

function hslToRgb(h, s, l) {
    /*
     * COPIED
     * h within 360
     * s and l within 100
    */
    var r, g, b;
    h = h/360;
    s = s/100;
    l = l/100;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
