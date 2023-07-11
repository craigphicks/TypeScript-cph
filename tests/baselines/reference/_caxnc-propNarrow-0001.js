//// [_caxnc-propNarrow-0001.ts]
declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: number; }"
let r = x ? { a: 1 as const } : { a: 2 as const, b: 2 };
if (r.b){
    r;
    r.a
    r.b
}
else {
    r;
    r.a
    r.b
}


//// [_caxnc-propNarrow-0001.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: number; }"
var r = x ? { a: 1 } : { a: 2, b: 2 };
if (r.b) {
    r;
    r.a;
    r.b;
}
else {
    r;
    r.a;
    r.b;
}


//// [_caxnc-propNarrow-0001.d.ts]
declare const x: boolean;
declare let r: {
    a: 1;
    b?: undefined;
} | {
    a: 2;
    b: number;
};
