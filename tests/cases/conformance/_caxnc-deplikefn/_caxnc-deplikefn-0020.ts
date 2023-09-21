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
    // However, the internal contract has a bug
    // return 1; // no error, fail
    if (k==="t"){
    const r1: F[typeof k] = 1; // no error, pass
    const r2: F[typeof k] = true; // error, pass
    // return 1; // no error, pass
    return true; // no error, fail BUG
    }
    else {
    const r1: F[typeof k] = 1; // error, pass
    const r2: F[typeof k] = true; // no error, pass
    // return true; // no error, pass
    return 1; // no error, fail BUG
    }
    // Solution - flow analysis is ALMOST THERE.
    // It knows the correct type correlation, but is just not applying it to the return value.
}

// Correct return types
const rt = dlf("t"); // number
const rf = dlf("f"); // boolean
