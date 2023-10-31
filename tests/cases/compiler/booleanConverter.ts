// @strict: true
// @declaration: true
// @target: es6

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
