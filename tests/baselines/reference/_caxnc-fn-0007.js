//// [_caxnc-fn-0007.ts]
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

if (arg==="one" || arg===1){
    arg; // should be "one" | 1
}


//// [_caxnc-fn-0007.js]
"use strict";
;
var obj = b ? obja : objb;
if (arg === "one" || arg === 1) {
    arg; // should be "one" | 1
}


//// [_caxnc-fn-0007.d.ts]
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
