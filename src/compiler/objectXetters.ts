import {
    // objectAllocator,
    Symbol,
    //TransientSymbol,
    SymbolLinks,
    TransientSymbolLinks,
    MappedSymbolLinks,
    ReverseMappedSymbolLinks,
    Debug,
    //castHereafter,
    //SymbolFlags,
    __String
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
        if (this.getLevel()!==-1) Debug.assert(false, "beginNewLevel() deeper than one not yet tested");
        return this.cachedByLevel.push(new Set<T>);
    }
    endLevel(expectedDepth: number): void {
        Debug.assert(expectedDepth>=0);
        Debug.assertEqual(expectedDepth, this.getLevel());
        this.cachedByLevel?.forEach((value) => { (value as any).restoreFromCache(this.getLevel()); });
        this.cachedByLevel.pop();
    }
    addRequest(t: T): number {
        Debug.assert(this.getLevel()>=0);
        this.cachedByLevel[this.getLevel()].add(t);
        return this.cachedByLevel.length;
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
const cacheControl: CacheControl = (null as any as CacheControl);
class ProxyWithOnWriteCache<T extends Object> {
    /**
     * _cacheByLevel:
     * On-first-write in a level, caching a {...copy} of the last object.
     * (TODO? Could try to optimize by caching only the each last [property,value] pair.)
     */
    static cacheControl: CacheControl = (null as any as CacheControl);
    cacheByLevel: (T | undefined)[];
    /**
     * proxied: the actual object being proxied.  The reference remains active between levels until proxied no longer unreferenced.
     */
    private proxied: T;
    // @ts-ignore
    private proxy: any;
    // @ts-expect-error (will use it for debugging)
    private symbol: Symbol;
    constructor(proxied: T, symbol: Symbol) {
        this.symbol = symbol;
        this.proxied = proxied;
        this.cacheByLevel = [];
        const that = this;
        this.proxy = new Proxy(proxied, {
            get: function(_target: T, key: string): any{
                const index = cacheControl.getLevel();
                if (index>=0 && that.cacheByLevel[index])
                    return that.cacheByLevel[index]![key as keyof T];
                return that.proxied[key as keyof T];
            },
            set: function(_target: T, key: string, value: any): any{
                const index = cacheControl.getLevel();
                if (index>=0){
                    if (!that.cacheByLevel[index]) that.cacheByLevel[index] = {...that.proxied }; // shallow copy
                    cacheControl.addRequest(that);
                }
                that.proxied[key as keyof T] = value;
            },
        });
    }
    restoreFromCache(level: number){
        Debug.assert(level>0);
        const index = level;
        Debug.assert(this.cacheByLevel[index]);
        for (const key in this.cacheByLevel[index]){
            this.proxied[key as keyof T] = this.cacheByLevel[index]![key as keyof T];
        }
        this.cacheByLevel[index]=undefined;
    }
}

export function createSymbolLinkOnWriteCacheControl(){
    const cacheControl = new CacheControl<ProxyWithOnWriteCache<ExtendedSymbolLinks>>();
    // This is safe because typescript compiler does not implement async processing.
    ProxyWithOnWriteCache.cacheControl = cacheControl; // not async-safe

    return {
        beginLevel(){ return cacheControl.beginLevel(); },
        endLevel(expectedDepth: number){ return cacheControl.endLevel(expectedDepth); },
        getProxyWithOnWriteCache(links: ExtendedSymbolLinks, symbol: Symbol): ExtendedSymbolLinks {
            return new ProxyWithOnWriteCache(links, symbol) as unknown as ExtendedSymbolLinks;
        },
        isProxyOfExtendedSymbolLinks(links: ExtendedSymbolLinks): boolean {
            return links instanceof ProxyWithOnWriteCache;
        }
    }
}


