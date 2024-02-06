// @strict: true

type MyArray<T> = {
    [n: number]: T;
    forEach(callbackfn: (value: T, index: number, array: MyArray<T>) => unknown): void;
};



function test3(items: MyArray<string> | MyArray<number>) {
    items.forEach(item => console.log(item));
}