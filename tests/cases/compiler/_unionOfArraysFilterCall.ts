// @target: es6
interface Fizz {
    id: number;
    fizz: string;
}

interface Buzz {
    id: number;
    buzz: string;
}

// ([] as Fizz[] | Buzz[]).filter(item => item.id < 5);
// ([] as Fizz[] | readonly Buzz[]).filter(item => item.id < 5);

// ([] as Fizz[] | Buzz[]).find(item => item);
declare function isFizz(x: unknown): x is Fizz;
([] as Fizz[] | Buzz[]).find(isFizz);

// type Find<T> = <S extends T>(predicate: (value: T, index: number, obj: T[]) => value is S, thisArg?: any) => S | undefined;

// isFizz satisfies Find<Fizz>;
// isFizz satisfies Find<any>;

// type Check<T> = typeof isFizz extends Find<T> ? true : false
// type C1 = Check<Fizz>;
// type C2 = Check<any>;


// declare function isBuzz(x: unknown): x is Buzz;
// ([] as Fizz[] | Buzz[]).find(isBuzz);

// ([] as Fizz[] | Buzz[]).every(item => item.id < 5);

// ([] as Fizz[] | Buzz[]).reduce(item => item);


// ([] as [Fizz] | readonly [Buzz?]).filter(item => item?.id < 5);