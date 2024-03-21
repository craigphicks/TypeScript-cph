//// [_caxnc-whileLoop-0012.ts]
// this loop never terminates because it always continues at `if (b)`
declare function maybe(): boolean;
function t12(){
    let b = true;
    let c = true;
    let d = true;

    while (d){
        d = c;
        c = b;
        if (b) {
            continue;
        }
        b = maybe();
    }
    let e = b;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0012.js]
"use strict";
function t12() {
    var b = true;
    var c = true;
    var d = true;
    while (d) {
        d = c;
        c = b;
        if (b) {
            continue;
        }
        b = maybe();
    }
    var e = b;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0012.d.ts]
declare function maybe(): boolean;
declare function t12(): void;
