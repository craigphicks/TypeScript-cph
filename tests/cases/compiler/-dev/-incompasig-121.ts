// @strict: true
// @target: esnext

interface Test121<T> {
    (cb:(a:T, x:T)=>T):T[];
    <U>(cb:(a:U, x:T)=>U,init:U):U[];
}

declare const f: Test121<number> | Test121<bigint>;
const result = f((a:bigint, x) => a * BigInt(x), 1n);


