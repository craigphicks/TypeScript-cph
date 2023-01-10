// @strict: true 
// @declaration: true

declare var a: unknown;
a = 1;
a;
let b = a;
b;
if (typeof a === "number"){
    a;
}
declare const c: unknown|any;
