

let a = true;

// Because this is "let" statment, the type of b is widened to boolean.
let b = a;
b;
//const c = b;

if (a) {
    let c = b;
    c;
}