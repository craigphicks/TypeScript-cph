// @strict: true
// @target: es6
// @declaration: true

// #56013

interface F2<T extends number,U extends number> {
    (p1:undefined,p2:undefined):"00";
    (p1:(t:T)=>T,p2:(u:U)=>U):99;
}
type ID = <I>() => (i:I) => I;

declare const id: ID;

declare const maybe: boolean;

const f11 = (0 as any as F2<1,1>);
const f22 = (0 as any as F2<2,2>);
const f = maybe ? f11 : f22;

const x11 = f11(id(),id());
const x22 = f22(id(),id());

const t11 = f(id(),id());
// const t12 = (0 as any as F2<1,2>)(id(),id());
// const t21 = (0 as any as F2<2,1>)(id(),id());
//const t22 = f(id(),id());

// t11 satisfies 11;
// t12 satisfies 19;
// t21 satisfies 91;
//t22 satisfies 99;

