//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0001.ts] ////

//// [_caxnc-whileLoop-0001.ts]
// This loop terminates at 1 iteration
function t1(){
    let b = true;
    b;

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
