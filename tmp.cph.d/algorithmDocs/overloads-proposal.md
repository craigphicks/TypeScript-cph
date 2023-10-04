

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
function Workaround(){
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
declare const fOverloadWorkaroundFinalCatchAll: {
    (a: 1, b: 1): 1;
    (a: 1, b: 2): 2;
    (a: 2, b: 1): 3;
    (a: 1 | 2, b: 1 | 2): 1 | 2 | 3;
};
function Workaround(){
    if (a===2 && b===2) throw Error(); // indicates that 2,2 is known to be not possible
    let r: 0 | 1 | 2 | 3 | 4  = 0;
    r = fOverloadWorkaround2(a,b); // no error
    r; // 1 | 2 | 3  (pass)
    r = fOverloadWorkaround2(1,b);
    r; // 1 | 2 | 3  (fail, want 1 | 2)
}
declare const fOverloadWorkaroundElaborate: {
    (a: 1, b: 1): 1;
    (a: 1, b: 2): 2;
    (a: 2, b: 1): 3;
    (a: 1, b: 1 | 2): 1 | 2;
    (a: 1 | 2, b: 1 ): 1 | 3;
    (a: 1 | 2, b: 1 | 2): 1 | 2 | 3;
};

```


Both workaround are prohibitibely expensive for the user.

In the case of Workaround1, the code is duplicating the same code which would found be in the implementation.
That is redundant and laborious.

In the case of Workaround2, `fOverloadWorkaroundFinalCatchAll` is added as a final catch all overload is added and it does stop errors.

Unfortunately, besides also being redundant and laborious, there are two more problems:

- (1) it is not possible to write an overload that specifies the case `(a,b)=(1,2)|(2,1)`, returning `2|3`.


- (1) `fOverloadWorkaroundFinalCatchAll(a/*1*/,b/*1|2*/)` gives an overly wide result `1|2|3` when `1|2` is more accurate.
That could be addressed by adding more overloads as shown in `fOverloadWorkaroundElaborate`, but that is even more laborious,
and the task scales up with combinatorial complexity.


None of the above workarounds are satisfactory.

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
    let {anotb,aandb: matchType} = partitionByIntersectionPartial(sourceType, targetType);
    return {
        matchType,
        matchLevel: isNever(matchType) ? MatchLevel.never : isNever(anotb) ? MatchLevel.strongly : MatchLevel.weakly
    }
}
```
*(Note: reason for returning `matchType` is made clear [below](#included-additional-feature-flow-analysis-may-correlate-return-types-with-matched-input-values).)*

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
return an size one array `[{sigidx: matchedIndex, matchLevel: MatchLevel.strongly, ....}]`,
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

## Included Additional Feature: Flow analysis may correlate return types with matched input values.

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

# Algorithms definitions for `isAssignTo` and `isAssignedTo2`.

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

`objectPart(x)` is any of the subtypes of which are the complement of `plainPart` types, or a union thereof:
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
 * Partition x in parts which do (aandb), and do not (anotb), intersect y.
 * Note: partitionIntersectionPartial(number,1) -> { aandb: 1, anotb: number }
 * Note: partitionIntersectionPartial(1, number) -> { aandb: 1, anotb: never }
 */
function partitionIntersectionPartial(a,b): { aandb: Type, anotb: Type };
```


## Algorithm for "isAssignableTo"

This pseudocode is not meant to reflect the exact structure of the current TypeScript implementation of `isTypeAssignableTo(x,y)` function in `checker.ts`.

However, it does attempt match most of the observed behavior of that current TypeScript implementation.
This `isAsignableTo` algorithm is also the base upon which the more complex `isAssignableTo2` will be built - and `isAssignableTo2` is required for the proposed solution to the overloads problem.

```
// a predefined O(1) lookup table over `{x,y}` with range `true|false`
// declare function externalLUTIsObjectAssignableTo(x,y):boolean

// an O(1) function to check for identical types
declare function isIdenticalObjectType(x,y): boolean;

// an initially empty lookup table `{source,target}` with range `true|false|pending`
const internalLUTisObjectAssignableTo: Map<Type,Map<Type,true|false|pending>>

type ResultTreeAnd = {
    kind: "and",
    children: ResultTree[];
}
type ResultTreeOr = {
    kind: "or",
    children: ResultTree[];
}
type ResultTreePending = {
    kind: "pending";
    source: Type, target: Type
}
type ResultTreeResolved = {
    kind: "resolved",
    result: boolean
}
type ResultTree = ResultTreeAnd | ResultTreeOr | ResultTreePending | ResultTreeResolved;

type createResultTreeResolved(b:boolean):ResultTreeResolved {
    return {kind:"resolved",result:b};
}


function isAssignableTo(x,y): boolean {
    const internalLUTisObjectAssignableTo: MapWithTwoKeys<Type,Type,true|false|"pending">
    return resolveTree(isAssignableToWorker(x,y)).result;

    function resolveTree(rt): ResultTreeResolved {
        switch (rt.kind){
            case "resolved": return rt;
            case "pending":
                if (internalLUTisObjectAssignableTo.get(rt.source,rt.target)===false){
                    return createResultTreeResolved(false);
                }
                // remaining "pendings" and true are both resolved to true
                return createResultTreeResolved(true);
            case "and":
                return createResultTreeResolved(rt.children.every(rtchild=>resolveTree(rtChild).result))
            case "or":
                return createResultTreeResolved(rt.children.some(rtchild=>resolveTree(rtChild).result))
        }
    }

    function isAssignableToWorker(x,y): ResultTree {
        if (!isSubset(getPlainPart(x),getPlainPart(y))) return createResultTreeResolved(false);
        if (!hasObjectPart(x)) return createResultTreeResolved(true);
        if (!hasObjectPart(y)) return createResultTreeResolved(false);
        let xobj = getObjectPart(x);
        let yobj = getObjectPart(y);
        if (isIdenticalObjectType(xobj,yobj)) return createResultTreeResolved(true);
        if (externalLUTIsObjectAssignableTo(xobj,yobj)) return createResultTreeResolved(true);
        // Next clause prevents calling the
        if (internalLUTIsObjectAssignableTo.has(xobj,yobj)){
            switch(internalLUTIsObjectAssignableTo.get(xobj,yobj)){
                case true: return createResultTreeResolved(true);
                case false: return createResultTreeResolved(false);
                case "pending": return {kind:"pending", source:xobj, target:yobj};
            }
        }
        return isObjectAssignableTo(objx,objy);
    }
    function isObjectAssignableTo(x,y): ResultTree {
        internalLUTIsObjectAssignableTo.set(x,y,"pending")
        let rt = requireForEverySource(x);
        if (rt.kind==="resolved") internalLUTIsObjectAssignableTo.set(x,y,rt.result);
        return rt;

        function requireForEverySource(): ResultTree {
            children = [];
            if (getNonUnionTypes(y).every(tsource=>{
                let rt = requireForSomeTarget(tsource);
                if (rt.kind===resolved) return rt.result;
                children.push(rt);
                return true; // keep going
            }){
                return {kind: and, children};
            }
            else {
                return createResultTreeResolved(false);
            }
        }

        function requireForSomeTarget(tsource): ResultTree {
            children = [];
            if (getNonUnionTypes(y).some(ttarget=>{
                let rt = requireForEveryNonOptionalKey(tsource,ttarget);
                if (rt.kind===resolved) return rt.result;
                children.push(rt);
                return false; // keep going
            }){
                return createResultTreeResolved(true);
            }
            else {
                return {kind: or, children};
            }
        }

        function requireForEveryNonOptionalKey(tsource,ttarget): ResultTree {
            children = [];
            let keys = getNonOptionLiteralKeys(ttarget)
            if (keys.every(k=>{
                let rt = isAssignableToWorker(getObjectTypeAtKey(tsource,k),getObjectTypeAtKey(ttarget,k));
                if (rt.kind===resolved) return rt.result;
                chidren.push(rt);
                return true; // keep going
            }){
                return {kind: and, children};
            }
            else {
                return createResultTreeResolved(false);
            }
        }
    }
}
```

The algorithm for `isAssignableTo` will always terminate because in function `isAssignableToWorker` it checks `internalLUTIsObjectAssignableTo` to prevent calling `isObjectAssignableTo` on the same `x,y` pair twice.  If `isObjectAssignableTo` has been called on that `x,y` pair but has not yet resolved, it enters a result of pending into the result tree.

When the algorithm terminates, but before calling `resolveTree`, some of those `pendings` may have resolved, but not necessarily all of them.

What it *means* is that the algorithm described a self referential logic equation that has multiple solutions.  The set of solution is indexed by the remaining `x,y` having "pending" values in `internalLUTIsObjectAssignableTo`, where each such `x,y` pair could be resolved to `true` or `false`, and the logical equation would be logically self-consistent.

We can therefore select a unique solution from that set of solutions by any other criteria we choose.  Note that although some "pending" value remain, all of the relevant keys and all of the relevant plain types in all of the objects have been tested and resolved. All that remains
is to answer the question "is (transitive) recursion acceptable?".  The answer should be yes, so all the "pendings" are resolved to "true" in `resolveTree`.


## Algorithm for "isAssignableTo2"

Not done yet.

```
// a predefined O(1) lookup table over `{x,y}` with range `true|false`
// declare function externalLUTIsObjectAssignableTo(x,y):boolean

// an O(1) function to check for identical types
declare function isIdenticalObjectType(x,y): boolean;

// an initially empty lookup table `{source,target}` with range `true|false|pending`
const internalLUTisObjectAssignableTo: Map<Type,Map<Type,true|false|pending>>

type ResultTreeAnd = {
    kind: "and",
    children: ResultTree[];
}
type ResultTreeOr = {
    kind: "or",
    children: ResultTree[];
}
type ResultTreePending = {
    kind: "pending";
    source: Type, target: Type
}
type ResultTreeResolved = {
    kind: "resolved",
    result: IsAssignableResult
}
type ResultTreeSomeTarget = {

}
type ResultTreeEveryNonOptionalKeys = {
    kind: "everyKey",
    byKey: {key: string, matchType: Type, matchLevel: MatchLevel}
}
type IsAssignableResult = { matchType?: Type, matchLevel: MatchLevel };

type ResultTree = ResultTreeAnd | ResultTreeOr | ResultTreePending | ResultTreeResolved;

type createResultTreeResolved(matchLevel: MatchLevel, matchType?: Type):ResultTreeResolved {
    return {kind:"resolved",result:IsAssignableResult};
}


function isAssignableTo(x,y): IsAssignableResult {
    const internalLUTisObjectAssignableTo: MapWithTwoKeys<Type,Type,true|false|"pending">
    return resolveTree(isAssignableToWorker(x,y)).result;

    function resolveTree(rt): ResultTreeResolved {
        switch (rt.kind){
            case "resolved": return rt;
            case "pending":
                if (internalLUTisObjectAssignableTo.get(rt.source,rt.target)===false){
                    return createResultTreeResolved(false);
                }
                // remaining "pendings" and true are both resolved to true
                return createResultTreeResolved(true);
            case "and":
                return createResultTreeResolved(rt.children.every(rtchild=>resolveTree(rtChild).result))
            case "or":
                return createResultTreeResolved(rt.children.some(rtchild=>resolveTree(rtChild).result))
        }
    }

    function isAssignableToWorker(x,y): ResultTree {
        let xplain = getPlainPart(x);
        if (!isNever(xplain))
        let {anotb:plainUnmatchedType,aandb: plainMatchType} = partitionByIntersectionPartial(x,y);
        if (isNever(matchType))
        return {
            matchType,
            matchLevel: isNever(matchType) ? MatchLevel.never : isNever(anotb) ? MatchLevel.strongly : MatchLevel.weakly
        }


        if (!isSubset(getPlainPart(x),getPlainPart(y))) return createResultTreeResolved(false);
        if (!hasObjectPart(x)) return createResultTreeResolved(true);
        if (!hasObjectPart(y)) return createResultTreeResolved(false);
        let xobj = getObjectPart(x);
        let yobj = getObjectPart(y);
        if (isIdenticalObjectType(xobj,yobj)) return createResultTreeResolved(true);
        if (externalLUTIsObjectAssignableTo(xobj,yobj)) return createResultTreeResolved(true);
        // Next clause prevents calling the
        if (internalLUTIsObjectAssignableTo.has(xobj,yobj)){
            switch(internalLUTIsObjectAssignableTo.get(xobj,yobj)){
                case true: return createResultTreeResolved(true);
                case false: return createResultTreeResolved(false);
                case "pending": return {kind:"pending", source:xobj, target:yobj};
            }
        }
        return isObjectAssignableTo(objx,objy);
    }
    function isObjectAssignableTo(x,y): ResultTree {
        internalLUTIsObjectAssignableTo.set(x,y,"pending")
        let rt = requireForEverySource(x);
        if (rt.kind==="resolved") internalLUTIsObjectAssignableTo.set(x,y,rt.result);
        return rt;

        function requireForEverySource(): ResultTree {
            children = [];
            if (getNonUnionTypes(y).every(tsource=>{
                let rt = requireForSomeTarget(tsource);
                if (rt.kind===resolved) return rt.result;
                children.push(rt);
                return true; // keep going
            }){
                return {kind: and, children};
            }
            else {
                return createResultTreeResolved(false);
            }
        }

        function requireForSomeTarget(tsource): ResultTree {
            children = [];
            let anyWeak = false;
            ley anyStrong = false;
            if (getNonUnionTypes(y).forEach(ttarget=>{
                let rt = requireForEveryNonOptionalKey(tsource,ttarget);
                if (rt.kind===resolved) {
                    if (rt.result.matchKind===matchKind.weak) anyWeak = true;
                    else if (rt.result.matchKind===matchKind.strong) anyStrong = true;
                }
                else children.push(rt)
            });

            {
                return createResultTreeResolved(true);
            }
            else {
                return {kind: or, children};
            }
        }

        function requireForEveryNonOptionalKey(tsource,ttarget): ResultTree {
            children = [];
            let keys = getNonOptionLiteralKeys(ttarget)
            let anyWeakly = false;
            if (keys.every(k=>{
                let rt = isAssignableToWorker(getObjectTypeAtKey(tsource,k),getObjectTypeAtKey(ttarget,k));
                anyWeakly ||= (rt.matchLevel===MatchLevel.weakly);
                // Note: the actual weakly matched type for the key is not being used here,
                // but that could be used here to narrow the type further.
                // However, for the moment only select from union types, don't narrow at the key level.
                if (rt.kind===resolved){
                    if (rt.result.matchKind===matchKind.never) return false; // short circuit
                    if (rt.result.matchKind===matchKind.weak) anyWeakly = true;
                    return true;
                }
                chidren.push(rt); // must be pending
                return true; // keep going
            }){
                if (children.length) return {kind: and, children, result: anyWeakly ? MatchLevel.weakly : MatchLevel.strongly};
                return createResultTreeResolved(result: anyWeakly ? MatchLevel.weakly : MatchLevel.strongly);
            }
            else {
                return createResultTreeResolved(MatchLevel.never);
            }
        }
    }
}
```

