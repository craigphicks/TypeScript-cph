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


([] as (Fizz|Falsey)[] | (Buzz|Falsey)[]).filter(Boolean); // expect type (Fizz|Buzz)[]
