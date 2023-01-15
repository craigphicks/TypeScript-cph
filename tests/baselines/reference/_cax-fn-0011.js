//// [_cax-fn-0011.ts]
declare const bar: boolean;
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const rab2 = bar ? !isTrue(bar) : isTrue(bar);
const foo = rab2;
if (foo) {
    rab2;
}
if (rab2) {
    foo;
}


//// [_cax-fn-0011.js]
"use strict";
var rab2 = bar ? !isTrue(bar) : isTrue(bar);
var foo = rab2;
if (foo) {
    rab2;
}
if (rab2) {
    foo;
}


//// [_cax-fn-0011.d.ts]
declare const bar: boolean;
declare function isTrue(b: true): true;
declare function isTrue(b: false): false;
declare const rab2: false;
declare const foo: false;
