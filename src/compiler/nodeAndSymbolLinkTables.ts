import {
    Debug,
    JsxFlags,
    Node,
    NodeCheckFlags,
    NodeLinks,
    Signature,
    Symbol,
    SymbolFlags,
    SymbolLinks,
    SymbolTable,
    TransientSymbol,
    Type,
    TypeChecker,
    getNodeId,
    getSymbolId,
    castHereafter,
} from "./_namespaces/ts";

import {
    DifferentialTable,
} from "./differentialTable";

import { IDebug } from "./mydebug";


const symbolLinksKeys = [
    "immediateTarget",
    "aliasTarget",
    "target",
    "type",
    "writeType",
    "nameType",
    "uniqueESSymbolType",
    "declaredType",
    "typeParameters",
    "outerTypeParameters",
    "instantiations",
    "aliasSymbol",
    "aliasTypeArguments",
    "inferredClassSymbol",
    "mapper",
    "referenced",
    "constEnumReferenced",
    "containingType",
    "leftSpread",
    "rightSpread",
    "syntheticOrigin",
    "isDiscriminantProperty",
    "resolvedExports",
    "resolvedMembers",
    "exportsChecked",
    "typeParametersChecked",
    "isDeclarationWithCollidingName",
    "bindingElement",
    "exportsSomeValue",
    "enumKind",
    "originatingImport",
    "lateSymbol",
    "specifierCache",
    "extendedContainers",
    "extendedContainersByFile",
    "variances",
    "deferralConstituents",
    "deferralWriteConstituents",
    "deferralParent",
    "cjsExportMerged",
    "typeOnlyDeclaration",
    "isConstructorDeclaredProperty",
    "tupleLabelDeclaration",
    "accessibleChainCache",
    "typeOnlyExportStarMap",
    "typeOnlyExportStarName",
    "filteredIndexSymbolCache",
    "_symbolLinksBrand"
] as const;
const nodeLinksKeys = [
    "flags",
    "resolvedType",
    "resolvedEnumType",
    "resolvedSignature",
    "resolvedSymbol",
    "resolvedIndexInfo",
    "effectsSignature",
    "enumMemberValue",
    "isVisible",
    "containsArgumentsReference",
    "hasReportedStatementInAmbientContext",
    "jsxFlags",
    "resolvedJsxElementAttributesType",
    "resolvedJsxElementAllAttributesType",
    "resolvedJSDocType",
    "switchTypes",
    "jsxNamespace",
    "jsxImplicitImportContainer",
    "contextFreeType",
    "deferredNodes",
    "capturedBlockScopeBindings",
    "outerTypeParameters",
    "isExhaustive",
    "skipDirectInference",
    "declarationRequiresScopeChange",
    "serializedTypes",
    "decoratorSignature", "spreadIndices",
    "parameterInitializerContainsUndefined",
    "fakeScopeForSignatureDeclaration",
    "assertionExpressionType",
] as const;

type SymbolKeysFromArray = typeof symbolLinksKeys[number];
type SymbolKeysFromType = keyof SymbolLinks;
type SymbolKeysInArrayNotInType = Exclude<SymbolKeysFromArray, SymbolKeysFromType>;
type SymbolKeysInTypeNotInArray = Exclude<SymbolKeysFromType, SymbolKeysFromArray>;

type NodeKeysFromArray = typeof nodeLinksKeys[number];
type NodeKeysFromType = keyof NodeLinks;
type NodeKeysInArrayNotInType = Exclude<NodeKeysFromArray, NodeKeysFromType>;
type NodeKeysInTypeNotInArray = Exclude<NodeKeysFromType, NodeKeysFromArray>;
{
    (null as any as SymbolKeysInArrayNotInType) satisfies never;
    (null as any as SymbolKeysInTypeNotInArray) satisfies never;
    (null as any as NodeKeysInArrayNotInType) satisfies never;
    (null as any as NodeKeysInTypeNotInArray) satisfies never;
}

