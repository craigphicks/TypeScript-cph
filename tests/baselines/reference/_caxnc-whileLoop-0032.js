//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0032.ts] ////

//// [_caxnc-whileLoop-0032.ts]
declare function maybe(): boolean;
function t32(){
    let b1 = true;
    let b2 = true;

    while (b1){
        b1;b2;

        while (b2){
            b1;b2;
        }
        b1;b2;
    }
    b1;b2;
}


//// [_caxnc-whileLoop-0032.js]
"use strict";
function t32() {
    var b1 = true;
    var b2 = true;
    while (b1) {
        b1;
        b2;
        while (b2) {
            b1;
            b2;
        }
        b1;
        b2;
    }
    b1;
    b2;
}


//// [_caxnc-whileLoop-0032.d.ts]
declare function maybe(): boolean;
declare function t32(): void;
