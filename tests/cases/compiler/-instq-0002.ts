// @strict: true

let a: instanceof ArrayBuffer | undefined;
let b = new ArrayBuffer(0); // should have type instanceof ArrayBuffer
a;b;
a = b;

//let b: typeof ArrayBuffer | undefined;

// b = a;


