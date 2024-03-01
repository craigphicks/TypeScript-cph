// @strict: true

interface Test120<T> {
    (cb:(x:T)=>T):T[];
    <U>(cb:(x:T)=>U):U[];
}


declare const f: Test120<number> | Test120<string>;
const result = f(x => x);


