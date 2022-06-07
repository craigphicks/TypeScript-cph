```
interface Foo {
    getValues(): number[];
}

declare const foo: Foo | undefined;

const vals = foo?.getValues();
if (vals) {
    foo; // Foo | undefined    --- BUG
}

const vals2 = foo && foo.getValues();
if (vals2) {
    foo; // Foo
}

if (foo?.getValues()) {
    foo; // Foo
}
```

Conditional aliasing pull
```
https://github.com/microsoft/TypeScript/pull/44730
```

Pull test file 


tests/cases/conformance/controlFlow/controlFlowAliasing.ts


getTypeAtFlowNode
getFlowTypeOfReference
checkIdentifier


```
  checkSourceElement
    {
        foo; // Foo | undefined    --- BUG
    }
    checkSourceElement
      foo;
      getFlowTypeOfReference
        reference: foo
        declaredType: Foo | undefined
        getFlowTypeOfReference
          reference: foo
          declaredType: Foo | undefined
          return resultType: Foo
        In getIdentifier(), getFlowTypeOfReference returned Foo
        return resultType: Foo | undefined
      In getIdentifier(), getFlowTypeOfReference returned Foo | undefined
```

```
    checkSourceElement
      foo;
      checkExpressionWorker
        node: foo
        getFlowTypeOfReference
          reference: foo
          declaredType: Foo | undefined
          checkExpressionWorker
            node: foo.getValues
            checkExpressionWorker
              node: foo
              getFlowTypeOfReference
                reference: foo
                declaredType: Foo | undefined
                return resultType: Foo
              In getIdentifier(), getFlowTypeOfReference returned Foo
              return: Foo
            return: () => number[]
          return resultType: Foo | undefined
        In getIdentifier(), getFlowTypeOfReference returned Foo | undefined
        return: Foo | undefined
```


