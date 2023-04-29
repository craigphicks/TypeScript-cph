/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */

declare const xany: any;
declare const xunknown: unknown;

declare const xnumber: number;

let x: any;
x = 1;
x; // any
let y = x;
y; // any

let p: unknown;
p = 1;
p; // unknown
let q = p;
q; // unknown

if (typeof x === "number") {
    x; // number (narrowed)
}
if (typeof p === "number") {
    p; // number (narrowed)
}

if (typeof xany === "number") {
  xany; // number (narrowed)
}
if (typeof xunknown === "number") {
  xunknown; // number (narrowed)
}