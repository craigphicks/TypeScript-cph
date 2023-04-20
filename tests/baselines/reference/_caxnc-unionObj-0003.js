//// [_caxnc-unionObj-0003.ts]
// C.f. _caxnc-unionObj-0002.ts, and issue: "Variables type wrong unification / conditional inference #48714"
// When using flough, "result" has the same in both, and both can acccess "b" wihout error.
//
// However, when using orginal-flow the type of "result" is different in the two cases,
// and the unionObj-0003 gives an error on "result.b" while unionObj-0002 does not.

declare const x: boolean;

const foo = { a: 1 } as const;
const bar = { a: 1, b: 2 } as const;

// Note: result is displayed in '.types' file as a union of two types: { a: 1, b?: 2} | { a: 1, b: 2 }, but flough-level code does not add the optional 'b'.
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 1; readonly b: 2; }"
const result = x ? foo : bar;
result.b; // expect 2 | undefined, checkExpression level does not emit error because probably because it adds the optional 'b' to the type.


//// [_caxnc-unionObj-0003.js]
"use strict";
// C.f. _caxnc-unionObj-0002.ts, and issue: "Variables type wrong unification / conditional inference #48714"
// When using flough, "result" has the same in both, and both can acccess "b" wihout error.
//
// However, when using orginal-flow the type of "result" is different in the two cases,
// and the unionObj-0003 gives an error on "result.b" while unionObj-0002 does not.
var foo = { a: 1 };
var bar = { a: 1, b: 2 };
// Note: result is displayed in '.types' file as a union of two types: { a: 1, b?: 2} | { a: 1, b: 2 }, but flough-level code does not add the optional 'b'.
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 1; readonly b: 2; }"
var result = x ? foo : bar;
result.b; // expect 2 | undefined, checkExpression level does not emit error because probably because it adds the optional 'b' to the type.


//// [_caxnc-unionObj-0003.d.ts]
declare const x: boolean;
declare const foo: {
    readonly a: 1;
};
declare const bar: {
    readonly a: 1;
    readonly b: 2;
};
declare const result: {
    readonly a: 1;
    readonly b?: undefined;
} | {
    readonly a: 1;
    readonly b: 2;
};
