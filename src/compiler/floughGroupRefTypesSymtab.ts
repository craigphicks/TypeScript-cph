import {
    Symbol
} from "./types";
import {
    Debug,
} from "./debug";
import {
    FloughLogicalObjectInnerIF,
} from "./floughLogicalObjectInner";
import {
    FloughLogicalObjectIF,
    floughLogicalObjectModule,
} from "./floughLogicalObjectOuter";
import {
    RefTypesType,
    floughTypeModule,
    FloughType,
} from "./floughType";
import {
    RefTypesSymtabConstraintItem,
    RefTypesSymtabConstraintItemNever,
    assertCastType,
    RefTypesSymtabConstraintItemNotNever,
} from "./floughTypedefs";
import {
    isNeverConstraint,
    createFlowConstraintNever,
    createFlowConstraintAlways,
} from "./floughConstraints";
import {
    SymbolFlowInfoMap,
    ProcessLoopState,
    GroupForFlow,
    extraAsserts,
    enablePerBlockSymtabs,
} from "./floughGroup";
import {
    MrNarrow,
} from "./floughGroup2";
import { IDebug } from "./mydebug";
import { dbgFloughSymtabToStrings } from "./floughSymtab";

var mrNarrow: MrNarrow;
var symbolFlowInfoMap: SymbolFlowInfoMap;
export function initializeFlowGroupRefTypesSymtabModule(mrNarrowIn: MrNarrow) {
    mrNarrow = mrNarrowIn;
    symbolFlowInfoMap = mrNarrowIn.mrState.symbolFlowInfoMap;
}

export interface RefTypesSymtabProxyI {
    has(symbol: Symbol): boolean;
    get(symbol: Symbol): RefTypesType | undefined;
    set(symbol: Symbol, type: Readonly<RefTypesType>): RefTypesSymtabProxyI;
    // getAsAssigned(symbol: Symbol): RefTypesType | undefined;
    setAsAssigned(symbol: Symbol, type: Readonly<RefTypesType>): RefTypesSymtabProxyI;
    delete(symbol: Symbol): void;
    forEach(f: (type: RefTypesType, symbol: Symbol) => void): void;
    getAssignCount(): number;
    get size(): number;
}
/**
 * RefTypesSymtabProxyType and RefTypesSymtabProxyInnerSymtab need to be exported because getInnerSymtab is exported.
 */
export type RefTypesSymtabProxyType = { type: RefTypesType; assignedType: RefTypesType | undefined; };
export type RefTypesSymtabProxyInnerSymtab = Map<Symbol, RefTypesSymtabProxyType>;

class RefTypesSymtabProxy implements RefTypesSymtabProxyI {
    readonly symtabOuter: Readonly<RefTypesSymtabProxy> | undefined;
    symtabInner: RefTypesSymtabProxyInnerSymtab;
    isSubloop?: boolean;
    loopState?: ProcessLoopState;
    loopGroup?: GroupForFlow;
    assignCount: number;

