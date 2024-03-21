//// [_caxnc-whileLoop-0106.ts]
// This loop terminates at 1 iteration
function t6(){
    let b = true;
    b;
    while (b){
        b = false;
    }
    b;
}

//// [_caxnc-whileLoop-0106.js]
"use strict";
// This loop terminates at 1 iteration
function t6() {
    var b = true;
    b;
    while (b) {
        b = false;
    }
    b;
}


//// [_caxnc-whileLoop-0106.d.ts]
declare function t6(): void;
