//// [_caxnc-whileLoop-0002.ts]
function t2(){
    let b = false;
    b;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b){
        let c = !b;
        c;
        let d = b;
        d;
        b = c;
    }
    let e = b;
    e;
    b;
}

//// [_caxnc-whileLoop-0002.js]
"use strict";
function t2() {
    var b = false;
    b;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b) {
        var c = !b;
        c;
        var d = b;
        d;
        b = c;
    }
    var e = b;
    e;
    b;
}


//// [_caxnc-whileLoop-0002.d.ts]
declare function t2(): void;