    constructor(symtabOuter?: Readonly<RefTypesSymtabProxy>, symtabInner?: RefTypesSymtabProxyInnerSymtab, isSubloop?: boolean, loopState?: ProcessLoopState, loopGroup?: GroupForFlow, assignCount?: number) {
        this.assignCount = assignCount ?? 0;
        this.symtabOuter = symtabOuter;
        this.symtabInner = new Map<Symbol, RefTypesSymtabProxyType>(symtabInner);
        if (isSubloop) {
            this.isSubloop = true;
            Debug.assert(loopState && loopGroup);
            this.loopState = loopState;
            this.loopGroup = loopGroup;
        }
        else {
            Debug.assert(!loopState && !loopGroup);
        }
    }
    has(symbol: Symbol): boolean {
        if (this.symtabInner.has(symbol)) return true;
        const sfi = symbolFlowInfoMap.get(symbol);
        if (!sfi) return false;
        if (sfi.isconst) return !!this.symtabOuter?.has(symbol);
        return false;
    }
    /**
     * if no entry in symbolFlowInfoMap, undefined is retuned.
     * If the symbol is in innerSymtab, that type is returned.
     * else if symbolFlowInfo.isconst===true, outerSymbtab is queried.
     * else if symbol in this.loopState.symbolsReadNotAssigned, outerSymtab is queried,
     * else, symbolFlowInfo.effectiveDeclaredType is returned.
     */
    get(symbol: Symbol): RefTypesType | undefined {
        if (!this.isSubloop) {
            Debug.assert(!this.symtabOuter);
            return this.symtabInner.get(symbol)?.type;
        }
        // TODO: move A to after B
        const sfi = symbolFlowInfoMap.get(symbol); // A
        if (!sfi) return undefined; // A
        const pt = this.symtabInner.get(symbol); // B
        if (pt) return pt.type; // B
        if (sfi.isconst) {
            const type = this.symtabOuter?.get(symbol);
            Debug.assert(type);
            this.symtabInner.set(symbol, { type, assignedType: undefined });
            return type;
        }
        if (this.loopState?.invocations !== 0 && this.loopState?.loopConditionCall !== "final") {
            let range: RefTypesType | undefined;
            if (!(range = this.loopState?.symbolsAssignedRange?.get(symbol))) {
                // symbol wasn't assigned in invocation 0, so can be treated like a const
                const type = this.symtabOuter?.get(symbol);
                Debug.assert(type);
                this.symtabInner.set(symbol, { type, assignedType: undefined });
                return type;
            }
            else {
                // symbol was assigned in invocation 0, and the range of that assignment is reflected in the type here
                const outer = this.symtabOuter?.get(symbol);
                const type = outer ? floughTypeModule.unionOfRefTypesType([range, outer]) : range;
                this.symtabInner.set(symbol, { type, assignedType: undefined });
                return type;
            }
        }
        const type = mrNarrow.getEffectiveDeclaredType(sfi);
        this.symtabInner.set(symbol, { type, assignedType: undefined });
        return type;
    }
    /**
     * @param symbol
     * @param type
     * @returns
     */
    set(symbol: Symbol, type: Readonly<RefTypesType>): RefTypesSymtabProxy {
        // NOTE: do NOT try to set pt elements - it is unsafe because someone else could be using the pt object.
        const pt = this.symtabInner.get(symbol);
        this.symtabInner.set(symbol, { type, assignedType: pt?.assignedType ? type : undefined });
        return this;
    }
    setAsAssigned(symbol: Symbol, type: Readonly<RefTypesType>): RefTypesSymtabProxy {
        // NOTE: do NOT try to set pt elements - it is unsafe because someone else could be using the pt object.
        this.assignCount++;
        this.symtabInner.set(symbol, { type, assignedType: type });
        return this;
    }
    getAssignCount(): number {
        return this.assignCount;
    }
    delete(symbol: Symbol): boolean {
        const ret = this.symtabInner.delete(symbol);
        if (this.loopState) {
            this.loopState.symbolsAssigned?.delete(symbol);
            this.loopState.symbolsAssignedRange?.delete(symbol);
        }
        return ret;
    }
    // This function will go away because it is only(*) used is in accumulateSymtabs, which will go away
    // when isSubloop is fully implemented. (*also used for logging). --- actaully accumulate still used for final loop condition, so still required.
    forEach(f: (type: RefTypesType, symbol: Symbol) => void): void {
        this.symtabInner.forEach((pt, s) => f(pt.type, s));
    }
    get size(): number {
        return this.symtabOuter?.size ?? 0 + this.symtabInner.size;
    }
}

export type RefTypesSymtab = RefTypesSymtabProxyI;

export function isRefTypesSymtabConstraintItemNever(sc: Readonly<RefTypesSymtabConstraintItem>): sc is RefTypesSymtabConstraintItemNever {
    return isNeverConstraint(sc.constraintItem);
}
// function isRefTypesSymtabConstraintItemNotNever(sc: Readonly<RefTypesSymtabConstraintItem>): sc is RefTypesSymtabConstraintItemNotNever {
//     return !isNeverConstraint(sc.constraintItem);
// }

