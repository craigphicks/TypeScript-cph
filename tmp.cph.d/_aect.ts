{
    function baz(x: [string, number, boolean]) { }
    var array = ["string", 1, true];
    baz(["string", 1, true, ...array]);  // Error
}