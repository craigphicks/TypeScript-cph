//// [tests/cases/compiler/-test3/-57087-104.ts] ////

//// [-57087-104.ts]
interface C {
  (x:1):"1";
  (x:2):"20";
  (x:number):number | "1" | "20";
};
interface B {
  (x:2):"2"
  (x:3):"30"
  (x:number):number | "2" | "30";
};
interface A {
  (x:3):"3"
  (x:1):"10"
  (x:number):number | "3" | "10";
};

type W = (A & B & C)|(A & C & B)|(B & A & C)|(B & C & A)|(C & A & B)|(C & B & A);

/*
* Scenario:
* (1) Overloads: Usng fully expanded domain support for C & B & A, so that all errors are detected at compile time
* (2) Implementation:
*     - Note extra lines added to make the function signature compatible with the implementation
* Disadvatage: More verbosity in number of overloads and in implementation.
* Number of overloads could impact compile time, and makes life harder for downstream users of the function
*/
function foo2(x:1):"1";
function foo2(x:2):"20";
function foo2(x:number):number;
function foo2(x:2):"2"
function foo2(x:3):"30"
function foo2(x:number):number;
function foo2(x:3):"3"
function foo2(x:1):"10"
function foo2(x:number):number;
function foo2(x:number){
  if (x===1) return "1";
  if (x===2) return "2";
  if (x===3) return "3";
  // (*) These nonsense unused extra lines need to be added to make the function signature compatible with the implementation
  if (x===1) return "10";
  if (x===2) return "20";
  if (x===3) return "30";
  return x;
}

foo2 satisfies A & B & C; // should satisfy
foo2 satisfies A & C & B; // should satisfy
foo2 satisfies B & A & C; // should satisfy
foo2 satisfies B & C & A; // should satisfy
foo2 satisfies C & A & B; // should satisfy
foo2 satisfies C & B & A; // should satisfy
foo2 satisfies W; // should satisfy


/*
* Scenario: Select some overloads from the orignal set of overloads.
* Advantages:
*     - Less verbosity in number of overloads
*     - Less verbosity in implementation
* Number of overloads could impact compile time, and makes life harder for downstream users of the function
*/
function foo1(x:1):"1";
function foo1(x:2):"2";
function foo1(x:3):"3";
function foo1(x:number):number;
function foo1(x:number){
  if (x===1) return "1";
  if (x===2) return "2";
  if (x===3) return "3";
  return x;
}

// The `&`-intersection operator result should be independent of the order of it's operands.
foo1 satisfies A & B & C; // should not error
foo1 satisfies A & C & B; // should not error
foo1 satisfies B & A & C; // should not error
foo1 satisfies B & C & A; // should not error
foo1 satisfies C & A & B; // should not error
foo1 satisfies C & B & A; // should not error
foo1 satisfies W; // should not error

/*
*/

//function foo3(x:1):"1"; //  Omitted domain support should cause satisfies error
function foo3(x:2):"2";
function foo3(x:3):"3";
function foo3(x:number):number;
function foo3(x:number): number | "1" | "2" | "3"{
  //if (x===1) return "1";
  if (x===2) return "2";
  if (x===3) return "3";
  return x;
  // In this case, a final throw "unexpected error" would never be reached anyway.
  // if (typeof x === "number") return x; // pointless
  // throw "unexpected error";
}

foo3 satisfies A & B & C; // should be error
foo3 satisfies A & C & B; // should be error
foo3 satisfies B & A & C; // should be error
foo3 satisfies B & C & A; // should be error
foo3 satisfies C & A & B; // should be error
foo3 satisfies C & B & A; // should be error


foo3 satisfies W; // should be error



//// [-57087-104.js]
;
;
;
function foo2(x) {
    if (x === 1)
        return "1";
    if (x === 2)
        return "2";
    if (x === 3)
        return "3";
    // (*) These nonsense unused extra lines need to be added to make the function signature compatible with the implementation
    if (x === 1)
        return "10";
    if (x === 2)
        return "20";
    if (x === 3)
        return "30";
    return x;
}
foo2; // should satisfy
foo2; // should satisfy
foo2; // should satisfy
foo2; // should satisfy
foo2; // should satisfy
foo2; // should satisfy
foo2; // should satisfy
function foo1(x) {
    if (x === 1)
        return "1";
    if (x === 2)
        return "2";
    if (x === 3)
        return "3";
    return x;
}
// The `&`-intersection operator result should be independent of the order of it's operands.
foo1; // should not error
foo1; // should not error
foo1; // should not error
foo1; // should not error
foo1; // should not error
foo1; // should not error
foo1; // should not error
function foo3(x) {
    //if (x===1) return "1";
    if (x === 2)
        return "2";
    if (x === 3)
        return "3";
    return x;
    // In this case, a final throw "unexpected error" would never be reached anyway.
    // if (typeof x === "number") return x; // pointless
    // throw "unexpected error";
}
foo3; // should be error
foo3; // should be error
foo3; // should be error
foo3; // should be error
foo3; // should be error
foo3; // should be error
foo3; // should be error
