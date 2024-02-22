// @strict: true
// @target: esnext
// @declaration: true
// @exactOptionalPropertyTypes: false

interface Garg33A {
    (): "01";
    (x:1, y?:1): "111";
    (...args: [...1[]]): "101";
};
interface Garg33B {
    (): "02";
    (x:1, y?:1): "211";
    (...args:1[]): "201";
    (x:2, y?:any): "221"
};

declare const f33a: {
    (): "02";
    (x:1, y?:1): "211";
    (...args:1[]): "201";
    (x:2, y?:any): "221"
}
f33b satisfies Garg33A & Garg33B; // should  satisfy
// because (...args: [...1[]]):=>"101"  === (...args:1[]) => "201";


declare const f33b: {
    (): "02";
    (x:1, y?:1): "211";
    (...args: [...1[]]): "101";
    (...args:1[]): "201";
    (x:2, y?:any): "221"
}
f33b satisfies Garg33A & Garg33B; // should satisfy

declare const f33c: {
    (x:2, y?:any): "221"
    (...args:1[]): "201";
    (...args: [...1[]]): "101";
    (x:1, y?:1): "211";
    (): "02";
}
f33c satisfies Garg33A & Garg33B; // should satisfy (even though reversed order of overloads)


