//// [tests/cases/compiler/-test/-57087-unionOfClassCalls-03.ts] ////

//// [-57087-unionOfClassCalls-03.ts]
{
    const arr: number[] | string[] = [];  // Works with Array<number | string>
    const arr1: number[]  = [];
    const arr2:  string[] = [];
    const t = arr.forEach((a: number | string, index: number) => {
        return index
    });
}


//// [-57087-unionOfClassCalls-03.js]
"use strict";
{
    var arr = []; // Works with Array<number | string>
    var arr1 = [];
    var arr2 = [];
    var t = arr.forEach(function (a, index) {
        return index;
    });
}