export type SignatureWithLinksState = & {signature: Signature, readonlyState: ReadonlyNodeAndSymbolLinksTable };


type DifferentialSymbolLinksTable = DifferentialTable<SymbolLinks, Symbol>;
type DifferentialNodeLinksTable = DifferentialTable<NodeLinks, Node>;


export type ReadonlyNodeAndSymbolLinksTable = & {
    readonlyNodeLinksTable: { readonlyTable: Readonly<DifferentialNodeLinksTable>, originalReadonlyMode: boolean },
    readonlySymbolLinksTable: { readonlyTable: Readonly<DifferentialSymbolLinksTable>, originalReadonlyMode: boolean },
};

const NodeLinksProxyCtor = createTableClassProxyRecordRW<NodeLinks>(nodeLinksKeys,"NodeLinks");
const SymbolLinksProxyCtor = createTableClassProxyRecordRW<SymbolLinks>(symbolLinksKeys,"SymbolLinks");

type SymbolLinksProxy = ClassProxyRecordRW<SymbolLinks>;
type NodeLinksProxy = ClassProxyRecordRW<NodeLinks>;


function consoleGroup(...args: any[]): void {
    args;
}
function consoleGroupEnd(...args: any[]): void {
    args;
}
function consoleLog(...args: any[]): void {
    args;
}

function typeToStringSafe(checker: TypeChecker, type?: Type): string {
    if (!type) return "<undef>";
    const saved = checker.getNodeAndSymbolLinksTableState().getReadonlyStateThenBranchState();
    const str = checker.typeToString(type);
    checker.getNodeAndSymbolLinksTableState().restoreState(saved);
    return str;
}
function signatureToStringSafe(checker: TypeChecker, signature: Signature): string {
    const saved = checker.getNodeAndSymbolLinksTableState().getReadonlyStateThenBranchState();
    const str = checker.signatureToString(signature);
    checker.getNodeAndSymbolLinksTableState().restoreState(saved);
    return str;
}



const nodeLinksConstructor = () => ({
    flags:NodeCheckFlags.None,
    jsxFlags:JsxFlags.None,
} as NodeLinks);
const symbolLinksConstructor = () => ({
} as SymbolLinks);

const overrideCtorCopy = {
    nodeLinks:{
        ctor: ()=>{
            const obj = nodeLinksConstructor();
            const proxy = new NodeLinksProxyCtor(obj);
            return proxy as unknown as NodeLinks;
        },
        copy: (nodeLinks: Readonly<NodeLinks>) => {
            if (nodeLinks instanceof NodeLinksProxyCtor) nodeLinks = nodeLinks.proxied;
            const obj = { ...nodeLinks };
            const proxy = new NodeLinksProxyCtor(obj);
            return proxy as unknown as NodeLinks;
        }
    },
    symbolLinks:{
        ctor: ()=>{
            const obj = symbolLinksConstructor();
            const proxy = new SymbolLinksProxyCtor(obj);
            return proxy as unknown as SymbolLinks;
        },
        copy: (symbolLinks: Readonly<SymbolLinks>) => {
            if (symbolLinks instanceof SymbolLinksProxyCtor) symbolLinks = symbolLinks.proxied;
            const obj = { ...symbolLinks };
            const proxy = new SymbolLinksProxyCtor(obj);
            return proxy as unknown as SymbolLinks;
        }
    },
};



