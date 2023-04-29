

// demonstrates problem with dropping keys in union types

type A = & { a: string | number };
type B = & { a: string, b: string };

declare const x: A;
declare const y: B;
declare const b: boolean;

const z = b ? x : y;

// Error because key "b" was elimiated in union type
if (z.b){
    console.log(z.a);
}

if (typeof z.a !== "string"){
    console.log(z.b); // same
}

interface C { a: string | number };
interface D { a: string, b: string };

declare const xx: C;
declare const yy: D;

const zz = b ? xx : yy;

// Error because key "b" was elimiated in union type
if (zz.b){
    console.log(z.a);
}

if (typeof zz.a !== "string"){
    console.log(z.b); // same
}


