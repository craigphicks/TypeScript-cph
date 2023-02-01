

## Document:

### `RefTypesSymtabConstraintItem` invariance

The `RefTypesSymtabConstraintItem` with members `{symtab: ,constraintItem}` is a unit with an invariance as follows:
For each symbol in symtab, the type:RefTypesType given by symtab.get(type) is the minimal cover of symbol
over the constraintItem.  That is the result type:RefTypesType that would be returned by calling evalOverConstraint(symbol, constraintItem): RefTypesType.

That invariance is preserved by using only these functions to modify a RefTypesSymtabConstraintItem unit from any function in `flowGroupInfer2.ts`
- `andSymbolTypeIntoSymtabConstraint`
- `orSymtabConstraints`

## TODO:

### Priority: High

1. useConstraintsV2===true optimizations
- `evalCoverPerSymbol` results could be cached on the constraint, but having a lot of caches could end up being expensive.
- Check that branches that can be reverted to the original pre-branching, do so.
1. The Map type members in InferStatus (`declaredTypes`, `replayables`, `groupNodeToTypeMap` could all be `WeakMap`s).
1. Need to move onto hitting all the basic ops and structures as soon as possible. Huge job!
1. Most testing of input combinations for `mrNarrowTypesByCallExpression`.
1. Rest parameter testing for `mrNarrowTypesByCallExpression`.
1. Coding and testing of Optional parameter handling for `mrNarrowTypesByCallExpression`.

### Priotity: Postponed

1. measure the verbosity of and compare tree vs SOP reps (curious)
1. [Implicit-not to economize memory use]  Implement `not` at the `RefTypesType` level for individual literal type elements. For any symbol with a finite literal type range, the type is represents by either positive() or negatative(not) items, but not both at once.  Whichever is less verbose.

### Priority Low

1. [Not of uncountable nonSingular] Implement "not" of literal types to apply to uncountable nonSingular types.
Currently
```
declare const a: number;
if (a===0){
    a; // 0
} else if (a===0) {
    a; // 0
}
```
even though the second if clause should be never.  The fundamental reason is that currently
`subtractFromType(`0,number`)===`number, even though the intersection of 0 and number is not empty.
That could be "fixed" by implementing "not" of literal types, and modifying several operations on `RefTypesType`.
(C.f. `_cax-typeof-003(4|5).ts` test files).


### Done (reverse order)

0. Replaced a block of code in `andSymbolTypeIntoSymtabConstraintV2` with a call to `andSymbolTypeIntoConstraint`.  Tests passing.  However, `evalCovered` is now called on every occasion.

1.1. Major rewrite of with `inferStatus` in `mrNarrowTypesByCallExpression`.
1.2. Handle `SyntaxKind.SpreadElement` within `case SyntaxKind.ArrayLiteralExpression` of `mrNarrowTypesInner`.
1.3. Add `case SyntaxKind.AsExpression:` of `mrNarrowTypesInner`.
1.4. Add `case SyntaxKind.SpreadElement:` of `mrNarrowTypesInner`.XXX always done from above.

0. As I originally suggested to myself in commit eec46167d54d1d171663a0a78d7eb44eec2cb319, there is now a call `getTypeOfExpressionShallowRecursion` as a member of `InferStatus`, which sets up a temporary cache `ESMap<Node,Type>` used to call `checker.getTypeOfExpression`.  This allows `checker.getTypeOfExpression(expr)` even within a speculative branch, e.g., mrNarrowTypesByCallExpression.  (In test _cax-fn-0020.ts it is called in SpreadElement deep under mrNarrowTypesByCallExpression).
0. tests for transitive equality `_cax-eqneq-000(1|2|3)`.
0. Add `andDistributeDivide` into `andSymbolTypeIntoSymtabConstraintV2`, and add a new member `involvedSymbols?: Set<Symbol>` to `ConstraintItem`, which is inherited by new dependent `ConstraintItem`.  That solves the problem of symbols being simplified out by `andDistributeDivide` - `calcCoverPerSymbol` will use `involvedSymbols` so that none are left out.  With a couple of fixes, now working.  Passes both V1 and V2.  V1 not necessary now because V2 also uses the simplifying power of `andDistributeDivide`.  (The downside is not being able to match should-be-reverted-to-pre-branch joins by object compare.)

0. (+) With `useConstraintsV2()` returning true, `andSymbolTypeIntoSymtabConstraintV2` replaces `andSymbolTypeIntoSymtabConstraintV1`, and `evalCoverPerSymbol` more or less replaces `andDistributeDivide`.  No need to maintain the cover of `const` variables in `symtab` as an invariant.  Instead, compute the covers directly from the unmodified constraint via `evalCoverPerSymbol`. (+) symbol.flags & EnumMember are treated as a LiteralType, symbols elided. (+) symbol.flags & (ConstEnum|RegularEnum) are not aded to symbol table or constraints. (+) By having no overlap of Constraints and symtab symbols, proper garbage collection when branches are trimmed (c.f. `setOfKeysToDeleteFromCurrentBranchesMap`) is enabled.

