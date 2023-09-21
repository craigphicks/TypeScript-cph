
Proposal for a unified specification of TypeScript union-of-functions (UOF) type functions.



## Type checking a CallExpression

Verbal Definitions:

- `weakMatch(passedTypes,sigparams)` implies that signature `sig` might match the types passed to the function call, and therefore the `sig.returnType` must be included in the set of possibleReturnTypes. However, weakMatches does not imply that the signature must match the types passed to the function call.

- `strongMatches` implies that a signature must match the types passed to the function call.

- `setOfPossibleReturnTypes` is set of return types of signatures satisfying `weakMatches`

- `someStrongMatch` implies at least one signature has a strong match.

Psuedocodes:

```
function weakMatch(arrPassedTypes,arrSigParams){
    // Note: checking optional/rest sig params and too few/many parameters passed not included in psuedocode
    return arrSigParams.every((sigparam,idx)=>{
        return st.hasNonEmptyIntersection(arrPassedType[idx],sigparam),
    })
}
setOfPossibleReturnTypes = new Set();
sigs.forEach(sig=>{
  if (weakMatch(arrPassedTypes, sig.parameters)) setOfPossibleReturnTypes.add(sig.returnType);
});
```
```
function weakMatch(arrPassedTypes,arrSigParams){
    // Note: checking optional/rest sig params and too few/many parameters passed not included in psuedocode
    return arrSigParams.every((sigparam,idx)=>{
        return st.hasNonEmptyIntersection(arrPassedType[idx],sigparam),
    })
}
```
