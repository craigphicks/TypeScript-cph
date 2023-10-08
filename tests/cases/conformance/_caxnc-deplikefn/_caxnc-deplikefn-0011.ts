// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

interface F {
    "t": number,
    "f": boolean,
  }

// Using overloads the external contract is sound
function dlf(k:"t"): F["t"]; // error
// This overload signature is not compatible with its implementation signature.ts(2394)
function dlf(k:"f"): F["f"];
// implementation
// To make type checking easier, ensure the parameters are readonly
function dlf(...args: Readonly<[string]> ): any {
    args[0] = {}; // is correctly an error:
    let x = args[0];
    // args[0][0] = 1; // not an error is args is readonly [any] or Readonly<[any]>
    // arguments[0] = 1; // not an error!
    /// args[0] = 1; // is correctly an error:
    // // Index signature in type 'readonly any[]' only permits reading.ts(2542)
    args; // type is readonly any[]
    // @ts-dev-debugger
    if (args[0]==="t"){
        return true; // should be error
        // At return, find the first overload signature to which all function arguments are (strongly) assignable.
        // If none are found, that is an error.
        // checker the returning type is assignable to the matched signature.
    }
    // return 1; // should be error
}
//dlf("t"); // should be number