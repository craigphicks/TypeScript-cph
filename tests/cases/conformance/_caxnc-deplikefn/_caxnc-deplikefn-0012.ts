// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

interface F {
    "t": number,
    "f": boolean,
  }

function dlf<K extends keyof F>(k: K): F[K] {
    if (k==="t"){
        // @ts-dev-debugger
        return dlf(k); // should be ok
    }
}
//dlf("t"); // should be number