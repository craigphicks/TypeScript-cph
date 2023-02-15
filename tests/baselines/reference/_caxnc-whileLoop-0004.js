//// [_caxnc-whileLoop-0004.ts]
// loop finished due to truthy never, loopCount=2
function t4(){
    let b = false;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loop finished due to truthy never, loopCount=2"
    while (d){
        d = c;
        c = b;
        b;
        c;
        d;
        let x = d;
    }
    let e = b;
    [b,c,d,e];
}


//// [_caxnc-whileLoop-0004.js]
"use strict";
// loop finished due to truthy never, loopCount=2
function t4() {
    var b = false;
    var c = true;
    var d = true;
    // @ts-dev-expect-string "loop finished due to truthy never, loopCount=2"
    while (d) {
        d = c;
        c = b;
        b;
        c;
        d;
        var x = d;
    }
    var e = b;
    [b, c, d, e];
}


//// [_caxnc-whileLoop-0004.d.ts]
declare function t4(): void;
