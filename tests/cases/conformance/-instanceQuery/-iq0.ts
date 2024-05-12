
// @strict: true
// @target: esnext


namespace iq0a {

const x = new Object() as instanceof Object;
x satisfies instanceof Object;
class A {};

new A() as instanceof A satisfies instanceof Object;

}