function createSubloopRefTypesSymtab(outer: Readonly<RefTypesSymtab>, loopState: ProcessLoopState, loopGroup: Readonly<GroupForFlow>): RefTypesSymtab {
    assertCastType<Readonly<RefTypesSymtabProxy>>(outer);
    return new RefTypesSymtabProxy(outer, undefined, /*isSubloop*/ true, loopState, loopGroup);
}
export function createSubLoopRefTypesSymtabConstraint(outerSC: Readonly<RefTypesSymtabConstraintItem>, loopState: ProcessLoopState, loopGroup: Readonly<GroupForFlow>): RefTypesSymtabConstraintItem {
    if (isRefTypesSymtabConstraintItemNever(outerSC)) return outerSC; // as RefTypesSymtabConstraintItemNever;
    return {
        symtab: createSubloopRefTypesSymtab(outerSC.symtab!, loopState, loopGroup),
        constraintItem: outerSC.constraintItem,
    };
}

function createSuperloopRefTypesSymtab(stin: Readonly<RefTypesSymtab>): RefTypesSymtab {
    const loggerLevel = 1;
    // function getProxyType(symbol: Symbol, st: Readonly<RefTypesSymtabProxy>): RefTypesSymtabProxyType | undefined {
    //     return st.symtabInner.get(symbol) ?? (st.symtabOuter ? getProxyType(symbol, st.symtabOuter) : undefined);
    //  }
    assertCastType<Readonly<RefTypesSymtabProxy>>(stin);
    Debug.assert(!stin.isSubloop || stin.loopState);
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilogGroup(()=>`createSuperloopRefTypesSymtab[in]`, loggerLevel);
        // if (stin.isSubloop){
        //     IDebug.ilog(()=>`createSuperloopRefTypesSymtab[in] idx:${stin.loopGroup?.groupIdx}, invocations${stin.loopState?.invocations}`);
        // }
        dbgRefTypesSymtabToStrings(stin).forEach(str => IDebug.ilog(()=>`createSuperloopRefTypesSymtab[in] stin: ${str}`, loggerLevel));
    }
    if (enablePerBlockSymtabs) {
        //Debug.assert(false);
        IDebug.ilog(()=>`createSuperloopRefTypesSymtab: enablePerBlockSymtabs: true, WARNING: may require changes to support superloop`, 1);
    }
    const stout = copyRefTypesSymtab(stin.symtabOuter!);
    // let symbolsReadNotAssigned: undefined | Set<Symbol>;
    stin.symtabInner.forEach((pt, symbol) => {
        // eslint-disable-next-line prefer-const
        let type = pt.type;
        if (!pt.assignedType) {
            // After changing to simple `stout.set(symbol, type);` is there any need for pt.assignedType
            // const outerType = stin.symtabOuter?.get(symbol);
            // if (outerType) type = mrNarrow.intersectionOfRefTypesType(type,outerType);
            // else stout.set(symbol, type);
            stout.set(symbol, type);
        }
        else {
            stout.setAsAssigned(symbol, type);
        }
    });
    // if (stin.loopState) stin.loopState.symbolsReadNotAssigned = symbolsReadNotAssigned;
    if (IDebug.isActive(loggerLevel)) {
        dbgRefTypesSymtabToStrings(stout).forEach(str => IDebug.ilog(()=>`createSuperloopRefTypesSymtab[out] stout: ${str}`, loggerLevel));
        IDebug.ilogGroupEnd(()=>`createSuperloopRefTypesSymtab[out]`, loggerLevel);
    }
    return stout;
}
export function createSuperloopRefTypesSymtabConstraintItem(sc: Readonly<RefTypesSymtabConstraintItem>): RefTypesSymtabConstraintItem {
    if (isRefTypesSymtabConstraintItemNever(sc)) return sc; // as RefTypesSymtabConstraintItemNever;
    //Debug.assert(!enablePerBlockSymtabs);
    if (enablePerBlockSymtabs){
        IDebug.ilog(()=>`createSuperloopRefTypesSymtabConstraintItem: enablePerBlockSymtabs: true, not using branch() ok ?`, 1);
        return {
            symtab: createSuperloopRefTypesSymtab(sc.symtab!),
            fsymtab: sc.fsymtab,
            constraintItem: sc.constraintItem,
        };
    }
    return {
        symtab: createSuperloopRefTypesSymtab(sc.symtab!),
        constraintItem: sc.constraintItem,
    };
}

