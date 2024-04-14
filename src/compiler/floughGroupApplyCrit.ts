import {
    Node,
    Symbol,
    TypeChecker,
    Type,
    UnionReduction,
} from "./types";
import {
    Debug,
} from "./debug";
import {
    TypeFacts,
} from "./checker";
import {
    logicalObjectAccessModule,
} from "./floughLogicalObjectInner";
import {
    floughTypeModule,
    FloughType,
    RefTypesType,
} from "./floughType";
import {
    enablePerBlockSymtabs,
    extraAsserts,
} from "./floughGroup";
import {
    MrNarrow,
} from "./floughGroup2";
import { RefTypesTableReturnNoSymbol, FloughCrit, FloughCritKind, RefTypesTableReturn, NodeToTypeMap, FloughReturn, RefTypesSymtabConstraintItem, LogicalObjecAccessData, RefTypesSymtabConstraintItemNotNever, assertCastType } from "./floughTypedefs";
import { GetDeclaredTypeFn, andSymbolTypeIntoSymtabConstraint, orSymtabConstraints } from "./floughConstraints";
import { createRefTypesSymtabConstraintItemNever, isRefTypesSymtabConstraintItemNever, copyRefTypesSymtabConstraintItem } from "./floughGroupRefTypesSymtab";
import { FloughTypeChecker } from "./floughTypedefs"
import { IDebug } from "./mydebug";

var checker: FloughTypeChecker;
var getDeclaredType: GetDeclaredTypeFn;
var mrNarrow: MrNarrow;

export function initFloughGroupApplyCrit(checkerIn: FloughTypeChecker, mrNarrowIn: MrNarrow): void {
    checker = checkerIn;
    mrNarrow = mrNarrowIn;
    getDeclaredType = mrNarrowIn.getEffectiveDeclaredTypeFromSymbol;
}

function createNever(): RefTypesTableReturnNoSymbol {
    return {
        type: floughTypeModule.createRefTypesType(),
        sci: createRefTypesSymtabConstraintItemNever(),
    };
}



export type CritToTypeV2Result = FloughType | undefined;
export function applyCritToTypeV2(rt: Readonly<FloughType>, crit: Readonly<FloughCrit>): { pass: CritToTypeV2Result; fail?: CritToTypeV2Result; } {
    const { logicalObject, remaining } = floughTypeModule.splitLogicalObject(rt);
    const arrtstype = floughTypeModule.getTsTypesFromFloughType(remaining);

    function worker(crit: Readonly<FloughCrit>) {
        if (crit.kind === FloughCritKind.truthy) {
            const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
            const arrpass: Type[] = arrtstype.filter(t => (checker.getTypeFacts(t, pfacts) & pfacts));
            const logobjpass = crit.negate ? undefined : logicalObject;
            if (logobjpass) {
                if (arrpass.length === arrtstype.length) return rt;
                if (arrpass.length === 0) return floughTypeModule.createTypeFromLogicalObject(logobjpass);
                return floughTypeModule.createFromTsTypes(arrpass, logobjpass);
            }
            else {
                return floughTypeModule.createFromTsTypes(arrpass);
            }
        }
        else Debug.fail("not yet implemented: " + crit.kind);
    }

    const ret: ReturnType<typeof applyCritToTypeV2> = {
        pass: worker(crit),
    };
    if (crit.alsoFailing) ret.fail = worker({ ...crit, negate: !crit.negate } as Readonly<FloughCrit>);
    (crit as any).done = true;
    return ret;
}

