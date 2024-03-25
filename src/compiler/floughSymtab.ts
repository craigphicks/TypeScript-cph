import { LocalsContainer, Symbol, SymbolTable } from "./types";
import { Debug } from "./debug";
import { FloughType } from "./floughType";


export interface FloughSymtab {
    localsContainer?: LocalsContainer;
    has(symbol: Symbol): boolean;
    get(symbol: Symbol): FloughType | undefined;
    getWithAssigned(symbol: Symbol): { type: FloughType, wasAssigned?: boolean } | undefined;
    set(symbol: Symbol, type: Readonly<FloughType>): void;
    setAsAssigned(symbol: Symbol, type: Readonly<FloughType>): void;
    forEachLocal(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
    forEachShadow(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
    forEach(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
};

type InnerMap = Map<Symbol, { type: FloughType, wasAssigned?: boolean }>;
function createInnerMap(clone?: InnerMap): InnerMap { return clone? new Map(clone) : new Map(); }

class FloughSymtabImpl implements FloughSymtab {
    outer: FloughSymtabImpl | undefined;
    localMap = createInnerMap(); // only symbols in locals (therefore could be a weak map)
    shadowMap = createInnerMap();
    locals?: Readonly<SymbolTable>;
    localsContainer?: LocalsContainer;
    constructor(localsContainer?: LocalsContainer, outer?: Readonly<FloughSymtab>, localMap?: InnerMap, shadowMap?: InnerMap) {
        this.localsContainer = localsContainer
        Debug.assert(!localsContainer || localsContainer.locals?.size,undefined,()=>`FloughSymtabImpl.constructor(): localsContainer has no locals`);
        if (localsContainer) this.locals = localsContainer.locals;
        if (outer) {
            this.outer = outer as FloughSymtabImpl;
        }
        if (localMap) this.localMap = localMap;
        if (shadowMap) this.shadowMap = shadowMap;
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
        if (this.locals?.has(symbol.escapedName)) return undefined;
        if (this.shadowMap.has(symbol)) return this.shadowMap.get(symbol)?.type;
        if (this.outer) return this.outer.get(symbol);
        Debug.assert(false,undefined,()=>`FloughSymtab.get(): Symbol unexpectedly not found in symtab ${symbol.escapedName}`);
    }
    getWithAssigned(symbol: Symbol): { type: FloughType, wasAssigned?: boolean } | undefined {
        if (this.localMap.has(symbol)) return this.localMap.get(symbol);
        if (this.locals?.has(symbol.escapedName)) return undefined;
        if (this.shadowMap.has(symbol)) return this.shadowMap.get(symbol);
        Debug.assert(false,undefined,()=>`FloughSymtab.getWithAssigned(): Symbol unexpectedly not found in symtab ${symbol.escapedName}`);
    }

    set(symbol: Symbol, type: Readonly<FloughType>): void {
        if (this.locals?.has(symbol.escapedName)) this.localMap.set(symbol, { type });
        else this.shadowMap.set(symbol, { type });
    }
    setAsAssigned(symbol: Symbol, type: Readonly<FloughType>): void {
        if (this.locals?.has(symbol.escapedName)) this.localMap.set(symbol, { type, wasAssigned: true});
        else this.shadowMap.set(symbol, { type, wasAssigned: true});
    }

    forEachLocal(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void {
        this.localMap.forEach((typeWithWasAssigned, symbol) => f(typeWithWasAssigned, symbol));
    }
    forEachShadow(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void {
        this.shadowMap.forEach((typeWithWasAssigned, symbol) => f(typeWithWasAssigned, symbol));
    }

    forEach(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void {
        this.forEachLocal(f);
        this.forEachShadow(f);
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
