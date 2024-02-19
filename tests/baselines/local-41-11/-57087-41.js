//// [tests/cases/compiler/-test2/-57087-41.ts] ////

//// [-57087-41.ts]
type Callback<T> = (x:T[])=>T[];
interface K<T> {
  f(x: Callback<T>):T[]
}
function gt<T>(c: Callback<T>) {
  return c(0 as any as T[]);
}

// need to make this work for g, and gather return values.

const callbackInstance0 = (x:{a:string}[]|{b:number}[])=>x;

callbackInstance0 satisfies Callback<{a:string}> & Callback<{b:number}>;
// v5.4.0-dev.20240215
// Type '(x: {    a: string;}[] | {    b: number;}[]) => { a: string; }[] | { b: number; }[]'
//  does not satisfy the expected type 'Callback<{ a: string; }> & Callback<{ b: number; }>'.

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


//// [-57087-41.js]
"use strict";
function gt(c) {
    return c(0);
}
// need to make this work for g, and gather return values.
const callbackInstance0 = (x) => x;
callbackInstance0;
const rk0 = k.f(callbackInstance0)[0];
if ("a" in rk0) {
    rk0.a;
}
if ("b" in rk0) {
    rk0.b;
}
const rk1 = k.f(callbackInstance1)[0];
if ("a" in rk1) {
    rk1.a;
}
if ("b" in rk1) {
    rk1.b;
}
const rg0 = g(callbackInstance0)[0];
if ("a" in rg0) {
    rg0.a;
}
if ("b" in rg0) {
    rg0.b;
}
const rg1 = g(callbackInstance1)[0];
if ("a" in rg1) {
    rg1.a;
}
if ("b" in rg1) {
    rg1.b;
}


//// [-57087-41.d.ts]
type Callback<T> = (x: T[]) => T[];
interface K<T> {
    f(x: Callback<T>): T[];
}
declare function gt<T>(c: Callback<T>): T[];
declare const callbackInstance0: (x: {
    a: string;
}[] | {
    b: number;
}[]) => {
    a: string;
}[] | {
    b: number;
}[];
declare const callbackInstance1: Callback<{
    a: string;
}> & Callback<{
    b: number;
}>;
declare const k: K<{
    a: string;
}> | K<{
    b: number;
}>;
declare const rk0: {
    a: string;
} | {
    b: number;
};
declare const rk1: {
    a: string;
} | {
    b: number;
};
declare const g: typeof gt<{
    a: string;
}> | typeof gt<{
    a: string;
}>;
declare const rg0: {
    a: string;
};
declare const rg1: {
    a: string;
};
