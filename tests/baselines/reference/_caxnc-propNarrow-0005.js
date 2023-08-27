//// [_caxnc-propNarrow-0005.ts]
declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 2; readonly b: 2; }"
let r = x ? { a: 1 } as const : { a: 2, b:2 } as const ;
r.b; // expect undefined | 2


//// [_caxnc-propNarrow-0005.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 2; readonly b: 2; }"
var r = x ? { a: 1 } : { a: 2, b: 2 };
r.b; // expect undefined | 2


//// [_caxnc-propNarrow-0005.d.ts]
declare const x: boolean;
declare let r: {
    readonly a: 1;
    readonly b?: undefined;
} | {
    readonly a: 2;
    readonly b: 2;
};
