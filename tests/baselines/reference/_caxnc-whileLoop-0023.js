//// [_caxnc-whileLoop-0023.ts]
declare function maybe(): boolean;
function t23(){
    let b = false;
    let c = true;
    let d = true;
    let x = false;


    while (d){
        if (c && maybe()){
            x = true; // gets set on iteration #0 only
            break;
        }
        d = c;
        c = b;
    }
    x; // x should be boolean - if (c && maybe()) "then" branches for each iteration need to "union" joined
    b; // b should be false
    c; // c should be boolean - ditto
    d; // d should be boolean - ditto
}


//// [_caxnc-whileLoop-0023.js]
"use strict";
function t23() {
    var b = false;
    var c = true;
    var d = true;
    var x = false;
    while (d) {
        if (c && maybe()) {
            x = true; // gets set on iteration #0 only
            break;
        }
        d = c;
        c = b;
    }
    x; // x should be boolean - if (c && maybe()) "then" branches for each iteration need to "union" joined
    b; // b should be false
    c; // c should be boolean - ditto
    d; // d should be boolean - ditto
}


//// [_caxnc-whileLoop-0023.d.ts]
declare function maybe(): boolean;
declare function t23(): void;
