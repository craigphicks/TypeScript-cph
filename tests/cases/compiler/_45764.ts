// @ strict: true
// @ exactOptionalPropertyTypes: true

type T1 = [x:number,y?:boolean];
type T2 = [...T1, ...any[]];
type T3 = [...([x:number]|[x:number,y:boolean]), ...any[]];

const t2a:T2 = [1, "x"];
const t2b:T2 = [1, true, "x"];

const t3a:T3 = [1, "x"];
const t3b:T3 = [1, true, "x"];
