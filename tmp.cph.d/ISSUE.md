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






