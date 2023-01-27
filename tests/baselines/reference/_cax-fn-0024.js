//// [_cax-fn-0024.ts]
declare function foo(x?:number):number[];
declare function foo(x?:number,y?:string,z?:string):string[];
const a1 = foo();
a1; // expect number[]
const a2 = foo(1);
a2; // expect number[]
const a3 = foo(1,"2");
a3; // expect string[]
declare const x: [string,...string[]];
// a4 and a5 may be bugs
const a4 = foo(...[1,...x] as const);
a4; // expect string[] even though there may be too many args
declare const y: [...string[]];
const a5 = foo(...[1,...y] as const);
a5; // expect number[] | string[] ???? but typescript says only string[]
const z: [number,string] = [1,"2"];
const a6 = foo(...z);
a6; // expect string[]
[a1,a2,a3,a4,a5,a6];

//// [_cax-fn-0024.js]
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var a1 = foo();
a1; // expect number[]
var a2 = foo(1);
a2; // expect number[]
var a3 = foo(1, "2");
a3; // expect string[]
// a4 and a5 may be bugs
var a4 = foo.apply(void 0, __spreadArray([1], x, true));
a4; // expect string[] even though there may be too many args
var a5 = foo.apply(void 0, __spreadArray([1], y, true));
a5; // expect number[] | string[] ???? but typescript says only string[]
var z = [1, "2"];
var a6 = foo.apply(void 0, z);
a6; // expect string[]
[a1, a2, a3, a4, a5, a6];


//// [_cax-fn-0024.d.ts]
declare function foo(x?: number): number[];
declare function foo(x?: number, y?: string, z?: string): string[];
declare const a1: number[];
declare const a2: number[];
declare const a3: string[];
declare const x: [string, ...string[]];
declare const a4: string[];
declare const y: [...string[]];
declare const a5: string[];
declare const z: [number, string];
declare const a6: string[];
