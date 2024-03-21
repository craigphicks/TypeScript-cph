//// [_caxnc-fn-0021.ts]
declare function foo(x?:number):number[];
declare function foo(x?:number,y?:string,z?:string):string[];
declare const x: [string,...string[]];
const a4 = foo(...[1,...x] as const);
a4; // should be string[]


//// [_caxnc-fn-0021.js]
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
var a4 = foo.apply(void 0, __spreadArray([1], x, true));
a4; // should be string[]


//// [_caxnc-fn-0021.d.ts]
declare function foo(x?: number): number[];
declare function foo(x?: number, y?: string, z?: string): string[];
declare const x: [string, ...string[]];
declare const a4: string[];
