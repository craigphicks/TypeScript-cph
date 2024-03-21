//// [_caxnc-whileLoop-0109.ts]
function t9(){
    let b = true;
    let c = true;
    let d = true;
    while (d){
        d = c;
        c = b;
        b;c;d; // expecting true,true,boolean
        [b,c,d]; // expecting [true,true,boolean] 
    }
    let e = b;
    b;c;d;e; // expecting true,true,false,true
    [b,c,d,e]; // expecting true,true,false,true
}


//// [_caxnc-whileLoop-0109.js]
"use strict";
function t9() {
    var b = true;
    var c = true;
    var d = true;
    while (d) {
        d = c;
        c = b;
        b;
        c;
        d; // expecting true,true,boolean
        [b, c, d]; // expecting [true,true,boolean] 
    }
    var e = b;
    b;
    c;
    d;
    e; // expecting true,true,false,true
    [b, c, d, e]; // expecting true,true,false,true
}


//// [_caxnc-whileLoop-0109.d.ts]
declare function t9(): void;
