//// [_caxnc-callexprArgs-0010.ts]
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


//// [_caxnc-callexprArgs-0010.js]
"use strict";
var rt = f(a);
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


//// [_caxnc-callexprArgs-0010.d.ts]
declare function f(p: 1): 1;
declare function f(p: 2): 2;
declare function f(p: 3): 3;
declare function f(p: any): never;
declare const a: 1 | 2 | 3;
declare const rt: never;