0. Add another functionality `vistSOP` (Sum of products) to help with `assertSymtabConstraintInvariance`.  Visit each SOP factor without storing all the memory.
0. Fix `mrNarrowTypesByBinaryExpressionEquals` to properly calculate mismatches. AND[over i](OR(left-isect[i],right-isect[i]).
0. Add functionality to `assertSymtabConstraintInvariance`: symtab must containt all symbol involved in constraint. (Already know to fail assertion - that bug must be analyzed and fixed). The bug was in `applyCritToArrRefTypesTableReturn`.
0. Fix `andSymbolTypeIntoSymtabConstraint` to modify symtab for non-const cases. (Needs to be done before `mrNarrowTypesByBinaryExpressionEquals` mismatches fix).  Be sure to modify `andTypeIntoNewSymtabAndNewConstraint` (changed name to `andRttrSymbolTypeIntoSymtabAndConstraint`) as well.
0. Fix non-const variables to work as they should, similarly to existing flow.  Tests "_cax-let-".
0. Rewrite of `mrNarrowTypesByCallExpression`:  each sig candidate set is processed separately in `mrNarrowTypesByCallExpressionHelperAttemptOneSetOfSig`.  Input parameters combinations are exhaustively checked by
using first failing parameter `{symtab,constraintItem}` of a successful match as the starting condition for the next signature.  If there is
no failing parameter, then matching is complete and the other sigs do not need to be checked.
0. `intersectRefTypesTypes` -> `intersectionOfRefTypesTypes` to match `unionOfRefTypesTypes`
0. `RefTypesSymtabConstraintItem` invariance is fixed by updating the symtab at the end of `andSymbolTypeIntoSymtabConstraint`.
0. Don't pass `inferStatus` to functions in `flowConstraints.ts`.
0. `case SyntaxKind.ParenthesizedExpression`, in case of `inferStatus.inCondition===true`, return `ret.inferRefRtnType.unmerged`. Test case: `_cax-parens-0001`
0. During `andSymbolTypeIntoSymtabConstraint`, the constraint tree is not being properly cleaned up after simplification.
E.g. in the following
```
{
  kind: return,
  type: true,
  symtab: [
    {  kind: leaf,  symbol: { id:16, ename: c1 },  isconst: true,  type: true,}
    {  kind: leaf,  symbol: { id:17, ename: c2 },  isconst: true,  type: false,}
  ]
  constraintItem: {
     kind: node,
      node: and,
      constraints:[
        {
         kind: leaf,
          symbol: { id:17, ename: c2 },
          type: false,
        },
        {
         kind: always,
        },
      ],
    },
}
```
the `always` should be removed and then the leaf constraint removed there should be no top level leafs - aha! - this is how the symtab can be repaired.
E.g. in the following
```
{
  kind: return,
  type: false,
  symtab: [
    {  kind: leaf,  symbol: { id:16, ename: c1 },  isconst: true,  type: false,}
    {  kind: leaf,  symbol: { id:17, ename: c2 },  isconst: true,  type: false | true,}
  ]
  constraintItem: {
     kind: node,
      node: or,
      constraints:[
        {
         kind: node,
          node: and,
          constraints:[
            {
             kind: leaf,
              symbol: { id:17, ename: c2 },
              type: true,
            },
            {
             kind: always,
            },
          ],
        },
        {
         kind: node,
          node: and,
          constraints:[
            {
             kind: leaf,
              symbol: { id:17, ename: c2 },
              type: false,
            },
            {
             kind: always,
            },
          ],
        },
      ],
    },
}
```
the `always` should be removed and then the leaf constraints with the same symbol should be combined.
(Examples from `_cax-and-005` output).


# Notes:

## visitSOP to


## Typescript limitation on calling overloads:
It is a typescript error to call an overload with a parameter type that can satisfy more than one overload.
That seems like an excessive limitation but I suppose the counter argument is that a generic could be used instead,
although that would be extra work for the user.
Example:
```
// @strict: true
// @declaration: true
declare function foo(x:number):number[];
declare function foo(x:string):string[];
declare const a: number | string;
const r = foo(a);
// No overload matches this call.
//   Overload 1 of 2, '(x: number): number[]', gave the following error.
//     Argument of type 'string | number' is not assignable to parameter of type 'number'.
//       Type 'string' is not assignable to type 'number'.
//   Overload 2 of 2, '(x: string): string[]', gave the following error.
//     Argument of type 'string | number' is not assignable to parameter of type 'string'.
//       Type 'number' is not assignable to type 'string'.ts(2769)
```

A consequence is that `case SyntaxKind.CallExpression` currently has a narrow constraint making it easier to code.
