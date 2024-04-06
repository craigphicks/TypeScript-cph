import { LocalsContainer, Symbol, SymbolTable } from "./types";
import { Debug } from "./debug";
import { FloughType } from "./floughType";
import { IDebug } from "./mydebug";
import { floughTypeModule } from "./floughType";
import { assertCastType } from "./floughTypedefs";
import { MrNarrow } from "./floughGroup2";
import { ProcessLoopState } from "./floughGroup";


const useWType = false;


var mrNarrow: MrNarrow = undefined as any as MrNarrow;
export function initFloughSymtab(mrNarrowInit: MrNarrow): void {
    mrNarrow = mrNarrowInit;
}

export interface FloughSymtabLoopStatus {loopGroupIdx: number, widening?: boolean}
export interface FloughSymtabEntry { type: FloughType, assignedType?: FloughType, wtype?: FloughType | undefined, wasAssigned?: boolean };

export interface FloughSymtab {
    localsContainer?: LocalsContainer;
    branch(loopStatus?:FloughSymtabLoopStatus,loopState?: ProcessLoopState): FloughSymtab;
    getLocalsContainer(): LocalsContainer;
    has(symbol: Symbol): boolean;
    get(symbol: Symbol): FloughType | undefined;
    getWithAssigned(symbol: Symbol): FloughSymtabEntry | undefined; // currentlly exposed for debug use only
    set(symbol: Symbol, type: Readonly<FloughType>): FloughSymtab; // so that we can write fsymtab = fsymtab.branch().set(symbol, type)
    setAsAssigned(symbol: Symbol, type: Readonly<FloughType>): FloughSymtab; // // so that we can write fsymtab = fsymtab.branch().setAsAssigned(symbol, type)
    forEachLocalMap(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
    forEachShadowMap(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
    forEach(f: ({type,wasAssigned}:{type: FloughType, wasAssigned?: boolean}, symbol: Symbol) => void): void;
};

type InnerMap = Map<Symbol, FloughSymtabEntry>;
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
    loopStatus?:{
        loopGroupIdx: number;
        widening?: boolean;
    };
    loopState?: ProcessLoopState; // TODO: Limit to only necessary members
    constructor(localsContainer?: LocalsContainer, outer?: Readonly<FloughSymtab>, localMap?: InnerMap, shadowMap?: InnerMap, loopStatus?:FloughSymtabLoopStatus, loopState?: ProcessLoopState) {
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
        if (loopStatus) this.loopStatus = loopStatus;
        if (loopState) this.loopState = loopState;
    }
    /**
     * For now we always create a new FloughSymtab when branching.
     * We could choose to make a copy of the localMap and shadowMap if they were below a certain size.
     * @returns a new FloughSymtab that is a branch of this FloughSymtab
     */
    branch(loopStatus?:FloughSymtabLoopStatus, loopState?: ProcessLoopState): FloughSymtabImpl {
        return new FloughSymtabImpl(undefined, this, undefined, undefined, loopStatus, loopState);
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
        return false;
        //Debug.assert(false,undefined,()=>`FloughSymtab.has(): Symbol unexpectedly not found in symtab ${symbol.escapedName}`);
    }
    // get(symbol: Symbol): FloughType | undefined {
    //     if (this.localMap.has(symbol)) return this.localMap.get(symbol)?.type;
    //     if (this.locals?.has(symbol.escapedName)) {
    //         const type = mrNarrow.getDeclaredType(symbol);
    //         this.localMap.set(symbol, { type });
    //         return type;
    //     }
    //     if (this.shadowMap.has(symbol)) return this.shadowMap.get(symbol)?.type;
    //     if (this.outer) return this.outer.get(symbol);
    //     return undefined;
    //     //Debug.assert(false,undefined,()=>`FloughSymtab.get(): Symbol unexpectedly not found in symtab ${symbol.escapedName}`);
    // }
    get(symbol: Symbol): FloughType | undefined {
        const entry = this.getWithAssigned(symbol);
        if (!entry) return undefined;
        return entry.type;
        // if (!entry.wtype) return entry.type;
        // return floughTypeModule.unionOfRefTypesType([entry.type, entry.wtype]);
    }
    getWithAssigned(symbol: Symbol): FloughSymtabEntry | undefined {

        let doNotMutateInGet = true;

        if (!useWType) {
            if (this.localMap.has(symbol)) return this.localMap.get(symbol);
            if (this.locals?.has(symbol.escapedName)) {
                const type = mrNarrow.getEffectiveDeclaredTypeFromSymbol(symbol);
                //this.localMap.set(symbol, { type }); // TODO: Not nice to mutate the FloughSymtabImpl with a get, although this might be harmless.  Try removing it?
                return { type };
            }
            if (this.shadowMap.has(symbol)) return this.shadowMap.get(symbol);
            if (this.loopState?.invocations===0 && this.loopStatus?.widening){
                const symbolInfo = mrNarrow.mrState.symbolFlowInfoMap.get(symbol);
                Debug.assert(symbolInfo);
                if (symbolInfo && !symbolInfo.isconst){
                    // Presence of loopState indicates loop boundary. The condition
                    // (this.loopState?.invocations===0 && symbolInfo && !symbolInfo.isconst) indicates that
                    // the symbol type should be widened because we don't yet know the loop feedback at loop start.
                    const type = mrNarrow.getEffectiveDeclaredType(symbolInfo);
                    if (!doNotMutateInGet) this.shadowMap.set(symbol, { type }); // <-- probably don't want to mutate the FloughSymtabImpl
                    return { type };
                }
            }
            if (this.outer) return this.outer.getWithAssigned(symbol);
            return undefined;
        }

        let entry: FloughSymtabEntry | undefined;
        if (entry = this.localMap.get(symbol)) {
            Debug.assert(!entry.wtype);
            return entry;
        }
        if (this.locals?.has(symbol.escapedName)) {
            const type = mrNarrow.getEffectiveDeclaredTypeFromSymbol(symbol);
            if (!doNotMutateInGet) this.localMap.set(symbol, { type }); // TODO: Not nice to mutate the FloughSymtabImpl with a get, although this might be harmless.  Try removing it?
            return { type };
        }
        let wtype: FloughType | undefined;
        //let type: FloughType | undefined;

        if (this.loopStatus){
            if (this.loopStatus.widening){
                const symbolInfo = mrNarrow.mrState.symbolFlowInfoMap.get(symbol);
                Debug.assert(symbolInfo);
                if (symbolInfo && !symbolInfo.isconst){
                    // Presence of loopState indicates loop boundary. The condition
                    // (this.loopState?.invocations===0 && symbolInfo && !symbolInfo.isconst) indicates that
                    // the symbol type should be widened because we don't yet know the loop feedback at loop start.
                    wtype = mrNarrow.getEffectiveDeclaredType(symbolInfo);
                    if (!doNotMutateInGet) this.shadowMap.set(symbol, { type: wtype, wtype }); // <-- probably don't want to mutate the FloughSymtabImpl
                }
                //Debug.assert(wtype && entry);
            }
        }

        entry = this.shadowMap.get(symbol);
        if (!entry && this.outer) {
            entry = this.outer.getWithAssigned(symbol);
        }
        if (!entry) {
            Debug.assert(!wtype);
            return undefined;
        }
        if (this.loopStatus){
            if (!this.loopStatus.widening){
                Debug.assert(!wtype);
                return { type: entry.type } ;
            }
        }
        return { type: entry.type, wtype: wtype ?? entry.wtype };
    }

    set(symbol: Symbol, type: Readonly<FloughType>): FloughSymtab {
        if (this.locals?.has(symbol.escapedName)) this.localMap.set(symbol, { type });
        else {
            const got = this.getWithAssigned(symbol);
            // assigned type gets set to narrowed previous assigned type if it exists, otherwise undefined
            this.shadowMap.set(symbol, { type, assignedType: got ? type : undefined });
        }
        return this;
    }
    setAsAssigned(symbol: Symbol, type: Readonly<FloughType>): FloughSymtab {
        if (this.locals?.has(symbol.escapedName)) this.localMap.set(symbol, { type, assignedType: type, wasAssigned: true});
        else {
            this.shadowMap.set(symbol, { type, assignedType: type, wasAssigned: true});
            const loopState = mrNarrow.mrState.getCurrentLoopState();
            if (loopState && loopState.invocations===0) {
                // add symbol to assigned list
                loopState.symbolsAssigned!.add(symbol);
            }
        }
        return this;
    }

    forEachLocalMap(f: (entry:FloughSymtabEntry, symbol: Symbol) => void): void {
        this.localMap.forEach((entry, symbol) => f(entry, symbol));
    }
    forEachShadowMap(f: (entry:FloughSymtabEntry, symbol: Symbol) => void): void {
        this.shadowMap.forEach((entry, symbol) => f(entry, symbol));
    }

    forEach(f: (entry:FloughSymtabEntry, symbol: Symbol) => void): void {
        this.forEachLocalMap(f);
        this.forEachShadowMap(f);
    }

}

export function createFloughSymtab(localsContainer?: LocalsContainer, outer?: Readonly<FloughSymtab>): FloughSymtab {
    return new FloughSymtabImpl(localsContainer, outer);
}

/**
 * Exit the LocalsContainer scope.
 * @param fsymtabIn
 * @param scopeLoc  LocalContainer to exit
 * @returns
 */
export function floughSymtabRollupLocalsScope(fsymtabIn: FloughSymtab, scopeLoc: LocalsContainer): FloughSymtab {
    const arrfs: FloughSymtabImpl[] = [];
    {
        let fs: FloughSymtabImpl | undefined = (fsymtabIn as FloughSymtabImpl);
        for (; fs && fs.localsContainer!==scopeLoc; fs = fs.outer) {
            arrfs.push(fs);
        }
        Debug.assert(fs); // TODO
        arrfs.push(fs);
    }
    arrfs.reverse();
    const topShadowMap = createInnerMap(arrfs[0].shadowMap); // will change
    const topLocalSet = new Set(arrfs[0].locals?.values()); // will not change
    arrfs.slice(1).forEach((fs,idx) => {
        fs.shadowMap.forEach(({type, wasAssigned}, symbol) => {
            if (topLocalSet.has(symbol)) return;
            topShadowMap.set(symbol, { type, wasAssigned: wasAssigned || (topShadowMap.get(symbol)?.wasAssigned ?? false) });
        });
    });
    if (topShadowMap.size === 0) {
        Debug.assert(arrfs[0].outer);
        return arrfs[0].outer;
    }
    return new FloughSymtabImpl(undefined, arrfs[0].outer, undefined, topShadowMap);
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
export function unionFloughSymtab(afsIn: readonly (Readonly<FloughSymtab> | undefined)[]): FloughSymtab {
const loggerLevel = 1;
IDebug.ilogGroup(()=>`unionFloughSymtab[in]: afsIn.length: ${afsIn.length})`, loggerLevel);
if (IDebug.isActive(loggerLevel)) {
    afsIn.forEach((fs,idx) => {
        dbgFloughSymtabToStrings(fs).forEach(s => IDebug.ilog(()=>`[#${idx}]${s}`, loggerLevel));
    });
}
const ret = (()=>{
    afsIn = afsIn.filter(fs => fs); // remove undefineds
    /**
     * We never have to look back further than the closest common ancestor.
     */
    assertCastType<Readonly<FloughSymtabImpl>[]>(afsIn);
    if (afsIn.length === 0) {
        Debug.assert(false);
    }
    if (afsIn.length === 1) {
        return afsIn[0];
    }
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
                // Debug.assert(!fsx.localsContainer); // If it is an earlier group idx than the current loop group idx, not a problem
                fsx = fsx.outer!;
            }
            // Debug.assert(fsx===fsca); // If it is an earlier group idx than the current loop group idx, not a problem
        });
    }
    //const setAncestors = new Set<FloughSymtabImpl>();
    const mapSymbolToSet = new Map<Symbol,({type: FloughType, wasAssigned?:boolean}|undefined)[]/*length afsIn.length*/>();
    afsIn.forEach((fs,idx)=>{
        for (let fsx = fs; fsx!==fsca; fsx = fsx.outer!) {
            //if (setAncestors.has(fsx)) break;
            //setAncestors.add(fsx);
            if (fsx.shadowMap.size) {
                fsx.shadowMap.forEach((entry, symbol) => {
                    let arr = mapSymbolToSet.get(symbol);
                    if (!arr) {
                        arr = new Array(afsIn.length).fill(undefined);
                        mapSymbolToSet.set(symbol, arr);
                    }
                    arr[idx] ??= entry; // if it is already set, do not set again
                });
            }
            if (IDebug.assertLevel>=1) {
                // Debug.assert(!fsx.localsContainer);
            }
        }
    });

