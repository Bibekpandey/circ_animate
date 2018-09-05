const MAX_STEPS = 10;

class LSystem {
    constructor(context2d, rules={}, actions, initial_state=null) {
        this.context = context2d;
        this.rules = rules;
        this.current_state = initial_state;
    }

    run (curr_state) {
        const next_state = actions[curr_state.state](curr_state);
        if(next_state.time >= MAX_STEPS) {
            console.log('returning');
            return;
        }
        this.renderState(curr_state, next_state);
        for(let x=0; x<next_state.children.length;x++) {
            let st = {...next_state};
            st.state = next_state.children[x];
            this.run(st);
        }
    }

    renderState(prev_state, curr_state) {
        let {x, y} = prev_state;
        this.context.beginPath();
        this.context.moveTo(x,y);
        let {xx, yy} = curr_state;
        this.context.lineTo(xx,yy);
        this.context.stroke();
    }
}

const INCREMENT = 10; 

const rules = {
    'X': 'F+[[X]]-X]-F[-FX]+X',
    'F': 'FF',
    '+': '',
    '-': '',
    '[': '',
    ']': '',
}

const actions = {
    'F': (current_state) => { // move forward, wherever it is facing
        const {x, y, direction, time} = current_state;
        let dx = Math.cos(direction) * INCREMENT;
        let dy = Math.sin(direction) * INCREMENT;
        return incrementTime({
            ...current_state,
            x: x+dx,
            y: y+dy,
            children: rules[current_state.state]
        });
    },
    '+': (current_state) => { // rotate +25 degrees
        let {direction, time} = current_state;
        direction = direction + (25 * Math.PI / 180.0);
        console.log('+');
        return incrementTime({
            ...current_state,
            direction: direction,
            children: rules[current_state.state]
        });
    },
    '-': (current_state) => { // rotate -25 degrees
        let {direction} = current_state;
        direction = direction - (25 * Math.PI / 180.0);
        return incrementTime({
            ...current_state,
            direction: direction,
            children: rules[current_state.state]
        });
    },
    'X': (current_state) => {
        return incrementTime({...current_state, children: rules[current_state.state]})  // do nothing 
    },
    '[': (current_state) => {  // save the current state for position and direction 
        const {x, y, direction} = current_state;
        let last_positions = [...current_state.last_positions, {x, y, direction}];
        return incrementTime({
            ...current_state,
            last_positions,
            children: rules[current_state.state]
        });
    },
    ']': (current_state, global_state={}) => { // load the current state for position and direction 
        let last_positions = [...current_state.last_positions];
        const {x, y, direction} = last_positions.pop() | {};
        return incrementTime({
            ...current_state,
            last_positions,
            x, y, direction,
            children: rules[current_state.state]
        });
    },
}


const incrementTime = (object) => {
    let t = object.time | 0;
    let o = Object.assign({time: t+1}, object); 
    return {...object, time: t+1};
}


const timeIncrementor = (wrapped) => {
    return function() {
        let val = wrapped.apply(this, arguments);
        return incrementTime(val);
    };
}
