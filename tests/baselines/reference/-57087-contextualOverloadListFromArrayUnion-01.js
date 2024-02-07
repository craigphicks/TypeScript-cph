//// [tests/cases/compiler/-test/-57087-contextualOverloadListFromArrayUnion-01.ts] ////

//// [-57087-contextualOverloadListFromArrayUnion-01.ts]
declare const y1: number[][] | string[];
export const yThen1 = y1.map(item => item.length);


//// [-57087-contextualOverloadListFromArrayUnion-01.js]
export const yThen1 = y1.map(item => item.length);
