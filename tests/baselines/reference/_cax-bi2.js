//// [_cax-bi2.ts]
declare const bar: boolean;
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const rab2 = bar ? !isTrue(bar) : isTrue(bar);
// const foo = rab2;
// if (foo) {
//     const x = bar;
// }


//// [_cax-bi2.js]
"use strict";
var rab2 = bar ? !isTrue(bar) : isTrue(bar);
// const foo = rab2;
// if (foo) {
//     const x = bar;
// }


//// [_cax-bi2.d.ts]
declare const bar: boolean;
declare function isTrue(b: true): true;
declare function isTrue(b: false): false;
declare const rab2: false;
