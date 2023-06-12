// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const a: 1|2|3;
declare const b: 2|3|4;
declare const c: 3|4|5;
const aeqb=a===b;
const beqc=b===c;
const aeqc=a===c;

if (aeqb&&beqc)
{
    aeqb;
    beqc;
    aeqc;
    a;
    b;
    c;
    const x1 = a===b;
    const y1 = b===c;
    const z1 = a===c;
    x1;
    y1;
    z1;
}
else {
    aeqb;
    beqc;
    aeqc;
    a;
    b;
    c;
    const x2 = a===b;
    const y2 = b===c;
    const z2 = a===c;
    x2;
    y2;
    z2;
    if (aeqc){
        aeqb;
        beqc;
        aeqc;
        a;
        b;
        c;
        const x3 = a===b;
        const y3 = b===c;
        const z3 = a===c;
        x3;
        y3;
        z3;
    }
}
