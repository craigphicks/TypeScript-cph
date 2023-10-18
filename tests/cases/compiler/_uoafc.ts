// @target: es6
interface Fizz {
    id: number;
    fizz: string;
}

interface Buzz {
    id: number;
    buzz: string;
}
([] as Fizz[]).filter(item => item.id < 5) satisfies Fizz[];
([] as Fizz[]).filter(Boolean) satisfies Fizz[];
([] as Fizz[]).filter(new Boolean) satisfies Fizz[]; // expect error

([] as Fizz[] | Buzz[]).filter(item => item.id < 5) satisfies Fizz[] | Buzz[];
([] as Fizz[] | Buzz[]).filter(Boolean) satisfies Fizz[] | Buzz[];
([] as Fizz[] | Buzz[]).filter(new Boolean) satisfies Fizz[] | Buzz[]; // expect error

