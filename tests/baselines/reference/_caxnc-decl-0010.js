//// [_caxnc-decl-0010.ts]
declare const b: boolean;
function decl0010(){
    let x: number;
    if (b) {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: number"
        x = 0;
    }
    else {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: number"
        x = 1;
    }
    x; // flow not trigger without x here
}


//// [_caxnc-decl-0010.js]
"use strict";
function decl0010() {
    var x;
    if (b) {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: number"
        x = 0;
    }
    else {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: number"
        x = 1;
    }
    x; // flow not trigger without x here
}


//// [_caxnc-decl-0010.d.ts]
declare const b: boolean;
declare function decl0010(): void;
