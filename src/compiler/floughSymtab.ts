import { LocalsContainer, Symbol, SymbolTable } from "./types";
import { Debug } from "./debug";
import { FloughType } from "./floughType";
import { IDebug } from "./mydebug";
import { floughTypeModule } from "./floughType";
import { assertCastType } from "./floughTypedefs";
import { MrNarrow } from "./floughGroup2";

var mrNarrow: MrNarrow = undefined as any as MrNarrow;
export function initFloughSymtab(mrNarrowInit: MrNarrow): void {
    mrNarrow = mrNarrowInit;
}


export interface FloughSymtab {
    localsContainer?: LocalsContainer;
    branch(): FloughSymtab;
    getLocalsContainer(): LocalsContainer;
    has(symbol: Symbol): boolean;
    get(symbol: Symbol): FloughType | undefined;
    getWithAssigned(symbol: Symbol): { type: FloughType, wasAssigned?: boolean } | undefined;
    set(symbol: Symbol, type: Readonly<FloughType>): FloughSymtab; // so that we can write fsymtab = fsymtab.branch().set(symbol, type)
    setAsAssigned(symbol: Symbol, type: Readonly<FloughType>): FloughSymtab; // // so that we can write fsymtab = fsymtab.branch().setAsAssigned(symbol, type)
    forEachLocalMap(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
    forEachShadowMap(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
    forEach(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
};

type InnerMap = Map<Symbol, { type: FloughType, wasAssigned?: boolean }>;
function createInnerMap(clone?: InnerMap): InnerMap { return clone? new Map(clone) : new Map(); }

class FloughSymtabImpl implements FloughSymtab {
    static nextdbgid = 1;
    dbgid?: number;
    tableDepth: number;
    outer: FloughSymtabImpl | undefined;
    localMap = createInnerMap(); // only symbols in locals (therefore could be a weak map)
    shadowMap = createInnerMap();
    locals?: Readonly<SymbolTable>;
    localsContainer?: LocalsContainer;
    constructor(localsContainer?: LocalsContainer, outer?: Readonly<FloughSymtab>, localMap?: InnerMap, shadowMap?: InnerMap) {
        if (IDebug.isActive(0)) this.dbgid = FloughSymtabImpl.nextdbgid++;
        this.localsContainer = localsContainer
        Debug.assert(!localsContainer || localsContainer.locals?.size,undefined,()=>`FloughSymtabImpl.constructor(): localsContainer has no locals`);
        if (localsContainer) this.locals = localsContainer.locals;
        if (outer) {
            this.outer = outer as FloughSymtabImpl;
            this.tableDepth = this.outer.tableDepth + 1;
        }
        else this.tableDepth = 0;
        if (localMap) this.localMap = localMap;
        if (shadowMap) this.shadowMap = shadowMap;
    }
    /**
     * For now we always create a new FloughSymtab when branching.
     * We could choose to make a copy of the localMap and shadowMap if they were below a certain size.
     * @returns a new FloughSymtab that is a branch of this FloughSymtab
     */
    branch(): FloughSymtabImpl {
        return new FloughSymtabImpl(undefined, this, undefined, undefined);
    }
    getLocalsContainer(): LocalsContainer {
        if (this.localsContainer) return this.localsContainer;
        else {
            for (let fs = this.outer; fs; fs = fs.outer) {
                if (fs.localsContainer) return fs.localsContainer;
            }
            Debug.assert(false,undefined,()=>`FloughSymtab.getLocalsContainer(): localsContainer unexpectedly not found`);
        }
    }

    has(symbol: Symbol): boolean {
        if (this.localMap.has(symbol)) return true;
        if (this.locals?.has(symbol.escapedName)) return false;
        if (this.shadowMap.has(symbol)) return true;
        if (this.outer) return this.outer.has(symbol);
        Debug.assert(false,undefined,()=>`FloughSymtab.has(): Symbol unexpectedly not found in symtab ${symbol.escapedName}`);
    }
    get(symbol: Symbol): FloughType | undefined {
        if (this.localMap.has(symbol)) return this.localMap.get(symbol)?.type;
        if (this.locals?.has(symbol.escapedName)) {
            const type = mrNarrow.getDeclaredType(symbol);
            this.localMap.set(symbol, { type });
            return type;
        }
        if (this.shadowMap.has(symbol)) return this.shadowMap.get(symbol)?.type;
        if (this.outer) return this.outer.get(symbol);
        Debug.assert(false,undefined,()=>`FloughSymtab.get(): Symbol unexpectedly not found in symtab ${symbol.escapedName}`);
    }
    getWithAssigned(symbol: Symbol): { type: FloughType, wasAssigned?: boolean } | undefined {
        if (this.localMap.has(symbol)) return this.localMap.get(symbol);
        if (this.locals?.has(symbol.escapedName)) {
            const type = mrNarrow.getDeclaredType(symbol);
            this.localMap.set(symbol, { type });
            return { type };
        }
        if (this.shadowMap.has(symbol)) return this.shadowMap.get(symbol);
        Debug.assert(false,undefined,()=>`FloughSymtab.getWithAssigned(): Symbol unexpectedly not found in symtab ${symbol.escapedName}`);
    }

    set(symbol: Symbol, type: Readonly<FloughType>): FloughSymtab {
        if (this.locals?.has(symbol.escapedName)) this.localMap.set(symbol, { type });
        else this.shadowMap.set(symbol, { type });
        return this;
    }
    setAsAssigned(symbol: Symbol, type: Readonly<FloughType>): FloughSymtab {
        if (this.locals?.has(symbol.escapedName)) this.localMap.set(symbol, { type, wasAssigned: true});
        else this.shadowMap.set(symbol, { type, wasAssigned: true});
        return this;
    }

    forEachLocalMap(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void {
        this.localMap.forEach((typeWithWasAssigned, symbol) => f(typeWithWasAssigned, symbol));
    }
    forEachShadowMap(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void {
        this.shadowMap.forEach((typeWithWasAssigned, symbol) => f(typeWithWasAssigned, symbol));
    }

    forEach(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void {
        this.forEachLocalMap(f);
        this.forEachShadowMap(f);
    }

}

export function createFloughSymtab(localsContainer: LocalsContainer, outer?: Readonly<FloughSymtab>): FloughSymtab {
    return new FloughSymtabImpl(localsContainer, outer);
}


export function floughSymtabRollupToAncestor(fsymtabIn: FloughSymtab, ancestorLoc: LocalsContainer): FloughSymtab {
    const arrfs: FloughSymtabImpl[] = [];
    {
        let fs: FloughSymtabImpl | undefined = (fsymtabIn as FloughSymtabImpl);
        for (; fs && fs.localsContainer!==ancestorLoc; fs = fs.outer) {
            arrfs.push(fs);
        }
        Debug.assert(fs); // TODO
        arrfs.push(fs);
    }
    arrfs.reverse();

    const topShadowMap = createInnerMap(arrfs[0].shadowMap); // will change
    const topLocalMap = createInnerMap(arrfs[0].localMap); // will change (symbols are subset of topLocalSet symbols)
    const topLocalSet = new Set(arrfs[0].locals?.values()); // will not change
    /**
     * Instead of accumulating in accumLocalSet, we could iterative up the chain and check if the symbol is in the locals of the ancestorLoc.
     * That would save on memory thrashing but would have a poterntialy higher order operation complexity.
     */
    const accumLocalSet = new Set<Symbol>();

    let topShadowMapChanged = false;
    let topLocalMapChanged = false;

    arrfs.slice(1).forEach((fs,idx) => {
        fs.shadowMap.forEach(({type, wasAssigned}, symbol) => {
            if (topLocalSet.has(symbol)) {
                topLocalMapChanged = true;
                topLocalMap.set(symbol, { type, wasAssigned: wasAssigned || (topLocalMap.get(symbol)?.wasAssigned ?? false) });
            }
            else if (!accumLocalSet.has(symbol)) {
                topShadowMapChanged = true;
                topShadowMap.set(symbol, { type, wasAssigned: wasAssigned || (topShadowMap.get(symbol)?.wasAssigned ?? false) });
            }
        });
        if (idx !== arrfs.length-1) {
            fs.locals?.forEach((symbol, _escapedName) => {
                accumLocalSet.add(symbol);
            });
        }
    });
    if (!topShadowMapChanged && !topLocalMapChanged) return arrfs[0];
    return new FloughSymtabImpl(arrfs[0].localsContainer, arrfs[0].outer, topLocalMap, topShadowMap);
}


/**
 *
 * @param afsIn Had another idea
 * @returns
 */
export function unionFloughSymtab(afsIn: readonly Readonly<FloughSymtab>[]): FloughSymtab {
    const loggerLevel = 1;
    IDebug.ilogGroup(()=>`unionFloughSymtab[in]: afsIn.length: ${afsIn.length})`, loggerLevel);
    if (IDebug.isActive(loggerLevel)) {
        afsIn.forEach((fs,idx) => {
            dbgFloughSymtabToStrings(fs).forEach(s => IDebug.ilog(()=>`[#${idx}]${s}`, loggerLevel));
        });
    }
    /**
     * We never have to look back further than the closest common ancestor.
     */
    assertCastType<Readonly<FloughSymtabImpl>[]>(afsIn);
    if (afsIn.length === 0) Debug.assert(false);
    if (afsIn.length === 1) return afsIn[0];
    /**
     * fsca will be the nearest common ancestor
     */
    let fsca = afsIn[0];
    for (let i=1; i<afsIn.length; i++) {
        let fs1 = afsIn[i];
        while (fsca.tableDepth>fs1.tableDepth) {
            fsca = fsca.outer!;
            if (IDebug.assertLevel) Debug.assert(fsca);
        }
        while (fs1.tableDepth>fsca.tableDepth) {
            fs1 = fs1.outer!;
            if (IDebug.assertLevel) Debug.assert(fs1);
        }
        while (fsca!==fs1) {
            fsca = fsca.outer!;
            fs1 = fs1.outer!;
            if (IDebug.assertLevel) {
                Debug.assert(fsca && fs1);
                Debug.assert(fsca.tableDepth === fs1.tableDepth);
            }
        }
        if (IDebug.assertLevel>=1) {
            Debug.assert(fsca);
            Debug.assert(fs1);
            Debug.assert(fsca === fs1);
        }
        fsca = fs1;
    }
    if (IDebug.isActive(loggerLevel)) {
        dbgFloughSymtabToStrings(fsca).forEach(s => IDebug.ilog(()=>`fsca: ${s}`, loggerLevel));
    }

    // fsca should be a common ancestor
    if (IDebug.assertLevel>=1) {
        afsIn.forEach(fsx => {
            while (fsx && fsx !== fsca) {
                Debug.assert(fsx);
                Debug.assert(!fsx.localsContainer); // If this fails, it is a TODO
                fsx = fsx.outer!;
            }
            Debug.assert(fsx===fsca);
        });
    }
    const setAncestors = new Set<FloughSymtabImpl>();
    const mapSymbolToSet = new Map<Symbol,({type: FloughType, wasAssigned?:boolean}|undefined)[]/*length afsIn.length*/>();
    afsIn.forEach((fs,idx)=>{
        for (let fsx = fs; fsx!==fsca; fsx = fsx.outer!) {
            if (setAncestors.has(fsx)) break;
            setAncestors.add(fsx);
            if (fsx.shadowMap.size) {
                fsx.shadowMap.forEach(({type, wasAssigned}, symbol) => {
                    let arr = mapSymbolToSet.get(symbol);
                    if (!arr) {
                        arr = new Array(afsIn.length).fill(undefined);
                        mapSymbolToSet.set(symbol, arr);
                    }
                    arr[idx] ??= {type, wasAssigned}; // if it is already set, do not set again
                });
            }
            if (IDebug.assertLevel>=1) {
                Debug.assert(!fsx.localsContainer);
            }
        }
    });
    // fill in the blanks
    mapSymbolToSet.forEach((arr,symbol) => {
        arr.forEach((e,i)=>{
            if (!e) {
                arr[i] = { type: mrNarrow.getDeclaredType(symbol) };
            }
        });
    });
    assertCastType<Map<Symbol,{type: FloughType, wasAssigned?:boolean}[]>>(mapSymbolToSet);

    if (IDebug.isActive(loggerLevel)) {
        //dbgFloughSymtabToStrings(fsymtab).forEach(s => IDebug.ilog(()=>`return: ${s}`, loggerLevel));
        mapSymbolToSet.forEach((arr,symbol) => {
            IDebug.ilog(()=>`symbol: ${IDebug.dbgs.symbolToString(symbol)} -> ${arr.map(x => `[${floughTypeModule.dbgFloughTypeToString(x.type)}, ${x.wasAssigned}]`).join(", ")}`, loggerLevel);
        });
    }

    const localMap: InnerMap | undefined = fsca.localMap ? createInnerMap(fsca.localMap) : fsca.localsContainer ? createInnerMap() : undefined;
    let shadowMap: InnerMap = createInnerMap(fsca.shadowMap);
    //const mapSymbolUnion = new Map<Symbol,{type: FloughType, wasAssigned?:boolean}>();
    mapSymbolToSet.forEach((arr,symbol) => {
        if (localMap?.has(symbol)) arr.push(localMap.get(symbol)!);
        else if (shadowMap.has(symbol)) arr.push(shadowMap.get(symbol)!);
        let result =  arr.reduce((acc, x) =>  ({
            type: floughTypeModule.unionWithFloughTypeMutate(x.type, acc.type), wasAssigned: acc.wasAssigned || x.wasAssigned
        }));
        if (fsca.localsContainer?.locals?.has(symbol.escapedName)) {
            localMap!.set(symbol, result);
        }
        else {
            shadowMap.set(symbol, result);
        }
    });
    const fsymtab = new FloughSymtabImpl(fsca.localsContainer, fsca.outer, localMap, shadowMap);

    if (IDebug.isActive(loggerLevel)) {
        dbgFloughSymtabToStrings(fsymtab).forEach(s => IDebug.ilog(()=>`return: ${s}`, loggerLevel));
    }

    IDebug.ilogGroupEnd(()=>`unionFloughSymtab[out]`, loggerLevel);

    return fsymtab;
}




export function dbgFloughSymtabToStringsOne(fsIn: Readonly<FloughSymtab>): string[] {
    const arr: string[] = [];
    if ((fsIn as FloughSymtabImpl).dbgid) arr.push(`dbgid: ${(fsIn as FloughSymtabImpl).dbgid}`);
    arr.push(`tableDepth: ${(fsIn as FloughSymtabImpl).tableDepth}`);
    if (!fsIn.localsContainer) arr.push(`localsContainer: <undef>`);
    else if (!fsIn.localsContainer.locals) arr.push(`localsContainer.locals: <undef>`);
    else fsIn.localsContainer.locals.forEach((symbol, _escapedName) => {
        arr.push(`localsContainer.locals: ${IDebug.dbgs.symbolToString(symbol)}`)
    });
    fsIn.forEachLocalMap(({type, wasAssigned}, symbol) => {
        arr.push(`localMap: ${IDebug.dbgs.symbolToString(symbol)} -> { floughType: ${floughTypeModule.dbgFloughTypeToString(type)}, wasAssigned: ${wasAssigned?? "<undef>"}}`);
    });
    fsIn.forEachShadowMap(({type, wasAssigned}, symbol) => {
        arr.push(`shadowMap: ${IDebug.dbgs.symbolToString(symbol)} -> { floughType: ${floughTypeModule.dbgFloughTypeToString(type)}, wasAssigned: ${wasAssigned?? "<undef>"}}`);
    });
    return arr;
}

export function dbgFloughSymtabToStrings(fsIn: Readonly<FloughSymtab>, upTo?: Readonly<FloughSymtabImpl> ): string[] {
    const arr: string[] = [];
    for (let fs: FloughSymtab | undefined = fsIn, x=0; fs; fs = (fs as FloughSymtabImpl).outer, x--) {
        arr.push(...dbgFloughSymtabToStringsOne(fs).map(s => `[${x}]: ${s}`));
        if (fs && fs === upTo) break;
    }
    return arr;
}