```
      checkExpressionWorker
        node: foo
        getFlowTypeOfReference
          reference: foo
          declaredType: Foo | undefined
          getTypeAtFlowNode
            
            True (vals2) ─ Branch ┬ True (vals) ─┬ Assignment (vals2 = foo && foo.getValues()) ─ Branch ┬ False (foo) ─────────────────────────┬ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                  │              │                                                      │                                      │                                               ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                  │              │                                                      │                                      │                                               ╰ False (foo?.getValues()) ╯                
                                  │              │                                                      ├ True (foo.getValues()) ─┬ True (foo) ╯                                                                                           
                                  │              │                                                      ╰ False (foo.getValues()) ╯                                                                                                        
                                  ╰ False (vals) ╯                                                                                                                                                                                         
            
            getTypeAtFlowNode
              
              Branch ┬ True (vals) ─┬ Assignment (vals2 = foo && foo.getValues()) ─ Branch ┬ False (foo) ─────────────────────────┬ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                     │              │                                                      │                                      │                                               ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                     │              │                                                      │                                      │                                               ╰ False (foo?.getValues()) ╯                
                     │              │                                                      ├ True (foo.getValues()) ─┬ True (foo) ╯                                                                                           
                     │              │                                                      ╰ False (foo.getValues()) ╯                                                                                                        
                     ╰ False (vals) ╯                                                                                                                                                                                         
              
              getTypeAtFlowNode
                
                True (vals) ─ Assignment (vals2 = foo && foo.getValues()) ─ Branch ┬ False (foo) ─────────────────────────┬ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                                   │                                      │                                               ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                                   │                                      │                                               ╰ False (foo?.getValues()) ╯                
                                                                                   ├ True (foo.getValues()) ─┬ True (foo) ╯                                                                                           
                                                                                   ╰ False (foo.getValues()) ╯                                                                                                        
                
                getTypeAtFlowNode
                  
                  Assignment (vals2 = foo && foo.getValues()) ─ Branch ┬ False (foo) ─────────────────────────┬ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                       │                                      │                                               ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                       │                                      │                                               ╰ False (foo?.getValues()) ╯                
                                                                       ├ True (foo.getValues()) ─┬ True (foo) ╯                                                                                           
                                                                       ╰ False (foo.getValues()) ╯                                                                                                        
                  
                  getTypeAtFlowNode
                    
                    False (foo) ─ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                                ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                                ╰ False (foo?.getValues()) ╯                
                    
                    getTypeAtFlowNode
                      
                      Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                    ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                    ╰ False (foo?.getValues()) ╯                
                      
                      getTypeAtFlowNode
                        
                        False (foo) ─ Start  
                        
                        getTypeAtFlowNode
                          
                          Start  
                          
                          Foo | undefined
                        undefined
                      getTypeAtFlowNode
                        
                        True (foo?.getValues()) ─ True (foo) ─ Start  
                        
                        getTypeAtFlowNode
                          
                          True (foo) ─ Start  
                          
                          getTypeAtFlowNode
                            
                            Start  
                            
                            Foo | undefined
                          Foo
                        Foo
                      getTypeAtFlowNode
                        
                        False (foo?.getValues()) ─ True (foo) ─ Start  
                        
                        getTypeAtFlowNode
                          
                          True (foo) ─ Start  
                          
                          Foo
                        Foo
                      Foo | undefined
                    undefined
                  getTypeAtFlowNode
                    
                    True (foo.getValues()) ─ True (foo) ─ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                                                        ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                                                        ╰ False (foo?.getValues()) ╯                
                    
                    getTypeAtFlowNode
                      
                      True (foo) ─ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                                 ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                                 ╰ False (foo?.getValues()) ╯                
                      
                      getTypeAtFlowNode
                        
                        Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                      ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                      ╰ False (foo?.getValues()) ╯                
                        
                        Foo | undefined
                      Foo
                    Foo
                  getTypeAtFlowNode
                    
                    False (foo.getValues()) ─ True (foo) ─ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                                                         ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                                                         ╰ False (foo?.getValues()) ╯                
                    
                    getTypeAtFlowNode
                      
                      True (foo) ─ Assignment (vals = foo?.getValues()) ─ Branch ┬ False (foo) ──────────────────────────┬ Start  
                                                                                 ├ True (foo?.getValues()) ─┬ True (foo) ╯   
                                                                                 ╰ False (foo?.getValues()) ╯                
                      
                      Foo
                    Foo
                  Foo | undefined
                Foo | undefined
              Foo | undefined
            Foo
          return resultType: Foo
        In getIdentifier(), getFlowTypeOfReference returned Foo
        return: Foo
checkSourceElement
```

`_caxb.ts` and `_caxg.ts` OK.

`tests/cases/conformance/controlFlow/controlFlowOptionalChain.ts` failing.  

             True (!val2a) ─ Assignment (val2a = c && c.foo1 && c.foo1.a()) ─ Branch ┬ False (c) ────────────────────────────────────┬ Start  
                                                                                      ├ False (c.foo1) ────────────────────┬ True (c) ╯   
                                                                                      ├ True (c.foo1.a()) ─┬ True (c.foo1) ╯              
                                                                                      ╰ False (c.foo1.a()) ╯                         

              True (!val2a) ─ Assignment (val2a = c && c.foo1 && c.foo1.a()) ─ Branch ┬ False (c) ────────────────────────────────────┬ Start  
                                                                                      ├ False (c.foo1) ────────────────────┬ True (c) ╯   
                                                                                      ├ True (c.foo1.a()) ─┬ True (c.foo1) ╯              
                                                                                      ╰ False (c.foo1.a()) ╯                              

           True (!val1a) ─ Assignment (val1a = c.foo1?.a()) ─ Branch ┬ False (c.foo1) ─────────────────────┬ Start  
                                                                      ├ True (c.foo1?.a()) ─┬ True (c.foo1) ╯   
                                                                      ╰ False (c.foo1?.a()) ╯    


With sets 
```
declare const caxe1: "1"|"2"|"3";
declare const caxe1b: boolean;
function is1(x:any):x is "1" {return caxe1b;};
function is12(x:any):x is "1"|"2" {return caxe1b;};
//function is123(x:any):x is "1"|"2"|"3" {return caxe1b;};

if (is12(caxe1) && is1(caxe1)){
    const x1 = caxe1;
} 
if (!is1(caxe1) && !is12(caxe1)){
    const x3 = caxe1;
} 
```

