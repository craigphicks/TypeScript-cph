

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

1. There is a mistake in `mrNarrowTypesByCallExpression`:  it is flat'ing the the pre-result candidates and all the signature candidates for one pre-result to the same level.  That is not correct - each pre-result candidate with one signature must match, but if the pre-result candidate has multiple sigs then we should accept the first one that matches and ignore the rest (of course if none match thsat's an error).

1. Working with let (as opposed to const).


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

1. Inside `andSymbolTypeIntoSymtabConstraint`, before returning, the symtab is updated to assure the invariance property of the returned `RefTypesSymtabConstraintItem`.  There might be some advantage to doing in a single pass with all symbols together, although
either way it is O(#(tree nodes) * #(symbols)), but might be less function calls in a single pass.


### Done (reverse order)

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
