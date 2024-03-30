import {
    Debug,
} from "./debug";
import { BranchKind, FloughFlags, FloughLabel, FloughNode, FlowExpressionStatement, SourceFileWithFloughNodes } from "./floughTsExtensions";
import {
    Node,
    FlowLabel,
    //FlowNode,
    //SourceFile,
    Type,
    Expression,
    CompilerOptions,
    SyntaxKind,
    CommentRange,
    SymbolTable,
    IterationStatement,
    Block,
    Identifier,
    Symbol,
    LocalsContainer,
    TypeChecker as TSTypeChecker
} from "./types";
import {
    getLeadingCommentRangesOfNode,
} from "./utilities";

import {
    initFloughLogicalObjectInner,
} from "./floughLogicalObjectInner";
import {
    initFloughLogicalObjectOuter,
} from "./floughLogicalObjectOuter";
import {
    RefTypesType,
    initFloughTypeModule,
} from "./floughType";
import {
    RefTypesSymtabConstraintItem,
    ConstraintItem,
    NodeToTypeMap,
    ReplayableItem,
    FloughStatus,
    TypeCheckerFn,
    RefTypesSymtabConstraintItemNotNever,
    assertCastType,
    ConstraintItemNotNever,
    FloughCrit,
    FloughCritKind,
} from "./floughTypedefs";
import {
    orSymtabConstraints,
    createFlowConstraintNever,
    createFlowConstraintAlways,
} from "./floughConstraints";
import {
    MrNarrow,
    createMrNarrow,
} from "./floughGroup2";
import {
    initFloughGroupApplyCrit,
    applyCritNoneUnion,
    applyCrit,
} from "./floughGroupApplyCrit";
import {
    initializeFlowGroupRefTypesSymtabModule,
    createSubLoopRefTypesSymtabConstraint,
    getSymbolsAssignedRange,
    isRefTypesSymtabConstraintItemNever,
    modifiedInnerSymtabUsingOuterForFinalCondition,
    RefTypesSymtab,
    copyRefTypesSymtab,
    createSuperloopRefTypesSymtabConstraintItem,
    createRefTypesSymtab,
    copyRefTypesSymtabConstraintItem,
} from "./floughGroupRefTypesSymtab";
import {
    dbgFlowGroupLabelToStrings,
    dbgGroupsForFlowToStrings,
    getFlowAntecedents,
    makeGroupsForFlow,
} from "./floughNodesGrouping";
import {
    defineOneIndexingHeaper,
} from "./floughHeaper";
import { IDebug } from "./mydebug";
import {
    FloughTypeChecker,
} from "./floughTypedefs";
import { dbgFlowToString, flowNodesToString } from "./floughNodesDebugWrite";
import { sys } from "./sys";
import { FloughSymtab, createFloughSymtab, dbgFloughSymtabToStrings, floughSymtabRollupLocalsScope, floughSymtabRollupToAncestor, initFloughSymtab } from "./floughSymtab";

export const extraAsserts = true; // not suitable for release or timing tests.
const hardCodeEnableTSDevExpectStringFalse = false; // gated with extraAsserts

export const refactorConnectedGroupsGraphs = true;
export const refactorConnectedGroupsGraphsUpdateHeapWithConnectedGroupsGraph = refactorConnectedGroupsGraphs && true;
export const refactorConnectedGroupsGraphsGroupDependancyCountRemaining = refactorConnectedGroupsGraphs && true;
export const refactorConnectedGroupsGraphsNoShallowRecursion = refactorConnectedGroupsGraphs && false;

/**
 * enableBypassEffectiveDeclaredType allows more detailed description of the state at each node.
 * However, it also causes named types to possibly not use the name even if the type is the full named type.
 */
export const enableBypassEffectiveDeclaredType = true;

export const enablePerBlockSymtabs = !!Number(process.env.enablePerBlockSymtabs ?? 0);

export enum GroupForFlowKind {
    none = "none",
    plain = "plain",
    ifexpr = "ifexpr",
    loop = "loop",
}
export enum FlowGroupLabelKind {
    none = "none",
    ref = "ref",
    then = "then",
    else = "else",
    postIf = "postIf",
    loop = "loop",
    loopThen = "loopThen",
    postLoop = "postLoop",
    start = "start",
    block = "block",
    postBlock = "postBlock",
}
export interface FlowGroupLabelBase {
    kind: FlowGroupLabelKind;
}
export type FlowGroupLabelNone = {
    // originally for empty then or else in postIf
    kind: FlowGroupLabelKind.none;
};
export type FlowGroupLabelRef = {
    kind: FlowGroupLabelKind.ref;
    groupIdx: number;
};
export type FlowGroupLabelStart = {
    kind: FlowGroupLabelKind.start;
};
export type FlowGroupLabelBlock = {
    kind: FlowGroupLabelKind.block;
    ante: FlowGroupLabel;
    originatingBlock: Node;
};
export type FlowGroupLabelPostBlock = {
    kind: FlowGroupLabelKind.postBlock;
    ante: FlowGroupLabel;
    originatingBlock: Node;
};
export type FlowGroupLabelThen = {
    kind: FlowGroupLabelKind.then;
    ifGroupIdx: number;
    // arrAnte: FlowGroupLabel[]; // will this ever have length > 1?
};
export type FlowGroupLabelElse = {
    kind: FlowGroupLabelKind.else;
    ifGroupIdx: number;
    // arrAnte: FlowGroupLabel[]; // will this ever have length > 1?
};
export type FlowGroupLabelPostIf = {
    kind: FlowGroupLabelKind.postIf;
    // Sometimes, but not always, arrAnte[0] is FlowGroupLabelThen, and arrAnte[1] is FlowGroupLabelElse.
    // That happens when the then and else join together at postif, but that doesn't always happen. e.g., control diverges.
    arrAnte: (FlowGroupLabelRef | FlowGroupLabelThen | FlowGroupLabelPostIf | FlowGroupLabelNone)[];
    originatingGroupIdx: number;
};
export type FlowGroupLabelLoop = {
    kind: FlowGroupLabelKind.loop;
    loopElseGroupIdx?: number; // needed for loopGroup stack processing in resolveHeap
    antePrevious: FlowGroupLabel;
    arrAnteContinue: FlowGroupLabel[];
    arrControlExit?: FlowGroupLabel[]; // In fact this member is not required as long as the control exits groups are inserted into setOfAnteGroups in flowNodeGrouping
};
export type FlowGroupLabelLoopThen = {
    kind: FlowGroupLabelKind.loopThen;
    loopGroupIdx: number;
};
export type FlowGroupLabelLoopElse = {
    kind: FlowGroupLabelKind.postLoop;
    loopGroupIdx: number;
    arrAnteBreak: FlowGroupLabel[];
};

export type FlowGroupLabel = FlowGroupLabelRef | FlowGroupLabelThen | FlowGroupLabelElse | FlowGroupLabelPostIf | FlowGroupLabelLoop | FlowGroupLabelLoopThen | FlowGroupLabelLoopElse | FlowGroupLabelStart | FlowGroupLabelBlock | FlowGroupLabelPostBlock | FlowGroupLabelNone;

export interface GroupForFlow {
    kind: GroupForFlowKind;
    maximalIdx: number;
    idxb: number;
    idxe: number;
    // precOrdContainerIdx: number,
    groupIdx: number;
    previousAnteGroupIdx?: number; // the previous statement, sometimes
    anteGroupLabels: FlowGroupLabel[];
    dbgSetOfUnhandledFlow?: Set<FlowLabel>;
    postLoopGroupIdx?: number; // only present for a loop control group - required for processLoop updateHeap
    arrPreLoopGroupsIdx?: number[]; // only present for a postLoop group - required for processLoop updateHeap
    localsContainer: LocalsContainer;
    dbgGraphIdx?: number;
}

export interface ConnectedGroupsGraphs {
    arrGroupIndexToDependantCount: number[];
    arrGroupIndexToConnectGraph: number[];
    arrConnectedGraphs: GroupForFlow[][];
}

export interface ContainerItem {
    node: Node;
    precOrderIdx: number;
}
export interface GroupsForFlow {
    orderedGroups: GroupForFlow[];
    precOrderContainerItems: ContainerItem[];
    posOrderedNodes: Node[];
    groupToAnteGroupMap: Map<GroupForFlow, Set<GroupForFlow>>; // used in updateHeap
    nodeToGroupMap: Map<Node, GroupForFlow>;
    connectedGroupsGraphs: ConnectedGroupsGraphs;
    dbgFlowToOriginatingGroupIdx?: Map<FloughNode, number>;
    dbgCreationTimeMs?: bigint;
}

export interface SourceFileFloughState {
    sourceFile: SourceFileWithFloughNodes;
    groupsForFlow: GroupsForFlow;
    mrState: MrState;
    mrNarrow: MrNarrow;
    // refTypesTypeModule: RefTypesTypeModule;
}
interface CurrentBranchesItem {
    sc: RefTypesSymtabConstraintItem;
}
enum CurrentBranchesElementKind {
    none = 0,
    plain = 1,
    tf = 2,
}
interface CurrentBranchElementPlain {
    kind: CurrentBranchesElementKind.plain;
    gff: GroupForFlow;
    item: CurrentBranchesItem;
}
interface CurrentBranchElementTF {
    kind: CurrentBranchesElementKind.tf;
    gff: GroupForFlow;
    truthy: CurrentBranchesItem;
    falsy: CurrentBranchesItem;
    // originalConstraintIn: ConstraintItem;
    done?: boolean;
    truthyDone?: boolean;
    falsyDone?: boolean;
}
type CurrentBranchElement = CurrentBranchElementPlain | CurrentBranchElementTF;

export interface Heap {
    _heap: number[];
    _heapset: Set<number>;
    has(n: number): boolean;
    peek(): number;
    isEmpty(): boolean;
    insert(n: number): void;
    remove(): number;
    createSortedCopy(): number[]; // for debug
}

interface CurrentBranchesMap {
    set(group: GroupForFlow, cbe: CurrentBranchElement): this;
    get(group: GroupForFlow): CurrentBranchElement | undefined;
    delete(group: GroupForFlow, thenElse?: Set<"then" | "else"> | undefined): void;
    clear(): void;
    has(group: GroupForFlow): boolean;
    forEach(f: (cbe: CurrentBranchElement, g: GroupForFlow) => void): void;
    readonly size: number;
}
let nextCurrentBranchesMapCId = 0;
export class CurrentBranchesMapC implements CurrentBranchesMap {
    static loggerLevel = 2;
    id: number;
    data: Map<Readonly<GroupForFlow>, CurrentBranchElement>;
    constructor() {
        this.id = nextCurrentBranchesMapCId++;
        this.data = new Map<Readonly<GroupForFlow>, CurrentBranchElement>();
    }
    set(group: GroupForFlow, cbe: CurrentBranchElement): this {
        return (this.data.set(group, cbe), this);
    }
    get(group: GroupForFlow): CurrentBranchElement | undefined {
        return this.data.get(group);
    }
    delete(group: GroupForFlow, thenElseSet?: Set<"then" | "else"> | undefined): void {
        // delete(group: GroupForFlow, thenElse?: "then" | "else"): void {
        const loggerLevel = CurrentBranchesMapC.loggerLevel;
        if (IDebug.isActive(loggerLevel)) {
            let strset = "[";
            if (!thenElseSet) strset = "<undefined>";
            else {
                thenElseSet.forEach(x => strset += `${x},`);
                strset += "]";
            }
            const str1 = `CurrentBranchesMapC[${this.id}].delete(groupIdx:${group.groupIdx},${strset}),  size before delete:${this.data.size}`;
            IDebug.ilog(()=>str1, loggerLevel);
        }
        if (!thenElseSet) {
            Debug.assert(this.data.delete(group));
            return;
        }
        Debug.assert(group.kind === GroupForFlowKind.ifexpr || group.kind === GroupForFlowKind.loop);
        const cbe = this.data.get(group);
        Debug.assert(cbe && cbe.kind === CurrentBranchesElementKind.tf);
        Debug.assert(cbe);
        if (thenElseSet.has("then")) {
            cbe.truthyDone = true;
        }
        else if (thenElseSet.has("else")) {
            cbe.falsyDone = true;
        }
        if (cbe.truthyDone && cbe.falsyDone) {
            Debug.assert(this.data.delete(group));
        }
    }
    has(group: GroupForFlow): boolean {
        return this.data.has(group);
    }
    clear(): void {
        if (IDebug.isActive(CurrentBranchesMapC.loggerLevel)) {
            IDebug.ilog(()=>`CurrentBranchesMapC[${this.id}].clear(), size before clear:${this.data.size}`, CurrentBranchesMapC.loggerLevel);
        }
        this.data.clear();
    }
    forEach(f: (cbe: CurrentBranchElement, g: GroupForFlow) => void): void {
        this.data.forEach(f);
    }
    get size() {
        return this.data.size;
    }
}
// @ ts-expect-error
export type InvolvedSymbolTypeCacheOut = {
    symtab?: Map<Symbol, RefTypesType>;
    constraintItem: ConstraintItem;
};
export type InvolvedSymbolTypeCache = {
    in: {
        identifierMap?: Map<Symbol, RefTypesType>;
        propertyAccessMap?: Map<Symbol, RefTypesType>;
        constraintItem: ConstraintItem;
    };
    out?: InvolvedSymbolTypeCacheOut;
    outTruthy?: InvolvedSymbolTypeCacheOut;
    outFalsy?: InvolvedSymbolTypeCacheOut;
};

