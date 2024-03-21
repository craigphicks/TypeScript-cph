// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare function maybe(): boolean;
type T = { a: string } | { b: number };
declare const x: T;

if ("a" in x) {
    x;
}
else {
    x;
}
x;