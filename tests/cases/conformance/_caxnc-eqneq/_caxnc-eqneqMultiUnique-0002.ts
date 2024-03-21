// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const a: true|"2";
declare const b: boolean|number|string;
if (b===a)
{
    b;
}
