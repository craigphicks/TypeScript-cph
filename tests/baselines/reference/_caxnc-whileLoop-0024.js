//// [_caxnc-whileLoop-0024.ts]
declare function maybe(): boolean;
function t24(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (d){
        c = b;
        d = c;
        b;c;d;
        b = maybe();
        if (!b) break;
        b;c;d;
    }
    let e = b;
    b;c;d;e;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0024.js]
"use strict";
function t24() {
    var b = true;
    var c = true;
    var d = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (d) {
        c = b;
        d = c;
        b;
        c;
        d;
        b = maybe();
        if (!b)
            break;
        b;
        c;
        d;
    }
    var e = b;
    b;
    c;
    d;
    e;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0024.d.ts]
declare function maybe(): boolean;
declare function t24(): void;
