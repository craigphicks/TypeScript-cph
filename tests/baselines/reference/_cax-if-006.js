//// [_cax-if-006.ts]
declare const c1: true | false;
declare const c2: true | false;

if (c1){
} 
else if (c2) {
    c1;
    c2;
}
else {
    c1;
    c2    
}
c1;
c2;



//// [_cax-if-006.js]
"use strict";
if (c1) {
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


//// [_cax-if-006.d.ts]
declare const c1: true | false;
declare const c2: true | false;
