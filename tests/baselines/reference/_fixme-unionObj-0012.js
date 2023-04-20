//// [_fixme-unionObj-0012.ts]
// C.f. _caxnc-union-0003.ts, and see notes there.

declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: number; b: number; }"
let result = x ? { a: 1 } : { a: 1, b: 2 };
result.b; // expect number | undefined


//// [_fixme-unionObj-0012.js]
"use strict";
// C.f. _caxnc-union-0003.ts, and see notes there.
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: number; b: number; }"
var result = x ? { a: 1 } : { a: 1, b: 2 };
result.b; // expect number | undefined


//// [_fixme-unionObj-0012.d.ts]
declare const x: boolean;
declare let result: {
    a: number;
    b?: undefined;
} | {
    a: number;
    b: number;
};
