// @strict: true
// @declaration: true
// @target: esnext


const t2: {
    f: (x:1|2)=>1|2
} & {
    f: (x:2|3)=>2|3
} = { f: x => x }

const r21 = t2.f(1); // should be range error under intersection

const r22 = t2.f(2);

const r23 = t2.f(3); // should be range error under intersection

const t3: {
    f: (x:2)=>1|2|3
} = { f: x => x }

// @ts-expect-error
const r31 = t3.f(1); // should be range error under intersection

const r32 = t3.f(2);

// @ts-expect-error
const r33 = t3.f(3); // should be range error under intersection

// const u0: {
//     f: ()=>T20<1|2>
// } & {
//     f: ()=>T20<2|3>
// } = { f: () => x => x };

// const s01 = u0.f()(1);

// const s02 = u0.f()(2);


// const u1: {

//     f: T21<1|2>

// } & {
//     f: T21<2|3>

// } = (<U extends 1|2|3>(): { f: T21<U>; } => ({ f: x => x }))();

// const s11 = u1.f()(1);

// const s12 = u1.f()(2);

const u2: {
    f: ()=>(x:1|2)=>1|2
} & {
    f: ()=>(x:2|3)=>2|3
} = { f: () => x => x };

const s21 = u2.f()(1); // should be range error under intersection

const s22 = u2.f()(2);

const s23 = u2.f()(3); // unexpected kind of errpr
// Argument of type '3' is not assignable to parameter of type '1 | 2'.ts(2345)

const u3: {
    f: ()=>(x:2)=>2
} = { f: () => x => x };

// @ts-expect-error
const s31 = u3.f()(1);

const s32 = u3.f()(2);

// @ts-expect-error
const s33 = u3.f()(3);



const v2: {
    f(x:1):1;
    f(x:2):2;
} & {
    f(x:2):2;
    f(x:3):3;
} = { f: x => x };
//    ^?

const r41 = v2.f(1);

const r42 = v2.f(2);

const r43 = v2.f(3);

const w2: {
    f(x:2):2;
} = { f: x => x };
//    ^?

// @ts-expect-error
const r51 = w2.f(1);

const r52 = w2.f(2);

// @ts-expect-error
const r53 = w2.f(3);

const g2: {
    f<T extends 1|2|3>(x:T):T
} = { f: (x) => x };

const r61 = g2.f(1);

const r62 = g2.f(2);

const r63 = g2.f(3);

const h2: {
    f<T extends 1|2>(x:T):T
} & {
    f<T extends 2|3>(x:T):T
} = { f: (x) => x };

const r71 = h2.f(1); // should be range error under intersection of ranges

const r72 = h2.f(2);

const r73 = h2.f(3); // should be range error under intersection of ranges

const j2: {
    f(x:(1|2)[]):1|2
} & {
    f(x:(3|2)[]):3|2
} = { f: (x) => x };

const r81 = j2.f([1]); // should be range error under intersection of ranges

const r82 = j2.f([2]);

const r83 = j2.f([3]); // should be range error under intersection of ranges

{
    type XXX = (1|2)[] & (2|3)[];
    type XXX0 =XXX[0]; // 2
    type XXX1 =XXX[1]; // 2
}

const k2: {
    f(x:2[]) :1|2|3
} = { f: (x) => x[0] };

const r91 = k2.f([1]); // should be range error under intersection of ranges

const r92 = k2.f([2]);

const r93 = k2.f([3]); // should be range error under intersection of ranges


//const r102 = n2.a;;

type AR<A, R> = {
    set a(a:A);
    get r():R;
};

// const r111 = 0 as any as AR<2,1|2|3>;
// r111.a = 1; // error, correct
// r111.a = 2; // no error, correct
// r111.a = 3; // error, correct

// r111.r; // is 2|1|3, correct


// Correct inference
const m2: ()=>{
    set a(a:2);
    get r():1|2|3;
} = 0 as any as <A,R>()=>AR<A, R>;

const r110 = m2();
r110.a = 1; // error, correct
r110.a = 2; // no error, correct
r110.a = 3; // error, correct

r110.r; // 1|2|3, correct


// Incorrect inference for `r`
const n2: ()=>{
    set a(a:1|2);
    get r():1|2;
} & {
    set a(a:2|3);
    get r():2|3;
} = 0 as any as <A, R>()=>AR<A,R>;

const r120 = n2();
r120.a = 1; // error, correct
r120.a = 2; // no error, correct
r120.a = 3; // error, correct

r120.r; // is 2,    should be 1|2|3

const ar2: {
    set a(a:2);
    get r():1|2|3;
} = new class <A,R>{
    #a: A;
    constructor(a:A) {this.#a=a;}
    set a(a:A) { this.#a = a; }
    get r():R { return (0 as any as R); }
}(2);

const r130 = ar2;
r130.a = 1; // error, correct
r130.a = 2; // no error, correct
r130.a = 3; // error, correct

r130.r; // 1|2|3, correct


const ar3: {
    set a(a:1|2);
    get r():1|2;
} & {
    set a(a:2|3);
    get r():2|3;
} = new class <A extends 1|2|3, R extends 1|2|3>{
    #a: A;
    constructor(a:A) {this.#a=a;}
    set a(a:A) { this.#a = a; }
    get r():R { return (0 as any as R); }
}(2);

const r140 = ar3;
r140.a = 1; // error, correct
r140.a = 2; // no error, correct
r140.a = 3; // error, correct

r140.r; // is 2,    should be 1|2|3  !!!! HERE IS THE BUG
