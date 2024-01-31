type T20<D extends 1|2|3> = (td:D)=>any; // id

type T21<D extends 1|2|3> = (td:any)=>D; // id

type T22<D extends 1|2|3> = (td:D)=>D; // id


//type T30 = { f: T20}

const t0: {

    f: T20<1|2>

} & {
    f: T20<2|3>

} = { f: x => x }

const r01 = t0.f(1);

const r02 = t0.f(2);

const t1: {

    f: T21<1|2>

} & {
    f: T21<2|3>

} = { f: x => x }

const r11 = t1.f(1);

const r12 = t1.f(2);

const r13 = t1.f(3);

const t2: {

    f: T22<1|2>

} & {
    f: T22<2|3>

} = { f: x => x }

const r21 = t2.f(1);

const r22 = t2.f(2);

declare function makef20<U extends 1|2|3>(): { f: T20<U>; };
const u0: {

    f: T20<1|2>

} & {
    f: T20<2|3>

} = (<U extends 1|2|3>(): { f: T20<U>; } => ({ f: x => x }))();

const s01 = u0.f(1);

const s02 = u0.f(2);

// const u1: {

//     f: T21<1|2>

// } & {
//     f: T21<2|3>

// } = (<U extends 1|2|3>(): { f: T21<U>; } => ({ f: x => x }))();

// const s11 = u1.f(1);

// const s12 = u1.f(2);

// const u2: {

//     f: T22<1|2>

// } & {
//     f: T22<2|3>

// } = (<U extends 1|2|3>(): { f: T22<U>; } => ({ f: x => x }))();

// const s21 = u2.f(1);

// const s22 = u2.f(2);

// const s23 = u2.f(3);
