type ReadonlyIfRecord<T> = T extends Record<string, any> ? Readonly<T> : T;
// type ReadonlyValues<T extends Record<string,any>>  = {
//     [K in keyof T]: ReadonlyIfRecord<T[K]>;
// }
type Getters<T extends Record<string,any>, Prefix extends string> = Required<{
    readonly [K in keyof T as K extends string ? `${Prefix}${K}` : never]: (() => ReadonlyIfRecord<T[K]>)
}>;
type Setters<T extends Record<string,any>, Prefix extends string> = Required<{
    readonly [K in keyof T as K extends string ? `${Prefix}${K}` : never]: ((value: ReadonlyIfRecord<T[K]>) => void)
}>;

export type PlainObjectProto<T extends Record<any, any>, GetPrefix extends string, SetPrefix extends string> = Getters<T,GetPrefix> & Setters<T,SetPrefix>;
export type UnsettablePlainObjectProto<T extends Record<any, any>, GetPrefix extends string> = Getters<T,GetPrefix>;

/**
 * will have functions like get_a(), set_a(value), get_b(), set_b(value), etc.
 * if a and b are the keys of the object
 * @param keys
 * @returns
 */
export function createProxyGetAndSetFunctions(
    proxyproto:Object,
    keys: readonly string[],
    getNameTransform:(key:string)=>string,
    getFunction:((this:Object, key:string)=>any),
    setNameTransform?:(key:string)=>string,
    setFunction?:(this:Object, key:string, value:any)=>void)
{
    for (const key of keys) {
        const getkey = getNameTransform(key);
        Object.defineProperty(proxyproto, getkey, {
            value: function (...args:any[]) {
                return Reflect.apply(getFunction, this, [key,...args]);
            },
        });
        if (!setNameTransform || !setFunction) continue;
        const setkey = setNameTransform(key);
        Object.defineProperty(proxyproto, setkey, {
            value: function (...args:any[]) {
                Reflect.apply(setFunction, this, [key, ...args]);
            },
        });
    }
    return proxyproto as any;
}


{
    /* Usage example documentation (working) */

    interface A {
        a: number,
        b?: A;
    }
    type Aproto = PlainObjectProto<A, "get_", "set_">;
    type ReadonlyAproto = UnsettablePlainObjectProto<A, "get_">;

    class AProxyManager {
        readonly _proxied: A; // private would cause and error in createProxyGetAndSetFunctions
        constructor(proxied: A) {
            this._proxied = proxied;
        }
    }
    class UnsettableAProxyManager {
        readonly _aProxyManager: AProxyManager;
        constructor(aProxyManager: Aproto & AProxyManager) {
            this._aProxyManager = aProxyManager;
        }
    }

    createProxyGetAndSetFunctions(
        AProxyManager.prototype,
        ['a', 'b'],
        (key)=>`get_${key}`,
        function (key:string) {
            console.log('get:', key);
            return (this as any as AProxyManager)._proxied[key as keyof A];
        },
        (key)=>`set_${key}`,
        function (key:string, value:any) {
            console.log('set:', key, value);
            (this as any as AProxyManager)._proxied[key as keyof A] = value;
        }
    );
    createProxyGetAndSetFunctions(
        UnsettableAProxyManager.prototype,
        ['a', 'b'],
        (key)=>`get_${key}`,
        function (key:string) {
            console.log('get:', key);
            return (this as any as UnsettableAProxyManager)._aProxyManager._proxied[key as keyof A];
        },
    );

    function createProxiedA(proxied: A): {readonly [k in keyof A]:unknown} & Aproto {
        return new AProxyManager(proxied) as any as ReturnType<typeof createProxiedA>;
    }
    function createUnsettableProxiedA(aproto: Readonly<Aproto>): {readonly [k in keyof A]:unknown} & ReadonlyAproto {
        return new UnsettableAProxyManager(aproto as Aproto & AProxyManager) as any as ReturnType<typeof createUnsettableProxiedA>;
    }

    // Usage example - documentation

    const _x = {a:1};
    const _y = {a:2};

    const x = createProxiedA(_x);
    const y = createProxiedA(_y);

    let test = x.a; // never
    // @ts-expect-error
    test +=1; // test is of type unknown
    let test2 = test; // uh-oh, no error (unknown is assignable to any)
    console.log(test2); // uh-oh, not an error
    // @ts-expect-error
    let test3: number  = test; // unknown is not assignable to number

    // @ts-expect-error
    x.a = 42; // Cannot assign to 'a' because it is a read-only property.ts(2540)
    // Runtime will actually write a:42 to the proxy manager (not the proxied object)

    console.log(x.get_a());
    console.log(y.get_a());
    console.log(x.get_b());
    console.log(y.get_b());
    //x.set_b(y); // error
    //y.set_b(x); // error
    x.set_b(_y); // ok
    y.set_b(_x); // ok

    console.log(x.get_a());
    console.log(y.get_a());
    console.log(x.get_b());
    console.log(y.get_b());

    const ro = createUnsettableProxiedA(createProxiedA({a:999}));
    console.log(ro.get_a());
    console.log(ro.get_b());
    console.log(y.get_b()!.a);
    /* Output:
    NaN
    get: a
    1
    get: a
    2
    get: b
    undefined
    get: b
    undefined
    set: b { a: 2 }
    set: b { a: 1, b: { a: 2 } }
    get: a
    1
    get: a
    2
    get: b
    <ref *1> { a: 2, b: { a: 1, b: [Circular *1] } }
    get: b
    <ref *1> { a: 1, b: { a: 2, b: [Circular *1] } }
    get: a
    999
    get: b
    undefined
    get: b
    1
    */
}














