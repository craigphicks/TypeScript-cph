//// [tests/cases/compiler/-test/-57087-contextualOverloadListFromArrayUnion-05.ts] ////

//// [-57087-contextualOverloadListFromArrayUnion-05.ts]
declare const y5: number[][] | string[];
declare const f5: { (x: number[]): number; (x: string): number;}
export const yThen4 = y5.map(f5);


//// [-57087-contextualOverloadListFromArrayUnion-05.js]
export const yThen4 = y5.map(f5);
