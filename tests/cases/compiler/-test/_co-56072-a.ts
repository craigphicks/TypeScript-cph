// @strict: true
// @target: esnext
// @module: esnext
// @declaration: true

interface Foobar { foobar: any; };
interface JKuery<TElement = Foobar> {
    fooElement: TElement;
    // Change `[Symbol.iterator]` to `other` and the error goes away
    [Symbol.iterator]: () => {
        // Change `next` to `foo` and the error goes away
        next(): {
            value: TElement;
        }
        | {
            done: true;
            value: any;
        };
    }
}

declare function jKuery<TElement = Foobar>(): JKuery<TElement>;

const ta: (JKuery<Foobar>&string) = jKuery<never>();
const tb: JKuery<Foobar> = jKuery<never>();
tb;

const tt: (JKuery<Foobar>&string)= jKuery();


const t0: JKuery<Foobar> | (JKuery<Foobar>&string)= jKuery();
//                                ^? JKuery<string | Foobar>(): JKuery<string | Foobar>
const t1: (string&JKuery<Foobar>)= jKuery(); // error, as it should be
//                                ^? JKuery<Foobar>(): JKuery<Foobar>

const t10: (JKuery<Foobar> | string) & (JKuery<Foobar> | string | undefined)= jKuery();
//                                                                           ?^ JKuery<string | Foobar>(): JKuery<string | Foobar>

declare function  kKuery<TElement=Foobar>():{
    fooElement: { foobar: 1 },
    // Change `[Symbol.iterator]` to `other` and the error goes away
    [Symbol.iterator]: ()=>IterableIterator<TElement>;
}

const test1: (JKuery<Foobar> | string) & (JKuery<Foobar> | string | undefined) = kKuery();

const test2: JKuery<Foobar>  = kKuery();


// const t11: string | JKuery<Foobar> = JKuery(); // no error
//const t11: JKuery<Foobar> & string = JKuery(); // no error

// const t12: (string | JKuery<Foobar>) & (string | JKuery<Foobar> | undefined) = JKuery(); // error
//const t11: string = JKuery(); // no error
