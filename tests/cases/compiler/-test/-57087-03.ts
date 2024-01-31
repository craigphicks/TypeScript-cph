


interface A9<T> {
    t: T;
    f():T;
    g(f: ()=>T):T[];
};

declare const a9: A9<string> | A9<number>;

// declare const f9: A9<string>["f"] & A9<number>["f"];
// a9.g(f9); // NO ERROR when argument is defined as an intersection of functions type

const f91 = ()=>Math.random() < 0.5 ? Math.random().toString() : Math.random();
//f91 satisfies A9<string>["f"] & A9<number>["f"] // but is not a valid implementation of either.

a9.g(f91); // INCORRECT ERROR;  argument is as an actual valid implementation, should not be error.
