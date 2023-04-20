//// [_fixme-object-0002.ts]
declare const x: boolean;

const foo = { a: 1 } as const;
const bar = { a: 1, b: 2 } as const;

const result = x ? foo : bar;

result.b;


//// [_fixme-object-0002.js]
"use strict";
var foo = { a: 1 };
var bar = { a: 1, b: 2 };
var result = x ? foo : bar;
result.b;


//// [_fixme-object-0002.d.ts]
declare const x: boolean;
declare const foo: {
    readonly a: 1;
};
declare const bar: {
    readonly a: 1;
    readonly b: 2;
};
declare const result: {
    readonly a: 1;
    readonly b?: undefined;
} | {
    readonly a: 1;
    readonly b: 2;
};
