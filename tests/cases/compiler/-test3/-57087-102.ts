// @strict: true
// @target: esnext
// @declaration: true

interface FMap<T,R> {
    f:(x:T)=>R
    g(f:(x:T)=>R):R;
}
declare const x1: FMap<1|2,1|2>;
x1.g(x1.f); // no error
declare const x2: FMap<2|3,"2"|"3">;
x2.g(x2.f); // no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g; // (method) FMap<T, R>.g(f: ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3")): 1 | 2 | "2" | "3"

function ft3(x:1):"3"; // should cause x.g(ft3) to error
function ft3(x:3):"3";
function ft3(x:2):2|"2";
function ft3(x:any):never;
function ft3(x:1|2|3){
    if (x===1) return x1.f(x);
    if (x===3) return x2.f(x);
    return Math.random() < 0.5 ? x1.f(x) : x2.f(x);
}
x.g(ft3); // should be error