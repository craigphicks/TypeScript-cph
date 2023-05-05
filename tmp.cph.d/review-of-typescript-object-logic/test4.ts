
type X4 = {0: "a", 1:"b", 2:"c"};
type Y4 = ["a","b","c"];

type I4 = X4&Y4;
type U4 = X4|Y4;

declare const y4:Y4;
declare const i4:I4;
declare const u4:U4;

{

    const y49 = y4[9]; // undefined
}

{
    const i40 = i4[0]; // "a"
    const i41 = i4[1]; // "b"
    const i49 = i4[9]; // "a|b|c"
    const u41 = u4[1]; // "b"
    const u49 = u4[9]; // any  (but no error)
}

// Intersection, with one side as {}-object and the other as a tuple, result is tuple with remainder-term.
// Intersection, Remainder term. Remainder term is union of types.
// Union. No remainder term.

type S4 = {0: "a", 1:"b", 2:"c", 4:"e"};
type T4 = ["A","B","C","D"];

type II4 = S4&T4;
type UU4 = S4|T4;

declare const ii4:II4;
declare const uu4:UU4;

{
    const ii40 = ii4[0]; // never
    const ii41 = ii4[1]; // never
    const ii43 = ii4[3]; // never
    const ii44 = ii4[4]; // never
    const ii49 = ii4[9]; // never
    const uu41 = uu4[1]; // "b"|"B"
    const uu43 = uu4[3]; // any (no error)
    const uu44 = uu4[4]; // "e"| undefined (no error)
    const uu49 = uu4[9]; // any  (no error)
}

// If we say that & and | operators on tuples behave nearly correctly,
// while & and | operators on {}-objects invert the sense on the keys,
// then mixing the operands as here results in a mix of behaviors -
// note that [S4|T4][3] is an access error ({}-behavior because it is the {} with key out of bounds)
// while [S4|T4][4] is ok (tuple-behavior because it is the tuple access failing)

