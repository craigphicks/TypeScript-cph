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
    export interface RefTypesType {
        _set: Set<Type>;
    };
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
        byNode?: NodeToTypeMap;
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
        twocrit= "twocrit"
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
    }) & {alsoFailing?: boolean}; // also output failing, in addition to passing

    //export type InferTypeArgsQDotFallout = RefTypesTableReturn[];
    export type InferRefArgs = & {
        refTypesSymtab: RefTypesSymtab,
        //byNode: NodeToTypeMap,
        condExpr: Readonly<Node>,
        crit: InferCrit,
        //context?: InferRefArgsContext, // This ONLY applies to next call, should not be forward beyond.  TODO: change name to `immedContext` to make that obvious.
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
        qdotfallout: RefTypesTableReturn[], // TODO: should be mandatory
        /**
         * In replay mode, if a symbol is looked-up from a refTypesSymtab and either symbol is undefined or isconst is not true,
         * then the type will be taken from replayMode.byNode instead.
         */
        readonly doReplayMode: boolean;
        replayMode?: {
            byNode: NodeToTypeMap;
        }
    };

    /**
     * InferRefRtnType
     * This is also the result of applyCrit...
     * Finally multiple branches are projected onto this binary state.
     */
    export type NodeToTypeMap = ESMap<Node, Type>;
    export type MrNarrowTypesReturn = & {
        byNode: NodeToTypeMap;
        inferRefRtnType: InferRefRtnType;
    };
    export type InferRefRtnType = & {
        passing: RefTypesTableReturn;
        failing?: RefTypesTableReturn;
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
    export type AliasableAssignmentCacheItem = & {
        expr: Expression;
    };
    export type AliasableAssignmentCache = & {
        bySymbol: ESMap<Symbol, AliasableAssignmentCacheItem>;
    };

}
