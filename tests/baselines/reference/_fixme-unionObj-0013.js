//// [_fixme-unionObj-0013.ts]
// C.f. _caxnc-union-0003.ts, and see notes there.

declare const x: boolean;

let foo = { a: 1 };
let bar = { a: 1, b: 2 };

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: number; b: number; }"
let result = x ? foo : bar;
result.b; // expect number | undefined


//// [_fixme-unionObj-0013.js]
"use strict";
// C.f. _caxnc-union-0003.ts, and see notes there.
var foo = { a: 1 };
var bar = { a: 1, b: 2 };
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: number; b: number; }"
var result = x ? foo : bar;
result.b; // expect number | undefined


//// [_fixme-unionObj-0013.d.ts]
declare const x: boolean;
declare let foo: {
    a: number;
};
declare let bar: {
    a: number;
    b: number;
};
declare let result: {
    a: number;
    b?: undefined;
} | {
    a: number;
    b: number;
};
