//// [_caxyc-cem-0003.ts]
// flow is not engaged here
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const x = true;
const y = isTrue(x);


//// [_caxyc-cem-0003.js]
"use strict";
var x = true;
var y = isTrue(x);


//// [_caxyc-cem-0003.d.ts]
declare function isTrue(b: true): true;
declare function isTrue(b: false): false;
declare const x = true;
declare const y: true;
