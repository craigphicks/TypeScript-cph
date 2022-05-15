Half a variadic tuple rest sandwich missing

# Bug Report
### 🔎 Search Terms

variadic tuple assignment matching algorithm

#### Canonical variadic tuple final form

When a non-generic variadic tuple of arbitrary depth is declared, 
it is transformed into one of two possible final flat canonical forms,
as described by this comment
```
// We have optional, rest, or variadic elements that may need normalizing. Normalization ensures that all variadic
// elements are generic and that the tuple type has one of the following layouts, disregarding variadic elements:
// (1) Zero or more required elements, followed by zero or more optional elements, followed by zero or one rest element.
// (2) Zero or more required elements, followed by a rest element, followed by zero or more required elements.
// In either layout, zero or more generic variadic elements may be present at any location.
```
found in `checker.ts`, `function createNormalizedTupleType`.


#### Matching Algorithm

This bug report claims there is only logical and practical way to "match" or "check" 
the assignment of a value to a type of the second form. (Ignoring generic variadic elements for simplicity.)

That way is 
- match values from the front until the rest element is reached, 
- match values from the back until the rest element is reached,
- match the remaining values to the rest element.

#### Bug 

The current algorithm matches only from left to right.
That is done in `checker.ts`, `function checkArrayLiteral`.


### 🕗 Version & Regression Information

The example wrong assignment results for variadic tuples are stable in version range 4.2.3 ~ 4.8 dev.


### ⏯ Playground Link

[playground](https://www.typescriptlang.org/play?exactOptionalPropertyTypes=false#code/PTAEAEGcBcCcEsDG0Bco4FcCmAoEEsAPAQ2QHkAHaeAewDtiAbABVhoq1mgE8AVbjpDQAzJpFx4AVJJyhJoXgAssoABRkA0sACisNrACUoABpqiHZFgAmwDHXNZLVo3RrRi1epFD10y0LCK3rLyNMJ+KsSQkPAA5nQAtlh00N7EsCoAbkzwVqDCNLCgmZwxXqAALAB0AExVAMygAH6VVQAcoFZYmSHAODgA3rKgIzwcCgCMoAC8oADahCh0GAkARpwANNwA-CirNDSMWMR0ALoA3MOjAiq8NTPzVU+8ExugAEQAJO8XI-gA4gBVACSoEgihoAHdvGNbvdZnNlmtNqB9odjnRQAAfUB2LrCeD2KxvL4-fojEaILzQdA1YgoO4POavD7fX74XT6MyECzQawGK6gKl0GC01YM+HzFmYLAktnnUD4TTc3n8nAAX36Qwp6BuoAAMlEabNSZcdbDJlMEYt3gA9d4bJ5Vbh7A5HE5zU4XQUWl4TBJMgBeuxgCDosW95r1L0lcydfre8Ym-o2pPZYF9E1jLKdqlDhNi2NRboxRbxWAJRIMnrlZMFwtF0Cz9JjTLtDtZPwVHL0hTUdgcTgFOobNKbNXFrYR7beMtr6dAnL7qgHPMcfOc9ep6CziAZWbb9troCiBqNC+VqkHG+HFNHO5qVn3sZn6Fg2GPp8NMAvGhV67VTUgA)

### 💻 Code

```ts
// @strict: true
// @exactOptionalPropertyTypes: false

/**
 * The (OK/Error) X (expected/unexpected) notations on the rhs 
 * of the assignments are valid for versions 4.2.3 ~ 4.8 dev
 */

{
    type T1 = [x:number,y?:boolean];
    type T2 = [...T1, "$"];  // GUI shows type T2 = [number, boolean | undefined, "$"]

    const t2a:T2 = [1, "$"]; // Error (expected)
    const t2b:T2 = [1, true, "$"]; // OK (expected)
}

{
    type Last = "$";
    type T11 = [x:"^",...y:boolean[]];
    type T11m = [z?:string];
    type T12 = [...T11, ...T11m,"$"]; // type T12 = [1, ...(string | boolean | undefined)[], "$"]

    const t12a:T12 = ["^", "$"]; // Error (unexpected)
    const t12b:T12 = ["^", true, "$"]; // Error (unexpected)
    const t12c:T12 = ["^", "$" as Last]; // OK (expected)
    const t12d:T12 = ["^", true, "$" as Last]; // OK (expected)
}

```

### 🙁 Actual behavior

Matching from left to right.

### 🙂 Expected behavior

Match front requireds, then matching back requireds , then finally matching rest.

### Implementation

I have coded a working algorithm by modifying `checkArrayLiteral` and confirmed it passes 
all the baseline tests. That is important because it shows that the baseline
tests do not depend on the current left-to-right-only matching algorithm.



