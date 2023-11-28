// @strict: true
// @target: es6
// @declaration: true

interface Fizz {
    id: number;
    fizz: string;
}

interface Buzz {
    id: number;
    buzz: string;
}

declare function isFizz(x: unknown): x is Fizz;
//([] as Fizz[] | Buzz[]).find(isFizz);
([] as Buzz[]).find(isFizz);
