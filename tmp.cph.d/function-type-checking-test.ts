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