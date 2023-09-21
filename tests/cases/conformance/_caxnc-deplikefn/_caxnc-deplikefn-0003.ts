// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

interface F {
    "t": number,
    "f": boolean,
  }

// Using overloads the external contract is sound
function dlf(k:"t"): void;
function dlf(k:"f"): void;
// implementation
function dlf(k:keyof F): void {
    if (k!=="t"){
        const r1: F[typeof k] = 1; // expect TS2322: Type 'number' is not assignable to type 'boolean'.
        r1; // expect 1
        const r2: F[typeof k] = true;
        r2; // expect true
    }
}
