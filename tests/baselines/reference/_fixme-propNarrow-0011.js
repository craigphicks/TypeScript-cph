//// [_fixme-propNarrow-0011.ts]
declare const x: boolean;

let y = { a: 1 as const };
let z = { a: 2 as const, b: 2 };
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: number; }"
let r = x ?  y : z;
if (r.b){
    r;
}
else {
    r;
}


//// [_fixme-propNarrow-0011.js]
"use strict";
var y = { a: 1 };
var z = { a: 2, b: 2 };
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: number; }"
var r = x ? y : z;
if (r.b) {
    r;
}
else {
    r;
}


//// [_fixme-propNarrow-0011.d.ts]
declare const x: boolean;
declare let y: {
    a: 1;
};
declare let z: {
    a: 2;
    b: number;
};
declare let r: {
    a: 1;
    b?: undefined;
} | {
    a: 2;
    b: number;
};
