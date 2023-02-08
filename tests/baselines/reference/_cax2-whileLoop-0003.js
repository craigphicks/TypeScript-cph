//// [_cax2-whileLoop-0003.ts]
// This loop converges after 1 iteration, but never terminates, so e is never
function t3(){
    let b = true;
    let c = true;
    let d = true;
    while (d){
        d = c;
        c = b;
        [b,c,d];
    }
    let e = b;
    [b,c,d,e];
}


//// [_cax2-whileLoop-0003.js]
"use strict";
// This loop converges after 1 iteration, but never terminates, so e is never
function t3() {
    var b = true;
    var c = true;
    var d = true;
    while (d) {
        d = c;
        c = b;
        [b, c, d];
    }
    var e = b;
    [b, c, d, e];
}


//// [_cax2-whileLoop-0003.d.ts]
declare function t3(): void;
