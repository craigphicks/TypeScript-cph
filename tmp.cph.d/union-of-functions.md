
Proposal for a unified specification of TypeScript error-checking and return type calculation for union-of-functions (UOF) type functions.






## Type checking a CallExpression for a function with type Union-of-functions


Conceptual (not implemenation) definitions of tasks that would "ideally" be performed.

- (Defn 1) Determine the return type
    - This is union of return types of any signature that *might* match the cross-type of calling types.
        - *might* match means some element of the cross-type of calling types is a subset of the cross-type of signature parameter types
- (Defn 2) Check for errors in the cross-type of calling types passed to the function call.  There are two kinds of errors:
    - (Defn 2.1) No signature matching error:  There is no signature that *must* match the cross-type of calling types.
        - *must* match means every elememnt of the cross-type of signature parameter types is a subset of the cross-type of calling types.
    - (Defn2.2) Excessive calling type error: Some element of the cross-type of calling types is not a subset of any signatures crossstype of parameter types


Some of the tasks cannot always be performed as written above because doing so would require exponential complexity.  For example, iterating over every element of a cross-type is exponentially complex. Also, calculating if an object type is a subtype of another object type, or calculating the intersection of object types can be very expensive.

Note that although the task defintion were given in terms of elements of cross-types, task (Defn 1) and (Defn 2.1) can be calculated perfectly without iterating over elements of cross-types:

- (Impl 1) The task (Defn 1) can be computed utilizing
    - A signature *might* match cross-types of calling parameters if and only if
        -  for each parameter idx, the intersection of `callingTypes[idx]` and `signature.params[idx]` is non-empty.

- (Impl 2) The task (Defn 2.1) can be computed utilizing
    - A signature *must* match cross-types of calling parameters if and only if
        -  for each parameter idx, `signature.params[idx]` is a subset of `callingTypes[idx]`.

So the ideal definitions (Defn 1) and (Defn 2.1) using "cross-type element iteration" has been preserved, although the computation is less complex than the defintion might suggest. (Note that practical implementations of *intersection* and *subset* may yet result in compomise of the ideal description - but that is another story.)

Unfortunately, task (Defn 2.2) doesn't have such a short cut in the general case.  The worst case complexity is the number of elements in the cross-type of calling types.  Instead we should use the implementation
- (Impl 2.2)
    - An excessive calling type error exists if (but not only if)
        -  for each parameter idx,  `callingTypes[idx]` is NOT a subset of the union over each signature of `signature.params[idx]`.
The fact that some errors can be missed is a part of the specified contract with typescript user, of which they must be aware in cases where illegal input is a possibility.

Note that in functions where
- the number of signature parameters indices is one, or
- for all signature parameters indices except one them them, the parameters are identical,
which are quite common cases, (Impl 2.2) does give a perfect result.
It would be possible to calculate in quick time whether the signatures satisfies that condition, and if not, take some warning action and/or attempt to iterate the cross-type elemnets of the calling type, if not too numerous.

## Type checking of return Statements in the implemantation of a function with type Union-of-functions







