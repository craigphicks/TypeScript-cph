//// [_caxnc-if-004.ts]
declare const c1: 0 | 1;
declare const c2: 0 | 1;
if (c1 || c2) {
    c1;
    c2; 
}
else if (c1) {
    c1;
    c2;
} 
else if (c2) {
    c1;
    c2;
}
else {
    c1;
    c2;
}
c1;
c2;


//// [_caxnc-if-004.js]
"use strict";
if (c1 || c2) {
    c1;
    c2;
}
else if (c1) {
    c1;
    c2;
}
else if (c2) {
    c1;
    c2;
}
else {
    c1;
    c2;
}
c1;
c2;


//// [_caxnc-if-004.d.ts]
declare const c1: 0 | 1;
declare const c2: 0 | 1;
