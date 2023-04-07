// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true 
// @declaration: true

declare const c11: 0 | 1;
{
    let b: 0 | 1;
    const c31 = c11 || (b=c11);
    b;
}
