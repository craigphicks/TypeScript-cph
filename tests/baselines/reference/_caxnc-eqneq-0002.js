//// [_caxnc-eqneq-0002.ts]
// declare function f(x:1,y:1): 1;
// declare function f(x:2,y:2): 2;
// declare function f(x:3,y:3): 2;

declare const a: 1|2|3;
declare const b: 2|3|4;
declare const c: 3|4|5;
//if (a!==b||b!==c)
if (a===b&&b===c)
{
    const x = a===c;
    x;
    a;
    b;
    c;

}
else {
    const y = a===c;
    y;
    a;
    b;
    c;
    if (a===c){
        const z = a===c;
        z;
        a;
        b;
        c;
    }
}


//// [_caxnc-eqneq-0002.js]
"use strict";
// declare function f(x:1,y:1): 1;
// declare function f(x:2,y:2): 2;
// declare function f(x:3,y:3): 2;
//if (a!==b||b!==c)
if (a === b && b === c) {
    var x = a === c;
    x;
    a;
    b;
    c;
}
else {
    var y = a === c;
    y;
    a;
    b;
    c;
    if (a === c) {
        var z = a === c;
        z;
        a;
        b;
        c;
    }
}


//// [_caxnc-eqneq-0002.d.ts]
declare const a: 1 | 2 | 3;
declare const b: 2 | 3 | 4;
declare const c: 3 | 4 | 5;
