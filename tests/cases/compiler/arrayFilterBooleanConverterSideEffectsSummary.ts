// @target: es6

// From bestChoiceType.ts
// in original baseline type was any, however in 5.2.2 playground it is string[]
(''.match(/ /) || []).map(s => s.toLowerCase()) satisfies string[];

// From arraySlice.ts
declare var arr: string[] | number[];
arr.splice(1, 1) satisfies string[] | number[]; // error (in original baseline no error)
arr.splice(1, 1) satisfies (string | number)[]; // no error (new code return type is array of union, not union of arrays)

// From controlFlowArrayErrors.ts
declare function cond(): boolean;
function f6() {
    let x;
    if (cond()) {
        x = [];
        x.push(5);
        x.push("hello");
    }
    else {
        x = [true];  // Non-evolving array
    }
    x;           // boolean[] | (string | number)[] (no change in type)
    x.push(99);  // no error (in original baseline was error)
}

// From unionOfArrayFilterCall.ts
interface Fizz {
    id: number;
    fizz: string;
}

interface Buzz {
    id: number;
    buzz: string;
}
([] as [Fizz] | readonly [Buzz?]).filter(item => item?.id < 5) satisfies (Fizz|Buzz|undefined)[];
// original baseline                             ~~~~~~~~ 'item.id' is possibly 'undefined'.(18048)
// new code no error