```
 -id: undefined, ID: 2, flags: Assignment|Referenced
 -x3 = caxe1, (324,335), VariableDeclaration
 -antecedent:
 - -id: 5, ID: 3, flags: TrueCondition|Condition|Referenced|Shared
 - -!is12(caxe1), (299,312), PrefixUnaryExpression
 - -utype: boolean
 - -antecedent:
 - - -id: 6, ID: 4, flags: TrueCondition|Condition|Referenced|Shared
 - - -!is1(caxe1), (285,296), PrefixUnaryExpression
 - - -utype: boolean
 ```

 ```
 -id: -4, ID: 6, flags: Assignment|Referenced
 -x1 = caxe1, (265,276), VariableDeclaration
 -antecedent:
 - -id: 2, ID: 7, flags: TrueCondition|Condition|Referenced|Shared
 - -is1(caxe1), (242,253), CallExpression
 - -utype: boolean
 - -antecedent:
 - - -id: 3, ID: 8, flags: TrueCondition|Condition|Referenced|Shared
 - - -is12(caxe1), (228,239), CallExpression
 - - -utype: boolean
 - - -antecedent:
 - - - -id: 1, ID: 9, flags: Start|Referenced|Shared
 ```


With logical guards (_cad2-lgc)
```
interface Foodb {
    getValues(): number[];
}
declare const food2: Foodb | undefined;
if (food2 && food2.getValues()){
    const x2log = food2;
}
```


 With logicalguards
```
 -id: undefined, ID: 2, flags: Assignment|Referenced
 -x2lgc = food2, (129,143), VariableDeclaration
 -antecedent:
 - -id: 2, ID: 3, flags: TrueCondition|Condition|Referenced|Shared
 - -food2.getValues(), (99,117), CallExpression
 - -utype: number[]
 - -antecedent:
 - - -id: 3, ID: 4, flags: TrueCondition|Condition|Referenced|Shared
 - - -food2, (91,96), sid: 17, Identifier
 - - -utype: Foodb | undefined
 - - -antecedent:
 - - - -id: 1, ID: 5, flags: Start|Referenced|Shared
```

With optdots (_cad2-opt)
```
// @strict: true
// @declaration: true
interface Foodb {
    getValues(): number[];
}
declare const food2: Foodb | undefined;
if (food2?.getValues()){
    const x2opt = food2;
}
```

With optdots
```
 -id: undefined, ID: 2, flags: Assignment|Referenced
 -x2opt = food2, (121,135), VariableDeclaration
 -antecedent:
 - -id: 5, ID: 3, flags: TrueCondition|Condition|Referenced|Shared
 - -food2?.getValues(), (91,109), CallExpression
 - -utype: number[] | undefined
 - -antecedent:
 - - -id: 6, ID: 4, flags: TrueCondition|Condition|Referenced|Shared
 - - -food2, (91,96), sid: 47, Identifier
 - - -utype: Foodb | undefined
 - - -antecedent:
 - - - -id: 4, ID: 5, flags: Start|Referenced|Shared
```





Why do these differ ?
```
 - -id: 5, ID: 3, flags: TrueCondition|Condition|Referenced|Shared
 - -food2.getValues(), (151,169), CallExpression
 - -utype: number[]
```
and 
```
 - - - - - -food2?.getValues(), (91,109), CallExpression
 - - - - - -utype: number[] | undefined
```



With optional members guards
```

```
and 
```
 - - - - -id: -1, ID: 6, flags: Assignment|Referenced
 - - - - -x2dot = food2, (121,135), VariableDeclaration
 - - - - -antecedent:
 - - - - - -id: 2, ID: 7, flags: TrueCondition|Condition|Referenced|Shared
 - - - - - -food2?.getValues(), (91,109), CallExpression
 - - - - - -utype: number[] | undefined
 - - - - - -antecedent:
 - - - - - - -id: 3, ID: 8, flags: TrueCondition|Condition|Referenced|Shared
 - - - - - - -food2, (91,96), sid: 17, Identifier
 - - - - - - -utype: Foodb | undefined
 - - - - - - -antecedent:
 - - - - - - - -id: 1, ID: 9, flags: Start|Referenced|Shared

```

