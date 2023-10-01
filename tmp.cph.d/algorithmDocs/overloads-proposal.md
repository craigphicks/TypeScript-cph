

# The Problem

We will consider the following overload function, and also the constraints on how it can be called in current TypeScript:

<a id="problem-example"></a>
*Problem Example*
```
declare const fOverload: {
    (a: 1, b: 1): 1;
    (a: 1, b: 2): 2;
    (a: 2, b: 1): 3;
};
declare const a: 1 | 2;
declare const b: 1 | 2;

function Example1(){
    if (a===2 && b===2) throw Error(); // indicates that 2,2 is known to be not possible
    let r;
    r = fOverload(1,1); // no error
    r = fOverload(1,2); // no error
    r = fOverload(a,b); // error
    // No overload matches this call.
    // Overload 1 of 3, '(a: 1, b: 1): 1', gave the following error.
    //     Argument of type '1 | 2' is not assignable to parameter of type '1'.
    //     Type '2' is not assignable to type '1'.
    // Overload 2 of 3, '(a: 1, b: 2): 2', gave the following error.
    //     Argument of type '1 | 2' is not assignable to parameter of type '1'.
    //     Type '2' is not assignable to type '1'.
    // Overload 3 of 3, '(a: 2, b: 1): 3', gave the following error.
    //     Argument of type '1 | 2' is not assignable to parameter of type '2'.
    //     Type '1' is not assignable to type '2'.ts(2769)
}
````

Although the call to `fOverload(a,b)` is perfectly valid and safe, TypeScript does not allow the call.

Two user workarounds to avoid errors are as follows:

*Workaround 1: narrow inputs by overload*
```
function Workaround1(){
    if (a===2 && b===2) throw Error(); // indicates that 2,2 is known to be not possible
    let r: 0 | 1 | 2 | 3 | 4  = 0;
    if (a===1 && b===1) r=fOverload(a,b);
    else if (a===1 && b===2) r=fOverload(a,b);
    else if (a===2 && b===1) r=fOverload(a,b);
    r; // 0 | 1 | 2 | 3
}
```

*Workaround 2: declare a union of all workarounds as final overload*
```
declare const fOverloadWorkaround2: {
    (a: 1, b: 1): 1;
    (a: 1, b: 2): 2;
    (a: 2, b: 1): 3;
    (a: 1 | 2, b: 1 | 2): 1 | 2 | 3;
};
function Workaround2(){
    if (a===2 && b===2) throw Error(); // indicates that 2,2 is known to be not possible
    let r: 0 | 1 | 2 | 3 | 4  = 0;
    r = fOverloadWorkaround2(a,b); // no error
    r; // 1 | 2 | 3
}
```

Both workaround are prohibitibely expensive for the user.

In the case of Workaround 1, the code is duplicating the same code which would found be in the implementation,
which is redundant and laborious.

In the case of Workaround 2, the final overload is already implied by the first 3 overloads, so it is redundant and laborious.

Neither workaround is satisfactory.

# Proposed Solution

The current criteria for an input to match one signature of a sequence of overloads is that the input "strongly" matches the signature,
where "strongly" means matching in the same way as an input would need to match a non-overload single signature function.

The gist of the proposed change is to change the criteria to that an input can match a overload even if it only "weakly" matches the signature.
A more detailed explanation is given in psuecode below, along with psuedocode for the existing algorithm.

At the root of matching in the current algorithm is an important basic function in `checker.ts` with declaration `isTypeAssignableTo(source: Type, target: Type): boolean`.  In the psuedocode that functionality will called `isAssignableTo`, to distinguish from the actual function.
In the limited case where `source` and `target` are limited to generic types and literals, the functionality actually reduces to the O(1) time computable function `isSubsetOf`.  A gist explanation of the difference between `isAssignableTo` and `isSubsetOf`, is that `isAssignableTo` contains the extra functionality make `isSubsetOf` work for objects by applying it recursively through the objects properties to the values of those properties.

The proposed solution will rely on variation of `isAssignableTo` called `isAssignableTo2`.

The existing psuedo-declaration:
```
function isAssignableTo(sourceType,targetType): boolean
```

The proposed psuedo-declaration:
```
enum MatchLevel {
    never = 1,
    weakly = 2,
    strongly = 3
};
declare function isAssignable2(sourceType, targetType): [{ matchType: Type, matchLevel: MatchLevel }]
```

Psuedocode for the existing `isAssignableTo` and the proposed `isAssignableTo2` is left until the end of this document, because the complexity is distracting.  However, in the limited case where `source` and `target` are limited to generic types and literals a psuedocode comparison is easy:

```
function isAssignableTo(inputType,parameterType): boolean {
    return isSubsetOf(inputType,parameterType)
}
```

```
declare function isAssignableTo2(sourceType, targetType): [{ matchType: Type, matchLevel: MatchLevel }]
    let {anotb,bnota,aandb: matchType} = partitionByIntersection(sourceType, targetType); // bnota is not used, but shown for clarity
    return {
        matchType,
        matchLevel: isNever(matchType) ? MatchLevel.never : isNever(anotb) ? MatchLevel.strongly : MatchLevel.weakly
    }
}
```
*(Note: reason for returning `matchType` to be made clear later.)*
In the case when `sourceType` is a subset of `targetType`, `isAssignableTo` returns `true` while `isAssignableTo2` returns `MatchLevel.strongly`.
Otherwise `isAssignableTo` returns `false` while `isAssignableTo2` returns either `MatchLevel.never` (in the case of empty intersection) or `MatchLevel.weakly` (in the case of non-empty intersection).


That's enough information to procede with the algorithm psuedocodes for matching overload signatures. *(Note: Psuedocode for creation of type checking errors for the user is omitted for clarity).*


The existing algorithm psuedocode:
```
function inputMatchesOverloads(input, overloads): { matchedIndex?:number, hasMatch:boolean }{
    let matchedIndex;
    if (overloads.some((sig,sigidx)=>{
        if (inputMatchesSignature(input,sig)) {
            matchedIndex = sigidx;
            return true;
        }
    })) {
        return { matchedIndex, hasMatch: true };
    }
    return { hasMatch: false };
}
function inputMatchesSignature(input,sig): boolean {
    if (input.length < sig.minParameterLength || input.length < sig.maxParameterLength) return false;
    return input.every((inputType, idx)=>{
        return isAssignableTo(inputType,sig.params[idx]);
    });
}
```

The proposed algorithm psuedocode:
```
function inputMatchesOverloads2(input, overloads): { sigidx: number, matchTypes: Type[], matchLevel: MatchLevel }[] {
    let results: { sigidx: number, matchType: Type }[] = [];
    for (let sigidx = 0; sigidx < signatures.length>; sigidx++){
        let result = inputMatchesSignature2(input,sig);
        if (result.matchLevel===MatchLevel.never) continue;
        results.push({ sigidx, ...result });
        if (result.matchLevel===MatchLevel.strongly) break;  // a strong match stops the search
    }
    return results;
}
function inputMatchesSignature2(input,sig): { matchTypes?: Type[], matchLevel: MatchLevel } {
    if (input.length < sig.minParameterLength || input.length < sig.maxParameterLength) return { matchLevel: MatchLevel.never };
    let hasWeakParamMatch = false;
    let matchTypes: Type[] = [];
    for (let paramidx = 0; paramidx < input.length; paramidx++){
        let result = isAssignable2(input[paramidx],sig.params[paramidx]);
        if (result.matchLevel === MatchLevel.never) return { matchLevel: MatchLevel.never };
        hasWeakParamMatch ||= result.matchLevel === MatchLevel.weakly;
        matchTypes.push(result.matchType);
    }
    return {
        matchTypes,
        matchLevel: hasWeakParamMatch ? MatchLevel.weakly : MatchLevel.strongly;
    }
}
```
In the case where input does not weakly match any signature in overload,
but does strongly match at least one signature in overload
the existing algorithm returns `{ matchedIndex, true }`, while the proposed algorithm
return an array with a single element `[{sigidx: matchedIndex, matchLevel: MatchLevel.strongly, ....}]`,
i.e., in that special case they behave more or less identicallly.
However the proposed algorithm can return multiple matches when weak matches are present,
when the existing algorithm would just return false.


Going back to the [Problem Example](#problem-example), under the new algorithm,
the call to `fOverload(a /*1|2*/,b /*1|2*/)` would not return an error.
Instead, `inputMatchesOverloads2` would return
```
[
    {sigidx: 0, matchTypes: [1,1], matchLevel: MatchLevel.weakly },
    {sigidx: 1, matchTypes: [1,2], matchLevel: MatchLevel.weakly },
    {sigidx: 2, matchTypes: [2,1], matchLevel: MatchLevel.weakly },
]
```
The caller of `inputMatchesOverloads2` has the signature and could determine the return type as
```
let matches = inputMatchesOverloads2(input,signatures);
let callExpressionReturnType = union(matches.map(item=>signatures[item.sigidx].returnType));
```

## Included Additional Feature 1: Flow analysis may correlate return types with matched input values.

Morever, the flow analysis could use the correlation between matching input values and return values
to allow the function calling coder to do this:
```
switch (fOverload(a,b)) {
    case 1: console.log(a,b) // 1 1
    case 2: console.log(a,b) // 1 2
    case 3: console.log(a,b) // 2 1
    default: // depends on user
}
```
Instead of requiring the user to laboriously narrow the inputs `a,b` before calling `fOverload(a,b)`,
the user has the option to use the return value `fOverload(a,b)` to infer the corresponding input.
This is why `matchType(s)` were included in the return values of the psuedocode functions
`isAssignable2`, `inputMatchesSignature2`, and `inputMatchesOverloads2`.


## Detecting excessive input types - a combinatorially hard problem in the general case.

Some excessive input types can be detected with per index processing.
For example, in the context of the [Problem Example](#problem-example),
the call `f(3,1)` can efficiently be detected as an error because the union of overload signature parameters over the first index is `1|2`,
and `3` is not in `1|2`.

However, the input out-of-bounds call `f(2,2)` cannot be detected by using per-index processing.
Although it looks easy in this narrow toy example case, in the general case is combinatorially expensive to detect excess-type errors
which lie within the enclosing convex set of the input space.

In the existing TypeScript behavior the function calling coder is forced to laboriously
narrow the inputs before making the call - that avoids the problem of undectable excess types,
but only at the expense excessive labor - actually duplicating the code in the function implementation - so that is not an advantage of the existing algorithm.

Therefore, if using the proposed algorithm, it is necessary to explain clearly in the TypeScript documentation what kinds of excess types errors will be detected and what will not.  For the function implementor, it is only adding another if case to the logic to handle out-of-bounds input,
so at least it can be easily caught at run time.

# Algorithmic defintions for `isAssignTo` and `isAssignedTo2`.

## Partitioning Types into "plain" and "object" parts.

Any type `x` (excepting `any` and `unknown` for the moment) can be partioned into
mutually exclusive parts `plainPart(x)` and `objectPart(x)`.

`plainPart(x)` is any of the subtypes of `x` which do not have variable (key, value) properties that must be taken into account in type checking.
They are:
- primitives: `string, number, bigint, boolean, symbol, null, or undefined`
- literals: literalTypes of `string`, `number`, or `bigint`, e.g., `"1",2,2n`
- the generic type symbol
- unique symbols as defined in the target program
- *(Arrays `array` with element type `elementType(array)` satisfying `plainPart(elementType(array))` could be included in plain type - so `[[[number]]]` could be included as a plain type. That is possible because array keys are not used in type checking.)*

`objectPart(x)` is any of the subtypes of which are the complement of `plainPart` types:
- functions types, tuple types, objects with keys, and array types (*except those array types which may be included in `plainPart`)*.

We call `type` a plain type when `objectPart(type)` is empty (i.e., `never`).

## Set operations on plain types

Pseudocode declarations for common operations on types:
```
function hasPlainPart(t): boolean
function getPlainPart(t): Type
function hasObjectPart(t): boolean
function getObjectPart(t): Type
```

Pseudocode declarations for common operations on plain type only:
```
function isSubset(a,b): boolean;
/**
 * Partition x in parts which do (aandb) and do not (anotb) intersection y.
 * Note: partitionIntersectionPartial(number,1) -> { aandb: 1, anotb: number }
 * Note: partitionIntersectionPartial(1, number) -> { aandb: 1, anotb: never }
 */
