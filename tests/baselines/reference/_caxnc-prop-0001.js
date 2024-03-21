//// [_caxnc-prop-0001.ts]
declare type X = {
    foo: boolean;
};
declare const x:X;

function prop0001(){
    if (x.foo){
        const y = x.foo;
        y;
    }
    else {
        const z = x.foo;
        z;
    }
}

//// [_caxnc-prop-0001.js]
"use strict";
function prop0001() {
    if (x.foo) {
        var y = x.foo;
        y;
    }
    else {
        var z = x.foo;
        z;
    }
}


//// [_caxnc-prop-0001.d.ts]
declare type X = {
    foo: boolean;
};
declare const x: X;
declare function prop0001(): void;
