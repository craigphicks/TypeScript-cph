/* eslint-disable object-literal-surrounding-space */
/* eslint-disable @typescript-eslint/no-unused-expressions */

declare interface A { a: string, c: { d: number, e: number } };
declare interface B { b: string, c: { d: number, f: number } };

declare const x: A | B;

x.a; // error
x.b; // error
x.c; // no error
x.c.d; // no error
x.c.e; // error

const x0: A | B = {a: "", b:undefined, c: {d: 1, e: 2, f: ""}}; // error: undefined is not a type of b, string is not a type of f
const x1: A | B = {a: "", b:undefined, c: {d: 1, e: 2}}; // no error, but why no error on b here?

declare const y: A & B;

y.a; // no error
y.b;  // no error
y.c; // no error
y.c.d; // no error
y.c.e; // no error

const y0: A & B = {a: "", b:undefined, c: {d: 1, e: 2, f: 3}}; // error: undefined is not a type of b
const y1: A & B = {a: "", b:"", c: {d: 1, e: 2}}; // error: missing f
