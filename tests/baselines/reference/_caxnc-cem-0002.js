//// [_caxnc-cem-0002.ts]
// flow is not engaged here
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const x = true;
isTrue(x);


//// [_caxnc-cem-0002.js]
"use strict";
var x = true;
isTrue(x);


//// [_caxnc-cem-0002.d.ts]
declare function isTrue(b: true): true;
declare function isTrue(b: false): false;
declare const x = true;
