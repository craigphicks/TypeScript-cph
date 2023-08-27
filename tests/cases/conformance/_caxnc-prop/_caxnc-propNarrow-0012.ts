// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const x: boolean;

let y = { a: 1 as const };
let z = { a: 2 as const, b: 2 }
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: number; }"
let r = x ? y : z;
if (r.b){
    r; // expect { a: 2; b: number; }
    r.a; // expect 2
    r.b; // expect number
}
else {
    // Note: r.b could be 0
    r; // expect { a: 1 } | { a: 2; b: number; }
    r.a; // expect 1|2
    r.b; // expect any (error)
}