function partitionIntersectionPartial(a,b): { aandb: Type, anotb: Type };
```

## Psuedocode Algorithmic Definition of "isAssignableTo"

This pseudocode is not meant to reflect the exact structure of the current TypeScript implementation of `isTypeAssignableTo(x,y)` function in `checker.ts`.
This pseudocode does attempt match the observed behavior of that current TypeScript implementation.

```
// a predefined O(1) lookup table over `{x,y}` with range `true|false`
declare function externalLUTIsObjectAssignableTo(x,y):boolean

// an O(1) function to check for identical types
declare function isIdenticalObjectType(x,y): boolean;

// an initially empty lookup table `{x,y}` with range `true|false|pending`
const internalLUTisObjectAssignableTo: Map<Type,Map<Type,true|false|pending>>


type ResultTree = {
    kind: "and" | "or",
    children: ResultNode[];
}
type ResultPending = {x: Type, y: Type};
type ResultNode = ResultTree | true | false | ResultPending;



function isAssignableTo(x,y): boolean {
    const internalLUTisObjectAssignableTo: Map<Type,Map<Type,true|false|pending>>
    function isAssignableToHelper(x,y): boolean {
        if (!isSubset(getPlainPart(x),getPlainPart(y))) return false;
        if (!hasObjectPart(x)) return true;
        return isObjectAssignableTo(getObjectType(x),getObjectType(y));
    }
    function isObjectAssignableTo(x,y): boolean {
        if (isIdenticalObjectType(x,y)) return true;
        if (externalLUTIsObjectAssignableTo(x,y)) return true;
        if ()
    }
}

