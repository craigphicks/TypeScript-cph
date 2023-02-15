//// [_caxnc-whileLoop-0011.ts]
// this loop never terminates because if always continues
declare function maybe(x:boolean): boolean;
function t11(){
    let d = true;
    // @ts-dev-expect-string "loop finished due to type map converged, loopCount=1"
    while (d){
        d=false;
        if (maybe(d)) continue;
        d=true;
        if (maybe(d)) continue;
        d  =  false;
    }
}


//// [_caxnc-whileLoop-0011.js]
"use strict";
function t11() {
    var d = true;
    // @ts-dev-expect-string "loop finished due to type map converged, loopCount=1"
    while (d) {
        d = false;
        if (maybe(d))
            continue;
        d = true;
        if (maybe(d))
            continue;
        d = false;
    }
}


//// [_caxnc-whileLoop-0011.d.ts]
declare function maybe(x: boolean): boolean;
declare function t11(): void;
