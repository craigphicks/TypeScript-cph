//// [_caxnc-decl-0013.ts]
declare const b: boolean;
function decl0013(){
    let x;
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = [0];
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = "1";
    }
    x; // flow not trigger without x here
    let y = x;
    y;
}


//// [_caxnc-decl-0013.js]
"use strict";
function decl0013() {
    var x;
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = [0];
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = "1";
    }
    x; // flow not trigger without x here
    var y = x;
    y;
}


//// [_caxnc-decl-0013.d.ts]
declare const b: boolean;
declare function decl0013(): void;
