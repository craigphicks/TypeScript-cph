//// [_caxyc-and-010.ts]
declare const b1: true | false;
const ba = b1 ? b1 : true; 

// Expecting:
// >ba : true
// >b1 ? b1 : true : true
// >b1 : boolean
// >b1 : true
// >true : true

//// [_caxyc-and-010.js]
"use strict";
var ba = b1 ? b1 : true;
// Expecting:
// >ba : true
// >b1 ? b1 : true : true
// >b1 : boolean
// >b1 : true
// >true : true


//// [_caxyc-and-010.d.ts]
declare const b1: true | false;
declare const ba: true;
