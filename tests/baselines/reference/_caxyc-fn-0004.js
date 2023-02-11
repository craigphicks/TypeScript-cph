//// [_caxyc-fn-0004.ts]
declare interface FooA {
    foo(a:string): "A";
    foo(...args: any[]): undefined;
}
declare interface FooB {
    foo(b:number): "B";
    foo(...args: any[]): undefined;
};
declare const obja: FooA;
declare const objb: FooB;
declare const arg: string | number;
declare const b: boolean;
const obj = b? obja : objb

if (obj.foo(arg)){
    // if (obj===obja){
    //     arg; // should be string
    //     const xa = obj.foo(arg);
    //     xa; // should be "A"
    // }
    // if (obj===objb){
    //     arg; // should be number
    //     const xb = obj.foo(arg);
    //     xb; // should be "B"
    // }
    const x = obj.foo(arg); // x should be "A" | "B"
    obj;
    obj.foo;
    x; // should be "A" | "B"
}


// if ((obj===obja && arg==="one") || (obj===objb && arg===1)){
//     arg; // should be "one" | 1
//     const x = obja.foo(arg); // x should be "1"
// }


//// [_caxyc-fn-0004.js]
"use strict";
;
var obj = b ? obja : objb;
if (obj.foo(arg)) {
    // if (obj===obja){
    //     arg; // should be string
    //     const xa = obj.foo(arg);
    //     xa; // should be "A"
    // }
    // if (obj===objb){
    //     arg; // should be number
    //     const xb = obj.foo(arg);
    //     xb; // should be "B"
    // }
    var x = obj.foo(arg); // x should be "A" | "B"
    obj;
    obj.foo;
    x; // should be "A" | "B"
}
// if ((obj===obja && arg==="one") || (obj===objb && arg===1)){
//     arg; // should be "one" | 1
//     const x = obja.foo(arg); // x should be "1"
// }


//// [_caxyc-fn-0004.d.ts]
declare interface FooA {
    foo(a: string): "A";
    foo(...args: any[]): undefined;
}
declare interface FooB {
    foo(b: number): "B";
    foo(...args: any[]): undefined;
}
declare const obja: FooA;
declare const objb: FooB;
declare const arg: string | number;
declare const b: boolean;
declare const obj: FooA | FooB;
