// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare function f(p:1): 1;
declare function f(p:2): 2;

declare const a: 1|2;
// @ts-ignore-error 2769
if (1===f(a))
{
    a;
}
else {
    a;
}
a;
