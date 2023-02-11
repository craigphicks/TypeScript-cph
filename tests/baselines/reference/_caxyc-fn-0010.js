//// [_caxyc-fn-0010.ts]
declare const bar: boolean;
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const rab2 = bar ? !isTrue(bar) : isTrue(bar);
rab2;
bar;


//// [_caxyc-fn-0010.js]
"use strict";
var rab2 = bar ? !isTrue(bar) : isTrue(bar);
rab2;
bar;


//// [_caxyc-fn-0010.d.ts]
declare const bar: boolean;
declare function isTrue(b: true): true;
declare function isTrue(b: false): false;
declare const rab2: false;
