//// [_cax-cem-0001.ts]
// flow is not engaged here
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
isTrue(true);


//// [_cax-cem-0001.js]
"use strict";
isTrue(true);


//// [_cax-cem-0001.d.ts]
declare function isTrue(b: true): true;
declare function isTrue(b: false): false;
