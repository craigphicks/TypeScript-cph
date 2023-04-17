// @floughEnable: true
// @floughConstraintsEnable: true
// @strict: true 
// @declaration: true
declare const c1: 0 | 1;
declare const c2: 0 | 1;
if (c1 && c2) {
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

// expect
// if (c1 && c2) {
// >c1 && c2 : 0 | 1
// >c1 : 0 | 1
// >c2 : 0 | 1

//     c1;
// >c1 : 1

//     c2; 
// >c2 : 1
// }
// else if (c1) {
// >c1 : 0 | 1

//     c1;
// >c1 : 1

//     c2;
// >c2 : 0
// } 
// else if (c2) {
// >c2 : 0 | 1

//     c1;
// >c1 : 0

//     c2;
// >c2 : 1
// }
// else {
//     c1;
// >c1 : 0

//     c2;
// >c2 : 0
// }
// c1;
// >c1 : 0 | 1

// c2;
// >c2 : 0 | 1
    