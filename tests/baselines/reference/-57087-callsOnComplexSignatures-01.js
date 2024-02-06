//// [tests/cases/compiler/-test/-57087-callsOnComplexSignatures-01.ts] ////

//// [-57087-callsOnComplexSignatures-01.ts]
function test3(items: string[] | number[]) {
    items.forEach(item => console.log(item)); // must not be error
//                   ~~~~~~~~~~~~~~~~~~~~~~~~~
// !!! error TS2345: Argument of type '(item: string | number) => void' is not assignable to parameter of type '((value: string, index: number, array: string[]) => void) & ((value: number, index: number, array: number[]) => void)'.
}

//// [-57087-callsOnComplexSignatures-01.js]
"use strict";
function test3(items) {
    items.forEach(function (item) { return console.log(item); }); // must not be error
    //                   ~~~~~~~~~~~~~~~~~~~~~~~~~
    // !!! error TS2345: Argument of type '(item: string | number) => void' is not assignable to parameter of type '((value: string, index: number, array: string[]) => void) & ((value: number, index: number, array: number[]) => void)'.
}
