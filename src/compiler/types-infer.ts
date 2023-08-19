namespace ts {

    export type PartitionForEqualityCompareItemTpl<TT> = & {
        left?: Readonly<TT>;
        right?: Readonly<TT>;
        both?: Readonly<TT>;
        leftts?: Type[];
        rightts?: Type[];
        bothts?: Type;
        // leftobj?: FloughLogicalObjectIF;
        // rightobj?: FloughLogicalObjectIF;
        true?: boolean;
        false?: boolean;
    };

    export type LogicalObjecAccessData = & {
        logicalObjectAccessReturn: LogicalObjectAccessReturn;
        finalTypeIdx: number;
    };


    export type PartitionForEqualityCompareItem = PartitionForEqualityCompareItemTpl<RefTypesType>;

    export type RefTypesTable = RefTypesTableReturn | RefTypesTableReturnNoSymbol;

    export type RefTypesTableReturnNoSymbol = & {
        critsense?: "passing" | "failing"; // TODO: remove this
        type: RefTypesType;
        sci: RefTypesSymtabConstraintItem;
        logicalObjectIdexing?: { logobjidx: number, sigidx: number };
        logicalObjectAccessData?: LogicalObjecAccessData;
    };
    export type RefTypesTableReturn = & {
        symbol?: Symbol | undefined;
        isconst?: boolean;
        isAssign?: boolean; // don't need assignType because it will always be whole type.
        critsense?: "passing" | "failing"; // TODO: remove this
        type: RefTypesType;
        sci: RefTypesSymtabConstraintItem;
        logicalObjectIdexing?: { logobjidx: number, sigidx: number };
        logicalObjectAccessData?: LogicalObjecAccessData;
    };
    export enum InferCritKind {
        none= "none",
        truthy= "truthy",
        notnullundef= "notnullundef",
        assignable= "assignable",
        subtype= "subtype",
        equalLiteral= "equalLiteral",
    };
    export type InferCrit =
    (
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
            kind: typeof InferCritKind.subtype;
            negate?: boolean;
            target: Type;
        }
        | {
            kind: typeof InferCritKind.equalLiteral;
            negate?: boolean;
            targetFloughType: FloughType;
        }
    )
    & {alsoFailing?: boolean, done?: true}; // also output failing, in addition to passing

    export type ReplayableItem = & {
        symbol: Symbol;
        isconst: boolean;
        expr: Node;
        nodeToTypeMap: NodeToTypeMap
    };

    export type RefTypesSymtabConstraintItemNotNever = & {
        symtab: RefTypesSymtab;
        constraintItem: ConstraintItemNotNever;
    };
    export type RefTypesSymtabConstraintItemNever = & {
        constraintItem: ConstraintItemNever;
    };

    export interface RefTypesSymtabConstraintItem {
        symtab?: RefTypesSymtab | undefined;
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
        replayables: WeakMap< Symbol, ReplayableItem >;
        groupNodeToTypeMap: ESMap<Node,Type>;
        //accumNodeTypes: boolean,
        accumBranches: boolean,
        isInLoop?: boolean;
        involved?: {
            initializing: boolean;
            inEncountered: WeakSet<Symbol>;
            outEncountered?: Set<Symbol>;
            involvedSymbolTypeCache: InvolvedSymbolTypeCache;
        };
        /**
         * This allows checker.getTypeOfExpression(expr) to be called on any node in groupNodeToTypeMap, which may be conputed deep within a speculative branch,
         * e.g., floughByCallExpression.  (In test _cax-fn-0020.ts it is called in SpreadElement deep under floughByCallExpression)
         * @param expr
         * @param checker
         */
        getTypeOfExpressionShallowRecursion(sc: RefTypesSymtabConstraintItem, expr: Expression, returnErrorTypeOnFail?: boolean): Type;
        callCheckerFunctionWithShallowRecursion<FN extends TypeCheckerFn>(expr: Expression, sc: RefTypesSymtabConstraintItem, returnErrorTypeOnFail: boolean, checkerFn: FN, ...args: Parameters<FN>): ReturnType<FN>;
    };

    // export type floughArgsX = & {
    //     sci: RefTypesSymtabConstraintItem,
    //     expr: Readonly<Node>,
    //     qdotfallout?: RefTypesTableReturn[],
    //     inferStatus: InferStatus,
    //     crit: InferCrit,
    // };
    // export type AccessItem = & {
    //     logicalObject?: FloughLogicalObjectIF; // not present for last access item
    //     keyType: FloughType;
    // };
    /**
     * 'roots' is an array of entries to the access chain, not intermediate nodes.
     * However, 'keyTypes' is an array of FloughTypes, each entry corresponding to one level of the access chain.
     * 'roots' and 'keyTypes' may therefore be different lengths.
     * 'expressions' are the nodes corresponding to the access chain objects, and are the same length as 'keyTypes'.
     */
    export type AccessArgsRoot = RefTypesTableReturn;
    //     export type AccessArgsRoot = & {
    //     type: FloughType,
    //     symbolData?: {
    //         symbol: Symbol,
    //         isconst?: boolean | undefined,
    //         isAssign?: boolean | undefined,
    //     };
    // };
    export type AccessArgs = & {
        roots: AccessArgsRoot[] | undefined;
        keyTypes: FloughType[];
        expressions: Expression[];
    };
    export type FloughArgs = & {
        sci: RefTypesSymtabConstraintItem,
        expr: Readonly<Node>,
        qdotfallout?: RefTypesTableReturn[],
        inferStatus: InferStatus,
        crit: InferCrit,
        accessDepth?: number,
        refAccessArgs?: [{
            roots: AccessArgsRoot[] | undefined, keyTypes: FloughType[],
            expressions: (ElementAccessExpression | PropertyAccessExpression)[]
        }], // a tuple of an array, only set by callees which are accessor expressions
    };

    export type CallExpressionResultPerSig = & {
        signature: Signature; //
        signatureReturnType: Type;
        type?: FloughType;
        rttr: RefTypesTableReturn,
    };
    export type CallExpressionResultPerFunc = & {
        functionTsObject: Type | undefined; // undefined in case of error
        functionReturnType?: Type | undefined; // undefined in case of error
        perSigs: CallExpressionResultPerSig[]; // empty in case of error
        carriedQdotUndefined: boolean; // redundant assuming it is in logicalObjectAccessReturn?
    };
    export type CallExpressionResult = & {
        perFuncs: CallExpressionResultPerFunc[]; // includes error cases where functionTsObject is undefined or perSigs is empty
    };


    export type NodeToTypeMap = ESMap<Node, Type>;
    export type FloughReturn = & {
        unmerged: Readonly<RefTypesTableReturn[]>;
        nodeForMap: Readonly<Node>;
        forCrit?: {
            logicalObjectAccessReturn?: LogicalObjectAccessReturn;
            //isCallExpression?: boolean;
            callExpressionResult?: CallExpressionResult;
        },
        typeof?: {
            map: ESMap<Type,RefTypesType>;
            argSymbol: Symbol;
        }
    };

    export type InferRefInnerArgs = & {
        sci: RefTypesSymtabConstraintItemNotNever,
        expr: Readonly<Node>,
        qdotfallout?: RefTypesTableReturn[] | undefined,
        inferStatus: InferStatus,
    };

    export type FloughInnerReturn = & {
        unmerged: Readonly<RefTypesTableReturn[]>;
        forCrit?: {
            logicalObjectAccessReturn?: LogicalObjectAccessReturn;
            //isCallExpression?: boolean; // replaced by callExpressionResult TODO kill
            callExpressionResult?: CallExpressionResult;
        },
        typeof?: {
            map: ESMap<Type,RefTypesType>;
            argSymbol: Symbol;
        }
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
    export type ConstraintItemNotNever = ConstraintItemLeaf | ConstraintItemNode | ConstraintItemAlways;
    export type ConstraintItem = ConstraintItemLeaf | ConstraintItemNode | ConstraintItemNever | ConstraintItemAlways;

    export type LiteralTypeNumber = LiteralType & { value: number };
    export type LiteralTypeString = LiteralType & { value: string };

    export function everyForMap<K,V>(m: ESMap<K,V>, f: (v: V,k: K) => boolean): boolean {
        for (let iter=m.entries(),it=iter.next();!it.done;it=iter.next()){
            if (!f(it.value[1],it.value[0])) return false;
        }
        return true;
    };
    export function everyForSet<K>(m: Set<K>, f: (k: K) => boolean): boolean {
        for (let iter=m.keys(),it=iter.next();!it.done;it=iter.next()){
            if (!f(it.value)) return false;
        }
        return true;
    };

    export function assertCastType<T>(_x: any): asserts _x is T {}

}