export class NodeAndSymbolLinksTableState {
    nodeLinksTable: DifferentialNodeLinksTable;
    symbolLinksTable: DifferentialSymbolLinksTable;
    constructor() {
        this.nodeLinksTable = new DifferentialTable<NodeLinks, Node>(undefined, nodeLinksConstructor);
        this.symbolLinksTable = new DifferentialTable<SymbolLinks, Symbol>(undefined, symbolLinksConstructor);
    }
    /**
     * whole state operations
     */
    getReadonlyState(): ReadonlyNodeAndSymbolLinksTable{
        const n = this.nodeLinksTable.getReadonlyTable();
        const s = this.symbolLinksTable.getReadonlyTable();
        return { readonlySymbolLinksTable: s, readonlyNodeLinksTable: n };
    }
    branchState(useProxies?: boolean): void {
        this.nodeLinksTable = this.nodeLinksTable.setTableToReadonlyAndGetBranchTable(
            useProxies?overrideCtorCopy.nodeLinks:undefined).branchTable;
        this.symbolLinksTable = this.symbolLinksTable.setTableToReadonlyAndGetBranchTable(
            useProxies?overrideCtorCopy.symbolLinks:undefined).branchTable;
    }
    getReadonlyStateThenBranchState(useProxies?: boolean): ReadonlyNodeAndSymbolLinksTable {
        const r = this.getReadonlyState();
        this.branchState(useProxies);
        return r;
    }
    restoreState(savedTables: ReadonlyNodeAndSymbolLinksTable): void {
        this.symbolLinksTable = savedTables.readonlySymbolLinksTable.readonlyTable as DifferentialSymbolLinksTable;
        this.symbolLinksTable.setTableReadonlyMode(savedTables.readonlySymbolLinksTable.originalReadonlyMode);
        this.nodeLinksTable = savedTables.readonlyNodeLinksTable.readonlyTable as DifferentialNodeLinksTable;
        this.nodeLinksTable.setTableReadonlyMode(savedTables.readonlyNodeLinksTable.originalReadonlyMode);
    }

