//// [_caxnc-decl-0114.ts]
declare const b: boolean;
function decl0014(){
    let x: string | any[];
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | any[]"
        x = [0];
        x;
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | any[]"
        x = "1";
        x;
    }
    x;
    x = 2;
    x;
}


//// [_caxnc-decl-0114.js]
"use strict";
function decl0014() {
    var x;
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | any[]"
        x = [0];
        x;
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | any[]"
        x = "1";
        x;
    }
    x;
    x = 2;
    x;
}


//// [_caxnc-decl-0114.d.ts]
declare const b: boolean;
declare function decl0014(): void;
