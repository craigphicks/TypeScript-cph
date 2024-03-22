//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0104.ts] ////

//// [_caxnc-whileLoop-0104.ts]
function t4(){
    let b = false;
    let c = true;
    let d = true;

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


//// [_caxnc-whileLoop-0104.js]
"use strict";
function t4() {
    var b = false;
    var c = true;
    var d = true;
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


//// [_caxnc-whileLoop-0104.d.ts]
declare function t4(): void;
