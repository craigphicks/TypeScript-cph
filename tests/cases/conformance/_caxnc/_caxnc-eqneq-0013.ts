// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true

// declare function f(x:1,y:1): 1;
// declare function f(x:2,y:2): 2;
// declare function f(x:3,y:3): 2;

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
    let x1 = a===b;
    let y1 = b===c;
    let z1 = a===c;
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
    let x2 = a===b;
    let y2 = b===c;
    let z2 = a===c;
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
        let x3 = a===b;
        let y3 = b===c;
        let z3 = a===c;
        x3;
        y3;
        z3;
    }
}
