// @target: esnext
// @noEmit: true

declare function f(): void;
{
    let a: 0 | 1 = 1;
    let b: 0 | 1 | 9;
    f(), [{ [a]: b } = [9, a = 0] as const] = [];
    const bb: 9 = b;
}
