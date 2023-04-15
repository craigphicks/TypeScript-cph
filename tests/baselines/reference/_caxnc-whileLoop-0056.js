//// [_caxnc-whileLoop-0056.ts]
function t56(){
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
    let d1 = 0;
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


//// [_caxnc-whileLoop-0056.js]
"use strict";
function t56() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
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


//// [_caxnc-whileLoop-0056.d.ts]
declare function t56(): void;