    if (IDebug.isActive(loggerLevel)) {
        //dbgFloughSymtabToStrings(fsymtab).forEach(s => IDebug.ilog(()=>`return: ${s}`, loggerLevel));
        mapSymbolToSet.forEach((arr,symbol) => {
            IDebug.ilog(()=>`symbol: ${
                IDebug.dbgs.symbolToString(symbol)} -> ${
                    arr.map(x => x ? `[{type:${floughTypeModule.dbgFloughTypeToString(x.type)}, wasAssigned:${x.wasAssigned}}]` : `[<undef>]`).join(", ")}`, loggerLevel);
        });
    }


    // fill in the blanks
    mapSymbolToSet.forEach((arr,symbol) => {
        arr.forEach((e,i)=>{
            if (!e) {
                arr[i] = fsca.getWithAssigned(symbol);
            }
        });
    });
    assertCastType<Map<Symbol,FloughSymtabEntry[]>>(mapSymbolToSet);


    //const localMap: InnerMap | undefined = fsca.localMap ? createInnerMap(fsca.localMap) : fsca.localsContainer ? createInnerMap() : undefined;
    let shadowMap: InnerMap | undefined = createInnerMap();
    //const mapSymbolUnion = new Map<Symbol,{type: FloughType, wasAssigned?:boolean}>();
    mapSymbolToSet.forEach((arr,symbol) => {
        //if (shadowMap.has(symbol)) arr.push(shadowMap.get(symbol)!);
        let result =  arr.reduce((acc, x) =>  {
            Debug.assert(acc);
            if (!x) return acc;
            // if (!x.wasAssigned && acc.wasAssigned) {
            //     return acc;
            // }
            // if (x.wasAssigned && !acc.wasAssigned) {
            //     // return x; cannot use x because x.type is not a fresh object
            //     acc = { type: floughTypeModule.cloneType(x.type), wasAssigned: x.wasAssigned};
            //     return acc;
            // }
            return {
                type: floughTypeModule.unionWithFloughTypeMutate(x.type, acc.type),
                wtype: x.wtype ? floughTypeModule.unionWithFloughTypeMutate(x.wtype, acc.wtype!) : acc.wtype!,
                wasAssigned: acc.wasAssigned || x.wasAssigned
            };
        }, { type: floughTypeModule.createNeverType(), wtype: floughTypeModule.createNeverType() }); // // need to initialize with a fresh never type because it will be mutated
        //if (!floughTypeModule.isNeverType(result!.type))
        if (floughTypeModule.isNeverType(result.wtype!)) result.wtype = undefined;
        shadowMap.set(symbol, result!);
    });
    if (shadowMap.size === 0) return fsca;
    return new FloughSymtabImpl(undefined, fsca, undefined, shadowMap);

})();
if (IDebug.isActive(loggerLevel)) {
    dbgFloughSymtabToStrings(ret).forEach(s => IDebug.ilog(()=>`return: ${s}`, loggerLevel));
}
IDebug.ilogGroupEnd(()=>`unionFloughSymtab[out]`, loggerLevel);
return ret;
}




