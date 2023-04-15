//// [_caxnc-decl-0112.ts]
declare const b: boolean;
function decl0012(){
    let x: any;
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = [0];
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = "1";
    }
    x; // flow not trigger without x here
}


//// [_caxnc-decl-0112.js]
"use strict";
function decl0012() {
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
}


//// [_caxnc-decl-0112.d.ts]
declare const b: boolean;
declare function decl0012(): void;