export interface ForFlow {
    heap: Heap; // heap sorted indices into SourceFileMrState.groupsForFlow.orderedGroups
    currentBranchesMap: CurrentBranchesMap;
    groupToNodeToType?: Map<GroupForFlow, NodeToTypeMap>;
    loopState?: ProcessLoopState; // only present in loops
}
export interface ProcessLoopState {
    loopGroup: GroupForFlow;
    loopCountWithoutFinals: number;
    invocations: number;
    groupToInvolvedSymbolTypeCache: WeakMap<GroupForFlow, InvolvedSymbolTypeCache>;
    // symbolsReadNotAssigned?: Set<Symbol>;
    symbolsAssigned?: Set<Symbol>;
    symbolsAssignedRange?: WeakMap<Symbol, RefTypesType>;
    scForLoop0?: RefTypesSymtabConstraintItem;
}
export type SymbolFlowInfo = {
    passCount: number;
    // initializedInAssignment?: boolean;  -- not used
    isconst: boolean;
    replayableItem?: ReplayableItem;
    typeNodeTsType?: Type;
    initializerType?: RefTypesType;
    effectiveDeclaredTsType: Type; // <actual declared type> || <widened initial type>
    effectiveDeclaredType?: RefTypesType; // = floughTypeModule.createRefTypesType(effectiveDeclaredTsType), createWhenNeeded
};
export type SymbolFlowInfoMap = WeakMap<Symbol, SymbolFlowInfo | undefined>;
export interface MrState {
    checker: FloughTypeChecker;
    replayableItems: WeakMap<Symbol, ReplayableItem>;
    forFlowTop: ForFlow;
    recursionLevel: number;
    dataForGetTypeOfExpressionShallowRecursive?: {
        sc: Readonly<RefTypesSymtabConstraintItem>;
        tmpExprNodeToTypeMap: Readonly<Map<Node, Type>>;
        expr: Expression | Node;
        returnErrorTypeOnFail: boolean | undefined;
    } | undefined;
    currentLoopDepth: number;
    currentLoopsInLoopScope: Set<GroupForFlow>;
    loopGroupToProcessLoopStateMap?: WeakMap<GroupForFlow, ProcessLoopState>;
    symbolFlowInfoMap: SymbolFlowInfoMap;
    connectGroupsGraphsCompleted: boolean[];
    groupDependancyCountRemaining: number[];
    /**
     * The same node may be evaluated multiple times (*) to produce literal objects of different values, but they should all share a common type.
     * (e.g., in a loop, a replayable expression).
     * Because they share a common type, they should also share a common type id.
     * Therefore, later evaluations of the same node should be able to find the type id in this map and construct a type with the same id,
     * but with variations.
     */
    nodeToOriginalObjectLiteralTypeMap: Map<Node, Type>;
}

function createHeap(groupsForFlow: GroupsForFlow): Heap {
    const _heap: number[] = [NaN];
    const _heapset = new Set<number>();
    function has(n: number) {
        return !!_heapset.has(n);
    }
    function peek() {
        Debug.assert(_heap.length > 1);
        return _heap[1];
    }
    function isEmpty() {
        Debug.assert(_heap.length);
        return _heap.length === 1;
    }
    const heaper = defineOneIndexingHeaper(
        NaN,
        (i: number, o: number) => groupsForFlow.orderedGroups[i].groupIdx < groupsForFlow.orderedGroups[o].groupIdx,
        (i: number, o: number) => groupsForFlow.orderedGroups[i].groupIdx > groupsForFlow.orderedGroups[o].groupIdx,
    );
    function insert(n: number) {
        Debug.assert(!_heapset.has(n));
        _heapset.add(n);
        heaper.heapInsert(_heap, n);
    }
    function remove() {
        Debug.assert(_heap.length > 1);
        _heapset.delete(peek());
        return heaper.heapRemove(_heap);
    }
    // for debug
    function createSortedCopy(): number[] {
        const heapcopy = [..._heap];
        heaper.heapSortInPlace(heapcopy, heaper.heapSize(_heap));
        return heapcopy;
    }
    return {
        _heap,
        _heapset,
        has,
        peek,
        isEmpty,
        insert,
        remove,
        createSortedCopy,
    };
}

function createForFlow(groupsForFlow: GroupsForFlow) {
    return {
        heap: createHeap(groupsForFlow),
        currentBranchesMap: new CurrentBranchesMapC(), // new Map<Readonly<GroupForFlow>, CurrentBranchElement>(),
        groupToNodeToType: new Map<GroupForFlow, NodeToTypeMap>(),
    };
}


export function createSourceFileFloughState(sourceFile: SourceFileWithFloughNodes, checker: FloughTypeChecker, compilerOptions: CompilerOptions): SourceFileFloughState {
    const t0 = process.hrtime.bigint();
    // if (IDebug.isActive(loggerLevel)) breakpoint();;
    if (compilerOptions.floughConstraintsEnable === undefined) compilerOptions.floughConstraintsEnable = false;
    if (compilerOptions.enableTSDevExpectString === undefined) compilerOptions.enableTSDevExpectString = false;
    if (compilerOptions.floughDoNotWidenInitalizedFlowType === undefined) compilerOptions.floughDoNotWidenInitalizedFlowType = false;
    if (hardCodeEnableTSDevExpectStringFalse) {
        compilerOptions.enableTSDevExpectString = false;
    }
    var enableDbgFlowNodes = Number(process.env.enableDbgFlowNodes ?? 0);
    // Only on first pass
    if (IDebug.isActive(0) && IDebug.loggingHost?.getCurrentSourceFnCount()===0 && enableDbgFlowNodes) {
        const ofilenameRoot = IDebug.loggingHost.getBaseTestFilepath(sourceFile) + `.flowNodes.txt`;
        //`tmp.${getBaseFileName(node.originalFileName)}.di${myDisableInfer?1:0}.${dbgFlowFileCnt}.flow`;
        //export function flowNodesToString(sourceFile: SourceFile, getFlowNodeId: (flow: FlowNode) => number, checker: TypeChecker): string {
        sys.writeFile(ofilenameRoot, flowNodesToString(sourceFile, checker.getFlowNodeId, checker));
    }


    const groupsForFlow = makeGroupsForFlow(sourceFile, checker);
    if (IDebug.isActive(0)) {
        // just to set up the ids for debugging
        sourceFile.allFlowNodes?.forEach(fn => checker.getFlowNodeId(fn));
        if (IDebug.loggingHost?.getCurrentSourceFnCount()===0 && enableDbgFlowNodes) {
            const astr3 = dbgGroupsForFlowToStrings(groupsForFlow,checker);
            const ofilename3 = IDebug.loggingHost.getBaseTestFilepath(sourceFile)+`.gff.txt`;
            sys.writeFile(ofilename3, astr3.join(sys.newLine));
            if (sourceFile.allFlowNodes) {
                const astr4: string[] = [];
                sourceFile.allFlowNodes.forEach(fn => {
                    let str = dbgFlowToString(fn);
                    if (groupsForFlow.dbgFlowToOriginatingGroupIdx) {
                        const originatingGroupIdx = groupsForFlow.dbgFlowToOriginatingGroupIdx.get(fn) ?? -1;
                        str += `, originatingGroupIdx: ${originatingGroupIdx}`;
                        str += `, anteFlow:[`;
                        const tmpas: string[] = [];
                        getFlowAntecedents(fn).forEach(antefn => {
                            str += `${dbgFlowToString(antefn)}; `;
                            const anteGroupIdx = groupsForFlow.dbgFlowToOriginatingGroupIdx!.get(antefn) ?? -1;
                            tmpas.push(anteGroupIdx.toString());
                        });
                        str += "]";
                        if (tmpas.length) {
                            str += `, anteGroups:[${tmpas.join(",")}]`;
                        }
                        astr4.push(str);
                    }
                });
                const ofilename4 = IDebug.loggingHost.getBaseTestFilepath(sourceFile)+`.afn.txt`;
                sys.writeFile(ofilename4, astr4.join(sys.newLine));
            }
        }
    }

    const t1 = process.hrtime.bigint() - t0;
    groupsForFlow.dbgCreationTimeMs = t1 / BigInt(1000000);
    const mrState: MrState = {
        checker,
        replayableItems: new WeakMap<Symbol, ReplayableItem>(),
        recursionLevel: 0,
        forFlowTop: createForFlow(groupsForFlow),
        currentLoopDepth: 0,
        currentLoopsInLoopScope: new Set<GroupForFlow>(),
        symbolFlowInfoMap: new WeakMap<Symbol, SymbolFlowInfo | undefined>(),
        connectGroupsGraphsCompleted: new Array(groupsForFlow.connectedGroupsGraphs.arrConnectedGraphs.length).fill(/*value*/ false),
        groupDependancyCountRemaining: groupsForFlow.connectedGroupsGraphs.arrGroupIndexToDependantCount.slice(),
        nodeToOriginalObjectLiteralTypeMap: new Map<Node, Type>(),
    };
    // const refTypesTypeModule = floughTypeModule.createRefTypesTypeModule(checker);
    const mrNarrow = createMrNarrow(checker, sourceFile, mrState, /*refTypesTypeModule, */ compilerOptions);
    initializeFlowGroupRefTypesSymtabModule(mrNarrow);
    initFloughGroupApplyCrit(checker, mrNarrow);
    initFloughTypeModule(checker, compilerOptions);
    initFloughLogicalObjectOuter(checker);
    initFloughLogicalObjectInner(checker, mrNarrow);
    initFloughSymtab(mrNarrow);
    return {
        sourceFile,
        groupsForFlow,
        mrState,
        mrNarrow,
        // refTypesTypeModule
    };
}
function getGroupDependencies(group: Readonly<GroupForFlow>, sourceFileMrState: SourceFileFloughState, forFlow: Readonly<ForFlow> | undefined, options?: { minGroupIdxToAdd: number; }): Set<GroupForFlow> {
    const minGroupIdxToAdd = options?.minGroupIdxToAdd;
    const groupsForFlow = sourceFileMrState.groupsForFlow;
    const acc = new Set<GroupForFlow>();
    let tmpacc0 = new Set<GroupForFlow>();
    let change = true;
    if (!forFlow || !forFlow.currentBranchesMap.get(group)) {
        tmpacc0.add(group);
        acc.add(group);
    }
    while (change) {
        change = false;
        let tmpacc1 = new Set<GroupForFlow>();
        tmpacc0.forEach(g => {
            if (!groupsForFlow.groupToAnteGroupMap.has(g)) return;
            let setAnteg: Set<GroupForFlow> | undefined;
            if (options) {
                setAnteg = new Set<GroupForFlow>();
                const tmp = groupsForFlow.groupToAnteGroupMap.get(g);
                tmp!.forEach(anteg => {
                    if (anteg.groupIdx >= options.minGroupIdxToAdd) setAnteg!.add(anteg);
                });
            }
            else {
                setAnteg = groupsForFlow.groupToAnteGroupMap.get(g);
            }
            setAnteg!.forEach(anteg => {
                if (minGroupIdxToAdd !== undefined && anteg.groupIdx < minGroupIdxToAdd) return;
                let gatedByCbe = false;
                if (forFlow) {
                    const has = forFlow.heap.has(anteg.groupIdx);
                    const cbe = forFlow.currentBranchesMap.get(anteg);
                    // cbe may exist and be in use when the corresponding group index is already removed from the heap, but not visa versa
                    Debug.assert(!has || has && cbe);
                    gatedByCbe = !!cbe;
                }
                if (!gatedByCbe) {
                    if (!tmpacc1.has(anteg) && !acc.has(anteg)) {
                        tmpacc1.add(anteg);
                        acc.add(anteg);
                        change = true;
                    }
                }
            });
        });
        [tmpacc0, tmpacc1] = [tmpacc1, tmpacc0];
        tmpacc1.clear();
    }
    return acc;
}
/**
 * This version of updateHeapWithGroupForFlow is called from processLoopOuter.
 * @param groups
 * @param heap
 * @param returnSortedGroupIdxs
 * @returns
 */
