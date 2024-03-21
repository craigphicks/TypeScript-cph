//// [_caxnc-ez0009.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
    foo(...args: any[]): never;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

const isFoo = obja?.foo(arg);
let x = isFoo;
obja;
obja?.foo;
obja?.foo(arg);
isFoo;


//// [_caxnc-ez0009.js]
"use strict";
;
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
var x = isFoo;
obja;
obja === null || obja === void 0 ? void 0 : obja.foo;
obja === null || obja === void 0 ? void 0 : obja.foo(arg);
isFoo;


//// [_caxnc-ez0009.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): undefined;
    foo(...args: any[]): never;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
declare let x: "1" | undefined;
