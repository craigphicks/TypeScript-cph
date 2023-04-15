
function rhsAssign0001(){
    let a = 0;
    let b = (a = 1);
    a;b; // expecting 1,1
}

function rhsAssign0002(){
    let a = 0;
    let b = (a = 1);
    let c = (b=(a = 2));
    a;b;c; // expecting 2,2,2
}

function rhsAssign0003(){
    let a=1,b=2,c=3,t=0;
    let x = [a,b,c,t=a,a=b,b=c,c=t,t=0] as const;
    x; // expecting [1,2,3,1,2,3,1,0]
}