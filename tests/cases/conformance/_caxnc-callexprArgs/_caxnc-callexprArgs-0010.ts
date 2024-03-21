// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare function f(p:1): 1;
declare function f(p:2): 2;
declare function f(p:3): 3;
declare function f(p: any): never;
declare const a: 1|2|3;

const rt = f(a);
if (rt === 1) {
    a;
}
else if (rt === 2) {
    a;
}
else if (rt === 3) {
    a;
}
else {
    a;
}
a;
