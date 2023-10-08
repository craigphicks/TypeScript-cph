
# Return Type Checking in Overload and Template functions.

Let us suppose that internal flow analysis is working and able to




```
interface F {
    "t": number,
    "f": boolean,
}
function dlf<T extends keyof F>(k:T): F[T] {
    if (k==="t"){
        // flow analysis determines that 
        return 1; // no error, pass
        // return true; // no error, fail BUG
    }
    else {
        return true; // no error, pass
        // return 1; // no error, fail BUG
    }
}
```