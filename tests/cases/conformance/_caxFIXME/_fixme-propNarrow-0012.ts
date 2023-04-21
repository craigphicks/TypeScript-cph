// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const x: boolean;

let y = { a: 1 as const };
let z = { a: 2 as const, b: 2 as const}
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: 2; }"
let r = x ? y : z;
if (r.b){
    r;
}
else {
    r;
}
