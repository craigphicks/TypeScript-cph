// @strict: true
// @declaration: true
// @target: esnext

type Callback<T> = (x:T[])=>T[];

declare function g<T1,T2>(x: Callback<T1> | Callback<T2> ): ReturnType<Callback<T1> | Callback<T2>>;
declare function h<T>(x: Callback<T>):ReturnType<Callback<T>>;

interface K<T> {
  f(x: Callback<T>):ReturnType<Callback<T>>
}

declare const id: <T>()=>(x:T)=>unknown;

g<{a:string},{b:number}>(id());
//                       ~~~~
// Argument of type '(x: { a: string; }[] & { b: number; }[]) => unknown' is not assignable to parameter of type 'Callback<{ a: string; }> | Callback<{ b: number; }>'.
//   Type '(x: { a: string; }[] & { b: number; }[]) => unknown' is not assignable to type 'Callback<{ a: string; }>'.
//     Types of parameters 'x' and 'x' are incompatible.
//       Type '{ a: string; }[]' is not assignable to type '{ a: string; }[] & { b: number; }[]'.
//         Type '{ a: string; }[]' is not assignable to type '{ b: number; }[]'.

declare const callbackInstance0: Callback<{a:string,b:number}>;
declare const callbackInstance1: Callback<{a:string}> & Callback<{b:number}>;
declare const callbackInstance2: Callback<{a:string}> | Callback<{b:number}>;

callbackInstance0 satisfies Callback<{a:string}> & Callback<{b:number}>;

const rg0 = g(callbackInstance0);
const rh0 = h(callbackInstance0);

const rg1 = g(callbackInstance1);
const rh1 = h(callbackInstance1);

const rg2 = g(callbackInstance2);
const rh2 = h(callbackInstance2);

declare const k: K<{a:string}>|K<{b:number}>;
k.f(callbackInstance0);
const rk1 = k.f(callbackInstance1);
