//// [tests/cases/compiler/_co/_co-onionOfArrays.ts] ////

//// [_co-onionOfArrays.ts]
interface Fizz {
    id: number;
    member: number;
}
interface Buzz {
    id: number;
    member: string;
}



//const f = (x: any) => x && typeof x.member === "number";

([] as (Fizz|undefined)[] | (Buzz|undefined)[]).filter(x => x && x.member); // expect type (Fizz|Buzz|Falsey)[]


//([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter(x => x && typeof x.member === "number"); // expect type (Fizz|Buzz|Falsey)[]

// namespace X {
// type BooleanConstructor = ()=>boolean;
// //var Boolean: BooleanConstructor = ()=>true;
// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor)); // expect type (Fizz|Buzz)[]
// }
//declare const arr: (Fizz|Falsey)[];

//([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor)); // expect type (Fizz|Buzz)[]

// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor),
//     ([] as any as (Fizz|Falsey)[] | (Buzz|Falsey)[])); // expect type (Fizz|Buzz)[]

// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor),
//     ([] as any as (Fizz|Falsey)[] | (Buzz|Falsey)[])); // expect type (Fizz|Buzz)[]


//// [_co-onionOfArrays.js]
"use strict";
//const f = (x: any) => x && typeof x.member === "number";
[].filter(x => x && x.member); // expect type (Fizz|Buzz|Falsey)[]
//([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter(x => x && typeof x.member === "number"); // expect type (Fizz|Buzz|Falsey)[]
// namespace X {
// type BooleanConstructor = ()=>boolean;
// //var Boolean: BooleanConstructor = ()=>true;
// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor)); // expect type (Fizz|Buzz)[]
// }
//declare const arr: (Fizz|Falsey)[];
//([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor)); // expect type (Fizz|Buzz)[]
// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor),
//     ([] as any as (Fizz|Falsey)[] | (Buzz|Falsey)[])); // expect type (Fizz|Buzz)[]
// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor),
//     ([] as any as (Fizz|Falsey)[] | (Buzz|Falsey)[])); // expect type (Fizz|Buzz)[]


//// [_co-onionOfArrays.d.ts]
interface Fizz {
    id: number;
    member: number;
}
interface Buzz {
    id: number;
    member: string;
}
