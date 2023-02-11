//// [_caxnc-and-025.ts]
declare const b1: true | false;
declare const b2: true | false;
const ba = (b1 && b2)
  ? [b1,b2]  
  : (b1 || b2) 
    ? (b1) 
      ? [b1,b2] // b2 should be false
      : [b1,b2] // b2 should be true
    : [b1,b2]


//// [_caxnc-and-025.js]
"use strict";
var ba = (b1 && b2)
    ? [b1, b2]
    : (b1 || b2)
        ? (b1)
            ? [b1, b2] // b2 should be false
            : [b1, b2] // b2 should be true
        : [b1, b2];


//// [_caxnc-and-025.d.ts]
declare const b1: true | false;
declare const b2: true | false;
declare const ba: boolean[];
