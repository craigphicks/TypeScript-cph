//// [_caxnc-propNarrow-0002.ts]
declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: 2; }"
let r = x ? { a: 1 as const } : { a: 2 as const, b: 2 as const};
if (r.b){
    r;
}
else {
    r;
}


//// [_caxnc-propNarrow-0002.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: 2; }"
var r = x ? { a: 1 } : { a: 2, b: 2 };
if (r.b) {
    r;
}
else {
    r;
}


//// [_caxnc-propNarrow-0002.d.ts]
declare const x: boolean;
declare let r: {
    a: 1;
    b?: undefined;
} | {
    a: 2;
    b: 2;
};