    /**
     * one link operations
     */
    getSymbolLinks(symbol: Symbol): SymbolLinks {
        // We should get the symbol id that so that it is allocated which makes debugging easier
        getSymbolId(symbol);
        if (symbol.flags & SymbolFlags.Transient) return (symbol as TransientSymbol).links;
        return this.symbolLinksTable.getWritableAlways(symbol);
    }
    setSymbolLinks(symbol: Symbol, symbolLinks: SymbolLinks): void {
        // We should get the symbol id that so that it is allocated which makes debugging easier
        //if (this.symbolLinksTable.setTableReadonlyModeetReadonlyState())
        if (symbol.flags & SymbolFlags.Transient) Debug.fail("should not be writing a transient symbol");
        Debug.assert(!(symbolLinks instanceof SymbolLinksProxyCtor), "symbolLinks should not be a proxy");
        this.symbolLinksTable.set(symbol, symbolLinks);
    }
    hasNodeLinks(node: Node): boolean {
        return this.nodeLinksTable.has(node);
    }
    getNodeLinks(node: Node): NodeLinks {
        // We should get the node id that so that it is allocated which makes debugging easier
        getNodeId(node);
        return this.nodeLinksTable.getWritableAlways(node);
    }
    getNodeCheckFlags(node: Node): NodeCheckFlags {
        // eslint-disable-next-line no-in-operator
        // if (!("id" in node)) return 0 as NodeCheckFlags; // why not make 0 a NodeCheckFlags value if it has meaning,
        // const nodeId = node.id!;
        // if (nodeId < 1 || nodeId >= getNextNodeId()) return 0 as NodeCheckFlags;
        if (this.hasNodeLinks(node)) return this.getNodeLinks(node).flags;
        // some nodes with id between 1 and getNextNodeId()-1 may have no corresponding nodeLinks entry
        return 0 as NodeCheckFlags;
    }
}
export function joinLinksStatesAndWriteBack(
    checker: TypeChecker,
    states: Readonly<ReadonlyNodeAndSymbolLinksTable[]>,
    writeableTargetBranch: NodeAndSymbolLinksTableState): void {

    function doSymbolLinks(){
        const mapSymbolToChangedKeyValues = new Map<Symbol, Map<keyof SymbolLinks,Set<any>>>();
        function addToSet(innerMap: Map<keyof SymbolLinks,Set<any>>, key: keyof SymbolLinks, value: any) {
            let set = innerMap.get(key);
            if (!set) innerMap.set(key, set = new Set());
            set.add(value);
        }
        for (const state of states) {
            //const state = states[i];
            const map = state.readonlySymbolLinksTable.readonlyTable.getReadonlyMapOfCurrentBranch();
            map.forEach((symbolLinksProxy, tssymbol) => {
                if (IDebug.assertLevel) Debug.assert(symbolLinksProxy instanceof SymbolLinksProxyCtor, "symbolLinks should be a proxy");
                castHereafter<SymbolLinksProxy>(symbolLinksProxy);
                const slorig = symbolLinksProxy.proxied;
                Debug.assert(!(slorig instanceof SymbolLinksProxyCtor), "symbolLinks should not be a proxy");
                const keys: string[] = [];
                for (const key in symbolLinksProxy.wasMaybeWrit) keys.push(key);
                if (keys.length===0) return;
                let mapWrit = mapSymbolToChangedKeyValues.get(tssymbol);
                if (!mapWrit) mapSymbolToChangedKeyValues.set(tssymbol, mapWrit = new Map());
                keys.forEach((key) => {
                    if (IDebug.assertLevel) {
                        Debug.assert(symbolLinksKeys.includes(key as any), "key should be in symbolLinksKeys", ()=>key);
                    }
                    addToSet(mapWrit!, key as any, slorig[key as keyof SymbolLinks]);
                });
            });
        }
        mapSymbolToChangedKeyValues.forEach((innerMap, tssymbol) => {
            const symbolLinksTarget = writeableTargetBranch.getSymbolLinks(tssymbol);
            innerMap.forEach((set, key) => {
                if (set.size === 1) {
                    const value = set.values().next().value;
                    //symbolLinksTarget[key] = value; // Expression produces a union type that is too complex to represent.ts(2590)
                    (symbolLinksTarget as Record<string,any>)[key] = value;
                }
                else {
                    const arrValue: unknown[] = [];
                    set.forEach(value => arrValue.push(value));
                    switch (key) {
                        case "declaredType":
                        case "type":{
                            const type = checker.getUnionType(arrValue as Type[]);
                            symbolLinksTarget[key] = type;
                        }
                        break;
                        // explicitly list the ones we *hope* can be ignored
                        case "resolvedMembers":
                        case "uniqueESSymbolType":
                        case "lateSymbol":
                        case "resolvedExports":
                        break;
                        default:
                            Debug.assert(false, `Unhandled key of SymbolLinks: `,()=>key);

                    }
                }
            });
        });
    }
    function doNodeLinks(){
        const mapNodeToChangedKeyValues = new Map<Node, Map<keyof NodeLinks,Set<any>>>();
        function addToSet(innerMap: Map<keyof NodeLinks,Set<any>>, key: keyof NodeLinks, value: any) {
            let set = innerMap.get(key);
            if (!set) innerMap.set(key, set = new Set());
            set.add(value);
        }
        for (const state of states) {
            //const state = states[i];
            const map = state.readonlyNodeLinksTable.readonlyTable.getReadonlyMapOfCurrentBranch();
            map.forEach((nodeLinksProxy, tsnode) => {
                if (IDebug.assertLevel) Debug.assert(nodeLinksProxy instanceof NodeLinksProxyCtor, "nodeLinks should be a proxy");
                castHereafter<NodeLinksProxy>(nodeLinksProxy);
                const nlorig = nodeLinksProxy.proxied;
                Debug.assert(!(nlorig instanceof NodeLinksProxyCtor), "symbolLinks should not be a proxy");
                const keys: string[] = [];
                for (const key in nodeLinksProxy.wasMaybeWrit) keys.push(key);
                if (keys.length===0) return;
                let mapWrit = mapNodeToChangedKeyValues.get(tsnode);
                if (!mapWrit) mapNodeToChangedKeyValues.set(tsnode, mapWrit = new Map());
                keys.forEach((key) => {
                    if (IDebug.assertLevel) {
                        Debug.assert(nodeLinksKeys.includes(key as any), "key should be in nodeLinksKeys", ()=>key);
                    }
                    addToSet(mapWrit!, key as any, nlorig[key as keyof NodeLinks]);
                });
            });
        }
        mapNodeToChangedKeyValues.forEach((innerMap, tsnode) => {
            const nodeLinksTarget = writeableTargetBranch.getNodeLinks(tsnode);
            innerMap.forEach((set, key) => {
                if (set.size === 1) {
                    const value = set.values().next().value;
                    //nodeLinksTarget[key] = value; // Expression produces a union type that is too complex to represent.ts(2590)
                    (nodeLinksTarget as Record<string,any>)[key] = value;
                }
                else {
                    const arrValue: unknown[] = [];
                    set.forEach(value => arrValue.push(value));
                    switch (key) {
                        case "resolvedSignature":{
                            castHereafter<Signature[]>(arrValue);
                            const [...signatures] = checker.getUnionSignatures(arrValue.map((s: Signature)=>[s]));
                            Debug.assert(signatures.length === 1, "signatures.length should be 1");
                            nodeLinksTarget[key] = signatures[0];
                            break;
                        }
                        case "resolvedType":{
                            const type = checker.getUnionType(arrValue as Type[]);
                            nodeLinksTarget[key] = type;
                            break;
                        }
                        case "resolvedSymbol":
                            Debug.assert(false, "more than one resolvedSymbol, not yet implemented",
                                ()=>(arrValue as Symbol[]).map(s=>`${checker.symbolToString(s)}, id:${s.id}`).join("; "));
                            break;
                        // explicitly list the ones we *hope* can be ignored
                        case "deferredNodes":
                        case "outerTypeParameters":
                        break;
                        default:
                            Debug.assert(false, `Unhandled key of NodeLinks: `,()=>key);

                    }
                }
            });
        });
    }
    doSymbolLinks();
    doNodeLinks();
}

