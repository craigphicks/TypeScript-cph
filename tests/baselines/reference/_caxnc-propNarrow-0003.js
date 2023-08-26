//// [_caxnc-propNarrow-0003.ts]
declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: string; b: string; }"
let r = x ? { a: 1} : { a: "one", b: "two"};
if (r.b===undefined){
    r; // expect { a: number; }
    r.a; // expect number
    r.b; // expect any (error)
}
else {
    r; // expect { a: string; b: string; }
    r.a; // expect string
    r.b; // expect string
}


//// [_caxnc-propNarrow-0003.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: string; b: string; }"
var r = x ? { a: 1 } : { a: "one", b: "two" };
if (r.b === undefined) {
    r; // expect { a: number; }
    r.a; // expect number
    r.b; // expect any (error)
}
else {
    r; // expect { a: string; b: string; }
    r.a; // expect string
    r.b; // expect string
}


//// [_caxnc-propNarrow-0003.d.ts]
declare const x: boolean;
declare let r: {
    a: number;
    b?: undefined;
} | {
    a: string;
    b: string;
};
