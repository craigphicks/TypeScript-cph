// @strict true

{
    type T1 = [number, ...[b?: boolean]];
    const t1:T1 = [1 as const];
}
