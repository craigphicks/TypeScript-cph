// @strict: true
// @target: esnext
// @module: esnext
// @declaration: true

interface Foobar { foobar: any; };
interface JKuery<TElement = Foobar> {
    fooElement: TElement;
    [Symbol.iterator]: () => IterableIterator<TElement>;
    // [Symbol.iterator]: () => {
    //     next(): {
    //         value: TElement;
    //     }
    //     | {
    //         done: true;
    //         value: any;
    //     };
    // }
}

declare function jKuery<TElement = Foobar>(): JKuery<TElement>;

// const ta: (JKuery<Foobar>&string) = jKuery<never>();

// const tb: JKuery<Foobar> = jKuery<never>();
// tb;

// const tt: (JKuery<Foobar>&string)= jKuery(); // error, as it should be


// const t0: JKuery<Foobar> | (JKuery<Foobar>&string)= jKuery();

// const t1: (string&JKuery<Foobar>)= jKuery(); // error, as it should be

const t10: (JKuery<Foobar> | string) & (JKuery<Foobar> | string | undefined)= jKuery();



// declare function  kKuery<TElement=Foobar>():{
//     fooElement: { foobar: 1 },
//     [Symbol.iterator]: ()=>IterableIterator<TElement>;
// }

// const test1: (JKuery<Foobar> | string) & (JKuery<Foobar> | string | undefined) = kKuery();

// const test1a: (JKuery<Foobar> & string)  = kKuery();

// const test1b: (string & JKuery<Foobar>) = kKuery();

// const test1c: JKuery<Foobar> = kKuery();

// const test1d: string = kKuery();



// const test2: JKuery<Foobar>  = kKuery();


//const t11: string | JKuery<Foobar> = JKuery(); // no error

//const t11: JKuery<Foobar> & string = JKuery(); // no error

// const t12: (string | JKuery<Foobar>) & (string | JKuery<Foobar> | undefined) = JKuery(); // error
//const t11: string = JKuery(); // no error
