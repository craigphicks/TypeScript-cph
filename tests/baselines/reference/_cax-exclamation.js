//// [_cax-exclamation.ts]
declare const n: 0 | 1;
const b = !!n;
if (b){
    b;
} 
else {
    b;
}

//// [_cax-exclamation.js]
"use strict";
var b = !!n;
if (b) {
    b;
}
else {
    b;
}


//// [_cax-exclamation.d.ts]
declare const n: 0 | 1;
declare const b: boolean;
