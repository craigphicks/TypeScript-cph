// @strict: true
// @target: esnext
// @declaration: true

// // @filename: file1.ts

// export const InstanceofObject = Object as any as { new(): instanceof Object }; // the only cast required to generate instanceQuery constructors
// export type InstanceofObject = instanceof Object;

// // @filename: file2.ts

// import {InstanceofObject} from "./file1";

// class InstanceofA extends InstanceofObject {
//     // a: number;
//     // constructor(){
//     //     super();
//     //     this.a=1;
//     // }
// }
// const x = new InstanceofA();
// x satisfies instanceof Object; // OK
// x satisfies InstanceofObject; // OK
// x satisfies InstanceofA; // OK


namespace iq10b_3 {

    const InstanceofObject = Object as any as { new(): instanceof Object }; // the only cast required to generate instanceQuery constructors
    class InstanceofA extends InstanceofObject {
        a: number;
        constructor(){
            super();
            this.a=1;
        }
    };
    const x = new InstanceofA();
    x satisfies instanceof Object; // OK
    x satisfies InstanceofA; // OK

}
