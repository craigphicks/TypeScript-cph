// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

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
result.b; // expect 2 | undefined (with flough) [NOTE: original-flow => any (error)]
