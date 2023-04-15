//// [_caxnc-whileLoop-0047.ts]
function t47(){
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: 0 | 1 | 2 | 999"
    let d1: 0 | 1 | 2 | 999 = 0;
    d1;

    while (true){
        d1;
        if (d1===0){
            d1 ;
            d1=1;
            d1  ;
        }
        else if (d1===1) {
            d1   ;
            break;
        }
        else if (d1===999){
            d1    ;
        }
    }
    d1;
}


//// [_caxnc-whileLoop-0047.js]
"use strict";
function t47() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: 0 | 1 | 2 | 999"
    var d1 = 0;
    d1;
    while (true) {
        d1;
        if (d1 === 0) {
            d1;
            d1 = 1;
            d1;
        }
        else if (d1 === 1) {
            d1;
            break;
        }
        else if (d1 === 999) {
            d1;
        }
    }
    d1;
}


//// [_caxnc-whileLoop-0047.d.ts]
declare function t47(): void;
