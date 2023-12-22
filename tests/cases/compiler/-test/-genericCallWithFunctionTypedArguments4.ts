// @strict: true
// @declaration: true
// @target: es6

// No inference is made from function typed arguments which have multiple call signatures

declare class C { foo: string }
declare class D { bar: string }
declare var a: {
    new(x: boolean): C;
    new(x: string): D;
}

declare function foo4<T, U>(cb: new(x: T) => U): U;

var r = foo4(a); // T is {} (candidates boolean and string), U is {} (candidates C and D)

// var b: {
//     new<T>(x: boolean): T;
//     new<T>(x: T): any;
// }

// var r2 = foo4(b); // T is {} (candidates boolean and {}), U is any (candidates any and {})