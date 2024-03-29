// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c11: boolean;
let c12 = true
{
    const c21 = c11 || c12;
    c12 = c21;
}
const c31 = c12;
c12 = c31;
