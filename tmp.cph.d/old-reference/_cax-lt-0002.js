//// [_cax-lt-0002.ts]
declare const x: 0|1;
declare const y: 0|1;
if (x && y){
    x;
    y;
}
else if (x) {
    x;
    y;
}


//// [_cax-lt-0002.js]
"use strict";
if (x && y) {
    x;
    y;
}
else if (x) {
    x;
    y;
}


//// [_cax-lt-0002.d.ts]
declare const x: 0 | 1;
declare const y: 0 | 1;
