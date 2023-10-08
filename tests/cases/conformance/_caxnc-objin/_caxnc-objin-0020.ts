// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

function fin10(x: { a?: 1 | undefined }){
    if (x.a) {
        x; // { a: 1 }
    }
    else if ("a" in x){
        x; // { a: undefined }
    }
    else {
        x; // {}
    }
}
