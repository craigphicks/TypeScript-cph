//// [_cax-fn-0031.ts]
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];
const b3 = foo(undefined,undefined,undefined);
b3; // expect unknown



//// [_cax-fn-0031.js]
"use strict";
var b3 = foo(undefined, undefined, undefined);
b3; // expect unknown


//// [_cax-fn-0031.d.ts]
declare function foo(x: string): number[];
declare function foo(x?: string, y?: string, ...z: string[]): string[];
declare const b3: number[] & string[];
