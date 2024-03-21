//// [_caxnc-propNarrow-0006.ts]
declare const x: boolean;

function testWithConst() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 2; readonly b: 2; }"
    let r = x ? { a: 1 } as const : { a: 2, b:2 } as const ;
    if (r.b!==2) {
        r; // expect { readonly a: 1; }
        r.b; // r is sealed so access not allowed by checkerExpression, gives error,  expect any
    }
}
function testWithoutConst() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { readonly a: 2; readonly b: 2; }"
    let r = x ? { a: 1 } : { a: 2, b:2 } as const ;
    if (r.b!==2) {
        r; // expect { a: number; }
        r.b; // even though r is not sealed access still not allowed by checkerExpression, expect any
    }
}
function testNarrowing() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { readonly a: 2; readonly b: 2; }"
    let r = x ? { a: 1 } : { a: 2, b:2 } as const ;
    if (r.b===undefined) { // not an error
        r; // expect { a: number; }
        r.b; // even though r is not sealed access still not allowed by checkerExpression, expect any
    }
}

//// [_caxnc-propNarrow-0006.js]
"use strict";
function testWithConst() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { readonly a: 1; } | { readonly a: 2; readonly b: 2; }"
    var r = x ? { a: 1 } : { a: 2, b: 2 };
    if (r.b !== 2) {
        r; // expect { readonly a: 1; }
        r.b; // r is sealed so access not allowed by checkerExpression, gives error,  expect any
    }
}
function testWithoutConst() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { readonly a: 2; readonly b: 2; }"
    var r = x ? { a: 1 } : { a: 2, b: 2 };
    if (r.b !== 2) {
        r; // expect { a: number; }
        r.b; // even though r is not sealed access still not allowed by checkerExpression, expect any
    }
}
function testNarrowing() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: { a: number; } | { readonly a: 2; readonly b: 2; }"
    var r = x ? { a: 1 } : { a: 2, b: 2 };
    if (r.b === undefined) { // not an error
        r; // expect { a: number; }
        r.b; // even though r is not sealed access still not allowed by checkerExpression, expect any
    }
}


//// [_caxnc-propNarrow-0006.d.ts]
declare const x: boolean;
declare function testWithConst(): void;
declare function testWithoutConst(): void;
declare function testNarrowing(): void;
