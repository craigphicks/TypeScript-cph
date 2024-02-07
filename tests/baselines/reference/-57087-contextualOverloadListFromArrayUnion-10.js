//// [tests/cases/compiler/-test/-57087-contextualOverloadListFromArrayUnion-10.ts] ////

//// [-57087-contextualOverloadListFromArrayUnion-10.ts]
declare const y1: number[][] | string[];
export const yThen1 = y1.map(item => item.length);

declare function f12<T extends {length:number}>(x: T): number;
export const yThen2 = y1.map(f12);

export const yThen2a = y1.map(<T extends {length:number}>(x:T)=>x.length);

declare function f14<T extends {length:number}>(): (x: T) => unknown;
export const yThen4 = y1.map(f14()); // should not be an error

export const yThen4a = y1.map(<T extends {length:number}>()=>(x: T) => x.length);

declare const f15: { (x: number[]): number; (x: string): number;}
export const yThen5 = y1.map(f15);





//// [-57087-contextualOverloadListFromArrayUnion-10.js]
export const yThen1 = y1.map(item => item.length);
export const yThen2 = y1.map(f12);
export const yThen2a = y1.map((x) => x.length);
export const yThen4 = y1.map(f14()); // should not be an error
export const yThen4a = y1.map(() => (x) => x.length);
export const yThen5 = y1.map(f15);
