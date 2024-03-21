// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const x: unknown;
declare const maybe: boolean;
let a = 1;
const b = 2;
let u = x;
if (maybe) {
    u = a;
    u;
}
else {
    u = b;
    u;
}
u;



