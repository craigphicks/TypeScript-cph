//// [tests/cases/conformance/_caxnc/_caxnc-ez0015.ts] ////

//// [_caxnc-ez0015.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
    foo(b:any): void;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// checknig isFoo in combo with another condition argIsString
const isFoo = obja?.foo(arg);
const argIsString = typeof arg === "string";
if (isFoo && argIsString){
    const x = obja.foo(arg);
}


//// [_caxnc-ez0015.js]
"use strict";
;
// checknig isFoo in combo with another condition argIsString
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
var argIsString = typeof arg === "string";
if (isFoo && argIsString) {
    var x = obja.foo(arg);
}


//// [_caxnc-ez0015.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): undefined;
    foo(b: any): void;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: void | undefined;
declare const argIsString: boolean;
