//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0006.ts] ////

//// [_caxnc-whileLoop-0006.ts]
// This loop terminates at 1 iteration
function t6(){
    let b = true;
    b;
    while (b){
        b = false;
    }
    b;
}

//// [_caxnc-whileLoop-0006.js]
"use strict";
// This loop terminates at 1 iteration
function t6() {
    var b = true;
    b;
    while (b) {
        b = false;
    }
    b;
}


//// [_caxnc-whileLoop-0006.d.ts]
declare function t6(): void;
