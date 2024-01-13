// @strict: true
// @declaration: true
// @target: esnext

declare const f: (()=>string) & (()=>number);
const r = f(); // string


// type A = { a: string }[]
// type B = { b: number }[]
// type C = A & B

// declare const ar: C;
// const it = ar[Symbol.iterator]()