export function getSymbolsAssignedRange(that: Readonly<RefTypesSymtab>): WeakMap<Symbol, RefTypesType> | undefined {
    assertCastType<Readonly<RefTypesSymtabProxy>>(that);
    let sar: WeakMap<Symbol, RefTypesType> | undefined;
    that.symtabInner.forEach((pt, s) => {
        if (pt.assignedType) (sar ?? (sar = new WeakMap<Symbol, RefTypesType>())).set(s, pt.assignedType);
    });
    return sar;
}

export function createRefTypesSymtab(): RefTypesSymtab {
    return new RefTypesSymtabProxy();
}
export function createRefTypesSymtabWithEmptyInnerSymtab(templateSymtab: Readonly<RefTypesSymtab> | undefined): RefTypesSymtab {
    Debug.assert(templateSymtab instanceof RefTypesSymtabProxy);
    assertCastType<Readonly<RefTypesSymtabProxy>>(templateSymtab);
    return new RefTypesSymtabProxy(templateSymtab.symtabOuter, undefined, templateSymtab.isSubloop, templateSymtab.loopState, templateSymtab.loopGroup);
}
export function createRefTypesSymtabConstraintWithEmptyInnerSymtab(templatesc: Readonly<RefTypesSymtabConstraintItem>): RefTypesSymtabConstraintItem {
    Debug.assert(!isRefTypesSymtabConstraintItemNever(templatesc));
    if (enablePerBlockSymtabs) Debug.assert(false);
    return {
        symtab: createRefTypesSymtabWithEmptyInnerSymtab(templatesc.symtab),
        constraintItem: { ...templatesc.constraintItem },
    };
}

export function copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab {
    Debug.assert(symtab instanceof RefTypesSymtabProxy);
    assertCastType<Readonly<RefTypesSymtabProxy>>(symtab);
    return new RefTypesSymtabProxy(symtab.symtabOuter, symtab.symtabInner, symtab.isSubloop, symtab.loopState, symtab.loopGroup, symtab.assignCount);
}
export function copyRefTypesSymtabConstraintItem(sc: Readonly<RefTypesSymtabConstraintItem>): RefTypesSymtabConstraintItem {
    if (isRefTypesSymtabConstraintItemNever(sc)) return { constraintItem: { ...sc.constraintItem } };
    if (enablePerBlockSymtabs){
        return {
            symtab: copyRefTypesSymtab(sc.symtab!),
            fsymtab: sc.fsymtab?.branch(),
            constraintItem: { ...sc.constraintItem },
        };
    }
    return {
        symtab: copyRefTypesSymtab(sc.symtab!),
        constraintItem: { ...sc.constraintItem },
    };
}
export function createRefTypesSymtabConstraintItemNever(): RefTypesSymtabConstraintItemNever {
    return { constraintItem: createFlowConstraintNever() };
}
export function createRefTypesSymtabConstraintItemAlways(): RefTypesSymtabConstraintItemNotNever {
    if (enablePerBlockSymtabs) Debug.assert(false, "TODO");
    return { symtab: new RefTypesSymtabProxy(), constraintItem: createFlowConstraintAlways() };
}
/**
 * unionArrRefTypesSymtabV2
 * @param arr
 * Similar to unionArrRefTypesSymtab, but logicalObjects are split and shallow or'd (delayed evaluation),
 * while nobj types are still or'd immediately, but without computing via Type.
 */
