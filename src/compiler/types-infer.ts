namespace ts {

    export interface AliasAssignableState {
        readonly node: Node;
        readonly valueReadonly: boolean;
        readonly constVariable: boolean;
        readonly aliasable: boolean; // constVariable && valueReadonly && !antecedentIsJoin
        readonly lhsType: Type;
        readonly declarationType: Type | undefined;
        readonly initializerType: Type | undefined;
        readonly preferredType: Type;
        inUse: boolean; // to prevent recursion of aliases
    };

    export enum RefTypesTableKind {
        leaf = "leaf",
        nonLeaf = "nonLeaf",
        return = "return"
    };
    declare function isRefTypesTableLeaf(x: RefTypesTable): x is RefTypesTableLeaf;
    declare function isRefTypesTableReturn(x: RefTypesTable): x is RefTypesTableReturn;
    declare function isRefTypesTableReturn(x: RefTypesTableNonLeaf): x is RefTypesTableNonLeaf;
    //export type RefTypesType = & { type: Type }; // keep it abstact for now - may want to opimize later
    export enum RefTypesTypeFlags {
        none=0,
        any=1,
        unknown=2,
//        never=4,  // TODO: kill
//        anyOrUnknown=3 // TODO: kill
    }
    export interface RefTypesTypeNormal {
        _flags: RefTypesTypeFlags.none;
        _set: Set<Type>;
    };
    export interface RefTypesTypeAny {
        _flags: RefTypesTypeFlags.any;
        _set: undefined;
    };
    export interface RefTypesTypeUnknown {
        _flags: RefTypesTypeFlags.unknown;
        _set: undefined;
    };
    export type RefTypesType = RefTypesTypeNormal | RefTypesTypeAny | RefTypesTypeUnknown ;

    export type MakeRequired<Type, Key extends keyof Type> = Omit<Type, Key> & Required<Pick<Type, Key>>;
    // export type RefTypesSymtabValue = MakeRequired<RefTypesTableLeaf, "symbol">;
    export type RefTypesSymtabValue = & {
        leaf: MakeRequired<RefTypesTableLeaf, "symbol">;
        //nonLeaf?: MakeRequired<RefTypesTableNonLeaf, "symbol">;
        /**
         * 'byNode' added for any const variable declaration with initializer, just the nodes in the initializer.
         * The requirement for const isn't necessary if 'byNodes' is refreshed for every new assignment, but that would incur more memory usage.
         * This 'byNode' is passed when calling mrNarrowTypes with `replayMode` argument.
         * In replay mode, if a symbol is looked-up from a refTypesSymtab and symbol dosen't have isconst set,
         * then the type will be taken from replayMode.byNode instead.
         */
        //byNode?: NodeToTypeMap;
    };
    /**
     * Eventually want to extend RefTypesSymtabValue to
     * ```
     * { leaf: MakeRequired<RefTypesTableLeaf, "symbol">, nonLeaf?: MakeRequired<RefTypesTableNonLeaf, "symbol">} }
     * ```
     * where nonLeaf contains more detailed info and can be the operand of any criteria.
     */
    export type RefTypesSymtab = ESMap<Symbol, RefTypesSymtabValue>;
    export type RefTypesTableNonLeaf = & {
        kind: RefTypesTableKind.nonLeaf;
        symbol: Symbol | undefined; // undefined because some expressions have no symbol - will never be included in RefTypesSymTab
        isconst?: boolean;
        preReqByType?: ESMap<RefTypesType, RefTypesSymtab>;
    };
    export type RefTypesTableLeaf = & {
        kind: RefTypesTableKind.leaf;
        symbol: Symbol | undefined;
        isconst?: boolean;
        type: RefTypesType;
    };
    export type RefTypesTable = RefTypesTableReturn | RefTypesTableLeaf | RefTypesTableNonLeaf;

    export type RefTypesTableReturn = & {
        kind: RefTypesTableKind.return;
        symbol: Symbol | undefined;
        isconst?: boolean;
        type: RefTypesType;
        symtab: RefTypesSymtab;
        constraintItem?: ConstraintItem | undefined;
    };

    /**
     * In the special case of RefTypesTable being returned from a narrow operation on an expression with no symbol,
     * symbol is undefined.  It still has narrowing affect, but the result will never be merged into a RefTypesSymtab.
     */

    // export type RefTypesTableRtn = MakeOptional<RefTypesTable, "symbol">;
    // export type RefTypesTableLeafRtn = MakeOptional<RefTypesTableLeaf, "symbol">;
    // export type RefTypesTableNonLeafRtn = MakeOptional<RefTypesTableNonLeaf, "symbol">;

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


    // const InferCritKind = {
    //     none: "none",
    //     truthy: "truthy",
    //     notnullundef: "notnullundef",
    //     assignable:"assignable",
    // } as const;
    //type InferCritKind = typeof InferCritKind[ keyof typeof InferCritKind ];
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
            negate?: boolean;
            typeofString: InferCritTypeofStrings;
        }
    )
    & {alsoFailing?: boolean}; // also output failing, in addition to passing

    export interface ReplayableItem {
        symbol: Symbol;
        isconst: boolean;
        expr: Expression;
        nodeToTypeMap: NodeToTypeMap
    };

    /**
     * `byNode` and `expr` are always set togather, before calling mrNarrowTypes.
     * mrNarrowTypes will immed substitue expr for condExpr and set expr to undefined,
     * however byNode will remain and be passed to mrNarrowTypes for sub-expressions.
     * Replay can be called resursively, and when that happens, `byNode` and `expr`
     * will again be set together for that recursive call.
     */
    // export type ReplayData = & {
    //     //byNode: NodeToTypeMap; // corresponds to the expr, even after expression is set to undefined
    //     //symbol?: Symbol; // in tandem with expr
    //     //isconst: boolean;
    //     //expr?: Expression; // immed used as a substitue for condExpr and set to undefined inside mrNarrowTypes
    // };

    /**
     * If an inferRefTypes caller needs the qdotfallout info, they must place this parameter in the call.
     * If any intermediate has a questionDot token, they must ask for it (crit:alsoFailing) and push the failing result to qdotfallout.
     * Trying to decide whether this is really necessary or not, and an argument in favor of necessary is as follows:
     * > When an inferRefTypesBy... function needs to call inferRefType({..... condExpr:self.expression, crit:{kind:InferCritKind.notnullundef, ...., alsoFailing:true},....})
     * > then it needs to know exactly if the predecessor (and not a prior predecessor to that) has returned a nullish BECAUSE
     * > it is the 'self' expression that carries the questionDotToken between 'sef' and 'self.expression'.  That is reasonable because it is only if the caller ('self')
     * > actually performs a lookup that an error might occurs.  So the error decision must be deferred (* at LEAST) until 'self' processing.
     * > 'self' action pseudocode:
     * >> if preFailing.rtnType is not never
     * >>     if I don't have a 'questionDot' token, then Error (I don't think this decision needs to be deferred but ...)
     * >>     else push `failing.refTypes` to `qdotfallout` - effectively deferring the decision on how to use that until the level "owning" qdotfallout.
     * >> if I have failing lookup on ANY candidate
     * >>     if not `context?nonNullExpression`
     * >>         add {rtnType:undefined, refTypes: refTypes with bySymbol.get(self symbol) lookup value set to `undefined`} to results to results to be passed finally to crit.
     */

    /**
     * InferStatus
     * The "inCondition" member is true when the current node is within a discriminating expression (e.g. "if (node){...}else{...}", or "(node)? x : y").
     * When "inCondition" is true, then the full complexity of expression branching should be preserved to allow for inference, otherwise the complexity should be squashed.
     * Of course, there are limits on the width of branching allowed ("maxBranches", not yet implemented).
     *
     * The "replayData" member is non-false when a variables rhs assigned value is being "replayed" as an alias for the variable, and the sub-member
     * "byNode" is the Node->Type map which will be used for that purpose.
     * The "replayData" member will only ever be non-false when the "on" member is true.
     */
    export type InferStatus = & {
        inCondition: boolean;
        // maxBranches: number
        //replayData: ReplayData | false;
        replayables: ESMap< Symbol, ReplayableItem >;
        replayItemStack: ReplayableItem[];
    };

    // export type ConditionItem = & {
    //     //groupIdx: number;
    //     arrRttr: RefTypesTableReturn[];
    //     expr: Expression,
    //     negate?: boolean;
    //     prev?: ConditionItem | undefined;
    // };

    export type InferRefArgs = & {
        refTypesSymtab: RefTypesSymtab,
        constraintItem?: ConstraintItem // constraintTODO: make required
        condExpr: Readonly<Node>,
        qdotfallout?: RefTypesTableReturn[],
       //qdotbypass?: TypeAndConstraint[], // constraintTODO: make required
        inferStatus: InferStatus,
        crit: InferCrit,
    };

    /**
     * InferRefRtnType
     * This is also the result of applyCrit...
     * Finally multiple branches are projected onto this binary state.
     */
    export type NodeToTypeMap = ESMap<Node, Type>;
    // export type MrNarrowTypesReturnConstraints = & {
    //     passing: TypeAndConstraint,
    //     failing?: TypeAndConstraint,
    // };
    export type MrNarrowTypesReturn = & {
        byNode: NodeToTypeMap;
        //saveByNodeForReplay?: boolean;
        inferRefRtnType: InferRefRtnType;
        //constraints: MrNarrowTypesReturnConstraints;
    };
    export type InferRefRtnType = & {
        passing: RefTypesTableReturn;
        failing?: RefTypesTableReturn;
    };


    export type InferRefInnerArgs = & {
        refTypesSymtab: RefTypesSymtab,
        condExpr: Readonly<Node>,
        qdotfallout: RefTypesTableReturn[],
        //qdotbypass?: TypeAndConstraint[], // constraintTODO: make required
        inferStatus: InferStatus,
        // prevConditionItem?: ConditionItem | undefined
        constraintItem?: ConstraintItem | undefined;
        /**
         * In replay mode, if a symbol is looked-up from a refTypesSymtab and either symbol is undefined or isconst is not true,
         * then the type will be taken from replayMode.byNode instead.
         */
        //readonly replayData: Omit<ReplayData, "symbol" | "expr"> | false;
    };

    // export enum MrNarrowTypesInnerUnaryModifierKind {
    //     prefixExclamation = 1
    // };
    // export type TypeAndConstraint = & {
    //     type: RefTypesType, symbol?: Symbol, isconst?: boolean,
    //     constraintNode: ConstraintItemNode,

    // };
    // export type TypesAndContraints = & {
    //     arrTypeAndConstraint: {
    //         type: RefTypesType;
    //         symbol?: Symbol;
    //         isconst?: boolean;
    //         constraintNode?: ConstraintItemNode;
    //     }[];
    //     sharedConstraint?: ConstraintItemNode;
    // };
    export type MrNarrowTypesInnerReturn = & {
        byNode: NodeToTypeMap;
        assignmentData?: { // set when Delcaration or assignment, and replayData was false
            //saveByNodeForReplay?: boolean;
            symbol: Symbol,
            isconst: boolean;
        }
        arrRefTypesTableReturn: RefTypesTableReturn[];
        //constraintItem: ConstraintItem | undefined;
        //typesAndConstraints?: TypesAndContraints; // constraintTODO: make required
        //arrTypeAndConstraint?: TypeAndConstraint[]; // constraintTODO: kill
        //unaryModifiers?: MrNarrowTypesInnerUnaryModifierKind[];
        //negateCrit?: boolean; // set when kind === SyntaxKind.UnaryPrefix && operator === SyntaxKind.ExclamationToken
    };



    export type CheckExprData = & {
        node: Node;
        isConst: boolean;
        symbol: Symbol;
        type: Type;
    };
    export type ConditionStackItem = & {
        expr: Expression;
        assume: boolean;
        //involved: ESMap<Symbol, CheckExprData[]>;
    };
    // export type AliasableAssignmentCacheItem = & {
    //     expr: Expression;
    // };
    // export type AliasableAssignmentCache = & {
    //     bySymbol: ESMap<Symbol, AliasableAssignmentCacheItem>;
    // };
    export enum ConstraintItemKind {
        node = "node",
        leaf = "leaf",
        never = "never",
    };
    export enum ConstraintItemNodeOp {
        or = "or",
        and = "and",
        not = "not"
    };
    export type ConstraintItemNodeAnd = & {
        kind: ConstraintItemKind.node;
        op: ConstraintItemNodeOp.and;
        constraints: ConstraintItem[],
    };
    export type ConstraintItemNodeOr = & {
        kind: ConstraintItemKind.node;
        op: ConstraintItemNodeOp.or;
        constraints: ConstraintItem[],
    };
    export type ConstraintItemNodeNot = & {
        kind: ConstraintItemKind.node;
        op: ConstraintItemNodeOp.not;
        constraint: ConstraintItem,
    };
    export type ConstraintItemNode = ConstraintItemNodeAnd | ConstraintItemNodeOr | ConstraintItemNodeNot;
    export type ConstraintItemLeaf = & {
        kind: ConstraintItemKind.leaf;
        //negate?: boolean;
        symbol: Symbol;
        type: RefTypesType;
    };
    export type ContstraintItemNever = & {
        kind: ConstraintItemKind.never;
    };
    export type ConstraintItem = ConstraintItemLeaf | ConstraintItemNode | ContstraintItemNever;
}
