//// [_caxnc-eqneqLRNindep-0001.ts]
let x: string | number = 1;
let y: string | number = 1;
x;
y;
// error TS2367: This condition will always return 'false' since the types 'number' and 'string' have no overlap.
if (x===(y="one")){
    x;y;
}
else {
    x;y;
}

//// [_caxnc-eqneqLRNindep-0001.js]
"use strict";
var x = 1;
var y = 1;
x;
y;
// error TS2367: This condition will always return 'false' since the types 'number' and 'string' have no overlap.
if (x === (y = "one")) {
    x;
    y;
}
else {
    x;
    y;
}


//// [_caxnc-eqneqLRNindep-0001.d.ts]
declare let x: string | number;
declare let y: string | number;
