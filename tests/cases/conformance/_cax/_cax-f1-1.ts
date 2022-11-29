// @strict: true
// @declaration: true
function isTrue(b:true): true;
function isTrue(b:false): false;
function isTrue(b:boolean): true|false { return b; };
declare const bt: true;
const tx = isTrue(bt);
const fx = isTrue(!bt);
