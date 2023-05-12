//// [_caxnc-fn-0023.ts]
declare function foo(x?:number):number[];
declare function foo(x?:number,y?:string,z?:string):string[];
const a2 = foo(1);
a2; // expect number[]


//// [_caxnc-fn-0023.js]
"use strict";
var a2 = foo(1);
a2; // expect number[]


//// [_caxnc-fn-0023.d.ts]
declare function foo(x?: number): number[];
declare function foo(x?: number, y?: string, z?: string): string[];
declare const a2: number[];
