//

function f(a: number): void {
    {
        let b: number | string
        b = a;
        {
            let c: number
            c = b;
            b = "hello";
        }
        b;
    }
    a;
}