// @strict: true
// @target: esnext

interface Test111<T> {
    f(cb:(a:T, x:T)=>T):T[];
    f<U>(cb:(a:U, x:T)=>U,init:U):U[];
}

declare const arr: Test111<number> | Test111<bigint>;
const result = arr.f((a:bigint, x) => a * BigInt(x), 1n);


