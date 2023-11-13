// @strict: true
// @target: es6
// @declaration: true

// #56013

interface FRRR<A extends [number,number,number], T extends A[0]=A[0],U extends A[1]=A[1],V extends A[2]=A[2]> {
    (p1:(t:T)=>T,p2:(u:T)=>T,p3:(u:T)=>T):`${T}rr`;
    (p1:(t:T)=>T,p2:(u:T)=>T,p3:(t:V)=>V):`${T}r${V}`;
    (p1:(t:T)=>T,p2:(u:U)=>U,p3:(t:T)=>T):`${T}${U}r`;
    (p1:(t:T)=>T,p2:(u:U)=>U,p3:(v:V)=>V):`${T}${U}${V}`
}

type ID = <I>() => (i:I) => I;
declare const id: ID;

// const q111 = (0 as any as FRRR<[1,1,1]>)(id(),id(),id());
// const q112 = (0 as any as FRRR<[1,1,2]>)(id(),id(),id());
// const q121 = (0 as any as FRRR<[1,2,1]>)(id(),id(),id());
const q123 = (0 as any as FRRR<[1,2,3]>)(id(),id(),id());

// q111 satisfies "1rr";
// q112 satisfies "1r2";
// q121 satisfies "12r";
q123 satisfies "123";