export function unionArrRefTypesSymtab(arr: Readonly<RefTypesSymtab>[]): RefTypesSymtab {
    const loggerLevel = 2;
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilogGroup(()=>`unionArrRefTypesSymtabV2[in]`, loggerLevel);
        arr.forEach((rts, i) => {
            dbgRefTypesSymtabToStrings(rts).forEach(str => IDebug.ilog(()=>`unionArrRefTypesSymtabV2[in] symtab[${i}] ${str}`, loggerLevel));
        });
    }
    function unionArrRefTypesSymtab1(): RefTypesSymtab {
        assertCastType<Readonly<RefTypesSymtabProxy>[]>(arr);
        if (arr.length === 0) Debug.fail("unexpected");
        if (arr.length === 1) return arr[0];
        if (extraAsserts) {
            for (let i = 1; i < arr.length; i++) {
                Debug.assert(arr[i - 1].symtabOuter === arr[i].symtabOuter);
            }
        }
        type SplitFTAcc = {
            logobj: Map<FloughLogicalObjectInnerIF, FloughLogicalObjectIF>; // typically not identical, but that is possible
            nobj?: FloughType;
        };
        const mapSymToPType = new Map<Symbol, {
            typeMember?: SplitFTAcc;
            assignedTypeMember?: SplitFTAcc;
        }>();
        arr.forEach(rts => {
            rts.symtabInner.forEach((pt, symbol) => {
                let ptypeGot = mapSymToPType.get(symbol);
                if (!ptypeGot) {
                    ptypeGot = {
                        typeMember: { logobj: new Map(), nobj: undefined },
                        assignedTypeMember: { logobj: new Map(), nobj: undefined },
                    };
                    mapSymToPType.set(symbol, ptypeGot);
                }
                if (pt.type) {
                    const { logicalObject, remaining } = floughTypeModule.splitLogicalObject(pt.type);
                    if (logicalObject) {
                        ptypeGot.typeMember!.logobj.set(floughLogicalObjectModule.getInnerIF(logicalObject), logicalObject);
                    }
                    if (remaining) {
                        ptypeGot.typeMember!.nobj = ptypeGot.typeMember!.nobj ? floughTypeModule.unionWithFloughTypeMutate(remaining, ptypeGot.typeMember!.nobj) : floughTypeModule.cloneType(remaining);
                    }
                }
                if (pt.assignedType) {
                    const { logicalObject, remaining } = floughTypeModule.splitLogicalObject(pt.assignedType);
                    if (logicalObject) {
                        ptypeGot.assignedTypeMember!.logobj.set(floughLogicalObjectModule.getInnerIF(logicalObject), logicalObject);
                    }
                    if (remaining) {
                        ptypeGot.assignedTypeMember!.nobj = ptypeGot.assignedTypeMember!.nobj ? floughTypeModule.unionWithFloughTypeMutate(remaining, ptypeGot.assignedTypeMember!.nobj) : floughTypeModule.cloneType(remaining);
                    }
                }
            });
        });
        // Uses the existing outer symtab (common to all arr[*]), but creates a new inner symtab
        const innerTarget = createRefTypesSymtabWithEmptyInnerSymtab(arr[0]) as RefTypesSymtabProxy;
        assertCastType<Readonly<RefTypesSymtabProxy>>(innerTarget);

        mapSymToPType.forEach(({ typeMember, assignedTypeMember }, symbol) => {
            // c.f. _caxnc-whileLoop-0023 - for all i, s.t. arr[i].symbtabInner does not have symbol, must lookup in symtabOuter
            for (const rts of arr) {
                if (!rts.symtabInner.has(symbol)) {
                    let otype;
                    if (!arr[0].isSubloop) {
                        const symbolFlowInfo = symbolFlowInfoMap.get(symbol);
                        if (!symbolFlowInfo) {
                            Debug.fail("unexpected");
                        }
                        otype = mrNarrow.getEffectiveDeclaredType(symbolFlowInfo);
                    }
                    else {
                        otype = rts.symtabOuter?.get(symbol);
                    }
                    if (otype) {
                        const { logicalObject, remaining } = floughTypeModule.splitLogicalObject(otype);
                        if (!typeMember) typeMember = { logobj: new Map(), nobj: floughTypeModule.createNeverType() };
                        if (logicalObject) typeMember.logobj.set(floughLogicalObjectModule.getInnerIF(logicalObject), logicalObject);
                        if (remaining) typeMember.nobj = typeMember.nobj ? floughTypeModule.unionWithFloughTypeMutate(remaining, typeMember.nobj) : remaining;
                        break; // only need to do at most once per rts of arr
                    }
                }
            }
            let type, assignedType;
            {
                let logobj: FloughLogicalObjectIF | undefined;
                if (typeMember) {
                    if (typeMember.logobj.size) {
                        const arrlogobj: FloughLogicalObjectIF[] = [];
                        typeMember.logobj.forEach(logobj => arrlogobj.push(logobj));
                        logobj = floughLogicalObjectModule.unionOfFloughLogicalObjects(arrlogobj);
                    }
                }
                type = floughTypeModule.createTypeFromLogicalObject(logobj, typeMember?.nobj);
            }
            {
                if (assignedTypeMember) {
                    let logobj: FloughLogicalObjectIF | undefined;
                    if (assignedTypeMember.logobj.size) {
                        const arrlogobj: FloughLogicalObjectIF[] = [];
                        assignedTypeMember.logobj.forEach(logobj => arrlogobj.push(logobj));
                        logobj = floughLogicalObjectModule.unionOfFloughLogicalObjects(arrlogobj);
                    }
                    if (assignedTypeMember.nobj || logobj) assignedType = floughTypeModule.createTypeFromLogicalObject(logobj, assignedTypeMember.nobj);
                }
            }
            innerTarget.symtabInner.set(symbol, { type, assignedType });
        });
        return innerTarget;
    }
    const target = unionArrRefTypesSymtab1();
    {
        if (IDebug.isActive(loggerLevel)) {
            dbgRefTypesSymtabToStrings(target).forEach(str => IDebug.ilog(()=>`unionArrRefTypesSymtab: return: ${str}`, loggerLevel));
            IDebug.ilogGroupEnd(()=>`unionArrRefTypesSymtab[out]`, loggerLevel);
        }
    }
    return target;
} // unionArrRefTypesSymtabV2

