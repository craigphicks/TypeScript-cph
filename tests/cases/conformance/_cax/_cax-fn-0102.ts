// @strict: true
// @declaration: true
declare const bar: boolean;
declare function isTrue(b:boolean): b is true;
const rab2 = bar ? !isTrue(bar) : isTrue(bar);
const foo = rab2;
if (foo) {
    const x = bar;
}
