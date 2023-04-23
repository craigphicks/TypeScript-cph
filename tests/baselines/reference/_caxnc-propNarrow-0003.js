//// [_caxnc-propNarrow-0003.ts]
declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: string; b: string; }"
let r = x ? { a: 1} : { a: "one", b: "two"};
if (r.b===undefined){
    r;
}
else {
    r;
}


//// [_caxnc-propNarrow-0003.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: string; b: string; }"
var r = x ? { a: 1 } : { a: "one", b: "two" };
if (r.b === undefined) {
    r;
}
else {
    r;
}


//// [_caxnc-propNarrow-0003.d.ts]
declare const x: boolean;
declare let r: {
    a: number;
    b?: undefined;
} | {
    a: string;
    b: string;
};
