namespace ts {

    // export interface AliasAssignableState {
    //     readonly node: Node;
    //     readonly valueReadonly: boolean;
    //     readonly constVariable: boolean;
    //     readonly aliasable: boolean; // constVariable && valueReadonly && !antecedentIsJoin
    //     readonly lhsType: Type;
    //     readonly declarationType: Type | undefined;
    //     readonly initializerType: Type | undefined;
    //     readonly preferredType: Type;
    //     inUse: boolean; // to prevent recursion of aliases
    // };

    export enum RefTypesTableKind {
        leaf = "leaf",
        nonLeaf = "nonLeaf",
        return = "return"
    };
    declare function isRefTypesTableLeaf(x: RefTypesTable): x is RefTypesTableLeaf;
    declare function isRefTypesTableReturn(x: RefTypesTable): x is RefTypesTableReturn;
//    declare function isRefTypesTableReturn(x: RefTypesTableNonLeaf): x is RefTypesTableNonLeaf;
    //export type RefTypesType = & { type: Type }; // keep it abstact for now - may want to opimize later
    export enum RefTypesTypeFlags {
        none=0,
        any=1,
        unknown=2,
    };
    export interface RefTypesTypeNormal {
        _flags: RefTypesTypeFlags.none;
        _set: Set<Type>;
        _mapLiteral: ESMap<Type, Set<LiteralType>>;
    };
    export interface RefTypesTypeAny {
        _flags: RefTypesTypeFlags.any;
        _set: undefined;
        _mapLiteral: undefined;
    };
    export interface RefTypesTypeUnknown {
        _flags: RefTypesTypeFlags.unknown;
        _set: undefined;
        _mapLiteral: undefined;
    };
    export type RefTypesType = RefTypesTypeNormal | RefTypesTypeAny | RefTypesTypeUnknown ;

    export type MakeRequired<Type, Key extends keyof Type> = Omit<Type, Key> & Required<Pick<Type, Key>>;
    // export type RefTypesSymtabValue = MakeRequired<RefTypesTableLeaf, "symbol">;
    export type RefTypesSymtabValue = & {
        leaf: MakeRequired<RefTypesTableLeaf, "symbol">;
    };

    export type RefTypesSymtab = ESMap<Symbol, RefTypesSymtabValue>;
    // export type RefTypesTableNonLeaf = & {
    //     kind: RefTypesTableKind.nonLeaf;
    //     symbol: Symbol | undefined; // undefined because some expressions have no symbol - will never be included in RefTypesSymTab
    //     isconst?: boolean;
    //     preReqByType?: ESMap<RefTypesType, RefTypesSymtab>;
    // };
    export type RefTypesTableLeaf = & {
        kind: RefTypesTableKind.leaf;
        symbol: Symbol | undefined;
        isconst?: boolean;
        type: RefTypesType;
    };
    export type RefTypesTable = RefTypesTableReturn | RefTypesTableReturnNoSymbol | RefTypesTableLeaf;

    export type RefTypesTableReturnNoSymbol = & {
        kind: RefTypesTableKind.return;
        type: RefTypesType;
        //typeConstraintItem?: ConstraintItem;
        symtab: RefTypesSymtab;
        constraintItem: ConstraintItem;
    };
    export type RefTypesTableReturn = & {
        kind: RefTypesTableKind.return;
        symbol?: Symbol | undefined;
        isconst?: boolean;
        type: RefTypesType;
        //typeConstraintItem: ConstraintItem;
        symtab: RefTypesSymtab;
        constraintItem: ConstraintItem;
    };
    export enum InferCritKind {
        none= "none",
        truthy= "truthy",
        notnullundef= "notnullundef",
        assignable= "assignable",
        typeof= "typeof",
        twocrit= "twocrit"
    };

    export enum InferCritTypeofStrings {
        undefined = "undefined",
        boolean = "boolean",
        number = "number",
        bigint = "bigint",
        string = "string",
        symbol = "symbol",
        function = "function",
        object = "object"
    };

    export type InferCrit =
    (
        | {
            kind: typeof InferCritKind.twocrit // this is just to get the resulting type without any criteria
            negate?: false;
            crits: [InferCrit & {alsoFailing?: false}, InferCrit]
        }
        | {
            kind: typeof InferCritKind.none // this is just to get the resulting type without any criteria
            negate?: false;
        }
        | {
            kind: typeof InferCritKind.truthy
            negate?: boolean;
        }
        | {
            kind: typeof InferCritKind.notnullundef;
            negate?: boolean;
        }
        | {
            kind: typeof InferCritKind.assignable;
            negate?: boolean;
            target: Type;
        }
        | {
            kind: typeof InferCritKind.typeof;
        }
    )
    & {alsoFailing?: boolean}; // also output failing, in addition to passing

    export type ReplayableItem = & {
        symbol: Symbol;
        isconst: boolean;
        expr: Node;
        nodeToTypeMap: NodeToTypeMap
    };

    export type RefTypesSymtabConstraintItem = & {
        symtab: RefTypesSymtab;
        constraintItem: ConstraintItem;
    };


    export type RefDeltaInferState = & {
        symtab: RefTypesSymtab;
        constraintItem: ConstraintItem;
        deltaNodeToTypeMap: ESMap<Node,Type>;
        inferStatus: InferStatus;
    };

