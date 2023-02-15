//// [_caxnc-whileLoop-0001.ts]
// This loop terminates at 1 iteration
function t1(){
    let b = true;
    b;
    // @ts-dev-expect-string "loop finished due to truthy never, loopCount=1"
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

//// [_caxnc-whileLoop-0001.js]
"use strict";
// This loop terminates at 1 iteration
function t1() {
    var b = true;
    b;
    // @ts-dev-expect-string "loop finished due to truthy never, loopCount=1"
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


//// [_caxnc-whileLoop-0001.d.ts]
declare function t1(): void;
