// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true

declare const a: boolean;
declare const b: boolean;
declare const c: boolean;
declare const d: boolean;
if ((a&&b)||(c&&d)){
    [a,b,c,d];
}
