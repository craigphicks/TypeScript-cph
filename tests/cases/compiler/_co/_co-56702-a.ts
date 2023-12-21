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

declare function JKuery<TElement = Foobar>(): JKuery<TElement>;

//const t0: JKuery<Foobar> | (JKuery<Foobar>&string)= JKuery();
//                                 ^? JKuery<string | Foobar>(): JKuery<string | Foobar>
//const t1: (string&JKuery<Foobar>)= JKuery(); // error, as it should be
//                                 ^? JKuery<Foobar>(): JKuery<Foobar>

const t10: (JKuery<Foobar> | string) & (JKuery<Foobar> | string | undefined)= JKuery();
//                                                                            ?^ JKuery<string | Foobar>(): JKuery<string | Foobar>

// const t11: string | JKuery<Foobar> = JKuery(); // no error
//const t11: JKuery<Foobar> & string = JKuery(); // no error

// const t12: (string | JKuery<Foobar>) & (string | JKuery<Foobar> | undefined) = JKuery(); // error
//const t11: string = JKuery(); // no error
