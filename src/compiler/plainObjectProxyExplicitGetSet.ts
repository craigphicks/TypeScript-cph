
/**
 * Example
 * interface A {
 *     a: number,
 *     b?: A;
 * }
 * type ReadonlyIfRecord<T> = T extends Record<any, any> ? Readonly<T> : T;
 * type ReadonlyValues<T extends Record<any,any>>  = {
 *     [K in keyof T]: ReadonlyIfRecord<T[K]>;
 * }
 * type Aget = Required<{
 *     readonly [K in keyof A as `get_${K}`]: (() => ReadonlyIfRecord<A[K]>)
 * }>;
 * type Aset = Required<{
 *     readonly [K in keyof A as `set_${K}`]: ((value: ReadonlyIfRecord<A[K]>) => void)
 * }>;
 * type Aproto = Aget & Aset;
 * declare const aproto: Aproto;
 * const a = aproto.get_a();
 * const b = aproto.get_b();
 * aproto.set_a(a);
 * aproto.set_b(b);
 * aproto.set_a(b); // error (as expected)
 * aproto.set_b(a); // error (as expected)
 * aproto.get_a = 0;
 */


type ReadonlyIfRecord<T> = T extends Record<string, any> ? Readonly<T> : T;
type ReadonlyValues<T extends Record<string,any>>  = {
    [K in keyof T]: ReadonlyIfRecord<T[K]>;
}
type Getters<T extends Record<string,any>> = Required<{
    readonly [K in keyof T as K extends string ? `get_${K}` : never]: (() => ReadonlyIfRecord<T[K]>)
}>;
type Setters<T extends Record<string,any>> = Required<{
    readonly [K in keyof T as K extends string ? `set_${K}` : never]: ((value: ReadonlyIfRecord<T[K]>) => void)
}>;

export type PlainObjectProto<T extends Record<any, any>> = Getters<T> & Setters<T>;

/**
 * will have functions like get_a, set_a, get_b, set_b, etc.
 * if a and b are the keys of the object
 * @param keys
 * @returns
 */
function createProxyGetAndSetFunctions(
    proxy:Object, keys: string[],
    getFunction:((this:Object, key:string)=>any),
    setFunction:(this:Object, key:string, value:any)=>void)
{
    for (const key of keys) {
        const getkey = `get_${key}`;
        Object.defineProperty(proxy, getkey, {
            value: function (...args:any[]) {
                Reflect.apply(getFunction, this, [key,...args]);
            },
        });
        const setkey = `set_${key}`;
        Object.defineProperty(proxy, setkey, {
            value: function (...args:any[]) {
                Reflect.apply(setFunction, this, [key, ...args]);
            },
        });
    }
    return proxy as any;
}
















