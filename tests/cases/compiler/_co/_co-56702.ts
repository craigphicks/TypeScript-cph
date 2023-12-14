// @strict: true
// @target: esnext
// @module: esnext
// @declaration: true

interface JQuery<TElement = HTMLElement> {
    something: any;
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

declare function jQuery<TElement = HTMLElement>(): JQuery<TElement>;

// const t11: string | JQuery<HTMLElement> = jQuery(); // no error

// const t12: (string | JQuery<HTMLElement>) & (string | JQuery<HTMLElement> | undefined) = jQuery(); // error
const t11: string | JQuery<HTMLElement> = jQuery(); // no error
