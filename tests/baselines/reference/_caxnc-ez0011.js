//// [_caxnc-ez0011.ts]
/**
 * Mix object and non-object function root types
 */

type Foo = () => number[];
type ObjFoo = { foo: () => string[]; }
declare const b: boolean;
let v = b ? (undefined as any as Foo) : (undefined as any as ObjFoo).foo;
v();


//// [_caxnc-ez0011.js]
"use strict";
/**
 * Mix object and non-object function root types
 */
var v = b ? undefined : undefined.foo;
v();


//// [_caxnc-ez0011.d.ts]
/**
 * Mix object and non-object function root types
 */
declare type Foo = () => number[];
declare type ObjFoo = {
    foo: () => string[];
};
declare const b: boolean;
declare let v: (() => string[]) | Foo;
