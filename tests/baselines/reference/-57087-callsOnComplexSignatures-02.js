//// [tests/cases/compiler/-test/-57087-callsOnComplexSignatures-02.ts] ////

//// [-57087-callsOnComplexSignatures-02.ts]
type MyArray<T> = {
    [n: number]: T;
    forEach(callbackfn: (value: T, index: number, array: MyArray<T>) => unknown): void;
};



function test3(items: MyArray<string> | MyArray<number>) {
    items.forEach(item => console.log(item));
}

//// [-57087-callsOnComplexSignatures-02.js]
"use strict";
function test3(items) {
    items.forEach(function (item) { return console.log(item); });
}