function updateHeapWithGroupForFlowLoop(groups: Readonly<Set<GroupForFlow>>, heap: Heap, sourceFileMrState: SourceFileFloughState, returnSortedGroupIdxs?: boolean): number[] | undefined {
    const loggerLevel = 2;
    if (IDebug.isActive(loggerLevel)) {
        const gidx: number[] = [];
        groups.forEach(g => gidx.push(g.groupIdx));
        IDebug.ilogGroup(()=>`updateHeapWithGroupForFlowLoop[in]: group idxs:[` + gidx.map(idx => `${idx}`).join(",") + "]", loggerLevel);
    }
    const arrGroupIndexToDependantCount = sourceFileMrState.groupsForFlow.connectedGroupsGraphs.arrGroupIndexToDependantCount;
    const groupDependancyCountRemaining = sourceFileMrState.mrState.groupDependancyCountRemaining;
    const forFlow = sourceFileMrState.mrState.forFlowTop;
    groups.forEach(g => {
        if (refactorConnectedGroupsGraphsGroupDependancyCountRemaining) {
            if (forFlow.currentBranchesMap.has(g)) forFlow.currentBranchesMap.delete(g);
            if (forFlow.groupToNodeToType!.has(g)) forFlow.groupToNodeToType!.delete(g);
            groupDependancyCountRemaining[g.groupIdx] = arrGroupIndexToDependantCount[g.groupIdx];
        }
        heap.insert(g.groupIdx);
    });
    if (IDebug.isActive(loggerLevel)) {
        const sortedHeap1Idx = heap.createSortedCopy();
        let str = `updateHeapWithGroupForFlowLoop[in]: heap group idxs:[`;
        for (let idx = sortedHeap1Idx.length - 1; idx !== 0; idx--) {
            str += `${sortedHeap1Idx[idx]},`;
        }
        str += "]";
        IDebug.ilogGroupEnd(()=>str, loggerLevel);
    }
    if (returnSortedGroupIdxs) {
        const sorted = heap.createSortedCopy().slice(1).reverse();
        return sorted;
    }
    return;
}

/**
 * Ensures that the heap has all the recursively necessary antecendent groups either already have forFlow.currentBranchesMap(group) set,
 * or else inserts them into the heap.
 * @param group
 * @param sourceFileMrState
 * @param forFlow
 * @param options This is unused - kill?
 */
export function updateHeapWithGroupForFlow(group: Readonly<GroupForFlow>, sourceFileMrState: SourceFileFloughState, forFlow: ForFlow, options?: { minGroupIdxToAdd: number; }): void {
    const loggerLevel = 2;
    const minGroupIdxToAdd = options?.minGroupIdxToAdd;
    const groupsForFlow = sourceFileMrState.groupsForFlow;
    if (IDebug.isActive(loggerLevel)) {
        const maximalNode = groupsForFlow.posOrderedNodes[group.maximalIdx];
        IDebug.ilogGroup(()=>`updateHeapWithGroupForFlow[in]: group: {groupIdx: ${group.groupIdx}, maximalNode: ${IDebug.dbgs.nodeToString(maximalNode)}}. minGroupIdxToAdd: ${minGroupIdxToAdd}`,loggerLevel);
    }
    /**
     * Currently requiring heap to be empty - so a simple sort could be used instead.
     * However, if heap were were to be added to on the fly, while resolving, heap will be useful.
     */
    const acc = new Set<GroupForFlow>();
    let tmpacc0 = new Set<GroupForFlow>();
    let change = true;
    if (!forFlow.currentBranchesMap.get(group)) {
        tmpacc0.add(group);
        acc.add(group);
    }
    while (change) {
        change = false;
        let tmpacc1 = new Set<GroupForFlow>();
        tmpacc0.forEach(g => {
            if (!groupsForFlow.groupToAnteGroupMap.has(g)) return;
            let setAnteg: Set<GroupForFlow> | undefined;
            if (options) {
                setAnteg = new Set<GroupForFlow>();
                const tmp = groupsForFlow.groupToAnteGroupMap.get(g);
                tmp!.forEach(anteg => {
                    if (anteg.groupIdx >= options.minGroupIdxToAdd) setAnteg!.add(anteg);
                });
            }
            else {
                setAnteg = groupsForFlow.groupToAnteGroupMap.get(g);
            }
            setAnteg!.forEach(anteg => {
                if (minGroupIdxToAdd !== undefined && anteg.groupIdx < minGroupIdxToAdd) return;
                const has = forFlow.heap.has(anteg.groupIdx);
                const cbe = forFlow.currentBranchesMap.get(anteg);
                // cbe may exist and be in use when the corresponding group index is already removed from the heap, but not visa versa
                Debug.assert(!has || has && cbe);
                if (!cbe) {
                    if (!tmpacc1.has(anteg) && !acc.has(anteg)) {
                        tmpacc1.add(anteg);
                        acc.add(anteg);
                        change = true;
                    }
                }
            });
        });
        [tmpacc0, tmpacc1] = [tmpacc1, tmpacc0];
        tmpacc1.clear();
    }
    acc.forEach(g => {
        forFlow.heap.insert(g.groupIdx);
    });
    if (IDebug.isActive(loggerLevel)) {
        const sortedHeap1Idx = forFlow.heap.createSortedCopy();
        for (let idx = sortedHeap1Idx.length - 1; idx !== 0; idx--) {
            const nidx = sortedHeap1Idx[idx];
            const group = groupsForFlow.orderedGroups[nidx];
            const maxnode = groupsForFlow.posOrderedNodes[group.maximalIdx];
            const str = `updateHeapWithGroupForFlow[dbg] heap[${sortedHeap1Idx.length - idx}=>${nidx}] ${IDebug.dbgs.nodeToString(maxnode)}`;
            IDebug.ilog(()=> "  " + str, loggerLevel);
        }
        const maximalNode = groupsForFlow.posOrderedNodes[group.maximalIdx];
        IDebug.ilogGroupEnd(()=>`updateHeapWithGroupForFlow[out]: group: {maximalNode: ${IDebug.dbgs.nodeToString(maximalNode)}}`, loggerLevel);
    }
}

export function updateHeapWithConnectedGroupsGraph(group: Readonly<GroupForFlow>, sourceFileMrState: SourceFileFloughState, forFlow: ForFlow): void {
    const loggerLevel = 2;
    const groupsForFlow = sourceFileMrState.groupsForFlow;
    const graphIndex = groupsForFlow.connectedGroupsGraphs.arrGroupIndexToConnectGraph[group.groupIdx];
    if (extraAsserts) {
        Debug.assert(
            graphIndex < sourceFileMrState.mrState.connectGroupsGraphsCompleted.length
                && !sourceFileMrState.mrState.connectGroupsGraphsCompleted[graphIndex],
        );
    }
    // NOTE: this is setting connectGroupsGraphsCompleted[graphIndex] before it is actually completed.
    sourceFileMrState.mrState.connectGroupsGraphsCompleted[graphIndex] = true;
    if (IDebug.isActive(loggerLevel)) {
        const maximalNode = groupsForFlow.posOrderedNodes[group.maximalIdx];
        IDebug.ilogGroup(
            ()=>`updateHeapWithConnectedGroupsGraph[in]: group: {groupIdx: ${group.groupIdx}, maximalNode: ${IDebug.dbgs.nodeToString(maximalNode)}}, graphIndex: ${graphIndex}`,
                loggerLevel);
    }
    //
    if (extraAsserts) {
        Debug.assert(forFlow.heap.isEmpty());
        // Debug.assert(forFlow.currentBranchesMap.size===0);
    }
    forFlow.currentBranchesMap.clear(); // TODO: do this when heap becomes empty?

    const graph = groupsForFlow.connectedGroupsGraphs.arrConnectedGraphs[graphIndex];
    for (let i = graph.length - 1; i >= 0; i--) {
        forFlow.heap.insert(graph[i].groupIdx);
    }
    if (IDebug.isActive(loggerLevel)) {
        const sortedHeap1Idx = forFlow.heap.createSortedCopy();
        for (let idx = sortedHeap1Idx.length - 1; idx !== 0; idx--) {
            const nidx = sortedHeap1Idx[idx];
            const group = groupsForFlow.orderedGroups[nidx];
            const maxnode = groupsForFlow.posOrderedNodes[group.maximalIdx];
            const str = `updateHeapWithConnectedGroupsGraph[dbg] heap[${sortedHeap1Idx.length - idx}=>${nidx}] ${IDebug.dbgs.nodeToString(maxnode)}`;
            IDebug.ilog(()=>"  " + str, loggerLevel);
        }
        const maximalNode = groupsForFlow.posOrderedNodes[group.maximalIdx];
        IDebug.ilogGroupEnd(()=>`updateHeapWithConnectedGroupsGraph[out]: group: {maximalNode: ${IDebug.dbgs.nodeToString(maximalNode)}}`, loggerLevel);
    }
}

