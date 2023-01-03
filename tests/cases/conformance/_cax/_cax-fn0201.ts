// @strict: true
// @declaration: true
// @exactOptionalPropertyTypes: true

let a: number | string = 1;
a = f(2);
let b = a
function f(x:number|string){
    x = a;
    if (typeof x === "string") return x;
    return x.toString();
}
