//// [tests/cases/compiler/-test/-57087-contextualOverloadListFromArrayUnion-04.ts] ////

//// [-57087-contextualOverloadListFromArrayUnion-04.ts]
declare const y4: number[][] | string[];
declare const f4: { (x: number[]): number; (x: string): number;}
export const yThen4 = y4.map(f4);


//// [-57087-contextualOverloadListFromArrayUnion-04.js]
export const yThen4 = y4.map(f4);