function applyCritToTypeMutate(rt: Readonly<RefTypesType>, crit: Readonly<FloughCrit>, passtype: RefTypesType, failtype?: RefTypesType | undefined): void {
    Debug.assert(!crit.done);
    Debug.assert(crit.kind !== FloughCritKind.none);
    if (crit.kind === FloughCritKind.truthy) {
        if (crit.alsoFailing) {
            const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
            const ffacts = !crit.negate ? TypeFacts.Falsy : TypeFacts.Truthy;
            floughTypeModule.forEachRefTypesTypeType(rt, t => {
                const tf = checker.getTypeFacts(t, TypeFacts.Truthy | TypeFacts.Falsy);
                if (tf & pfacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t, passtype);
                if (tf & ffacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t, failtype!);
            });
        }
        else {
            const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
            floughTypeModule.forEachRefTypesTypeType(rt, t => {
                const tf = checker.getTypeFacts(t, TypeFacts.Truthy | TypeFacts.Falsy);
                if (tf & pfacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t, passtype);
            });
        }
    }
    else if (crit.kind === FloughCritKind.notnullundef) {
        const pfacts = !crit.negate ? TypeFacts.NEUndefinedOrNull : TypeFacts.EQUndefinedOrNull;
        const ffacts = !crit.negate ? TypeFacts.EQUndefinedOrNull : TypeFacts.NEUndefinedOrNull;
        floughTypeModule.forEachRefTypesTypeType(rt, t => {
            const tf = checker.getTypeFacts(t, TypeFacts.NEUndefinedOrNull | TypeFacts.EQUndefinedOrNull);
            if (tf & pfacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t, passtype);
            if (failtype && tf & ffacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t, failtype);
        });
    }
    else if (crit.kind === FloughCritKind.assignable) {
        const assignableRelation = checker.getRelations().assignableRelation;
        floughTypeModule.forEachRefTypesTypeType(rt, source => {
            let rel = checker.isTypeRelatedTo(source, crit.target, assignableRelation);
            if (crit.negate) rel = !rel;
            if (rel) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(source, passtype);
            else if (failtype) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(source, failtype);
        });
    }
    else if (crit.kind === FloughCritKind.subtype) {
        const subtypeRelation = checker.getRelations().subtypeRelation;
        floughTypeModule.forEachRefTypesTypeType(rt, source => {
            let rel = checker.isTypeRelatedTo(source, crit.target, subtypeRelation);
            if (crit.negate) rel = !rel;
            if (rel) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(source, passtype);
            else if (failtype) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(source, failtype);
        });
    }
    else {
        // @ts-ignore
        Debug.fail("unexpected ", () => crit.kind);
    }
}

export type SymbolWithAttributes = { symbol: Symbol; isconst: boolean | undefined; isAssign?: boolean; };

export function getSymbolIfUnique(arrRttr: Readonly<RefTypesTableReturn[]>): { symbol: Symbol; isconst: boolean | undefined; isAssign?: boolean; } | undefined {
    const length = arrRttr.length;
    if (length === 0) return undefined;
    if (!arrRttr[0].symbol) return undefined;
    const { symbol, isconst: isconst, isAssign } = arrRttr[0];
    if (length === 1) return { symbol, isconst, isAssign };
    for (let i = 1; i !== length; i++) {
        if (arrRttr[i].symbol !== symbol) return undefined;
    }
    return { symbol, isconst, isAssign };
}

/**
 * Note: search for orTsTypesIntoNodeToTypeMap for another path to setting nodeToTypeMap
 * @param type
 * @param node
 * @param nodeToTypeMap
 */
export function orIntoNodeToTypeMap(type: Readonly<RefTypesType>, node: Node, nodeToTypeMap: NodeToTypeMap) {
    const loggerLevel = 2;
    const tstype = floughTypeModule.getTsTypeFromFloughType(type, /*forNodeToTypeMap*/ true);
    const got = nodeToTypeMap.get(node);
    if (!got) nodeToTypeMap.set(node, tstype);
    else nodeToTypeMap.set(node, checker.getUnionType([got, tstype], UnionReduction.Literal));
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilog(()=>
            `orIntoNodeToTypeMap(node:${IDebug.dbgs.nodeToString(node)}, type:${floughTypeModule.dbgFloughTypeToString(type)}) :: `
                + `${got ? IDebug.dbgs.typeToString(got) : "*"} -> ${IDebug.dbgs.typeToString(nodeToTypeMap.get(node))}`,
            loggerLevel
        );
    }
}

