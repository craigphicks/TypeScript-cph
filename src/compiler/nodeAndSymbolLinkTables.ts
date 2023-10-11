namespace ts {

    type DifferentialSymbolLinksTable = DifferentialTable<SymbolLinks,number>;
    type DifferentialNodeLinksTable = DifferentialTable<NodeLinks,number>;

    export type ReadonlyNodeAndSymbolLinkTables = & {
        readonlyNodeLinksTable: { readonlyTable: Readonly<DifferentialNodeLinksTable>, originalReadonlyMode: boolean },
        readonlySymbolLinksTable: { readonlyTable: Readonly<DifferentialSymbolLinksTable>, originalReadonlyMode: boolean },
    };

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
];


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
];

    const NodeLinksProxy = createTableClassProxyRecordRW(nodeLinksKeys, "NodeLinks");
    const SymbolLinksProxy = createTableClassProxyRecordRW(symbolLinksKeys, "SymbolLinks");

    const nodeConstructor = () => ({
        flags:NodeCheckFlags.None,
        jsxFlags:JsxFlags.None,
    } as NodeLinks);
    const symbolConstructor = () => ({
    } as SymbolLinks);
    export class NodeAndSymbolTableState {
        nodeLinksTable: DifferentialNodeLinksTable;
        symbolLinksTable: DifferentialSymbolLinksTable;
        constructor() {
            this.nodeLinksTable = new DifferentialTable<NodeLinks,number>(undefined, nodeConstructor);
            this.symbolLinksTable = new DifferentialTable<SymbolLinks,number>(undefined, symbolConstructor);
        }
        /**
         * whole state operations
         */
        getReadonlyState(): ReadonlyNodeAndSymbolLinkTables{
            const n = this.nodeLinksTable.getReadonlyTable();
            const s = this.symbolLinksTable.getReadonlyTable();
            return { readonlySymbolLinksTable: s, readonlyNodeLinksTable: n };
        }
        branchState(): void {
            this.nodeLinksTable = this.nodeLinksTable.setTableToReadonlyAndGetBranchTable().branchTable;
            this.symbolLinksTable = this.symbolLinksTable.setTableToReadonlyAndGetBranchTable().branchTable;
        }
        getReadonlyStateThenBranchState(): ReadonlyNodeAndSymbolLinkTables {
            const r = this.getReadonlyState();
            this.branchState();
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
            if (symbol.flags & SymbolFlags.Transient) return symbol as TransientSymbol; // why is this OK and not an compile error,
            const id = getSymbolId(symbol);
            const obj = this.symbolLinksTable.getWritableAlways(id);
            const proxy = new SymbolLinksProxy(obj, this.symbolLinksTable.getTableReadonlyMode());
            return proxy as SymbolLinks;
            //return symbolLinks[id] || (symbolLinks[id] = new (SymbolLinks as any)());
        }
        hasNodeLinks(node: Node): boolean {
            const nodeId = getNodeId(node);
            return this.nodeLinksTable.has(nodeId);
            //return nodeLinks[nodeId] || (nodeLinks[nodeId] = new (NodeLinks as any)());
        }
        getNodeLinks(node: Node): NodeLinks {
            const nodeId = getNodeId(node);
            const obj = this.nodeLinksTable.getWritableAlways(nodeId);
            const proxy = new NodeLinksProxy(obj, this.nodeLinksTable.getTableReadonlyMode());
            return proxy as NodeLinks;
            //return nodeLinks[nodeId] || (nodeLinks[nodeId] = new (NodeLinks as any)());
        }
        getNodeCheckFlags(node: Node): NodeCheckFlags {
            // eslint-disable-next-line no-in-operator
            if (!("id" in node)) return 0 as NodeCheckFlags; // why not make 0 a NodeCheckFlags value if it has meaning,
            const nodeId = node.id!;
            if (nodeId < 1 || nodeId >= getNextNodeId()) return 0 as NodeCheckFlags;
            if (this.hasNodeLinks(node)) return this.getNodeLinks(node).flags;
            // some nodes with id between 1 and getNextNodeId()-1 may have no corresponding nodeLinks entry
            return 0 as NodeCheckFlags;
            // if (nodeId < 0 || nodeId >= nodeLinks.length) return 0;
            // return nodeLinks[nodeId],
        }
    }
    function joinStates(states: Readonly<ReadonlyNodeAndSymbolLinkTables[]>, nodeAndSymbolTableState: NodeAndSymbolTableState): void {
        const state0 = states[0];
        for (let i = 1; i<states.length; i++) {
            const state = states[i];
            //state0.readonlySymbolLinksTable.get
            state0.readonlySymbolLinksTable.readonlyTable.joinTable(state.readonlySymbolLinksTable.readonlyTable);
            state0.readonlyNodeLinksTable.readonlyTable.joinTable(state.readonlyNodeLinksTable.readonlyTable);
        }

        // for (const state of states) {
        //     nodeAndSymbolTableState.symbolLinksTable.joinTable(state.readonlySymbolLinksTable.readonlyTable);
        //     nodeAndSymbolTableState.nodeLinksTable.joinTable(state.readonlyNodeLinksTable.readonlyTable);
        // }
    }

}
