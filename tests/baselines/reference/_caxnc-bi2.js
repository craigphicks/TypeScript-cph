//// [_caxnc-bi2.ts]
declare const bar: boolean;
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const rab2 = bar ? !isTrue(bar) : isTrue(bar);
rab2;


//// [_caxnc-bi2.js]
"use strict";
var rab2 = bar ? !isTrue(bar) : isTrue(bar);
rab2;


//// [_caxnc-bi2.d.ts]
declare const bar: boolean;
declare function isTrue(b: true): true;
declare function isTrue(b: false): false;
declare const rab2: false;