/**
 * @param rttr
 * @param nodeForMap
 * @param nodeToTypeMap
 * @returns RefTypesTableReturnNoSymbol
 */
export function applyCritNoneToOne(rttr: Readonly<RefTypesTableReturn>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined /*, andIntoSymtab?: boolean*/): RefTypesTableReturnNoSymbol {
    if (!rttr.symbol) {
        if (nodeToTypeMap) orIntoNodeToTypeMap(rttr.type, nodeForMap, nodeToTypeMap);
        return rttr;
    }
    const { type, sc } = andSymbolTypeIntoSymtabConstraint({ symbol: rttr.symbol, isconst: rttr.isconst, isAssign: rttr.isAssign, type: rttr.type, sc: rttr.sci, mrNarrow, getDeclaredType });
    if (nodeToTypeMap) orIntoNodeToTypeMap(type, nodeForMap, nodeToTypeMap);
    // if (enablePerBlockSymtabs) {
    //     Debug.assert(!sc.symtab || sc.fsymtab);
    // }
    return {
        type,
        sci: sc,
    };
}

export function applyCritNoneUnion(x: Readonly<FloughReturn>, nodeToTypeMap: NodeToTypeMap | undefined): RefTypesTableReturnNoSymbol {
    return applyCritNone1Union(x.unmerged, x.nodeForMap, nodeToTypeMap);
}
export function applyCritNone1Union(arrRttr: Readonly<RefTypesTableReturn[]>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): RefTypesTableReturnNoSymbol {
    if (arrRttr.length === 0) return createNever();
    if (arrRttr.length === 1) return applyCritNoneToOne(arrRttr[0], nodeForMap, nodeToTypeMap);

    const atype: RefTypesType[] = [];
    const asc: RefTypesSymtabConstraintItem[] = [];

    arrRttr.forEach((rttr, _rttridx) => {
        let type: RefTypesType;
        let sc: RefTypesSymtabConstraintItem;
        if (rttr.symbol) {
            ({ type, sc } = andSymbolTypeIntoSymtabConstraint({ symbol: rttr.symbol, isconst: rttr.isconst, isAssign: rttr.isAssign, type: rttr.type, getDeclaredType, sc: rttr.sci, mrNarrow }));
            if (floughTypeModule.isNeverType(type)) return;
            if (extraAsserts) {
                Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
            }
            atype.push(type);
            asc.push(sc);
        }
        else {
            if (floughTypeModule.isNeverType(rttr.type)) return;
            if (extraAsserts) {
                Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
            }
            atype.push(rttr.type);
            asc.push(rttr.sci);
        }
    });
    const type = floughTypeModule.unionOfRefTypesType(atype);
    if (nodeToTypeMap) orIntoNodeToTypeMap(type, nodeForMap, nodeToTypeMap);
    const sci = orSymtabConstraints(asc /*,mrNarrow*/);
    // if (enablePerBlockSymtabs) {
    //     Debug.assert(!sci.symtab || sci.fsymtab);
    // }
    return {
        type,
        sci,
    };
}

export function resolveLogicalObjectAccessData(load: LogicalObjecAccessData, sc: RefTypesSymtabConstraintItem, type: FloughType): {
    type: FloughType;
    sc: RefTypesSymtabConstraintItem;
} {
    let typeOut = type;
    let scOut = sc;
    const loar = load.logicalObjectAccessReturn;
    const symbol = logicalObjectAccessModule.getSymbol(loar);
    if (symbol) {
        const { type: objType, sci } = logicalObjectAccessModule.modifyOne(
            loar,
            load.finalTypeIdx,
            type,
        );
        if (!floughTypeModule.isNeverType(objType)) {
            scOut = copyRefTypesSymtabConstraintItem(sci); // copyRefTypesSymtabConstraintItem(sc);
            //scOut.symtab!.set(symbol, objType);
            if (enablePerBlockSymtabs) {
                scOut.fsymtab!.set(symbol, objType);
            }
        }
        else {
            typeOut = floughTypeModule.getNeverType();
            scOut = createRefTypesSymtabConstraintItemNever();
        }
    }
    else {
        // Do nothing
    }
    // if (enablePerBlockSymtabs) {
    //     Debug.assert(!scOut.symtab || scOut.fsymtab);
    // }
    return { type: typeOut, sc: scOut };
}

