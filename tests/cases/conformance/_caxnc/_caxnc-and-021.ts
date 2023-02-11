// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true 
// @declaration: true
declare const b1: true | false;
declare const b2: true | false;
if (b2 && b1){
    
}
else if (b2 || b1){
    if (b1){
        b1;
        b2; // b2 should be false
    }
    else {
        b1;
        b2; // b2 should be true
    }
}
else {
    b1;
    b2;
}
