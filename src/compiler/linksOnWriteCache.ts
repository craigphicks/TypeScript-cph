import {
    // objectAllocator,
    Symbol,
    Node,
    //TransientSymbol,
    SymbolLinks,
    NodeLinks,
    TransientSymbolLinks,
    MappedSymbolLinks,
    ReverseMappedSymbolLinks,
    Debug,
    //castHereafter,
    //SymbolFlags,
    __String,
    // cphdebug-start
    TypeChecker,
    SymbolFlags,
    TransientSymbol,
    Type,
    CheckFlags,
    // cphdebug-end
} from "./_namespaces/ts";

// cphdebug start
// @ts-ignore
import { IDebug } from "./mydebug";
// cphdebug end

type ExtendedSymbolLinks = SymbolLinks & Partial<TransientSymbolLinks & MappedSymbolLinks & ReverseMappedSymbolLinks>;

type ReadonlyIfRecord<T> = T extends Record<string, any> ? Readonly<T> : T;
// type ReadonlyValues<T extends Record<string,any>>  = {
//     [K in keyof T]: ReadonlyIfRecord<T[K]>;
// }

/**
 * We could use GettersReadonly to cause an error for some (but not all) kinds of potentially unsafe usage, e.g.:
 * - links.p.x = 1; // would error, caught
 * - let p2 = links2.p;
 * - p2.x = 2; // would error, caught
 * - p2.y.z = 2; // would not error, not caught
 * The thing it, chaching can't handle that anyway, because p is not changed.
 */
// @ts-expect-error
type GettersReadonly<T extends Record<string,any>> = Required<{
    readonly [K in keyof T as K extends string ? `get ${K}` : never]: () => ReadonlyIfRecord<T[K]>;
}>;
type Getters<T extends Record<string,any>> = Required<{
    readonly [K in keyof T as K extends string ? `get ${K}` : never]: () => T[K];
}>;
type Setters<T extends Record<string,any>> = Required<{
    readonly [K in keyof T as K extends string ? `set ${K}` : never]: ((value: ReadonlyIfRecord<T[K]>) => void)
}>;

export type PlainObjectGettersAndSeters<T extends Record<string, any>> = Getters<T> & Setters<T>;

/**
 * Caching works by cache-on-write, by symbol and by property.
 * SymbolLinksCacheControl keeps track of the caching levels
 * and of the SymbolLinks that have been written to during any level,
 * excepting the base level 0.
 */
class CacheControl<T extends { restoreFromCache(level:number):void } = { restoreFromCache(level:number):void }> {
    private cachedByLevel: Set<T>[] = [];
    /**
     * returns the exprectedDepth number to passed to endLevel(expectedDepth)
     */
    beginLevel(): number {
        // if (this.getLevel()!==-1) Debug.assert(false, "beginNewLevel() deeper than one not yet tested");
        return this.cachedByLevel.push(new Set<T>())-1;
    }
    endLevel(expectedDepth: number): void {
        const level = this.getLevel();
        Debug.assert(expectedDepth>=0);
        Debug.assertEqual(expectedDepth, level);
        Debug.assert(this.cachedByLevel[level]);
        this.cachedByLevel[level].forEach((value) => {
            value.restoreFromCache(level);
        });
        this.cachedByLevel.pop();
    }
    addRequest(t: T): number {
        Debug.assert(this.getLevel()>=0);
        this.cachedByLevel[this.getLevel()].add(t);
        return this.getLevel();
    }
    isActive(): boolean {
        return this.getLevel()>=0;
    }
    getLevel(): number {
        return this.cachedByLevel.length-1;
    }
};

/**
 * Currently using JS Proxy such that prototype of each proxied object T is set individually.
 * That's OK for checking it works, but might not be OK for performance.
 * For performance, we could code a better way so the getters and setters are set only once per checker instance to a base class.
 */


