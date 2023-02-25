//// [_caxnc-whileLoop-0004.ts]
function t4(){
    let b = false;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:3, invocations:1"
    while (d){
        d = c;
        c = b;
        b;
        c;
        d;
        let x = d;
    }
    let e = b;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0004.js]
"use strict";
function t4() {
    var b = false;
    var c = true;
    var d = true;
    // @ts-dev-expect-string "loopCount:3, invocations:1"
    while (d) {
        d = c;
        c = b;
        b;
        c;
        d;
        var x = d;
    }
    var e = b;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0004.d.ts]
declare function t4(): void;
