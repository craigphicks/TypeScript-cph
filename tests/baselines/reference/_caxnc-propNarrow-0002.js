//// [_caxnc-propNarrow-0002.ts]
declare const x: boolean;

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 2; readonly b: 2; }"
let r = x ? { a: 1 } as const : { a: 2, b:2 } as const ;
if (r.b){
    r; // expect { readonly a: 2; readonly b: 2; }
    r.a; // expect 2
    r.b; // expect 2
}
else {
    r; // expect { readonly a: 1; }
    r.a; // expect 1
    r.b; // expect any (error)
}


//// [_caxnc-propNarrow-0002.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 2; readonly b: 2; }"
var r = x ? { a: 1 } : { a: 2, b: 2 };
if (r.b) {
    r; // expect { readonly a: 2; readonly b: 2; }
    r.a; // expect 2
    r.b; // expect 2
}
else {
    r; // expect { readonly a: 1; }
    r.a; // expect 1
    r.b; // expect any (error)
}


//// [_caxnc-propNarrow-0002.d.ts]
declare const x: boolean;
declare let r: {
    readonly a: 1;
    readonly b?: undefined;
} | {
    readonly a: 2;
    readonly b: 2;
};
