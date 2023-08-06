//// [_caxnc-ez0012.ts]
/**
 * Mix object and non-object function root types.
 * Checker type of v outside of the if statement includes undefined.
 */

type Foo = () => number[];
type ObjFoo = { foo: () => string[]; }
declare const b: boolean;
let v = b ? (undefined as any as Foo) : (undefined as any as (ObjFoo|undefined))?.foo;
if (v) {
    v();
}
v;


//// [_caxnc-ez0012.js]
"use strict";
/**
 * Mix object and non-object function root types.
 * Checker type of v outside of the if statement includes undefined.
 */
var v = b ? undefined : undefined === null || undefined === void 0 ? void 0 : undefined.foo;
if (v) {
    v();
}
v;


//// [_caxnc-ez0012.d.ts]
/**
 * Mix object and non-object function root types.
 * Checker type of v outside of the if statement includes undefined.
 */
declare type Foo = () => number[];
declare type ObjFoo = {
    foo: () => string[];
};
declare const b: boolean;
declare let v: (() => string[]) | Foo | undefined;
