//// [_caxnc-whileLoop-0122.ts]
declare function maybe(): boolean;
function t22(){
    let b = true;
    let c = true;
    let d = true;

    while (d){
        d = c;
        c = b;
        b = maybe();
        if (!b) break;
    }
    let e = b;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0122.js]
"use strict";
function t22() {
    var b = true;
    var c = true;
    var d = true;
    while (d) {
        d = c;
        c = b;
        b = maybe();
        if (!b)
            break;
    }
    var e = b;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0122.d.ts]
declare function maybe(): boolean;
declare function t22(): void;
