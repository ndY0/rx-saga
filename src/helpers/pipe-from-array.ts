function identity<T>(x: T): T {
    return x;
}

interface UnaryFunction<T, R> {
    (source: T): R;
}

const pipeFromArray = <T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> => {
    if (fns.length === 0) {
        return identity as UnaryFunction<any, any>;
    }

    if (fns.length === 1) {
        return fns[0];
    }

    return function piped(input: T): R {
        return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
    };
}

export default pipeFromArray;
export { identity }