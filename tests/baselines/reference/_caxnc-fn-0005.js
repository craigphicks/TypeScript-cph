//// [tests/cases/conformance/_caxnc/_caxnc-fn-0005.ts] ////

//// [_caxnc-fn-0005.ts]
declare interface FooA {
    foo(b:string): "A";
    foo(...args:any[]): unknown;
}
declare interface FooB {
    foo(b:number): "B";
    foo(...args:any[]): unknown;
};
declare const obja: FooA;
declare const objb: FooB;
declare const arg: string | number;
declare const b: boolean;
const obj = b? obja : objb

if (obj===obja && arg==="one" || obj===objb && arg===1){
    arg; // should be "one" | 1
    const x = obj.foo(arg);
    obj; // obj should be FooA | FooB
    x; // x should be "A" | "B",
}


//// [_caxnc-fn-0005.js]
"use strict";
;
var obj = b ? obja : objb;
if (obj === obja && arg === "one" || obj === objb && arg === 1) {
    arg; // should be "one" | 1
    var x = obj.foo(arg);
    obj; // obj should be FooA | FooB
    x; // x should be "A" | "B",
}


//// [_caxnc-fn-0005.d.ts]
declare interface FooA {
    foo(b: string): "A";
    foo(...args: any[]): unknown;
}
declare interface FooB {
    foo(b: number): "B";
    foo(...args: any[]): unknown;
}
declare const obja: FooA;
declare const objb: FooB;
declare const arg: string | number;
declare const b: boolean;
declare const obj: FooA | FooB;
