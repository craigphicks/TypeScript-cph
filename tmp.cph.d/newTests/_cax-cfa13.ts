// @strict:true

function f13(x: string | number | boolean) {
    const isString = typeof x === "string";
    const isNumber = typeof x === "number";
    const isStringOrNumber = isString || isNumber;
    if (isStringOrNumber) {
        let t: string | number = x;
//            ~
//!!! error TS2322: Type 'string | number | boolean' is not assignable to type 'string | number'.
//!!! error TS2322:   Type 'boolean' is not assignable to type 'string | number'.
    }
    else {
        let t: boolean = x;
//            ~
//!!! error TS2322: Type 'string | number | boolean' is not assignable to type 'boolean'.
//!!! error TS2322:   Type 'string' is not assignable to type 'boolean'.
    }
}