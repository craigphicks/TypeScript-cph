//// [_caxnc-whileLoop-0005.ts]
// this loop never terminates reliably but converges
// loop finished due to type map converged, loopCount=3
declare function maybe(): boolean;
function t5(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (d){
        d = c;
        c = b;
        b = maybe();
    }
    let e = b;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0005.js]
"use strict";
function t5() {
    var b = true;
    var c = true;
    var d = true;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (d) {
        d = c;
        c = b;
        b = maybe();
    }
    var e = b;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0005.d.ts]
declare function maybe(): boolean;
declare function t5(): void;