function createFloughStatus(groupForFlow: GroupForFlow, sourceFileMrState: SourceFileFloughState, accumBranches: false): FloughStatus {
    const loggerLevel = 2;
    const mrState = sourceFileMrState.mrState;
    Debug.assert(sourceFileMrState.mrState.forFlowTop.groupToNodeToType);
    let groupNodeToTypeMap = mrState.forFlowTop.groupToNodeToType!.get(groupForFlow);
    if (!groupNodeToTypeMap) {
        groupNodeToTypeMap = new Map<Node, Type>();
        mrState.forFlowTop.groupToNodeToType!.set(groupForFlow, groupNodeToTypeMap);
    }
    return {
        inCondition: groupForFlow.kind === GroupForFlowKind.ifexpr || groupForFlow.kind === GroupForFlowKind.loop,
        currentReplayableItem: undefined,
        replayables: sourceFileMrState.mrState.replayableItems,
        groupNodeToTypeMap,
        accumBranches,
        getTypeOfExpressionShallowRecursion(sc: RefTypesSymtabConstraintItem, expr: Expression, returnErrorTypeOnFail?: boolean): Type {
            if (IDebug.isActive(loggerLevel)) {
                const dbgstr = `getTypeOfExpressionShallowRecursion[in]: expr: ${IDebug.dbgs.nodeToString(expr)}, returnErrorTypeOnFail: ${returnErrorTypeOnFail}`;
                IDebug.ilogGroup(()=>dbgstr, loggerLevel);
            }
            const ret = this.callCheckerFunctionWithShallowRecursion(expr, sc, returnErrorTypeOnFail ?? false, mrState.checker.getTypeOfExpression, expr);
            if (IDebug.isActive(loggerLevel)) {
                const dbgstr = `getTypeOfExpressionShallowRecursion[out]: expr: ${IDebug.dbgs.nodeToString(expr)}, return type: ${IDebug.dbgs.typeToString(ret)}`;
                IDebug.ilogGroupEnd(()=>dbgstr, loggerLevel);
            }
            return ret; // this.callCheckerFunctionWithShallowRecursion(expr, sc, returnErrorTypeOnFail??false, mrState.checker.getTypeOfExpression, expr);
        },
        callCheckerFunctionWithShallowRecursion<FN extends TypeCheckerFn>(expr: Expression, sc: RefTypesSymtabConstraintItem, returnErrorTypeOnFail: boolean, checkerFn: FN, ...args: Parameters<FN>): ReturnType<FN> {
            mrState.dataForGetTypeOfExpressionShallowRecursive = { expr, sc, tmpExprNodeToTypeMap: this.groupNodeToTypeMap, returnErrorTypeOnFail };
            try {
                const ret: ReturnType<FN> = checkerFn.call(mrState.checker, ...args);
                return ret;
            }
            finally {
                delete mrState.dataForGetTypeOfExpressionShallowRecursive;
            }
        },
    };
}

function createProcessLoopState(loopGroup: Readonly<GroupForFlow>, _setOfLoopDeps: Readonly<Set<GroupForFlow>>): ProcessLoopState {
    return {
        loopGroup,
        invocations: 0,
        loopCountWithoutFinals: 0,
        groupToInvolvedSymbolTypeCache: new WeakMap<GroupForFlow, InvolvedSymbolTypeCache>(),
    };
}

export function getDevDebugger(node: Node, sourceFile: SourceFileWithFloughNodes): boolean {
    const num = Number(process.env.myDebug);
    if (isNaN(num) || num === 0) return false;
    let stmnt = node;
    let hasStatement = false;
    while (stmnt.kind !== SyntaxKind.SourceFile) {
        // if (isStatement(stmnt)){ // not what it looks like
        //     break;
        // }
        if (stmnt.kind >= SyntaxKind.FirstStatement && stmnt.kind <= SyntaxKind.LastStatement) {
            hasStatement = true;
            break;
        }
        stmnt = stmnt.parent;
    }
    if (!hasStatement) return false;
    const arrCommentRange = getLeadingCommentRangesOfNode(stmnt, sourceFile);
    let cr: CommentRange | undefined;
    if (arrCommentRange) cr = arrCommentRange[arrCommentRange.length - 1];
    if (cr) {
        const comment = sourceFile.text.slice(cr.pos, cr.end);
        const matches = /@ts-dev-debugger/.exec(comment);
        if (matches) {
            return true;
        }
    }
    return false;
}

export function getDevExpectString(node: Node, sourceFile: SourceFileWithFloughNodes): string | undefined {
    const arrCommentRange = getLeadingCommentRangesOfNode(node, sourceFile);
    let cr: CommentRange | undefined;
    if (arrCommentRange) cr = arrCommentRange[arrCommentRange.length - 1];
    if (cr) {
        const comment = sourceFile.text.slice(cr.pos, cr.end);
        const matches = /@ts-dev-expect-string "(.+?)"/.exec(comment);
        if (matches && matches.length >= 2) {
            return matches[1];
        }
    }
    return undefined;
}
export function getDevExpectStrings(node: Node, sourceFile: SourceFileWithFloughNodes): string[] | undefined {
    const arrCommentRange = getLeadingCommentRangesOfNode(node, sourceFile);
    const arrstr: string[] = [];
    if (!arrCommentRange) return undefined;
    arrCommentRange.forEach(cr => {
        const comment = sourceFile.text.slice(cr.pos, cr.end);
        const matches = /@ts-dev-expect-string "(.+?)"/.exec(comment);
        if (matches && matches.length >= 2) {
            arrstr.push(matches[1]);
        }
    });
    return arrstr.length ? arrstr : undefined;
}

function processLoopOuter(loopGroup: GroupForFlow, sourceFileMrState: SourceFileFloughState, forFlowParent: ForFlow): void {
    sourceFileMrState.mrState.currentLoopsInLoopScope.add(loopGroup);
    sourceFileMrState.mrState.currentLoopDepth++;
    let maxGroupIdxProcessed: number;
    const setOfLoopDeps = getGroupDependencies(loopGroup, sourceFileMrState, /*forFlow*/ undefined, { minGroupIdxToAdd: loopGroup.groupIdx });
    {
        maxGroupIdxProcessed = loopGroup.groupIdx;
        setOfLoopDeps.forEach(g => maxGroupIdxProcessed = Math.max(maxGroupIdxProcessed, g.groupIdx));
    }

    if (sourceFileMrState.mrState.currentLoopDepth === 1) {
        Debug.assert(sourceFileMrState.mrState.currentLoopsInLoopScope.size === 1);
        Debug.assert(!sourceFileMrState.mrState.loopGroupToProcessLoopStateMap);
        sourceFileMrState.mrState.loopGroupToProcessLoopStateMap = new WeakMap<GroupForFlow, ProcessLoopState>();
        processLoop(loopGroup, sourceFileMrState, forFlowParent, setOfLoopDeps, maxGroupIdxProcessed);

        // before calling the loop the second time, we must know the "symbolsReadNotAssigned".

        updateHeapWithGroupForFlowLoop(setOfLoopDeps, forFlowParent.heap, sourceFileMrState);
        Debug.assert(forFlowParent.heap.peek() === loopGroup.groupIdx);
        forFlowParent.heap.remove();
        processLoop(loopGroup, sourceFileMrState, forFlowParent, setOfLoopDeps, maxGroupIdxProcessed);
        delete sourceFileMrState.mrState.loopGroupToProcessLoopStateMap;
    }
    else {
        Debug.assert(sourceFileMrState.mrState.loopGroupToProcessLoopStateMap);
        processLoop(loopGroup, sourceFileMrState, forFlowParent, setOfLoopDeps, maxGroupIdxProcessed);
    }
    sourceFileMrState.mrState.currentLoopDepth--;
    if (sourceFileMrState.mrState.currentLoopDepth === 0) sourceFileMrState.mrState.currentLoopsInLoopScope.clear();
}

