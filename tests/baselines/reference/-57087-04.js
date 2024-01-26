//// [tests/cases/compiler/-test/-57087-04.ts] ////

//// [-57087-04.ts]
interface C {
    (x:1):"1";
    (x:2):"20";
    (x:number):number;
    (x:number):"1"|"20"|number;
  }
  interface B {
    (x:2):"2"
    (x:3):"30"
    (x:number):number;
    (x:2|3|number):"2"|"30"|number;
  }
  interface A {
    (x:3):"3"
    (x:1):"10"
    (x:number):number;
    (x:1|3|number):"3"|"10"|number;
  }

  function foo(x:1):"1";
  function foo(x:2):"2";
  function foo(x:3):"3";
  function foo(x:number):number|"1"|"2"|"3";
  function foo(x:number):number|"1"|"2"|"3"{
    if (x==1||x==2||x==3) return String(x) as any;
    return x;
  }

  // The `&`-intersection operator result should be independent of the order of it's operands.
  foo satisfies A & B & C;
  foo satisfies A & C & B;
  foo satisfies B & A & C;
  foo satisfies B & C & A;
  foo satisfies C & A & B;
  foo satisfies C & B & A;

  type W = (A & B & C)|(A & C & B)|(B & A & C)|(B & C & A)|(C & A & B)|(C & B & A);
  declare const w:W;
  w(1);// "1","10"
  w(2);// "2","20"
  w(3);// "3","30"

  foo(1); // "1"
  foo(2); // "2"
  foo(3); // "3"

  foo satisfies W;

//// [-57087-04.js]
function foo(x) {
    if (x == 1 || x == 2 || x == 3)
        return String(x);
    return x;
}
// The `&`-intersection operator result should be independent of the order of it's operands.
foo;
foo;
foo;
foo;
foo;
foo;
w(1); // "1","10"
w(2); // "2","20"
w(3); // "3","30"
foo(1); // "1"
foo(2); // "2"
foo(3); // "3"
foo;
