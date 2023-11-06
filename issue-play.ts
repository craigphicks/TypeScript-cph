// @strict: true
// @declaration: true


type CharAtZero<S extends string> = string extends S ? string : S extends `${infer First}${string}` ? First : undefined;

// check result
type S0 = CharAtZero<"">;  // undefined
type S1 = CharAtZero<".">;  // "."
type S2 = CharAtZero<string>;  // string
type S3<Prefixed extends string> = CharAtZero<`foo${Prefixed}`>;
type S31 = S3<"">; // "f"
type S4<Suffixed extends string> = CharAtZero<`${Suffixed}foo`>;
type S41 = S4<"">; // "f"
type S42 = S4<"a">; // "a"


interface String {
    split<S extends string>(separator: S): string extends S ? string[] : CharAtZero<S> extends undefined ? string[] : [string, ...string[]];
    split(separator: string | RegExp, limit?: number): string[];
}

function checkField(fieldName: string){
    let firstPathPart = fieldName;
    if (fieldName.includes('.')) {
        const partParts = fieldName.split('.');
        firstPathPart = partParts[0];
    }
}

const x1 = "".split('.'); //  [string, ...string[]]
const x2 = x1[0]; // string
const x3 = "".split('.')[0]; // string
const x4 = "".split(''); // string[]
const x5 = "".split((0 as any as string)); // string[]