### Very shallow intro to flow type inference. 

The flow-node structure is a DAG (directed cyclic graph., flowing upwards from it's "end", to the beginning of the outermost scope which is it's start. 
Iterating down the code in the binding phase, flow nodes are created to mark the paths that must be followed by type inference logic.

Start with a simple case:
```
declaration type X = {getValues:()=>number[]};
declaration const x:undefined|X;
const a = x?.getValues();
if (a){
  x;
}
```

We have a flow node for `a = x?.getValues()`, because it links `a` and `x`.
We have anoher flow node for `if (a)`, because that is a branch in the flow.

Any expression that can be affected by preceeding code will get a flow node as entry point in case type query is performed.  
Therefore `x` in the if-block gets a flow node too.

Mapping out the cross product of possible type for `a`, in terms of the components of its alias `x?.getValues()`, and the resulting types of `a`
and `if (a)`, we get this *conceptual* table:

| `x` type | `if (x)` | `X["getValues"]()` type (\*) | `if (X["getValues"]())`)) | `a` type | `if (a)` |
|-- |-- |-- |-- |-- |-- |
| `undefined` | falsy | `X`=>N/A | truthy=>N/A | undefined | falsy |
| `X` | truthy | `X` | truthy | number[] | truthy |

(\*)Written `X["getValues"]()` to emphasize it is *independent* of the value of *x*.  That is the single type `number[]`, never falsy.

However, for calculating the type of `b`, we aren't really interested directly in the type of `a`,
but only how the condition `if (a)` narrows the range of possible types for `x` inside the truthy side of `if (a)`.

To help with that we can create a *conceptual* reverse lookup table, keying on the truthiness of `if (a)` to lookup the values for `x` and ``x.getValues:()`.

| `if (a)` | `x` types | `X["getValues"]()` types (\*) |   
|-- |-- |-- |
| truthy | `X` | `number[]` | 
| falsy  | `undefined` | `X["getValues"]()`=>N/A |

To actually compute the type of `x` when `if (a)` is truthy, we can just iterate the cross product , ignore results where `if (a)` is falsy, 
and take the union of types for `x`, for the rest.  This is just the single type `X`.  (The tables were only *conceptual*).

End of very shallow intro.



node built/local/tsc -p src/compiler/tsconfig.json --noEmit



```
4) compiler tests
       compiler tests for tests/cases/compiler/controlFlowManyConsecutiveConditionsNoTimeout.ts
         "before all" hook for "Correct errors for tests/cases/compiler/controlFlowManyConsecutiveConditionsNoTimeout.ts":
     RangeError: Maximum call stack size exceeded
