//// [_tuple-rest.ts]
// exactOptionalPropertyTypes: true

// type T1 = [x:number,y?:boolean];
// type T2 = [...T1, "$"];

// const t2a:T2 = [1, "$"];
// const t2b:T2 = [1, true, "$"];

type Last = "$";
type T11 = [x:1,...y:boolean[]];
type T11m = [z?:string];
type T12 = [...T11, ...T11m,Last];

const t12a:T12 = [1, "$"];
const t12b:T12 = [1, true, "$"];


//// [_tuple-rest.js]
"use strict";
// exactOptionalPropertyTypes: true
var t12a = [1, "$"];
var t12b = [1, true, "$"];
