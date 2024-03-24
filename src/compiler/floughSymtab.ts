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

class FloughSymtabImpl implements FloughSymtab {
    private outer: FloughSymtab | undefined;
    private localMap = new Map<Symbol, { type: FloughType, wasAssigned?: boolean }>(); // could be a weak map
    private shadowMap = new Map<Symbol, { type: FloughType, wasAssigned?: boolean }>();
    private locals?: Readonly<SymbolTable>;
    localsContainer?: LocalsContainer;
    constructor(localsContainer?: LocalsContainer, outer?: Readonly<FloughSymtab>) {
        this.localsContainer = localsContainer
        Debug.assert(!localsContainer || localsContainer.locals?.size,undefined,()=>`FloughSymtabImpl.constructor(): localsContainer has no locals`);
        if (localsContainer) this.locals = localsContainer.locals;
        if (outer) {
            this.outer = outer;
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


