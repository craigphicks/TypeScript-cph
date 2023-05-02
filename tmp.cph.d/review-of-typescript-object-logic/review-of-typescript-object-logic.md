### Overview

One goal of the Flough software is to improve intuitive usability by enabling (\**when feasible*) true union and intersection computations in flow.

Some simple examples: ....

As the examples show, the user doesn't actually need to be cognitively aware of "set-theory operations" to improve usability.
There are simple intutively-just-oughta-work cases that currently are not allowed, and that degrades usability.


It is important to clealy separate the following two things:
1. Typescript definitions:  of types and the type operators | (union) and & (intersection) on record types.
2. General flow alalysis requirements: The meaning of sets, and set-theory-operators of union and intersection on sets, that are required for correct flow analysis in any programming language (including Typescript).

The above 1 and 2 coincide with respect to primitive types, however the differ with respect to object types.

The following tables compares Typescript-operations and set-theory-operations union and intersection on record-types (\**excepting arrays and tuples*)

| intersection-op | property-keys | property primitive-types |
|---|---|---|
|typescript | *union of keys* | intersection of types |
| set-theory | intersection of keys | intersection of types |

| union-op | keys | primitive-types |
|---|---|---|
|typescript | *intersection of keys* | union of types |
| set-theory | union of keys | union of types |

Roughly speaking, Typescript inverts the operations over keys, but the rule differs for arrays and tuples where the keys are, roughly speaking, unioned in both typescript-union and typescript-intersection.

Traversing down the tree, the typescript-operators are also applied to the next level (just as their set-counterparts are).

Although the type-operations do not correspond to the actual relations that occur during flow,
the typescript-operations do describe concrete new types.

### Why are Typescript operators of Union and Intersection defined as they are?

Neither the exact definitions of Typescript-Union and Typescript-Intersection nor the reasons for those definitions are comprehensively documented in a holistic top-down manner.
However, the de-facto behavior has developed organically, with user feedback, and under the constraints of computation time, so it well defined in a bottom-up manner.

Nevertheless, this a possible interpretation of the current rules:

1.  **Union:** Union uses the intersection of keys because that creates types which are reliably fast to compute in flow and user interface.  Although the "intersection of keys" can lose information, that can be replaced by requiring the user to explicitly declaring the type being accessed (e.g., by casing on a 'kind' member with discrete values, or using an `as`-(some Type) clause, etc.), which will bring the missing keys back when required.

2. **Intersection:**  There is a need for an operator to allow users to compose object types from other object types, with a result that merges keys of both types (e.g., the "union" of keys but let's avoid that word here to avoid confusion).  Because the operator Typescript-Union is already taken, the operator Typescript-Intersection can be used instead.  There is some theoretical justification - suppose the operand types are "open", e.g., they include generic property fields `[key: string]: any`, then the set-intersection would in fact coincide with the Typescript-intersection.  The problem with this justification is that augmenting the `[key: string]: any` fields is only temporary for the intersection operation, and then it is removed afterwards.  It doesn't seem to be a necessity from a compuational speed point of view.  Hence the conclusion that it is intended to fulfill the need for a composition operator.

### Suggestions

Some suggestions based on this analysis:

1. Typescript needs (an) explicit composition operator(s).  That would be more clear than overrding `|`.
2. The `||` and `&&` symbols (over Types) could be used to represent set-intersection and set-union.  In cases of large types where computation is infeasible,
the full computation can be eschewed, either silently or with a warning (depending on option).  It may be that a warning would enable users to compose better types,
that even if large, are still quickly computable.


### Integration Typescript-operators with Flough, over objects

1. Typescript-to-Flough interface for object: Start out by mapping both Typescript-intersection and Typescript-union to set-union
1. Flough-to-Typescript interface: Then going back all the object types would be unions.

Unlikely to be sufficient but it's a start.
