//// [_45764.ts]
// @ strict: true
// @ exactOptionalPropertyTypes: true

type T1 = [x:number,y?:boolean];
type T2 = [...T1, ...any[]];
type T3 = [...([x:number]|[x:number,y:boolean]), ...any[]];

const t2a:T2 = [1, "x"];
const t2b:T2 = [1, true, "x"];

const t3a:T3 = [1, "x"];
const t3b:T3 = [1, true, "x"];


//// [_45764.js]
// @ strict: true
// @ exactOptionalPropertyTypes: true
var t2a = [1, "x"];
var t2b = [1, true, "x"];
var t3a = [1, "x"];
var t3b = [1, true, "x"];
