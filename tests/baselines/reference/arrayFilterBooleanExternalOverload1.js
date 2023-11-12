//// [tests/cases/compiler/arrayFilterBooleanExternalOverload1.ts] ////

//// [arrayFilterBooleanExternalOverload1.ts]
// #56013

declare const maybe: boolean;
{
    const id = <T>() => (t: T) => !!t;

    const result1 = (maybe ? ['foo', 'bar', undefined] : [1] ).filter(id());

    result1;

    const result2 = ['foo', 'bar', undefined].filter(id()); // want id() = (t: string) => boolean

    result2;
}


//// [arrayFilterBooleanExternalOverload1.js]
"use strict";
// #56013
{
    const id = () => (t) => !!t;
    const result1 = (maybe ? ['foo', 'bar', undefined] : [1]).filter(id());
    result1;
    const result2 = ['foo', 'bar', undefined].filter(id()); // want id() = (t: string) => boolean
    result2;
}


//// [arrayFilterBooleanExternalOverload1.d.ts]
declare const maybe: boolean;
