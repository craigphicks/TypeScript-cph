//// [tests/cases/compiler/-test/-57087-unionOfClassCalls-22.ts] ////

//// [-57087-unionOfClassCalls-22.ts]
{
    const arr: number[] | string[] = [];  // Works with Array<number | string>
    const t = arr.reduce((acc,a) => acc+a)
}


//// [-57087-unionOfClassCalls-22.js]
"use strict";
{
    var arr = []; // Works with Array<number | string>
    var t = arr.reduce(function (acc, a) { return acc + a; });
}