    /**
     * InferStatus
     * X The "inCondition" member is true when the current node is within a discriminating expression (e.g. "if (node){...}else{...}", or "(node)? x : y").
     * X When "inCondition" is true, then the full complexity of expression branching should be preserved to allow for inference, otherwise the complexity should be squashed.
     * Note: Use of "ConstraintItem" obviates the need for "inCondition". (?)
     *
     * X The "currentReplayableItem" member is non-false when a variables rhs assigned value is being "replayed" as an alias for the variable, and the sub-member
     * X"byNode" is the Node->Type map which will be used for that purpose.
     */
    export type ReplayData = & {
        byNode: NodeToTypeMap;
    };

    export type TypeCheckerFn = ((...args: any[]) => any);

    export type InferStatus = & {
        inCondition: boolean;
        currentReplayableItem?: undefined | ReplayableItem;
        replayables: ESMap< Symbol, ReplayableItem >;
        declaredTypes: ESMap<Symbol, RefTypesTableLeaf>; // note: symbol entries are (should be) deleted when symbol goes out of scope (postBlock trigger).
        groupNodeToTypeMap: ESMap<Node,Type>;
        //accumNodeTypes: boolean,
        accumBranches: boolean,
        /**
         * This allows checker.getTypeOfExpression(expr) to be called on any node in groupNodeToTypeMap, which may be conputed deep within a speculative branch,
         * e.g., mrNarrowTypesByCallExpression.  (In test _cax-fn-0020.ts it is called in SpreadElement deep under mrNarrowTypesByCallExpression)
         * @param expr
         * @param checker
         */
        getTypeOfExpressionShallowRecursion(sc: RefTypesSymtabConstraintItem, expr: Expression): Type;
        callCheckerFunctionWithShallowRecursion<FN extends TypeCheckerFn>(expr: Expression, sc: RefTypesSymtabConstraintItem, checkerFn: FN, ...args: Parameters<FN>): ReturnType<FN>;
    };

    export type InferRefArgs = & {
        refTypesSymtab: RefTypesSymtab,
        constraintItem: ConstraintItem,
        expr: Readonly<Node>,
        qdotfallout?: RefTypesTableReturn[],
        inferStatus: InferStatus,
        crit: InferCrit,
    };

    export type NodeToTypeMap = ESMap<Node, Type>;
    export type MrNarrowTypesReturn = & {
        //byNode: NodeToTypeMap;
        inferRefRtnType: InferRefRtnType;
    };
    export type InferRefRtnType = & {
        passing: RefTypesTableReturnNoSymbol;
        failing?: RefTypesTableReturnNoSymbol;
        unmerged?: Readonly<RefTypesTableReturn[]>;
    };

    export type InferRefInnerArgs = & {
        refTypesSymtab: RefTypesSymtab,
        expr: Readonly<Node>,
        qdotfallout: RefTypesTableReturn[],
        inferStatus: InferStatus,
        constraintItem: ConstraintItem;
    };
    export type MrNarrowTypesInnerReturn = & {
        //byNode: NodeToTypeMap;
        assignmentData?: { // set when Delcaration or assignment, and replayData was false
            symbol: Symbol,
            isconst: boolean;
        }
        arrRefTypesTableReturn: Readonly<RefTypesTableReturn[]>;
    };
    export enum ConstraintItemKind {
        node = "node",
        leaf = "leaf",
        never = "never",
        always = "always",
    };
    export enum ConstraintItemNodeOp {
        or = "or",
        and = "and",
        not = "not"
    };
    export type ConstraintItemBase = & {
        kind: ConstraintItemKind;
        symbolsInvolved?: Set<Symbol>;
    };
    export type ConstraintItemNodeAnd = ConstraintItemBase & {
        kind: ConstraintItemKind.node;
        op: ConstraintItemNodeOp.and;
        constraints: (ConstraintItem)[],
    };
    export type ConstraintItemNodeOr = ConstraintItemBase & {
        kind: ConstraintItemKind.node;
        op: ConstraintItemNodeOp.or;
        constraints: (ConstraintItem)[],
    };
    export type ConstraintItemNodeNot = ConstraintItemBase & {
        kind: ConstraintItemKind.node;
        op: ConstraintItemNodeOp.not;
        constraint: ConstraintItem,
    };
    export type ConstraintItemNode = ConstraintItemNodeAnd | ConstraintItemNodeOr | ConstraintItemNodeNot;
    export type ConstraintItemLeaf = ConstraintItemBase & {
        kind: ConstraintItemKind.leaf;
        symbol: Symbol;
        type: RefTypesType;
    };
    export type ConstraintItemNever = ConstraintItemBase & {
        kind: ConstraintItemKind.never;
    };
    export type ConstraintItemAlways = ConstraintItemBase & {
        kind: ConstraintItemKind.always;
    };
    export type ConstraintItem = ConstraintItemLeaf | ConstraintItemNode | ConstraintItemNever | ConstraintItemAlways;

    export function everyForMap<K,V>(m: ESMap<K,V>, f: (v: V,k: K) => boolean): boolean {
        for (let iter=m.entries(),it=iter.next();!it.done;it=iter.next()){
            if (!f(it.value[1],it.value[0])) return false;
        }
        return true;
    };
}