export function applyCrit(x: Readonly<FloughReturn>, crit: Readonly<FloughCrit>, nodeToTypeMap: NodeToTypeMap | undefined): {
    passing: RefTypesTableReturnNoSymbol;
    failing?: RefTypesTableReturnNoSymbol | undefined;
} {
    return applyCrit1(x.unmerged, crit, x.nodeForMap, nodeToTypeMap);
}

export function applyCrit1ToOne(rttr: Readonly<RefTypesTableReturn>, crit: Readonly<FloughCrit>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): {
    passing: RefTypesTableReturnNoSymbol;
    failing?: RefTypesTableReturnNoSymbol | undefined;
} {
    Debug.assert(!crit.done);

    if (nodeToTypeMap) orIntoNodeToTypeMap(rttr.type, nodeForMap, nodeToTypeMap);
    if (floughTypeModule.isNeverType(rttr.type)) {
        if (extraAsserts) {
            Debug.assert(isRefTypesSymtabConstraintItemNever(rttr.sci));
        }
        (crit as FloughCrit).done = true; // note: overriding readonly
        return {
            passing: createNever(),
            failing: createNever(),
        };
    }
    if (extraAsserts) {
        Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
    }
    let passtype = floughTypeModule.createRefTypesType();
    let failtype = crit.alsoFailing ? floughTypeModule.createRefTypesType() : undefined;
    applyCritToTypeMutate(rttr.type, crit, passtype, failtype);
    let passsc = rttr.sci;
    let failsc = crit.alsoFailing ? rttr.sci : undefined;
    if (rttr.symbol) {
        ({ type: passtype, sc: passsc } = andSymbolTypeIntoSymtabConstraint({
            symbol: rttr.symbol,
            type: passtype,
            isconst: rttr.isconst,
            isAssign: rttr.isAssign,
            sc: passsc,
            getDeclaredType,
            mrNarrow,
        }));
        if (crit.alsoFailing) {
            ({ type: failtype, sc: failsc } = andSymbolTypeIntoSymtabConstraint({
                symbol: rttr.symbol,
                type: failtype!,
                isconst: rttr.isconst,
                isAssign: rttr.isAssign,
                sc: failsc!,
                getDeclaredType,
                mrNarrow,
            }));
        }
    }
    let passing: RefTypesTableReturnNoSymbol;
    let failing: RefTypesTableReturnNoSymbol | undefined;

    if (floughTypeModule.isNeverType(passtype)) passing = createNever();
    else {
        if (rttr.logicalObjectAccessData) {
            ({ type: passtype, sc: passsc } = resolveLogicalObjectAccessData(rttr.logicalObjectAccessData, passsc, passtype));
        }
        passing = {
            type: passtype,
            sci: passsc,
        };
    }
    if (crit.alsoFailing && floughTypeModule.isNeverType(failtype!)) failing = createNever();
    else if (crit.alsoFailing) {
        if (rttr.logicalObjectAccessData) {
            ({ type: failtype, sc: failsc } = resolveLogicalObjectAccessData(rttr.logicalObjectAccessData, failsc!, failtype!));
        }
        failing = {
            type: failtype!,
            sci: failsc!,
        };
    }
    (crit as FloughCrit).done = true; // note: overriding readonly
    // if (enablePerBlockSymtabs) {
    //     Debug.assert(!passing.sci.symtab || passing.sci.fsymtab);
    //     Debug.assert(!failing || !failing.sci.symtab || failing.sci.fsymtab);
    // }

    return { passing, failing };
}

