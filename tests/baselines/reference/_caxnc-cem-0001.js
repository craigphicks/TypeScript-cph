//// [tests/cases/conformance/_caxnc/_caxnc-cem-0001.ts] ////

//// [_caxnc-cem-0001.ts]
// flow is not engaged here
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
isTrue(true);


//// [_caxnc-cem-0001.js]
"use strict";
isTrue(true);


//// [_caxnc-cem-0001.d.ts]
declare function isTrue(b: true): true;
declare function isTrue(b: false): false;
