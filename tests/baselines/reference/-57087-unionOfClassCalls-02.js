//// [tests/cases/compiler/-test/-57087-unionOfClassCalls-02.ts] ////

//// [-57087-unionOfClassCalls-02.ts]
{
    const arr: number[] | string[] = [];  // Works with Array<number | string>
    const t = arr.reduce((acc: Array<string>, a: number | string, index: number) => {
        return []
    }, [])

}


//// [-57087-unionOfClassCalls-02.js]
"use strict";
{
    var arr = []; // Works with Array<number | string>
    var t = arr.reduce(function (acc, a, index) {
        return [];
    }, []);
}
