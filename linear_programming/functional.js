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