export function dbgLinksStatesBeforeJoin(
    nodeAndSymbolLinkTablesState: NodeAndSymbolLinksTableState,
    checker: TypeChecker,
    states: Readonly<ReadonlyNodeAndSymbolLinksTable[]>,
    prevBranch: Readonly<ReadonlyNodeAndSymbolLinksTable>): void {

    // Probably the same as prevBranch, but we don't want to assume that
    const savedState = nodeAndSymbolLinkTablesState.getReadonlyState();
    for (let i = 0; i<states.length; i++) {
        consoleLog(`state ${i}`);
        const state = states[i];
        /**
         * Because the debug code will call getSymbolLinks and getNodeLinks, we need to set the current state to state.
         * This is because getSymbolLinks and getNodeLinks will use the current state to get the links.
         */
        nodeAndSymbolLinkTablesState.restoreState(state);
        /**
         * We do not branch state because we want to see the differentials in the current branch "state".
         */
        {
            const map = state.readonlySymbolLinksTable.readonlyTable.getReadonlyMapOfCurrentBranch();
            map.forEach((symbolLinks, tssymbol) => {
                consoleGroup(`tssymbol: ${checker.symbolToString(tssymbol)}, id:${getSymbolId(tssymbol)}}`);
                if (symbolLinks instanceof SymbolLinksProxyCtor) {
                    //castHereafter<>(symbolLinks);
                    const keyset: Set<keyof SymbolLinks> = new Set();
                    Object.keys(symbolLinks.wasMaybeWrit).forEach((k)=>keyset.add(k as any)); //((_, key) => keyset.add(key));
                    Object.keys(symbolLinks.wasWrit).forEach((k)=>keyset.add(k as any)); //((_, key) => keyset.add(key));
                    keyset.forEach(key => {
                        //const read = symbolLinks.wasRead[key];
                        const value = symbolLinks.proxied[key];
                        const writ = symbolLinks.wasWrit[key];
                        const maybewrit = symbolLinks.wasMaybeWrit[key];
                        const prev = prevBranch.readonlySymbolLinksTable.readonlyTable.getReadonly(tssymbol)?.[key];
                        const equalPrev = value === prev;
                        const state0 = states[0].readonlySymbolLinksTable.readonlyTable.getReadonly(tssymbol)?.[key];
                        const equalState0 = value === state0;
                        let str = `  [key:${key}], wasWrit:${writ}, wasMaybeWrit:${maybewrit}`;
                        if (!prev) str += `, prev:<undef>`;
                        else str += `, equalPrev:${equalPrev}`;
                        if (i!==0){
                            if (!state0) str += `, state0:<undef>`;
                            else str += `, equalState0:${equalState0}`;
                        }
                        consoleLog(str);
                        str = "    value: ";
                        switch (key) {
                            case "declaredType":
                                // {
                                //     // @ts-ignore-error
                                //     const x = 1;
                                // }
                                // falls through
                            case "type":{
                                castHereafter<Type>(value);
                                const typestr = typeToStringSafe(checker,value);
                                str += ("type: " + typestr + `, type.id:${value.id}`);
                                break;
                            }
                            case "resolvedMembers":{
                                const arrstr: string[]=[];
                                (value as SymbolTable).forEach((member, _keystr) => arrstr.push(checker.symbolToString(member)));
                                str+=("symbols[]: "+arrstr.join(", "));
                                break;
                            }
                        }
                        consoleLog(str);
                    });
                }
                consoleGroupEnd();
            });
        }
        {
            const map = state.readonlyNodeLinksTable.readonlyTable.getReadonlyMapOfCurrentBranch();
            map.forEach((nodeLinks, node) => {
                consoleGroup(`node: ${Debug.formatSyntaxKind(node.kind)}, id:${getNodeId(node)}}`);
                if (nodeLinks instanceof NodeLinksProxyCtor) {
                    //castHereafter<>(symbolLinks);
                    const keyset: Set<keyof NodeLinks> = new Set();
                    Object.keys(nodeLinks.wasMaybeWrit).forEach((k)=>keyset.add(k as any)); //((_, key) => keyset.add(key));
                    Object.keys(nodeLinks.wasWrit).forEach((k)=>keyset.add(k as any)); //((_, key) => keyset.add(key));
                    keyset.forEach(key => {
                        //const read = symbolLinks.wasRead[key];
                        const value = nodeLinks.proxied[key];
                        const writ = nodeLinks.wasWrit[key];
                        const maybewrit = nodeLinks.wasMaybeWrit[key];
                        const prev = prevBranch.readonlyNodeLinksTable.readonlyTable.getReadonly(node)?.[key];
                        const equalPrev = value === prev;
                        const state0 = states[0].readonlyNodeLinksTable.readonlyTable.getReadonly(node)?.[key];
                        const equalState0 = value === state0;
                        let str = `  [key:${key}], wasWrit:${writ}, wasMaybeWrit:${maybewrit}`;
                        if (!prev) str += `, prev:<undef>`;
                        else str += `, equalPrev:${equalPrev}`;
                        if (i!==0){
                            if (!state0) str += `, state0:<undef>`;
                            else str += `, equalState0:${equalState0}`;
                        }
                        consoleLog(str);
                        str = "    value: ";
                        switch (key) {
                            // resolvedType?: Type;                // Cached type of type node
                            // resolvedEnumType?: Type;            // Cached constraint type from enum jsdoc tag
                            // resolvedSignature?: Signature;      // Cached signature of signature node or call expression
                            // resolvedSymbol?: Symbol;            // Cached name resolution result
                            // resolvedIndexInfo?: IndexInfo;      // Cached indexing info resolution result
                            // effectsSignature?: Signature;       // Signature with possible control flow effects
                            // enumMemberValue?: string | number;  // Constant value of enum member
                            case "resolvedType":
                            case "resolvedEnumType":{
                                castHereafter<Type>(value);
                                const typestr = typeToStringSafe(checker,value);
                                str += ("type: " + typestr + `, type.id:${value.id}`);
                                break;
                            }
                            case "resolvedSignature":
                            case "effectsSignature":{
                                castHereafter<Signature>(value);
                                const typestr = signatureToStringSafe(checker,value);
                                str += (`signature: ${typestr}`);
                                break;
                            }
                            case "resolvedSymbol":{
                                castHereafter<Symbol>(value);
                                const typestr = checker.symbolToString(value);
                                str += (`symbol: ${typestr}, symbol.id:${value.id}`);
                                break;
                            }
                        }
                        consoleLog(str);
                    });
                }
                consoleGroupEnd();
            });
        }
    }
    nodeAndSymbolLinkTablesState.restoreState(savedState);
    return;
}