export function modifiedInnerSymtabUsingOuterForFinalCondition(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab {
    const loggerLevel = 2;
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilogGroup(()=>`modifiedInnerSymtabUsingOuterForFinalCondition[in]`, loggerLevel);
        dbgRefTypesSymtabToStrings(symtab).forEach(str => IDebug.ilog(()=>`modifiedInnerSymtabUsingOuterForFinalCondition[in] symtab: ${str}`, loggerLevel));
    }
    assertCastType<Readonly<RefTypesSymtabProxy>>(symtab);
    const updates: [Symbol, RefTypesType][] = [];
    symtab.symtabInner.forEach((pt, symbol) => {
        let otype: RefTypesType | undefined;
        if (otype = symtab.symtabOuter!.get(symbol)) {
            if (!symtab.loopState?.symbolsAssignedRange?.has(symbol)) {
                // a priori the inner type can only be a subset of the outer type.
                if (!floughTypeModule.isASubsetOfB(otype, pt.type)) {
                    // pt.type is a strict subset of otype
                    updates.push([symbol, otype]);
                } // else they are equal, do nothing
            }
            else {
                if (floughTypeModule.isASubsetOfB(pt.type, otype)) {
                    if (!floughTypeModule.isASubsetOfB(otype, pt.type)) {
                        updates.push([symbol, otype]);
                    }
                }
                else if (!floughTypeModule.isASubsetOfB(otype, pt.type)) {
                    updates.push([symbol, floughTypeModule.unionOfRefTypesType([pt.type, otype])]);
                }
            }
        }
    });
    let symtab1: RefTypesSymtabProxy;
    if (!updates.length) symtab1 = symtab;
    else {
        symtab1 = copyRefTypesSymtab(symtab) as RefTypesSymtabProxy;
        updates.forEach(([symbol, type]) => symtab1.symtabInner.set(symbol, { type, assignedType: undefined }));
    }
    if (IDebug.isActive(loggerLevel)) {
        dbgRefTypesSymtabToStrings(symtab1).forEach(str => IDebug.ilog(()=>`modifiedInnerSymtabUsingOuterForFinalCondition: symtab: ${str}`, loggerLevel));
        IDebug.ilogGroupEnd(()=>`modifiedInnerSymtabUsingOuterForFinalCondition[out]`, loggerLevel);
    }
    return symtab1;
}
export function getOuterSymtab(symtab: Readonly<RefTypesSymtab>): Readonly<RefTypesSymtab> | undefined {
    return (symtab as RefTypesSymtabProxy).symtabOuter;
}
export function getInnerSymtab(symtab: Readonly<RefTypesSymtab>): Readonly<RefTypesSymtabProxyInnerSymtab> {
    return (symtab as RefTypesSymtabProxy).symtabInner;
}

