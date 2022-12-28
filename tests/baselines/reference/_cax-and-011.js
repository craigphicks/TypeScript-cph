//// [_cax-and-011.ts]
declare const b1: true | false;
declare const b2: true | false;
const ba = (b1 && b2) ? b1 : true; 

//// [_cax-and-011.js]
"use strict";
var ba = (b1 && b2) ? b1 : true;


//// [_cax-and-011.d.ts]
declare const b1: true | false;
declare const b2: true | false;
declare const ba: true;