export function dbgLinksStatesDumpTables(
    nodeAndSymbolLinkTablesState: NodeAndSymbolLinksTableState,
    checker: TypeChecker
){
    consoleGroup("dbgDumpTables");
    const savedState = nodeAndSymbolLinkTablesState.getReadonlyState();
    const smap = nodeAndSymbolLinkTablesState.symbolLinksTable.getReadonlyMapOfCurrentBranch();
    const nmap = nodeAndSymbolLinkTablesState.nodeLinksTable.getReadonlyMapOfCurrentBranch();
    nodeAndSymbolLinkTablesState.branchState();
    smap.forEach((symbolLinks, tssymbol) => {
        consoleGroup(`tssymbol: ${checker.symbolToString(tssymbol)}, id:${getSymbolId(tssymbol)}}`);
        Debug.assert(!(symbolLinks instanceof SymbolLinksProxyCtor), "symbolLinks should not be a proxy");
        Object.keys(symbolLinks).forEach((key) => {
            const value = symbolLinks[key as keyof SymbolLinks];
            let str = `  [key:${key}]`;
            str += ", value: ";
            switch (key) {
                case "declaredType":
                case "type":{
                    castHereafter<Type>(value);
                    const typestr = typeToStringSafe(checker,value);
                    str += ("type: " + typestr + `, type.id:${value.id}`);
                    break;
                }
                case "resolvedMembers":{
                    const arrstr: string[]=[];
                    (value as SymbolTable).forEach((member, _keystr) => arrstr.push(checker.symbolToString(member)));
                    str+=("symbols[]: "+arrstr.join(", "));
                    break;
                }
                default:
                    str += value;
            }
            consoleLog(str);
        });
        consoleGroupEnd();
    });
    nmap.forEach((nodeLinks, node) => {
        consoleGroup(`node: ${Debug.formatSyntaxKind(node.kind)}, id:${getNodeId(node)}}`);
        Debug.assert(!(nodeLinks instanceof NodeLinksProxyCtor), "nodeLinks should not be a proxy");
        Object.keys(nodeLinks).forEach((key) => {
            const value = nodeLinks[key as keyof NodeLinks];
            let str = `  [key:${key}]`;
            str += ", value: ";
            switch (key) {
                // resolvedType?: Type;                // Cached type of type node
                // resolvedEnumType?: Type;            // Cached constraint type from enum jsdoc tag
                // resolvedSignature?: Signature;      // Cached signature of signature node or call expression
                // resolvedSymbol?: Symbol;            // Cached name resolution result
                // resolvedIndexInfo?: IndexInfo;      // Cached indexing info resolution result
                // effectsSignature?: Signature;       // Signature with possible control flow effects
                // enumMemberValue?: string | number;  // Constant value of enum member
                case "resolvedType":
                case "resolvedEnumType":{
                    castHereafter<Type>(value);
                    const typestr = typeToStringSafe(checker,value);
                    str += ("type: " + typestr + `, type.id:${value.id}`);
                    break;
                }
                case "resolvedSignature":
                case "effectsSignature":{
                    castHereafter<Signature>(value);
                    const typestr = signatureToStringSafe(checker,value);
                    str += (`signature: ${typestr}`);
                    break;
                }
                case "resolvedSymbol":{
                    castHereafter<Symbol>(value);
                    const typestr = checker.symbolToString(value);
                    str += (`symbol: ${typestr}, symbol.id:${value.id}`);
                    break;
                }
                default:
                    str += value;
            }
            consoleLog(str);
        });
        consoleGroupEnd();
    });
    consoleGroupEnd();
    nodeAndSymbolLinkTablesState.restoreState(savedState);
}



