// @strict: true


interface Context {
    [key: string]: any;
}
interface Test {
    [key: string]: any;
}
type Done = (err?: any) => void;
type Func = (this: Context, done: Done) => void;
type AsyncFunc = (this: Context) => PromiseLike<any>;
interface PendingTestFunction {
    skip: PendingTestFunction;
    only: PendingTestFunction;
    (fn: Func): Test;
    (fn: AsyncFunc): Test;
}
type WithSkipAndOnly<T extends any[]> = ((...args: T) => void) & {
    skip: (...args: T) => void;
    only: (...args: T) => void;
};
declare const it: PendingTestFunction;
function createTestWrapper<T extends any[]>(fn: (it: PendingTestFunction, ...args: T) => void): WithSkipAndOnly<T> {
    wrapped.skip = (...args: T) => fn(it.skip, ...args);
    wrapped.only = (...args: T) => fn(it.only, ...args);
    return wrapped;
    function wrapped(...args: T) {
        return fn(it, ...args);
    }
}

