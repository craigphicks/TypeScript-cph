// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: 1; } | { a: 2; b: number; }"
let r = x ? { a: 1 as const } : { a: 2 as const, b: 2 };
if (r.b){
    r; // expect { a: 2; b: number; }
    r.a // expect 2
    r.b // expect number
}
else {
    // Note: r.b could be 0
    r; // expect { a: 1 } | { a: 2; b: number; }
    r.a // expect 1 | 2
    r.b // expect undefined | number
}
