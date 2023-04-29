
It is important to clealy separate the following two things:
1. Typescript definitions:  of types and the type operators | (union) and & (intersection) on record types.
2. General flow alalysis requirements: The meaning of sets, and operators of union and intersection on sets, as are required for correct flow analysis of record-types in a programming language (including Typescript).

The above 1 and 2 coincide with respect to primitive types and record-object descriptions.
Also, with respect to primitive types (which doesn't include record objects) the union and intersection operators are the same for both cases 1 and 2.

However, for the operators union and insersection over record objects, cases 1 and 2 differ.

Flow analyis requires tracking the sets of possible types throughout the program flow.  That requires *the* well defined set operations of union and intersection - call them set-union and set-intersection.  Although implementations may differ, they cannot be arbitrarily defined.  The operations typescript-union and typescript-intersection do not meet that criteria.

The following tables compares tyescript and set theory operations union and intersection on record-types.

| intersection-op | property-keys | property primitive-types |
|---|---|---|
|typescript | *union of keys* | intersection of types |
| set-theory | intersection of keys | intersection of types |

| union-op | keys | primitive-types |
|---|---|---|
|typescript | *intersection of keys* | union of types |
| set-theory | union of keys | union of types |

Roughly speaking, Typescript inverts the operations over keys, but the rule differs for arrays and tuples where the keys are, roughly speaking, unioned in both typescript-union and typescript-intersection.

Traversing down the tree, the typescript-operators are also applied to the next level (just as their set-counterparts are).

Although the type-operations do not correspond to the actual relations that occur during flow,
the typescript-operations do describe concrete new types.
Therefore if we start from the axiom that the Typescript-operation defined types are correct,
then we only need to be concerned with how to:

1. interpret the types passed from the upper layer to flough
2. process those types in flough
3. relay the results from flough back to the upper layer.

W.r.t. #1, the necessary typescript-operators can be programmed into visitor (c.f. the visitor for `logicalObjectForEachTypeOfProperyLookup`) to work as colleague(s) alongside `onInterseciton` and `onUnion`.
- `Type.flags & TypeFlags.Union` could probably just be mapped to the current `OnUnion`, so that the keys are not lost.
- `Type.flags & TypeFlags.Intersection` should map to a new operator `OnTsIntersection`, which is similar to `OnIntersection`, but which doesn't take unions over keys.

W.r.t. #2 calling, `logicalObjectForEachTypeOfProperyLookup` and `logicalObjectAssign`

W.r.t. #3, that might be a problem because although flough knows about `ts.Type` operations and set-operations, `ts.Type` doesn't know about set-operations.
All we can do for now is map "union" to typescript-union and "intersection" to typescript-intersection.

-----

Why does typescript reverse the operation logic for keys? ... Never mind.

What's missing in Typescript are operators to define new types composed from others types, independently of Union and Intersection.

Intersection is being used to glob together record types by using a union of keys.  The user will be "warned" if overlapping keys have completely incompatible types because then the whole type will become never (but not if the key's types are only partially compatible).
It is an ad hoc solution to a need.

I expect that for many use cases it would be  better to provide some typescipt operator CombineTypes([A,B,C], {conflicts:...}) where conflicts could be "union", "intersection", "override" or "error".
- "union" takes the union of all types per key.
- "error" is not to allow any per key types to differ, i.e for each key the union must equal the intersection or an error occurs.
- "intersection" is the equalivalent to the current typescript-intersection `|`, where an error effectively occurs only if the intersection is empty.
- "override" is similar to js notation `{...A,...B,...C}` but it is also applied recursively to the property types.
Most of the big cases where there are thousands of keys where this would useful probably don't require circular referencing, so circular referencing can be disallowed.  The result would be an independent new type which only reference the underlying types once, during creation.  

