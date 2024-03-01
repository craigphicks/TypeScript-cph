// @strict: true

interface Test110<T> {
    f(cb:(x:T)=>T):T[];
    f<U>(cb:(x:T)=>U):U[];
}

declare const arr: Test110<number> | Test110<string>;
arr.f(x => x);


