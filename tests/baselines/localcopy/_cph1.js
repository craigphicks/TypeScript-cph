//// [_cph1.ts]
// @strict true

{
    type T1 = [number, ...[b?: boolean]];
    const t1:T1 = [1 as const];
}


//// [_cph1.js]
// @strict true
{
    var t1 = [1];
}
