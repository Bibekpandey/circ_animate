function drawCircles() {
    var c = createCircle();
    var counter = 0;
    while (!isValid(c)) {
        counter++;
        c = createCircle();
        if (counter > 10000) return;
    }
    while(isValid(c)) {
        c.r++;
    }
    c.r-=2;
    g_circles.push(c);
    if (c.r <= g_max_r - 15) {
        drawCircle(c);
    }
    requestAnimationFrame(drawCircles);
}

function createCircle() {
    return {
        x: Math.random()*600,
        y: Math.random()*600,
        r: Math.ceil(Math.random()*g_max_r)
    }
}

function isValid(c) {
    if (c.r > g_max_r || c.r < g_min_r) return false;
    for (var i=0;i<g_circles.length;i++) {
        var dx = c.x - g_circles[i].x,
            dy = c.y - g_circles[i].y;
        var dr = Math.sqrt(dx*dx + dy*dy);
        if (dr < c.r+g_circles[i].r) {
            return false;
        }
    }
    return true;
}

function drawCircle(c) {
    g_context.beginPath();
    g_context.arc(c.x, c.y, c.r, 0, Math.PI*2);
    g_context.fill()
}
