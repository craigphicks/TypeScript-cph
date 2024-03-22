//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0002.ts] ////

//// [_caxnc-whileLoop-0002.ts]
function t2(){
    let b = false;
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

//// [_caxnc-whileLoop-0002.js]
"use strict";
function t2() {
    var b = false;
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


//// [_caxnc-whileLoop-0002.d.ts]
declare function t2(): void;
