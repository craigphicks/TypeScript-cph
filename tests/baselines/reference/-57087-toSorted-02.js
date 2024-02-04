//// [tests/cases/compiler/-test/-57087-toSorted-02.ts] ////

//// [-57087-toSorted-02.ts]
const a = 0 as any as ({ id: number; description: null; } | { id: number; description: string; })[];
type A = { id: number; }[] & { id: number; description: string | null; }[];
a satisfies A;



//// [-57087-toSorted-02.js]
"use strict";
const a = 0;
a;


//// [-57087-toSorted-02.d.ts]
declare const a: ({
    id: number;
    description: null;
} | {
    id: number;
    description: string;
})[];
type A = {
    id: number;
}[] & {
    id: number;
    description: string | null;
}[];
