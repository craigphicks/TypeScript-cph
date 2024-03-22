//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0131.ts] ////

//// [_caxnc-whileLoop-0131.ts]
declare function maybe(): boolean;
function t31(){
    let b1 = true;
    let b2 = true;

    while (b1){
        b1;

        while (b2){
        }
    }
}


//// [_caxnc-whileLoop-0131.js]
"use strict";
function t31() {
    var b1 = true;
    var b2 = true;
    while (b1) {
        b1;
        while (b2) {
        }
    }
}


//// [_caxnc-whileLoop-0131.d.ts]
declare function maybe(): boolean;
declare function t31(): void;
