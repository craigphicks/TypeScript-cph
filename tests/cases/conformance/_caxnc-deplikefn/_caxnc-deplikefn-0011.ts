// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

interface F {
    "t": number,
    "f": boolean,
  }

// Using overloads the external contract is sound
function dlf(k:"t"): F["t"];
function dlf(k:"f"): F["f"];
// implementation
function dlf(k:keyof F): F[keyof F] {
    if (k==="t"){
        const r1: F[typeof k] = 1;
        // @ts-dev-debugger
        r1;
        return r1;
    }
    return 1; // should be error
}
//dlf("t"); // should be number