//// [tests/cases/compiler/unionOfArraysFilter-002.ts] ////

//// [unionOfArraysFilter-002.ts]
interface Fizz {
    id: number;
    fizz: number;
}

interface Buzz {
    id: number;
    buzz: string;
}

([] as Fizz[] | Buzz[]).filter(item => item.id < 5);
([] as Fizz[] | readonly Buzz[]).filter(item => item.id < 5);

([] as Fizz[] | Buzz[]).find(item => item);
declare function isFizz(x: unknown): x is Fizz;
([] as Fizz[] | Buzz[]).find(isFizz);
declare function isBuzz(x: unknown): x is Buzz;
([] as Fizz[] | Buzz[]).find(isBuzz);

([] as Fizz[] | Buzz[]).every(item => item.id < 5);

([] as Fizz[] | Buzz[]).reduce(item => item);


([] as [Fizz] | readonly [Buzz?]).filter(item => item?.id < 5);

//// [unionOfArraysFilter-002.js]
[].filter(item => item.id < 5);
[].filter(item => item.id < 5);
[].find(item => item);
[].find(isFizz);
[].find(isBuzz);
[].every(item => item.id < 5);
[].reduce(item => item);
[].filter(item => (item === null || item === void 0 ? void 0 : item.id) < 5);
