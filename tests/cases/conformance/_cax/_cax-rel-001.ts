// @strict: true 
// @declaration: true
declare const c1: true | false;
declare const c2: true | false;

// if (c1){
//     c1;
//     if (c2){
//         c2;
//         c1;
//     }
//     c2;
// }
// c1;
// c2;

if (c1){
    // c1;
    // c2;
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

