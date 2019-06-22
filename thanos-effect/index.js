export class Cell {
    constructor(state) {
        this.state = {
            vx: Math.random() > 0.3 ? 4 : 1, // default vx
            vy: Math.random() > 0.5 ? 1 : 0, // default vy
            ...state,
        };
        this.write = this.write.bind(this);
        this.update = this.update.bind(this);
    }

    write(ctx, newImageData, colorArr=[255,255,255,255]) {
        const { width, height } = ctx.canvas;
        const { cellHeight, cellWidth } = this.state;
        const { x, y, data } = this.state;

        pixelsArray.forEach((pixelRow, rowIndex) => {
            const baseind = (x*cellWidth + (y*cellHeight+rowIndex)*width) * 4;
            pixelRow.forEach((pixel, colIndex) => {

                if(x * cellWidth > width || y * cellHeight > height) return;

                const ind =  baseind + colIndex;
                newImageData.data[ind] = pixel;
                // TODO: x + 1 % 4 for alpha
                //  newImageData.data[ind] = colorArr[0];
                //  newImageData.data[ind+1] = colorArr[1];
                //  newImageData.data[ind+2] = colorArr[2];
                //  newImageData.data[ind+3] = 255;
            });
        });
        return newImageData;
    }

    update() {
        const newState = {
            ...this.state,
            x: this.state.x + this.state.vx,
            y: this.state.y + this.state.vy,
        };
        return new Cell(newState);
    }
}

export function getCellsFromCanvas(ctx, cellWidth=5, cellHeight=5) {
    const { width, height } = ctx.canvas;

    if(width % cellWidth !== 0 || height % cellHeight !== 0) {
        throw "cell width/height does not divide canvas width/height";
    }
    const imageData = ctx.getImageData(0, 0, width, height).data;
    const cells = [];

    for(let y=0;y<height;y+=cellHeight) {
        for (let x=0;x<width;x+=cellWidth) {
            const cellX = x/cellWidth, cellY = y/cellHeight;
            const pixelsArray = [];

            for(let cy=0;cy<cellHeight;cy++) {
                const pixelRow = [];
                for(let cx=0;cx<cellWidth;cx++) {
                    const ind = (y+cy)*width + (x+cx);
                    pixelRow.push(
                        imageData[ind],
                        imageData[ind+1],
                        imageData[ind+2],
                        imageData[ind+3],
                    );
                }
                pixelsArray.push(pixelRow);
            }
            cells.push(
                new Cell({
                    x: cellX,
                    y: cellY,
                    height: cellHeight,
                    width: cellWidth,
                    pixelsArray,
                })
            );
        }
    }
    return cells;
}

export function canvasToCells(ctx, cellWidth, cellHeight) {
    const { width, height } = ctx.canvas;
    const cells = [];

    for (let row = 0; row<height/cellHeight; row++) {
        cells.push([]);
    }
    const imageData = ctx.getImageData(0, 0, width, height).data;

    for(let x=0;x<imageData.length; x+=4) {
        const canvasRow = Math.floor(x/(4*width));
        const canvasCol = x % (4*width);
        const cellY = Math.floor(canvasRow / cellHeight);
        const cellX = Math.floor(canvasCol / cellWidth);

        if(!cells[cellY][cellX]) cells[cellY][cellX] = [];

        cells[cellY][cellX].push([
            imageData[x], imageData[x+1], imageData[x+2], imageData[x+3]
        ]);
    }
    console.warn(cells);
    // Now create Cell objects
    return cells.reduce((allCells, row, y) => ([
        ...allCells, 
        ...row.map((cell, x) => new Cell({x, y, cellHeight, cellWidth, data: cell}))
    ]), []);
}

export function run(ctx, cells, fps=60, t=1) {
    if(t > 200) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const newImageData = cells.reduce(
        (imgData, cell) => cell.write(ctx, imgData),
        ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
    );
    // console.warn(newImageData);

    ctx.putImageData(newImageData, 0, 0);
    const newCells = cells.map(cell =>  cell.update());

    setTimeout(run, 1000/fps, ctx, newCells, fps, t+1);
}
