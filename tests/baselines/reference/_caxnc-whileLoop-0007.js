//// [_caxnc-whileLoop-0007.ts]
// this loop never terminates reliably but converges
// loop finished due to type map converged, loopCount=3
declare function maybe(): boolean;
function t7(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (d){
        c = b;
        d = c;
        b = maybe();
    }
    let e = b;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0007.js]
"use strict";
function t7() {
    var b = true;
    var c = true;
    var d = true;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (d) {
        c = b;
        d = c;
        b = maybe();
    }
    var e = b;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0007.d.ts]
declare function maybe(): boolean;
declare function t7(): void;
