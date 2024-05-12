// @strict: true
// @target: esnext

class EmptyBase {}
class A1  extends EmptyBase{
    a: number|string = "";
}
class A2  extends A1 {
    a: number = 0;
}
//type AQO = A1 & A2;


type AQI = instanceof A1 & instanceof A2;


