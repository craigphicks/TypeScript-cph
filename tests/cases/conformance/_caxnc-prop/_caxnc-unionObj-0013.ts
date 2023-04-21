// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// C.f. _caxnc-union-0003.ts, and see notes there.

declare const x: boolean;

let foo = { a: 1 };
let bar = { a: 1, b: 2 };

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: number; b: number; }"
let result = x ? foo : bar;
result.b; // expect number | undefined