function applyCrit1(arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<FloughCrit>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): {
    passing: RefTypesTableReturnNoSymbol;
    failing?: RefTypesTableReturnNoSymbol | undefined;
} {
    const loggerLevel = 2;
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilogGroup(()=>`applyCrit1[in]`, loggerLevel);
    }
    const ret = (() => {
        if (arrRttr.length === 0) return { passing: createNever(), failing: crit.alsoFailing ? createNever() : undefined };
        if (arrRttr.length === 1) {
            Debug.assert(!arrRttr[0].critsense);
            return applyCrit1ToOne(arrRttr[0], crit, nodeForMap, nodeToTypeMap);
        }
        if (arrRttr.length === 2 && (arrRttr[0].critsense || arrRttr[1].critsense)) {
            if (extraAsserts) {
                Debug.assert(arrRttr[0].critsense === "passing" && arrRttr[1].critsense === "failing");
            }
            const passing = applyCritNoneToOne(arrRttr[0], nodeForMap, nodeToTypeMap, /*andIntoSymtab*/ /*true*/);
            const failing = applyCritNoneToOne(arrRttr[1], nodeForMap, nodeToTypeMap, /*andIntoSymtab*/ /*true*/);
            return { passing, failing };
        }
        const arrPassType: RefTypesType[] = [];
        const arrFailType: RefTypesType[] = [];
        const arrPassSC: RefTypesSymtabConstraintItemNotNever[] = [];
        const arrFailSC: RefTypesSymtabConstraintItemNotNever[] = [];
        arrRttr.forEach((rttr, _rttridx) => {
            if (IDebug.isActive(loggerLevel)) {
                IDebug.ilog(()=>`applyCrit1[dbg,rttridx:${_rttridx}]`, loggerLevel);
                mrNarrow.dbgRefTypesTableToStrings(rttr).forEach(s => {
                    IDebug.ilog(()=>`applyCrit1[dbg,rttridx:${_rttridx}] rttr: ${s}`, loggerLevel);
                });
            }
            if (floughTypeModule.isNeverType(rttr.type)) {
                if (extraAsserts) {
                    Debug.assert(isRefTypesSymtabConstraintItemNever(rttr.sci));
                }
                return;
            }
            if (extraAsserts) {
                Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
            }
            let passtype = floughTypeModule.createRefTypesType();
            let failtype = crit.alsoFailing ? floughTypeModule.createRefTypesType() : undefined;
            applyCritToTypeMutate(rttr.type, crit, passtype, failtype);
            if (IDebug.isActive(loggerLevel)) {
                floughTypeModule.dbgFloughTypeToStrings(passtype).forEach(s => {
                    IDebug.ilog(()=>`applyCrit1[dbg,rttridx:${_rttridx}] passtype@0: ${s}`, loggerLevel);
                });
            }

            if (!floughTypeModule.isNeverType(passtype)) {
                let passsc = rttr.sci;
                if (rttr.symbol) {
                    ({ type: passtype, sc: passsc } = andSymbolTypeIntoSymtabConstraint({
                        symbol: rttr.symbol,
                        type: passtype,
                        isconst: rttr.isconst,
                        isAssign: rttr.isAssign,
                        sc: passsc,
                        getDeclaredType,
                        mrNarrow,
                    }));
                }
                if (rttr.logicalObjectAccessData) {
                    ({ type: passtype, sc: passsc } = resolveLogicalObjectAccessData(rttr.logicalObjectAccessData, passsc, passtype));
                }
                if (IDebug.isActive(loggerLevel)) {
                    floughTypeModule.dbgFloughTypeToStrings(passtype).forEach(s => {
                        IDebug.ilog(()=>`applyCrit1[dbg,rttridx:${_rttridx}] passtype@1: ${s}`, loggerLevel);
                    });
                }
                if (IDebug.isActive(loggerLevel)) {
                    floughTypeModule.dbgFloughTypeToStrings(passtype).forEach(s => {
                        IDebug.ilog(()=>`applyCrit1[dbg,rttridx:${_rttridx}] passtype@2: ${s}`, loggerLevel);
                    });
                }
                if (!floughTypeModule.isNeverType(passtype)) {
                    arrPassType.push(passtype);
                    arrPassSC.push(passsc as RefTypesSymtabConstraintItemNotNever);
                }
            }
            if (crit.alsoFailing) {
                assertCastType<FloughType>(failtype);
                if (IDebug.isActive(loggerLevel)) {
                    floughTypeModule.dbgFloughTypeToStrings(failtype).forEach(s => {
                        IDebug.ilog(()=>`applyCrit1[dbg,rttridx:${_rttridx}] failtype@0: ${s}`, loggerLevel);
                    });
                }
                if (!floughTypeModule.isNeverType(failtype)) {
                    let failsc = rttr.sci;
                    if (rttr.symbol) {
                        ({ type: failtype, sc: failsc } = andSymbolTypeIntoSymtabConstraint({
                            symbol: rttr.symbol,
                            type: failtype,
                            isconst: rttr.isconst,
                            isAssign: rttr.isAssign,
                            sc: failsc,
                            getDeclaredType,
                            mrNarrow,
                        }));
                    }
                    if (rttr.logicalObjectAccessData) {
                        ({ type: failtype, sc: failsc } = resolveLogicalObjectAccessData(rttr.logicalObjectAccessData, failsc, failtype));
                    }
                    if (IDebug.isActive(loggerLevel)) {
                        floughTypeModule.dbgFloughTypeToStrings(failtype).forEach(s => {
                            IDebug.ilog(()=>`applyCrit1[dbg,rttridx:${_rttridx}] failtype@1: ${s}`, loggerLevel);
                        });
                    }
                    if (IDebug.isActive(loggerLevel)) {
                        floughTypeModule.dbgFloughTypeToStrings(failtype).forEach(s => {
                            IDebug.ilog(()=>`applyCrit1[dbg,rttridx:${_rttridx}] failtype@2: ${s}`, loggerLevel);
                        });
                    }
                    if (!floughTypeModule.isNeverType(failtype)) {
                        arrFailType.push(failtype);
                        arrFailSC.push(failsc as RefTypesSymtabConstraintItemNotNever);
                    }
                }
            }
        });
        let passing: RefTypesTableReturnNoSymbol;
        let failing: RefTypesTableReturnNoSymbol | undefined;
        if (arrPassType.length === 0) passing = createNever();
        else {
            passing = {
                type: floughTypeModule.unionOfRefTypesType(arrPassType),
                sci: orSymtabConstraints(arrPassSC /*,mrNarrow*/),
            };
        }
        if (crit.alsoFailing) {
            if (arrFailType.length === 0) failing = createNever();
            else {
                failing = {
                    type: floughTypeModule.unionOfRefTypesType(arrFailType),
                    sci: orSymtabConstraints(arrFailSC /*,mrNarrow*/),
                };
            }
        }
        if (nodeToTypeMap) {
            const typeForNodeMap = failing ? floughTypeModule.unionOfRefTypesType([passing.type, failing.type]) : passing.type;
            orIntoNodeToTypeMap(typeForNodeMap, nodeForMap, nodeToTypeMap);
        }
        return { passing, failing };
    })();
    if (IDebug.isActive(loggerLevel)) {
        // dbg ret.passing
        IDebug.ilogGroupEnd(()=>`applyCrit1[out]`, loggerLevel);
    }
    // if (enablePerBlockSymtabs) {
    //     Debug.assert(!ret.passing.sci.symtab || ret.passing.sci.fsymtab);
    //     Debug.assert(!ret.failing || !ret.failing.sci.symtab || ret.failing.sci.fsymtab);
    // }
    return ret;
}
