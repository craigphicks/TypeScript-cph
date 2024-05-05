// @strict: true
// @target: esnext

class A {};
type InstanceOfA = instanceof A;
interface AlsoInstanceOfA extends InstanceOfA {} // should be error




