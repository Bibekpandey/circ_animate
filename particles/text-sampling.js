function drawText(ctx, text, fontName='Helvetica', size=60, style='bold') {
    console.log({fontName, size, style});
    ctx.fillStyle = 'black';
    ctx.font = `${style} ${size}px ${fontName}`;
    ctx.fillText(text,size, size);
}

function sampleCanvas(ctx, pixVal=0, resolution=2) { // res 2 means, sample every second pixel in canvas
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    var imgd = ctx.getImageData(0, 0, W, H);
    var pix = imgd.data;

    const getCoordinates = i => ({
        x: parseInt(i/4) % W,
        y: parseInt(parseInt(i/4) / W),
    });
    const coordToPixelIndex = ({x, y}) => (y*W*4 + x*4);

    // get bounding rectangle
    let leftmost = null;
    let rightmost = null;
    let topmost = null;
    let bottommost = null;

    // Loop over each pixel and check bounds
    for (var i = 0, n = pix.length; i < n; i += 4) {
        if (pix[i] == pixVal && pix[i+1] == pixVal && pix[i+2] == pixVal) { // fourth is alpha and for now, just check black pixels
            const coords = getCoordinates(i);
            if (!leftmost) {
                leftmost = {...coords};
            } else if (coords.x < leftmost.x) {
                leftmost = {...coords};
            }

            if (!rightmost) {
                rightmost = {...coords};
            } else if (coords.x > rightmost.x) {
                rightmost = {...coords};
            }
            
            if (!topmost) {
                topmost = {...coords};
            }

            bottommost = {...coords};
        }
    }
    // now we have bounding rect
    const topleft = {x: leftmost.x, y: topmost.y};
    const bottomright = {x: rightmost.x, y: bottommost.y};

    const dx = bottomright.x - topleft.x + 1;
    const dy = bottomright.y - topleft.y + 1;
    console.log({dx, dy});

    let sampledPoints = [];

    for (let y=0;y<dy;y+=resolution) {
        let samplerow = [];
        for(let x=0;x<dx;x+=resolution) {
            const ind = coordToPixelIndex({
                x: topleft.x + x,
                y: topleft.y + y
            });
            if (pix[ind+1] == pixVal) {
                samplerow.push(1);
            } else {
                samplerow.push(0);
            }
        }
        sampledPoints.push(samplerow);
    }
    return sampledPoints;
}

function sampleImageCanvas(ctx, resolution=550) {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    console.log({W, H});

    var imgd = ctx.getImageData(0, 0, W, H);
    var pix = imgd.data;

    let sampledPoints = [];
    for(let y=0;y<H;y+=resolution) {
        let samplerow = [];
        for(let x=0;x<W;x+=resolution) {
            const pixIndex = y*W*4 + x*4;
            samplerow.push({
                r:pix[pixIndex],
                g:pix[pixIndex+1],
                b:pix[pixIndex+2],
                a:pix[pixIndex+3],
            });
        }
        sampledPoints.push(samplerow);
    }
    return sampledPoints;
}
