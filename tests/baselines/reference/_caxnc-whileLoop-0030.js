//// [_caxnc-whileLoop-0030.ts]
declare function maybe(): boolean;
function t30(){
    let b1 = true;
    let b2 = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b1){
        // @ts-dev-expect-string "loopCount:1, invocations:2"
        while (b2){
        }
    }
}


//// [_caxnc-whileLoop-0030.js]
"use strict";
function t30() {
    var b1 = true;
    var b2 = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b1) {
        // @ts-dev-expect-string "loopCount:1, invocations:2"
        while (b2) {
        }
    }
}


//// [_caxnc-whileLoop-0030.d.ts]
declare function maybe(): boolean;
declare function t30(): void;
