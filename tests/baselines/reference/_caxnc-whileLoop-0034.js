//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0034.ts] ////

//// [_caxnc-whileLoop-0034.ts]
declare function maybe(): boolean;
function t34(){
    let b1 = true;
    let b2 = true;
    // loop1: // unused labels are not allowed TS7028
    while (b1){
        b1;b2;

        while (b2){
            b1;b2;
            if (maybe()) {
                b2=false;
                break ;//loop1;
            }
        }
        b1;b2;
        //if (maybe()) break;
    }
    b1;b2;
}


//// [_caxnc-whileLoop-0034.js]
"use strict";
function t34() {
    var b1 = true;
    var b2 = true;
    // loop1: // unused labels are not allowed TS7028
    while (b1) {
        b1;
        b2;
        while (b2) {
            b1;
            b2;
            if (maybe()) {
                b2 = false;
                break; //loop1;
            }
        }
        b1;
        b2;
        //if (maybe()) break;
    }
    b1;
    b2;
}


//// [_caxnc-whileLoop-0034.d.ts]
declare function maybe(): boolean;
declare function t34(): void;
