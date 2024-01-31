// @strict: true
// @target: esnext
// @declaration: true

declare const f42: () => string | number;
f42 satisfies (() => string) & (() => number);
