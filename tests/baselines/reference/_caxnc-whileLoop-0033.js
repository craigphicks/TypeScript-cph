//// [_caxnc-whileLoop-0033.ts]
declare function maybe(): boolean;
function t33(){
    let b1 = true;
    let b2 = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b1){
        b1;b2;
        // @ts-dev-expect-string "loopCount:1, invocations:2"
        while (b2){
            b1;b2;
            if (maybe()) break;
        }
        b1;b2;
        if (maybe()) break;
    }
    b1;b2;
}


//// [_caxnc-whileLoop-0033.js]
"use strict";
function t33() {
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
            if (maybe())
                break;
        }
        b1;
        b2;
        if (maybe())
            break;
    }
    b1;
    b2;
}


//// [_caxnc-whileLoop-0033.d.ts]
declare function maybe(): boolean;
declare function t33(): void;
