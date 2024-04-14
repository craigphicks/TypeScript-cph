//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0243.ts] ////

//// [_caxnc-whileLoop-0243.ts]
function t243(){
    type D = 0 | 1 | 2 | 3 ;
    let d1: D = 0;
    d1; // expect 0
    while (true){
        let d2: D = 0;
        // @ts-dev-expect-string "count: 0, type: 0 | 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
        d1;
        // @ts-dev-expect-string "count: 0, type: 0, assignedType: 0"
        // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
        d2;
        while (true){
            // @ts-dev-expect-string "count: 0, type: 0 | 1 | 2 | 3"
            // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
            d2;
            if (d2===0) {
                // @ts-dev-expect-string "count: 0, type: 0"
                // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
                d2;
                d2=1;
                // @ts-dev-expect-string "count: 0, type: 1, assignedType: 1"
                // @ts-dev-expect-string "count: 1, type: 1, assignedType: 1"
                d2;
                break;
            }
            // @ts-dev-expect-string "count: 0, type: 1 | 2 | 3"
            // @ts-dev-expect-string "count: 1, type: never"
            d2;
        }
        // @ts-dev-expect-string "count: 0, type: 0 | 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
        d1;
        // @ts-dev-expect-string "count: 0, type: 1, assignedType: 1"
        // @ts-dev-expect-string "count: 1, type: 1, assignedType: 1"
        d2;
        if (d1===0) {
            // @ts-dev-expect-string "count: 0, type: 0"
            // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
            d1;
            d1=1;
            break;
        }
        // @ts-dev-expect-string "count: 0, type: 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: never"
        d1;
        // @ts-dev-expect-string "count: 0, type: 1, assignedType: 1"
        // @ts-dev-expect-string "count: 1, type: never"
        d2;
    }
    // @ts-dev-expect-string "count: 0, type: 1"
    d1; // expect 1
}


//// [_caxnc-whileLoop-0243.js]
"use strict";
function t243() {
    var d1 = 0;
    d1; // expect 0
    while (true) {
        var d2 = 0;
        // @ts-dev-expect-string "count: 0, type: 0 | 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
        d1;
        // @ts-dev-expect-string "count: 0, type: 0, assignedType: 0"
        // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
        d2;
        while (true) {
            // @ts-dev-expect-string "count: 0, type: 0 | 1 | 2 | 3"
            // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
            d2;
            if (d2 === 0) {
                // @ts-dev-expect-string "count: 0, type: 0"
                // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
                d2;
                d2 = 1;
                // @ts-dev-expect-string "count: 0, type: 1, assignedType: 1"
                // @ts-dev-expect-string "count: 1, type: 1, assignedType: 1"
                d2;
                break;
            }
            // @ts-dev-expect-string "count: 0, type: 1 | 2 | 3"
            // @ts-dev-expect-string "count: 1, type: never"
            d2;
        }
        // @ts-dev-expect-string "count: 0, type: 0 | 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
        d1;
        // @ts-dev-expect-string "count: 0, type: 1, assignedType: 1"
        // @ts-dev-expect-string "count: 1, type: 1, assignedType: 1"
        d2;
        if (d1 === 0) {
            // @ts-dev-expect-string "count: 0, type: 0"
            // @ts-dev-expect-string "count: 1, type: 0, assignedType: 0"
            d1;
            d1 = 1;
            break;
        }
        // @ts-dev-expect-string "count: 0, type: 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: never"
        d1;
        // @ts-dev-expect-string "count: 0, type: 1, assignedType: 1"
        // @ts-dev-expect-string "count: 1, type: never"
        d2;
    }
    // @ts-dev-expect-string "count: 0, type: 1"
    d1; // expect 1
}


//// [_caxnc-whileLoop-0243.d.ts]
declare function t243(): void;
