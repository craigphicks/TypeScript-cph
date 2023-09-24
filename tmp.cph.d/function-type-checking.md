
# Proposed specifications of type checking and flow of functions

## Overview

These three kind of function declarations exist in Typescript:

- Plain functions declarations, with a single non-template signature.
    - `declare function f(a: 1|2, b:  1|2): 1|2`
- Template function declarations, which allow constrainted template type variables in a signature.  These template type variables are resolved wherever the function is called prior to type checking the call, but the implementation is written and type checked with the type variable unresolved.
    - `declare function<A in 1|2, B in 1|2>f(a: A, b: B): A|B`
- Overload functions, which describe a function using a set of function signatures, see example 0.1.

*Example 0.1: simple overload declaration*:
```
declare function f(a: 1, b: 1): 1
declare function f(a: 1, b: 2): 1
declare function f(a: 2, b: 1): 2
declare function f(a: 2, b: 2): 1|2
```

Overload declarations may include template formats.  For example the overloads above could equivalently be written as following example 0.2.

*Example 0.2: mixed overload declaration*:
```
declare const f: {
    <A in 1|2, B in 1|2>f(a: A, b: B): A;
    (a: 2, b: 2): 1;
};
```

A plain function declaration is just a special case of an overload, having one non-template declaration member.
Generally speaking (*edge cases may exist*), any single template function declaration can be equivalently expressed in overloads, but not visa versa.

Therefore the type checking specifications for each function call and the return values of function implementation should respect the equivalances of declaration meaning.  For example, the type checking results when using either of declarations in example 1 or example 2 should be identical. *(Note: as of 5.2.2 that equivalence is not always respected, but that is a limitiation, not a feature.)*

It should also be mentioned explicitly that order of overload declaration carries no special meaning.  A newcomer might wonder whether the order of overload declaration is supposed to reflect the order of in which function implementation is checking for cases - the answer is absolutely no.  That's an interesting idea and having such an additional feature could potentially allow narrower and more detailed type analysis, but would also bring up many new thorny issues.

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

Where `objectPart(x)` is any of the subtypes of which are the complement of `plainPart` types:
- functions types, tuple types, objects with keys.


In the above definition of `x isObjectAssignableTo y`, item (1.3) gives an "out" for any implementation of the definition to avoid falling into an infinite loop in the case of self-recursive or transitively-recursive object defintions.  Any implementation can check if `isObjectAssignableTo` for the pair `x,y` is already in progress, and defer to that future result if so.

An example implimentation to demonstrate that an implimentation is possible:
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
The tree is smaller and the search potentially trimmed.


Footnote: The following category could also moved from object type to plain types
- (\* optional) an array whose index type `indexTypeOfArray(x)` satisfies `hasObjectPart(indexTypeOfArray(x))`
    - In JS an array is an object:  They have properties, then have Object.prototype in their prototype chain, they are instanceof Object, and you can call Object.keys on them.  However, within the Typescript type system, the properties of arrays do not come into play type checking.  That level of detail is left to tuples.


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







