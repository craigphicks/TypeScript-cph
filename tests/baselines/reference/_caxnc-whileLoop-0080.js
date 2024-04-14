//// [tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0080.ts] ////

//// [_caxnc-whileLoop-0080.ts]
// @ floughDoNotWidenInitalizedFlowType: true

function f80() {
    while (true) {
    }
}


//// [_caxnc-whileLoop-0080.js]
"use strict";
// @ floughDoNotWidenInitalizedFlowType: true
function f80() {
    while (true) {
    }
}


//// [_caxnc-whileLoop-0080.d.ts]
declare function f80(): void;
