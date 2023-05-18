

## Document:

## TODO:

### Priority: High

0. LogicalObject

    0. effectiveDeclaredType to be kept on outside, not inside.  Then no need for tsType member on set-unions

    0. LogicalObjectOuter to hold variations (narrowed key properties) - how will this work with union and intersection?

        0. ~~Another way to use LogicalObjectOuter would be invalidate the handle contents (set inner to null) when a LogicalObject is mutated, to prevent accidental usage.  Work backwards from the error to figure out where clone is required. Then the object variations could kept in the plain objects (original plan).~~

        0. However, a condition imposed on a key property, (which does not purely narrow types), can apply to multiple plain objects - so a key to flough type map on the outside seems like a clean representation (current plan).

        0. Intersection: intersection of the insides, then union of the outside variation keys, intersection of their properties - any never intersection results in a total never result. Then evaluate each key - any never evalution results in a never result.

        0. Union: Eval each variation key over the other union operand to get new value.  Then union of insides + union of outside variations.

    0. Unclear on semantics of subsetRelation vs asignableRelation

    0. Ordering of objects could be an optimization, probably.

0. AndSymbolTypeIntoSymtabContraint, reduce number of calls.

    0. Required for conditions

    0. Required for the lhs of a constant replay when the lhs symbol has been narrowed by a condition.

    0. not required for not-const non-conditions

0. For a group which is non-replay and non-assign, the current branch input can be used as output.

0. Property assignment


0. `SyntaxKind.ContinueStatement`,`BreakStatement`: test cases with label targets, block break. -- Break targets not yet tested/
0.  `Do` loop
0.  `For`,`ForOf`,`ForIn` loops
0.  `Switch`


0. It seems that sometimes the same statements are getting computed more than once via heap, e.g.,  [a], [b], [a,b,c].  E.g. _caxnc-prop-0003, `grep updateHeapWithGroupForFLow tmp.de1.di0.dfc1.txt` to see it.  Need to check if this is happing elsewhere.  Need a strategy to keep some cbes in memory when they are know dependencies of groups not yet called.  Checked, not a problem in whileLoop-0046, at least. (This was at least improved for  _caxnc-prop-0003 by commit ff478282a2).


0. A new function in checker: `isConstantSymbolOfIdentifier(symbol)` based on `isConstantReference(expr)`.  That way `expr` is not required.



0. `const widenedType = createRefTypesType(checker.getWidenedType(unwidenedTsType));` When `unwidenedTsType` is type true, `checker.getWidenedType(unwidenedTsType)` is still true.

0. Test case and code: When comparing ===, left and/or right are also mutating expressions. E.g., `((a=b)===(c=d))`


0. Deconstructed lhs.

### Priority: Postponed

0. Within loops, during invocations===0, does the node to type map neeed to be set?  For variable declarations which will become a replay, yes, because the non-const node values are required for the replay. Node map setting does not take much time.

0. The nodes of lhs of declarations and assignments are not included in node to type maps.  Could they be?
1. During grouping, collect the symbol involved in every group.  That can used to
1. In a `while (condtion){ body }` loop, if the body convergence and condition covergence were calculated seperately, the final body pass could be skipped if the body converged before the condition.  Because the body the body can be very long in comparison to the condition that could be worthwhile.
1. The tests in `tests/cases/conformance/_caxyc`, e.g. the tests with `compilerOptions.mrNarrowConstraintsEnable:true`, should all pass.
1. In `processLoop` there is call to `createHeap` and it might be too expensive to do for every loop, and it is unnecessary, use heap prototype instead.
1. The Map type members in InferStatus (`declaredTypes`, `replayables`, `groupNodeToTypeMap` could all be `WeakMap`s).
1. With SyntaxKind.EqualsToken - what should be done if the rhs type is not a subset of the declared type?  Check existing behavior.
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