```

```
{
    const symbolRo = getSymbolIfConstantReadonlyReference(reference);
    if (symbolRo && symbolRo.declarations?.length===1) {
        const declaration = symbolRo.declarations[0];
        const type = getTypeOfSymbolAtLocation(symbolRo,declaration);
        if (!isErrorType(type)){
            return type;
        }
    }
}
```

Failing
tests/cases/conformance/controlFlow/controlFlowAliasing.ts
tests/cases/conformance/controlFlow/controlFlowGenericTypes.ts
tests/cases/conformance/controlFlow/dependentDestructuredVariables.ts

        CompilerBaselineRunner.prototype.runSuite = function (fileName, test, configuration) {
            var _this = this;
            // Mocha holds onto the closure environment of the describe callback even after the test is done.
            // Everything declared here should be cleared out in the "after" callback.
            var compilerTest;
            before(function () {
                console.log(test.file);  <----------------- added to find name of file hanging
                var payload;
                if (test && test.content) {
                    var rootDir = test.file.indexOf("conformance") === -1 ? "tests/cases/compiler/" : ts.getDirectoryPath(test.file) + "/";
                    payload = Harness.TestCaseParser.makeUnitsFromTest(test.content, test.file, rootDir);
                }
                compilerTest = new CompilerTest(fileName, payload, configuration);
            });

tests/cases/compiler/binaryArithmeticControlFlowGraphNotTooLarge.ts  <- hangs

Although `binaryArithmeticControlFlowGraphNotTooLarge` is passing the original code, 
the logging shows O(N^2) behavior when `blocks` appears on the r.h.s.

`blocks` is assigned only once at the top `blocks = this.blocks`, but `block[<literal number>]` appears many times on the rhs.
It is when evaluation such a rhs `block` / `block[<literal number>]` that antecdents are followed all the way back to the top
resulting in O(N^2) behavior.  

This is worth solving.  But I should roll back some changes made for caching when `isOriginalCall` is false:  `altTypeCache`.
But doing that will result in hanging on `binaryArithmeticControlFlowGraphNotTooLarge`.
To avoid that it seems necessary to roll back all caching changes - get rid of `typeCache` and go back to using only the existing `cache`.
Then check complete test suite. 
Once that is stable, then investigate this problem further.


needs fixing 
 typeOfThis  // cannot find this 
 literalTypeWidening // strange, but const types should be automatically widened at assignment even though their value is immutable.
 initializerReferencingConstructorLocals // cannot find this 
 capturedLetConstInLoop7_ES6 // a const may have a never type where at unreachable locations
 capturedLetConstInLoop7 // original has no error on an abviously false condition because it is unreachable anyway
 
Re: literalTypeWidening // strange, but const types should be automatically widened at assignment even though their value is immutable.
How does that affect conditions?  
Conditions are always calculated using the flow, so for a const that is the narrower rhs of the assignment.

So undo the early const change.

Now we are back to passing all runtests, but the bug fix no longer works inside loops.
I.e., _cax-a4 is working, but not _cax-a1 or _cax-a2.

The problem is probably that `getTypeOfExpression` again reads cached values 
```
            if (/* flowTypeQueryState.disable && */ node.flags & NodeFlags.TypeCached && flowTypeCache) {
                const cachedType = flowTypeCache[getNodeId(node)];
                if (cachedType) {
                    return cachedType;
                }
            }
```
despite the fact that checkExpression itself is returning correct values.

Next:  Try overwriting `flowTypeCache[getNodeId(node)]` with the return value of `getFlowTypeOfReference` when the call is not recursive.
Nope - undo that.

Here:
```
getTypeAtFlowNode
    (in) , LoopLabel|Label|Referenced|Shared, flowDepth: 4, flowTypeQueryState.getFlowStackIndex(): 3
    pushFlow(LoopLabel|Label|Referenced|Shared)
    0: [isBug, (475,480)], TrueCondition|Condition|Referenced|Shared::: [0] obj, [509,513], Identifier
    1: , BranchLabel|Label|Referenced|Shared::: [0] obj, [509,513], Identifier
    2: [obj.kind!=="foo", (438,455)], TrueCondition|Condition|Referenced::: [0] obj, [509,513], Identifier
    3: [!obj, (431,435)], FalseCondition|Condition|Referenced|Shared::: [0] obj, [509,513], Identifier
    4: , LoopLabel|Label|Referenced|Shared::: [0] obj, [509,513], Identifier
    (dbgiter:0) , LoopLabel|Label|Referenced|Shared, flowDepth: 5
    getTypeAtFlowNode: sharedFlowNodes hit 0/1
    0: [isBug, (475,480)], TrueCondition|Condition|Referenced|Shared::: [0] obj, [509,513], Identifier
    1: , BranchLabel|Label|Referenced|Shared::: [0] obj, [509,513], Identifier
    2: [obj.kind!=="foo", (438,455)], TrueCondition|Condition|Referenced::: [0] obj, [509,513], Identifier
    3: [!obj, (431,435)], FalseCondition|Condition|Referenced|Shared::: [0] obj, [509,513], Identifier
    4: , LoopLabel|Label|Referenced|Shared::: [0] obj, [509,513], Identifier
    popFlow()->LoopLabel|Label|Referenced|Shared
    (out) , LoopLabel|Label|Referenced|Shared, flowDepth: 4, ret: X1 | undefined
  (fc ) flow.id: undefined, asumeTrue:false, nonEvolvingType: X1 | undefined, narrowedType: X1
  (fc out) [!obj, (431,435)], FalseCondition|Condition|Referenced|Shared, flowDepth: 4, ret: X1

