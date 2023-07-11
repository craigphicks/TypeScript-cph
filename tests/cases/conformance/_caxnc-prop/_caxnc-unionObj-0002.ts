// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const x: boolean;

// C.f. _caxnc-union-0003.ts, and see notes there.

// Note: result is displayed in '.types' file as a union of two types: { a: 1, b?: 2} | { a: 1, b: 2 }, but flough-level code does not add the optional 'b'.
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 1; readonly b: 2; }"
const result = x ? { a: 1 } as const : { a: 1, b: 2 } as const;
result.b; // expect 2 | undefined