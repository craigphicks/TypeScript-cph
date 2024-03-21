//// [tests/cases/conformance/_caxnc/_caxnc-fn-0030.ts] ////

//// [_caxnc-fn-0030.ts]
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];
declare function foo(...args:any[]): unknown;

const a0 = foo();
a0; // expect unknown
const a1 = foo("");
a1; // expect  unknown
const a2 = foo("","");
a2; // expect unknown
const a3 = foo("","","");
a3; // expect unknown
const a4 = foo("","","","");
a4; // expect unknown
const b1 = foo(undefined);
b1; // expect unknown
const b2 = foo(undefined,undefined);
b2; // expect unknown
const b3 = foo(undefined,undefined,undefined);
b3; // expect unknown
[a0,a1,a2,a3,a4,b1,b2,b3];



//// [_caxnc-fn-0030.js]
"use strict";
var a0 = foo();
a0; // expect unknown
var a1 = foo("");
a1; // expect  unknown
var a2 = foo("", "");
a2; // expect unknown
var a3 = foo("", "", "");
a3; // expect unknown
var a4 = foo("", "", "", "");
a4; // expect unknown
var b1 = foo(undefined);
b1; // expect unknown
var b2 = foo(undefined, undefined);
b2; // expect unknown
var b3 = foo(undefined, undefined, undefined);
b3; // expect unknown
[a0, a1, a2, a3, a4, b1, b2, b3];


//// [_caxnc-fn-0030.d.ts]
declare function foo(x: string): number[];
declare function foo(x?: string, y?: string, ...z: string[]): string[];
declare function foo(...args: any[]): unknown;
declare const a0: string[];
declare const a1: number[];
declare const a2: string[];
declare const a3: string[];
declare const a4: string[];
declare const b1: string[];
declare const b2: string[];
declare const b3: unknown;