```


---------------------------



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
- for every non-union object type `objectInX` in `x`
    - for some non-union objectType `objectInY` in `y`
        - let `keys` be the (optional and non-optional) literal keys of `objectInY`
        - for every key `k` in `keys`,
            - *(optional side effect: error if `k` is not a key in `objectInX`, but such an error could be an over restrictive nuisance)*
            - `objectInX[k] isAssignableTo objectInY[k]` is true


The algorithm `isAssignableTo` is recursive, but it will always terminate - thanks to clause marked "*(prevents infinite loop)*, waiting for a future result.  However, at termination there will not alway be a unique solution, again thanks to that same clause marked "*(prevents infinite loop)*.  Some entries in `internalLUTIsObjectAssignableTo` may be "stuck: at `pending`.  This should be considered a set of solutions, indexable by the remaining `{x,y}`, where for each such `{x,y}` the value `x isObjectAssignableTo y` may be `true` or `false`, either one resulting in a consistent solution.

We can select a unique solution from that set of solutions by any other criteria we choose.

One criteria is simply to set `x isObjectAssignableTo y` to `true` for every remaining pending `{x,y}`.  That is arguably sound because the relationships between all keys and plain types has already been checked completely, and if the only remaining question "is (transitive) recursion acceptable?", the answer is yes.

A direct literal implementation of `isAssignableTo` following the above logic exactly would not be an optimal implementation. Also, any implementation might use approximations in order to reduce complexity.  However, the above simple description for `isAssignableTo` is still useful as a reference point.


