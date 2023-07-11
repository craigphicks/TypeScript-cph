//// [_caxnc-litobj-0001.ts]
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 2; b: number; }"
let r = { a: 2 as const, b: 2 };
r;



//// [_caxnc-litobj-0001.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 2; b: number; }"
var r = { a: 2, b: 2 };
r;


//// [_caxnc-litobj-0001.d.ts]
declare let r: {
    a: 2;
    b: number;
};
