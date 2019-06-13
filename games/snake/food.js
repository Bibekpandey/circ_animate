
class Food extends MethodBinded {
    constructor(ctx, position, points, time, type='NORMAL') {
        super();

        this.ctx = ctx;
        this.position = position;
        this.points = points;
        this.type = type;
        this.originateTime = time;

        this.bindMethods(['render', 'isEaten', 'isTimedOut']);
    }

    render(t) {
        const [x, y] = this.position;
        const alpha = (t - this.originateTime) / BONUS_FOOD_TIMEOUT;
        if(this.type === 'NORMAL') {
            renderCell(this.ctx, x, y, 1, FOOD_COLOR);
        }
        else if(this.type === 'BONUS') {
            this.ctx.globalAlpha = 1 - alpha;
            renderCell(this.ctx, x, y, 1, FOOD_COLOR);
            renderCell(this.ctx, x+1, y, 1, FOOD_COLOR);
            renderCell(this.ctx, x, y+1, 1, FOOD_COLOR);
            renderCell(this.ctx, x+1, y+1, 1, FOOD_COLOR);
            this.ctx.globalAlpha = 1;
        }
    }

    isTimedOut(t) {
        // times out only if it is a bonus food
        return this.type !== 'NORMAL' && (t - this.originateTime) >= BONUS_FOOD_TIMEOUT;
    }

    isEaten(headPos) {
        const [x, y] = this.position;
        const [xx, yy] = headPos;
        if (this.type === 'NORMAL') {
            return x === xx && y === yy;
        }
        else if (this.type === 'BONUS') {
            return (x === xx && y === yy) ||
                    (x+1 === xx && y === yy) ||
                    (x === xx && y+1 === yy) ||
                    (x+1 === xx && y+1 === yy);
        }
        return false;
    }
}
