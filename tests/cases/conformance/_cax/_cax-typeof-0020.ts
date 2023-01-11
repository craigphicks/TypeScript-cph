// @strict: true 
// @declaration: true

declare const a: number|string;
declare const b: number|boolean;
const xa = typeof a;
xa;
const xb = typeof b;
xb;
if (xa==="number"){
    a;
    xa;
}
if (typeof a ==="number"){
    a;
    xa;
}
