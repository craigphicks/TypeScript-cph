// @strict: true
// @declaration: true
declare const bar: boolean;
const rab1 = !bar; // ? false : true;
const rab2 = bar ? false : true;
if (rab1) {
    const x = bar; // const x: false
}
if (rab2) {
    const x = bar; // const x: boolean   -- BUG
}
