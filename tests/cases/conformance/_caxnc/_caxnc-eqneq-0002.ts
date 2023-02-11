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
//if (a!==b||b!==c)
if (a===b&&b===c)
{
    let x = a===c;
    x;
    a;
    b;
    c;

}
else {
    let y = a===c;
    y;
    a;
    b;
    c;
    if (a===c){
        let z = a===c;
        z;
        a;
        b;
        c;
    }
}
