//// [_caxnc-eqneq-0003.ts]
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

}
else {
    aeqb;
    beqc;
    aeqc;
    a;
    b;
    c;
    if (aeqc){
        aeqb;
        beqc;
        aeqc;
        a;
        b;
        c;
    }
}


//// [_caxnc-eqneq-0003.js]
"use strict";
// declare function f(x:1,y:1): 1;
// declare function f(x:2,y:2): 2;
// declare function f(x:3,y:3): 2;
var aeqb = a === b;
var beqc = b === c;
var aeqc = a === c;
if (aeqb && beqc) {
    aeqb;
    beqc;
    aeqc;
    a;
    b;
    c;
}
else {
    aeqb;
    beqc;
    aeqc;
    a;
    b;
    c;
    if (aeqc) {
        aeqb;
        beqc;
        aeqc;
        a;
        b;
        c;
    }
}


//// [_caxnc-eqneq-0003.d.ts]
declare const a: 1 | 2 | 3;
declare const b: 2 | 3 | 4;
declare const c: 3 | 4 | 5;
declare const aeqb: boolean;
declare const beqc: boolean;
declare const aeqc: boolean;
