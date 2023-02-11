//// [_cax-eqneq-0001.ts]
// declare function f(x:1,y:1): 1;
// declare function f(x:2,y:2): 2;
// declare function f(x:3,y:3): 2;

declare const a: 1|2;
declare const b: 1|2;
declare const c: 1|2;
//if (a!==b||b!==c)
if (a===b&&b===c)
{
    let x = a===c;
    x;
}
else {
    let y = a===c;
    y;
}


//// [_cax-eqneq-0001.js]
"use strict";
// declare function f(x:1,y:1): 1;
// declare function f(x:2,y:2): 2;
// declare function f(x:3,y:3): 2;
//if (a!==b||b!==c)
if (a === b && b === c) {
    var x = a === c;
    x;
}
else {
    var y = a === c;
    y;
}


//// [_cax-eqneq-0001.d.ts]
declare const a: 1 | 2;
declare const b: 1 | 2;
declare const c: 1 | 2;
