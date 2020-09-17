const curry = (func, numargs) => {
    return (...args) => {
        if (args.length >= numargs) {
            return func(...args);
        } else {
            const diff =  numargs - args.length;
            const newFunc = (...remArgs) => {
                return func(...args, ...remArgs);
            };
            return curry(newFunc, diff);
        }
    };
};


const randomColor = () => {
    const chars = '00123456789abcdeff';
    const rand = () => Math.random() * chars.length
    return '#' + [...Array(6)].map(_ => chars[parseInt(rand())]).join('');
};

window.randomColor = randomColor;
