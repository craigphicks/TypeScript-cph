type KFType<A extends 1 | 2, B extends 1 | 2> = [A,B] extends [2,2] ? (a: 2,b: 2) => -1 : (a: A,b: B) => A;
interface KF1 {
    <A extends 1 | 2, B extends 1 | 2>(a: A, b: B): ReturnType<KFType<A,B>>;
    (...args: any[]): never;
}

declare const a: 1 | 2;
declare const b: 1 | 2;
declare const kfunc: KF1;
{
    const a11 = kfunc(1,1); // 1, pass
    const a12 = kfunc(1,2); // 1, pass
    const a21 = kfunc(2,1); // 2, pass
    const a22 = kfunc(2,2); // -1, pass? (note it is not 1|2|-1)
    const a02 = kfunc(0,2); // never, pass
    const axx = kfunc(a,b); // 1|2, fail, should be 1|2|-1
 };

 type AB2 = & {
    x: BA2 | AB2;
 };

 type BA2 = & {
    x: AB2 | BA2;
 };

 type AB = & {
    x: BA;
 };

 type BA = & {
    x: AB;
 };

declare const ab2: AB2;
declare const ba: BA | AB;

declare function fab2(ab2: AB2): void;
const xab = fab2(ba); // pass

type AA = & {
    a: number;
    b: number;
};

type BB = & {
    a: string,
    c: number;
};

type AAandBB = AA & BB;
type AAorBB = AA | BB;

const cc1and: AAandBB = {
    a: 1, // error because a expect to be (string&number) which is never.
    b: 2,
    c: 3
};
// Type 'number' is not assignable to type 'never'.ts(2322)
// function-type-checking-test.ts(42, 5): The expected type comes from property 'a' which is declared here on type 'AAandBB'

const cc2and: AAandBB = {
    b: 2,
    c: 3
};
//Property 'a' is missing in type '{ b: number; c: number; }' but required in type '{ a: number; b: number; }'


const cc1or: AAorBB = {
    a: 1,
    b: 2,
    c: 3
};
// no error. Extra properties are allowed in each of AA and BB because types are not sealed.

const cc2or: AAandBB = {
    b: 2,
    c: 3
};
// Type '{ b: number; c: number; }' is not assignable to type 'AAandBB'.
//   Property 'a' is missing in type '{ b: number; c: number; }' but required in type '{ a: number; b: number; }'.ts(2322)
// function-type-checking-test.ts(42, 5): 'a' is declared here.

if (cc1or.a === 1) {
    // no error
}

if (cc1or.b === 1) {
    // error:
    // Property 'b' does not exist on type '{ a: string; c: number; }'.ts(2339)
}


declare function fff(a: number): number;
//declare function fff(a: string): string;

fff(null as any as string);
// Argument of type 'string' is not assignable to parameter of type 'number'.ts(2345)

fff(null as any as string | number);
// Argument of type 'string | number' is not assignable to parameter of type 'number'.
//   Type 'string' is not assignable to type 'number'.ts(2345)

namespace Z1 {
declare function f(a: 1, b: 1): 1;
declare function f(a: 1, b: 2): 2;
declare function f(a: 2, b: 1): 3;
declare function f(a: 2, b: 2): 4;
declare const a: 1 | 2;
declare const b: 1 | 2;
f(a,b); // error, fail, should be no error and have return type 1|2|3|4
}

