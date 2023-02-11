//// [_caxyc-and-013.ts]
declare const b1: true | false;
declare const b2: true | false;
const ba = (b1 && b2) ? b1 : (b1) ? b1 : b2; 

//// [_caxyc-and-013.js]
"use strict";
var ba = (b1 && b2) ? b1 : (b1) ? b1 : b2;


//// [_caxyc-and-013.d.ts]
declare const b1: true | false;
declare const b2: true | false;
declare const ba: boolean;
