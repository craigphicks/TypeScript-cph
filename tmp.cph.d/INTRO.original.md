### Very shallow intro to flow type inference

The flow-node structure is a DCG (directed cyclic graph), flowing mostly upwards from it's "end", to the beginning of the outermost scope which is it's start. Iterating down the code in the binding phase, flow nodes are created to mark the paths that must be followed by type inference logic.

Consider a simple case:
```
declaration type X = {getValues:()=>number[]};
declaration const x:undefined|X;
const a = x?.getValues();
if (a){
  x;
}
```

- We have a flow node for `a = x?.getValues()`, because it links `a` and `x`.
- We have another flow node for `if (a)`, because that is a branch in the flow.
- Any expression that can be affected by preceeding code will get a flow node as entry point in case type query is performed.  
Therefore `x` in the if-block gets a flow node too.

Mapping out the cross product of possible type for `a`, in terms of the components of its alias `x?.getValues()`, and the resulting types of `a` and `if (a)`, we can construct this *conceptual* table:

| `x` type | `if (x)` | `X["getValues"]()` type (\*) | `if (X["getValues"]())`)) | `a` type | `if (a)` |
|-- |-- |-- |-- |-- |-- |
| `undefined` | falsy | `X`=>N/A | truthy=>N/A | undefined | falsy |
| `X` | truthy | `X` | truthy | number[] | truthy |

(\*)Written `X["getValues"]()` to emphasize it is *independent* of the value of *x*.  That is the single type `number[]`, never falsy.

However, for calculating the type of `b`, we aren't really interested directly in the type of `a`, but only how the condition `if (a)` narrows the range of possible types for `x` inside the truthy side of `if (a)`.

To help with that we can construct a *conceptual* reverse lookup table, keying on the truthiness of `if (a)` to lookup the values for `x` and ``x.getValues:()`.

| `if (a)` | `x` types | `X["getValues"]()` types (\*) |   
|-- |-- |-- |
| truthy | `X` | `number[]` | 
| falsy  | `undefined` | `X["getValues"]()`=>N/A |

To actually compute the type of `x` when `if (a)` is truthy, we can just iterate the cross product , ignore results where `if (a)` is falsy, and take the union of types for `x`, for the rest.  This is just the single type `X`.  (The tables were only *conceptual*).

### TypeScripts and FlowNode s

During the binding phase of compilation the flow logic describing how types are calculated are encoded in a FlowNode graph.
For the above example the table for `a` looks like this:
```
 - -id: 3, flags: Assignment|Referenced|Shared
 - -a = x?.getValues() [77,96], (77,96), VariableDeclaration
 - -antecedent:
 - - -~~~~~~
 - - -id: 4, flags: BranchLabel|Label|Referenced
 - - -antecedents:[3]
 - - - -~~~~~~
 - - - -id: 5, flags: FalseCondition|Condition|Referenced
 - - - -x [81,83], (81,83), Identifier
 - - - -antecedent:
 - - - - -~~~~~~
 - - - - -id: 6, flags:  <end of table>
 - - - - - -~~~~~~
 - - - - - -id: 7, flags: Start|Referenced
 - - - -~~~~~~
 - - - -id: 8, flags: TrueCondition|Condition|Referenced
 - - - -x?.getValues() [81,96], (81,96), CallExpression
 - - - -antecedent:
 - - - - -~~~~~~
 - - - - -id: 9, flags: TrueCondition|Condition|Referenced|Shared
 - - - - -x [81,83], (81,83), Identifier
 - - - - -antecedent:
 - - - - - -~~~~~~
 - - - - - -id: 6, flags: --- <end of table>
 - - - -~~~~~~
 - - - -id: 10, flags: FalseCondition|Condition|Referenced
 - - - -x?.getValues() [81,96], (81,96), CallExpression
 - - - -antecedent:
 - - - - -~~~~~~
 - - - - -id: 9, flags: TrueCondition|Condition|Referenced|Shared, REPEAT REFERENCE!!!
 - - - - -x [81,83], (81,83), Identifier
```
This is machine code which could allow our inference problem to be calculated progmatically up to the  point of getting types from atomics elements - in this case `x` and `x?.getValues()`.  

 
The inference is an round trip operation, first traverse "up the code" along the relevant antecedents, then calculate the types on the way back "down the code".

For a FlowNode with variable `x`, which matches the variable 'x' to inferred, and `TrueCondtion`, it will pass back only truthy types, e.g, `X` in this case.  For `FalseCondition`, only `undefined`.

The FlowNode with expression `x?.getValues()` acts as an all or nothing gate.  


| `x?.getValues()`     |   TrueCondition | FalseCondition |
|--                             |--                         |-- |
| Only truthy             |  Pass  All           | Pass Nothing   |
| Only falsy              |  Pass  Nothing           | Pass All   |
| Mixed truthy/falsy | Pass All              | Pass All  |

The final for `a`-true is the union of all rows with TrueCondtions at the head, 
and for `a`-false is the union of all rows with FalseCondtions at the head.  So
in our example of `a`-true, it is only the row headed by FlowNode `id: 8`.

It is truly a brilliant system.  

However, in practice, for inference, the TypeScript software stops using the FlowsNode structure at a higher than necessary level in the expression tree.  Not sure why.  The logic that would have been computed with the FlowNodes has to then be recreated in software anyway - increasing the chance of bugs.

   
