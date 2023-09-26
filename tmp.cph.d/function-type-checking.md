
# Proposed logic formulae for type checking of function calls and function implementation return values

## Overview

This document aims to provide specification for type checking of
1. flow function calls, and
2. function implementation return values

expressed as logic formulae.


## 0. Basics

### 0.1 Plain vs Object Types, isNonEmptySubset, isSubsetOf, isNonEmptyIntersection

Any type `x` (expect for `any` and `unknown`) can be partioned into mutually exclusive parts `plainPart(x)` and `objectPart(x)`.

`plainPart(x)` is any of the subtypes of `x` which do not have variable (key, value) properties that must be taken into account in type checking.
They are:
- primitives: `string, number, bigint, boolean, symbol, null, or undefined`
- literals: literalTypes of `string`, `number`, or `bigint`, e.g., `"1",2,2n`
- the generic type symbol
- unique symbols as defined in the target program
- *(Arrays `array` with element type `elementType(array)` satisfying `plainPart(elementType(array))` could be included in plain type - so `[[[number]]]` could be included as a plain type. That is possible because array keys are not used in type checking.)*

`objectPart(x)` is any of the subtypes of which are the complement of `plainPart` types:
- functions types, tuple types, objects with keys, *(and array types which are not included in `plainPart`)*.

We call `type` a plain type when `objectPart(type)` is empty (i.e., `never`).



For any two plain types `x`, `y`,
- `intersection(x,y)` is the type with elements in both `x` and `y`.
- `x isSubsetOf y` iff for every `p` in `x`, `p` in `y`
- `x isIntersectionNonEmpty y` iff
    - for some `p` in `x`, `p` in `y`



### 0.2. Kinds of Function Declarations

Typescript function declarations include the following kinds of syntax:
- Plain functions declarations, with a single non-template signature.
- Template function declarations, which allow constrainted template type variables in a signature. See example 0.2.
- Overload functions, which describe a function using a set of function signatures, see example 0.3.  Overload declaration can also include template function declarations. See example 0.4.


*Example 0.1 single non-template function declaration*
```
declare function f(a: 1|2, b:  1|2): 1|2
```

*Example 0.2 template function declaration*
```
declare function<A in 1|2, B in 1|2>f(a: A, b: B): A|B
```

*Example 0.3: simple overload declaration*:
```
declare function f(a: 1, b: 1): 1
declare function f(a: 1, b: 2): 1
declare function f(a: 2, b: 1): 2
declare function f(a: 2, b: 2): 1|2
```

*Example 0.4: mixed overload declaration*:
```
declare const f: {
    <A in 1|2, B in 1|2>f(a: A, b: B): A;
    (a: 2, b: 2): 1;
};
```


<ul>
*Note:* An obvious question to ask is whether the order of overload declarations is supposed to reflect the order of in which function implementation is checking for cases - the answer is a no.  For the above kinds of function declarations, the resulting mappings are invariant with respect to order of overload declarations.
</ul>

Example 0.3 and 0.4 have the same mappings from input range to output, and therefore they *should* behave identically in terms of type checking.  The behavior should be linked to the resultant mappings, not the syntax that created those mappings.


One more way of forming a function declaration is using a distributed template:
```
type KFType<A extends 1 | 2, B extends 1 | 2> = [A,B] extends [2,2] ? (a: 2,b: 2) => -1 : (a: A,b: B) => A;
interface KF1 {
    <A extends 1 | 2, B extends 1 | 2>(a: A, b: B): ReturnType<KFType<A,B>>;
    (...args: any[]): never;
}
```

The behavior when using a distributed template to define overloads does not seem stable enough to make conclusions about the intended results.
So it skipped here.  It is usually used for recursive type definitions, where its behavior is predictable.



In section 1 the type checking specifications for a single non-template function are given.  In section 2 the case of for overloads/templates is covered.  Note that the specifications for overloads/templates collapses exctly to the case of single plain function for an overload declaration with just one non-template member.

