//// [_caxnc-whileLoop-0041.ts]
// declare function next(x:0): 1;
// declare function next(x:1): 2;
// declare function next(x:2): 3;
// declare function next(x:3): 0;
// declare function next(d:D): D;

function t4(){
    type D = 0 | 1 | 2 | 3 ;
    let d1: D = 0;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (true){
        // let d2: D = 0;
        // // // @ts-dev-expect-string "????"
        // while (true){
        //     if (d2===0) d2=1;
        //     else if (d2===1) d2=2;
        //     else if (d2===2) d2=3;
        //     else if (d2===3) {
        //         d2=0; break;
        //     }
        // }
        // d2;
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


//// [_caxnc-whileLoop-0041.js]
"use strict";
// declare function next(x:0): 1;
// declare function next(x:1): 2;
// declare function next(x:2): 3;
// declare function next(x:3): 0;
// declare function next(d:D): D;
function t4() {
    var d1 = 0;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (true) {
        // let d2: D = 0;
        // // // @ts-dev-expect-string "????"
        // while (true){
        //     if (d2===0) d2=1;
        //     else if (d2===1) d2=2;
        //     else if (d2===2) d2=3;
        //     else if (d2===3) {
        //         d2=0; break;
        //     }
        // }
        // d2;
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


//// [_caxnc-whileLoop-0041.d.ts]
declare function t4(): void;
