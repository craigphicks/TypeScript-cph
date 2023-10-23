//// [tests/cases/compiler/_arrayFrom.ts] ////

//// [_arrayFrom.ts]
interface A {
a: string;
c: string;
}

interface B {
b: string;
}
const inputA: A[] = [];
const inputB: B[] = [];
//const result4: A[] = Array.from(inputB, ({ b }): A => ({ a: b }));
type F1 = <T,U>(iterable: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any) => U[];
declare const f1: F1;
f1(inputB, ({ b })=>({ a: b }));

type F2 = <T,U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any) => U[];
declare const f2: F2;
f2(inputB, ({ b })=>({ a: b }));

f2(inputB, ({ b }):A=>({ a: b }));

//Array.from(inputB, ({ b }): A => ({ a: b }));

//Array.from(inputA.values()); // no error, but it interferes with the next line

//Array.from(inputB, ({ b }): A => ({ a: b }));

type F3 = <T,U>(mapfn: (v: T, k: number) => U, iterable: Iterable<T> | ArrayLike<T>,thisArg?: any) => U[];
declare const f3: F3;
f3(({ b })=>({ a: b }), inputB);

f3(({ b }):A=>({ a: b }), inputB);

type F4 = <T,U>(mapfn: (v: T, k: number) => U) => U[];
type F5<T> = <U>(mapfn: (v: T, k: number) => U) => U[];
declare const f4: F4;
f4<B>(({ b })=>({ a: b }));


declare const f5: F5<B>;
f5(({ b })=>({ a: b }));





//// [_arrayFrom.js]
"use strict";
var inputA = [];
var inputB = [];
f1(inputB, function (_a) {
    var b = _a.b;
    return ({ a: b });
});
f2(inputB, function (_a) {
    var b = _a.b;
    return ({ a: b });
});
f2(inputB, function (_a) {
    var b = _a.b;
    return ({ a: b });
});
f3(function (_a) {
    var b = _a.b;
    return ({ a: b });
}, inputB);
f3(function (_a) {
    var b = _a.b;
    return ({ a: b });
}, inputB);
f4(function (_a) {
    var b = _a.b;
    return ({ a: b });
});
f5(function (_a) {
    var b = _a.b;
    return ({ a: b });
});


//// [_arrayFrom.d.ts]
interface A {
    a: string;
    c: string;
}
interface B {
    b: string;
}
declare const inputA: A[];
declare const inputB: B[];
type F1 = <T, U>(iterable: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any) => U[];
declare const f1: F1;
type F2 = <T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any) => U[];
declare const f2: F2;
type F3 = <T, U>(mapfn: (v: T, k: number) => U, iterable: Iterable<T> | ArrayLike<T>, thisArg?: any) => U[];
declare const f3: F3;
type F4 = <T, U>(mapfn: (v: T, k: number) => U) => U[];
type F5<T> = <U>(mapfn: (v: T, k: number) => U) => U[];
declare const f4: F4;
declare const f5: F5<B>;
