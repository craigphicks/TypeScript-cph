//// [tests/cases/compiler/-test/-57087-toSorted-01.ts] ////

//// [-57087-toSorted-01.ts]
// interface Arr<T> {
//     toSorted(compareFn?: (a: T, b: T) => number): T[];
// }

// declare const arr: Arr<number> | Arr<string>;/workspaces/ts+dt/-test


const f = (compareFn?: ((
    a: { id: number; description: null; } | { id: number; description: string; },
    b: { id: number; description: null; } | { id: number; description: string; }) => number) | undefined) => {
    return 0 as any as ({ id: number; description: null; } | { id: number; description: string; })[]
};


type F1 =  (compareFn?: ((a: { id: number; }, b: { id: number; }) => number) | undefined) =>
            { id: number; }[] & { id: number; description: string | null; }[];

type F2 = (compareFn?: ((a: { id: number; description: string | null; }, b: { id: number; description: string | null; }) => number) | undefined) =>
            { id: number; }[]& { id: number; description: string | null; }[]
type F = F1 & F2;

f satisfies F;

//// [-57087-toSorted-01.js]
"use strict";
// interface Arr<T> {
//     toSorted(compareFn?: (a: T, b: T) => number): T[];
// }
// declare const arr: Arr<number> | Arr<string>;/workspaces/ts+dt/-test
const f = (compareFn) => {
    return 0;
};
f;


//// [-57087-toSorted-01.d.ts]
declare const f: (compareFn?: ((a: {
    id: number;
    description: null;
} | {
    id: number;
    description: string;
}, b: {
    id: number;
    description: null;
} | {
    id: number;
    description: string;
}) => number) | undefined) => ({
    id: number;
    description: null;
} | {
    id: number;
    description: string;
})[];
type F1 = (compareFn?: ((a: {
    id: number;
}, b: {
    id: number;
}) => number) | undefined) => {
    id: number;
}[] & {
    id: number;
    description: string | null;
}[];
type F2 = (compareFn?: ((a: {
    id: number;
    description: string | null;
}, b: {
    id: number;
    description: string | null;
}) => number) | undefined) => {
    id: number;
}[] & {
    id: number;
    description: string | null;
}[];
type F = F1 & F2;
