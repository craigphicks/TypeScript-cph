//// [_caxnc-prop-0000.ts]
declare type X = {
    foo: boolean;
};
declare const x:X;

function prop0001(){
    if (x.foo){
        x.foo;
    }
}

//// [_caxnc-prop-0000.js]
"use strict";
function prop0001() {
    if (x.foo) {
        x.foo;
    }
}


//// [_caxnc-prop-0000.d.ts]
declare type X = {
    foo: boolean;
};
declare const x: X;
declare function prop0001(): void;
