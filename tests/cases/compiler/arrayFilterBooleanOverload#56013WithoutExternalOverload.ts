// @strict: true
// @target: es6
// @declaration: true

interface Array<T> {
    filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
    // This overload is not part of the external API, and it triggers the bug. #56013
    // Even though the return type is not complex, and the order is correct.
    filter(predicate: BooleanConstructor, thisArg?: any): T[];
    filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
};

type NonFalsy<T> = T extends false | 0 | "" | null | undefined | 0n
    ? never
    : T;

const id = <T,>() => (t: T) => !!t;

['foo', 'bar'].filter(id()); // // expect id() = (t: string) => boolean

['foo', 'bar', 1].filter(id()); // // expect id() = (t: string | number) => boolean

['foo', 'bar', undefined].filter(id()); // expect id() = (t: string | undefined) => boolean

declare const maybe: boolean;
(maybe ? ['foo', 'bar'] : [1] ).filter(id()); // fails for union types
//                                     ~~~~
// const id: <unknown>() => (t: unknown) => boolean
// Argument of type '(t: unknown) => boolean' is not assignable to parameter of type 'BooleanConstructor'.
// Type '(t: unknown) => boolean' provides no match for the signature 'new (value?: any): Boolean'.ts(2345
