//// [_caxnc-parens-0010.ts]
declare const a: boolean;
declare const b: boolean;
declare const c: boolean;
declare const d: boolean;
if ((a&&b)||(c&&d)){
    [a,b,c,d];
}


//// [_caxnc-parens-0010.js]
"use strict";
if ((a && b) || (c && d)) {
    [a, b, c, d];
}


//// [_caxnc-parens-0010.d.ts]
declare const a: boolean;
declare const b: boolean;
declare const c: boolean;
declare const d: boolean;