export function dbgFloughSymtabToStringsOne(fsIn: Readonly<FloughSymtab>): string[] {
    assertCastType<FloughSymtabImpl>(fsIn);
    const arr: string[] = [];
    if (fsIn.dbgid) arr.push(`dbgid: ${fsIn.dbgid}`);
    arr.push(`tableDepth: ${fsIn.tableDepth}`);

    if (fsIn.loopStatus) arr.push(`loopStatus: {widening:${fsIn.loopStatus.widening}, loopGroupIdx:${fsIn.loopStatus.loopGroupIdx}}`);
    if (fsIn.loopState) arr.push(`loopState: {invocations: ${fsIn.loopState.invocations}, loopConditionCall:${fsIn.loopState.loopConditionCall}, loopGroup.groupIdx: ${fsIn.loopState.loopGroup.groupIdx}}`);

    if (!fsIn.localsContainer) arr.push(`localsContainer: <undef>`);
    else if (!fsIn.localsContainer.locals) arr.push(`localsContainer.locals: <undef>`);
    else fsIn.localsContainer.locals.forEach((symbol, _escapedName) => {
        arr.push(`localsContainer.locals: ${IDebug.dbgs.symbolToString(symbol)}`)
    });

    fsIn.forEachLocalMap(({type, wtype, wasAssigned}, symbol) => {
        Debug.assert(!wtype); // should not be defined for local map.
        arr.push(`localMap: ${IDebug.dbgs.symbolToString(symbol)
        } -> { type: ${floughTypeModule.dbgFloughTypeToString(type)}, wasAssigned: ${wasAssigned?? "<undef>"}}`);
    });
    fsIn.forEachShadowMap(({type, wtype, wasAssigned}, symbol) => {
        arr.push(`shadowMap: ${IDebug.dbgs.symbolToString(symbol)
        } -> { type: ${floughTypeModule.dbgFloughTypeToString(type)}, wtype: ${floughTypeModule.dbgFloughTypeToString(wtype)}, wasAssigned: ${wasAssigned?? "<undef>"}}`);
    });
    return arr;
}

export function dbgFloughSymtabToStrings(fsIn: Readonly<FloughSymtab> | undefined, upTo?: Readonly<FloughSymtabImpl> ): string[] {
    if (!fsIn) return ["<undef>"];
    const arr: string[] = [];
    for (let fs: FloughSymtab | undefined = fsIn, x=0; fs; fs = (fs as FloughSymtabImpl).outer, x--) {
        arr.push(...dbgFloughSymtabToStringsOne(fs).map(s => `[${x}]: ${s}`));
        if (fs && fs === upTo) break;
    }
    return arr;
}
