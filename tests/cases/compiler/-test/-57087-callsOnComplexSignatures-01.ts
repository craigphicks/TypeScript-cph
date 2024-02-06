// @strict: true

function test3(items: string[] | number[]) {
    items.forEach(item => console.log(item)); // must not be error
//                   ~~~~~~~~~~~~~~~~~~~~~~~~~
// !!! error TS2345: Argument of type '(item: string | number) => void' is not assignable to parameter of type '((value: string, index: number, array: string[]) => void) & ((value: number, index: number, array: number[]) => void)'.
}