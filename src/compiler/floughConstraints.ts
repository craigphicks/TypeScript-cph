/* eslint-disable no-null/no-null */
//import { BranchKind, FloughFlags, FloughLabel, FloughNode, FlowExpressionStatement, SourceFileWithFloughNodes } from "./floughTsExtensions";

import {
    Debug,
} from "./debug";
import {
    RefTypesType,
    floughTypeModule,
} from "./floughType";
import {
    ConstraintItem,
    ConstraintItemKind,
    ConstraintItemNever,
    ConstraintItemNotNever,
    ConstraintItemAlways,
    RefTypesSymtabConstraintItem,
    RefTypesSymtabConstraintItemNotNever,
} from "./floughTypedefs";
import {
    MrNarrow,
} from "./floughGroup2";
import {
    createRefTypesSymtabConstraintItemNever,
    isRefTypesSymtabConstraintItemNever,
} from "./floughGroupRefTypesSymtab";
import { IDebug } from "./mydebug";
import {
    SymbolFlags,
    Symbol,
} from "./types";
import { dbgFloughSymtabToStrings, unionFloughSymtab } from "./floughSymtab";

// @ ts-expect-error
export type GetDeclaredTypeFn = (symbol: Symbol) => RefTypesType;

export function createFlowConstraintNever(): ConstraintItemNever {
    return { kind: ConstraintItemKind.never };
}

export function isNeverConstraint(c: ConstraintItem): c is ConstraintItemNever {
    return (c.kind === ConstraintItemKind.never);
}
export function isNotNeverConstraint(c: ConstraintItem): c is ConstraintItemNotNever {
    return (c.kind !== ConstraintItemKind.never);
}
export function createFlowConstraintAlways(): ConstraintItemAlways {
    return { kind: ConstraintItemKind.always };
}
export function isAlwaysConstraint(c: ConstraintItem): boolean {
    return (c.kind === ConstraintItemKind.always);
}

export function orSymtabConstraints(asc: Readonly<RefTypesSymtabConstraintItem>[], omitFloughSymtab?: boolean): RefTypesSymtabConstraintItem {
    if (asc.length === 0) Debug.fail("unexpected"); // return { symtab: createRefTypesSymtab(), constraintItem: createFlowConstraintNever() };
    if (asc.length === 1) return omitFloughSymtab ? { /*symtab: asc[0].symtab,*/ constraintItem: asc[0].constraintItem} : asc[0];
    const asc1 = asc.filter(sc => !isNeverConstraint(sc.constraintItem));
    if (asc1.length === 0) return createRefTypesSymtabConstraintItemNever(); // assuming or of nevers is never
    if (asc1.length === 1) return omitFloughSymtab ? { /*symtab: asc1[0].symtab,*/ constraintItem: asc1[0].constraintItem} : asc1[0];
    if (!omitFloughSymtab) {
        const fsymtab = unionFloughSymtab((asc1 as RefTypesSymtabConstraintItemNotNever[]).map(x => x.fsymtab!));
        return { fsymtab, constraintItem: createFlowConstraintAlways() };
    }
    return { constraintItem: createFlowConstraintAlways() };
}

export function andSymbolTypeIntoSymtabConstraint({ symbol, isconst, isAssign, type: typeIn, sc, mrNarrow, getDeclaredType: _ }: Readonly<{
    symbol: Readonly<Symbol>;
    readonly isconst: undefined | boolean;
    readonly isAssign?: boolean | undefined;
    type: Readonly<RefTypesType>;
    sc: RefTypesSymtabConstraintItem;
    getDeclaredType: GetDeclaredTypeFn;
    mrNarrow: MrNarrow;
}>): { type: RefTypesType; sc: RefTypesSymtabConstraintItem; } {
    const loggerLevel = 2;
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilogGroup(()=>`andSymbolTypeIntoSymtabConstraint[in] symbol:${IDebug.dbgs.symbolToString(symbol)}, isconst:${isconst}, isAssigned: ${isAssign}}`,loggerLevel);
        floughTypeModule.dbgRefTypesTypeToStrings(typeIn).forEach(s => IDebug.ilog(()=>`andSymbolTypeIntoSymtabConstraint[begin], typeIn: ${s}`,loggerLevel));
        //dbgRefTypesSymtabConstrinatItemToStrings(sc).forEach(s => IDebug.ilog(()=>`andSymbolTypeIntoSymtabConstraint[begin] sc: ${s}`,loggerLevel));
    }
    if (isRefTypesSymtabConstraintItemNever(sc)) {
        if (IDebug.isActive(loggerLevel)) {
            IDebug.ilogGroupEnd(()=>`andSymbolTypeIntoSymtabConstraint[out] isconst:${isconst}, isAssigned: ${isAssign}}, sc out: never`, loggerLevel);
        }
        return { type: floughTypeModule.createRefTypesType(), sc };
    }

    const constraintItem = sc.constraintItem;
    Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
    Debug.assert(sc.fsymtab);
    let fsymtab = sc.fsymtab;
    let typeOut = typeIn;
    if (symbol.flags & (SymbolFlags.ConstEnum | SymbolFlags.RegularEnum)) {
        // do nothing - an enum parent is not a real type
    }
    else if (!fsymtab) {
        Debug.assert(isRefTypesSymtabConstraintItemNever(sc));
    }
    else {
        if (isAssign) {
            fsymtab = fsymtab!.branch().setAsAssigned(symbol, typeIn);
        }
        else {
            let type = fsymtab.get(symbol);
            if (type) {
                typeOut = floughTypeModule.intersectionWithFloughTypeSpecial(type, typeIn);
                if (!floughTypeModule.equalRefTypesTypes(typeOut, type)) {
                    fsymtab = fsymtab!.branch().set(symbol, typeOut);
                }
            }
            else {
                fsymtab = fsymtab!.branch().set(symbol, typeIn);
            }
        }
    }
    if (IDebug.isActive(loggerLevel)) {
        let str = "andSymbolTypeIntoSymtabConstraint[end] symtab:";
        if (!fsymtab) str += "<undef>";
        else {
            dbgFloughSymtabToStrings(fsymtab!).forEach(s => IDebug.ilog(()=>`andSymbolTypeIntoSymtabConstraint[end] fsymtab: ${s}`,loggerLevel));
        }
        IDebug.ilog(()=>str,loggerLevel);
        mrNarrow.dbgConstraintItem(constraintItem).forEach(s => {
            IDebug.ilog(()=>"andSymbolTypeIntoSymtabConstraint: constraints: " + s, loggerLevel);
        });
        IDebug.ilogGroupEnd(()=>"andSymbolTypeIntoSymtabConstraint[out]",loggerLevel);
    }
    return { type: typeOut, sc: { fsymtab, constraintItem } };
}


