// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true 
// @declaration: true

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
