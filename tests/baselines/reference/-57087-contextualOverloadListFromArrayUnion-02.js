//// [tests/cases/compiler/-test/-57087-contextualOverloadListFromArrayUnion-02.ts] ////

//// [-57087-contextualOverloadListFromArrayUnion-02.ts]
declare const y2: number[][] | string[];
declare function f2<T extends {length:number}>(x: T): number;
export const yThen2 = y2.map(f2);


//// [-57087-contextualOverloadListFromArrayUnion-02.js]
export const yThen2 = y2.map(f2);
