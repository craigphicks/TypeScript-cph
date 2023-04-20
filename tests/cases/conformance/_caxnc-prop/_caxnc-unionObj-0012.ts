// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

// C.f. _caxnc-union-0003.ts, and see notes there.

declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: number; b: number; }"
let result = x ? { a: 1 } : { a: 1, b: 2 };
result.b; // expect number | undefined
