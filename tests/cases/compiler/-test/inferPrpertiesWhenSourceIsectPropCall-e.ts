

const x: { f:(x:1|2)=>1|2 } & { f:(x:2|3)=>2|3 } = { f: x => x }

type X1 = { f:(x:1|2)=>1|2 } & { f:(x:2|3)=>2|3 } extends { f: (x: infer T) => infer T } ? T : never;
// 2|3
type X2 = { x:1|2 } & { x:2|3 } extends { x: infer T } ? T : never;
// 2
type X3 = { f:(x:1|2)=>1|2; x:1|2 } & { f:(x:2|3)=>2|3; x:2|3 } extends { x: infer T; f: (x: infer D) => infer R, } ? T : never;
// 2


type Fizz = {
    id: number;
    fizz: string;
}
type Buzz = {
    id: number;
    buzz: string;
}

declare function typeIs<T>(x:T): true;
declare function typeIs<T>(x:any): false;


type Test1<T> = {
    filter<S extends T>(predicate:(value: T, index: number, array: T[]) => value is S, thisArg?: any): (S&T)[];
    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];

}

const fid = <T>(x:T):T => x;
const id = <T>() => (x:T):T => x;

const t401 = (0 as any as Test1<Fizz | Buzz>).filter(m2);
const t402 = (0 as any as Test1<Fizz | Buzz>).filter(x=>x);
const t403 = (0 as any as Test1<Fizz | Buzz>).filter(id());
const t404 = (0 as any as Test1<Fizz | Buzz>).filter(fid);
const t501 = (0 as any as Test1<Fizz> | Test1<Buzz>).filter(m2);
const t502 = (0 as any as Test1<Fizz> | Test1<Buzz>).filter(x=>x);
const t503 = (0 as any as Test1<Fizz> | Test1<Buzz>).filter(id());
const t504 = (0 as any as Test1<Fizz> | Test1<Buzz>).filter(fid);
const t601 = (0 as any as Fizz[] | Buzz[]).filter(m2);
const t602 = (0 as any as Fizz[] | Buzz[]).filter(x=>x);
const t603 = (0 as any as Fizz[] | Buzz[]).filter(id());
const t604 = (0 as any as Fizz[] | Buzz[]).filter(fid);



type Test2<T> = {
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
}

declare function m1(x:Fizz|Buzz): Fizz;
const t100 = (0 as any as Test2<Fizz> | Test2<Buzz>).map(m1);

declare function m2(x:Fizz): Fizz;
declare function m2(x:Buzz): Buzz;
//declare function m2(x:Fizz|Buzz): Fizz|Buzz;


const t101 = (0 as any as Test2<Fizz> | Test2<Buzz>).map(m2);
const t102 = (0 as any as Test2<Fizz> | Test2<Buzz>).map(x=>x);
const t103 = (0 as any as Test2<Fizz> | Test2<Buzz>).map(id());
const t104 = (0 as any as Test2<Fizz> | Test2<Buzz>).map(fid);

const t201 = (0 as any as Fizz[] | Buzz[]).map(m2);
const t202 = (0 as any as Fizz[] | Buzz[]).map(x=>x);
const t203 = (0 as any as Fizz[] | Buzz[]).map(id());
const t204 = (0 as any as Fizz[] | Buzz[]).map(fid);

type TInferred<T,U> = U extends any ? T extends any ? typeof typeIs<U> extends (value: T, index: number, array: T[])=>any
    ? [U,T] : never : never : never ;

type T301 = TInferred<Fizz, Fizz | Buzz>;

type T302 = typeof typeIs<Fizz> extends (value: Buzz, index: number, array: Buzz[])=>any ? true : false;