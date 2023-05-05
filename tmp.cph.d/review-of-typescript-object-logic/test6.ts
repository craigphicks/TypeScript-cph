type X6 = ["a","b","c"];
type Y6 = ["A","B","C","D"];

type I6 = X6&Y6;
type U6 = X6|Y6;

declare const y6:Y6;
declare const i6:I6;
declare const u6:U6;

{

    const y69 = y6[9]; // undefined (error)
}

{
    const i60 = i6[0]; // never
    const i61 = i6[1]; // never
    const i63 = i6[3]; // never
    const i69 = i6[9]; // never
    const u61 = u6[1]; // "B"|"b"
    const u63 = u6[3]; // "D" | undefined (no error)
    const u69 = u6[9]; // undefined  (error)
}

// Indices - with both sides as tuples
// Intersection, no remainder term.
// Union, No remainder term.

// In this case, Two tuples behave exactly as they should under Union and Intersection ops.