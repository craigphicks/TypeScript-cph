//// [_caxnc-decl-0003.ts]
declare const b: boolean;
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number[]"
let x = [b?1:1];
x;

const y = [b?1:1];
y;

const z = [b?1:1] as const;
z;


//// [_caxnc-decl-0003.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number[]"
var x = [b ? 1 : 1];
x;
var y = [b ? 1 : 1];
y;
var z = [b ? 1 : 1];
z;


//// [_caxnc-decl-0003.d.ts]
declare const b: boolean;
declare let x: number[];
declare const y: number[];
declare const z: readonly [1];