/**
 * This is a proxy class that is used to record which properties of the proxied object are read and written.
 * It is used when joining branches so that types and signatures can be unioned.
 */

type ObjectToProxy = SymbolLinks | NodeLinks; // T extends object ? object : never; //;
interface ClassProxyRecordRW<T extends ObjectToProxy> {
    proxied: T;
    wasRead: Record<string,any>; //& { keys(): (keyof T)[]};
    wasWrit: Record<string,any>; //& { keys(): (keyof T)[]};
    wasMaybeWrit: Record<string,any>;// & { keys(): (keyof T)[]};
    readonlyMode: (() => boolean) | undefined;
    typeName: string;
}
type ProxyClassConstructor<T extends ObjectToProxy> = new (proxied: T, readonlyMode?: () => boolean) => ClassProxyRecordRW<T>;

function createTableClassProxyRecordRW<T extends ObjectToProxy>(keys: readonly string[], typeName: string): ProxyClassConstructor<T> {
    class ClassProxyRecordRwInstance implements ClassProxyRecordRW<T> {
        proxied: T;
        wasRead: Record<string,any>; //& { keys(): (keyof T)[]};
        wasWrit: Record<string,any>; //& { keys(): (keyof T)[]};
        wasMaybeWrit: Record<string,any>;// & { keys(): (keyof T)[]};
        readonlyMode: (() => boolean) | undefined;
        typeName: string;

        constructor(proxied: T, readonlyMode?: () => boolean) {
            this.proxied = proxied;
            this.readonlyMode = readonlyMode;
            this.typeName = typeName;
            this.wasRead = {} as typeof this.wasRead;
            this.wasWrit = {} as typeof this.wasWrit;
            this.wasMaybeWrit = {} as typeof this.wasMaybeWrit;
        }
    };
    for (const key of keys) {
        Object.defineProperty(ClassProxyRecordRwInstance.prototype, key, {
            enumerable: true,
            get() {
                castHereafter<keyof T>(key);
                const proxy = this as ClassProxyRecordRW<T> ;
                const proxied = proxy.proxied;
                let retval;
                // eslint-disable-next-line no-in-operator
                if (key in proxied) {
                    retval = proxied[key];
                }
                else {
                    retval = undefined;
                }
                proxy.wasRead[key] = true;
                const typeofRetval = typeof retval;
                /**
                 * Only functions and objects could possibly be written to with only a read.
                 * This is pointless, but it is a way to check for bugs in case it happens.
                 */
                if (typeofRetval === "object" || typeofRetval === "function") proxy.wasMaybeWrit[key] = true;
                return retval;
            },
            set(value: any) {
                castHereafter<keyof T>(key);
                const proxy = this as ClassProxyRecordRW<T> ;
                if (proxy.readonlyMode?.()) {
                    Debug.assert(false,/*message*/ "",()=>`Cannot set ${String(key)} in readonly mode`);
                }
                proxy.wasWrit[key] = true;
                proxy.proxied[key] = value;
            }
        });
    }
    return ClassProxyRecordRwInstance;
}

export let nouseResolveCallExpressionV2 = false;
function initialize(){
    nouseResolveCallExpressionV2 = (process.env.nouseRcev2===undefined || !Number(process.env.nouseRcev2)) ? false : true
}
initialize();
