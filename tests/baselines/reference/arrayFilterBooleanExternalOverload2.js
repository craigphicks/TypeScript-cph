//// [tests/cases/compiler/arrayFilterBooleanExternalOverload2.ts] ////

//// [arrayFilterBooleanExternalOverload2.ts]
// #56013

const symbool = Symbol("MyBooleanSymbol");
declare const MyBoolean: typeof Boolean & { prototype: typeof symbool };
interface Array<T> {
    filter(predicate: typeof MyBoolean): (T extends (0 | 0n | "" | false | null | undefined) ? never : T)[];
}

declare const maybe: boolean;
{
    const id = <T>() => (t: T) => !!t;

    const result1 = (maybe ? ['foo', 'bar', undefined] : [1] ).filter(id());

    result1;

    const result2 = ['foo', 'bar', undefined].filter(id()); // want id() = (t: string) => boolean

    result2;
}


//// [arrayFilterBooleanExternalOverload2.js]
"use strict";
// #56013
const symbool = Symbol("MyBooleanSymbol");
{
    const id = () => (t) => !!t;
    const result1 = (maybe ? ['foo', 'bar', undefined] : [1]).filter(id());
    result1;
    const result2 = ['foo', 'bar', undefined].filter(id()); // want id() = (t: string) => boolean
    result2;
}


//// [arrayFilterBooleanExternalOverload2.d.ts]
declare const symbool: unique symbol;
declare const MyBoolean: typeof Boolean & {
    prototype: typeof symbool;
};
interface Array<T> {
    filter(predicate: typeof MyBoolean): (T extends (0 | 0n | "" | false | null | undefined) ? never : T)[];
}
declare const maybe: boolean;