In each case the following will be detail in detail:
- The type of checking functions calls (generally multiple), and
- The type checking of the return values of the function implementation (always a singular implementation).

## 1. Case of a single non-template function declaration.

Section 1.1 discusses type checking a function call.  Section 1.2 discusses type checking the return values in the function.

### 1.1 Type checking a function call in case of single non-template function declaration

Function calls will be type checked based on the inferred type range of each parameter passed.
```
declare function f(a: 1|2, b:  1|2): 1|2
declare const a: 1|2;
declare const b: 1|2|3;
let r = f(a,b);
//          ~
// Argument of type '1 | 2 | 3' is not assignable to parameter of type '1 | 2'.
//  Type '3' is not assignable to type '1 | 2'. (2345)
```
Note: We are assuming no flow information about the correlation between `a` and `b`.

The result of type checking is aiming test the legality what would happen executing the function over the full range calling inputs, e.g.,
what would happen over each of the possible inputs in the range formed by the cross product formed by the full cross product of parameter ranges `(1|2)`, `(1|2|3)`:
|---|---|---|
| a | b | OK |
|---|---|---|
| 1 | 1 | y |
| 1 | 2 | y |
| 1 | 3 | n |
| 2 | 1 | y |
| 2 | 2 | y |
| 2 | 3 | n |
|---|---|---|


