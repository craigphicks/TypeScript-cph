//// [_caxnc-whileLoop-0021.ts]
declare function maybe(): boolean;
function t21(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (d){
        d = c;
        c = b;
        if (!b) break;
        b = !b;
        b;
    }
    let e = b;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0021.js]
"use strict";
function t21() {
    var b = true;
    var c = true;
    var d = true;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (d) {
        d = c;
        c = b;
        if (!b)
            break;
        b = !b;
        b;
    }
    var e = b;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0021.d.ts]
declare function maybe(): boolean;
declare function t21(): void;