export function createLinksOnWriteCacheControl(){
    const cacheControl = new CacheControl();
    // This is safe because typescript compiler does not implement async processing.
    class ProxyWithOnWriteCache<T extends Object, I extends Object> {
        /**
         * _cacheByLevel:
         * On-first-write in a level, caching a {...copy} of the last object.
         * (TODO? Could try to optimize by caching only the each last [property,value] pair.)
         */
        cacheByLevel: (T | undefined)[];
        /**
         * proxied: the actual object being proxied.  The reference remains active between levels until proxied no longer unreferenced.
         */
        private proxied: T;
        // @ts-ignore
        private indexObject: I;
        // @ts-ignore
        private proxy: any;
        // @ts-expect-error (will use it for debugging)
        private symbol: Symbol;
        constructor(proxied: T, indexObject: I) {
            this.indexObject = indexObject;
            this.proxied = proxied;
            this.cacheByLevel = [];
            //const that = this;
        }
        restoreFromCache(level: number): void {
            Debug.assert(level>=0);
            Debug.assert(this.cacheByLevel[level]);
            for (const key in this.proxied){
                (this.proxied[key as keyof T] as any)=undefined; // faster than delete
            }
            for (const key in this.cacheByLevel[level]){
                this.proxied[key as keyof T] = this.cacheByLevel[level]![key as keyof T];
            }
            this.cacheByLevel[level]=undefined;
        }
        getter(_target: any, key: string, that: ProxyWithOnWriteCache<T,I>): any {
            // const index = cacheControl.getLevel();
            // if (index>=0 && that.cacheByLevel[index])
            //     return that.cacheByLevel[index]![key as keyof T];
            return that.proxied[key as keyof T];
        }
        setter(_target: any, key: string, value: any, that: ProxyWithOnWriteCache<T,I>): boolean {
            const index = cacheControl.getLevel();
            if (index>=0){
                if (!that.cacheByLevel[index]) that.cacheByLevel[index] = {...that.proxied }; // shallow copy
                cacheControl.addRequest(that);
            }
            that.proxied[key as keyof T] = value;
            return true
        }
        get type(): Type {
            return this.getter(/*_target*/ undefined, "type", this);
        }
        set type(value: Type | undefined) {
            this.setter(/*_target*/ undefined, "type", value, this);
        }
    }
    // function setProxyGS<T extends { prototype: { getter: (...args:any[])=>any, setter: (...args:any[])=>any }}>(
    //     obj: Object, t:T
    // ): void {
    //     new Proxy(obj, {
    //         get: t.prototype.getter,
    //         set: t.prototype.setter,
    //     });
    // }
    const ExtendedSymbolLinksWithOnWriteCache = ProxyWithOnWriteCache<ExtendedSymbolLinks, Symbol>;
    ExtendedSymbolLinksWithOnWriteCache.prototype;
    ExtendedSymbolLinksWithOnWriteCache.prototype.getter;
    const NodelLinksWithOnWriteCache = ProxyWithOnWriteCache<NodeLinks, Node>;

    return {
        beginLevel(){ return cacheControl.beginLevel(); },
        endLevel(expectedDepth: number){ return cacheControl.endLevel(expectedDepth); },
        getExtendedSymbolLinksWithOnWriteCache(links: ExtendedSymbolLinks, symbol: Symbol): ExtendedSymbolLinks {
            const r = new ExtendedSymbolLinksWithOnWriteCache(links, symbol) as unknown as ExtendedSymbolLinks;
            //setProxyGS(r, ExtendedSymbolLinksWithOnWriteCache);
            return r;
        },
        getNodeLinksWithOnWriteCache(links: NodeLinks, node: Node): NodeLinks {
            const r = new NodelLinksWithOnWriteCache(links, node) as unknown as NodeLinks;
            //setProxyGS(r, NodelLinksWithOnWriteCache);
            return r;
        },
        isInstanceOfExtendedSymbolLinksWithOnWriteCache(links: ExtendedSymbolLinks): boolean {
            return links instanceof ExtendedSymbolLinksWithOnWriteCache;
        },
        isInstanceOfNodelLinksWithOnWriteCache(links: NodeLinks): boolean {
            return links instanceof NodelLinksWithOnWriteCache;
        }
    }
}


