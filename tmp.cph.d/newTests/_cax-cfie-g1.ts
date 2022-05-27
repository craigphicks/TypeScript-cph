// @noImplicitAny: true

let cond: boolean;
declare function foo(x: string): number;
declare function foo(x: number): string;
function g1() {
    let x: string | number | boolean;
    x = "";
    while (cond) {
        x = foo(x);
        x;
    }
    x; // should be string|number
}
