//// [_caxnc-and-012.ts]
declare const b1: true;
//declare const b2: true | false;
const ba = b1 ? b1 : b1 ? b1 : b1; 

//// [_caxnc-and-012.js]
"use strict";
//declare const b2: true | false;
var ba = b1 ? b1 : b1 ? b1 : b1;


//// [_caxnc-and-012.d.ts]
declare const b1: true;
declare const ba: true;
