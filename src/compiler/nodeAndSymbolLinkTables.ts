namespace ts {

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
        "accessibleChainCache"
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
        "serializedTypes"
    ] as const;

// {
//     type SymbolLinksKeysKeys = typeof symbolLinksKeys[number];
//     type SymbolLinksObjKeys = keyof SymbolLinks;
//     type CheckSymbolKeys1 = SymbolLinksKeysKeys extends SymbolLinksObjKeys ? true : false;
//     type CheckSymbolKeys2 = SymbolLinksObjKeys extends SymbolLinksKeysKeys ? true : false;
//     // @ts-ignore
//     (undefined as any as CheckSymbolKeys1) satisfies true; // assert that the keys are correct
//     // @ts-ignore
//     (undefined as any as CheckSymbolKeys2) satisfies true; // assert that the keys are correct
// }
// {
//     type NodeLinksKeysKeys = typeof nodeLinksKeys[number];
//     type NodelLinksObjKeys = keyof NodeLinks;
//     type CheckNodeKeys1 = NodeLinksKeysKeys extends NodelLinksObjKeys ? true : false;
//     type CheckNodeKeys2 = NodelLinksObjKeys extends NodeLinksKeysKeys ? true : false;
//     (null as any as CheckNodeKeys1) satisfies true; // assert that the keys are correct
//     (null as any as CheckNodeKeys2) satisfies true; // assert that the keys are correct
// }
    export type SignatureWithLinksState = & {signature: Signature, readonlyState: ReadonlyNodeAndSymbolLinkTables };


    type DifferentialSymbolLinksTable = DifferentialTable<SymbolLinks, Symbol>;
    type DifferentialNodeLinksTable = DifferentialTable<NodeLinks, Node>;


    export type ReadonlyNodeAndSymbolLinkTables = & {
        readonlyNodeLinksTable: { readonlyTable: Readonly<DifferentialNodeLinksTable>, originalReadonlyMode: boolean },
        readonlySymbolLinksTable: { readonlyTable: Readonly<DifferentialSymbolLinksTable>, originalReadonlyMode: boolean },
    };

    const NodeLinksProxyCtor = createTableClassProxyRecordRW<NodeLinks>(nodeLinksKeys,"NodeLinks");
    const SymbolLinksProxyCtor = createTableClassProxyRecordRW<SymbolLinks>(symbolLinksKeys,"SymbolLinks");

    type SymbolLinksProxy = ClassProxyRecordRW<SymbolLinks>;
    type NodeLinksProxy = ClassProxyRecordRW<NodeLinks>;


    const nodeLinksConstructor = () => ({
        flags:NodeCheckFlags.None,
        jsxFlags:JsxFlags.None,
    } as NodeLinks);
    const symbolLinksConstructor = () => ({
    } as SymbolLinks);

    const overrideCtorCopyForDiagnosis = {
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



    export class NodeAndSymbolTableState {
        nodeLinksTable: DifferentialNodeLinksTable;
        symbolLinksTable: DifferentialSymbolLinksTable;
        constructor() {
            this.nodeLinksTable = new DifferentialTable<NodeLinks, Node>(undefined, nodeLinksConstructor);
            this.symbolLinksTable = new DifferentialTable<SymbolLinks, Symbol>(undefined, symbolLinksConstructor);
        }
        /**
         * whole state operations
         */
        getReadonlyState(): ReadonlyNodeAndSymbolLinkTables{
            const n = this.nodeLinksTable.getReadonlyTable();
            const s = this.symbolLinksTable.getReadonlyTable();
            return { readonlySymbolLinksTable: s, readonlyNodeLinksTable: n };
        }
        branchState(useProxiesForDiagnosis?: boolean): void {
            this.nodeLinksTable = this.nodeLinksTable.setTableToReadonlyAndGetBranchTable(
                useProxiesForDiagnosis?overrideCtorCopyForDiagnosis.nodeLinks:undefined).branchTable;
            this.symbolLinksTable = this.symbolLinksTable.setTableToReadonlyAndGetBranchTable(
                useProxiesForDiagnosis?overrideCtorCopyForDiagnosis.symbolLinks:undefined).branchTable;
        }
        getReadonlyStateThenBranchState(useProxiesForDiagnosis?: boolean): ReadonlyNodeAndSymbolLinkTables {
            const r = this.getReadonlyState();
            this.branchState(useProxiesForDiagnosis);
            return r;
        }
        restoreState(savedTables: ReadonlyNodeAndSymbolLinkTables): void {
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
            if (symbol.flags & SymbolFlags.Transient) return symbol as TransientSymbol; // why is this OK and not a compile error,
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
    export function  joinLinksStatesAndWriteBack(
        checker: TypeChecker,
        states: Readonly<ReadonlyNodeAndSymbolLinkTables[]>,
        writeableTargetBranch: NodeAndSymbolTableState): void {

        function doSymbolLinks(){
            const mapSymbolToChangedKeyValues = new Map<Symbol, ESMap<keyof SymbolLinks,Set<any>>>();
            function addToSet(innerMap: ESMap<keyof SymbolLinks,Set<any>>, key: keyof SymbolLinks, value: any) {
                let set = innerMap.get(key);
                if (!set) innerMap.set(key, set = new Set());
                set.add(value);
            }
            for (let i = 0; i<states.length; i++) {
                const state = states[i];
                const map = state.readonlySymbolLinksTable.readonlyTable.getReadonlyMapOfCurrentBranch();
                map.forEach((symbolLinksProxy, tssymbol) => {
                    Debug.assert(symbolLinksProxy instanceof SymbolLinksProxyCtor, "symbolLinks should be a proxy");
                    assertCastType<SymbolLinksProxy>(symbolLinksProxy);
                    const slorig = symbolLinksProxy.proxied;
                    Debug.assert(!(slorig instanceof SymbolLinksProxyCtor), "symbolLinks should not be a proxy");
                    const keys: string[] = [];
                    for (const key in symbolLinksProxy.wasMaybeWrit) keys.push(key);
                    if (keys.length===0) return;
                    let mapWrit = mapSymbolToChangedKeyValues.get(tssymbol);
                    if (!mapWrit) mapSymbolToChangedKeyValues.set(tssymbol, mapWrit = new Map());
                    keys.forEach((key: keyof SymbolLinks) => {
                        addToSet(mapWrit!, key, slorig[key]);
                    });
                });
            }
            mapSymbolToChangedKeyValues.forEach((innerMap, tssymbol) => {
                const symbolLinksTarget = writeableTargetBranch.getSymbolLinks(tssymbol);
                innerMap.forEach((set, key) => {
                    if (set.size === 1) {
                        const value = set.values().next().value;
                        //symbolLinksTarget[key] = value; // Expression produces a union type that is too complex to represent.ts(2590)
                        (symbolLinksTarget as Record<string,any>)[key] = value
                    }
                    else {
                        let arrValue: unknown[] = [];
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
                            break;
                            default:
                                Debug.assert(false, `Unhandled key of SymbolLinks: `,()=>key);

                        }
                    }
                });
            });
        }
        function doNodeLinks(){
            const mapNodeToChangedKeyValues = new Map<Node, ESMap<keyof NodeLinks,Set<any>>>();
            function addToSet(innerMap: ESMap<keyof NodeLinks,Set<any>>, key: keyof NodeLinks, value: any) {
                let set = innerMap.get(key);
                if (!set) innerMap.set(key, set = new Set());
                set.add(value);
            }
            for (let i = 0; i<states.length; i++) {
                const state = states[i];
                const map = state.readonlyNodeLinksTable.readonlyTable.getReadonlyMapOfCurrentBranch();
                map.forEach((nodeLinksProxy, tsnode) => {
                    Debug.assert(nodeLinksProxy instanceof NodeLinksProxyCtor, "nodeLinks should be a proxy");
                    assertCastType<NodeLinksProxy>(nodeLinksProxy);

                    const nlorig = nodeLinksProxy.proxied;
                    Debug.assert(!(nlorig instanceof NodeLinksProxyCtor), "symbolLinks should not be a proxy");
                    const keys: string[] = [];
                    for (const key in nodeLinksProxy.wasMaybeWrit) keys.push(key);
                    if (keys.length===0) return;
                    let mapWrit = mapNodeToChangedKeyValues.get(tsnode);
                    if (!mapWrit) mapNodeToChangedKeyValues.set(tsnode, mapWrit = new Map());
                    keys.forEach((key: keyof NodeLinks) => {
                        addToSet(mapWrit!, key, nlorig[key]);
                    });
                });
            }
            mapNodeToChangedKeyValues.forEach((innerMap, tsnode) => {
                const nodeLinksTarget = writeableTargetBranch.getNodeLinks(tsnode);
                innerMap.forEach((set, key) => {
                    if (set.size === 1) {
                        const value = set.values().next().value;
                        //nodeLinksTarget[key] = value; // Expression produces a union type that is too complex to represent.ts(2590)
                        (nodeLinksTarget as Record<string,any>)[key] = value
                    }
                    else {
                        let arrValue: unknown[] = [];
                        set.forEach(value => arrValue.push(value));
                        switch (key) {
                            case "resolvedSignature":{
                                const [...signatures] = checker.getUnionSignatures(arrValue.map((s:Signature)=>[s]));
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
        nodeAndSymbolLinkTablesState: NodeAndSymbolTableState,
        checker: TypeChecker,
        states: Readonly<ReadonlyNodeAndSymbolLinkTables[]>,
        prevBranch: Readonly<ReadonlyNodeAndSymbolLinkTables>): void {

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
                        //assertCastType<>(symbolLinks);
                        const keyset: Set<keyof SymbolLinks> = new Set();
                        Object.keys(symbolLinks.wasMaybeWrit).forEach((k: keyof SymbolLinks)=>keyset.add(k)); //((_, key) => keyset.add(key));
                        Object.keys(symbolLinks.wasWrit).forEach((k: keyof SymbolLinks)=>keyset.add(k)); //((_, key) => keyset.add(key));
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
                                    assertCastType<Type>(value);
                                    const typestr = checker.typeToString(value);
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
                        //assertCastType<>(symbolLinks);
                        const keyset: Set<keyof NodeLinks> = new Set();
                        Object.keys(nodeLinks.wasMaybeWrit).forEach((k: keyof NodeLinks)=>keyset.add(k)); //((_, key) => keyset.add(key));
                        Object.keys(nodeLinks.wasWrit).forEach((k: keyof NodeLinks)=>keyset.add(k)); //((_, key) => keyset.add(key));
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
                                    assertCastType<Type>(value);
                                    const typestr = checker.typeToString(value);
                                    str += ("type: " + typestr + `, type.id:${value.id}`);
                                    break;
                                }
                                case "resolvedSignature":
                                case "effectsSignature":{
                                    assertCastType<Signature>(value);
                                    const typestr = checker.signatureToString(value);
                                    str += (`signature: ${typestr}`);
                                    break;
                                }
                                case "resolvedSymbol":{
                                    assertCastType<Symbol>(value);
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
        nodeAndSymbolLinkTablesState: NodeAndSymbolTableState,
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
            Object.keys(symbolLinks).forEach((key: keyof SymbolLinks) => {
                const value = symbolLinks[key];
                let str = `  [key:${key}]`;
                str += ", value: ";
                switch (key) {
                    case "declaredType":
                    case "type":{
                        assertCastType<Type>(value);
                        const typestr = checker.typeToString(value);
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
            Object.keys(nodeLinks).forEach((key: keyof NodeLinks) => {
                const value = nodeLinks[key];
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
                        assertCastType<Type>(value);
                        const typestr = checker.typeToString(value);
                        str += ("type: " + typestr + `, type.id:${value.id}`);
                        break;
                    }
                    case "resolvedSignature":
                    case "effectsSignature":{
                        assertCastType<Signature>(value);
                        const typestr = checker.signatureToString(value);
                        str += (`signature: ${typestr}`);
                        break;
                    }
                    case "resolvedSymbol":{
                        assertCastType<Symbol>(value);
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



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // For checking which keys have change (used for development only, probably)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                    assertCastType<keyof T>(key);
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
                    assertCastType<keyof T>(key);
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

}
