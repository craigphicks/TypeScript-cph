//// [_cax-and-003.ts]
declare const b1: true | false;
declare const b2: true | false;
if (b1 && b2){
    b1;
    b2;
}
else if (b1){
    b1;
    b2;
}
// else if (b2){
//     b1;
//     b2;
// }
// else {
//     b1;
//     b2;
// }


//// [_cax-and-003.js]
"use strict";
if (b1 && b2) {
    b1;
    b2;
}
else if (b1) {
    b1;
    b2;
}
// else if (b2){
//     b1;
//     b2;
// }
// else {
//     b1;
//     b2;
// }


//// [_cax-and-003.d.ts]
declare const b1: true | false;
declare const b2: true | false;
