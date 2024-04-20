//// [tests/cases/conformance/-instanceQuery/instanceQuery-0004.ts] ////

//// [file1.ts]
export class A {
    a = 12;
}
export class B<T> {
    b: T;
    constructor(b: T) {
        this.b = b;
    }
}

const a1 = new A();

const b1 = new B(12);

//// [file2.ts]
import { A, B } from "./file1";

function main() {
    const a1 = new A();

    const B10 = B;
    const B11 = B<any>;
    const B20 = B<number>;

    const b1 = new B(12);
    const b2 = new B<number>(12);
    const b10 = new B10(12);
    const b11 = new B11(12);
    const b20 = new B20(12);


}



//// [file1.js]
export class A {
    a = 12;
}
export class B {
    b;
    constructor(b) {
        this.b = b;
    }
}
const a1 = new A();
const b1 = new B(12);
//// [file2.js]
import { A, B } from "./file1";
function main() {
    const a1 = new A();
    const B10 = B;
    const B11 = (B);
    const B20 = (B);
    const b1 = new B(12);
    const b2 = new B(12);
    const b10 = new B10(12);
    const b11 = new B11(12);
    const b20 = new B20(12);
}