function processLoop(loopGroup: GroupForFlow, sourceFileMrState: SourceFileFloughState, forFlowParent: ForFlow, setOfLoopDeps: Readonly<Set<GroupForFlow>>, maxGroupIdxProcessed: number): void {
    const loggerLevel = 2;
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilogGroup(()=>`processLoop[in] loopGroup.groupIdx:${loopGroup.groupIdx}, currentLoopDepth:${sourceFileMrState.mrState.currentLoopDepth}`,loggerLevel);
    }
    Debug.assert(loopGroup.kind === GroupForFlowKind.loop);
    const anteGroupLabel: FlowGroupLabel = loopGroup.anteGroupLabels[0];
    Debug.assert(anteGroupLabel.kind === FlowGroupLabelKind.loop);
    // const mrNarrow = sourceFileMrState.mrNarrow;
    // @ ts-expect-error
    const groupDependancyCountRemaining = sourceFileMrState.mrState.groupDependancyCountRemaining;
    // @ ts-expect-error
    const arrGroupIndexToDependantCount = sourceFileMrState.groupsForFlow.connectedGroupsGraphs.arrGroupIndexToDependantCount;
    function deleteCurrentBranchesMap(gff: GroupForFlow, set?: Set<"then" | "else"> | undefined) {
        forFlowParent.currentBranchesMap.delete(gff, set);
        // if (refactorConnectedGroupsGraphs){
        //     groupDependancyCountRemaining[gff.groupIdx] = arrGroupIndexToDependantCount[gff.groupIdx];
        // }
    }

    const setOfKeysToDeleteFromCurrentBranchesMap = new Map<GroupForFlow, Set<"then" | "else"> | undefined>();

    /**
     * When the outer loopGroup is complete, the loopState of each inner loopGroup-s should also become unreferenced.
     * Therefore the loopGroupToProcessLoopStateMap exists in the outer loop scope.
     */

    const loopGroupToProcessLoopStateMap = sourceFileMrState.mrState.loopGroupToProcessLoopStateMap!;
    const loopState = (() => {
        let got = loopGroupToProcessLoopStateMap.get(loopGroup);
        if (!got) {
            got = createProcessLoopState(loopGroup, setOfLoopDeps);
            loopGroupToProcessLoopStateMap.set(loopGroup, got);
        }
        return got;
    })();

    let loopCount = 0;
    let forFlowFinal: ForFlow;

    if (!refactorConnectedGroupsGraphsGroupDependancyCountRemaining) {
        if (loopState.invocations >= 1) {
            setOfLoopDeps.forEach(gff => {
                if (forFlowParent.currentBranchesMap.has(gff)) deleteCurrentBranchesMap(gff);
                if (forFlowParent.groupToNodeToType!.has(gff)) forFlowParent.groupToNodeToType!.delete(gff);
            });
        }
    }
    const forFlow: ForFlow = {
        currentBranchesMap: forFlowParent.currentBranchesMap,
        heap: forFlowParent.heap,
        groupToNodeToType: forFlowParent.groupToNodeToType!,
        loopState,
        // loopGroupToProcessLoopStateMap
    };

    IDebug.ilog(()=>`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`,loggerLevel);
    // let cachedSubloopSCForLoopConditionIn: RefTypesSymtabConstraintItem;
    let outerSCForLoopConditionIn: RefTypesSymtabConstraintItem;
    {
        const floughStatus: FloughStatus = createFloughStatus(loopGroup, sourceFileMrState, /*accumBranches*/ false);
        // Caching of scForLoop0 is only required for the outermost, depth===1, loop
        if (sourceFileMrState.mrState.currentLoopDepth === 1) {
            if (loopState.invocations === 0) {
                Debug.assert(!loopState.scForLoop0);
                outerSCForLoopConditionIn = doFlowGroupLabel(anteGroupLabel.antePrevious, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
                setOfKeysToDeleteFromCurrentBranchesMap.forEach((set, gff) => deleteCurrentBranchesMap(gff, set));
                setOfKeysToDeleteFromCurrentBranchesMap.clear();
                loopState.scForLoop0 = outerSCForLoopConditionIn;
            }
            else {
                Debug.assert(loopState.scForLoop0);
                outerSCForLoopConditionIn = loopState.scForLoop0;
                // delete loopState.scForLoop0;
            }
        }
        else {
            Debug.assert(!loopState.scForLoop0);
            outerSCForLoopConditionIn = doFlowGroupLabel(anteGroupLabel.antePrevious, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
            setOfKeysToDeleteFromCurrentBranchesMap.forEach((set, gff) => deleteCurrentBranchesMap(gff, set));
            setOfKeysToDeleteFromCurrentBranchesMap.clear();
        }
        // cachedSubloopSCForLoopConditionIn = {
        //     symtab: createSubloopRefTypesSymtab(outerSCForLoopConditionIn.symtab, loopState, loopGroup),
        //     constraintItem: outerSCForLoopConditionIn.constraintItem
        // };
        const subloopSCForLoopConditionIn = createSubLoopRefTypesSymtabConstraint(outerSCForLoopConditionIn, loopState, loopGroup);

        resolveGroupForFlow(loopGroup, floughStatus, sourceFileMrState, forFlow, { loopGroupIdx: loopGroup.groupIdx, cachedSCForLoop: subloopSCForLoopConditionIn });
    }
    IDebug.ilog(()=>`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`, loggerLevel);
    do {
        const cbe = forFlow.currentBranchesMap.get(loopGroup);
        Debug.assert(cbe?.kind === CurrentBranchesElementKind.tf);
        // do the rest of the loop
        IDebug.ilog(()=>`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the rest of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`, loggerLevel);

        resolveHeap(sourceFileMrState, forFlow, /*accumBranches*/ false, maxGroupIdxProcessed);

        IDebug.ilog(()=>`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the rest of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`, loggerLevel);

        setOfKeysToDeleteFromCurrentBranchesMap.clear();
        let arrSCForLoopContinue: RefTypesSymtabConstraintItem[] = [];
        arrSCForLoopContinue = anteGroupLabel.arrAnteContinue.map(fglab => {
            return doFlowGroupLabel(fglab, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
        });
        setOfKeysToDeleteFromCurrentBranchesMap.forEach((set, gff) => deleteCurrentBranchesMap(gff, set));
        setOfKeysToDeleteFromCurrentBranchesMap.clear();

        if (true) {
            const scForConditionContinue = orSymtabConstraints(arrSCForLoopContinue /*, mrNarrow*/);
            if (loopState.invocations === 0) {
                loopState.symbolsAssignedRange = scForConditionContinue.symtab
                    ? getSymbolsAssignedRange(scForConditionContinue.symtab) : undefined;
            }
            const scForConditionUnionOfInAndContinue: RefTypesSymtabConstraintItem = isRefTypesSymtabConstraintItemNever(scForConditionContinue)
                ? createSubLoopRefTypesSymtabConstraint(outerSCForLoopConditionIn, loopState, loopGroup)
                : { symtab: modifiedInnerSymtabUsingOuterForFinalCondition(scForConditionContinue.symtab!), constraintItem: scForConditionContinue.constraintItem };

            if (loopState.invocations === 1) {
                loopState.symbolsAssignedRange = undefined;
            }
            // const subloopSCForLoopConditionIn = createSubLoopRefTypesSymtabConstraint(outerSCForLoopConditionIn, loopState, loopGroup);
            // const scForConditionUnionOfInAndContinue = orSymtabConstraints([subloopSCForLoopConditionIn, ...arrSCForLoopContinue], mrNarrow);
            // at this point, can we set loopState.symbolsAssignedRange
            IDebug.ilog(()=>`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the final condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`, loggerLevel);
            deleteCurrentBranchesMap(loopGroup);

            // The groupToNodeToType map must be replaced by the second call to resolveGroupForFlow(loopGroup,...)
            if (forFlowParent.currentBranchesMap.has(loopGroup)) deleteCurrentBranchesMap(loopGroup); // This is not required because it will be overwritten anyway.
            if (forFlowParent.groupToNodeToType!.has(loopGroup)) forFlowParent.groupToNodeToType!.delete(loopGroup);

            const floughStatus: FloughStatus = createFloughStatus(loopGroup, sourceFileMrState, /*accumBranches*/ false);
            resolveGroupForFlow(loopGroup, floughStatus, sourceFileMrState, forFlow, { cachedSCForLoop: scForConditionUnionOfInAndContinue, loopGroupIdx: loopGroup.groupIdx });

            IDebug.ilog(()=>`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the final condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`, loggerLevel);
        }

        const converged = true;
        if (converged) {
            IDebug.ilog(()=>`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, loop converged, loopCount=${loopCount}, loopState.invocations:${loopState.invocations}`, loggerLevel);
            forFlowFinal = forFlow;
            break;
        }
        if (IDebug.isActive(loggerLevel)) {
            setOfLoopDeps.forEach(g => {
                const cbe = forFlow.currentBranchesMap.get(g); // some will have been deleted already, only those referenced externally should be present
                if (cbe) {
                    dbgCurrentBranchElement(cbe, sourceFileMrState).forEach(s =>
                        IDebug.ilog(()=>`processLoop[dbg lc:${loopCount}] li:${loopGroup.groupIdx}, gi:${g.groupIdx}]: ${s}`, loggerLevel));
                }
                const nodeToTypeMap = forFlow.groupToNodeToType!.get(g);
                if (nodeToTypeMap) {
                    dbgNodeToTypeMap(nodeToTypeMap).forEach(s =>
                        IDebug.ilog(()=>`processLoop[dbg lc:${loopCount}] li:${loopGroup.groupIdx}, gi:${g.groupIdx}]: ${s}`, loggerLevel));
                }
            });
        }

        loopState.loopCountWithoutFinals++;
    }
    while (++loopCount);
    Debug.assert(forFlowFinal!);

    // if (mrNarrow.compilerOptions.enableTSDevExpectString && sourceFileMrState.mrState.currentLoopDepth===1){
    //     sourceFileMrState.mrState.currentLoopsInLoopScope.forEach(loopg=>{
    //         const node = sourceFileMrState.groupsForFlow.posOrderedNodes[loopg.maximalIdx];
    //         const expected = getDevExpectString(node.parent, sourceFileMrState.sourceFile);
    //         if (expected===undefined) return;
    //         const lstate: ProcessLoopState = loopGroupToProcessLoopStateMap.get(loopg)!;
    //         const actual = `loopCount:${lstate.loopCountWithoutFinals}, invocations:${lstate.invocations}`;
    //         if (actual!==expected){
    //             Debug.fail(`@ts-dev-expect-string expected:"${expected}" !== actual:"${actual}" ; node:${IDebug.dbgs.nodeToString(node)}`);
    //         }
    //     });
    // }
    /** */
    if (IDebug.isActive(loggerLevel)) {
        setOfLoopDeps.forEach(g => {
            const cbe = forFlowFinal.currentBranchesMap.get(g); // some will have been deleted already, only those referenced externally should be present
            if (cbe) {
                dbgCurrentBranchElement(cbe, sourceFileMrState).forEach(s => IDebug.ilog(()=>`processLoop[dbg out] loopIdx:${loopGroup.groupIdx}, gIdx:${g.groupIdx}: ${s}`, loggerLevel));
            }
            dbgNodeToTypeMap(forFlowFinal.groupToNodeToType!.get(g)!).forEach(s => IDebug.ilog(()=>`processLoop[dbg out] loopIdx:${loopGroup.groupIdx}, gIdx:${g.groupIdx}: ${s}`, loggerLevel));
        });
        IDebug.ilogGroupEnd(()=>`processLoop[out] loopGroup.groupIdx:${loopGroup.groupIdx}, currentLoopDepth:${sourceFileMrState.mrState.currentLoopDepth}, maxGroupIdxProcessed:${maxGroupIdxProcessed}, loopState.invocations:${loopState.invocations}`, loggerLevel);
    }
    loopState.invocations++;
}

/**
 * Resolve the groups in the heap, which are in order of increasing dependence.
 * @param sourceFileMrState
 */
function resolveHeap(sourceFileMrState: SourceFileFloughState, forFlow: ForFlow, withinLoop: false, maxGroupIdxToResolve?: number): void {
    const groupsForFlow = sourceFileMrState.groupsForFlow;
    const heap = forFlow.heap;
    while (!heap.isEmpty()) {
        if (maxGroupIdxToResolve !== undefined && heap.peek() > maxGroupIdxToResolve) break;
        const groupIdx = heap.remove();
        const groupForFlow = groupsForFlow.orderedGroups[groupIdx];
        if (groupForFlow.kind === GroupForFlowKind.loop) {
            processLoopOuter(groupForFlow, sourceFileMrState, forFlow);
            continue;
        }
        const floughStatus: FloughStatus = createFloughStatus(groupForFlow, sourceFileMrState, withinLoop);
        resolveGroupForFlow(groupForFlow, floughStatus, sourceFileMrState, forFlow);
    } // while (!heap.isEmpty())
}

function doFlowGroupLabel(fglabIn: FlowGroupLabel, setOfKeysToDeleteFromCurrentBranchesMap: Map<GroupForFlow, Set<"then" | "else"> | undefined>, sourceFileMrState: SourceFileFloughState, forFlow: ForFlow): RefTypesSymtabConstraintItem {
    const loggerLevel = 1;
    const { groupsForFlow, mrNarrow } = sourceFileMrState;
    IDebug.ilogGroup(()=>`doFlowGroupLabel[in]:`, loggerLevel);
    if (IDebug.isActive(loggerLevel)){
        dbgFlowGroupLabelToStrings(fglabIn, sourceFileMrState.mrState.checker).forEach(s=>IDebug.ilog(()=>`doFlowGroupLabel: ${s}`, loggerLevel));
        //IDebug.ilog(()=>`doFlowGroupLabel[in]: fglabIn: ${dbgFlowGroupLabelToString(fglabIn)}`, loggerLevel);
    }
    const ret = doFlowGroupLabelAux(fglabIn);
    IDebug.ilogGroupEnd(()=>`doFlowGroupLabel[out]:`, loggerLevel);
    return ret;

    function getLoopLocals(loopGroup: Readonly<GroupForFlow>): Readonly<SymbolTable> | undefined {
        const loopGroupMaximalNode = sourceFileMrState.groupsForFlow.posOrderedNodes[loopGroup.maximalIdx];
        const locals: SymbolTable | undefined = ((loopGroupMaximalNode.parent as IterationStatement).statement as Block).locals;
        return locals?.size ? locals : undefined;
    }

    function filterSymtabBySymbolTable(symtab: Readonly<RefTypesSymtab>, locals: Readonly<SymbolTable> | undefined, dbgCaller: string): RefTypesSymtab {
        let newsymtab: RefTypesSymtab | undefined;
        locals?.forEach(s => {
            if (IDebug.isActive(loggerLevel) && symtab.has(s)) {
                IDebug.ilog(()=>`${dbgCaller}: descoping symbol ${IDebug.dbgs.symbolToString(s)}`, loggerLevel);
            }
            if (!newsymtab) {
                if (symtab.has(s)) {
                    (newsymtab = copyRefTypesSymtab(symtab)).delete(s);
                }
            }
            else newsymtab.delete(s);
        });
        return newsymtab ?? symtab;
    }

    function doFlowGroupLabelAux(fglab: FlowGroupLabel): RefTypesSymtabConstraintItem {
        switch (fglab.kind) {
            case FlowGroupLabelKind.ref: {
                const anteg = groupsForFlow.orderedGroups[fglab.groupIdx];
                const cbe = forFlow.currentBranchesMap.get(anteg);
                Debug.assert(!cbe || cbe.kind === CurrentBranchesElementKind.plain);
                if (!cbe || !((cbe as CurrentBranchElementPlain).item.sc as RefTypesSymtabConstraintItemNotNever).symtab) {
                    if (enablePerBlockSymtabs){
                        Debug.assert(!((cbe as CurrentBranchElementPlain).item.sc as RefTypesSymtabConstraintItemNotNever).fsymtab);
                    }
                    // This may happen if continues after a loop are not yet fulfilled.
                    return { constraintItem: createFlowConstraintNever() };
                }
                assertCastType<CurrentBranchElementPlain>(cbe);
                Debug.assert(cbe.kind === CurrentBranchesElementKind.plain);
                setOfKeysToDeleteFromCurrentBranchesMap.set(anteg, undefined);
                const ret: Partial<RefTypesSymtabConstraintItemNotNever> = { constraintItem: cbe.item.sc.constraintItem as ConstraintItemNotNever };
                if ((cbe.item.sc as RefTypesSymtabConstraintItemNotNever).symtab) {
                    if (enablePerBlockSymtabs){
                        Debug.assert((cbe.item.sc as RefTypesSymtabConstraintItemNotNever).fsymtab);
                        ret.fsymtab = (cbe.item.sc as RefTypesSymtabConstraintItemNotNever).fsymtab;
                    }
                    ret.symtab = (cbe.item.sc as RefTypesSymtabConstraintItemNotNever).symtab;
                }
                return ret as RefTypesSymtabConstraintItem;
            }
            case FlowGroupLabelKind.then:
                return doThenElse(fglab.ifGroupIdx, /*truthy*/ true);
            case FlowGroupLabelKind.else:
                return doThenElse(fglab.ifGroupIdx, /*truthy*/ false);
            case FlowGroupLabelKind.postIf:
                return doOneFlowGroupLabelPostIf(fglab);
            case FlowGroupLabelKind.loop: {
                const sc0 = doFlowGroupLabelAux(fglab.antePrevious);
                const asc = fglab.arrAnteContinue.map(x => doFlowGroupLabelAux(x));
                return orSymtabConstraints([sc0, ...asc] /*, mrNarrow*/);
            }
            case FlowGroupLabelKind.loopThen:
                return doThenElse(fglab.loopGroupIdx, /*truthy*/ true);
            case FlowGroupLabelKind.postLoop: {
                // let sc0 = doPostLoop(fglab.loopGroupIdx);
                let sc0: RefTypesSymtabConstraintItem | undefined = doThenElse(fglab.loopGroupIdx, /**/ false);
                if (isRefTypesSymtabConstraintItemNever(sc0)) sc0 = undefined;
                let asc: RefTypesSymtabConstraintItemNotNever[] = fglab.arrAnteBreak.map(x => doFlowGroupLabelAux(x)).filter(sc => !isRefTypesSymtabConstraintItemNever(sc)) as RefTypesSymtabConstraintItemNotNever[];

                const locals = getLoopLocals(sourceFileMrState.groupsForFlow.orderedGroups[fglab.loopGroupIdx]);
                if (locals) {
                    if (enablePerBlockSymtabs){
                        Debug.assert(false, "TODO: implement this");
                    }
                    else {
                        if (sc0) sc0 = { symtab: filterSymtabBySymbolTable(sc0.symtab!, locals, "postLoop-main"), constraintItem: sc0.constraintItem };
                        asc = asc.map(sc => ({ symtab: filterSymtabBySymbolTable(sc.symtab, locals, "postLoop-break"), constraintItem: sc.constraintItem }));
                    }
                }
                if (sc0) asc.push(sc0 as RefTypesSymtabConstraintItemNotNever);

                // if (!doProxySymtabSqueezing) return orSymtabConstraints([sc0, ...asc], mrNarrow);
                if (asc.length === 0) return { constraintItem: createFlowConstraintNever() };
                const oredsc = orSymtabConstraints(asc /*, mrNarrow*/);
                return createSuperloopRefTypesSymtabConstraintItem(oredsc);
            }
            case FlowGroupLabelKind.block:
                return doFlowGroupLabelAux(fglab.ante);
            case FlowGroupLabelKind.postBlock: {
                return doPostBlock(fglab);
            }
            case FlowGroupLabelKind.none:
                return { symtab: mrNarrow.createRefTypesSymtab(), constraintItem: createFlowConstraintNever() };
            case FlowGroupLabelKind.start:
                return { symtab: mrNarrow.createRefTypesSymtab(), constraintItem: createFlowConstraintAlways() };
            default:
                // @ts-expect-error
                Debug.fail("not yet implemented: " + fglab.kind);
        }
    }
    function doThenElse(groupIdx: number, truthy: boolean): RefTypesSymtabConstraintItem {
        const anteg = groupsForFlow.orderedGroups[groupIdx];
        const cbe = forFlow.currentBranchesMap.get(anteg);
        if (true) {
            if (!cbe) return { constraintItem: createFlowConstraintNever() };
        }
        else {
            // Perhaps this could imply that the path was untraversed because it was never
            Debug.assert(cbe);
        }
        if (cbe.kind === CurrentBranchesElementKind.tf) {
            if (truthy) {
                const got = setOfKeysToDeleteFromCurrentBranchesMap.get(anteg);
                if (!got) setOfKeysToDeleteFromCurrentBranchesMap.set(anteg, new Set<"else" | "then">(["then"]));
                else got.add("then");
                return cbe.truthy.sc;
            }
            else {
                const got = setOfKeysToDeleteFromCurrentBranchesMap.get(anteg);
                if (!got) setOfKeysToDeleteFromCurrentBranchesMap.set(anteg, new Set<"else" | "then">(["else"]));
                else got.add("else");
                return cbe.falsy.sc;
            }
        }
        else {
            Debug.fail("unexpected");
        }
    }
    function doPostBlock(fglab: FlowGroupLabelPostBlock): RefTypesSymtabConstraintItem {
        const sc = doFlowGroupLabelAux(fglab.ante);
        if (isRefTypesSymtabConstraintItemNever(sc)) return sc;
        if ((fglab.originatingBlock as LocalsContainer).locals?.size) {
            sc.symtab = filterSymtabBySymbolTable(sc.symtab!, (fglab.originatingBlock as LocalsContainer).locals, "postBlock");
        }
        if (enablePerBlockSymtabs && (fglab.originatingBlock as LocalsContainer).locals?.size){
            Debug.assert(sc.fsymtab)
            Debug.assert(fglab.originatingBlock === sc.fsymtab.getLocalsContainer());
            return { ...sc, fsymtab: floughSymtabRollupLocalsScope(sc.fsymtab, fglab.originatingBlock as LocalsContainer) };
        }
        return sc;
    }
    function doOneFlowGroupLabelPostIf(fglab: FlowGroupLabelPostIf): RefTypesSymtabConstraintItem {
        const arrsc = fglab.arrAnte.map(ante => doFlowGroupLabelAux(ante));
        return orSymtabConstraints(arrsc /*, mrNarrow*/);
    }
}

function resolveGroupForFlow(groupForFlow: Readonly<GroupForFlow>, floughStatus: FloughStatus, sourceFileMrState: SourceFileFloughState, forFlow: ForFlow, options?: { cachedSCForLoop: RefTypesSymtabConstraintItem; loopGroupIdx: number; }): void {
    const loggerLevel = 1;
    const groupsForFlow = sourceFileMrState.groupsForFlow;
    const mrNarrow = sourceFileMrState.mrNarrow;
    const maximalNode = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilogGroup(()=>
            `resolveGroupForFlow[in]: ${IDebug.dbgs.nodeToString(maximalNode)}, `
                + `groupIndex:${groupForFlow.groupIdx}, kind:${groupForFlow.kind}, `
                + `maximalNode.parent.kind:${Debug.formatSyntaxKind(maximalNode.parent.kind)}, `, loggerLevel
        );
        IDebug.ilog(()=>`resolveGroupForFlow[dbg:] currentBranchesMap[before]:`, loggerLevel);
        dbgForFlow(sourceFileMrState, forFlow).forEach(s => IDebug.ilog(()=>`resolveGroupForFlow[dbg:] currentBranchesMap[before]: ${s}`, loggerLevel));
        IDebug.ilog(()=>`resolveGroupForFlow[dbg:] endof currentBranchesMap[before]:`, loggerLevel);
        IDebug.ilog(()=>`resolveGroupForFlow[dbg:] previousAnteGroupIdx:${groupForFlow.previousAnteGroupIdx}`, loggerLevel);
        IDebug.ilog(()=>`resolveGroupForFlow[dbg:] groupForFlow.anteGroupLabels.length: ${groupForFlow.anteGroupLabels.length}`, loggerLevel);
        if (groupForFlow.anteGroupLabels.length){
            dbgFlowGroupLabelToStrings(groupForFlow.anteGroupLabels[0], sourceFileMrState.mrState.checker).forEach(s =>
                IDebug.ilog(()=>`resolveGroupForFlow[dbg:] anteGroupLabels[0]: ${s}`, loggerLevel));
        }
        IDebug.ilog(()=>`resolveGroupForFlow[dbg:] groupForFlow.localsContainer: ${groupForFlow.localsContainer ?`(${groupForFlow.localsContainer.pos},${groupForFlow.localsContainer.end})`:`<undef>` }`, loggerLevel);
    }

    function findSharedAncestorLocalsContainer(loc1: LocalsContainer, loc2: LocalsContainer): LocalsContainer {
        let node1: Node = loc1;
        let node2: Node = loc2;
        while (node1 !== node2) {
            if (node1.pos < node2.pos) {
                node2 = node2.parent;
            }
            else {
                node1 = node1.parent;
            }
        }
        while (node1 && !(node1 as LocalsContainer).locals) {
            node1 = node1.parent;
        }
        return node1 as LocalsContainer;
    }

    function calculateFloughSymtab(fsymtabPrev: FloughSymtab, groupForFlow: Readonly<GroupForFlow /*& {localsContainer: LocalsContainer}*/>): FloughSymtab {
        const prevFloughSymtabLocalContainer = fsymtabPrev.getLocalsContainer();
        {
            Debug.assert(!(prevFloughSymtabLocalContainer.pos === groupForFlow.localsContainer.pos
            && prevFloughSymtabLocalContainer.end === groupForFlow.localsContainer.end));
        }
        let fsymtab: FloughSymtab;
        if (groupForFlow.localsContainer.pos>prevFloughSymtabLocalContainer.pos) {
            if (groupForFlow.localsContainer.end<=prevFloughSymtabLocalContainer.end) {
                // descendent block of the previous block
                const alocalsContainers: LocalsContainer[] = [];
                let node = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
                for (; node !== prevFloughSymtabLocalContainer; node = node.parent) {
                    Debug.assert(node);
                    if ((node as LocalsContainer).locals?.size) {
                        alocalsContainers.push(node as LocalsContainer);
                    }
                };
                alocalsContainers.reverse();
                fsymtab = fsymtabPrev;
                alocalsContainers.forEach((localsContainers, idx) => fsymtab = createFloughSymtab(localsContainers, fsymtab));
            }
            else {
                Debug.assert(groupForFlow.localsContainer.pos > prevFloughSymtabLocalContainer.end);
                // Neither parent not child block of previous block, find shared ancestor
                const sharedAncestor = findSharedAncestorLocalsContainer(prevFloughSymtabLocalContainer!, groupForFlow.localsContainer);
                fsymtab = floughSymtabRollupToAncestor(fsymtabPrev, sharedAncestor);
            }
        }
        else {
            Debug.assert(groupForFlow.localsContainer.pos<prevFloughSymtabLocalContainer.end);
            // groupForFlow.localsContainer.pos < prevAnteGroup.localsContainer.pos
            if (groupForFlow.localsContainer.end>prevFloughSymtabLocalContainer.end) {
                // ancestor block of the previous block
                fsymtab = floughSymtabRollupToAncestor(fsymtabPrev, groupForFlow.localsContainer);
            }
            else {
                Debug.assert(false, undefined, ()=>`unexpected prev:(${prevFloughSymtabLocalContainer.pos},${prevFloughSymtabLocalContainer.end}
                    ), this:(${groupForFlow.localsContainer!.pos},${groupForFlow.localsContainer!.end})`)
            }
        }
        return fsymtab;
    }


    /**
     *
     * @param ancestorLoc
     * @param fsymtab
     */
    // function mergeSymtabToDirectAncestor(ancestorLoc: LocalsContainer, fsymtab: FloughSymtab): FloughSymtab {

    //     // const fsymtab = createFloughSymtab(loc, fsymtabAncestor);
    //     // return fsymtab;
    // }

    const setOfKeysToDeleteFromCurrentBranchesMap = new Map<GroupForFlow, Set<"then" | "else"> | undefined>();
    const getAnteConstraintItemAndSymtab = (): RefTypesSymtabConstraintItem => {


        let sc: RefTypesSymtabConstraintItem | undefined;
        if (groupForFlow.anteGroupLabels.length) {
            Debug.assert(groupForFlow.anteGroupLabels.length === 1);
            if (options && options.loopGroupIdx === groupForFlow.groupIdx) {
                sc = options.cachedSCForLoop;
            }
            else {
                const flowGroupLabel = groupForFlow.anteGroupLabels[0];
                sc = doFlowGroupLabel(flowGroupLabel, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
            }
            if (enablePerBlockSymtabs && !isRefTypesSymtabConstraintItemNever(sc)) {
                const prevFloughSymtabLocalContainer = sc.fsymtab!.getLocalsContainer();
                if (prevFloughSymtabLocalContainer !== groupForFlow.localsContainer){
                    const fsymtab = calculateFloughSymtab(sc.fsymtab!, groupForFlow);
                    return { ...sc, fsymtab };
                }
                // falls through
            }
            return sc;
        }
        if (groupForFlow.previousAnteGroupIdx !== undefined) {
            Debug.assert(!sc); // when previousAnteGroupIdx is present, anteGroupLabels.length must have been zero
            const prevAnteGroup = groupsForFlow.orderedGroups[groupForFlow.previousAnteGroupIdx];


            if (refactorConnectedGroupsGraphsGroupDependancyCountRemaining) {
                const rem = --sourceFileMrState.mrState.groupDependancyCountRemaining[groupForFlow.previousAnteGroupIdx];
                Debug.assert(rem >= 0);
                if (rem === 0) {
                    setOfKeysToDeleteFromCurrentBranchesMap.set(prevAnteGroup, undefined);
                }
            }
            else setOfKeysToDeleteFromCurrentBranchesMap.set(prevAnteGroup, undefined);

            const cbe = forFlow.currentBranchesMap.get(prevAnteGroup);
            if (!(cbe && cbe.kind === CurrentBranchesElementKind.plain)) {
                Debug.fail("unexpected");
            }
            if (enablePerBlockSymtabs && !isRefTypesSymtabConstraintItemNever(cbe.item.sc)) {

                const prevFloughSymtabLocalContainer = cbe.item.sc.fsymtab!.getLocalsContainer();
                if (prevFloughSymtabLocalContainer !== groupForFlow.localsContainer){
                    const fsymtab = calculateFloughSymtab(cbe.item.sc.fsymtab!, groupForFlow);

                    // Debug.assert(cbe.item.sc.fsymtab);
                    // let fsymtab: FloughSymtab;
                    // const fsymtabPrev = cbe.item.sc.fsymtab!;
                    // {
                    //     Debug.assert(prevFloughSymtabLocalContainer.pos !== groupForFlow.localsContainer.pos);
                    //     Debug.assert(prevFloughSymtabLocalContainer.end !== groupForFlow.localsContainer.end);
                    // }
                    // if (groupForFlow.localsContainer.pos>prevFloughSymtabLocalContainer.pos) {
                    //     if (groupForFlow.localsContainer.end<prevFloughSymtabLocalContainer.end) {
                    //         // descendent block of the previous block
                    //         const alocalsContainers: LocalsContainer[] = [];
                    //         let node = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
                    //         for (; node !== prevFloughSymtabLocalContainer; node = node.parent) {
                    //             Debug.assert(node);
                    //             if ((node as LocalsContainer).locals?.size) {
                    //                 alocalsContainers.push(node as LocalsContainer);
                    //             }
                    //         };
                    //         alocalsContainers.reverse();
                    //         fsymtab = fsymtabPrev;
                    //         alocalsContainers.forEach((localsContainers, idx) => fsymtab = createFloughSymtab(localsContainers, fsymtab));
                    //     }
                    //     else {
                    //         Debug.assert(groupForFlow.localsContainer.pos>prevFloughSymtabLocalContainer.end);
                    //         // Neither parent not child block of previous block, find shared ancestor
                    //         const sharedAncestor = findSharedAncestorLocalsContainer(prevFloughSymtabLocalContainer!, groupForFlow.localsContainer);


                    //         fsymtab = floughSymtabRollupToAncestor(fsymtabPrev, sharedAncestor);
                    //     }
                    // }
                    // else {
                    //     Debug.assert(groupForFlow.localsContainer.pos<prevFloughSymtabLocalContainer.end);
                    //     // groupForFlow.localsContainer.pos < prevAnteGroup.localsContainer.pos
                    //     if (groupForFlow.localsContainer.end>prevFloughSymtabLocalContainer.end) {
                    //         // ancestor block of the previous block
                    //         fsymtab = floughSymtabRollupToAncestor(fsymtabPrev, groupForFlow.localsContainer);
                    //     }
                    //     else {
                    //         Debug.assert(false, undefined, ()=>`unexpected prev:(${prevFloughSymtabLocalContainer.pos},${prevFloughSymtabLocalContainer.end}
                    //             ), this:(${groupForFlow.localsContainer!.pos},${groupForFlow.localsContainer!.end})`)
                    //     }
                    // }
                    return { ...cbe.item.sc, fsymtab };
                }
                // falls through
            }

            return { ...cbe.item.sc };
        }

        // enablePerBlockSymbtabs
        /**
         * If there is not a current symtab, then initialize the symbtab chain.
         * Else,  if the current symbtabs block is not the same as the current block, then check for intermediate block locals and add to symtab chanin as necessary.
         */
        if (enablePerBlockSymtabs) {
            const alocalsContainers: LocalsContainer[] = [];
            let node = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
            for (; node; node = node.parent) {
                if ((node as LocalsContainer).locals?.size) {
                    alocalsContainers.push(node as LocalsContainer);
                }
            };
            alocalsContainers.reverse();
            if (IDebug.isActive(loggerLevel)) {
                IDebug.ilog(()=>`resolveGroupForFlow[dbg] alocals.length:${alocalsContainers.length}`, loggerLevel);
                alocalsContainers.forEach((localsContainers, idx) => {
                    let astr: string[]=[];
                    localsContainers.locals?.forEach(s=> astr.push(IDebug.dbgs.symbolToString(s)));
                    IDebug.ilog(()=>`resolveGroupForFlow[dbg] alocals[${idx}]: ${astr.join(", ")}`, loggerLevel);
                });
            }
            Debug.assert(alocalsContainers.length >= 1);
            let fsymtab: FloughSymtab | undefined;
            alocalsContainers.forEach((localsContainers, idx) => {
                if (!fsymtab) fsymtab = createFloughSymtab(localsContainers);
                else fsymtab = createFloughSymtab(localsContainers, fsymtab);
            });
            return { fsymtab, symtab: createRefTypesSymtab(), constraintItem: createFlowConstraintAlways() };
        }
        else return { symtab: createRefTypesSymtab(), constraintItem: createFlowConstraintAlways() };
    };

    const anteSCArg = getAnteConstraintItemAndSymtab();



    /**
     * Delete all the no-longer-needed CurrentBranchElements.
     */
    setOfKeysToDeleteFromCurrentBranchesMap.forEach((set, gff) => forFlow.currentBranchesMap.delete(gff, set));
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilog(()=>`resolveGroupForFlow[dbg] result of getAnteConstraintItemAndSymtab():`, loggerLevel);
        if (!isRefTypesSymtabConstraintItemNever(anteSCArg)) {
            mrNarrow.dbgRefTypesSymtabToStrings(anteSCArg.symtab!).forEach(s => {
                IDebug.ilog(()=>`resolveGroupForFlow[dbg] symtab: ${s}`, loggerLevel);
            });
            if (!anteSCArg.fsymtab) IDebug.ilog(()=>`resolveGroupForFlow[dbg] fsymtab: <undef>`, loggerLevel);
            else {
                dbgFloughSymtabToStrings(anteSCArg.fsymtab).forEach(s => {
                    IDebug.ilog(()=>`resolveGroupForFlow[dbg] fsymtab: ${s}`, loggerLevel);
                });
            }
        }
        mrNarrow.dbgConstraintItem(anteSCArg.constraintItem).forEach(s => {
            IDebug.ilog(()=>`resolveGroupForFlow[dbg] constraintItem: ${s}`, loggerLevel);
        });
        IDebug.ilog(()=>`resolveGroupForFlow[dbg] end of result of getAnteConstraintItemAndSymtab():`, loggerLevel);
    }




    const crit: FloughCrit = !floughStatus.inCondition ? { kind: FloughCritKind.none } : { kind: FloughCritKind.truthy, alsoFailing: true };
    Debug.assert(forFlow.groupToNodeToType);

    let scpassing: RefTypesSymtabConstraintItem;
    let scfailing: RefTypesSymtabConstraintItem | undefined;

    floughStatus.isInLoop = !!forFlow.loopState;
    if (getDevDebugger(maximalNode, sourceFileMrState.sourceFile)) {
        debugger;
    }
    const mntr = sourceFileMrState.mrNarrow.flough({
        sci: anteSCArg,
        expr: maximalNode,
        crit,
        qdotfallout: undefined,
        floughStatus: floughStatus,
    });

    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilog(()=>`resolveGroupForFlow[after flough]${IDebug.dbgs.nodeToString(maximalNode)}`, loggerLevel);
    }

    if (!floughStatus.inCondition) {
        scpassing = applyCritNoneUnion(mntr, floughStatus.groupNodeToTypeMap).sci;
        if (enablePerBlockSymtabs){
            Debug.assert(!scpassing.symtab || scpassing.fsymtab);
        }
    }
    else {
        const critret = applyCrit(mntr, { kind: FloughCritKind.truthy, alsoFailing: true }, floughStatus.groupNodeToTypeMap);
        scpassing = critret.passing.sci;
        scfailing = critret.failing!.sci;
        if (enablePerBlockSymtabs){
            Debug.assert(!scpassing.symtab || scpassing.fsymtab);
            Debug.assert(!scfailing?.symtab || scfailing.fsymtab);
        }

    }
    if (floughStatus.inCondition) {

        const cbe: CurrentBranchElementTF = {
            kind: CurrentBranchesElementKind.tf,
            gff: groupForFlow,
            falsy: {
                sc: { symtab: scfailing!.symtab, fsymtab: scfailing!.fsymtab, constraintItem: scfailing!.constraintItem },
            },
            truthy: {
                sc: { symtab: scpassing.symtab, fsymtab: scpassing.fsymtab, constraintItem: scpassing.constraintItem },
            },
        };
        if (!floughStatus.accumBranches) {
            Debug.assert(!forFlow.currentBranchesMap.has(groupForFlow));
            forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }
        else {
            Debug.fail("unexpected");
        }
    }
    else {
        const cbe: CurrentBranchElementPlain = {
            kind: CurrentBranchesElementKind.plain,
            gff: groupForFlow,
            item: {
                sc: { symtab: scpassing.symtab, fsymtab: scpassing.fsymtab, constraintItem: scpassing.constraintItem },
            },
        };
        if (!floughStatus.accumBranches) {
            Debug.assert(!forFlow.currentBranchesMap.has(groupForFlow));
            if (enablePerBlockSymtabs){
                const depCount = sourceFileMrState.groupsForFlow.connectedGroupsGraphs.arrGroupIndexToDependantCount[groupForFlow.groupIdx]
                if (depCount) forFlow.currentBranchesMap.set(groupForFlow, cbe);
            }
            else forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }
    }
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilog(()=>`resolveGroupForFlow[dbg:] currentBranchesMap[after]:`, loggerLevel);
        dbgForFlow(sourceFileMrState, forFlow).forEach(s => IDebug.ilog(()=>`resolveGroupForFlow[dbg:] currentBranchesMap[after]: ${s}`, loggerLevel));
        IDebug.ilog(()=>`resolveGroupForFlow[dbg:] endof currentBranchesMap[after]:`, loggerLevel);
        dbgNodeToTypeMap(floughStatus.groupNodeToTypeMap).forEach(str => {
            IDebug.ilog(()=>`resolveGroupForFlow[dbg] groupNodeToTypeMap: ${str}`, loggerLevel);
        });
        IDebug.ilogGroupEnd(()=>`resolveGroupForFlow[out]: ${IDebug.dbgs.nodeToString(maximalNode)}, `, loggerLevel);
    }
}
export function getTypeByFlough(reference: Node, sourceFileMrState: SourceFileFloughState): Type {
    const loggerLevel = 2;
    if (IDebug.isActive(loggerLevel)) IDebug.ilogGroup(()=>`getTypeByMrNarrow[in] expr: ${IDebug.dbgs.nodeToString(reference)}`, loggerLevel);
    const type = getTypeByMrNarrowAux(reference, sourceFileMrState);
    if (IDebug.isActive(loggerLevel)) {
        IDebug.ilogGroupEnd(()=>`getTypeByMrNarrow[out] expr: ${IDebug.dbgs.nodeToString(reference)} -> ${IDebug.dbgs.typeToString(type)}`, loggerLevel);
    }
    return type;
}
export function getTypeByMrNarrowAux(expr: Node, sourceFileMrState: SourceFileFloughState): Type {
    const loggerLevel = 2;
    const { mrState /* refTypesTypeModule */ } = sourceFileMrState;

    // upto commit 4690571dd432 was (mrState.dataForGetTypeOfExpressionShallowRecursive?.expr) {}
    if (mrState.dataForGetTypeOfExpressionShallowRecursive?.expr === expr) {
        /**
         * It turns out that the upper "checkeExpression" software will try to do minor flow analsis outside of the scope
         * of mrState.dataForGetTypeOfExpressionShallowRecursive.expr, so the original design doesn't work.
         * However the queries should be answerable below with groupNodeToTypeMap, so we need to fall through to that,
         * and only fail if that doesn't work.
         */
        if (IDebug.isActive(loggerLevel)) {
            IDebug.ilog(()=>`getTypeByMrNarrowAux[dbg]: !!mrState.dataForGetTypeOfExpressionShallowRecursive: ${IDebug.dbgs.nodeToString(expr)}`, loggerLevel);
            // let p = expr;
            // while (p!==mrState.dataForGetTypeOfExpressionShallowRecursive.expr && p.kind!==SyntaxKind.SourceFile) p=p.parent;
            // Debug.assert(p===mrState.dataForGetTypeOfExpressionShallowRecursive.expr, "unexpected");
        }
        const tstype = mrState.dataForGetTypeOfExpressionShallowRecursive.tmpExprNodeToTypeMap.get(expr);
        // Debug.assert(tstype);
        if (tstype) return tstype;
        IDebug.ilog(()=>`getTypeByMrNarrowAux[dbg]: !!mrState.dataForGetTypeOfExpressionShallowRecursive: step 1 failed, trying groupsForFlow.nodeToGroupMap`, loggerLevel);
    }

    const groupsForFlow = sourceFileMrState.groupsForFlow;
    const groupForFlow = (() => {
        let parent = expr;
        let fg = groupsForFlow.nodeToGroupMap.get(expr);
        if (fg) return fg;
        while (!fg && parent && parent.kind !== SyntaxKind.SourceFile && !(fg = groupsForFlow.nodeToGroupMap.get(parent))) parent = parent.parent;
        return fg;
    })();
    if (!groupForFlow) {
        if (IDebug.isActive(loggerLevel)) {
            IDebug.ilog(()=>`getTypeByMrNarrowAux[dbg]: reference: ${IDebug.dbgs.nodeToString(expr)}, does not have flowGroup`, loggerLevel);
        }
        // TODO: This is almost certainly never taken.
        Debug.fail("unexpected");
        switch (expr.kind) {
            case SyntaxKind.Identifier: {
                const getResolvedSymbol = sourceFileMrState.mrState.checker.getResolvedSymbol;
                const getTypeOfSymbol = sourceFileMrState.mrState.checker.getTypeOfSymbol;
                const symbol = getResolvedSymbol(expr as Identifier);
                const tstype = getTypeOfSymbol(symbol);
                return tstype;
            }
        }
        Debug.fail();
    }
    if (IDebug.isActive(loggerLevel)) {
        const maxnode = sourceFileMrState.groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
        IDebug.ilog(()=>`getTypeByMrNarrowAux[dbg]: reference: ${IDebug.dbgs.nodeToString(expr)}, maximalNode: ${IDebug.dbgs.nodeToString(maxnode)}`, loggerLevel);
    }
    /**
     * If the type for expr is already in groupToNodeToType?.get(groupForFlow)?.get(expr) then return that.
     * It is likely to be a recursive call via checker.getTypeOfExpression(...), e.g. from "case SyntaxKind.ArrayLiteralExpression"
     */
    let cachedType = sourceFileMrState.mrState.forFlowTop.groupToNodeToType?.get(groupForFlow)?.get(expr);
    /**
     * ONLY applicable when using connectGroupsGraphs:
     * some nodes with "never" type are not in groupToNodeToType?.get(groupForFlow) - because the processing was skipped due to being in a never branch.
     * In that case, return the never type.
     * Before refactoring with connectGroupsGraphs, we wouldn't know whether the node was in a never branch or not,
     * so we recomputed the type - which is more expensive.
     * But connectGroupsGraphs, we know from sourceFileMrState.mrState.XXX when the graph was completed or not, and if it was completed,
     * then !cachedType implies that the node is in a never branch.
     */
    if (refactorConnectedGroupsGraphsUpdateHeapWithConnectedGroupsGraph) {
        if (!cachedType) {
            const graphIndex = groupsForFlow.connectedGroupsGraphs.arrGroupIndexToConnectGraph[groupForFlow.groupIdx];
            if (mrState.connectGroupsGraphsCompleted[graphIndex]) {
                if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`getTypeByMrNarrowAux[dbg]: virtual cache hit, never branch in completed graph`, loggerLevel);
                cachedType = sourceFileMrState.mrState.checker.getNeverType();
            }
        }
    }
    if (cachedType) {
        if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`getTypeByMrNarrowAux[dbg]: cache hit`, loggerLevel);
        return cachedType;
    }

    if (mrState.dataForGetTypeOfExpressionShallowRecursive?.returnErrorTypeOnFail) {
        if (IDebug.isActive(loggerLevel)) {
            IDebug.ilog(()=>`getTypeByMrNarrowAux[dbg]: !!mrState.dataForGetTypeOfExpressionShallowRecursive step 2 failed, returnErrorTypeOnFail`, loggerLevel);
        }
        return sourceFileMrState.mrState.checker.getErrorType();
    }

    Debug.assert(sourceFileMrState.mrState.recursionLevel === 0, "expected sourceFileMrState.mrState.recursionLevel===0");
    sourceFileMrState.mrState.recursionLevel++;
    if (refactorConnectedGroupsGraphsUpdateHeapWithConnectedGroupsGraph) {
        updateHeapWithConnectedGroupsGraph(groupForFlow, sourceFileMrState, sourceFileMrState.mrState.forFlowTop);
    }
    else {
        updateHeapWithGroupForFlow(groupForFlow, sourceFileMrState, sourceFileMrState.mrState.forFlowTop);
    }
    resolveHeap(sourceFileMrState, sourceFileMrState.mrState.forFlowTop, /*withinLoop*/ false);
    sourceFileMrState.mrState.recursionLevel--;
    return sourceFileMrState.mrState.forFlowTop.groupToNodeToType?.get(groupForFlow)?.get(expr) ?? sourceFileMrState.mrState.checker.getNeverType();
}
function dbgNodeToTypeMap(map: Readonly<NodeToTypeMap>): string[] {
    const astr: string[] = [];
    map.forEach((t, n) => {
        astr.push(`[node:${IDebug.dbgs.nodeToString(n)}] -> type:${IDebug.dbgs.typeToString(t)}`);
    });
    return astr;
}
function dbgCurrentBranchesItem(cbi: CurrentBranchesItem, mrNarrow: MrNarrow): string[] {
    const astr: string[] = [];
    // astr.push(`nodeToTypeMap:`);
    if (!cbi.sc.symtab) astr.push("symtab: <undef>");
    else astr.push(...mrNarrow.dbgRefTypesSymtabToStrings(cbi.sc.symtab).map(s => `symtab:         ${s}`));
    if (!cbi.sc.fsymtab) astr.push("fsymtab: <undef>");
    else astr.push(...dbgFloughSymtabToStrings(cbi.sc.fsymtab).map(s => `fsymtab:         ${s}`));
    astr.push(...mrNarrow.dbgConstraintItem(cbi.sc.constraintItem).map(s => `constraintItem: ${s}`));
    return astr;
}
function dbgCurrentBranchElement(cbe: CurrentBranchElement, sourceFileMrState: SourceFileFloughState): string[] {
    const g = cbe.gff;
    const astr: string[] = [];
    const maximalNode = sourceFileMrState.groupsForFlow.posOrderedNodes[g.maximalIdx];
    astr.push(`groupIdx:${g.groupIdx}, cbe.kind:${cbe.kind}, node:[${IDebug.dbgs.nodeToString(maximalNode)}]`);
    if (cbe.kind === CurrentBranchesElementKind.plain) {
        astr.push(...dbgCurrentBranchesItem(cbe.item, sourceFileMrState.mrNarrow).map(s => "  " + s));
    }
    else if (cbe.kind === CurrentBranchesElementKind.tf) {
        if (cbe.truthy) {
            astr.push("  true:");
            astr.push(...dbgCurrentBranchesItem(cbe.truthy, sourceFileMrState.mrNarrow).map(s => "      " + s));
        }
        if (cbe.falsy) {
            astr.push("  false:");
            astr.push(...dbgCurrentBranchesItem(cbe.falsy, sourceFileMrState.mrNarrow).map(s => "      " + s));
        }
    }
    return astr;
}

