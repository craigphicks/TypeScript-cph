//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0154.ts] ////

//// [_caxnc-whileLoop-0154.ts]
// declare function next(x:0): 1;
// declare function next(x:1): 2;
// declare function next(x:2): 3;
// declare function next(x:3): 0;
// declare function next(d:D): D;

function t54(){
    let d1 = 0;

    while (true){
        let d2 = 0;

        while (true){
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


//// [_caxnc-whileLoop-0154.js]
"use strict";
// declare function next(x:0): 1;
// declare function next(x:1): 2;
// declare function next(x:2): 3;
// declare function next(x:3): 0;
// declare function next(d:D): D;
function t54() {
    var d1 = 0;
    while (true) {
        var d2 = 0;
        while (true) {
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


//// [_caxnc-whileLoop-0154.d.ts]
declare function t54(): void;
