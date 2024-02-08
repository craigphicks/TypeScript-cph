// @strict: true

{
    const arr: number[] | string[] = [];  // Works with Array<number | string>
    const t = arr.reduce((acc,a) => acc+a)
}
