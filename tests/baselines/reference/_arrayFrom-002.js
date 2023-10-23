//// [tests/cases/compiler/_arrayFrom-002.ts] ////

//// [_arrayFrom-002.ts]
interface A {
a: string;
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



//// [_arrayFrom-002.js]
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


//// [_arrayFrom-002.d.ts]
interface A {
    a: string;
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
