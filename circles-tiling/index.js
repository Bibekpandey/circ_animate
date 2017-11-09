function random(max) {
    return parseInt(max*Math.random());
}

function random_xy(max) {
    return {x:random(max), y:random(max)};
}
