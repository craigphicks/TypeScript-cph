//// [_caxnc-whileLoop-0020.ts]
declare function maybe(): boolean;
function t20(){
    let b = true;

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
