// @floughEnable: true
// @floughConstraintsEnable: true
// @strict: true 
// @declaration: true

declare const c1: true | false;
declare const c2: true | false;
if (c1 && c2){}
else {
    c1 && c2;
} 
