//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0152.ts] ////

//// [_caxnc-whileLoop-0152.ts]
function t52(){
    let d1 = 0;

    while (true){
        let d2 = 0;
        d2;

        while (true){
            d1;
            if (d2===0) d2=1;
            else if (d2===1) d2=2;
            else if (d2===2) d2=3;
            else if (d2===3) {
                d2=0; break;
            }
        }
        d2;
        d1;
        if (d1===0) d1=1;
        else if (d1===1) d1=2;
        else if (d1===2) d1=3;
        else if (d1===3) {
            d1=0;
            break;
        }
    }
    d1;
}


//// [_caxnc-whileLoop-0152.js]
"use strict";
function t52() {
    var d1 = 0;
    while (true) {
        var d2 = 0;
        d2;
        while (true) {
            d1;
            if (d2 === 0)
                d2 = 1;
            else if (d2 === 1)
                d2 = 2;
            else if (d2 === 2)
                d2 = 3;
            else if (d2 === 3) {
                d2 = 0;
                break;
            }
        }
        d2;
        d1;
        if (d1 === 0)
            d1 = 1;
        else if (d1 === 1)
            d1 = 2;
        else if (d1 === 2)
            d1 = 3;
        else if (d1 === 3) {
            d1 = 0;
            break;
        }
    }
    d1;
}


//// [_caxnc-whileLoop-0152.d.ts]
declare function t52(): void;
