### 🔍 Search Terms

1. "allow element type access of literal string" - Nothing found.

1. "typescript issues Literal String should have literal length"
Turned up #52243 and  #41160
but those are both more complicated proposals with string ranges.
Anyway, this proposal doesn't use length, but does use character access,
because length would be insufficient.

With regards to split (which is an auxiliary proposal here):
#52299 (closed)
#49635 (closed)

### ✅ Viability Checklist

- [X] This wouldn't be a breaking change in existing TypeScript/JavaScript code
- [X] This wouldn't change the runtime behavior of existing JavaScript code
- [X] This could be implemented without emitting different JS based on the types of the expressions
- [X] This isn't a runtime feature (e.g. library functionality, non-ECMAScript syntax with JavaScript output, new syntax sugar for JS, etc.)
- [X] This isn't a request to add a new utility type: https://github.com/microsoft/TypeScript/wiki/No-New-Utility-Types
- [X] This feature would agree with the rest of our Design Goals: https://github.com/Microsoft/TypeScript/wiki/TypeScript-Design-Goals

### ⭐ Suggestion

#### Main Proposal: Type element access to Literal String types

Allow type element access to Literal String types.
(Formatted string access could be a future extension of this proposal.)

This parallels the way in which tuples are treated.

Oddly, I haven't found a previous proposal for this, so one might conclude there is no practical need for it.
However, it can be used to add other features, such as a more precise type for "String.split", which was proposed multiple times, but always closed without considering this prerequisite proposal which would make it possible.

The library definition for character access of `String` as it appears in lib.es5.d.ts
```
interface String {
    readonly [index: number]: string;
}
```
is not unlike that for `ReadonlyArray<T>`
```
    readonly [n: number]: T;

```
which is used to allow element access of readonly tuple types.
The acessed element type value itsself is calculated internally by the compiler, and is made available to the TypeScript user at development time.  Notably, in an tuple like
```
[string, ...string[]]
```
where the length must be reported at `number`, the acessed type
`[string, ...string[]][0]` is `string`, and not `string | undefined`.
Element access gives more precise type information than `length` does.


#### Auxiliary Proposal #1: String.split for Literal String types of at least one character.


If literal string element access where available, then we could write
a more precise definition for `String.split` as follows:


before:
```
interface String {
    split(separator: string | RegExp, limit?: number): string[];
}
```

after:
```
interface String {
    split<S extends string>(separator: S): string extends S ? string[] : S[0] extends undefined ? string[] : [string, ...string[]];
    split(separator: string | RegExp, limit?: number): string[];
}
```

### 📃 Motivating Example


```
function checkField(fieldName: string){
    let firstPathPart: string;
    if (fieldName.includes('.')) {
        const partParts = fieldName.split('.');
        firstPathPart = partParts[0]; // error
    }
}
```

### 💻 Use Cases

1. What do you want to use this for?

As described above.

2. What shortcomings exist with current approaches?

As described above.

5. What workarounds are you using in the meantime?


This is definitely a bit of a hack, and I would never actually use this outside of a demonstration,
but replacing the literlal string element access with
a contorted TypeScript conditional type expression  `CharAtZero`, we can get an solution that works with example
problem shown above:


```
type CharAtZero<S extends string> = string extends S ? string : S extends `${infer First}${string}` ? First : undefined;

// check result
type S0 = CharAtZero<"">;  // undefined
type S1 = CharAtZero<".">;  // "."
type S2 = CharAtZero<string>;  // string
type S3<Prefixed extends string> = CharAtZero<`foo${Prefixed}`>;
type S31 = S3<"">; // "f"
type S4<Suffixed extends string> = CharAtZero<`${Suffixed}foo`>;
type S41 = S4<"">; // "f"
type S42 = S4<"a">; // "a"


interface String {
    split<S extends string>(separator: S): string extends S ? string[] : CharAtZero<S> extends undefined ? string[] : [string, ...string[]];
    split(separator: string | RegExp, limit?: number): string[];
}

function checkField(fieldName: string){
    let firstPathPart = fieldName;
    if (fieldName.includes('.')) {
        const partParts = fieldName.split('.');
        firstPathPart = partParts[0];
    }
}

const x1 = "".split('.'); //  [string, ...string[]]
const x2 = x1[0]; // string
const x3 = "".split('.')[0]; // string
const x4 = "".split(''); // string[]
const x5 = "".split((0 as any as string)); // string[]
```

[playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAwgFgQwE4EFgC0JIPYB4DKUEAHsBAHYAmAzlNcEgJbkDmAfFALx0PMtGkKNKIQD8PJqygAuEQLJVaAAwAkAb2YAzLFABijJPQC+6+pJZGlUcfsPAZUAK5UIm5hEoBuAFDeA9H5QAMZwEEEA1lBIENSOADbA3qCQIgAMXLCIqBhYeABEeWyeUFABTi5u5B5J4ND4AIwZ8MhomDi4eQB0hcWlgV15NSn4AExNWa25uGZ8RSVlM6xDdQDMuAAK0W7EHvJCtIvs4y057Uqa2Njqm66MO5SWRcsiK43c+GsFc2V5moPJdQALARHJptrsSAphIcONxmtk2nhVGp8KDwQ8LtglE8ASJAW88R0en0oL9-rU8WN3sC8ghiT86b5vMwyEhNAggnVeFI1N4SiVqGA4oxgAQ9ooJLMABTUCBgZAIYDYJCyfAASlkh3FwjEktYAG0ALoOeGTdr4DiQ-blSi3KqUax6lhGhz6w4AGignW9hyNhp8-LoQpFMrlCqVKqdUAAPlAAEoQFgAUWIYE9woAtiLRLJyI4MwAjLAap1GnxGXyaZxBYCMbDkYKhCL6CBxShStytygAOQQGYgmu5LDVvMDcQg9jcdnWirgM6Q9m4nbbvf7Af5jE0UA7jC7q4gnWYQTijlt1ClAHJOhe1WqoKPA-ygvX6FB5Qv58BaEvdyu+wfBWFYBL2vNV10fKAp3oGdgDnZBFzfeDP2ofVUn9Pl+QrCtvGfchX2IAkCk6QCQyvG9ijKKA3SHT1vWIoc-Rwl97GIKkoAI1D-RJQ4mLwliVgyIiSOAsi1U4ijAh43D8MBQSumEy9yO4hjDV4-CAFY5OI4NgKldIEFoBByBAKADKdW8JNLVSgA)
