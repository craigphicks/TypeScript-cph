

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



0. [`evalCoverPerSymbol` and unmodified constraints]
- VisitSOP replaces "evaluateTypeOverConstraint" which could give overly large cover values.
It is currently called from within EACH call to `andDistributeDivide` to rectify the constraint tree after it has been simplified.
That's a lot! Might be less compuatation-work to leave the constraint item unsimplified and just call visitSOP when evaluation is required.
Consequences of that:
- No need to maintain the cover of `const` variables in `symtab` as an invariant.  Instead, compute the covers directly from the unmodified constraint via `evalCoverPerSymbol`.  That result can be cached on the constraint.  `symtab` remains for non-const variables only.
- Constraints remaining unmodifed means they will be removed properly at 

- 0.0. Optional member in ConstraintItem `recalc` which will contain an equivalent but less verbose expression of the constraint.  This could be set when evaluation result has a less verbose SOP than the original.

1. Need to move onto hitting all the basic ops and structures as soon as possible. Huge job!
1. Most testing of input combinations for `mrNarrowTypesByCallExpression`.
1. Rest parameter testing for `mrNarrowTypesByCallExpression`.
1. Coding and testing of Optional parameter handling for `mrNarrowTypesByCallExpression`.

### Priotity: Postponed

1. [Implicit-not to economize memory use] Currently `ConstrantItemKind.not` is never involed in the `type` arugment to `andSymbolTypeIntoSymtabConstraint`, and therefore never exists in the modifed constraint.  (1) That means the `not` paths are never actually being run (although they were at an earlier period in development).  (2) It means that the not components, e.g., from else, are always expanded before calling `andSymbolTypeIntoSymtabConstraint`.  If an enumerable of literals has many values (say thousands) then that becomes a memory hog. Possible approaches: (1) Use the `not` feature, at least for leafs. (2) Add a not flag/member to `ConstraintItemLeaf`. (3) Implement `not` at the `RefTypesType` level for individual literal type elements.

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

1. Inside `andSymbolTypeIntoSymtabConstraint`, before returning, the symtab is updated to assure the invariance property of the returned `RefTypesSymtabConstraintItem`.  There might be some advantage to doing in a single pass with all symbols together, although
either way it is O(#(tree nodes) * #(symbols)), but might be less function calls in a single pass.


### Done (reverse order)

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

## visitDNF manual simulation

```
or(x:t, b:t)
1. [], or(x:t, y:t)), []
1.1. [], x:t, []
1.1. action([x:t])
2.1. [], y:t, []
2.1. action([y:t])
```

```
not(or(x:t, b:t))
1.[], not(or(x:t, b:t)), []
1.[not(x:t)], not(y:t), []
1. action([not(x:t),not(y:t)])

```

```
and(x:t, b:t)
1.[], and(x:t, y:t)), []
1.[], x:t, [y:t]
1.[x:t], y:t, []
1.action([x:t, y:t])
```

```
(not(and(x:t, b:t))
1.[], (not(and(x:t, y:t)), []
1.1 [], not(x:t), []
1.1 action([not(x:t)])
1.2 [], not(y:t), true, []
1.3 action([not(y:t)])
```

