//// [_caxnc-whileLoop-0002.ts]
// This loop terminates at 0 iteration
// loop finished due to truthy never, loopCount=0
function t2(){
    let b = false;
    b;
    // @ts-dev-expect-string "loop finished due to truthy never, loopCount=0"
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
// This loop terminates at 0 iteration
// loop finished due to truthy never, loopCount=0
function t2() {
    var b = false;
    b;
    // @ts-dev-expect-string "loop finished due to truthy never, loopCount=0"
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
