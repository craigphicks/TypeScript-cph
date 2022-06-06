// constLocalsInFunctionExpressions
declare function getStringOrNumber(): string | number;
    
function f1() {
    const x = getStringOrNumber();
    if (typeof x === "string") {
        const f = () => x.length;
    }
}
