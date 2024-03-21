// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 2; readonly b: 2; }"
let r = x ? { a: 1 } as const : { a: 2, b:2 } as const ;
r.b; // expect undefined | 2
