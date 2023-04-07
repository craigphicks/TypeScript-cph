// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true 
// @declaration: true

declare const c11: boolean;
{
    let a: boolean;
    let b: boolean;
    const c21 = (a=c11) || (b=c11);
    a;b;
}
