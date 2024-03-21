//// [_caxnc-whileLoop-0134.ts]
declare function maybe(): boolean;
function t34(){
    let b1 = true;
    let b2 = true;
    loop1:

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


//// [_caxnc-whileLoop-0134.js]
"use strict";
function t34() {
    var b1 = true;
    var b2 = true;
    loop1: while (b1) {
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


//// [_caxnc-whileLoop-0134.d.ts]
declare function maybe(): boolean;
declare function t34(): void;
