

## Document:

### `RefTypesSymtabConstraintItem` invariance

The `RefTypesSymtabConstraintItem` with members `{symtab: ,constraintItem}` is a unit with an invariance as follows:
For each symbol in symtab, the type:RefTypesType given by symtab.get(type) is the minimal cover of symbol
over the constraintItem.  That is the result type:RefTypesType that would be returned by calling evalOverConstraint(symbol, constraintItem): RefTypesType.

That invariance is preserved by using only these functions to modify a RefTypesSymtabConstraintItem unit from any function in `flowGroupInfer2.ts`
- `andSymbolTypeIntoSymtabConstraint`
- `orSymtabConstraints`

[1] Note that `evalTypeOverConstraint` is exposed by `flowConstraints.ts`, so it can called from `case SyntaxKind.Identifier` to
determine the value to (eventually) be added to symtab, in the case where it was not already present.

## TODO:

### Priority: High

1. As stated in Note[1] above, in `case SyntaxKind.Identifier`, only call `evalTypeOverConstraint` if symbol is not already in `refTypesTableSymtabIn`.  (Make the code match the doc).

1. During `andSymbolTypeIntoSymtabConstraint`, the constraint tree is not being properly cleaned up after simplification.
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

1. Inside `andSymbolTypeIntoSymtabConstraint`, before returning, the symtab is updated to assure the invariance property of the returned `RefTypesSymtabConstraintItem`.  This must be optimized, probably during `andSymbolTypeIntoSymtabConstraint`.

### Priotity: Low

1.  Implement "not" of literal types to apply to uncountable nonSingular types.
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

### Done

0. `RefTypesSymtabConstraintItem` invariance is fixed by updating the symtab at the end of `andSymbolTypeIntoSymtabConstraint`.  Still need to be optimized.
0. Don't pass `inferStatus` to functions in `flowConstraints.ts`.
0. `case SyntaxKind.ParenthesizedExpression`, in case of `inferStatus.inCondition===true`, return `ret.inferRefRtnType.unmerged`. Test case: `_cax-parens-0001`
