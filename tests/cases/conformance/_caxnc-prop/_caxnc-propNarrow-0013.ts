// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const x: boolean;

let y = { a: 1};
let z = { a: "one", b: "two"};
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: string; b: string; }"
let r = x ? y : z;
if (r.b===undefined){
    r;
    r.a;
    r.b;
}
else {
    r;
    r.a;
    r.b;
}
