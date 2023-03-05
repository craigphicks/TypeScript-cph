//// [_caxnc-decl-0011.ts]
declare const b: boolean;
function decl0011(){
    let x: [number];
    if (b) {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: [number]"
        x = [0];
    }
    else {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: [number]"
        x = [1];
    }
    x; // flow not trigger without x here
}


//// [_caxnc-decl-0011.js]
"use strict";
function decl0011() {
    var x;
    if (b) {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: [number]"
        x = [0];
    }
    else {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: [number]"
        x = [1];
    }
    x; // flow not trigger without x here
}


//// [_caxnc-decl-0011.d.ts]
declare const b: boolean;
declare function decl0011(): void;
