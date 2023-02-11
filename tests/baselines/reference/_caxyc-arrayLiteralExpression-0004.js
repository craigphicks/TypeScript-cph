//// [_caxyc-arrayLiteralExpression-0004.ts]
const x = [1,"2"] as [number,string];
// This calls ArrayLiteralExpression with a spread element.
let y = [...x];

//// [_caxyc-arrayLiteralExpression-0004.js]
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


//// [_caxyc-arrayLiteralExpression-0004.d.ts]
declare const x: [number, string];
declare let y: (string | number)[];
