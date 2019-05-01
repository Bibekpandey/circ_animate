export function getSplittedImageData(canvas, cellWidth=5, cellHeight=5) {
    const { width, height } = canvas;

    if(width % cellWidth !== 0 || height % cellHeight !== 0) {
        throw "cell width/height does not divide canvas width/height";
    }
    const X = width / cellWidth;
    const Y = height / cellHeight;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height).data;
    const cells = [];
    for (let y = 0; y < Y; y++) {
        for(let x = 0;x < X; x++) {
            const cellData = extractCellFromImageData(imageData, x, y, cellWidth, cellHeight, width, height);
            cells.push(cellData);
        }
    }
    return cells;
}

function extractCellFromImageData(imageData, xpos, ypos, cellWidth, cellHeight, width, height) {
    const cellPixels = [];
    for (let y=0;y<cellHeight;y++) {
        for (let x=0;x<cellWidth;x++) {
            const imageX = xpos*cellWidth + x;
            const imageY = ypos*cellHeight + y;
            const imageDataIndex = imageY * width + imageX;
            cellPixels.push({
                x: imageX,
                y: imageY,
                data: [ // R, G, B, A
                    imageData[imageDataIndex], imageData[imageDataIndex+1],
                    imageData[imageDataIndex+2], imageData[imageDataIndex+3],
                ],
            });
        }
    }
    return cellPixels;
}

export function renderCell(ctx, cell, colorArr, newImageData) {
    const { width, height } = ctx.canvas;
    cell.forEach(pixel => {
        const ind = (pixel.x + pixel.y*width) * 4;
        newImageData.data[ind] = colorArr[0];
        newImageData.data[ind+1] = colorArr[1];
        newImageData.data[ind+2] = colorArr[2];
        newImageData.data[ind+3] = colorArr[3] || 255;
    });
    return newImageData;
}

export function renderCells(ctx, cells, color='white') {
    const { width, height } = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);

    const newImageData = cells.reduce((imageData, cell) => {
        let color = 255;
        if (Math.random() > 0.5) {
            color = 122;
        }
        const colorArr = [color, color, color, 255];
        return renderCell(ctx, cell, colorArr, imageData);
    }, imageData);
        
    ctx.putImageData(newImageData, 0, 0);
}


export function doThanos(ctx, cells) {
}
