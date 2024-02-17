// @strict: true
// @declaration: true
// @target: esnext

type Callback<T> = (x:T[])=>T[];

interface K<T> {
  f(x: Callback<T>):T[]
}

function gt<T>(c: Callback<T>) {
  return c(0 as any as T[]);
}

const callbackInstance0 = (x:any)=>x; // this should work but doesn;t

callbackInstance0 satisfies Callback<{a:string}> & Callback<{b:number}>;

declare const callbackInstance1: Callback<{a:string}> & Callback<{b:number}>;

declare const k: K<{a:string}>|K<{b:number}>;

const rk0 = k.f(callbackInstance0)[0];

if ("a" in rk0) { rk0.a satisfies string; }

if ("b" in rk0) { rk0.b satisfies number; }

const rk1 = k.f(callbackInstance1)[0];

if ("a" in rk1) { rk1.a satisfies string; }

if ("b" in rk1) { rk1.b satisfies number; }

declare const g: typeof gt<{a:string}> | typeof gt<{a:string}>

const rg0 = g(callbackInstance0)[0];

if ("a" in rg0) { rg0.a satisfies string; }

if ("b" in rg0) { rg0.b satisfies number; }

const rg1 = g(callbackInstance1)[0];

if ("a" in rg1) { rg1.a satisfies string; }

if ("b" in rg1) { rg1.b satisfies number; }

