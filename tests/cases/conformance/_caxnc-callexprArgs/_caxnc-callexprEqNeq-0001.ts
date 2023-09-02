// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare function f(x:1): 1;
declare function f(x:2): 2;


declare const x: 1|2;
// @ts-ignore-error 2769
if (f(x)===1)
{
    x;
}
else {
    x;
}
x;
