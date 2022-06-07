// @strict: true
// @declaration: true

declare namespace foob2 {
    function fb():"3"|"4";
}

declare function fn():"1"|"2"|undefined|0|false;

const z = fn() || foo?.["fb"](); 