export function testLinksOnWriteCache(linksOnWriteCacheControl?: ReturnType<typeof createLinksOnWriteCacheControl>, checker?: TypeChecker): void {
    linksOnWriteCacheControl ??= createLinksOnWriteCacheControl();
    function getSymbolWithLinksDummy(): TransientSymbol {
        const symbol1: TransientSymbol = {
            escapedName: "testSymbol" as __String,
            flags: SymbolFlags.Transient,
        } as TransientSymbol;
        const plainSymbolLinks = { checkFlags: CheckFlags.None } as TransientSymbolLinks;
        const links = linksOnWriteCacheControl!.getExtendedSymbolLinksWithOnWriteCache(plainSymbolLinks,symbol1);
        symbol1.links = links as unknown as TransientSymbolLinks;
        return symbol1;
    }
    let getSymbolWithLinks;
    if (checker) getSymbolWithLinks = () => checker.createSymbol(SymbolFlags.None, "testSymbol" as __String);
    else getSymbolWithLinks = getSymbolWithLinksDummy;

    const type1 = { name: "type1" } as any as Type;
    const type2 = { name: "type2" } as any as Type;
    {
        const symbol1 = getSymbolWithLinks();
        Debug.assert(linksOnWriteCacheControl.isInstanceOfExtendedSymbolLinksWithOnWriteCache(symbol1.links));
        symbol1.links.type = type1;
        Debug.assert(symbol1.links.type === type1);
        Debug.assert(symbol1.links.type !== type2);
        const handle1 = linksOnWriteCacheControl.beginLevel();
        symbol1.links.type = type2;
        Debug.assert(symbol1.links.type !== type1);
        Debug.assert(symbol1.links.type === type2);
        linksOnWriteCacheControl.endLevel(handle1);
        Debug.assert(symbol1.links.type === type1);
        Debug.assert(symbol1.links.type !== type2);
        // @ts-expect-error
        const x = 1;
    }
    {
        const symbol1 = getSymbolWithLinks();
        const links = symbol1.links;
        Debug.assert(linksOnWriteCacheControl.isInstanceOfExtendedSymbolLinksWithOnWriteCache(links));
        links.type = type1;
        Debug.assert(links.type === type1);
        Debug.assert(links.type !== type2);
        const handle1 = linksOnWriteCacheControl.beginLevel();
        links.type = type2;
        Debug.assert(links.type !== type1);
        Debug.assert(links.type === type2);
        linksOnWriteCacheControl.endLevel(handle1);
        Debug.assert(links.type === type1);
        Debug.assert(links.type !== type2);
    }
    {
        let links: ExtendedSymbolLinks;
        const handle1 = linksOnWriteCacheControl.beginLevel();
        {
            const symbol1 = getSymbolWithLinks();
            links = symbol1.links;
            Debug.assert(linksOnWriteCacheControl.isInstanceOfExtendedSymbolLinksWithOnWriteCache(symbol1.links));
            Debug.assert(symbol1.links.type === undefined);
            symbol1.links.type = type1;
            Debug.assert(symbol1.links.type === type1);
            Debug.assert(symbol1.links.type !== type2);
            symbol1.links.type = type2;
            Debug.assert(symbol1.links.type !== type1);
            Debug.assert(symbol1.links.type === type2);
        }
        linksOnWriteCacheControl.endLevel(handle1);
        // In the code we hope links without original scoped symbol would never happen.
        Debug.assert(links.type === undefined);
    }

}
testLinksOnWriteCache();

// export function testLinksOnWriteCache(linksOnWriteCacheControl: ReturnType<typeof createLinksOnWriteCacheControl>, checker: TypeChecker): void {
//     // symbol should already have .links member and it should be an instance of ExtendedSymbolLinksWithOnWriteCache
//     const type1 = { name: "type1" } as any as Type;
//     const type2 = { name: "type2" } as any as Type;
//     {
//         const symbol1: TransientSymbol = checker.createSymbol(SymbolFlags.None, "testSymbol" as __String);
//         Debug.assert(linksOnWriteCacheControl.isInstanceOfExtendedSymbolLinksWithOnWriteCache(symbol1.links));
//         symbol1.links.type = type1;
//         Debug.assert(symbol1.links.type === type1);
//         Debug.assert(symbol1.links.type !== type2);
//         const handle1 = linksOnWriteCacheControl.beginLevel();
//         symbol1.links.type = type2;
//         Debug.assert(symbol1.links.type !== type1);
//         Debug.assert(symbol1.links.type === type2);
//         linksOnWriteCacheControl.endLevel(handle1);
//         Debug.assert(symbol1.links.type === type1);
//         Debug.assert(symbol1.links.type !== type2);
//     }
//     {
//         const symbol1: TransientSymbol = checker.createSymbol(SymbolFlags.None, "testSymbol" as __String);
//         const links = symbol1.links;
//         Debug.assert(linksOnWriteCacheControl.isInstanceOfExtendedSymbolLinksWithOnWriteCache(links));
//         links.type = type1;
//         Debug.assert(links.type === type1);
//         Debug.assert(links.type !== type2);
//         const handle1 = linksOnWriteCacheControl.beginLevel();
//         links.type = type2;
//         Debug.assert(links.type !== type1);
//         Debug.assert(links.type === type2);
//         linksOnWriteCacheControl.endLevel(handle1);
//         Debug.assert(links.type === type1);
//         Debug.assert(links.type !== type2);
//     }
//     {
//         let links: ExtendedSymbolLinks;
//         const handle1 = linksOnWriteCacheControl.beginLevel();
//         {
//             const symbol1: TransientSymbol = checker.createSymbol(SymbolFlags.None, "testSymbol" as __String);
//             links = symbol1.links;
//             Debug.assert(linksOnWriteCacheControl.isInstanceOfExtendedSymbolLinksWithOnWriteCache(symbol1.links));
//             Debug.assert(symbol1.links.type === undefined);
//             symbol1.links.type = type1;
//             Debug.assert(symbol1.links.type === type1);
//             Debug.assert(symbol1.links.type !== type2);
//             symbol1.links.type = type2;
//             Debug.assert(symbol1.links.type !== type1);
//             Debug.assert(symbol1.links.type === type2);
//         }
//         linksOnWriteCacheControl.endLevel(handle1);
//         // In the code we hope links without original scoped symbol would never happen.
//         Debug.assert(links.type === undefined);
//     }

// }

