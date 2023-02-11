//// [_cax-and-015.ts]
declare const b1: true | false;
declare const b2: true | false;
const ba = (b1 && b2) ? b1 : (b1) ? b1 : (b2) ? b2 : !b2; 

//// [_cax-and-015.js]
"use strict";
var ba = (b1 && b2) ? b1 : (b1) ? b1 : (b2) ? b2 : !b2;


//// [_cax-and-015.d.ts]
declare const b1: true | false;
declare const b2: true | false;
declare const ba: true;