export function dbgRefTypesSymtabToStrings(x: RefTypesSymtab): string[] {
    assertCastType<RefTypesSymtabProxy>(x);
    const as: string[] = ["["];
    if (x.isSubloop) {
        as.push(`loopGroup?.groupIdx:${x.loopGroup?.groupIdx}, x.loopState?.invocations:${x.loopState?.invocations}`);
        let str = `x.loopState.symbolsAssigned:[`;
        x.loopState!.symbolsAssigned?.forEach(s => {
            str += `${IDebug.dbgs.symbolToString(s)},`;
        });
        str += `]`;
        as.push(str);

        str = `x.loopState.symbolsAssignedRange:[`;
        as.push(str);
        const symbolsDone = new Set<Symbol>();
        x.symtabOuter?.forEach((_pt, s) => {
            symbolsDone.add(s);
            if (x.loopState!.symbolsAssignedRange?.has(s)) {
                const rangeType = x.loopState!.symbolsAssignedRange.get(s)!;
                floughTypeModule.dbgRefTypesTypeToStrings(rangeType).forEach(str1 => as.push(`outer: symbol:${IDebug.dbgs.symbolToString(s)},type:${str1}`));
                // str+=`{symbol:${IDebug.dbgs.symbolToString(s)},type:${floughTypeModule.dbgRefTypesTypeToString(rangeType)}}, `;
            }
        });
        x.symtabInner.forEach((_pt, s) => {
            if (symbolsDone.has(s)) return;
            if (x.loopState!.symbolsAssignedRange?.has(s)) {
                const rangeType = x.loopState!.symbolsAssignedRange.get(s)!;
                floughTypeModule.dbgRefTypesTypeToStrings(rangeType).forEach(str1 => as.push(`inner: symbol:${IDebug.dbgs.symbolToString(s)},type:${str1}`));
                // str+=`{symbol:${IDebug.dbgs.symbolToString(s)},type:${floughTypeModule.dbgRefTypesTypeToString(rangeType)}}, `;
            }
        });
        str += `]`;
        as.push(str);
    }
    x.symtabInner.forEach(({ type, assignedType }, s) => {
        as.push(`  symbol:${IDebug.dbgs.symbolToString(s)}, `);
        floughTypeModule.dbgRefTypesTypeToStrings(type).forEach(str => as.push(`    type:${str}`));
        if (assignedType) floughTypeModule.dbgRefTypesTypeToStrings(assignedType).forEach(str => as.push(`    assignedType:${str}`));
        // + `{ type:${floughTypeModule.dbgRefTypesTypeToString(type)}, assignedType:${assignedType?floughTypeModule.dbgRefTypesTypeToString(type):"<undef>"}}`);
    });
    if (x.symtabOuter) {
        as.push(...dbgRefTypesSymtabToStrings(x.symtabOuter).map(str => `  outer:${str}`));
    }
    as.push("]");
    return as;
}

export function dbgRefTypesSymtabConstrinatItemToStrings(sc: Readonly<RefTypesSymtabConstraintItem>): string[] {
    const as: string[] = ["{"];
    if (!sc.symtab) as.push(`  symtab:<undef>`);
    else dbgRefTypesSymtabToStrings(sc.symtab).forEach(s => as.push(`  symtab: ${s}`));
    if (!sc.fsymtab) as.push(`  fsymtab:<undef>`);
    else dbgFloughSymtabToStrings(sc.fsymtab).forEach(s => as.push(`  fsymtab: ${s}`));

    mrNarrow.dbgConstraintItem(sc.constraintItem).forEach(s => as.push(`  constraintItem: ${s}`));
    as.push(`}`);
    return as;
}