function dbgCurrentBranchesMap(currentBranchesMap: CurrentBranchesMap, sourceFileMrState: SourceFileFloughState): string[] {
    const astr: string[] = [];
    currentBranchesMap.forEach((cbe, g) => {
        const maximalNode = sourceFileMrState.groupsForFlow.posOrderedNodes[g.maximalIdx];
        astr.push(`[${IDebug.dbgs.nodeToString(maximalNode)}]:`);
        astr.push(`  groupIdx:${g.groupIdx}`);
        astr.push(`  cbe.kind:${cbe.kind}`);
        if (cbe.kind === CurrentBranchesElementKind.plain) {
            astr.push(...dbgCurrentBranchesItem(cbe.item, sourceFileMrState.mrNarrow).map(s => "    " + s));
        }
        else if (cbe.kind === CurrentBranchesElementKind.tf) {
            if (cbe.truthy) {
                astr.push("    true:" + (cbe.truthyDone ? "[deleted]" : ""));
                astr.push(...dbgCurrentBranchesItem(cbe.truthy, sourceFileMrState.mrNarrow).map(s => "      " + s));
            }
            if (cbe.falsy) {
                astr.push("    false:" + (cbe.falsyDone ? "[deleted]" : ""));
                astr.push(...dbgCurrentBranchesItem(cbe.falsy, sourceFileMrState.mrNarrow).map(s => "      " + s));
            }
        }
        const depCountRem = sourceFileMrState.mrState.groupDependancyCountRemaining[g.groupIdx];
        const depCount = sourceFileMrState.groupsForFlow.connectedGroupsGraphs.arrGroupIndexToDependantCount[g.groupIdx];
        astr.push(`  depCountRem:${depCountRem}, depCount:${depCount}`);
    });
    return astr;
}

/* @ ts-ignore */
function dbgForFlow(sourceFileMrState: SourceFileFloughState, forFlow: ForFlow): string[] {
    const astr: string[] = [];
    astr.push(`forFlow.currentBranchesMap.size:${forFlow.currentBranchesMap.size}`);
    dbgCurrentBranchesMap(forFlow.currentBranchesMap, sourceFileMrState).forEach(s => astr.push(`forFlow.currentBranchesMap: ${s}`));
    forFlow.groupToNodeToType?.forEach((map, g) => {
        astr.push(...dbgNodeToTypeMap(map).map(s => `groupIdx:${g.groupIdx}: ${s}`));
    });
    return astr;
}


