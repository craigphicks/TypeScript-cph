//// [_caxnc-whileLoop-0032.ts]
declare function maybe(): boolean;
function t32(){
    let b1 = true;
    let b2 = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b1){
        b1;b2;
        // @ts-dev-expect-string "loopCount:1, invocations:2"
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
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b1) {
        b1;
        b2;
        // @ts-dev-expect-string "loopCount:1, invocations:2"
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
