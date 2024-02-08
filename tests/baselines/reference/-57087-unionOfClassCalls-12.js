//// [tests/cases/compiler/-test/-57087-unionOfClassCalls-12.ts] ////

//// [-57087-unionOfClassCalls-12.ts]
{
    const arr: number[] | string[] = [];  // Works with Array<number | string>
    const t = arr.reduce((acc, a, index) => {
        return []
    }, [])

}


//// [-57087-unionOfClassCalls-12.js]
"use strict";
{
    var arr = []; // Works with Array<number | string>
    var t = arr.reduce(function (acc, a, index) {
        return [];
    }, []);
}
