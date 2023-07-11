// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true


// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 2; b: number; }"
let r = { a: 2 as const, b: 2 };
r;

