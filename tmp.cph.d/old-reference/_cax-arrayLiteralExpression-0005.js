//// [_cax-arrayLiteralExpression-0005.ts]
const x = [1,"2"] as const;
// This calls ArrayLiteralExpression with a spread element.
let y = [...x];


//// [_cax-arrayLiteralExpression-0005.js]
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
var x = [1, "2"];
// This calls ArrayLiteralExpression with a spread element.
var y = __spreadArray([], x, true);


//// [_cax-arrayLiteralExpression-0005.d.ts]
declare const x: readonly [1, "2"];
declare let y: (1 | "2")[];
