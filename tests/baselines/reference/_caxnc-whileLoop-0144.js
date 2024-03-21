//// [_caxnc-whileLoop-0144.ts]
function t44(){
    type D = 0 | 1 | 2 | 3 ;
    let d1: D = 0;
    d1; // expect 0
    while (true){
        let d2: D = d1;
        d1; // expect 0 | 1
        d2; // expect 0 | 1
        while (true){
            if (d2===0){
                d2=1;
            }
            else if (d2===1) {
                d2=2; break;
            }
        }
        d1; // expect 0 | 1
        d2; // expect 2
        if (d1===0){
            d1=1;
        }
        else if (d1===1) {
            d1=2; break;
        }
        d1; // expect 1
        d2; // expect 2
    }
    d1; // expect 2
}


//// [_caxnc-whileLoop-0144.js]
"use strict";
function t44() {
    var d1 = 0;
    d1; // expect 0
    while (true) {
        var d2 = d1;
        d1; // expect 0 | 1
        d2; // expect 0 | 1
        while (true) {
            if (d2 === 0) {
                d2 = 1;
            }
            else if (d2 === 1) {
                d2 = 2;
                break;
            }
        }
        d1; // expect 0 | 1
        d2; // expect 2
        if (d1 === 0) {
            d1 = 1;
        }
        else if (d1 === 1) {
            d1 = 2;
            break;
        }
        d1; // expect 1
        d2; // expect 2
    }
    d1; // expect 2
}


//// [_caxnc-whileLoop-0144.d.ts]
declare function t44(): void;
