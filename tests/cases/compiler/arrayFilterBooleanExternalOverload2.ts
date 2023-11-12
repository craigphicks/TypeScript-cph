// @strict: true
// @target: es6
// @declaration: true

// #56013

const symbool = Symbol("MyBooleanSymbol");
declare const MyBoolean: typeof Boolean & { prototype: typeof symbool };
// (0 as any as typeof Boolean & { prototype: typeof Symbol }) satisfies typeof MyBoolean;  // fails, good

// const differentSymbool = Symbol("Boolean");
// (0 as any as typeof Boolean & { prototype: typeof differentSymbool }) satisfies typeof MyBoolean;  // fails, good

// (0 as any as typeof Boolean & { prototype: typeof symbool }) satisfies typeof MyBoolean;  // passes, good


interface Array<T> {
    // filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
    // filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
    filter(predicate: typeof MyBoolean): T[];
}

// {

// const id = <T,>() => (t: T) => !!t;

// const maybe = Math.random() > 0.5 ? true : false;
// // This original issue bug #56013 is that id() was not evaluated to its inferred type under these two conditions:
// // - external overload Array present as in this test
// // - union array type as in this test
// const result1 = (maybe ? ['foo', 'bar', undefined] : [1] ).filter(id());
// result1;

// // This non-union array types didn't show that bug
// const result2 = ['foo', 'bar', undefined].filter(id()); // want id() = (t: string) => boolean
// result2;

// }
declare const maybe: boolean;
{

    const id = <T>() => (t: T) => !!t;

    //const maybe = Math.random() > 0.5 ? true : false;
    // This original issue bug #56013 is that id() was not evaluated to its inferred type under these two conditions:
    // - external overload Array present as in this test
    // - union array type as in this test
    // const result1 = (maybe ? ['foo', 'bar', undefined] : [1] ).filter(fid);
    // result1;

    // This non-union array types didn't show that bug
    const result2 = ['foo', 'bar', undefined].filter(id()); // want id() = (t: string) => boolean
    result2;
}
// {

//     const id = <T,>() => (t: T) => !!t;

//     const maybe = Math.random() > 0.5 ? true : false;
//     // This original issue bug #56013 is that id() was not evaluated to its inferred type under these two conditions:
//     // - external overload Array present as in this test
//     // - union array type as in this test
//     const result1 = (maybe ? ['foo', 'bar', undefined] : [1] ).filter(MyBoolean);
//     result1;

//     // This non-union array types didn't show that bug
//     const result2 = ['foo', 'bar', undefined].filter(MyBoolean); // want id() = (t: string) => boolean
//     result2;

// }

