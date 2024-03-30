//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0081.ts] ////

//// [_caxnc-whileLoop-0081.ts]
// @ floughDoNotWidenInitalizedFlowType: true

declare function maybe(): boolean;
function f81() {
    let x = maybe();
    while (x) {
        x = maybe();
    }
}


//// [_caxnc-whileLoop-0081.js]
"use strict";
// @ floughDoNotWidenInitalizedFlowType: true
function f81() {
    var x = maybe();
    while (x) {
        x = maybe();
    }
}


//// [_caxnc-whileLoop-0081.d.ts]
declare function maybe(): boolean;
declare function f81(): void;
