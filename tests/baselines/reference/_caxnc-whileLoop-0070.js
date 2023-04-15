//// [_caxnc-whileLoop-0070.ts]
function t70(){
    let b = true;
    let c = true;
    let d = true;
    while (d){
        d = c;
        c = b;
        b;c;d; // expecting true,true,boolean
        [b,c,d]; // expecting [true,true,boolean] 
        let e = b;
        b;c;d;e; // expecting true,true,boolean,true
        [b,c,d,e]; // expecting true,true,boolean,true
    }
}


//// [_caxnc-whileLoop-0070.js]
"use strict";
function t70() {
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
        var e = b;
        b;
        c;
        d;
        e; // expecting true,true,boolean,true
        [b, c, d, e]; // expecting true,true,boolean,true
    }
}


//// [_caxnc-whileLoop-0070.d.ts]
declare function t70(): void;
