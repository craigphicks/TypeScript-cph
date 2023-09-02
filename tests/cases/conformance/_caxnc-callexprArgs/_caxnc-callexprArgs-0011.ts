// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare function f(p:1,q:1): 1;
declare function f(p:2,q:2): 2;
declare function f(p:3,q:3): 3;
declare function f(...args:any[]): never;
declare const a: 1|2|3;
declare const b: 1|2|3;

const rt = f(a,b);
if (rt === 1) {
    a;b;
}
else if (rt === 2) {
    a;b;
}
else if (rt === 3) {
    a;b;
}
else {
    a;b;
}
a;b;
