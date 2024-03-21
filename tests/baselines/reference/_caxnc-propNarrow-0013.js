//// [_caxnc-propNarrow-0013.ts]
declare const x: boolean;

let y = { a: 1};
let z = { a: "one", b: "two"};
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: string; b: string; }"
let r = x ? y : z;
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


//// [_caxnc-propNarrow-0013.js]
"use strict";
var y = { a: 1 };
var z = { a: "one", b: "two" };
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { a: string; b: string; }"
var r = x ? y : z;
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


//// [_caxnc-propNarrow-0013.d.ts]
declare const x: boolean;
declare let y: {
    a: number;
};
declare let z: {
    a: string;
    b: string;
};
declare let r: {
    a: number;
    b?: undefined;
} | {
    a: string;
    b: string;
};
