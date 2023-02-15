//// [_caxnc-whileLoop-0020.ts]
declare function maybe(): boolean;
function t20(){
    let b = true;
    // In the following case on loopCount:1 the b of while (b) has type never because the loop exists at break before that
    // @ts-dev-expect-string "loop finished due to both truthy and falsy never (e.g. break), loopCount=1"
    while (b){
        if (b) break;
        b = false;
        b;
    }
    b;
}


//// [_caxnc-whileLoop-0020.js]
"use strict";
function t20() {
    var b = true;
    // In the following case on loopCount:1 the b of while (b) has type never because the loop exists at break before that
    // @ts-dev-expect-string "loop finished due to both truthy and falsy never (e.g. break), loopCount=1"
    while (b) {
        if (b)
            break;
        b = false;
        b;
    }
    b;
}


//// [_caxnc-whileLoop-0020.d.ts]
declare function maybe(): boolean;
declare function t20(): void;
