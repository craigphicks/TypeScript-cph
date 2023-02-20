//// [_caxnc-whileLoop-0003.ts]
// This loop converges after 1 iteration, but never terminates, so e is never
function t3(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (d){
        d = c;
        c = b;
        [b,c,d];
    }
    let e = b;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0003.js]
"use strict";
// This loop converges after 1 iteration, but never terminates, so e is never
function t3() {
    var b = true;
    var c = true;
    var d = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (d) {
        d = c;
        c = b;
        [b, c, d];
    }
    var e = b;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0003.d.ts]
declare function t3(): void;
