// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const x: boolean;

const foo = { a: 1 } as const;
const bar = { a: 1, b: 2 } as const;

const result = x ? foo : bar;

result;


// const resolve = () => {
//     if (Math.random() > 0.5)
//         return foo;
//     else
//         return bar;
// };
