//// [tests/cases/compiler/booleanConverter.ts] ////

//// [booleanConverter.ts]
const nullableValues = ['a', 'b', null];

const values1 = nullableValues.filter(Boolean);

// @ts-expect-error
const values2 = nullableValues.filter(new Boolean);

const arr = [0, 1, "", "foo", null] as const;

const arr2 = arr.filter(Boolean);

declare const t:undefined | {};

const x = Boolean(t) ? true : false;

x;

if (Boolean(t)){
    t;
}


//// [booleanConverter.js]
"use strict";
const nullableValues = ['a', 'b', null];
const values1 = nullableValues.filter(Boolean);
// @ts-expect-error
const values2 = nullableValues.filter(new Boolean);
const arr = [0, 1, "", "foo", null];
const arr2 = arr.filter(Boolean);
const x = Boolean(t) ? true : false;
x;
if (Boolean(t)) {
    t;
}


//// [booleanConverter.d.ts]
declare const nullableValues: (string | null)[];
declare const values1: (string | null)[];
declare const values2: (string | null)[];
declare const arr: readonly [0, 1, "", "foo", null];
declare const arr2: ("" | 0 | 1 | "foo" | null)[];
declare const t: undefined | {};
declare const x: boolean;
