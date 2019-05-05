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
        const { height: cellHeight, width: cellWidth } = this.state;
        const { x, y, pixelsArray } = this.state;
        pixelsArray.forEach((pixelRow, rowIndex) => {
            pixelRow.forEach((pixel, colIndex) => {
                if(x * cellWidth > width || y * cellHeight > height) return;
                const ind = (x*cellWidth + (y*cellHeight+rowIndex)*width) * 4 + colIndex;
                newImageData.data[ind] = colorArr[0];
                newImageData.data[ind+1] = colorArr[1];
                newImageData.data[ind+2] = colorArr[2];
                newImageData.data[ind+3] = 255;
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

export function getCellsFromCanvas(canvas, cellWidth=5, cellHeight=5) {
    const { width, height } = canvas;

    if(width % cellWidth !== 0 || height % cellHeight !== 0) {
        throw "cell width/height does not divide canvas width/height";
    }
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height).data;

    const cells = [];

    for(let y=0;y<height;y+=cellHeight) {
        for (let x=0;x<width;x+=cellWidth) {
            const cellX = x/cellWidth, cellY = y/cellHeight;
            const pixelsArray = [];

            for(let cy=0;cy<cellHeight;cy++) {
                const pixelRow = [];
                for(let cx=0;cx<cellWidth;cx++) {
                    pixelRow.push(
                        imageData[(y+cy)*width + (x+cx)],
                        imageData[(y+cy)*width + (x+cx)+1],
                        imageData[(y+cy)*width + (x+cx)+2],
                        imageData[(y+cy)*width + (x+cx)+3],
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

export function writeCell(ctx, cell, colorArr, newImageData, cellWidth, cellHeight) {
    const { width, height } = ctx.canvas;
    const { x, y, pixelsArray } = cell.state;
    pixelsArray.forEach((pixelRow, rowIndex) => {
        pixelRow.forEach((pixel, colIndex) => {
            const ind = (x*cellWidth + (y*cellHeight+rowIndex)*width) * 4 + colIndex;
            newImageData.data[ind] = colorArr[0];
            newImageData.data[ind+1] = colorArr[1];
            newImageData.data[ind+2] = colorArr[2];
            newImageData.data[ind+3] = 255;
        });
        
    });
    return newImageData;
}

export function run(ctx, cells, fps=60, t=1) {
    if(t > 200) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const newImageData = cells.reduce(
        (imgData, cell) => cell.write(ctx, imgData),
        ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
    );

    ctx.putImageData(newImageData, 0, 0);
    const newCells = cells.map(cell =>  cell.update());

    setTimeout(run, 1000/fps, ctx, newCells, fps, t+1);
}
