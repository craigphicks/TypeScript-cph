//// [_caxnc-whileLoop-0003.ts]
function t3(){
    let b = true;
    let c = true;
    let d = true;
    while (d){
        d = c;
        c = b;
        b;c;d; // expecting true,true,boolean
    }
    let e = b;
    b;c;d;e; // expecting true,true,false,true

}


//// [_caxnc-whileLoop-0003.js]
"use strict";
function t3() {
    var b = true;
    var c = true;
    var d = true;
    while (d) {
        d = c;
        c = b;
        b;
        c;
        d; // expecting true,true,boolean
    }
    var e = b;
    b;
    c;
    d;
    e; // expecting true,true,false,true
}


//// [_caxnc-whileLoop-0003.d.ts]
declare function t3(): void;
