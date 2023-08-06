//// [_caxnc-ez0013.ts]
/**
 * Mix object and non-object function root types.
 * Checker type of v outside of the if statement includes undefined when v is const.
 */

type Foo = () => number[];
type ObjFoo = { foo: () => string[]; }
declare const b: boolean;
const v = b ? (undefined as any as Foo) : (undefined as any as (ObjFoo|undefined))?.foo;
if (v) {
    v();
}
v;


//// [_caxnc-ez0013.js]
"use strict";
/**
 * Mix object and non-object function root types.
 * Checker type of v outside of the if statement includes undefined when v is const.
 */
var v = b ? undefined : undefined === null || undefined === void 0 ? void 0 : undefined.foo;
if (v) {
    v();
}
v;


//// [_caxnc-ez0013.d.ts]
/**
 * Mix object and non-object function root types.
 * Checker type of v outside of the if statement includes undefined when v is const.
 */
declare type Foo = () => number[];
declare type ObjFoo = {
    foo: () => string[];
};
declare const b: boolean;
declare const v: (() => string[]) | Foo | undefined;
