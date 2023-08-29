// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const a: 1|"2";
declare const b: number|string;
if (b===a)
{
    b;
}
