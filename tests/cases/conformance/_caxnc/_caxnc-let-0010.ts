// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c1: true | false;
declare const c2: true | false;
let b1 = c1;
let b2 = c2;
if (b1){
    b1;
    b2;
    if (b2){
        b1;
        b2;
    }
    else {
        b1;
        b2;
    }
}
else {
    b1;
    b2;
}
