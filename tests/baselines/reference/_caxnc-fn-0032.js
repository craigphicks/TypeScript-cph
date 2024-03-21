//// [_caxnc-fn-0032.ts]
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];

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
[a0,a1,a2,a3,a4,b1,b2,b3]; // expect never[] and expect each element to be never



//// [_caxnc-fn-0032.js]
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
[a0, a1, a2, a3, a4, b1, b2, b3]; // expect never[] and expect each element to be never


//// [_caxnc-fn-0032.d.ts]
declare function foo(x: string): number[];
declare function foo(x?: string, y?: string, ...z: string[]): string[];
declare const a0: string[];
declare const a1: number[];
declare const a2: string[];
declare const a3: string[];
declare const a4: string[];
declare const b1: string[];
declare const b2: string[];
declare const b3: number[] & string[];