The worst case complexity of iterating over each element of the cross product range is product of range sizes
- *O(#R(x) \* #R(y) \* ...)*

which may be prohibitively expensive.  However, the type checking can actually be implemented in complexity

- *O(#R(x) + #R(y) + ...)*

which is acceptable, using the below algorithm for `stronglyMatches`.

Lets define the relation `x stronglyMatches y` where `x` and `y` are tuples of types, `x` has fixed length, and the result is a boolean.

In the special case where `x` and `y` are both tuples of plain types:

`x stronglyMatches y` is true if and only if all the following are true
- `x.length` fits within the range of lengths allowed by `y`
- for each parameter index `idx` in 0...y.length, `x[idx] isSubsetOf y[idx]`.


In the general case where `x` and `y` are both tuples possibly having object parts:

`x stronglyMatches y` is true if and only if all the following are true
- `x.length` fits within the range of lengths allowed by `y`
- for each parameter index `idx` in 0...y.length, `x[idx] isAssignableTo y[idx]`.

*(Note: `isAssignableTo` is a deep and complex topic on its own, covered more deeply in [section 3](#3-algorithmic-defintion-of-isassignableto).  It can be skipped for now, instead using the temporary notion that `isAssignableTo` is similar to `isSubsetOf`, but more complex as is needed for objects.)*





### 1.2 Type checking a implementation return value in case of single non-template function declaration

Example 1.2.1
```
function func(...): number | string {
    let r: any;
    ...
    if (typeof r ==="number") return r;
}
```

The following two conditions must be satisfied
- For every return statement
    - `[typeof return value] isAssignableTo [function return type]`
- The function should have no default return unless `undefined` is included in the function return type.




## 2 Case of overload of non-template functions.

### 2.1 Type checking a function call in case of overload of non-template functions

The condition for type checking the input range to the overloads is
- for every element `p` in `inputRange`,
    - for some signature `sig` in `overloads`
       - `p stronglyMatches sig`


As was done for `strongMatches` in [section](#11-type-checking-a-function-call-in-case-of-single-non-template-function-declaration) we can define the relation per each parameter index reduce complexity without changing the result.


We first consider the case where the input range and each signatures parameter range are tuples of plain types (no object parts).

One condition that must be satisfied is:

`x matchesSomeOverload y` iff
- for some `sig` in `overloads(y)`
    - x `x weaklyMatches sig`

where `x weaklyMatches sig` iff
- `x.length` fits within the range of lengths allowed by `sig`
- for each parameter index `idx` in `0...y.length`, `x[idx] isIntersectionNonEmpty sig[idx]`

Notice the difference from `x stronglyMatches y` (in the case of plain types only) is just that `isSubsetOf` is replaced by `isIntersectionNonEmpty`.


Consider the scenario
Example 2.1.0
```
declare function func(a: 1, b: 1): 1;
declare function func(a: 1, b: 2): 2;
declare function func(a: 2, b: 1): 3;
declare function func(a: 2, b: 2): 4;
declare const a: 1 | 2;
declare const b: 1 | 2;
f(a,b);
```

The condition `x matchesSomeOverload y` evaluates to true, and it seems like there should be no error.


However, consider the scenario
Example 2.1.1
```
declare function func(a: 1, b: 1): 1;
declare function func(a: 2, b: 2): 4;
declare const a: 1 | 2;
declare const b: 1 | 2;
f(a,b);
```

In this second scenario, the inputs `a:1,b:2` and `a:2,b:1` are not in the range of any signature,
and so - perhaps? - an error should be emitted.
Unfortunately, in the general case, there is a complexity problem with computing whether the input range lies within the domain of overload parameters.
It cannot be done breaking down the problem and comparing per parameter index, so the complexity remains O(#Range(a) * #Range(a)),
and that should (generally) be avoided.


How does TypeScript (version 5.2.2) deal with this problem ?

If errors on scenario Example 2.1.0 as follows:
```
No overload matches this call.
  The last overload gave the following error.
    Argument of type '1 | 2' is not assignable to parameter of type '2'.
      Type '1' is not assignable to type '2'.ts(2769)
```
What it is doing is trying to do is apply `x stronglyMatches sig` to each signature to decide if it matches.


The only way to prevent that error (in TypeScript 5.2.2) is to narrow the inputs:
```
if (a===1 && b===1) f(a,b); // this passes
```
So TypeScript (5.2.2) simply sidesteps the problem altogether.


A reasonable way to deal with "input of of range" issue would be to defer to the coder. They have a choice:
- Ignore because they are certain it will not happen
- Add an extra `else` clause to throw an error.
```
declare function func(a: 1, b: 1): 1;
declare function func(a: 2, b: 2): 4;
declare function func(...args: any[]): never;
// declare function func(...args: any[]): throws Error;
function func(a:1 |2, b: 1| 2) {
    if (a===1 && b===1) return 1;
    else if (a===2 && b===2) return 4;
    else {
        assert(false);
        // OR throw new Error("func input out of allowed range")
    }
}
declare let a: 1 | 2;
declare let b: 1 | 2;
... // perhaps the coder know a,b are now correlated into legal range, but flow doesn't know that
const x = func(1,1); // expect const x: 1
```

In fact
```
declare function func(...args: any[]): never;
```
is already legal TypeScipt (5.2.2).  But the sematics are not sensible and `f(1,1)` evaluates to `never`, for reasons explained in the next section.

### 2.1 Determining return type of a function call in case of overload of non-template functions








because the only signature `sig` satisfying `(1|2,1|2) stronglyMatches sig` is `(...args: any[])`






### 2.2 Type checking a implementation return value in case of overload of non-template functions



---------------------------


In the case of template functions, where one or more template parameters appear in the return type:
- (Impl 1) The task (Defn 1) can be computed utilizing
    - For each `idx`
        - compute the intersection of the calling type at `idx` and range of template parameter `P` at index; add it to `types(P)`.
    - If the number of template parameters involved in the return type is 1,
        - add `union over t in types(P) of TemplateOfReturnType<t>`
    - otherwise
        - add `TemplateOfReturnType<union over t in types[P]>`
    - A signature *might* match cross-types of calling parameters if and only if
        -  for each parameter idx, the intersection of `callingTypes[idx]` and `signature.params[idx]` is non-empty.


How about template functions?
```
declare function f<K extends 1|2|3, L extends 1|2>(k: K,l: L): [K,L];
f(1|2,1|2)
```



- (Impl 2) The task (Defn 2.1) can be computed utilizing
    - A signature *must* match cross-types of calling parameters if and only if
        -  for each parameter idx, `signature.params[idx]` is a subset of `callingTypes[idx]`.

So the ideal definitions (Defn 1) and (Defn 2.1) using "cross-type element iteration" has been preserved, although the computation is less complex than the defintion might suggest. (Note that practical implementations of *intersection* and *subset* may yet result in compomise of the ideal description - but that is another story.)

Unfortunately, task (Defn 2.2) doesn't have such a short cut in the general case.  The worst case complexity is the number of elements in the cross-type of calling types.  Instead we should use the implementation
- (Impl 2.2)
    - An excessive calling type error exists if (but not only if)
        -  for each parameter idx,  `callingTypes[idx]` is NOT a subset of the union over each signature of `signature.params[idx]`.
The fact that some errors can be missed is a part of the specified contract with typescript user, of which they must be aware in cases where illegal input is a possibility.

Note that in functions where
- the number of signature parameters indices is one, or
- for all signature parameters indices except one them them, the parameters are identical,
which are quite common cases, (Impl 2.2) does give a perfect result.
It would be possible to calculate in quick time whether the signatures satisfies that condition, and if not, take some warning action and/or attempt to iterate the cross-type elemnets of the calling type, if not too numerous.

## Type checking of return Statements in the implemantation of a function with type Union-of-functions


## <a id="sec3"></a> 3 Algorithmic Defintion of "isAssignableTo"

let `externalLUTIsObjectAssignableTo` be a preset lookup table over `{x,y}` with range `true|false`
let `internalLUTisObjectAssignableTo` be an initially empty lookup table `{x,y}` with range `true|false|pending`

`x isAssignableTo y` iff
- `plainPart(x) isIntersectionNonEmptyAndSubsetOf plainPart(y)` --- *(optional side effect: emit error)*
- any of
    - `hasObjectPart(x)===false`
    - all of
        - `hasObjectPart(x)===true`
        - `objectPart(x) isObjectAssignableTo objectPart(y)`, where `objectPart` may be a union of non-union object types.

Where `x isObjectAssignableTo y` is:
- if `x isIdenticalTo y`or `externalLUTIsObjectAssignableTo(x,y)`  then true
- else if `internalLUTIsObjectAssignableTo(x,y)===true` then true
- else if `internalLUTIsObjectAssignableTo(x,y)===false` then false
- else if `internalLUTIsObjectAssignableTo(x,y)===pending` then
    - the future value of `internalLUTIsObjectAssignableTo(x,y)` which could be true or false --- *(prevents infinite loop)*
- else `x isObjectAssignableToDetail y`

Where `x isObjectAssignableToDetail y` iff
- *(side effect: set `internalLUTisObjectAssignableTo(x,y)` to `pending`)*
- for each non-union object type `objectInX` in `x`
    - for some non-union objectType `objectInY` in `y`
        - let `keys` be the non-optional literal keys of `objectInY`
        - for each key `k` in `keys`,
            - *(optional side effect: error if `k` is not a key in `objectInX`, but such an error could be an over restrictive nuisance)*
            - `objectInX[k] isAssignableTo objectInY[k]` is true


The algorithm `isAssignableTo` is recursive, but it will always terminate - thanks to clause marked "*(prevents infinite loop)*, waiting for a future result.  However, at termination there will not alway be a unique solution, again thanks to that same clause marked "*(prevents infinite loop)*.  Some entries in `internalLUTIsObjectAssignableTo` may be "stuck: at `pending`.  This should be considered a set of solutions, indexable by the remaining `{x,y}`, where for each such `{x,y}` the value `x isObjectAssignableTo y` may be `true` or `false`, either one resulting in a consistent solution.

We can select a unique solution from that set of solutions by any other criteria we choose.

One criteria is simply to set `x isObjectAssignableTo y` to `true` for every remaining pending `{x,y}`.  That is arguably sound because the relationships between all keys and plain types has already been checked completely, and if the only remaining question "is (transitive) recursion acceptable?", the answer is yes.

A direct literal implementation of `isAssignableTo` following the above logic exactly would not be an optimal implementation. Also, any implementation might use approximations in order to reduce complexity.  However, the above simple description for `isAssignableTo` is still useful as a reference point.







