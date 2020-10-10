const LPState = (objetiveAndConstraints, colors) => ({
    objective: objetiveAndConstraints.objective,
    constraints: objetiveAndConstraints.constraints,
    colors: colors,
    step: 0,
    feasibleRegion: undefined,
    solution: undefined,
    polygon: [],
});

const getIntersection = (a1, b1, c1, a2, b2, c2) => {
    // Solve by cramer's rule
    const det = a1 * b2 - a2 * b1;
    const detX = c1 * b2 - c2 * b1;
    const detY = a1 * c2 - a2 * c1;
    if (det == 0) alert('Cannot solve eqn'); // TODO: make this better
    return [detX/det, detY/det];
};


const renderState = (renderers, state) => {
    if(!state.feasibleRegion) return;
    renderers.polygon(state.feasibleRegion);
    // Draw lines
    const constraintLines = state.constraints.slice(0, state.step-1);
    const currLine = state.constraints[state.step-1];
    renderers.lineEq(currLine.a, currLine.b, currLine.c, '#f99f', 2);
    constraintLines.map(lineEq => renderers.lineEq(lineEq.a, lineEq.b, lineEq.c, '#f99a'));
    if(state.polygons.length >= 3) {
        renderers.polygon(state.polygons, 'orange');
        renderers.polygonOutline(state.polygons, 'skyblue');
    }
    state.polygons.map(point => renderers.point(...point, "red"));
};

const nextState = (grid, systemState) => {
    const step = systemState.step;
    const constraints = systemState.constraints;
    const constraint = constraints[step];
    const newState = { ...systemState, step: step+1 };
    const a = constraint.a || 0;
    const b = constraint.b || 0;
    const c = constraint.c || 0;

    let regionPolygon = undefined;
    if (a == 0 && b == 0) {
        alert('invalid constraint');
        return
    } else if (a == 0) {
        // check for (1, 1)
        const val = b * 1;
        // TODO: make sure val != c
        if (val <= c) {
            // Means, (1, 1) falls in the region
            regionPolygon = [
                [grid.xrange[0], c/b],
                [grid.xrange[0], grid.yrange[1]],
                [grid.xrange[1], grid.yrange[1]],
                [grid.xrange[1], c/b],
            ];
        }
    } else if (b == 0) {
        // check for (1, 1)
        const val = a * 1;
        // TODO: make sure val != c
        if (val <= c) {
            // Means, (1, 1) falls in the region
            regionPolygon = [
                [c/a, grid.yrange[0]],
                [grid.xrange[1], grid.yrange[0]],
                [grid.xrange[1], grid.yrange[1]],
                [c/a, grid.yrange[1]],
            ];
        }
    } else {
        // Check for 0, 0
        const quadrant = (c/b >= 0 && c/a >= 0) ? 1 : (
            (c/b >= 0 && c/a < 0) ? 2 : (c/a > 0 ? 4 : 3)
        );
        const top = getIntersection(a, b, c, 0, 1, grid.yrange[1]);
        const bottom= getIntersection(a, b, c, 0, 1, grid.yrange[0]);
        const left = getIntersection(a, b, c, 1, 0, grid.xrange[0]);
        const right = getIntersection(a, b, c, 1, 0, grid.xrange[1]);

        // Assume contains origin
        // TODO: case when not including origin
        if(quadrant == 1) {
            regionPolygon = [left, [grid.xrange[0],grid.yrange[0]], bottom];
        }
        else if (quadrant == 3) {
            regionPolygon = [right, [grid.xrange[1], grid.yrange[1]], top];
        }
        else if (quadrant == 2) {
            regionPolygon = [bottom, [grid.xrange[1], grid.yrange[0]], right];
        }
        else if (quadrant == 4) {
            regionPolygon = [top, [grid.xrange[0], grid.yrange[1]], left];
        }
    }
    newState.feasibleRegion = regionPolygon;
    newState.polygons = getPolygon(systemState);
    return newState;
};

const getPolygon = (state) => {
    const areConstraintsSatisfied = ([x, y]) =>
        state.constraints.slice(0, state.step+1).reduce(
            (a, c) => a && (c.a*x + c.b*y <= c.c),
            true
        );

    const intersections = [];
    for(let i=0; i < state.step; i++) {
        for(let j = i+1; j <= state.step; j++) {
            const c1 = state.constraints[i],
                  c2 = state.constraints[j];
            intersections.push(getIntersection(c1.a, c1.b, c1.c, c2.a, c2.b, c2.c));
        }
    }
    const validPolygonPoints = intersections.filter(areConstraintsSatisfied);
    if(validPolygonPoints.length < 3) return validPolygonPoints;
    if (validPolygonPoints.length == 3) return antiClockWiseTriangles(validPolygonPoints);
    if (validPolygonPoints.length > 3) return convexHull(validPolygonPoints);
};

const antiClockWiseTriangles = points => {
    const [a, b, c] = points;
    if(isInside(getLineEq(...a, ...b), c)) {
        return [a, b, c];
    }
    else return [a, c, b];
};

const zip = (a, b) => {
    const blen = b.length;
    return a.reduce((acc, aItem, ind) => ind < blen ? [...acc, [aItem, b[ind]]] : acc, []);
};

const convexHull = (points) => {
    // assume points are in anti-clockwise order
    if(points.length < 3) return [];
    if(points.length == 3) return [...points];

    const insertPoint = (hull, point) => {
        const equations = zip(points, [...points.slice(1), points[0]]).map(
            ([a, b]) => getLineEq(...a, ...b));
        const newPointIndex = equations.reduce(
            (newInd, eq, eqind) => isInside(eq, point) ? newInd : eqind + 1,
            0
        );
        if (newPointIndex >= hull.length) {
            return [...hull, point];
        } else {
            return [...hull.slice(0, newPointIndex), point, ...hull.slice(newPointIndex)];
        }
    };
    const [a, b, c, ...rest] = points;
    return rest.reduce((hull, point) => insertPoint(hull, point), [a, b, c]);
}

const isInside = (eq, point) => eq.a * point[0] + eq.b * point[1] <= eq.c;
