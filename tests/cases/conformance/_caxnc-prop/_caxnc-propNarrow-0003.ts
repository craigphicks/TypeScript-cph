// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: string; b: string; }"
let r = x ? { a: 1} : { a: "one", b: "two"};
if (r.b===undefined){
    r; // expect { a: number; }
    r.a; // expect number
    r.b; // expect error
}
else {
    r; // expect { a: string; b: string; }
    r.a; // expect string
    r.b; // expect string
}
