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


// namespace X {
// type BooleanConstructor = ()=>boolean;
// //var Boolean: BooleanConstructor = ()=>true;
// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor)); // expect type (Fizz|Buzz)[]
// }
//declare const arr: (Fizz|Falsey)[];

([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor)); // expect type (Fizz|Buzz)[]

// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor),
//     ([] as any as (Fizz|Falsey)[] | (Buzz|Falsey)[])); // expect type (Fizz|Buzz)[]

// ([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter((0 as any as BooleanConstructor),
//     ([] as any as (Fizz|Falsey)[] | (Buzz|Falsey)[])); // expect type (Fizz|Buzz)[]
