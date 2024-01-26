//// [tests/cases/compiler/-test/-57087-13.ts] ////

//// [-57087-13.ts]
declare const f42: () => string | number;
f42 satisfies (() => string) & (() => number);


//// [-57087-13.js]
"use strict";
f42;


//// [-57087-13.d.ts]
declare const f42: () => string | number;
