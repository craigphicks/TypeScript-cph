//// [_caxnc-prop-0003.ts]
declare enum X {one="1",two="2"};
declare const x:X;

function prop0003(){
    if (x===X.one){
        x;
    }
    else {
        x;
    }
}

//// [_caxnc-prop-0003.js]
"use strict";
;
function prop0003() {
    if (x === X.one) {
        x;
    }
    else {
        x;
    }
}


//// [_caxnc-prop-0003.d.ts]
declare enum X {
    one = "1",
    two = "2"
}
declare const x: X;
declare function prop0003(): void;
