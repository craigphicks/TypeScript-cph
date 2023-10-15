// @target: es6
interface Fizz {
    id: number;
    fizz: string;
}

interface Buzz {
    id: number;
    buzz: string;
}
([] as Fizz[]).filter(Boolean);
([] as Fizz[]).filter(item => item.id < 5);
([] as Fizz[] | Buzz[]).filter(Boolean);
([] as Fizz[] | Buzz[]).filter(item => item.id < 5);

