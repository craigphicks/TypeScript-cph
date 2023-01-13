

## Document:

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

0. Don't pass `inferStatus` to functions in `flowConstraints.ts`.
1. `case SyntaxKind.ParenthesizedExpression`, in case of `inferStatus.inCondition===true`, return `ret.inferRefRtnType.unmerged`.
2. As stated in Note[1] above, in `case SyntaxKind.Identifier`, only call `evalTypeOverConstraint` if symbol is not already in `refTypesTableSymtabIn`.  (Make the code match the doc).

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