```
It's popping out at the loop label, because, I think, it decides it has detected an instance of some reference to obj which has declared type,
so it decides there is no need to look further - expecting only to be able to widen types.

Anyway, it's clear that to prevent having to traverse all the way back to alias assignments, they will have to be encapsulated 
and made available for evaluation at the point of condition.  So that has to be done before anything else.
What that means is any assigment should be formulated as closure.  
We could either simulate that for each assignment, creating an articifcal closusre and caching it, or do it properly in bind, adding in a closure element
which can just be passed over in getTypeAtFlowNode.

The at least we should be able to evaluate obj 
```
    0: [isBug, (475,480)], TrueCondition|Condition|Referenced|Shared::: [0] obj, [509,513], Identifier
    1: , BranchLabel|Label|Referenced|Shared::: [0] obj, [509,513], Identifier
    2: [obj.kind!=="foo", (438,455)], TrueCondition|Condition|Referenced::: [0] obj, [509,513], Identifier
    3: [!obj, (431,435)], FalseCondition|Condition|Referenced|Shared::: [0] obj, [509,513], Identifier
    4: , LoopLabel|Label|Referenced|Shared::: [0] obj, [509,513], Identifier
```
before getting ejected at the loop label.




Hanging on 

tests/cases/conformance/expressions/binaryOperators/logicalAndOperator/logicalAndOperatorStrictMode.ts
-> _cax_loasm.ts



# high priority to fix:

instantiationExpressionErrors.errors.txt

# medium - additional errors not coming out

unusedMultipleParameter2InFunctionExpression.errors.txt
unusedMultipleParameter1InFunctionExpression.errors.txt

# stupid extra errors (on top of existing erros):

mappedTypeProperties.errors.txt


# improvement: wring error removed
unusedLocalsOnFunctionDeclarationWithinFunctionExpression1.errors.txt


Passing all tests!


Now compiling tsserver.
Not compiling corePublic.ts  Looks like a possible bug, 
either in adding `FlowJoin` or in creating flow branches for  `X ?? Y` statements.

The statement 
```
    const constructor = NativeCollections[nativeFactory]() ?? ShimCollections?.[shimFactory](getIterator);