0. _caxnc-whileLoop-005x series: currently when initializer is a naked literal with no type, the intializer is set to (* check it), flow value is set to the initializer, and ored literal types remain as literal types instead of being widened.  This does not match the original (not mrNarrow) flow specs where a literal intializer without a type becomes the widened initializer.  Make the default behavior match the existing specs but allow the non-widening behavior with a parameter setting.

    - The parameters is `compilerOptions.compileOptions.mrNarrowDoNotWidenInitalizedFlowTypes`.


0. Test case and code: `mrNarrowTypesByBinaryExpresionAssign` assumed lhs is statement level, and sets inCondition to false, but it should be inherited.  E.g., `let x = (y=z)`).  _caxnc-rhsAssign-0001


0. A minor optimization before last condition in loop using `modifiedInnerSymtabUsingOuterForFinalCondition`

0. Bug fix in RefTypeSymtabProxy.get
```
    // TODO: changed becaused isAssign:true && assignedType: undefined causes _caxnc-whileLoop-0056 to fail.
    //this.symtabInner.set(symbol,{ type, isAssign:true, assignedType: undefined });
    this.symtabInner.set(symbol,{ type, isAssign:true, assignedType: range });
```
All _caxnc- passing (fixme moved in FIXME folder )

0. [proxySymtabSqueezing] Description: The name refers to a O(#statements) 2-pass top-down algorithm for processing types in loops.

    0. The problem in solving types in loops is the feed from loop end to loop top, resulting in self-referencing.  Any solution must be a cover of the actual types. A naive but relatively accurate solution is to run through the loops growing the types until convergence.  However the worst case complexity is
    O(#statements^2), which is not acceptable.

    0. In 2-pass, the first pass assumes the widest types possible, while gathering information about each symbols assigned range within the loop (including not being assigned at all).  This information is fed back into the second loop, to give a narrower result, which is guaranteed to be a cover of the actual types.

    0. The top-town means each loop and embedded loop bodies (\*) are traversed exactly twice.  Not twice per parent loop, but twice in total. (\*) A while loop condition is actually processed twice - it processes as CONDITION, BODY, CONDITION.

    0. Type results are comparable to the existing flow algorithm.

    0. Much remains to be done still with loop - see TODO.


0. `src/compiler/flowGroupRefTypesSymtab.ts` file added, `RefTypesSymtab` now aliased to `RefTypesSymtabProxyI`.
Currently working exactly as before except for that change. O(N) loop processing not yet implemented.  That's next.
All `_caxnc-` tests passing.

0.  Removed these hard code controls and associated code.  That changed results for `_caxnc-whileLoop-00(01|52)` so baseline-accept; now all `_caxnc-` tests passing.
  ```
      //export const widenLiteralInitializersInLoop = true;
      //export const widenLiteralAssignmentsInLoop = false;
      //export const doInvolved = false;
  ```


0. [widenLiteralInitializersInLoop]  With this setup was able to achieve a ~25% speedup but still O(N^2) loop behavior.
However, ugly side effect loss of precision for pure single pass logic of a variable defined inside a loop, c.f. `_caxnc-whileLoop-0001`.
    ```
        export const doNotTraverseNever = false;
        export const widenLiteralInitializersInLoop = true;
        export const widenLiteralAssignmentsInLoop = false;
        const hardCodeEnableTSDevExpectStringFalse = true;
        export const doInvolved = false;
    ```
1. (cont)... It seems `doNotTraverseNever` makes almost no difference in timing, at least currently (inter-group only, no intra-group).
Executed `gulp baseline-accept` for `_caxnc-whileLoop-00(01|55|56)` just for the record to show the shorter iterations.
But didn't change `@ts-dev-expect-string` iteration count values for other while loops because have a new plan anyway.
For the next step `widenLiteralInitializersInLoop`,`widenLiteralAssignmentsInLoop`,`doInvolved`, will be all be false (and ultimately removed) - see [proxySymtabSqueezing] in [TODO].


0. [doNotTraverseNever] Added global control variables `doNotTraverseNever` (currently `true`), `alwaysWidenInitializers` (currently `false`), and `doInvolved` (currently `false`) at top of `flowGroupInfer.ts`, to test changes in a modular way.  Currently `doNotTraverseNever` is only affecting at the inter-group level, from withing `resolveGroupForFlow`.  However, it should ultilmately be extended to intra-group processing.   All _caxnc- tests passing.

0.  Setting of `involved`, both in and out.  However it is NOT used yet.  Just that uncovered some bugs (1) accumulateSymtab bug (2) for function Identifiers, return type without symbol. All _caxnc- test passing.

0.
    0. loopGroupToProcessLoopStateMap moved into ProcessLoopState from MrState.

    0. Redundant line "forFlow.groupToNodeToType.set(groupForFlow, inferStatus.groupNodeToTypeMap); " removed from resolveGroupForFlow

    0. all _caxnc- test passing

0.  included some features from origin/condalias-49075-work-2-lg-involvedSymbols-old branch, esp. binder.ts `labelBlockScopes` and new tests tests/cases/conformance/_caxnc-prop/_caxnc-prop-000(2|3).ts. all _caxnc- test passing


0. `(mrNarrow.isASubsetOfB(typeIn, gotType) && mrNarrow.isASubsetOfB(gotType, typeIn))` replace with `mrNarrow.equalRefTypesTypes(typeIn,gotType)` in 2 places.

0. Optimization `applyCritToArrRefTypesTableReturn` for case `crit.none` and `length===1`.

0. New function `accumulateSymtabs` with option `{widenLiterals:boolean}`. Currently running with `{widenLiterals:false}`, all `_caxnc-` tests passing. The plan is to change to `{widenLiterals:true}` and see some loops change to less complex convergence.

0.  ~~Currently always returning type `symbolFlowInfo.effectiveDeclaredType` in `mrNarrowTypesByPropertyAccessExpression`, but should be referencing symbol table if it is there, so the properties can be narrowed~~. Not a problem because the passed back type is intersected with the symtab type above in the calling function.  C.f. _caxnc-prop-0001.ts.

0. "symbolFlowInfo"

    0. replaced `mrState.declaredTypes`, `inferStatus.declareTypes` with `symbolFlowInfo.effectiveDeclaredType`.

    0. New functions: `createRefTypesTableLeafFromSymbolFlowInfo`, `getDeclaredTypeAsRefTypesTableLeaf`, `getDeclareType(symbol)`

    0. Removed `createGetDeclaredType(inferStatus)`.

    0. RefTypesSymtab is now just a Map<Symbol,RefTypesType>

    0. member leaf removed, symtab simpolified, all _caxnc- tests passing

    0. cleanup getDeclaredTypes, all _caxnc- tests passing

    0. copyRefTypesSymtab now alias of new Map<...>(symtab)

    0. added _caxnc-decl-001*.ts tests

    0. All `_caxnc-` tests passing.

0. "symbolFlowInfo", setting in places:  `VariableDeclaration`, `mrNarrowTypesByBinaryExpresionAssign` and `mrNarrowTypesByPropertyAccessExpression`.  All `_caxnc-` tests passing.

0. "actualDeclaredType": Now working under VaraibleDeclararation using `checker.getTypeOfTypeNode` and `checker.widenTypeInferredFromInitializer`.  Using "ts-dev-expect-string" to check the "actualDeclaredType" against expected described in test files `_caxcn-decl-`. Not yet added to `SymbolFlowInfo`  All `_caxnc-` tests passing.

0. "actualDeclaredType (older)"

    0. Knowing the "actualDeclaredType" for a declaration is required to achieve equal standing with existing code on type resolution - e.g., explicit types 1|2|3 vs. "number".  If the type is declared explicilty (i.e., variable declaration with a `type` member), that should be easy to achieve (barring difficult template types).  Otherwise, it depends on the initializer, and widening of the initializer.  The widening depends upon the rhs type, whether the declaration itself is `const` or not, and whether the rhs is `as const` or readonly.  Notably, in a loop situation, the declaration itself may be recomputed multiple times.

    0. "Existing Code": I tried to leverage existing checker functions first:

        0. To get the type of the initializer, after its value had been successfully computed, used `callCheckerFunctionWithShallowRecursion` function to call `checker.getTypeOfSymbol`.  The `callCheckerFunctionWithShallowRecursion` function sets up a node type cache for the next call through existing code to `getFlowTypeOfReference`, so that can be called exactly once without true recursion.  Unfortunately, that resulted in `reportCircularityError` being called (from inside `getTypeOfVariableOrParameterOrPropertyWorker`).  Obiously this was not because a true recusive circularity occured, because `callCheckerFunctionWithShallowRecursion` prevents that. Instead it is called because the existing code *predicts* that if the existing flow were used it would not be computable.  I then tried bypassing the clauses with `reportCircularityError` - the code was able to complete but some `_caxnc-` tests failed in strange ways - I think it may be because the existing code is not happy about recalculating declaration types - perhaps it expects only the one final result.

        0. Tried using `checker.widenTypeInferredFromInitializer(...)`.  That failed to widen the type, e.g., `let x=true` resulted in `true`, not boolean.  It might be the cause that argument types need to have flag set with `TypeFlag.RequiresWidening`?.

        0."getTypeFromTypeNode": This is a checker function.  It is surely already called in the special case where a declaration has an explicit type declared.  Perhaps we can assumed that if a type member is present on a declaration, then this function has been called.

    0. "Stubs for new code":  I added some function stubs `mrNarrowWidenLiteralType`,`mrNarrowWidenLiteralObjectType`,`mrNarrowWidenLiteralObjectType`.  However, really don't want to reinvent the wheel.


0. Added function stubs, `mrNarrowGetActualDeclaredType`, `mrNarrowWidenLiteralType`, `mrNarrowWidenLiteralObjectType` for use in determining the "actualDeclaredType" when it is a widened initializer result.  However, in case of objects which are not tuple or array, I'm not sure how an object should set up - I think it would be best to debug a simple test case and see what is happening already.
Dev notes:  However, maybe it would be easier to try supressing `reportCircularityError`. Oops - this creates "circularity errors" that make no sense.  Try "Dev notes: denTypeInferredFromInitializer" instead - doesn't widen as expected. true->true not boolean. Tried avoiding "circularity errors" by commenting out section with `` in `checker.getTypeOfVariableOrParameterOrPropertyWorker`, but it caused subtle side effects that made just a couple of tests fail, so that is no good.  Looks like "mrNarrowGetActualDeclaredType" is the only way forward.


0. "Bonk" went away - was it an environment problem?
0. Modifications to enable calling `checkSourceFile` in a loop for timing purposes, with environment variable `numLoopCheckSourceFile=<number of extra loops>`.
0. Fixes to remove debug formatting statements in `Debug.XXX` calls.
- All `_caxnc-` tests passing.


0. In `mrNarrowTypesInnerAux` for `case SyntaxKind.StringLiteral` substituting `checker.getStringLiteralType(getSourceTextOfNodeFromSourceFile(sourceFile,expr))` for `checker.getTypeAtLocation(expr)` failed (test type results failing) although it worked for `TrueKeyword`, `FalseKeyword`, and `NumericLiteral`.  Perhaps extra quotes.  Fixed.
- All `_caxnc-` tests passing.

0. Seperated `withinLoop` to `accumulateNodeTypes` and `accumulateBranches`.  Confirmed that `accumulateBranches` alone, without `accumulateNodeTypes`, is sufficient to pass all tests - absolutely no change in results.  (`accumulateNodeTypes` without `accumulateBranches` does not pass all tests.) The `accumulateNodeTypes` member was removed and `function maybeUnionOfTypeOverLoop` is commented out.
- All `_caxnc-` tests passing.

0. Any cbe left at the end of a loop correpond either to (1) the antecedents of the loop control or (2) the antecedents external to loop control.  The (1) antecedents of the loop control will be consumed on the next loop iteration, unless the loop converges, in which case they are not needed. The (2) antecedents external to loop control are not consumed on each iteration so must be accumulated until they are read.  The obvious place to do this is within the global currentBranchMap.
0. Loop-convergence-fix1: `_caxnc-whileLoop-0042.ts` not passing because inner loop is converging and finishing without propogating out the new inputs.  Chosen solution is (1) to use the nodeToTypeMap cummulative result and feed it back into every r.h.s. identifier.  L.h.s. of assignments is union of cummulative with r.h.s. of assignment.  This includes variable declarations (const and non-const) as well as assignments. (2) Detecting convergence: Instead of comparing to a copy of the previous iteration, set a flag when when update to node to type map makes a change.  However, for the time being keep the copy compare action to ensure the flag action is working correctly - i.e., keep them both. (3) Symtab/Constraints: should follow from (1) with no special action required.
- All `_caxnc-` tests passing.

0. `recordBreakAndReturnOnControlLoop` directive variable added to `createBinder` in `binder.ts` and optional member `controlExits` to `FlowLabel` - these allows `break` statements to be accesses from loop control, the utility of which is to be able to include all such exits from the loop when calculating dependencies in the `GroupsForFlow["groupsToAnteGroupMap"]` map.   `arrControlExit` member added to `FlowGroupLabelLoop` in `flowGroupInfer.ts`, but is not currently used.
All `_caxnc` tests passing.

0. `flowNodesDebugWrite.ts`, code moved out of `checker.ts` and `flowNodesToString` called before `createAndSetSourceFileInferState` so that if an assertion fails in `createAndSetSourceFileInferState` we can still analyze the flow nodes graph.

0. A `while(true)` loop was getting prematurely optimized in binder, causing an assert failure in flow node grouping.  That's now fixed with `alwaysAddFlowToConditionNode` in binder - `_caxnc-whileLoop-0040` now passes with this fix.  All `_caxnc-` tests passing.

0. Switch `devExpectStringEnable` is back on. `sourceFileMrState.mrState.loopGroupToProcessLoopStateMap`, working properly. None of the existing tests result types were changed.


0. `processLoop` setup to use `sourceFileMrState.mrState.loopGroupToProcessLoopStateMap`, and also setup to check loopCount and invocations of each `ProcessLoopState` in that map, although the `devExpectStringEnable` switch is still forced off.  Will have to go back and determine the expect values for each test case.  All tests passing.

0. Had to change the `processLoop` to not break on loop conditions of never - because otherwise some cbe are not setup for postcessers.  Therefore also had to turn off `devExpectStringEnable` because many of those are expecting loop to quit on never conditions.  However, the loop count is still important, so `devExpectStringEnable` might be switched on later .... but there is another problem - when the loop antecesser conditions change the loop will be recalculated and the loopCount may differ.  Which leads to another issue - preserving the union state of inner loops so that subsequent calls to processLoop do less work or possibly no work at all, not to mention convergence and being accurate.  Keeping in mind the aforementioned major change required, all tests are passing.


0. Made a change to binder "labelAllFunctionCalls" because without it a conditional expression like `if (maybe()) ....` would not get labelled, and the "then" or "else" wouldn't match up properly.  (Caused `_caxnc-whileLoop-0033` to fail assert).  Small change with big implications.  All tests passing.

0.  Embedded while loops. (Without break or continue).  new tests `_caxnc-whileLoop-003(0|1|2)`. All tests passing.
0. added `checkDevExpectString` function (previously was inline).

0. `CurrentBranchItem` changed to be `{sc: RefTypesSymtabConstraint}` rather than `RefTypesTableReturn`. All tests passing.

0. The branches accessed from outside a loop (specifically conditional `break`s) need to be accumulated over all iterations.  `_caxnc-whileLoop-0023.ts` tests this issue.  All tests passing, including  `_caxnc-whileLoop-0023.ts`.

0. `SyntaxKind.ContinueStatement`,`BreakStatement`: test cases in plain while loop.  Tests passing, `break` in `_caxnc-whileLoop-002` series.

0. Confirm the behaviors of each of `tests/cases/conformance/_caxnc`. (Unfortunately`tests/cases/conformance/_caxyc` is no longer all passing but that will be left for later, as getting it working with `compilerOptions.mrNarrowConstraintsEnable:false` is a priority.)

0. Add compileOption parameter `mrNarrowConstraintsEnable`, with default value false.  When off, constraints are not used, and constant variable are stored in the symbol tables.  This behavior (1) has less computational complexity, and (2) has basically the same end result logic as existing ts flow.
0. Add another compileOption parameter `mrNarrowEnable`, but don't enforce it in code yet because the env switch using `myDisableInfer=0` intstead of `myNarrowEnable:true` is easier for development at the moment.
0. From the tests dataset directory `tests/cases/conformance/_cax` create two copies `tests/cases/conformance/_caxnc` and `tests/cases/conformance/_caxyc` which have the compilerOptions directive set in the header `@mrNarrowConstraintsEnable: false` and `@mrNarrowConstraintsEnable: true` respectively.


0. During `processLoop`, and the end of the loop, symbols going out of scope are removed from the symbol table.  Has also been extended to work for `PostIf` - all tests passing.

0. `tests/cases/conformance/_cax2/_cax2-whileLoop-000(1-5).ts` passing, tests all different loop paths.  Still need to purge out of scope symbols (which would allow temporary fix in VariableDeclaration to be removed.)
0. Loop truthy and falsy condition check and exit loop only when truthy type is 'never'. (Convergence is a separate exit loop condition).
0. Loops: `processLoop` to be called from `resolveHeap`.  Within `processLoop` the loop is processed to completion, using a `forFlow` context which is independent of `forFlowParent` context.  Then the final local `forFlow` nodeToType maps are merged into `forFlowParent`.  HOWEVER - using fake loop end condition `loopCout===1`. All `_cax-` tests passing.  `_cax2-whileLoop-0001` passing, despite using fake end loop condition.
0. currentBranches key (of type group) not being removed before loop (and maybe if). Fixed for `loop`.  Still have to check `if`.


0. Implemented SyntaxKind.EqualsToken - but type is not checked against declared type (TODO).
0. Partialy implented while-loop, but only first pass.  Beyond first pass requires change to `resolveHeap`.


1. Refactoring `flowNodesGrouping.ts, makeGroupsForFlow(...)` and `flowGroupInfer.ts, resolveGroupForFlow(...)` so that `resolveGroupForFlow` does not use `FlowNode` types or other-that-the-maximal node of a `GroupForFlow`.  This is done by defined a new type `FlowGroupLabel` defining the relations between groups.  By clarifying those relationsships, it will be easier to add loop structure.  All tests under `.../_cax` passing.

1. There is bug at the top branchinglevel for expressions like `((a&&b)||(c&&d))`, but not `(a&&b||c&&d)`. Fixed:  Change in flowNodesGrouping to make grouping more expansive.  All tests passing.

1.  The testing call to `evalTypeOverConstraint` can actually be placed inside `evalCoverForOneSymbol`, to get a few more hits (in case Identifier).


1. Every call to `andSymbolTypeIntoConstraint` is now calling both `evalCoverForOneSymbol` and `evalTypeOverConstraint` to compare results with a Debug.assert(),
all passing so far. `evalTypeOverConstraint` should be faster, but the tree must be in a good state or it can fail - `evalCoverForOneSymbol` is more robust.
1. Removed V1 code.
1.All tests passing


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

## command line snippets

- myMaxLinesOut=300000 myDebug=1 myDebugLevel=0 myDisableInfer=0 gulp runtests --tests="_caxnc-"
- myMaxLinesOut=300000 myDebug=0 myDebugLevel=0 myDisableInfer=0 gulp runtests --tests="_caxnc-"
- `myMaxLinesOut=300000 myDebug=0 myDebugLevel=1 myDisableInfer=0 gulp runtests --tests="_caxnc-"`
- `numLoopCheckSourceFile=10 myDebug=0 myDebugLevel=0 myDisableInfer=0 node  built/local/tsc.js tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0045.ts`
- `numLoopCheckSourceFile=10 myDebug=0 myDebugLevel=0 myDisableInfer=0 node  --prof built/local/tsc.js tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0045.ts`
- `node --prof-process isolate- > isolate.txt`






