type X5 = ["a","b","c"];
type Y5 = ["a","b","c","d"];

type I5 = X5&Y5;
type U5 = X5|Y5;

declare const y5:Y5;
declare const i5:I5;
declare const u5:U5;

{

    const y59 = y5[9]; // undefined
}

{
    const i50 = i5[0]; // "a"
    const i51 = i5[1]; // "b"
    const i53 = i5[3]; // never
    const i59 = i5[9]; // undefined (error)
    const u51 = u5[1]; // "b"
    const u53 = u5[3]; // "d" | undefined  (no error)
    const u59 = u5[9]; // undefined (error)
}

// Indices - with both sides as tuples
// Intersection, no remainder term.
// Union, No remainder term.

// In this case, Two tuples behave exactly as they should under Union and Intersection ops.