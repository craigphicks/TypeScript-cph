// @strict: true
// @target: es6
// @declaration: true

// #56013

interface F<T extends number> {
    (p1:undefined):"00";
    (p1:(t:T)=>T):"99";
}
type ID = <I>() => (i:I) => I;
declare const id: ID;

declare const maybe: boolean;

const f1 = (0 as any as F<1>);
const f2 = (0 as any as F<2>);
const f12 = maybe ? f1 : f2;

const x1 = f1(id());
const x2 = f2(id());
const x12 = f12(id());

