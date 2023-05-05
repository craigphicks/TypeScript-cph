
## Typescript union and intersection operators.

Typescript operators | (union) and & (intersection), when applied to objects, are not set-operations, and they are not meant to be.

Rules governing which keys can be read:

| typescript-op | property-keys | property primitive-types |
|---|---|---|
| intersection | *union of keys* | intersection of key-types |
| union | *intersection of keys* | union of key-types |

Rules governing which keys can be assigned, and to which types:

| typescript-op | property-keys | property primitive-types |
|---|---|---|
| intersection | *union of keys* | intersection of key-types |
| union | *intersection of keys* | union of key-types |


For objects with multiple levels (including circular references) the typescript-union operator is also
applied recursively to the next key level, the operands being all keys of the same key-name.

For objects with multiple levels (including circular references) the typescript-intersection operator is also
applied recursively to the next key level, the operands being all keys of the same key-name.


```
/* eslint-disable object-literal-surrounding-space */
/* eslint-disable @typescript-eslint/no-unused-expressions */

declare interface A { a: string, c: { d: number, e: number } };
declare interface B { b: string, c: { d: number, f: number } };

declare const x: A | B;

x.a; // error
x.b; // error
x.c; // no error
x.c.d; // no error
x.c.e; // error

const x0: A | B = {a: "", b:undefined, c: {d: 1, e: 2, f: ""}}; // error: undefined is not a type of b, string is not a type of f
const x1: A | B = {a: "", b:undefined, c: {d: 1, e: 2}}; // no error, but why no error on b here?

declare const y: A & B;

y.a; // no error
y.b;  // no error
y.c; // no error
y.c.d; // no error
y.c.e; // no error

const y0: A & B = {a: "", b:undefined, c: {d: 1, e: 2, f: 3}}; // error: undefined is not a type of b
const y1: A & B = {a: "", b:"", c: {d: 1, e: 2}}; // error: missing f
```

The typescript-union works best with types which share a mutual "kind" key with a literal for each separate type.
Then the union is just the "kind" key.  Until the "kind" key is narrowed, no other keys can be seen (unless they happen to be shared between all).
But once the "kind" key is narrowed, all keys for the narrowed type are visible.

However, if there is no "kind" key, usually the only way to narrow is by explicitly identifying the type.


## Flough union and intersection operators

The actual behavior of types in general programatic type flow analysis (not only typescript) can be modeled with sets, where the set members are instances of types.
An instance of a type can an actual valid value for a type, or some subset of valid values for a type.
The members of set may be instances of different types.

Set-union and set-intersection take sets as their operands.

In the following typescript
```
type A = & { a: string | number };
type B = & { a: string, b?: string };

declare const x: A;
declare const y: B;
declare const b: boolean;

const z = b ? x : y;

// Error because key "b" was elimiated in union type
if (typeof z.b=== "string"){
    console.log(typeof z.a); // will be string
}

```
`z` is either of type `A` or `B` and not a mix of both.
So logically `typeof z.b=== "string"` implies `typeof z.a=== "string"`.
However, the typescript-union operator, under the access rule, doesn't allow `b` to be accessed from `z` (even though it can be assigned under the assignment rule.)

At least for computationally simple cases like this one, it is reasonable to follow the set-union logic and allow `z.b` to be accessed in order to infer the type of `z.a`

## Efficiency of typescript-union operator.

The typescript-union operator is (or is close to) a projection of set-union onto a lower dimensional space.
This may make some computations faster.


