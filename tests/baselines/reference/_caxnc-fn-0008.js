//// [_caxnc-fn-0008.ts]
declare interface FooA {
    foo(b:string): "A";
    foo(...args:any[]): unknown;
}
declare const obja: FooA;
declare const arg: string;
const x = obja.foo(arg);
x; // x should be unknown


//// [_caxnc-fn-0008.js]
"use strict";
var x = obja.foo(arg);
x; // x should be unknown


//// [_caxnc-fn-0008.d.ts]
declare interface FooA {
    foo(b: string): "A";
    foo(...args: any[]): unknown;
}
declare const obja: FooA;
declare const arg: string;
declare const x: "A";
