//// [_caxnc-fn-0034.ts]
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];
// By adding the following overload, the error goes away.
// Although the last overload is always matched,
// when either/both of the first two overloads match, the correct floughType is returned
// because never | <not never> = <not never>. When the last overload match
declare function foo(...args:any[]): never;

const a0 = foo();
a0; // expect string[]
const a1 = foo("");
a1; // expect  number[] | string[]
const a2 = foo("","");
a2; // expect string[]
const a3 = foo("","","");
a3; // expect string[]
const a4 = foo("","","","");
a4; // expect string[]
const b1 = foo(undefined);
b1; // expect string[]
const b2 = foo(undefined,undefined);
b2; // expect string[]
const b3 = foo(undefined,undefined,undefined);
b3; // expect never
const c0 = a0||a1||a2||a3||a4||b1||b2||b3; // never
c0; // expected string[]
const c1 = [a0,a1,a2,a3,a4,b1,b2,b3]; // never
c1; // expected never;
const c2 = a0||a1||a2||a3||a4||b1||b2||b3; // never
c2; // expected never


//// [_caxnc-fn-0034.js]
"use strict";
var a0 = foo();
a0; // expect string[]
var a1 = foo("");
a1; // expect  number[] | string[]
var a2 = foo("", "");
a2; // expect string[]
var a3 = foo("", "", "");
a3; // expect string[]
var a4 = foo("", "", "", "");
a4; // expect string[]
var b1 = foo(undefined);
b1; // expect string[]
var b2 = foo(undefined, undefined);
b2; // expect string[]
var b3 = foo(undefined, undefined, undefined);
b3; // expect never
var c0 = a0 || a1 || a2 || a3 || a4 || b1 || b2 || b3; // never
c0; // expected string[]
var c1 = [a0, a1, a2, a3, a4, b1, b2, b3]; // never
c1; // expected never;
var c2 = a0 || a1 || a2 || a3 || a4 || b1 || b2 || b3; // never
c2; // expected never


//// [_caxnc-fn-0034.d.ts]
declare function foo(x: string): number[];
declare function foo(x?: string, y?: string, ...z: string[]): string[];
declare function foo(...args: any[]): never;
declare const a0: string[];
declare const a1: number[];
declare const a2: string[];
declare const a3: string[];
declare const a4: string[];
declare const b1: string[];
declare const b2: string[];
declare const b3: never;
declare const c0: never;
declare const c1: never[];
declare const c2: never;
