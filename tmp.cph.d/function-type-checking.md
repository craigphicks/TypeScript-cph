
# Proposed logic formulae for type checking of function calls and function implementation return values

## Overview

This document aims to provide specification for type checking of
1. flow function calls, and
2. function implementation return values

expressed as logic formulae.


## 0. Basics

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

### 1.1 Type checking a call (in case of single non-template function declaration)

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

The result of type checking is aiming test the legality what would happen executing the function over the full range calling inputs, e.g.,
what would happen over each of the possible inputs in the range formed by the cross product formed the full cross product of parameter ranges `(1|2)`, `(1|2|3)`:
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

`x stronglyMatches y` is true if and only if all the following are true
- `x.length` fits within the range of lengths allowed by `y`
- for each parameter index `idx` in 0...y.length, `x[idx] isAssignableTo y[idx]`.

*(Note: `isAssignableTo` is a deep and complex topic on its own, covered more deeply in [section 3](#sec3).  It can be skipped for now, instead using the temporary notion that `isAssignableTo` is similar to `isSubsetOf`, but more complex as is needed for objects.)*

If `x stronglyMatches y` fails here, as it does in the above example, it is because some calling type is not a subset of its corresponding parameter type, an error message is emitted.

### 1.1

## 2

## <a id="sec3"></a> 3 "isAssignableTo": similar to "isSubsetOf", but more complex as needed for objects


### Abstract algorithm description

Where `x isAssignableTo y` is true if and only if both of the following are true
- `plainPart(x) isSubsetOf plainPart(y)`
- any of these conditions are true
    - `hasObjectPart(x)===false`
    - all of these conditions are true
        - `hasObjectPart(x)===true`
        - `objectPart(x) isObjectAssignableTo objectPart(y)`, where `objectPart` may return a union of non-union object types.

Where `x isObjectAssignableTo y` is true if and only if any of the following are true:
- (1.1) `x isIdenticalTo y` is true
- (1.2) an already resolved result of `x isObjectAssignableTo y` is true
- (1.3) a promised pending result of `x isObjectAssignableTo y` will be true
- (1.4) `x isObjectAssignableToDetail y` is true

Where `x isObjectAssignableToDetail y` is true if and only if
- for each non-union object type `objectInX` in `x`
    - for some non-union objectType `objectInY` in `y`
        - let `keys` be the non-optional literal keys of `objectInY`
        - for each key `k` in `keys`, `objectInX[k] isAssignableTo objectInY[k]` is true

Where `plainPart(x)` is any of the subtypes of `x` in any of the following categories, all of which do not have properties whose keys and values must be taken into acount in type checking:
- primitives: `string, number, bigint, boolean, symbol, null, or undefined`
- literals: literalTypes of `string`, `number`, or `bigint`, e.g., `"1",2,2n`
- unique symbols: as defined in the target program
- *(Arrays `array` with element type `elementType(array)` satisfying `plainPart(elementType(array))` could be included in plain type - so `[[[number]]]` could be included as a plain type. That is possible because array keys are not used in type checking.)*

Where `objectPart(x)` is any of the subtypes of which are the complement of `plainPart` types:
- functions types, tuple types, objects with keys, *(and array types if those are not included in `plainPart`)*.

The logical function `isAssignableTo` is recursive, but if run forward as an algorithm it will always terminate - thanks to clause `x isObjectAssignableTo y` (1.3) which prevents recursion.  However, at termination there will not alway be a unique solution, again thanks to clause `x isObjectAssignableTo y` (1.3).  Instead we have a non-unique set of solutions, indexable by the remaining `{x,y}`, where for each such `{x,y}` the value `x isObjectAssignableTo y` may be either `true` or `false`.

We can select a unique solution from that set of solutions by any other criteria we choose.

One criteria is simply to set `x isObjectAssignableTo y` to `true` for every remaining pending `{x,y}`.  That is arguably sound because the relationships between all keys has already been checked completely, and if the only remaining question "is (transitive) recursion acceptable?", the answer is yes.


### Example of synchrous implementation of the deferred values of `x isObjectAssignableTo y`.





An example synchronous implementation to demonstrate that an implementation is possible:
- Phase one:
    - create a map `inProgress: Map<RangeX, Map<RangeY, "true"|"false"|"pending>>`,
    - The implemention follows the recursive logical flow of `x isAssignableTo y`.
    - Recursively build a logic tree with `or`/`and` node, and leaves whose values `{x,y}` correspond to entries `pending` values of `inProgress`.
    - whenever `x isObjectAssignableToDetail y` is called, set `inProgress.set(x).set(y)` to `pending`
    - whenever `x isObjectAssignableTo y` item (1.3) is triggered by the condition `inProgress.get(x).get(y)===true`, add an `{x,y}` entry to the logic key.
    - whenever `x isObjectAssignableToDetail y` returns, set `inProgress.set(x).set(y)` to the return value `true` or `false` (as well as adding `true` or `false` to the logic tree).
    - for all other trivial test conditions add the resulting `true` or `false` to the logic tree.
- Phase two:
    - `inProgress` may still contain some `pending` values due the transitive recursive defintions.
    - However, the conditions for plain parts and required keys will all have been resolved, and the remaining `pending` will only reflect the recursiveness of the type definitions.  Because recusive definitions are acceptable, change the `pending` results to `true`.
    - render the logic tree to give a final `true` or `false` answer.

That implemention is easy to visualize because the processing flow tree builds a logic tree with the same structure.
However it is not necessary to actually set `true` or `false` to the logic tree nodes because
- Under an `or` node, a result of `false` can be ignored.
- Under an `or` node, a result of `true` can stop the horizontal iteration, and the node collapses to `true`.
- Under an `and` node, a result of `true` can be ignored.
- Under an `and` node, a result of `false` can stop the horizontal iteration, and the node collapses to `false`.
The collapsing continues recursively up the tree.  With that collapsing the final tree contains only `{x,y}` values referencing `inProgress` values which were originally `pending`.

### Margin optimization?

By adding more data structure, all if the tree leaves referencing a particular `{x,y}` can be also be resolved immediately.
It would require marking the `or` and `and` nodes with the `true` or `false` values they had been resolved to, rather than collapsing the tree.
The phase one processing would have to check at every loop iteration if the node had alreay been resolved, and quit the loop if so.
So there are potential savings but it's not clear the it would be worth the effort.  It would not eliminate final unresolved `pending` values in phase one.

A similar approach requiring marking of `or` and `and` nodes would use JS asynchronous features to do a (JS) asynchrous wait at item (1.3).  One resolved, it would simply resume execution.

##

All below is out of date.

## Type checking a CallExpression for a function with type Union-of-functions


Conceptual (not implemenation) definitions of tasks that would "ideally" be performed.

- (Defn 1) Determine the return type
    - This is union of return types of any signature that *might* match the cross-type of calling types.
        - *might* match means some element of the cross-type of calling types is a subset of the cross-type of signature parameter types
- (Defn 2) Check for errors in the cross-type of calling types passed to the function call.  There are two kinds of errors:
    - (Defn 2.1) No signature matching error:  There is no signature that *must* match the cross-type of calling types.
        - *must* match means every elememnt of the cross-type of signature parameter types is a subset of the cross-type of calling types.
    - (Defn2.2) Excessive calling type error: Some element of the cross-type of calling types is not a subset of any signatures crossstype of parameter types


Some of the tasks cannot always be performed as written above because doing so would require exponential complexity.  For example, iterating over every element of a cross-type is exponentially complex. Also, calculating if an object type is a subtype of another object type, or calculating the intersection of object types can be very expensive.

Note that although the task defintion were given in terms of elements of cross-types, task (Defn 1) and (Defn 2.1) can be calculated perfectly without iterating over elements of cross-types:

- (Impl 1 non tmpl) The task (Defn 1) can be computed utilizing
    - A signature *might* match cross-types of calling parameters if and only if
        -  for each parameter idx, the intersection of `callingTypes[idx]` and `signature.params[idx]` is non-empty.


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







