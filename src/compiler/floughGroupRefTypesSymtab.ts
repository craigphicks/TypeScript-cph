import {
    RefTypesSymtabConstraintItem,
    RefTypesSymtabConstraintItemNever,
} from "./floughTypedefs";
import {
    isNeverConstraint,
    createFlowConstraintNever,
} from "./floughConstraints";
import {
    SymbolFlowInfoMap,
    ProcessLoopState,
    GroupForFlow,
} from "./floughGroup";
import {
    MrNarrow,
} from "./floughGroup2";
import { dbgFloughSymtabToStrings } from "./floughSymtab";

var mrNarrow: MrNarrow;
var symbolFlowInfoMap: SymbolFlowInfoMap;
export function initializeFlowGroupRefTypesSymtabModule(mrNarrowIn: MrNarrow) {
    mrNarrow = mrNarrowIn;
    symbolFlowInfoMap = mrNarrowIn.mrState.symbolFlowInfoMap;
}



export function isRefTypesSymtabConstraintItemNever(sc: Readonly<RefTypesSymtabConstraintItem>): sc is RefTypesSymtabConstraintItemNever {
    return isNeverConstraint(sc.constraintItem);
}
export function createSubLoopRefTypesSymtabConstraint(outerSC: Readonly<RefTypesSymtabConstraintItem>, loopState: ProcessLoopState, loopGroup: Readonly<GroupForFlow>): RefTypesSymtabConstraintItem {
    if (isRefTypesSymtabConstraintItemNever(outerSC)) return outerSC; // as RefTypesSymtabConstraintItemNever;
    return {
        constraintItem: outerSC.constraintItem,
    };
}


export function copyRefTypesSymtabConstraintItem(sc: Readonly<RefTypesSymtabConstraintItem>): RefTypesSymtabConstraintItem {
    if (isRefTypesSymtabConstraintItemNever(sc)) return { constraintItem: { ...sc.constraintItem } };
    return {
        fsymtab: sc.fsymtab?.branch(),
        constraintItem: { ...sc.constraintItem },
    };
}
export function createRefTypesSymtabConstraintItemNever(): RefTypesSymtabConstraintItemNever {
    return { constraintItem: createFlowConstraintNever() };
}



export function dbgRefTypesSymtabConstrinatItemToStrings(sc: Readonly<RefTypesSymtabConstraintItem>): string[] {
    const as: string[] = ["{"];
    if (!sc.fsymtab) as.push(`  fsymtab:<undef>`);
    else dbgFloughSymtabToStrings(sc.fsymtab).forEach(s => as.push(`  fsymtab: ${s}`));

    mrNarrow.dbgConstraintItem(sc.constraintItem).forEach(s => as.push(`  constraintItem: ${s}`));
    as.push(`}`);
    return as;
}
