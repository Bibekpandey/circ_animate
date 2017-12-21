function run() {
    for (var i=0;i<100;i++) {
        var rule = getRule();
        drawPoint(gx, gy, rule.color);
        x1 = gx * rule.a + gy*rule.b + rule.tx;
        y1 = gx * rule.c + gy*rule.d + rule.ty;
        gx = x1;
        gy = y1;
    }
    requestAnimationFrame(run);
}

function getRule() {
    var r = Math.random();
    for (x in g_rules) {
        console.log(r);
        if (r <=g_rules[x].weight){
            console.log('return rule');
            return g_rules[x];
        }
        r = r - g_rules[x].weight;
    }
}

function drawPoint(x, y, color) {
    g_context.fillStyle = color;
    g_context.fillRect(x*50, y*50, .5, .5);
}
