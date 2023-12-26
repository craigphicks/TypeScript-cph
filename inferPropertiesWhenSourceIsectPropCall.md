


## Intersection and union of single function types;


```ts
type X<T> = {
    t: T,
    f: (t:T)=>T;
}
```
The definition of intersection/union of over single functions should be linear in parameter and return types:

*intersection*
```ts
type AandB = X<A & B>;
```
is defined as
```ts
{
    t: A&B,
    f: (t:A&B)=>A&B;
}
```

*union*
```ts
type AorB = X<A | B>;
```
is defined as
```ts
{
    t: A|B,
    f: (t:A|B)=>A|B;
}
```

## Overloads - how to denote

Given the above definition of intersection, the `&` cannot be used to denote overloads, because the semantics do not match.
*All names here are arbitrarily chosen for the sake of discussion.*


Literal defintions which to not use `&` to define an overload are still valid, e.g.,
```ts
{
    (t:A)=>A;
    (t:B)=>B;
}
```
These exposed intrinsic functions transform tuples to and from function overloads for symbolic type manipulation in the type domain.
```ts
TupleToOverload<(...args: any[]) => any)[]> => /*overload*/ Type;
OverloadToTuple</*overloadType*/ Type) => /* extends */ (...args: any[]) => any)[];
OverloadToCover(/*overloadType*/ Type) => /* extends */ (...args: any[]) => any);
```
The output of `OverloadToCover` is a single function for which
- parameter at position `i` is the union of every overload parameters at position `i`.
- return type is the union of every overload return type.

Usage:
```ts
type MyConcaveOverloadType = {
    (a:1, b:2, c:1)=>1;
    (a:2, b:1, c:2)=>2;
}
type MyConvexOverloadType = TupleToOverload<[
    ...OverloadToTuple<MyConcaveOverloadType>,
    (...args:Parameters<OverloadToCover<MyType>>)=>0,
]>;
```

## Overloads - matching

Given input arguments of type `A`, and an overload sequence:
```ts
(...args: P1):R1
(...args: P2):R2
...
(...args: P3):RN
```

A matching algorithm selects (possibly multiple) overloads as follows:

```
matches = []
for each overload in overload sequence
    if every input argument overlaps with it corresponging overload parameter
        matches.push(overload)
        if every input arguments (is a subset / extends) it corresponding overload parameter
            break
```
The defintion of `input argument overlaps with it corresponging overload parameter` is as follows:
```ts
for some element t extending input argument T
    t also extends overload parameter P
```


The overload matches have two uses:
1. To determine the return type of the function call.
2. To maintain a mapping from return type to parameter types for usage in flow.

The mapping from return type to parameter types can be used in flow as follows:
```ts
declare const f: MyConvexOverloadType;
declare const a: 1|2;
declare const b: 1|2;
declare const c: 1|2;
const x = f(a,b,c);
if (x===1){
    // a is 1
    // b is 2
    // c is 1
} else if (x===2){
    // a is 2
    // b is 1
    // c is 2
} else {
    // a is 1|2
    // b is 1|2
    // c is 1|2
}
```


