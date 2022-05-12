// @strict: true
// @declaration: true

declare let tt1: [...string[], number];
tt1 = [5];
tt1 = ['abc', 5];
tt1 = ['abc', 'def', 5];
tt1 = ['abc', 'def', 5, 6];  // Error


declare type T2 = [...string[], number];
let tt2:T2;
tt2 = [5];
tt2 = ['abc', 5];
tt2 = ['abc', 'def', 5];
tt2 = ['abc', 'def', 5, 6];  // Error

