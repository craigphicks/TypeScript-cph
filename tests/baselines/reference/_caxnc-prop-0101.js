//// [_caxnc-prop-0101.ts]
declare type X = {
    foo: boolean;
};
declare const x:X;

function prop0001(){
    if (x.foo){
        let y = x.foo;
        y;
    }
    else {
        let z = x.foo;
        z;
    }
}

//// [_caxnc-prop-0101.js]
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


//// [_caxnc-prop-0101.d.ts]
declare type X = {
    foo: boolean;
};
declare const x: X;
declare function prop0001(): void;
