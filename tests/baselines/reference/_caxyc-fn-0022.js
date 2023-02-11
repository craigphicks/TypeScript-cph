//// [_caxyc-fn-0022.ts]
declare function foo(a:1,b:2,c:3,d:number):string[];
const z: [number] = [4];
const y = [3,...z] as const;
const x = [2,...y] as const;
const a4 = foo(...[1,...x] as const);
a4; // should be string[]


//// [_caxyc-fn-0022.js]
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
var z = [4];
var y = __spreadArray([3], z, true);
var x = __spreadArray([2], y, true);
var a4 = foo.apply(void 0, __spreadArray([1], x, true));
a4; // should be string[]


//// [_caxyc-fn-0022.d.ts]
declare function foo(a: 1, b: 2, c: 3, d: number): string[];
declare const z: [number];
declare const y: readonly [3, number];
declare const x: readonly [2, 3, number];
declare const a4: string[];
