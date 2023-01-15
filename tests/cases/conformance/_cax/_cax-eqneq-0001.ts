// @strict: true
// @declaration: true

declare function f(x:1,y:1): 1;
declare function f(x:2,y:2): 2;
declare function f(x:3,y:3): 2;

declare const a: 1|2|3;
declare const b: 1|2|3;
declare const c: 1|2|3;
//if (a!==b||b!==c)
if (a===b&&b===c)
{
}
else {
    // @ts-expect-error No overload matches this call ts(2769)
    // const k = f(a,b);
    // if (a!==1){
    //     k;
    // }

}
