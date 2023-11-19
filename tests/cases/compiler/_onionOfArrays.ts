// @strict: true
// @target: es6
// @declaration: true

interface Fizz {
    id: number;
    member: number;
}
interface Buzz {
    id: number;
    member: string;
}
type Falsey = "" | 0 | false | null | undefined;



//const f = (x: any) => x && typeof x.member === "number";

([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter(x => x && x.member); // expect type (Fizz|Buzz|Falsey)[]


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