```
is crashing on an assert
```
Debug.assert(isFlowCondition(antecedent)
```
for each antecedent in `getTypeAtFlowBranchLabel_aux`.

The bug cannot be recreated with this test code:

```
declare function fn():number|undefined;
declare function fb():boolean;
declare const foo: undefined | { fb: typeof fb };
const z = fn() ?? foo?.fb();  
```
which is producing the flow structure:
```
~~~~~~
id: 1, FID: 1, NID: 1, TID: 1, flags: Assignment
z = fn() ?? foo?.fb() [343,365], (343,365), VariableDeclaration
antecedent:
 -~~~~~~
 -id: 2, FID: 2, flags: BranchLabel|Label|Referenced
 -antecedents:[4]
 - -~~~~~~
 - -id: 3, FID: 3, flags: Referenced|Shared|Join
 - -joinNode: z = fn() ?? foo?.fb() [343,365]
 - -antecedent:
 - - -~~~~~~
 - - -id: 4, FID: 4, flags: Start|Referenced
 - -~~~~~~
 - -id: 5, FID: 5, NID: 2, TID: 2, flags: FalseCondition|Condition|Referenced
 - -foo [355,359], (355,359), Identifier
 - -antecedent:
 - - -~~~~~~
 - - -id: 3, FID: 3, flags: Referenced|Shared|Join, REPEAT REFERENCE!!!
 - -~~~~~~
 - -id: 6, FID: 6, NID: 3, TID: 3, flags: TrueCondition|Condition|Referenced
 - -foo?.fb() [355,365], (355,365), CallExpression
 - -antecedent:
 - - -~~~~~~
 - - -id: 7, FID: 7, NID: 2, TID: 2, flags: TrueCondition|Condition|Referenced|Shared
 - - -foo [355,359], (355,359), Identifier
 - - -antecedent:
 - - - -~~~~~~
 - - - -id: 3, FID: 3, flags: Referenced|Shared|Join, REPEAT REFERENCE!!!
 - -~~~~~~
 - -id: 8, FID: 8, NID: 3, TID: 3, flags: FalseCondition|Condition|Referenced
 - -foo?.fb() [355,365], (355,365), CallExpression
 - -antecedent:
 - - -~~~~~~
 - - -id: 7, FID: 7, NID: 2, TID: 2, flags: TrueCondition|Condition|Referenced|Shared, REPEAT REFERENCE!!!
 - - -foo [355,359], (355,359), Identifier

# of FlowNodes:8
# of unique Nodes referenced:3
```
There is **no condition** on the first antecedent,
and the and the later antecedents jump straight to ShimCollection.  

Seems to happen when the first term is a CallExpression,
as though a call expression cannot return undefined.




```
               const operator = node.operatorToken.kind;
                if (operator === SyntaxKind.AmpersandAmpersandToken ||
                    operator === SyntaxKind.BarBarToken ||
                    operator === SyntaxKind.QuestionQuestionToken ||
                    isLogicalOrCoalescingAssignmentOperator(operator)) {
                    if (isTopLevelLogicalExpression(node)) {
                        const postExpressionLabel = createBranchLabel();
                        bindLogicalLikeExpression(node, postExpressionLabel, postExpressionLabel);
                        currentFlow = finishFlowLabel(postExpressionLabel);
                    }
                    else {
                        bindLogicalLikeExpression(node, currentTrueTarget!, currentFalseTarget!);
                    }
                    state.skip = true;
                }

```

```
        function bindCondition(node: Expression | undefined, trueTarget: FlowLabel, falseTarget: FlowLabel) {
            doWithConditionalBranches(bind, node, trueTarget, falseTarget);
            if (!node || !isLogicalAssignmentExpression(node) && !isLogicalExpression(node) && !(isOptionalChain(node) && isOutermostOptionalChain(node))) {
                addAntecedent(trueTarget, createFlowCondition(FlowFlags.TrueCondition, currentFlow, node));
                addAntecedent(falseTarget, createFlowCondition(FlowFlags.FalseCondition, currentFlow, node));
            }
        }
```

Call stack for `fn()`
```
bindCallExpressionFlow (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:1813)
bindChildren (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:832)
bind (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:2471)
doWithConditionalBranches (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:1094)
bindCondition (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:1100)
bindLogicalLikeExpression (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:1456)
onEnter (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:1557)
enter (/mnt/common/github/TypeScript-cph/src/compiler/factory/utilities.ts:1022)
trampoline (/mnt/common/github/TypeScript-cph/src/compiler/factory/utilities.ts:1212)
bindChildren (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:816)
bind (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:2471)
visitNode (/mnt/common/github/TypeScript-cph/src/compiler/parser.ts:39)
forEachChild (/mnt/common/github/TypeScript-cph/src/compiler/parser.ts:170)
bindEachChild (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:742)
bindVariableDeclarationFlow (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:1674)
bindChildren (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:825)
bind (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:2471)
forEach (/mnt/common/github/TypeScript-cph/src/compiler/core.ts:38)
bindEach (/mnt/common/github/TypeScript-cph/src/compiler/binder.ts:738)
visitNodes (/mnt/common/github/TypeScript-cph/src/compiler/parser.ts:45)
```

Adding documentation for `createFlowCondition` in `binder.ts`

