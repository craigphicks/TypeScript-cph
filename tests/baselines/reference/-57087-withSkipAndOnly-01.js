//// [tests/cases/compiler/-test/-57087-withSkipAndOnly-01.ts] ////

//// [-57087-withSkipAndOnly-01.ts]
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



//// [-57087-withSkipAndOnly-01.js]
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function createTestWrapper(fn) {
    wrapped.skip = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fn.apply(void 0, __spreadArray([it.skip], args, false));
    };
    wrapped.only = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fn.apply(void 0, __spreadArray([it.only], args, false));
    };
    return wrapped;
    function wrapped() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fn.apply(void 0, __spreadArray([it], args, false));
    }
}
