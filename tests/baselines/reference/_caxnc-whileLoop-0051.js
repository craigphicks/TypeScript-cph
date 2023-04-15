//// [_caxnc-whileLoop-0051.ts]
function t51(){
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
    let d1 = 0;

    while (true){
        d1;
        if (d1===0) d1=1;
        else if (d1===1) d1=2;
        else if (d1===2) d1=3;
        else if (d1===3) {
            d1=0;
            break;
        }
    }
    d1;
}


//// [_caxnc-whileLoop-0051.js]
"use strict";
function t51() {
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
    var d1 = 0;
    while (true) {
        d1;
        if (d1 === 0)
            d1 = 1;
        else if (d1 === 1)
            d1 = 2;
        else if (d1 === 2)
            d1 = 3;
        else if (d1 === 3) {
            d1 = 0;
            break;
        }
    }
    d1;
}


//// [_caxnc-whileLoop-0051.d.ts]
declare function t51(): void;
