type Integers = 1 | 2;

interface F1 {
    1: [1,1],
    2: [2,2],
}


type F2<N extends Integers> = {
    [k in N]: readonly [N,N]
};



// interface F2<N extends 1|2|3|4|5> {
//     N: readonly [N,N]
// }

// declare const x1: F2<1>;
// const y = x1["1"];

// const x: F2<1> = {
//     1: [1,1]
// };

// interfaces as overloads

interface F {
    <K extends keyof F1>(...args: F1[K]): F1[K],
    (...args: [1,2]): [0,0]
    (...args: [0,1]): [-1,-1]
}

interface G {
    <K extends Integers>(...args: F2<K>[K]): F2<K>[K],
    (...args: [1,2]): [0,0]
    (...args: [0,1]): [-1,-1]
}

interface H {
    <K extends Integers, L extends Integers>(k: K,l: L): [K,L],
    (...args: [1,2]): [0,0]
    (...args: [0,1]): [-1,-1]
    (...args: [0,2]): [-1,-2]
    (...args: [1,0]): [-2,-2]
}

interface J {
    <N extends Integers, TN extends readonly [Const<N>,Const<N>]>(...args: TN): TN;
    //<N extends number, TN extends readonly [Const<N>,Const<N>]>(...args: TN): TN; // this sends to (number,number)=>[number,number]
    (...args: [1,2]): [0,0];
    (...args: [0,1]): [-1,-1];
};


type HR = ReturnType<H>; // [-2,-2], fail (expecting deffered type ReturnType<H>)

//declare const g:G2;
declare const f: F;
{
const a1 = f(1,1);
const a2 = f(2,2);
const d = f(1,2); // [0,0], pass
const e = f(0,1); // [-1,-1], pass

const p = f(2,1); // error, pass
}

declare const g: G;
{
const a1 = g(1,1); // [1,1], pass
const a2 = g(2,2); // [2,2], pass
const d = g(1,2); // [1 | 2, 1 | 2], fail (expecting [0,0])
const e = g(0,1); // [-1,-1], pass

const q = g(2,1); // [1 | 2, 1 | 2], fail (expecting error)

const p = g(0,0); // error, pass
}

declare const h: H;
{
const a1 = h(1,1); // [1,1], pass
const a2 = h(2,2); // [2,2], pass
const d = h(1,2); // [1,2], fail (expecting [1,2] | [0,0])
const f = h(0,1); // [-1,-1], pass

const p = h(0,0); // error, pass

}


declare const arg01: 0 | 1;
declare const arg12: 1 | 2;
{
    const a01 = h(0,1); // [-1,-1], pass
    const a02 = h(0,2); // [-1,-2], pass
    const a11 = h(1,1); // [1,1], pass
    const a12 = h(1,2); // [1,2], fail (expecting [1,2] | [0,0])
    const a = h(arg01, arg12); // error, fail (expecting [-1,-1] | [-1,-2] | [1,1|2] | [0,0])
    const b = h(arg12, arg12); // [1|2, 1|2]; // pass
}

type ConstHelper<TN extends readonly [number]> = TN extends readonly [infer N] ? N : never;
type Const<N extends number> = ConstHelper<readonly [N]>;
type TupleSamType2<N extends number> = readonly [Const<N>, Const<N>];
type X = TupleSamType2<1>;

type TupleSameType2<N extends any, TN extends readonly [any,any]= readonly [N,N]> = TN ; //TN extends readonly [infer A, infer B] ? readonly [A,B] : never;
type Y = TupleSameType2<1>;

type CreateSameTuple2Fn<N extends any, TN extends readonly [any,any] = readonly [N,N]> = (k: N, l: N) => TN;
type Z = CreateSameTuple2Fn<1>;


declare const j: J;
{
const a1 = j(1,1); // [1,1], pass
const a2 = j(2,2); // [2,2], pass
const d = j(1,2); // [1 | 2, 1 | 2], fail (expecting [0,0])
const e = j(0,1); // [-1,-1], pass

const q = j(2,1); // [1 | 2, 1 | 2], fail (expecting error)

const p = j(0,0); // error, pass
}

declare const arr: string[];
const x = Object.keys(arr); // string[]
