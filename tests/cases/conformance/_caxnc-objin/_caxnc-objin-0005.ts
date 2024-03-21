// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare function maybe(): boolean;
type T = { a: string } | { b: number };
declare const x: T;

if ("a" in x) {
    x;
    "b" in x; // checker resolves this as "boolean", although flough resolves it as "false"
}
