/* eslint-disable @typescript-eslint/prefer-for-of */

import {
    TypeFacts,
    signatureHasRestParameter,
} from "./checker";
import {
    isArray,
} from "./core";
import {
    Debug,
} from "./debug";
import {
    isIdentifier,
    isNonNullExpression,
    isVariableDeclaration,
} from "./factory/nodeTests";
import {
    logicalObjectAccessModule,
    floughLogicalObjectInnerModule,
    LogicalObjectAccessReturn,
} from "./floughLogicalObjectInner";
import {
    floughLogicalObjectModule,
    FloughLogicalObjectIF,
} from "./floughLogicalObjectOuter";
import {
    RefTypesType,
    floughTypeModule,
    FloughType,
    ObjectUsableAccessKeys,
} from "./floughType";
import {
    AccessArgs,
    AccessArgsRoot,
    ConstraintItem,
    ConstraintItemKind,
    ConstraintItemNodeOp,
    FloughArgs,
    FloughInnerReturn,
    FloughReturn,
    FloughTypeChecker,
    FloughCrit,
    FloughCritKind,
    FloughStatus,
    LogicalObjecAccessData,
    NodeToTypeMap,
    RefTypesSymtabConstraintItem,
    RefTypesSymtabConstraintItemNotNever,
    RefTypesTable,
    RefTypesTableReturn,
    RefTypesTableReturnNoSymbol,
    ReplayableItem,
    assertCastType,
} from "./floughTypedefs";
import {
    andSymbolTypeIntoSymtabConstraint,
    isNeverConstraint,
    orSymtabConstraints,
} from "./floughConstraints";
import {
    SymbolFlowInfo,
    MrState,
    getDevExpectStrings,
    extraAsserts,
    refactorConnectedGroupsGraphsNoShallowRecursion,
} from "./floughGroup";
import {
    applyCritNoneUnion,
    applyCritNoneToOne,
    applyCrit,
    applyCrit1ToOne,
    SymbolWithAttributes,
    getSymbolIfUnique,
    resolveLogicalObjectAccessData,
    orIntoNodeToTypeMap,
} from "./floughGroupApplyCrit";
import {
    RefTypesSymtab,
    createRefTypesSymtab,
    copyRefTypesSymtab,
    dbgRefTypesSymtabToStrings,
    isRefTypesSymtabConstraintItemNever,
    createRefTypesSymtabConstraintItemNever,
    copyRefTypesSymtabConstraintItem,
    dbgRefTypesSymtabConstrinatItemToStrings,
} from "./floughGroupRefTypesSymtab";
import {
    Node,
    TypeChecker,
    CompilerOptions,
    SourceFile,
    Type,
    LiteralType,
    TypeFlags,
    Symbol,
    SymbolFlags,
    TupleType,
    UnionReduction,
    IntrinsicType,
    StringLiteralType,
    NumberLiteralType,
    ObjectType,
    Signature,
    CheckFlags,
    SyntaxKind,
    ParameterDeclaration,
    CallExpression,
    SpreadElement,
    ObjectFlags,
    Expression,
    ParenthesizedExpression,
    PropertyAccessExpression,
    Identifier,
    BinaryExpression,
    ConditionalExpression,
    PrefixUnaryExpression,
    ArrayLiteralExpression,
    ElementFlags,
    ObjectLiteralExpression,
    AsExpression,
    TypeReferenceNode,
    PropertyAssignment,
    SignatureKind,
    VariableDeclaration,
    TypeOfExpression,
    ElementAccessExpression,
    TupleTypeReference,
} from "./types";
import {
    getCheckFlags,
    getSourceTextOfNodeFromSourceFile,
} from "./utilities";
import { IDebug } from "./mydebug";

/* eslint-disable no-double-space */

// export const enableMapReplayedObjectTypesToSymbolFlowInfoTypes = true;

export interface MrNarrow {
    flough({ sci, expr, crit, qdotfallout, floughStatus }: FloughArgs): FloughReturn;
    createRefTypesSymtab(): RefTypesSymtab;
    copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab;
    dbgRefTypesTableToStrings(t: RefTypesTable): string[];
    dbgRefTypesSymtabToStrings(t: RefTypesSymtab): string[];
    dbgConstraintItem(ci: Readonly<ConstraintItem>): string[];
//    IDebug.dbgs.symbolToStringSimple(symbol: Readonly<Symbol> | undefined): string;
//    IDebug.dbgs.nodeToString(node: Node): string;
    createNodeToTypeMap(): NodeToTypeMap;
    mergeIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap): void;
    getEffectiveDeclaredType(symbolFlowInfo: SymbolFlowInfo): RefTypesType;
    getDeclaredType(symbol: Symbol): RefTypesType;
    checker: TypeChecker;
    compilerOptions: CompilerOptions;
    mrState: MrState;
}

export function createMrNarrow(checker: FloughTypeChecker, sourceFile: Readonly<SourceFile>, _mrState: MrState, /*refTypesTypeModule: RefTypesTypeModule, */ compilerOptions: CompilerOptions): MrNarrow {
    // const {
    //     // @ts-ignore-error
    //     subtypeRelation,
    //     // @ts-ignore-error
    //     strictSubtypeRelation,
    //     assignableRelation,
    //     // @ts-ignore-error
    //     comparableRelation,
    //     // @ts-ignore-error
    //     identityRelation,
    //     // @ts-ignore-error
    //     enumRelation,
    // } = checker.getRelations();
    const assignableRelation = checker.getAssignableRelation();
    const undefinedType = checker.getUndefinedType();
    const nullType = checker.getNullType();
    const anyType = checker.getAnyType();
    const trueType = checker.getTrueType();
    const falseType = checker.getFalseType();
    const typeToString = checker.typeToString;
    const isArrayType = checker.isArrayType;
    const getElementTypeOfArrayType = checker.getElementTypeOfArrayType;
    const isConstVariable = checker.isConstVariable;
    const getUnionType = checker.getUnionType;
    const getResolvedSymbol = checker.getResolvedSymbol;
    const getSymbolOfNode = checker.getSymbolOfNode;


    const mrNarrow: MrNarrow = {
        flough,
        createRefTypesSymtab,
        copyRefTypesSymtab,
        dbgRefTypesTableToStrings,
        dbgRefTypesSymtabToStrings,
        dbgConstraintItem,
        // IDebug.dbgs.symbolToStringSimple: IDebug.dbgs.symbolToString,
        // IDebug.dbgs.nodeToString,
        createNodeToTypeMap,
        mergeIntoNodeToTypeMaps: mergeIntoMapIntoNodeToTypeMaps,
        getEffectiveDeclaredType,
        getDeclaredType: getEffectiveDeclaredTypeFromSymbol,
        checker,
        compilerOptions,
        mrState: _mrState,
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function getEffectiveDeclaredType(symbolFlowInfo: SymbolFlowInfo): RefTypesType {
        return symbolFlowInfo.effectiveDeclaredType ?? (symbolFlowInfo.effectiveDeclaredType = floughTypeModule.createRefTypesType(symbolFlowInfo.effectiveDeclaredTsType));
    }
    /**
     * @param symbol
     * @returns
     */
    function getEffectiveDeclaredTypeFromSymbol(symbol: Symbol): RefTypesType {
        const symbolFlowInfo = _mrState.symbolFlowInfoMap.get(symbol);
        Debug.assert(symbolFlowInfo);
        return getEffectiveDeclaredType(symbolFlowInfo);
    }

    // TODO: change name to normalizeLiterals
    function projectTsTypeEnumLiteralsToPlainLiterals(tstype: Type): Type {
        const setFromEnum = new Set<LiteralType>();
        let tOtherCount = 0;
        checker.forEachType(tstype, t => {
            if (t.flags & TypeFlags.EnumLiteral) {
                const litValue = (t as LiteralType).value;
                const typeOfValue = typeof litValue;
                if (typeOfValue === "number") {
                    setFromEnum.add(checker.getNumberLiteralType(litValue as number));
                }
                else if (typeOfValue === "string") {
                    setFromEnum.add(checker.getStringLiteralType(litValue as string));
                }
                else Debug.fail("unexpected");
            }
            else if (t.flags & TypeFlags.Literal) {
                const regularType = (t as LiteralType).regularType as LiteralType;
                Debug.assert(regularType.value);
                setFromEnum.add(regularType);
            }
            else tOtherCount++;
        });
        if (setFromEnum.size === 0) return tstype;
        const at: Type[] = [];
        setFromEnum.forEach(lt => at.push(lt));
        if (tOtherCount !== 0) {
            checker.forEachType(tstype, t => {
                if (!(t.flags & (TypeFlags.EnumLiteral | TypeFlags.Literal))) at.push(t);
            });
        }
        return checker.getUnionType(at);
    }

    function enumMemberSymbolToLiteralTsType(symbol: Symbol): Type {
        Debug.assert(symbol.flags & SymbolFlags.EnumMember);
        const litValue = (checker.getTypeOfSymbol(symbol) as LiteralType).value;
        if (typeof litValue === "string") return checker.getStringLiteralType(litValue);
        else if (typeof litValue === "number") return checker.getNumberLiteralType(litValue);
        Debug.fail("unexpected");
    }

    function floughGetTsTypeOfSymbol(symbol: Symbol): Type {
        Debug.assert(!(symbol.flags & SymbolFlags.RegularEnum));
        const type = checker.getTypeOfSymbol(symbol);
        return projectTsTypeEnumLiteralsToPlainLiterals(type);
    }

    function dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string {
        const astr: string[] = [];

        floughTypeModule.forEachRefTypesTypeType(rt, t => {
            // Previously returned the the result of push by mistake (no brackets), that was 1 (length of the array), and then forEach terminates.
            astr.push(`${IDebug.dbgs.typeToString(t)}`);
        });
        return astr.join(" | ");
    }
    function dbgConstraintItem(ci: ConstraintItem): string[] {
        Debug.assert(ci);
        const as: string[] = ["{"];
        if (!ci.symbolsInvolved) as.push(` symbolsInvoled: <undefined>`);
        else {
            let str = " symbolsInvoled:";
            ci.symbolsInvolved.forEach(s => str += `${s.escapedName},`);
            as.push(str);
        }
        as.push(` kind: ${ci.kind},`);
        if (ci.kind === ConstraintItemKind.never) {
            /**/
        }
        else if (ci.kind === ConstraintItemKind.always) {
            /**/
        }
        else if (ci.kind === ConstraintItemKind.leaf) {
            as.push(`  symbol: ${IDebug.dbgs.symbolToString(ci.symbol)},`);
            as.push(`  type: ${dbgRefTypesTypeToString(ci.type)},`);
        }
        else {
            as.push(`  node: ${ci.op},`);
            if (ci.op === ConstraintItemNodeOp.not) {
                as.push(`  constraint:`);
                dbgConstraintItem(ci.constraint).forEach(s => as.push("    " + s));
                as[as.length - 1] += ",";
            }
            else {
                as.push(`  constraints:[`);
                ci.constraints.forEach(ci1 => {
                    dbgConstraintItem(ci1).forEach(s => as.push("    " + s));
                });
                as.push(`  ],`);
            }
        }
        as.push("},");
        return as;
    }

    function dbgRefTypesTableToStrings(rtt: RefTypesTable | undefined): string[] {
        if (!rtt) return ["undefined"];
        const as: string[] = ["{"];
        if ((rtt as any).symbol) as.push(`  symbol: ${IDebug.dbgs.symbolToString((rtt as any).symbol)},`);
        if ((rtt as any).isconst) as.push(`  isconst: ${(rtt as any).isconst},`);
        if ((rtt as RefTypesTableReturn).isAssign) as.push(`  isAssign: ${(rtt as any).isAssign},`);
        if (!rtt.type) as.push(`  type: <undef>, // during recursive calls of floughAccessExpressionCritNone`);
        else {
            Debug.assert(rtt.type);
            as.push(`  type: ${dbgRefTypesTypeToString(rtt.type)}`);
        }
        if (true) {
            if (!rtt.sci.symtab) as.push("  symtab: <undef>");
            else dbgRefTypesSymtabToStrings(rtt.sci.symtab).forEach((str, i) => as.push(((i === 0) ? "  symtab: " : "  ") + str));
            if (!rtt.sci.constraintItem) {
                as.push("  constraintItem: undefined");
            }
            else {
                const ciss = dbgConstraintItem(rtt.sci.constraintItem);
                as.push("  constraintItem: " + ciss[0]);
                ciss.slice(1).forEach(s => as.push("    " + s));
            }
        }
        if (rtt.logicalObjectAccessData) {
            const load = rtt.logicalObjectAccessData;
            as.push(`  logicalObjectAccessData: {logicalObjectAccessReturn:...,finalTypeIdx:${load.finalTypeIdx}}`);
        }
        as.push("}");
        return as;
    }

    function setEffectiveDeclaredTsTypeOfLogicalObjectOfType(rhsType: FloughType, lhsSymbolFlowInfo: Readonly<SymbolFlowInfo>): { logicalObjectRhsType: FloughType; nobjRhsType: FloughType; nobjEdtType: FloughType; } {
        const splitRhs = floughTypeModule.splitLogicalObject(rhsType);
        let { logicalObject: logicalObjectRhs } = splitRhs;
        // if (extraAsserts) Debug.assert(logicalObjectRhs);
        const { logicalObject: logicalObjectEdt, remaining: remainingEdt } = floughTypeModule.splitLogicalObject(getEffectiveDeclaredType(lhsSymbolFlowInfo));
        if (logicalObjectRhs && logicalObjectEdt) {
            logicalObjectRhs = floughLogicalObjectModule.createCloneWithEffectiveDeclaredTsType(logicalObjectRhs, floughLogicalObjectModule.getEffectiveDeclaredTsTypeFromLogicalObject(logicalObjectEdt));
        }
        const logicalObjectRhsType = floughTypeModule.createTypeFromLogicalObject(logicalObjectRhs);
        return { logicalObjectRhsType, nobjRhsType: splitRhs.remaining, nobjEdtType: remainingEdt };
    }

    function widenDeclarationOrAssignmentRhs(rhsType: Readonly<RefTypesType>, lhsSymbolFlowInfo: Readonly<SymbolFlowInfo>): RefTypesType {
        const { logicalObjectRhsType: logicalObjectType, nobjRhsType: remainingRhs, nobjEdtType } = setEffectiveDeclaredTsTypeOfLogicalObjectOfType(rhsType, lhsSymbolFlowInfo);
        let roArray = false;
        let roTuple = false;
        if (logicalObjectType) {
            checker.forEachType(lhsSymbolFlowInfo.effectiveDeclaredTsType, t => {
                if (t.flags & TypeFlags.Object) {
                    if (checker.isArrayOrTupleType(t)) {
                        if (checker.isArrayType(t)) {
                            if (checker.isReadonlyArrayType(t)) {
                                roArray = true;
                            }
                        }
                        else {
                            if ((t as TupleType).readonly) {
                                roTuple = true;
                            }
                        }
                    }
                }
            });
            if (roTuple || roArray) {
                //
            }
        }
        if (!compilerOptions.floughDoNotWidenInitalizedFlowType) {
            // const edtstype = lhsSymbolFlowInfo.effectiveDeclaredTsType;
            // if (checker.isArrayOrTupleType(edtstype)){
            //     if (checker.isArrayType(edtstype)){
            //         //
            //     }
            //     else {
            //         if ((edtstype.target as TupleType).readonly){
            //             logicalObjectType
            //             checker.createReaonlyTupleTypeFromTupleType()
            //         }
            //     }
            // }
            const widenedNobjType = floughTypeModule.widenNobjTypeByEffectiveDeclaredNobjType(remainingRhs, nobjEdtType);
            if (logicalObjectType) {
                return floughTypeModule.unionWithFloughTypeMutate(widenedNobjType, logicalObjectType);
            }
            else {
                return widenedNobjType;
            }
        }
        else {
            return floughTypeModule.unionWithFloughTypeMutate(remainingRhs, logicalObjectType);
        }
    }

    function createNodeToTypeMap(): NodeToTypeMap {
        return new Map<Node, Type>();
    }
    function mergeIntoMapIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap): void {
        // if (IDebug.isActive(loggerLevel)){
        //     IDebug.ilogGroup(`mergeIntoMapIntoNodeToTypeMaps[in]`);
        // }
        source.forEach((t, n) => {
            // if (IDebug.isActive(loggerLevel)){
            //     IDebug.ilog(()=>`mergeIntoNodeToTypeMaps[dbg] node:${IDebug.dbgs.nodeToString(n)}, type:${typeToString(t)}`);
            // }
            const gott = target.get(n);
            if (!gott) target.set(n, t);
            else {
                const tt = getUnionType([gott, t], UnionReduction.Literal);
                target.set(n, tt);
            }
        });
        // if (IDebug.isActive(loggerLevel)){
        //     let str = `mergeIntoNodeToTypeMaps[dbg] cum node ids:`;
        //     target.forEach((_type,node)=>{
        //         str += ` node.id:${node.id},`;
        //     });
        //     IDebug.ilog(str);
        //     IDebug.ilogGroupEnd();
        // }
    }
    // function mergeOneIntoNodeToTypeMaps(node: Readonly<Node>, type: Type, target: NodeToTypeMap, dontSkip?: boolean): void {
    //     if (!dontSkip) return;
    //     // if (IDebug.isActive(loggerLevel)){
    //     //     IDebug.ilogGroup(`mergeOneIntoNodeToTypeMaps[in] node:${IDebug.dbgs.nodeToString(node)}, type:${typeToString(type)}, dontSkip:${dontSkip}`);
    //     // }
    //     const gott = target.get(node);
    //     if (!gott) target.set(node,type);
    //     else {
    //         const tt = getUnionType([gott,type], UnionReduction.Literal);
    //         target.set(node,tt);
    //     }
    //     // if (IDebug.isActive(loggerLevel)){
    //     //     let str = `mergeOneIntoNodeToTypeMaps[dbg] cum node ids:`;
    //     //     target.forEach((_type,node)=>{
    //     //         str += ` node.id:${node.id},`;
    //     //     });
    //     //     IDebug.ilog(str);
    //     //     IDebug.ilogGroupEnd();
    //     // }
    // }

    // // @ts-expect-error
    // function typeIsTruthy(tstype: Type): {true: boolean, false: boolean} {
    //     const tf = checker.getTypeFacts(tstype);
    //     return { true: !!(tf&TypeFacts.Truthy), false: !!(tf&TypeFacts.Falsy) };
    // }
    // // @ts-expect-error
    // function typeIsNotNullUndef(tstype: Type): {true: boolean, false: boolean} {
    //     const tf = checker.getTypeFacts(tstype);
    //     return { true: !!(tf&TypeFacts.NEUndefinedOrNull), false: !!(tf&TypeFacts.EQUndefinedOrNull) };
    // }
    // // @ts-expect-error
    // function typeIsAssignableTo(source: Type, target: Type): boolean {
    //     return checker.isTypeRelatedTo(source, target, assignableRelation);
    // }

    /**
     * @param type
     * @param crit
     * @returns type narrowed by criterion crit
     */
    function applyCritToRefTypesType<F extends (t: Type, pass: boolean, fail: boolean) => void>(rt: RefTypesType, crit: FloughCrit, func: F): void {
        if (crit.kind === FloughCritKind.none) {
            floughTypeModule.forEachRefTypesTypeType(rt, t => {
                func(t, /* pass */ true, /* fail */ false);
            });
        }
        else if (crit.kind === FloughCritKind.truthy) {
            const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
            const ffacts = !crit.negate ? TypeFacts.Falsy : TypeFacts.Truthy;
            floughTypeModule.forEachRefTypesTypeType(rt, t => {
                const tf = checker.getTypeFacts(t);
                func(t, !!(tf & pfacts), !!(tf & ffacts));
            });
        }
        else if (crit.kind === FloughCritKind.notnullundef) {
            const pfacts = !crit.negate ? TypeFacts.NEUndefinedOrNull : TypeFacts.EQUndefinedOrNull;
            const ffacts = !crit.negate ? TypeFacts.EQUndefinedOrNull : TypeFacts.NEUndefinedOrNull;
            floughTypeModule.forEachRefTypesTypeType(rt, t => {
                const tf = checker.getTypeFacts(t);
                func(t, !!(tf & pfacts), !!(tf & ffacts));
            });
        }
        else if (crit.kind === FloughCritKind.assignable) {
            floughTypeModule.forEachRefTypesTypeType(rt, source => {
                let rel = checker.isTypeRelatedTo(source, crit.target, assignableRelation);
                if (crit.negate) rel = !rel;
                func(source, rel, !rel);
            });
        }
        // else if (crit.kind===InferCritKind.typeof) {
        //     Debug.fail("unexpected");
        // }
        else {
            // @ts-ignore
            Debug.assert(false, "cannot handle crit.kind ", () => crit.kind);
        }
    }

    /**
     * If the value is omitted or is 0, -0, null, false, NaN, undefined, or the empty string (""),
     * return false type. All other values, return true type
     * @param uType
     */
    // @ts-ignore-error
    function convertNonUnionNonIntersectionTypeToBoolean(uType: Type): boolean {
        Debug.assert(!(uType.flags & TypeFlags.UnionOrIntersection));
        if (uType === undefinedType || uType === nullType) return false;
        // There is some ambiguity about boolean literal false
        if (uType.flags & TypeFlags.BooleanLiteral && (uType as IntrinsicType).intrinsicName === "false") return false;
        if (uType === checker.getFalseType()) return false;
        if (uType.flags & TypeFlags.StringLiteral && (uType as StringLiteralType).value === "") return false;
        if (
            uType.flags & TypeFlags.NumberLiteral && (
                (uType as NumberLiteralType).value === 0 ||
                (uType as NumberLiteralType).value === -0 ||
                isNaN((uType as NumberLiteralType).value)
            )
        ) {
            return false;
        }
        return true;
    }

    function typeToTypeofStrings(tstype: Type): string[] {
        const flags = tstype.flags;
        if (flags & TypeFlags.UnionOrIntersection) Debug.fail("union or intersection types unexpected here");
        // Never           = 1 << 17,  // Never type
        // Unknown         = 1 << 1,
        if (flags & (TypeFlags.Never)) return []; // Debug.fail("never type unexpected here");
        // Any             = 1 << 0,
        if (flags & (TypeFlags.Any | TypeFlags.Unknown)) return ["undefined", "string", "number", "boolean", "bignint", "object", "function", "symbol"];
        // String          = 1 << 2,
        // StringLiteral   = 1 << 7,
        if (flags & (TypeFlags.String | TypeFlags.StringLiteral)) return ["string"];
        // Number          = 1 << 3,
        // NumberLiteral   = 1 << 8,
        if (flags & (TypeFlags.Number | TypeFlags.NumberLiteral)) return ["number"];
        // Boolean         = 1 << 4,
        // BooleanLiteral  = 1 << 9,
        if (flags & (TypeFlags.Boolean | TypeFlags.BooleanLiteral)) return ["boolean"];
        // BigInt          = 1 << 6,
        // BigIntLiteral   = 1 << 11,
        if (flags & (TypeFlags.BigInt | TypeFlags.BigIntLiteral)) return ["bigint"];

        // Enum            = 1 << 5, -- is this always or'ed with number or string???
        // EnumLiteral     = 1 << 10,  // Always combined with StringLiteral, NumberLiteral, or Union

        // ESSymbol        = 1 << 12,  // Type of symbol primitive introduced in ES6
        // UniqueESSymbol  = 1 << 13,  // unique symbol
        if (flags & (TypeFlags.ESSymbol | TypeFlags.UniqueESSymbol)) return ["symbol"];

        // Void            = 1 << 14,
        // Undefined       = 1 << 15,
        if (flags & (TypeFlags.Void | TypeFlags.Undefined)) return ["undefined"];

        // Null            = 1 << 16,
        if (flags & (TypeFlags.Null)) return ["object"];
        // Object          = 1 << 19,  // Object type
        if (flags & (TypeFlags.Object)) {
            if (checker.isArrayType(tstype) || checker.isTupleType(tstype)) return ["object"];
            assertCastType<ObjectType>(tstype);
            if (tstype.callSignatures?.length || tstype.constructSignatures?.length) return ["function"];
            return ["object"];
        }
        Debug.fail(`unexpected tstype.flags: ${Debug.formatTypeFlags(flags)}`);
        // TypeParameter   = 1 << 18,  // Type parameter
        // Union           = 1 << 20,  // Union (T | U)
        // Intersection    = 1 << 21,  // Intersection (T & U)
        // Index           = 1 << 22,  // keyof T
        // IndexedAccess   = 1 << 23,  // T[K]
        // Conditional     = 1 << 24,  // T extends U ? X : Y
        // Substitution    = 1 << 25,  // Type parameter substitution
        // NonPrimitive    = 1 << 26,  // intrinsic object type
        // TemplateLiteral = 1 << 27,  // Template literal type
        // StringMapping   = 1 << 28,  // Uppercase/Lowercase type
    }

    // type TransientExpressionSymbol = Symbol & { expr: Expression, typeofArgSymbol: Symbol, map: WeakMap<Type, RefTypesType> };
    // function createTransientExpressionSymbol(expr: Expression, effectiveDeclaredTsType: Type, typeofArgSymbol: Symbol): TransientExpressionSymbol {
    //     const name = `transientExpressionSymbol`;//(${argSymbol.escapedName})`;
    //     if (IDebug.isActive(loggerLevel)) (name as any) += `, node: ${IDebug.dbgs.nodeToString(expr)}`;
    //     const symbol: TransientExpressionSymbol = {
    //         ... checker.createSymbol(0, name as __String),
    //         expr,
    //         typeofArgSymbol,
    //         map: new WeakMap<Type,RefTypesType>()
    //     };
    //     //if (options?.typeofArgSymbol) symbol.typeofArgSymbol = options.typeofArgSymbol;
    //     _mrState.symbolFlowInfoMap.set(symbol,{
    //         effectiveDeclaredTsType,
    //         isconst: true,
    //         passCount: 0,
    //     });
    //     return symbol;
    // }


    function debugDevExpectEffectiveDeclaredType(node: Node, symbolFlowInfo: Readonly<SymbolFlowInfo>): void {
        const loggerLevel = 2;
        const arrexpected = getDevExpectStrings(node, sourceFile);
        if (arrexpected) {
            // const actual = `count: ${symbolFlowInfo.passCount}, actualDeclaredTsType: ${typeToString(symbolFlowInfo.effectiveDeclaredTsType)}`;
            const actual = `count: ${symbolFlowInfo.passCount}, effectiveDeclaredTsType: ${typeToString(symbolFlowInfo.effectiveDeclaredTsType)}`;
            const pass = arrexpected.some(expected => {
                return actual === expected;
            });
            if (!pass) {
                Debug.fail(`ts-dev-expect-string: no match for actual: "${actual}"`);
            }
            if (IDebug.isActive(loggerLevel)) {
                IDebug.ilog(()=>`debugDevExpectEffectiveDeclaredType, passed ts-dev-expect-string "${actual}"`, loggerLevel);
            }
        }
    }

    // @ ts-expect-error
    function getSigParamType(sig: Readonly<Signature>, idx: number): { type: Type; isRest?: boolean; optional?: boolean; symbol: Symbol; } {
        if (idx >= sig.parameters.length - 1) {
            if (signatureHasRestParameter(sig)) {
                const symbol = sig.parameters.slice(-1)[0];
                const arrayType = floughGetTsTypeOfSymbol(symbol);
                Debug.assert(isArrayType(arrayType));
                const type = getElementTypeOfArrayType(arrayType)!;
                return { type, isRest: true, symbol };
            }
        }
        // if (idx>=sig.parameters.length)
        Debug.assert(idx < sig.parameters.length);
        const symbol = sig.parameters[idx];
        const type = floughGetTsTypeOfSymbol(symbol);
        // determining optional is hard! signatureToString seems to call this line several layers beneath the surface:
        // const isOptional = parameterDeclaration && isOptionalParameter(parameterDeclaration) || getCheckFlags(parameterSymbol) & CheckFlags.OptionalParameter;
        // c.f. checker.ts, function isOptionalParameter(node: ParameterDeclaration | JSDocParameterTag | JSDocPropertyTag) {...}

        let optional = !!(symbol.flags & SymbolFlags.Optional);
        if (!optional) {
            optional = !!(getCheckFlags(symbol) & CheckFlags.OptionalParameter);
        }
        if (!optional && symbol.valueDeclaration) {
            Debug.assert(symbol.valueDeclaration.kind === SyntaxKind.Parameter);
            optional = checker.isOptionalParameter(symbol.valueDeclaration as ParameterDeclaration);
        }
        return { type, optional, symbol };
    }
    // @ ts-expect-error
    function isValidSigParamIndex(sig: Readonly<Signature>, idx: number): boolean {
        return signatureHasRestParameter(sig) || idx < sig.parameters.length;
    }

    // const transientArgumentSymbol = Symbol("transientArgumentSymbol");
    // type TransientCallArgumentSymbol = Symbol & {
    //     //callExpresionResolvedArg: CallExpressionResolvedArg;
    //     cargidx: number;
    //     tupleMember?: {
    //         indexInTuple: number;
    //     };
    //     transientArgumentSymbol: typeof transientArgumentSymbol;
    // };
    type CallArgumentSymbol = Symbol | undefined;
    type CallExpressionResolvedArg = {
        symbol?: CallArgumentSymbol;
        isconst?: boolean;
        type: RefTypesType;
        tstype: Type;
        hasSpread?: boolean; // last arg might have it
    };
    // function isTransientArgumentSymbol(symbol: CallArgumentSymbol): symbol is TransientCallArgumentSymbol {
    //     return (symbol as TransientCallArgumentSymbol).transientArgumentSymbol===transientArgumentSymbol;
    // }
    /**
     * Process the arguments of a CallExpression.
     * @param args
     */
    function floughByCallExpressionProcessCallArguments(args: {
        callExpr: Readonly<CallExpression>;
        sc: RefTypesSymtabConstraintItem;
        floughStatus: FloughStatus;
        // setOfTransientCallArgumentSymbol: Set<TransientCallArgumentSymbol>
    }): {
        sc: RefTypesSymtabConstraintItem;
        resolvedCallArguments: CallExpressionResolvedArg[];
    } {
        const loggerLevel = 2;
        if (IDebug.isActive(loggerLevel)) {
            IDebug.ilogGroup(()=>`floughByCallExpressionProcessCallArguments[in] ${IDebug.dbgs.nodeToString(args.callExpr)} `, loggerLevel);
        }
        const { callExpr, sc: scIn, floughStatus: floughStatus } = args;
        // function createTransientCallArgumentSymbol_(idx: number, cargidx: number,tupleMember: TransientCallArgumentSymbol["tupleMember"] | undefined, type: RefTypesType): TransientCallArgumentSymbol {
        //     let name = `idx:${idx},cargidx:${cargidx}`;
        //     if (tupleMember) name += `indexInTuple:${tupleMember.indexInTuple}`;
        //     const symbol: CallArgumentSymbol = { ... checker.createSymbol(0, name as __String), cargidx, transientArgumentSymbol };
        //     _mrState.symbolFlowInfoMap.set(symbol,{
        //         effectiveDeclaredTsType:floughTypeModule.getTypeFromRefTypesType(type),
        //         isconst: true,
        //         passCount: 0,
        //     });
        //     args.setOfTransientCallArgumentSymbol.add(symbol);
        //     return symbol;
        // }
        // function createTransientCallArgumentSymbol(..._args: any[]): undefined {}

        const resolvedCallArguments: CallExpressionResolvedArg[] = [];
        let sctmp: RefTypesSymtabConstraintItem = scIn;
        callExpr.arguments.forEach((carg, _cargidx) => {
            if (carg.kind === SyntaxKind.SpreadElement) {
                const mntr = flough({
                    sci: sctmp,
                    expr: (carg as SpreadElement).expression,
                    crit: {
                        kind: FloughCritKind.none,
                    },
                    qdotfallout: undefined,
                    floughStatus: floughStatus,
                });
                const unmerged = mntr.unmerged;
                let symbolOuter: Symbol | undefined;
                let isconstOuter: boolean | undefined;
                {
                    if (unmerged.length === 1 || (unmerged.length && unmerged.slice(1).every(rttr => rttr.symbol === unmerged[0].symbol))) {
                        ({ symbol: symbolOuter, isconst: isconstOuter } = unmerged[0]);
                    }
                }
                const rttr: RefTypesTableReturn = applyCritNoneUnion(mntr, floughStatus.groupNodeToTypeMap);

                sctmp = rttr.sci; // { symtab: rttr.symtab, constraintItem: rttr.constraintItem };
                const tstype1 = floughTypeModule.getTsTypeFromFloughType(rttr.type);
                if (checker.isArrayOrTupleType(tstype1)) {
                    if (checker.isTupleType(tstype1)) {
                        /**
                         * NOTE!: Calling andSymbolTypeIntoSymtabConstraint outside of applyCrit/applyCritNone.
                         */
                        // tstype1 is TypeReference
                        assertCastType<TupleTypeReference>(tstype1);
                        if (tstype1.objectFlags & ObjectFlags.Reference) {
                            Debug.assert(tstype1.resolvedTypeArguments);
                            tstype1.resolvedTypeArguments?.forEach((tstype, _indexInTuple) => {
                                const type = floughTypeModule.createRefTypesType(tstype);
                                const symbol: CallArgumentSymbol = undefined; // = createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,{ indexInTuple },type);
                                const isconst = true;
                                if (symbol) {
                                    ({ sc: sctmp } = andSymbolTypeIntoSymtabConstraint({ symbol, isconst, type, sc: sctmp, mrNarrow, getDeclaredType: getEffectiveDeclaredTypeFromSymbol }));
                                }
                                // sctmp.constraintItem = andSymbolTypeIntoConstraint({ symbol, type, constraintItem:sctmp.constraintItem, getDeclaredType, mrNarrow });
                                resolvedCallArguments.push({ tstype, type, symbol, isconst });
                            });
                            const tupleSymbol = symbolOuter ?? undefined; // createTransientCallArgumentSymbol(cargidx, resolvedCallArguments.length,/**/ undefined, rttr.type);
                            if (tupleSymbol) {
                                ({ sc: sctmp } = andSymbolTypeIntoSymtabConstraint({ symbol: tupleSymbol, isconst: true, type: rttr.type, sc: sctmp, mrNarrow, getDeclaredType: getEffectiveDeclaredTypeFromSymbol }));
                            }
                            // sctmp.constraintItem = andSymbolTypeIntoConstraint({ symbol:tupleSymbol, type:rttr.type, constraintItem:sctmp.constraintItem, getDeclaredType, mrNarrow });
                        }
                        else {
                            Debug.fail("unexpected");
                        }
                    }
                    else {
                        // should be array type, although that fact isn't used here
                        const type = rttr.type;
                        const tstype = floughTypeModule.getTsTypeFromFloughType(type);
                        const symbol = symbolOuter;
                        const isconst = isconstOuter;
                        // if (!symbol) {
                        //     isconst = true;
                        //     symbol = createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,/**/ undefined, type);
                        // }
                        // else Debug.assert(isconst!==undefined);
                        if (symbol) {
                            ({ sc: sctmp } = andSymbolTypeIntoSymtabConstraint({ symbol, isconst, type, sc: sctmp, mrNarrow, getDeclaredType: getEffectiveDeclaredTypeFromSymbol }));
                            resolvedCallArguments.push({ type, tstype, hasSpread: true, symbol, isconst: isconst! });
                        }
                        else resolvedCallArguments.push({ type, tstype, hasSpread: true });
                    }
                }
            }
            else {
                const mntr = flough({
                    sci: sctmp,
                    expr: carg,
                    crit: {
                        kind: FloughCritKind.none,
                    },
                    qdotfallout: undefined,
                    floughStatus: floughStatus,
                });
                const unmerged = mntr.unmerged;
                let symbol: Symbol | undefined;
                let isconst: boolean | undefined;
                if (unmerged.length === 1 || (unmerged.length && unmerged.slice(1).every(rttr => rttr.symbol === unmerged[0].symbol))) {
                    ({ symbol, isconst } = unmerged[0]);
                }
                const rttr: RefTypesTableReturn = applyCritNoneUnion(mntr, floughStatus.groupNodeToTypeMap);
                sctmp = rttr.sci;
                const type = rttr.type;
                const tstype = floughTypeModule.getTsTypeFromFloughType(type);
                if (!symbol) {
                    isconst = true;
                    symbol = undefined; // createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,/**/ undefined, type);
                }
                else Debug.assert(isconst !== undefined);
                if (symbol) {
                    ({ sc: sctmp } = andSymbolTypeIntoSymtabConstraint({ symbol, isconst, type, sc: sctmp, mrNarrow, getDeclaredType: getEffectiveDeclaredTypeFromSymbol }));
                }
                resolvedCallArguments.push({ type, tstype, symbol, isconst });
            }
        });
        if (IDebug.isActive(loggerLevel)) {
            const hdr0 = "floughByCallExpressionProcessCallArguments ";
            IDebug.ilog(()=>hdr0 + `resolvedCallArguments.length: ${resolvedCallArguments.length}`, loggerLevel);
            resolvedCallArguments.forEach((ca, idx) => {
                let str = hdr0 + `arg[${idx}] tstype: ${typeToString(ca.tstype)}, symbol${IDebug.dbgs.symbolToString(ca.symbol)}, isconst:${ca.isconst}`;
                if (ca.hasSpread) str += "hasSpread:true, ";
                IDebug.ilog(()=>str, loggerLevel);
            });
            IDebug.ilogGroupEnd(()=>"floughByCallExpressionProcessCallArguments", loggerLevel);
        }
        return { sc: sctmp, resolvedCallArguments };
    }

    function createfloughReturn(unmerged: RefTypesTableReturn[], nodeForMap: Node): FloughReturn {
        return {
            unmerged,
            nodeForMap,
        };
    }

    function createRefTypesTableReturn(type: RefTypesType, sci: RefTypesSymtabConstraintItem, symbol?: Symbol, isconst?: boolean, isAssign?: boolean): RefTypesTableReturn {
        if (!symbol) {
            return {
                type,
                sci,
            };
        }
        else {
            return {
                type,
                sci,
                symbol,
                isconst,
                isAssign,
            };
        }
    }

    function getQuickIdentifierOrIsReplayableItem(expr: Expression, floughStatus: Readonly<FloughStatus>): { symbol: Symbol; type?: FloughType | undefined; isReplayable?: boolean | undefined; } {
        if (expr.kind !== SyntaxKind.Identifier) Debug.fail("unexpected");
        Debug.assert(isIdentifier(expr));

        const symbol = getResolvedSymbol(expr, /*noDiagnostics*/ true); // getSymbolOfNode()?
        if (checker.isUnknownSymbol(symbol)) {
            return { symbol };
        }
        let type: FloughType | undefined;
        let isReplayable: boolean | undefined;
        if (symbol.flags & SymbolFlags.RegularEnum) {
            type = floughTypeModule.createRefTypesType(floughGetTsTypeOfSymbol(symbol));
        }
        // There is a unique symbol for the type undefined - that gets converted directly to the undefined type here.
        else if (checker.isUndefinedSymbol(symbol)) {
            type = floughTypeModule.createRefTypesType(undefinedType);
        }
        else if (symbol.flags & SymbolFlags.Function) {
            type = floughTypeModule.createRefTypesType(floughGetTsTypeOfSymbol(symbol));
        }
        else {
            isReplayable = floughStatus.replayables.has(symbol);
        }
        return { symbol, type, isReplayable };
    }

    /**
     * @param param0
     * @returns
     */
    function flough({ sci, expr: expr, floughStatus: floughStatus, qdotfallout, crit, accessDepth, refAccessArgs }: FloughArgs): FloughReturn {
        const loggerLevel = 2;
        if (IDebug.isActive(loggerLevel)) {
            IDebug.ilogGroup(()=>
                `flough[in] expr:${IDebug.dbgs.nodeToString(expr)}},`
                    + `crit:{kind:${crit.kind},alsoFailing:${crit.alsoFailing},negate:${crit.negate}, ${(crit as any).target ? IDebug.dbgs.typeToString((crit as any).target as Type) : ""}},`
                    + `floughStatus:{inCondition:${floughStatus.inCondition}, currentReplayable:${floughStatus.currentReplayableItem ? `{symbol:${IDebug.dbgs.symbolToString(floughStatus.currentReplayableItem.symbol)}}` : undefined}}, `
                    + `qdotfalloutIn: ${!qdotfallout ? "<undef>" : `length: ${qdotfallout.length}`}, `
                    + `accessDepth:${accessDepth}`, loggerLevel);
            IDebug.ilog(()=>`flough[in] refTypesSymtab:`, loggerLevel);
            if (sci.symtab) dbgRefTypesSymtabToStrings(sci.symtab).forEach(str => IDebug.ilog(()=>`  ${str}`, loggerLevel));
            IDebug.ilog(()=>`flough[in] constraintItemIn:`, loggerLevel);
            dbgConstraintItem(sci.constraintItem).forEach(str => IDebug.ilog(()=>`  ${str}`, loggerLevel));
        }
        const floughReturn: FloughReturn = (() => {
            if (!sci.symtab) {
                Debug.assert(isRefTypesSymtabConstraintItemNever(sci));
                return {
                    unmerged: [{
                        type: floughTypeModule.createRefTypesType(), // never
                        sci: createRefTypesSymtabConstraintItemNever(),
                    }],
                    nodeForMap: expr,
                };
            }
            assertCastType<RefTypesSymtabConstraintItemNotNever>(sci);
            if (expr.kind === SyntaxKind.Identifier) {
                return floughIdentifier();
            }
            if (expr.kind === SyntaxKind.ParenthesizedExpression) {
                const mntr = flough({
                    expr: (expr as ParenthesizedExpression).expression,
                    qdotfallout,
                    sci,
                    floughStatus: floughStatus,
                    crit,
                });
                applyCritNoneUnion(mntr, floughStatus.groupNodeToTypeMap);
                return mntr;
            }
            return floughAux();
        })();

        if (IDebug.isActive(loggerLevel)) {
            floughReturn.unmerged.forEach((rttr, i) => {
                dbgRefTypesTableToStrings(rttr).forEach(s => IDebug.ilog(()=>`  flough[dbg]: unmerged[${i}]: ${s}`, loggerLevel));
            });
            IDebug.ilog(()=>`flough[out] floughReturn.typeof: ${floughReturn.typeof ? "present" : "<undef>"}`, loggerLevel);
            IDebug.ilog(()=>`flough[out] groupNodeToTypeMap.size: ${floughStatus.groupNodeToTypeMap.size}`, loggerLevel);
            floughStatus.groupNodeToTypeMap.forEach((t, n) => {
                for (let ntmp = n; ntmp.kind !== SyntaxKind.SourceFile; ntmp = ntmp.parent) {
                    if (ntmp === expr) {
                        IDebug.ilog(()=>`flough[out] groupNodeToTypeMap: node: ${IDebug.dbgs.nodeToString(n)}, type: ${typeToString(t)}`, loggerLevel);
                        break;
                    }
                }
            });
            IDebug.ilogGroupEnd(()=>`flough: ${IDebug.dbgs.nodeToString(expr)}`, loggerLevel);
        }
        return floughReturn;

        function floughIdentifier(): FloughReturn {
            IDebug.ilogGroup(()=>`floughIdentifier[in] ${IDebug.dbgs.nodeToString(expr)}`, loggerLevel);
            function floughIdentifierAux(): FloughReturn {
                Debug.assert(isIdentifier(expr));

                const { symbol, type: quickType, isReplayable: isReplayable } = getQuickIdentifierOrIsReplayableItem(expr, floughStatus); // : { symbol: Symbol, type?: FloughType | undefined, isReplayableItem?: boolean | undefined } {
                if (quickType) {
                    return createfloughReturn([createRefTypesTableReturn(
                        quickType,
                        sci,
                    )], expr);
                }
                let symbolFlowInfo = _mrState.symbolFlowInfoMap.get(symbol);
                if (!symbolFlowInfo) {
                    const effectiveDeclaredTsType = floughGetTsTypeOfSymbol(symbol);
                    const isconst = checker.isConstantReference(expr);
                    symbolFlowInfo = {
                        passCount: 0,
                        effectiveDeclaredTsType,
                        isconst,
                    };
                    _mrState.symbolFlowInfoMap.set(symbol, symbolFlowInfo);
                }

                if (isReplayable) {
                    IDebug.ilog(()=>`floughIdentifier[dbg]: start replay for ${IDebug.dbgs.symbolToString(symbol)}, ${IDebug.dbgs.nodeToString(expr)}`, loggerLevel);
                    const replayable = floughStatus.replayables.get(symbol)!;
                    /**
                     * Replay with new constraints
                     * The existing floughStatus.groupNodeToTypeMap should not be overwritten during replay.
                     * Therefore we substitute in a dummy map.
                     * NOTE: tests show this causes no harm, but don't have a test case that shows it is necessary.
                     */
                    const replayableInType = sci.symtab?.get(symbol);
                    const dummyNodeToTypeMap = new Map<Node, Type>();
                    const mntr = flough({
                        expr: replayable?.expr,
                        crit: { kind: FloughCritKind.none },
                        sci,
                        qdotfallout: undefined,
                        floughStatus: { ...floughStatus, inCondition: true, currentReplayableItem: replayable, groupNodeToTypeMap: dummyNodeToTypeMap },
                    });
                    IDebug.ilog(()=>`floughIdentifier[dbg]: end replay for ${IDebug.dbgs.symbolToString(symbol)}, ${IDebug.dbgs.nodeToString(expr)}`, loggerLevel);

                    /**
                     * When the replay rhs is an identifier, e.g. _caxnc-rp-001, we need to expand the type before so the lhs and rhs symbols
                     * can be correlated.
                     */
                    if (floughStatus.inCondition && replayable.expr.kind === SyntaxKind.Identifier && mntr.unmerged.length === 1) {
                        const unmerged: RefTypesTableReturn[] = [];
                        floughTypeModule.forEachRefTypesTypeType(mntr.unmerged[0].type, t =>
                            unmerged.push({
                                ...mntr.unmerged[0],
                                type: floughTypeModule.createRefTypesType(t),
                            }));
                        mntr.unmerged = unmerged;
                    }

                    {
                        const unmerged: RefTypesTableReturn[] = [];
                        mntr.unmerged.forEach((rttr, _rttridx) => {
                            /**
                             * In the case where the rhs of the replayable is an object (possible a union tree), the lhs type id might/will not match the rhs type id.
                             * The lhs type was established by the checker module after the rhs was processed, and it recorded in the current variable `symbolFlowInfo`.
                             * If rttr.type corresponds to a plain object, then we can simple replace the plain objects tsType with the symbolFlowInfo.tsType.
                             * However is rttr.type corresponds to a union tree, then we need to map each object type in the tree to the corresponding types in
                             * the symbolFlowInfo.tsType tree, which might get complicated, especially it some the object types in the symbolFlowInfo.tsType tree
                             * are not in the rttr.type tree because they became never in the narrow type, for example.
                             * We cannot just replace the entire rttr.type tree with the symbolFlowInfo.tsType tree because the rttr.type tree might have been narrowed.
                             * It would be good if we could (figuratively) map the Node values in literal object to the types they became in the symbolFlowInfo.tsType tree.
                             */
                            if (floughTypeModule.hasLogicalObject(rttr.type)) {
                                const rhsType = rttr.type;
                                const xxx = setEffectiveDeclaredTsTypeOfLogicalObjectOfType(rttr.type, symbolFlowInfo!);
                                rttr.type = floughTypeModule.unionWithFloughTypeMutate(xxx.logicalObjectRhsType, xxx.nobjRhsType);
                                if (IDebug.isActive(loggerLevel)) {
                                    IDebug.ilog(()=>`floughIdentifier[dbg]: mofified ${dbgRefTypesTypeToString(rhsType)} to ${dbgRefTypesTypeToString(rttr.type)} with ${IDebug.dbgs.typeToString(symbolFlowInfo!.effectiveDeclaredTsType)}`, loggerLevel);
                                    floughTypeModule.dbgFloughTypeToStrings(rhsType).forEach(s => IDebug.ilog(()=>`floughIdentifier[dbg]: orig: ${s}`, loggerLevel));
                                    IDebug.ilog(()=>`floughIdentifier[dbg]: effectiveDeclaredTsType: ${IDebug.dbgs.typeToString(symbolFlowInfo!.effectiveDeclaredTsType)}`, loggerLevel);
                                    // floughTypeModule.dbgFloughTypeToStrings(symbolFlowInfo!.effectiveDeclaredType).forEach(s=>IDebug.ilog(()=>`floughIdentifier[dbg]: effectiveDeclaredTsType: ${s}`));
                                    floughTypeModule.dbgFloughTypeToStrings(rttr.type).forEach(s => IDebug.ilog(()=>`floughIdentifier[dbg]: final: ${s}`, loggerLevel));
                                }
                            }
                            // const rhsType = rttr.type;
                            // //let typeWithWidenedObject: FloughType | undefined;
                            // const { logicalObject:logicalObjectRhs, remaining:_remainingRhs } = floughTypeModule.splitLogicalObject(rttr.type);
                            // if (logicalObjectRhs){
                            //     const effectDeclaredObjectTypes: Type[] = [];
                            //     checker.forEachType(symbolFlowInfo!.effectiveDeclaredTsType,t=>{
                            //         if (t.flags & TypeFlags.Object && !(t.flags & TypeFlags.AnyOrUnknown) && !(t.flags & TypeFlags.EnumLiteral)){
                            //             effectDeclaredObjectTypes.push(t);
                            //         }
                            //     });
                            //     floughLogicalObjectModule.setEffectiveDeclaredTsType(logicalObjectRhs, checker.getUnionType(effectDeclaredObjectTypes));
                            //     // if (IDebug.isActive(loggerLevel)){
                            //     //     floughLogicalObjectModule.dbgLogicalObjectToStrings(logicalObjectRhs).forEach(s=>IDebug.ilog(()=>`floughIdentifierAux[dbg]: logicalObjectRhs: ${s}`));
                            //     // }
                            // }
                            let narrowerTypeOut: FloughType | undefined;
                            if (replayableInType) {
                                // if (disableLogicalObjectIntersections){
                                narrowerTypeOut = floughTypeModule.intersectionWithFloughTypeSpecial(replayableInType, rttr.type);
                                // }
                                // else narrowerTypeOut = floughTypeModule.intersectionOfRefTypesType(rttr.type, replayableInType);
                            }
                            if (narrowerTypeOut && floughTypeModule.isNeverType(narrowerTypeOut)) return;
                            rttr = applyCritNoneToOne({ ...rttr, type: narrowerTypeOut ?? rttr.type }, expr, /**/ undefined); // don't write here because the original symbol is from replay.
                            const type = narrowerTypeOut ?? rttr.type;
                            unmerged.push({
                                ...rttr,
                                symbol,
                                isconst: replayable.isconst,
                                type,
                            });
                        });
                        const floughReturn: FloughReturn = {
                            unmerged,
                            nodeForMap: expr,
                        };
                        if (mntr.typeof) floughReturn.typeof = mntr.typeof;
                        return floughReturn;
                    }
                } // endof if (floughStatus.replayables.has(symbol))

                let type: RefTypesType | undefined;
                const isconst = symbolFlowInfo.isconst;
                type = sci.symtab?.get(symbol) ?? getEffectiveDeclaredType(symbolFlowInfo);
                Debug.assert(type);
                if (floughStatus.currentReplayableItem) {
                    // If the value of the symbol has definitely NOT changed since the defintion of the replayable.
                    // then we can continue on below to find the value via constraints.  Otherwise, we must use the value of the symbol
                    // at the time of the definition of the replayable, as recorded in the replayables byNode map.
                    // Currently `isconst` is equivalent to "definitely NOT changed".
                    if (!isconst) {
                        const tstype = floughStatus.currentReplayableItem.nodeToTypeMap.get(expr)!;
                        Debug.assert(type);
                        type = floughTypeModule.createRefTypesType(tstype);
                        return {
                            unmerged: [{
                                // symbol and isconst are not passed back because in replay non-const is treated as a hardwired type
                                type,
                                sci,
                            }],
                            nodeForMap: expr,
                        };
                    }
                }
                return {
                    unmerged: [{
                        symbol,
                        isconst,
                        type,
                        sci,
                    }],
                    nodeForMap: expr,
                };
            } // end of floughIdentifierAux()
            const ret = floughIdentifierAux();

            if (IDebug.isActive(loggerLevel)) {
                ret.unmerged.forEach((rttr, i) => {
                    dbgRefTypesTableToStrings(rttr).forEach(s => IDebug.ilog(()=>`floughIdentifier[out]: unmerged[${i}]: ${s}`, loggerLevel));
                });
                IDebug.ilog(()=>`floughIdentifier[out] floughReturn.typeof: ${ret.typeof}`, loggerLevel);

                IDebug.ilog(()=>`floughIdentifier[out] groupNodeToTypeMap.size: ${floughStatus.groupNodeToTypeMap.size}`, loggerLevel);
                floughStatus.groupNodeToTypeMap.forEach((t, n) => {
                    for (let ntmp = n; ntmp.kind !== SyntaxKind.SourceFile; ntmp = ntmp.parent) {
                        if (ntmp === expr) {
                            IDebug.ilog(()=>`floughIdentifier[out] groupNodeToTypeMap: node: ${IDebug.dbgs.nodeToString(n)}, type: ${typeToString(t)}`, loggerLevel);
                            break;
                        }
                    }
                });
                IDebug.ilogGroupEnd(()=>`floughIdentifier[out] ${IDebug.dbgs.nodeToString(expr)}`, loggerLevel);
            }
            return ret;
        } // endof mrNarrowIdentifier()

        function floughAux(): FloughReturn {
            assertCastType<RefTypesSymtabConstraintItemNotNever>(sci);
            const qdotfallout1 = qdotfallout ?? ([] as RefTypesTableReturn[]);
            const innerret = floughInner(qdotfallout1);
            let finalArrRefTypesTableReturn = innerret.unmerged;
            if (IDebug.isActive(loggerLevel)) {
                IDebug.ilog(()=>`floughAux[dbg]: qdotfallout.length: ${qdotfallout1.length}`, loggerLevel);
                qdotfallout1.forEach((rttr, i) => {
                    dbgRefTypesTableToStrings(rttr).forEach(str => {
                        IDebug.ilog(()=>`floughAux[dbg]:  qdotfallout[${i}]: ${str}`, loggerLevel);
                    });
                });
            }
            if (!qdotfallout) {
                /**
                 * !qdotfallout so merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit
                 */
                if (IDebug.isActive(loggerLevel)) {
                    IDebug.ilog(()=>`floughAux[dbg]: ${IDebug.dbgs.nodeToString(expr)}: Merge the temporary qdotfallout into the array for RefTypesTableReturn (the buck stops here)`, loggerLevel);
                    qdotfallout1.forEach((rttr, i) => {
                        dbgRefTypesTableToStrings(rttr).forEach(str => {
                            IDebug.ilog(()=>`floughAux[dbg]:  qdotfallout[${i}]: ${str}`, loggerLevel);
                        });
                    });
                }
                finalArrRefTypesTableReturn = [...qdotfallout1, ...innerret.unmerged];
            }
            const floughReturn: FloughReturn = {
                unmerged: finalArrRefTypesTableReturn.filter(rttr => !isRefTypesSymtabConstraintItemNever(rttr.sci)),
                nodeForMap: expr,
            };
            if (innerret.typeof) floughReturn.typeof = innerret.typeof;
            return floughReturn;
        } // endof floughAux()

        function floughInner(qdotfalloutInner: RefTypesTableReturn[]): FloughInnerReturn {
            assertCastType<RefTypesSymtabConstraintItemNotNever>(sci);
            if (IDebug.isActive(loggerLevel)) {
                IDebug.ilogGroup(()=>`floughInner[in] expr:${IDebug.dbgs.nodeToString(expr)}, floughStatus:{inCondition:${floughStatus.inCondition}, currentReplayableItem:${floughStatus.currentReplayableItem ? `{symbol:${IDebug.dbgs.symbolToString(floughStatus.currentReplayableItem.symbol)}}` : undefined}`, loggerLevel);
                IDebug.ilog(()=>`floughInner[in] refTypesSymtab:`, loggerLevel);
                dbgRefTypesSymtabToStrings(sci.symtab).forEach(str => IDebug.ilog(()=>`floughInner[in] refTypesSymtab:  ${str}`, loggerLevel));
                IDebug.ilog(()=>`floughInner[in] constraintItemIn:`, loggerLevel);
                if (sci.constraintItem) dbgConstraintItem(sci.constraintItem).forEach(str => IDebug.ilog(()=>`floughInner[in] constraintItemIn:  ${str}`, loggerLevel));
            }
            const innerret = floughInnerAux(qdotfalloutInner);
            if (IDebug.isActive(loggerLevel)) {
                innerret.unmerged.forEach((rttr, i) => {
                    dbgRefTypesTableToStrings(rttr).forEach(str => {
                        IDebug.ilog(()=>`floughInner[out]:  innerret.unmerged[${i}]: ${str}`, loggerLevel);
                    });
                });
                floughStatus.groupNodeToTypeMap.forEach((type, node) => {
                    for (let ntmp = node; ntmp.kind !== SyntaxKind.SourceFile; ntmp = ntmp.parent) {
                        if (ntmp === expr) {
                            IDebug.ilog(()=>`floughInner[out]:  innerret.byNode: { node: ${IDebug.dbgs.nodeToString(node)}, type: ${typeToString(type)}`, loggerLevel);
                            break;
                        }
                    }
                });
                IDebug.ilog(()=>`floughInner[out] expr:${IDebug.dbgs.nodeToString(expr)}, floughStatus:{inCondition:${floughStatus.inCondition}, currentReplayableItem:${floughStatus.currentReplayableItem ? `{symbol:${IDebug.dbgs.symbolToString(floughStatus.currentReplayableItem.symbol)}}` : undefined}`, loggerLevel);
                IDebug.ilogGroupEnd(()=>`floughInner[out] innret.typeof: ${innerret.typeof ? "present" : "<undef>"}`, loggerLevel);
            }
            return innerret;

            /**
             * If the expression is an enum, return the plain literal type of the enum, else return undefined.
             * Side effects: if is an enum, calls orTsTypesIntoNodeToTypeMap([type0],expr.expression,floughStatus.groupNodeToTypeMap)
             * @param expr floughStatus.groupNodeToTypeMap
             * @returns
             */
            function floughInnerAttemptPropertyAccessExpressionEnum(expr: Readonly<PropertyAccessExpression>): undefined | FloughType {
                assertCastType<PropertyAccessExpression>(expr);

                function orTsTypesIntoNodeToTypeMap(tstypes: Readonly<Type[]>, node: Node, nodeToTypeMap: NodeToTypeMap) {
                    const got = nodeToTypeMap.get(node);
                    if (!got) nodeToTypeMap.set(node, checker.getUnionType(tstypes as Type[], UnionReduction.Literal));
                    else nodeToTypeMap.set(node, checker.getUnionType([got, ...tstypes as Type[]], UnionReduction.Literal));
                    if (IDebug.isActive(loggerLevel)) {
                        const dbgTstype = checker.getUnionType(tstypes as Type[], UnionReduction.Literal);
                        IDebug.ilog(()=>
                            `orTsTypesIntoNodeToTypeMap(types:${IDebug.dbgs.typeToString(dbgTstype)},node:${IDebug.dbgs.nodeToString(node)})::`
                                + `${got ? IDebug.dbgs.typeToString(got) : "*"}->${IDebug.dbgs.typeToString(nodeToTypeMap.get(node))}`, loggerLevel
                        );
                    }
                }

                if (expr.expression.kind === SyntaxKind.Identifier && expr.name.kind === SyntaxKind.Identifier) {
                    const sym0 = checker.getResolvedSymbol(expr.expression as Identifier);
                    if (sym0.flags & (SymbolFlags.RegularEnum | SymbolFlags.ConstEnum)) {
                        const type0 = checker.getTypeOfSymbol(sym0);
                        const sym1 = checker.getPropertyOfType(type0, expr.name.escapedText as string);
                        // const type1enum = checker.getTypeOfSymbol(sym1);
                        const type1lit = enumMemberSymbolToLiteralTsType(sym1!);
                        orTsTypesIntoNodeToTypeMap([type0], expr.expression, floughStatus.groupNodeToTypeMap);
                        if (IDebug.isActive(loggerLevel)) {
                            const sym0f = Debug.formatSymbolFlags(sym0.flags);
                            const sym1f = Debug.formatSymbolFlags(sym1!.flags);
                            IDebug.ilog(()=>`floughInnerAttemptPropertyAccessExpressionEnum: Enum ${sym0.escapedName}.flags:${sym0f}, ${sym1!.escapedName}.flags:${sym1f}`, loggerLevel);
                        }
                        return floughTypeModule.createFromTsType(type1lit);
                    }
                }
                return undefined;
            }

            /**
             * @param param0
             * @returns
             */
            function floughInnerAux(qdotfalloutInner: RefTypesTableReturn[]): FloughInnerReturn {
                if (extraAsserts) {
                    Debug.assert(!isNeverConstraint(sci.constraintItem));
                    Debug.assert(sci.symtab);
                }
                assertCastType<RefTypesSymtabConstraintItemNotNever>(sci);
                switch (expr.kind) {
                    /**
                     * Identifier
                     */
                    case SyntaxKind.Identifier:
                        Debug.fail("unexpected");
                        break;
                    case SyntaxKind.NonNullExpression:
                        return floughInnerNonNullExpression();
                    case SyntaxKind.ParenthesizedExpression:
                        Debug.fail("unexpected"); // now handled on entry to flough
                        break;
                    case SyntaxKind.ConditionalExpression:
                        return floughInnerConditionalExpression();
                    case SyntaxKind.PropertyAccessExpression: {
                        assertCastType<PropertyAccessExpression>(expr);
                        const type = floughInnerAttemptPropertyAccessExpressionEnum(expr);
                        if (type) {
                            return {
                                unmerged: [{
                                    type,
                                    sci,
                                }],
                            };
                        }

                    }
                    // fall through
                    case SyntaxKind.ElementAccessExpression:
                        if (crit.kind === FloughCritKind.none) {
                            return floughAccessExpressionCritNone();
                        }
                        return floughAccessExpressionCritNone();
                        // return floughAccessExpression();
                    case SyntaxKind.CallExpression: {
                        return floughByCallExpressionV3();
                    }
                    case SyntaxKind.PrefixUnaryExpression:
                        return floughInnerPrefixUnaryExpression();
                    case SyntaxKind.VariableDeclaration:
                        return floughInnerVariableDeclaration();
                    case SyntaxKind.BinaryExpression:
                        return floughByBinaryExpression();
                    case SyntaxKind.TypeOfExpression:
                        return floughByTypeofExpression();
                    case SyntaxKind.TrueKeyword:
                    case SyntaxKind.FalseKeyword:
                    case SyntaxKind.NumericLiteral:
                    case SyntaxKind.StringLiteral:
                        return floughInnerLiteralNumberStringBigintBooleanExpression();
                    case SyntaxKind.ArrayLiteralExpression:
                        return floughInnerArrayLiteralExpression();
                    case SyntaxKind.AsExpression:
                        return floughInnerAsExpression();
                    case SyntaxKind.SpreadElement:
                        {
                            Debug.fail("floughInner[dbg] context of caller is important, getTypeOfExpressionShallowRecursion ignore type.target.readonly");
                        }
                        break;

                    case SyntaxKind.PropertyAssignment:
                        return floughPropertyAssignment();
                    case SyntaxKind.ObjectLiteralExpression:
                        return floughObjectLiteralExpression();
                    default:
                        Debug.fail("unexpected" + ` ${Debug.formatSyntaxKind(expr.kind)}}`);
                } // switch

                function floughByBinaryExpression(): FloughInnerReturn {
                    assertCastType<BinaryExpression>(expr);
                    const { operatorToken } = expr;
                    switch (operatorToken.kind) {
                        case SyntaxKind.EqualsToken:
                            return floughByBinaryExpresionAssign();
                        case SyntaxKind.BarBarEqualsToken:
                        case SyntaxKind.AmpersandAmpersandEqualsToken:
                        case SyntaxKind.QuestionQuestionEqualsToken:
                            Debug.fail("not yet implemented");
                            break;
                        case SyntaxKind.ExclamationEqualsToken:
                        case SyntaxKind.ExclamationEqualsEqualsToken:
                        case SyntaxKind.EqualsEqualsToken:
                        case SyntaxKind.EqualsEqualsEqualsToken:
                            {
                                return floughByBinaryExpressionEqualsCompareV3();
                            }
                            break;
                        case SyntaxKind.InstanceOfKeyword:
                            Debug.fail("not yet implemented");
                            break;
                        case SyntaxKind.InKeyword:
                            return floughByBinaryExpressionInKeyword();
                            // Debug.fail("not yet implemented");
                            break;
                        case SyntaxKind.CommaToken:
                            Debug.fail("not yet implemented");
                            break;
                        case SyntaxKind.BarBarToken:
                        case SyntaxKind.AmpersandAmpersandToken:
                            return floughByBinaryExpressionAmpersandAmpersandToken();
                        default:
                            Debug.fail("unexpected BinaryExpression operatorToken.kind: " + Debug.formatSyntaxKind(operatorToken.kind));
                    }
                } // floughByBinaryExpression

                function floughInnerNonNullExpression(): FloughInnerReturn {
                    Debug.assert(isNonNullExpression(expr));
                    /**
                     * Typescript documentation on "Non-null assertion operator":
                     * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
                     * > A new ! post-fix expression operator may be used to assert that its operand
                     * > is non-null and non-undefined in contexts where the type checker is unable
                     * > to conclude that fact. Specifically, the operation x! produces a value of
                     * > the type of x with null and undefined excluded. Similar to type assertions
                     * > of the forms <T>x and x as T, the ! non-null assertion operator is simply
                     * > removed in the emitted JavaScript code.
                     * However, the operator precedence was not specified in the documentation.
                     * Should it be the same as the ? operator (defined by JS runtime), binding only to the last element?
                     * In that case `qdotfallout` are not filtered here.
                     *
                     * It could be defined to apply to all preceding elements in a chain.
                     * That would require defining the limits of the chain -
                     * Does that cross getters, elements access, parentheses, call expressions, etc?
                     * In that case `qdotfallout` would filtered here, and the chain limits are where `qdotfallout` are terminated.
                     * It would be easy enough to filter `qdotfallout` here if required for, e.g., back compat.
                     */
                    // const innerret = floughInner({ sci, expr: expr.expression,
                    //     qdotfallout, floughStatus });
                    const innerret = flough({ sci, expr: expr.expression, crit: { kind: FloughCritKind.notnullundef }, qdotfallout: qdotfalloutInner, floughStatus: floughStatus });

                    /**
                     * Apply notnullundef criteria without squashing the result into passing/failing
                     * Note that innerret.byNode is not altered, under the assumption that byNode does not yet include the types to be discriminated.
                     */
                    const applyNotNullUndefCritToRefTypesTableReturn = (arrRttr: Readonly<RefTypesTableReturn[]>): Readonly<RefTypesTableReturn[]> => {
                        const arrOut: RefTypesTableReturn[] = [];
                        arrRttr.forEach(rttr => {
                            const type = floughTypeModule.createRefTypesType();
                            applyCritToRefTypesType(rttr.type, { kind: FloughCritKind.notnullundef }, (tstype, bpass, _bfail) => {
                                if (bpass) floughTypeModule.addTypeToRefTypesType({ source: tstype, target: type });
                            });
                            if (floughTypeModule.isNeverType(type)) {
                                arrOut.push({
                                    ...rttr,
                                    type,
                                });
                            }
                        });
                        return arrOut;
                    };
                    return {
                        unmerged: applyNotNullUndefCritToRefTypesTableReturn(innerret.unmerged),
                    };
                } // floughInnerNonNullExpression

                function floughInnerConditionalExpression(): FloughInnerReturn {
                    if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`floughInner[dbg] case SyntaxKind.ConditionalExpression`, loggerLevel);
                    const { condition, whenTrue, whenFalse } = expr as ConditionalExpression;
                    if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`floughInner[dbg] case SyntaxKind.ConditionalExpression ; condition:${IDebug.dbgs.nodeToString(condition)}`, loggerLevel);
                    const rcond = applyCrit(
                        flough({
                            sci,
                            expr: condition,
                            crit: { kind: FloughCritKind.truthy, alsoFailing: true },
                            floughStatus: { ...floughStatus, inCondition: true },
                        }),
                        { kind: FloughCritKind.truthy, alsoFailing: true },
                        floughStatus.groupNodeToTypeMap,
                    );

                    if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`floughInner[dbg] case SyntaxKind.ConditionalExpression ; whenTrue`, loggerLevel);
                    const trueRes = flough({
                        sci: rcond.passing.sci,
                        expr: whenTrue,
                        crit: { kind: FloughCritKind.none },
                        floughStatus: floughStatus, // : { ...floughStatus, inCondition: true }
                    });
                    const retTrue = applyCritNoneUnion(trueRes, floughStatus.groupNodeToTypeMap);

                    if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`floughInner[dbg] case SyntaxKind.ConditionalExpression ; whenFalse`, loggerLevel);
                    const retFalse = applyCritNoneUnion(
                        flough({
                            sci: rcond.failing!.sci,
                            expr: whenFalse,
                            crit: { kind: FloughCritKind.none },
                            floughStatus: floughStatus, // : { ...floughStatus, inCondition: true }
                        }),
                        floughStatus.groupNodeToTypeMap,
                    );

                    const arrRefTypesTableReturn: RefTypesTableReturn[] = [];
                    arrRefTypesTableReturn.push(retTrue);
                    arrRefTypesTableReturn.push(retFalse);
                    const retval: FloughInnerReturn = {
                        unmerged: arrRefTypesTableReturn,
                    };
                    return retval;
                } // floughInnerConditionalExpression

                function floughInnerPrefixUnaryExpression(): FloughInnerReturn {
                    if ((expr as PrefixUnaryExpression).operator === SyntaxKind.ExclamationToken) {
                        const ret = applyCrit(
                            flough({
                                sci,
                                expr: (expr as PrefixUnaryExpression).operand,
                                crit: { negate: true, kind: FloughCritKind.truthy, alsoFailing: true },
                                qdotfallout: undefined,
                                floughStatus: { ...floughStatus, inCondition: true },
                            }),
                            { negate: true, kind: FloughCritKind.truthy, alsoFailing: true },
                            floughStatus.groupNodeToTypeMap,
                        );
                        /**
                         * The crit was already set with negate: true to reverse the passing and failing.
                         * Below, the symbols are set to undefined, and the types converted to booleans.
                         */
                        // const nodeTypes: Type[] = [];
                        if (!floughTypeModule.isNeverType(ret.passing.type)) {
                            const ttype = checker.getTrueType();
                            // nodeTypes.push(ttype);
                            ret.passing.type = floughTypeModule.createRefTypesType(ttype);
                        }
                        if (!floughTypeModule.isNeverType(ret.failing!.type)) {
                            const ftype = checker.getFalseType();
                            // nodeTypes.push(ftype);
                            ret.failing!.type = floughTypeModule.createRefTypesType(ftype);
                        }
                        return {
                            unmerged: [ret.passing, ret.failing!],
                        };
                    }
                    Debug.fail("unexpected");
                } // floughInnerPrefixUnaryExpression

                function floughInnerVariableDeclaration(): FloughInnerReturn {
                    assertCastType<RefTypesSymtabConstraintItemNotNever>(sci);
                    Debug.assert(isVariableDeclaration(expr));
                    Debug.assert(expr.initializer);
                    const initializer = expr.initializer;

                    const rhs = applyCritNoneUnion(
                        flough({
                            sci,
                            expr: initializer,
                            crit: { kind: FloughCritKind.none },
                            qdotfallout: undefined,
                            floughStatus: { ...floughStatus, inCondition: false },
                        }),
                        floughStatus.groupNodeToTypeMap,
                    );

                    // NOTE: in case of floughStatus.withinLoop, no action should be required here because the effect is already incorporated on the rhs
                    if (isIdentifier(expr.name)) {
                        // let widenedTsTypeInferredFromInitializer: Type | undefined;
                        const symbol = getSymbolOfNode(expr); // not condExpr.name
                        Debug.assert(symbol);
                        // TODO: if this is a >0 loop invocation, _mrState.symbolFlowInfoMap.delete(symbol) before starting so the else clause can be removed.
                        // That info is in sci.symtab but it is hidden.
                        let symbolFlowInfo: SymbolFlowInfo | undefined = _mrState.symbolFlowInfoMap.get(symbol);
                        if (!symbolFlowInfo) {
                            let effectiveDeclaredType: RefTypesType | undefined = rhs.type;
                            let effectiveDeclaredTsType: Type | undefined; // = getTypeOfSymbol(symbol);
                            let typeNodeTsType: Type | undefined;
                            if (symbol.valueDeclaration === expr) {
                                // primary
                                if (expr.type) {
                                    typeNodeTsType = checker.getTypeFromTypeNode(expr.type);
                                    if (extraAsserts) { // testing
                                        // This assertion shows that calling checker.getTypeFromTypeNode is equivalent to calling the higher level function checker.getTypeOfSymbol.
                                        const tstypeTest = checker.getTypeOfSymbol(symbol);
                                        if (!checker.isTypeRelatedTo(tstypeTest, typeNodeTsType, checker.getRelations().identityRelation)) {
                                            Debug.fail(`floughInnerVariableDeclaration[dbg] tstypeTest=${checker.typeToString(tstypeTest)} typeNodeTsType=${checker.typeToString(typeNodeTsType)}`);
                                        }
                                    }
                                    effectiveDeclaredTsType = typeNodeTsType;
                                    effectiveDeclaredType = undefined;
                                    if (IDebug.isActive(loggerLevel)) {
                                        IDebug.ilog(()=>`floughInnerVariableDeclaration[dbg] effectiveDeclaredTsType= from expr.type-> ${IDebug.dbgs.typeToString(effectiveDeclaredTsType)}`, loggerLevel);
                                    }
                                }
                                else {
                                    const tsType = floughTypeModule.getTsTypeFromFloughType(rhs.type);
                                    // TODO: checker.getFreshTypeOfLiteralType will fail when tsType is not a literal type.
                                    effectiveDeclaredTsType = checker.widenTypeInferredFromInitializer(expr, checker.getFreshTypeOfLiteralType(tsType as LiteralType));
                                    // widenedTsTypeInferredFromInitializer = effectiveDeclaredTsType;
                                    if (IDebug.isActive(loggerLevel)) {
                                        IDebug.ilog(()=>`floughInnerVariableDeclaration[dbg] effectiveDeclaredTsType= from rhs ${IDebug.dbgs.typeToString(tsType)} widened-> ${IDebug.dbgs.typeToString(effectiveDeclaredTsType)}`, loggerLevel);
                                    }
                                    effectiveDeclaredType = undefined;
                                }
                            }
                            else {
                                Debug.fail("unexpected");
                            }
                            symbolFlowInfo = {
                                passCount: 0,
                                isconst: isConstVariable(symbol),
                                effectiveDeclaredTsType, // : floughTypeModule.createRefTypesType(actualDeclaredTsType),
                                initializerType: rhs.type,
                            };
                            if (effectiveDeclaredType) symbolFlowInfo.effectiveDeclaredType = effectiveDeclaredType;
                            if (typeNodeTsType) symbolFlowInfo.typeNodeTsType = typeNodeTsType; // TODO KILL
                            _mrState.symbolFlowInfoMap.set(symbol, symbolFlowInfo);
                        }
                        else {
                            // TODO: get rid of this else clause!
                            // if called more than once, must be in a loop, or the same group is being pushed on the heap more than once (another TODO issue)
                            symbolFlowInfo.passCount++;
                            symbolFlowInfo.initializerType = floughTypeModule.unionOfRefTypesType([symbolFlowInfo.initializerType!, rhs.type]);
                            if (extraAsserts && expr.type) {
                                Debug.assert(symbolFlowInfo.typeNodeTsType);
                                const typeNodeTsType = checker.getTypeFromTypeNode(expr.type);
                                Debug.assert(checker.isTypeRelatedTo(typeNodeTsType, symbolFlowInfo.typeNodeTsType, checker.getRelations().identityRelation));
                            }
                            if (!expr.type) {
                                const tsType = floughTypeModule.getTsTypeFromFloughType(symbolFlowInfo.initializerType);
                                // TODO: checker.getFreshTypeOfLiteralType will/might fail when tsType is not a literal type.
                                symbolFlowInfo.effectiveDeclaredTsType = checker.widenTypeInferredFromInitializer(expr, checker.getFreshTypeOfLiteralType(tsType as LiteralType));
                                // widenedTsTypeInferredFromInitializer = symbolFlowInfo.effectiveDeclaredTsType;
                                delete symbolFlowInfo.effectiveDeclaredType; // will be created on demand if necessary
                            }
                            // In _caxnc-rp-003 this happens because a statement get thrown into the heap on multiple occasions. See ISSUE.md
                            // Debug.fail("unexpected: VariableDeclaration symbolFlowInfo already exists");
                        }
                        if (extraAsserts && compilerOptions.enableTSDevExpectString) {
                            debugDevExpectEffectiveDeclaredType(expr.parent, symbolFlowInfo);
                        }
                        const isconstVar = symbolFlowInfo.isconst; // isConstVariable(symbol);
                        if (sci.symtab.has(symbol)) {
                            Debug.assert("unexpected"); // because symbols are removed as they go out of scope in processLoop.
                        }
                        const rhsWidenedType = widenDeclarationOrAssignmentRhs(rhs.type, symbolFlowInfo);
                        if (isconstVar) {
                            const replayableItem: ReplayableItem = {
                                expr: expr.initializer,
                                symbol,
                                isconst: isconstVar,
                                nodeToTypeMap: new Map<Node, Type>(floughStatus.groupNodeToTypeMap),
                            };
                            symbolFlowInfo.replayableItem = replayableItem;
                            floughStatus.replayables.set(symbol, replayableItem);
                            if (IDebug.isActive(loggerLevel)) {
                                const shdr = `floughInner[dbg] case SyntaxKind.VariableDeclaration +replayable `;
                                IDebug.ilog(()=>shdr, loggerLevel);
                                const as: string[] = [];
                                as.push(`symbol: ${IDebug.dbgs.symbolToString(replayableItem.symbol)}, isconst: ${replayableItem.isconst}`);
                                as.push(`expr: ${IDebug.dbgs.nodeToString(replayableItem.expr)}`);
                                as.forEach(s => IDebug.ilog(()=>`${shdr}: ${s}`, loggerLevel));
                            }
                            return {
                                unmerged: [{
                                    type: rhsWidenedType,
                                    sci: rhs.sci,
                                }],
                            };
                        }
                        const passing = rhs as RefTypesTableReturn;
                        passing.symbol = symbol;
                        passing.isconst = isconstVar;
                        passing.isAssign = true;
                        passing.type = rhsWidenedType;
                        return { unmerged: [passing] };
                    }
                    else {
                        // could be binding, or could a proeprty access on the lhs
                        Debug.fail("not yet implemented");
                    }
                } // floughInnerVariableDeclaration

                function floughInnerLiteralNumberStringBigintBooleanExpression(): FloughInnerReturn {
                    let type: Type;
                    switch (expr.kind) {
                        case SyntaxKind.TrueKeyword:
                            type = checker.getTrueType();
                            break;
                        case SyntaxKind.FalseKeyword:
                            type = checker.getFalseType();
                            break;
                        case SyntaxKind.NumericLiteral:
                            type = checker.getNumberLiteralType(Number((expr as any).text ?? getSourceTextOfNodeFromSourceFile(sourceFile, expr)));
                            break;
                        case SyntaxKind.StringLiteral:
                            {
                                let str = (expr as any).text;
                                if (!str) {
                                    str = getSourceTextOfNodeFromSourceFile(sourceFile, expr);
                                    Debug.assert(str.length >= 2);
                                    str = str.slice(1, -1);
                                }
                                type = checker.getStringLiteralType(str);
                            }
                            break;
                        default:
                            Debug.fail("not yet implemented: " + Debug.formatSyntaxKind(expr.kind));
                    }
                    return {
                        unmerged: [{
                            symbol: undefined,
                            type: floughTypeModule.createRefTypesType(type),
                            sci,
                        }],
                    };
                } // floughInnerLiteralAndBooleanType

                function floughInnerArrayLiteralExpression(): FloughInnerReturn {
                    // Calling getTypeAtLocation would result in an endless loop
                    // const type: Type = checker.getTypeAtLocation(expr);
                    /**
                     * The array itself is created above the flough level, in "function checkArrayLiteral", checker.ts.
                     * So we don't set the byNode entry for expr.
                     * However, the variable types within the literal array must be set herein.
                     */
                    assertCastType<Readonly<ArrayLiteralExpression>>(expr);
                    // let sci: RefTypesSymtabConstraintItem = { symtab:refTypesSymtabIn,constraintItem:constraintItemIn };
                    let sci1: RefTypesSymtabConstraintItem = sci;
                    const elemTsTypes: Type[] = [];
                    const elemFlags: ElementFlags[] = [];
                    for (let i = 0; i < expr.elements.length; i++) {
                        const e = expr.elements[i];
                        let type;
                        ({ type, sci: sci1 } = applyCritNoneUnion(
                            flough({
                                sci: sci1,
                                expr: (e.kind === SyntaxKind.SpreadElement) ? (e as SpreadElement).expression : e,
                                crit: { kind: FloughCritKind.none },
                                qdotfallout: undefined,
                                floughStatus: floughStatus,
                            }),
                            floughStatus.groupNodeToTypeMap,
                        ));
                        if (refactorConnectedGroupsGraphsNoShallowRecursion) {
                            const tstype = checker.getUnionType(floughTypeModule.getTsTypesFromFloughType(type));
                            if (e.kind === SyntaxKind.SpreadElement) {
                                if (checker.isArrayOrTupleType(tstype)) {
                                    if (checker.isTupleType(tstype)) {
                                        // Debug.assert(tstype.objectFlags & ObjectFlags.Reference);
                                        assertCastType<TupleTypeReference>(tstype);
                                        Debug.assert(tstype.resolvedTypeArguments);
                                        tstype.resolvedTypeArguments?.forEach((tstype, _indexInTuple) => {
                                            elemTsTypes.push(tstype);
                                            elemFlags.push(ElementFlags.Required);
                                        });
                                    }
                                    else {
                                        elemTsTypes.push(tstype);
                                        elemFlags.push(ElementFlags.Rest);
                                    }
                                }
                                else {
                                    // This should not happen, unless maybe it is a syntax error.
                                    Debug.assert(false, "unexpected / not yet implemented");
                                }
                            }
                            else {
                                elemTsTypes.push(tstype);
                                elemFlags.push(ElementFlags.Required);
                            }
                        }
                    }
                    let arrayType: Type;
                    if (refactorConnectedGroupsGraphsNoShallowRecursion) {
                        arrayType = checker.createTupleType(elemTsTypes, elemFlags);
                    }
                    else {
                        arrayType = floughStatus.getTypeOfExpressionShallowRecursion(sci, expr);
                    }
                    if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`floughInner[dbg]: case SyntaxKind.ArrayLiteralExpression: arrayType: ${IDebug.dbgs.typeToString(arrayType)}`, loggerLevel);
                    return {
                        unmerged: [{
                            type: floughTypeModule.createRefTypesType(arrayType),
                            sci: sci1,
                        }],
                    };
                } // floughInnerArrayLiteralExpression

                function floughObjectLiteralExpression(): FloughInnerReturn {
                    assertCastType<Readonly<ObjectLiteralExpression>>(expr);
                    let sci1: RefTypesSymtabConstraintItem = sci;
                    for (const e of expr.properties) {
                        ({ sci: sci1 } = applyCritNoneUnion(
                            flough({
                                sci: sci1,
                                expr: e,
                                crit: { kind: FloughCritKind.none },
                                qdotfallout: undefined,
                                floughStatus: { ...floughStatus, isAsConstObject: undefined },
                            }),
                            floughStatus.groupNodeToTypeMap,
                        ));
                    }
                    let newObjectTsType: Type;
                    if (floughStatus.isAsConstObject) {
                        if (extraAsserts) {
                            const typeNode = (expr.parent as AsExpression).type;
                            Debug.assert(
                                typeNode.kind === SyntaxKind.TypeReference &&
                                    (typeNode as TypeReferenceNode).typeName.kind === SyntaxKind.Identifier &&
                                    ((typeNode as TypeReferenceNode).typeName as Identifier).escapedText === "const",
                            );
                        }
                        newObjectTsType = floughStatus.getTypeOfExpressionShallowRecursion(sci, expr.parent as Expression);
                    }
                    else {
                        newObjectTsType = floughStatus.getTypeOfExpressionShallowRecursion(sci, expr);
                    }
                    let type: FloughType;
                    if (floughStatus.currentReplayableItem) {
                        const originalObjectTsType = floughStatus.currentReplayableItem.nodeToTypeMap.get(expr);
                        Debug.assert(originalObjectTsType);
                        assertCastType<ObjectType>(originalObjectTsType);
                        assertCastType<ObjectType>(newObjectTsType);
                        const logobj = floughLogicalObjectModule.createFloughLogicalObjectWithVariations(originalObjectTsType, newObjectTsType);
                        type = floughTypeModule.createTypeFromLogicalObject(logobj);
                    }
                    else {
                        const logobj = floughLogicalObjectModule.createFloughLogicalObject(newObjectTsType);
                        type = floughTypeModule.createTypeFromLogicalObject(logobj);
                    }
                    if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`floughObjectLiteralExpression[dbg]: objectType: ${IDebug.dbgs.typeToString(newObjectTsType)}`, loggerLevel);
                    return {
                        unmerged: [{
                            type,
                            sci: sci1,
                        }],
                    };
                }

                function floughPropertyAssignment(): FloughInnerReturn {
                    assertCastType<Readonly<PropertyAssignment>>(expr);
                    // let propName: PropertyName;
                    // let initializer: Expression;
                    const { initializer, name: propName } = expr;
                    // propName is of type PropertyName;
                    if (isIdentifier(propName)) {
                        const propSymbol = getSymbolOfNode(expr);
                        Debug.assert(propSymbol);
                        // const isconst = checker.isReadonlyProperty(propSymbol);
                        const rhs = applyCritNoneUnion(
                            flough({
                                sci,
                                expr: initializer,
                                crit: { kind: FloughCritKind.none },
                                qdotfallout: undefined,
                                floughStatus: floughStatus,
                            }),
                            floughStatus.groupNodeToTypeMap,
                        );

                        /**
                         * Add to symbolFlowInfoMap
                         */
                        // @ ts-ignore
                        // let symbolFlowInfo = _mrState.symbolFlowInfoMap.get(propSymbol);
                        // if (!symbolFlowInfo){
                        //     const declaredTypeOfSymbol = floughGetTsTypeOfSymbol(propSymbol); // could it end up in a recusive call error? But not always.
                        //     Debug.assert(declaredTypeOfSymbol);
                        //     const effectiveDeclaredTsType = declaredTypeOfSymbol;
                        //     const isconst = checker.isConstantReference(expr);
                        //     symbolFlowInfo = {
                        //         passCount:0,
                        //         effectiveDeclaredTsType,
                        //         isconst
                        //     };
                        //     _mrState.symbolFlowInfoMap.set(propSymbol,symbolFlowInfo);
                        // }

                        // TODO: do we want to widen property types?

                        return {
                            unmerged: [{
                                // symbol: propSymbol,
                                // isconst,
                                // isAssign: true,
                                type: rhs.type,
                                sci: rhs.sci,
                            }],
                        };
                    }
                    else Debug.fail("not yet implemented");
                }

                function floughInnerAsExpression(): FloughInnerReturn {
                    assertCastType<Readonly<AsExpression>>(expr);
                    const { expression: lhsExpression, type: typeNode } = expr;
                    // @ ts-expect-error
                    const isAsConstObject = lhsExpression.kind === SyntaxKind.ObjectLiteralExpression
                        && typeNode.kind === SyntaxKind.TypeReference
                        && (typeNode as TypeReferenceNode).typeName.kind === SyntaxKind.Identifier
                        && ((typeNode as TypeReferenceNode).typeName as Identifier).escapedText === "const";

                    const rhsRttr = applyCritNoneUnion(
                        flough({
                            sci,
                            expr: lhsExpression,
                            crit: { kind: FloughCritKind.none },
                            qdotfallout: undefined,
                            floughStatus: { ...floughStatus, isAsConstObject },
                        }),
                        floughStatus.groupNodeToTypeMap,
                    );

                    if (isAsConstObject) {
                        return {
                            unmerged: [rhsRttr],
                        };
                    }
                    const tstype = checker.getTypeFromTypeNode(typeNode);
                    return {
                        unmerged: [{
                            type: floughTypeModule.createRefTypesType(tstype),
                            sci: rhsRttr.sci,
                        }],
                    };
                } // floughInnerAsExpression


                // -----------------------------------------------------------------------------------------------------------
                /**
                 * @returns FloughInnerReturn
                 */
                // @ ts-expect-error
                function floughByCallExpressionV3(): FloughInnerReturn {
                    assertCastType<RefTypesSymtabConstraintItemNotNever>(sci);
                    if (IDebug.isActive(loggerLevel)) {
                        IDebug.ilogGroup(()=>`floughByCallExpression[in]`, loggerLevel);
                    }
                    Debug.assert(qdotfalloutInner);
                    // const { name, expression } = expr as CallExpression;
                    const leftMntr = flough({ expr: (expr as CallExpression).expression, sci, crit: { kind: FloughCritKind.none }, qdotfallout: undefined, floughStatus: floughStatus });
                    const leftUnmerged = leftMntr.unmerged.map(rttr => {
                        return applyCritNoneToOne(rttr, (expr as CallExpression).expression, floughStatus.groupNodeToTypeMap);
                    });
                    // const setOfTransientCallArgumentSymbol = new Set<TransientCallArgumentSymbol>();

                    const arrRefTypesTableReturn: RefTypesTableReturnNoSymbol[] = [];
                    leftUnmerged.forEach((rttr, rttridx) => {
                        if (IDebug.isActive(loggerLevel)) {
                            const str = `floughByCallExpression[dbg, rttridx:${rttridx}, haveLoad:${!!rttr.logicalObjectAccessData}]`;
                            IDebug.ilog(()=>str, loggerLevel);
                        }
                        // const { type /*, logicalObjectAccessData*/ } = rttr;
                        let { type, sci: scIsolated } = rttr;
                        // const { logicalObject:functionLogicalObjects, remaining: _remaining } = floughTypeModule.splitLogicalObject(type);
                        // if (!functionLogicalObjects) return;

                        /**
                         * In the case where rttr.logicalObjectAccessData is defined, and
                         * logicalObjectAccessModule.getFinalCarriedQdotUndefined(..., rttr.logicalObjectAccessData.finalTypeIdx) is true,
                         * make a seprate entry in arrRefTypesTableReturn for that case.
                         * This removes the case of carriedQdotUndefined from further processing.
                         */
                        if (rttr.logicalObjectAccessData) {
                            if (logicalObjectAccessModule.getFinalCarriedQdotUndefined(rttr.logicalObjectAccessData.logicalObjectAccessReturn, rttr.logicalObjectAccessData.finalTypeIdx)) {
                                if (IDebug.isActive(loggerLevel)) {
                                    const str = `floughByCallExpression[dbg, rttridx:${rttridx}, start carriedQdotUndefined]`;
                                    IDebug.ilog(()=>str, loggerLevel);
                                }
                                const rttrObjQdot = logicalObjectAccessModule.modifyOne(
                                    rttr.logicalObjectAccessData.logicalObjectAccessReturn,
                                    rttr.logicalObjectAccessData.finalTypeIdx,
                                    floughTypeModule.getNeverType(),
                                    /*callUndefinedAllowed*/ true,
                                );
                                if (extraAsserts) {
                                    // Debug.assert(!floughTypeModule.hasLogicalObject(rttrObjQdot.type));
                                    Debug.assert(!isRefTypesSymtabConstraintItemNever(rttrObjQdot.sci));
                                }
                                arrRefTypesTableReturn.push(rttrObjQdot);
                                // arrRefTypesTableReturn.push({
                                //     type: floughTypeModule.createUndefinedType(),
                                //     sci: rttr.sci,
                                //     callExpressionData: {
                                //         logicalObjectAccessData: rttr.logicalObjectAccessData,
                                //         functionTsType: undefined,
                                //         functionSigRtnType: undefined,
                                //         carriedQdotUndefined: true,
                                //         info: { rttridx, tstypeidx:-1, sigidx:-1 }
                                //     }
                                // });
                                // don't return here, must go on to to process the function call(s) assuming no carried undefined is involved.
                                if (IDebug.isActive(loggerLevel)) {
                                    const str = `floughByCallExpression[dbg, rttridx:${rttridx}, end carriedQdotUndefined]`;
                                    IDebug.ilog(()=>str, loggerLevel);
                                }
                            }
                            type = logicalObjectAccessModule.getFinalType(
                                rttr.logicalObjectAccessData.logicalObjectAccessReturn,
                                rttr.logicalObjectAccessData.finalTypeIdx,
                                /*includeCarriedQDotUndefined*/ false,
                            );
                            if (floughTypeModule.isNeverType(type)) return;
                            const rttrModObj = logicalObjectAccessModule.modifyOne(
                                rttr.logicalObjectAccessData.logicalObjectAccessReturn,
                                rttr.logicalObjectAccessData.finalTypeIdx,
                                type,
                                /*callUndefinedAllowed*/ false,
                            );
                            // const typeModObj = rttrModObj.type;
                            scIsolated = copyRefTypesSymtabConstraintItem(rttrModObj.sci);
                            if (rttrModObj.symbol) {
                                if (extraAsserts) Debug.assert(scIsolated.symtab);
                                scIsolated.symtab!.set(rttrModObj.symbol, rttrModObj.type);
                            }
                        }

                        const { logicalObject: functionLogicalObjects, remaining: _remaining } = floughTypeModule.splitLogicalObject(type);
                        if (!functionLogicalObjects) return;

                        const tstypes: Type[] = [];
                        floughLogicalObjectInnerModule.getTsTypesOfBaseLogicalObjects(
                            floughLogicalObjectModule.getInnerIF(functionLogicalObjects),
                        ).forEach((tstype, _tstypeidx) => {
                            tstypes.push(tstype);
                        });

                        if (IDebug.isActive(loggerLevel)) {
                            IDebug.ilog(()=>`floughByCallExpression rttridx:${rttridx}/${leftUnmerged.length}, tstypes.length:${tstypes.length}`, loggerLevel);
                            tstypes.forEach((tstype, tstypeidx) => {
                                IDebug.ilog(()=>`tstypes[${tstypeidx}]: ${checker.typeToString(tstype)}`, loggerLevel);
                            });
                        }
                        if (tstypes.length === 0) return;

                        const { sc: scResolvedArgs, resolvedCallArguments } = floughByCallExpressionProcessCallArguments({
                            callExpr: expr as Readonly<CallExpression>,
                            sc: scIsolated,
                            floughStatus: floughStatus,
                            /*setOfTransientCallArgumentSymbol*/
                        });

                        tstypes.forEach((tstype, tstypeidx) => {
                            if (IDebug.isActive(loggerLevel)) {
                                const str = `floughByCallExpression[dbg, rttridx:${rttridx}, tstypeidx:${tstypeidx}]` +
                                    `tstype:${checker.typeToString(tstype)}`;
                                IDebug.ilog(()=>str, loggerLevel);
                            }

                            const arrsig = checker.getSignaturesOfType(tstype, SignatureKind.Call);
                            if (arrsig.length === 0) return;

                            const arrsigrettype = arrsig.map(sig => checker.getReturnTypeOfSignature(sig));
                            if (IDebug.isActive(loggerLevel)) {
                                arrsig.forEach((sig, sigidx) => {
                                    const str = `floughByCallExpression[dbg, rttridx:${rttridx}, tstypeidx:${tstypeidx}, sigidx:${sigidx}] ` +
                                        `tstype:${checker.typeToString(tstype)}, sig:${checker.signatureToString(sig)} `;
                                    IDebug.ilog(()=>str, loggerLevel);
                                });
                            }
                            const allMappings: RefTypesType[][] = [];
                            let sigGroupFailedCount = 0;
                            let finished = false;
                            {
                                finished = true; // always true undef refactorCallExpressionArgMatching
                                arrsig.forEach((sig, sigidx) => {
                                    let tmpSC = scResolvedArgs;
                                    const oneMapping: RefTypesType[] = [];
                                    if (IDebug.isActive(loggerLevel)) {
                                        dbgRefTypesSymtabConstrinatItemToStrings(tmpSC).forEach(s => IDebug.ilog(()=>`floughByCallExpression[start one sig], rttridx:${rttridx} sigidx:${sigidx},tmpSC: ${s}`, loggerLevel));
                                    }
                                    let pass1 = resolvedCallArguments.every((carg, cargidx) => {
                                        IDebug.ilog(()=>`floughByCallExpression[start one arg], rttridx:${rttridx} sigidx:${sigidx}, cargidx:${cargidx}, carg:${floughTypeModule.dbgFloughTypeToString(carg.type)}`, loggerLevel);
                                        /**
                                         * TODO: needs example, check coverage.  Could extra parameter just return true and not be used?
                                         */
                                        if (!isValidSigParamIndex(sig, cargidx)) {
                                            return false;
                                        }
                                        const sparam = getSigParamType(sig, cargidx);
                                        const sparamType = floughTypeModule.createFromTsType(sparam.type);
                                        /**
                                         * TODO: needs example, check coverage.  Could extra parameter just return true and not be used?
                                         */
                                        if (carg.hasSpread /*final spread only*/ && !sparam.isRest) {
                                            return false;
                                        }

                                        const { bothUnique, bothNotUniqueA } = floughTypeModule.intersectionsAndDifferencesForEqualityCompare(carg.type, sparamType);
                                        let assignableType: FloughType | undefined;
                                        if (bothUnique) {
                                            if (bothNotUniqueA) assignableType = floughTypeModule.unionOfRefTypesType([bothUnique, bothNotUniqueA]);
                                            else assignableType = bothUnique;
                                        }
                                        else if (bothNotUniqueA) assignableType = bothNotUniqueA;
                                        else return false;

                                        // if (!isTransientArgumentSymbol(carg.symbol))
                                        if (carg.symbol) {
                                            ({ type: assignableType, sc: tmpSC } = andSymbolTypeIntoSymtabConstraint({
                                                symbol: carg.symbol,
                                                isconst: carg.isconst,
                                                type: assignableType,
                                                sc: tmpSC,
                                                getDeclaredType: getEffectiveDeclaredTypeFromSymbol,
                                                mrNarrow,
                                            }));
                                        }
                                        if (extraAsserts) Debug.assert(!floughTypeModule.isNeverType(assignableType));
                                        if (IDebug.isActive(loggerLevel)) {
                                            IDebug.ilog(()=>`arg matching: rttridx:${rttridx}, sigidx:${sigidx}, cargidx:${cargidx}, (1) assignableType: ${floughTypeModule.dbgRefTypesTypeToStrings(assignableType!)}`, loggerLevel);
                                        }
                                        oneMapping.push(assignableType);
                                        return true;
                                    }); // carg, cargidx
                                    if (pass1 && isValidSigParamIndex(sig, resolvedCallArguments.length)) {
                                        // if there are leftover sig params the first one must be optional or final spread
                                        const sparam = getSigParamType(sig, resolvedCallArguments.length);
                                        if (!sparam.optional && !sparam.isRest) {
                                            pass1 = false;
                                        }
                                    }
                                    if (IDebug.isActive(loggerLevel)) {
                                        let str = "";
                                        oneMapping.forEach((t, _i) => str += `${dbgRefTypesTypeToString(t)}, `);
                                        IDebug.ilog(()=>`floughByCallExpression[one sig done] rttridx:${rttridx}, sigidx:${sigidx} pass1:${pass1}, oneMapping:[${str}]`, loggerLevel);
                                    }
                                    if (pass1) {
                                        allMappings.push(oneMapping);

                                        const functionSigRtnType = floughTypeModule.createRefTypesType(arrsigrettype[sigidx]);
                                        if (!floughTypeModule.isNeverType(functionSigRtnType)) {
                                            const rttr: RefTypesTableReturnNoSymbol = {
                                                type: functionSigRtnType,
                                                sci: tmpSC,
                                            };
                                            if (IDebug.isActive(loggerLevel)) {
                                                dbgRefTypesTableToStrings(rttr).forEach(s => {
                                                    IDebug.ilog(()=>`floughByCallExpression[adding return rttr out] rttridx(in):${rttridx}/${leftUnmerged.length}, tstypeidx:${tstypes.length}, sigidx:${sigidx}/${arrsig.length}, rttr: ${s}`, loggerLevel);
                                                });
                                            }
                                            arrRefTypesTableReturn.push(rttr);
                                        }
                                        else {
                                            if (IDebug.isActive(loggerLevel)) {
                                                IDebug.ilog(()=>`floughByCallExpression[skipping because never function return type] rttridx(in):${rttridx}/${leftUnmerged.length}, tstypeidx:${tstypes.length}, sigidx:${sigidx}/${arrsig.length}`, loggerLevel);
                                            }
                                        }
                                    }
                                }); // sigidx
                            }

                            if (!finished) {
                                sigGroupFailedCount++;
                                // "not finished" means there could be uncovered/unexpected arguments passed to the function and therefore the result is unknown.
                                // This situation can always be prevented if the user declares a final overload - `function [functionName](...args: any[]): never;`
                                // which could be backed up by terminating in case of unexpected inputs.
                                // This next added return is the same as the user declaring a final overload - `function [functionName](...args: any[]): unknown;`
                                // If the user declares `function [functionName](...args: any[]): unknown;` and the processing "finishes" before reaching it, then the
                                // function return effectively becomes never.
                                arrRefTypesTableReturn.push({
                                    type: floughTypeModule.createRefTypesType(checker.getUnknownType()),
                                    sci: scResolvedArgs,
                                });
                            }
                            if (IDebug.isActive(loggerLevel)) {
                                IDebug.ilog(()=>`floughByCallExpression sigGroupFailedCount:${sigGroupFailedCount}`, loggerLevel);
                            }
                            if (IDebug.isActive(loggerLevel)) {
                                IDebug.ilog(()=>`floughByCallExpression[dbg rttridx:${rttridx}/${leftUnmerged.length}, tstypeidx: ${tstypeidx}/${tstypes.length}, finished:${finished}`, loggerLevel);
                            }
                        }); // tstypes.forEach
                    }); // pre.unmergedPassing.forEach
                    // Note: transient symbols no longer being produced.
                    // setOfTransientCallArgumentSymbol.forEach(symbol=>_mrState.symbolFlowInfoMap.delete(symbol));
                    const floughInnerReturn: FloughInnerReturn = { unmerged: arrRefTypesTableReturn };
                    if (IDebug.isActive(loggerLevel)) {
                        IDebug.ilogGroupEnd(()=>`floughByCallExpression[out]`, loggerLevel);
                    }
                    return floughInnerReturn;
                } // floughByCallExpressionV3

                /**
                 * @returns FloughInnerReturn
                 */
                function floughByBinaryExpresionAssign(): FloughInnerReturn {
                    assertCastType<BinaryExpression>(expr);
                    if (IDebug.isActive(loggerLevel)) {
                        IDebug.ilogGroup(()=>`floughByBinaryExpresionAssign[in] ${Debug.formatSyntaxKind(expr.left.kind)}`, loggerLevel);
                    }
                    const { left: leftExpr, right: rightExpr } = expr;
                    if (leftExpr.kind === SyntaxKind.Identifier) {
                        const rhs = flough({
                            sci,
                            crit: { kind: FloughCritKind.none },
                            expr: rightExpr,
                            floughStatus: floughStatus,
                        });
                        const passing = applyCritNoneUnion(rhs, floughStatus.groupNodeToTypeMap);

                        assertCastType<Identifier>(leftExpr);
                        const symbol = getResolvedSymbol(leftExpr);
                        let symbolFlowInfo: SymbolFlowInfo | undefined = _mrState.symbolFlowInfoMap.get(symbol);
                        if (!symbolFlowInfo) {
                            // this must correspond to a declaration without an initializer, or a variable with no type spec at all (default: any).
                            let typeNodeTsType: Type;
                            if ((symbol.valueDeclaration as VariableDeclaration).type) {
                                typeNodeTsType = checker.getTypeFromTypeNode((symbol.valueDeclaration as VariableDeclaration).type!);
                            }
                            else {
                                typeNodeTsType = anyType;
                            }
                            const effectiveDeclaredTsType = typeNodeTsType;
                            symbolFlowInfo = {
                                passCount: 0,
                                // initializedInAssignment: true,
                                isconst: checker.isConstantReference(leftExpr),
                                effectiveDeclaredTsType,
                                effectiveDeclaredType: floughTypeModule.createRefTypesType(effectiveDeclaredTsType),
                            };
                            if (typeNodeTsType) symbolFlowInfo.typeNodeTsType = typeNodeTsType;
                            _mrState.symbolFlowInfoMap.set(symbol, symbolFlowInfo);
                        }
                        else {
                            // if (symbolFlowInfo.initializedInAssignment){
                            //     // then all assignments must contribute to the effectiveDeclaredType

                            // }
                            if (extraAsserts && (symbol.valueDeclaration as VariableDeclaration).type) {
                                Debug.assert(checker.getTypeFromTypeNode((symbol.valueDeclaration as VariableDeclaration).type!) === symbolFlowInfo.effectiveDeclaredTsType);
                            }
                        }
                        if (extraAsserts && compilerOptions.enableTSDevExpectString) {
                            debugDevExpectEffectiveDeclaredType(leftExpr.parent, symbolFlowInfo);
                        }
                        // const rhsType = widenDeclarationOrAssignmentRhs(passing.type,symbolFlowInfo);
                        if (IDebug.isActive(loggerLevel)) {
                            IDebug.ilogGroupEnd(()=>`floughByBinaryExpresionAssign`, loggerLevel);
                        }
                        return {
                            unmerged: [{
                                ...passing,
                                // type: rhsType,
                                symbol,
                                isAssign: true,
                            }],
                        };
                    }
                    else if (leftExpr.kind === SyntaxKind.PropertyAccessExpression || leftExpr.kind === SyntaxKind.ElementAccessExpression) {
                        const unmerged: RefTypesTableReturn[] = [];
                        const lhs = flough({ expr: leftExpr, sci, crit: { kind: FloughCritKind.none }, floughStatus: floughStatus });
                        const lhsUnion = applyCritNoneUnion(lhs, floughStatus.groupNodeToTypeMap);
                        // if (extraAsserts){
                        //     Debug.assert(lhs.unmerged.slice(1).every(rttr=>rttr.sci===lhs.unmerged[0].sci));
                        //     Debug.assert(lhs.unmerged.slice(1).every(
                        //         rttr=>rttr.logicalObjectAccessData?.logicalObjectAccessReturn===lhs.unmerged[0].logicalObjectAccessData?.logicalObjectAccessReturn));
                        // }
                        const leftSci = lhsUnion.sci;
                        const assignCountBeforeRhs = lhsUnion.sci.symtab?.getAssignCount() ?? -1;
                        const rhs = flough({
                            sci: leftSci,
                            crit: { kind: FloughCritKind.none },
                            expr: rightExpr,
                            floughStatus: floughStatus,
                        });

                        lhs.unmerged.forEach((rttrLeft0, _ileft) => {
                            rhs.unmerged.forEach((rttrRight0, _iright) => {
                                const rightRttr = applyCritNoneToOne(rttrRight0, rightExpr, floughStatus.groupNodeToTypeMap);
                                const assignCountAfterRhs = rightRttr.sci.symtab?.getAssignCount() ?? -1;
                                const leftRightIdependent = assignCountBeforeRhs === assignCountAfterRhs;
                                let sciFinal = leftRightIdependent ? rttrLeft0.sci : rttrRight0.sci;
                                const typeFinal = rightRttr.type;
                                if (floughTypeModule.isNeverType(typeFinal)) return;
                                if (rttrLeft0.logicalObjectAccessData) {
                                    const symbol = logicalObjectAccessModule.getSymbol(rttrLeft0.logicalObjectAccessData.logicalObjectAccessReturn);
                                    if (symbol) {
                                        const { newRootType } = floughLogicalObjectModule.assignFinalTypeToLogicalObjectAccessReturn(
                                            rttrLeft0.logicalObjectAccessData.logicalObjectAccessReturn,
                                            rttrRight0.type,
                                        );
                                        if (floughTypeModule.isNeverType(newRootType)) return;
                                        sciFinal = copyRefTypesSymtabConstraintItem(sciFinal);
                                        sciFinal.symtab!.setAsAssigned(symbol, newRootType);
                                    }
                                    rttrLeft0.logicalObjectAccessData = undefined;
                                }
                                unmerged.push({
                                    type: typeFinal,
                                    sci: sciFinal,
                                });
                            }); // just to make sure that rhs is evaluated
                        });
                        if (IDebug.isActive(loggerLevel)) {
                            IDebug.ilogGroupEnd(()=>`floughByBinaryExpresionAssign[out] ${Debug.formatSyntaxKind(expr.left.kind)}`, loggerLevel);
                        }
                        return { unmerged };
                    }
                    else Debug.fail("not yet implemented");
                }

                function floughByBinaryExpressionAmpersandAmpersandToken(): FloughInnerReturn {
                    if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`case SyntaxKind.(AmpersandAmpersand|BarBar)Token START`, loggerLevel);
                    const { left: leftExpr, operatorToken, right: rightExpr } = expr as BinaryExpression;
                    if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`case SyntaxKind.(AmpersandAmpersand|BarBar)Token left`, loggerLevel);
                    const leftRet0 = flough({
                        sci,
                        crit: { kind: FloughCritKind.truthy, alsoFailing: true },
                        expr: leftExpr,
                        floughStatus: floughStatus,
                    });
                    const leftRet = applyCrit(leftRet0, { kind: FloughCritKind.truthy, alsoFailing: true }, floughStatus.groupNodeToTypeMap);

                    const arrRefTypesTableReturn: RefTypesTableReturn[] = [];

                    if (operatorToken.kind === SyntaxKind.AmpersandAmpersandToken) {
                        arrRefTypesTableReturn.push(leftRet.failing!);

                        if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`case SyntaxKind.AmpersandAmpersandToken right (for left passing)`, loggerLevel);
                        const leftTrueRightRet0 = flough({
                            sci: leftRet.passing.sci,
                            crit: { kind: FloughCritKind.truthy, alsoFailing: true },
                            expr: rightExpr,
                            floughStatus: floughStatus,
                        });
                        if (!floughStatus.inCondition) {
                            const leftTrueRightRet = applyCrit(leftTrueRightRet0, { kind: FloughCritKind.truthy, alsoFailing: true }, floughStatus.groupNodeToTypeMap);
                            arrRefTypesTableReturn.push(leftTrueRightRet.passing);
                            arrRefTypesTableReturn.push(leftTrueRightRet.failing!);
                        }
                        else {
                            leftTrueRightRet0.unmerged.forEach(rttr => {
                                const { passing, failing } = applyCrit1ToOne(rttr, { kind: FloughCritKind.truthy, alsoFailing: true }, rightExpr, floughStatus.groupNodeToTypeMap);
                                arrRefTypesTableReturn.push(passing);
                                arrRefTypesTableReturn.push(failing!);
                            });
                        }
                    }

                    if (operatorToken.kind === SyntaxKind.BarBarToken) {
                        arrRefTypesTableReturn.push(leftRet.passing);

                        if (IDebug.isActive(loggerLevel)) IDebug.ilog(()=>`case SyntaxKind.AmpersandAmpersandToken right (for left failing)`, loggerLevel);
                        const leftFalseRightRet0 = flough({
                            sci: leftRet.failing!.sci,
                            crit: { kind: FloughCritKind.truthy, alsoFailing: true },
                            expr: rightExpr,
                            floughStatus: floughStatus,
                        });
                        if (!floughStatus.inCondition) {
                            const leftFalseRightRet = applyCrit(leftFalseRightRet0, { kind: FloughCritKind.truthy, alsoFailing: true }, floughStatus.groupNodeToTypeMap);
                            arrRefTypesTableReturn.push(leftFalseRightRet.passing);
                            arrRefTypesTableReturn.push(leftFalseRightRet.failing!);
                        }
                        else {
                            leftFalseRightRet0.unmerged.forEach(rttr => {
                                const { passing, failing } = applyCrit1ToOne(rttr, { kind: FloughCritKind.truthy, alsoFailing: true }, rightExpr, floughStatus.groupNodeToTypeMap);
                                arrRefTypesTableReturn.push(passing);
                                arrRefTypesTableReturn.push(failing!);
                            });
                        }
                    }
                    return {
                        unmerged: arrRefTypesTableReturn,
                    };
                } // floughByBinaryExpressionAmpersandAmpersandToken

                function floughByTypeofExpression(): FloughInnerReturn {
                    assertCastType<TypeOfExpression>(expr);
                    const mntr = flough({ sci, expr: expr.expression, qdotfallout: undefined, floughStatus: floughStatus, crit: { kind: FloughCritKind.none } });

                    if (true || floughStatus.inCondition) {
                        let symbolAttribsOut: SymbolWithAttributes | undefined;
                        const typeofArgSymbol = getSymbolIfUnique(mntr.unmerged)?.symbol; // TODO: remove this, it appears to be never set
                        const rhs = applyCritNoneUnion(mntr, floughStatus.groupNodeToTypeMap);
                        if (!floughStatus.inCondition || !typeofArgSymbol) {
                            const setOfTypeOfStrings = new Set<string>();
                            floughTypeModule.forEachRefTypesTypeType(rhs.type, t => {
                                typeToTypeofStrings(t).forEach(str => {
                                    setOfTypeOfStrings.add(str);
                                });
                            });
                            const arrStringLiteralType: StringLiteralType[] = [];
                            setOfTypeOfStrings.forEach(str => {
                                const typeofString = checker.getStringLiteralType(str);
                                if (extraAsserts) Debug.assert(typeofString.regularType === typeofString);
                                arrStringLiteralType.push(checker.getStringLiteralType(str));
                            });
                            return { unmerged: [{ ...rhs, type: floughTypeModule.createRefTypesType(arrStringLiteralType) }] };
                        }
                        else {
                            const arrStringLiteralType: StringLiteralType[] = [];
                            const mapTypeOfStringToTsTypeSet = new Map<LiteralType, Set<Type>>();
                            floughTypeModule.forEachRefTypesTypeType(rhs.type, t => {
                                typeToTypeofStrings(t).forEach(str => {
                                    const typeofString = checker.getStringLiteralType(str);
                                    arrStringLiteralType.push(typeofString);
                                    const accumSet = mapTypeOfStringToTsTypeSet.get(typeofString);
                                    if (!accumSet) mapTypeOfStringToTsTypeSet.set(typeofString, new Set<Type>([t]));
                                    else accumSet.add(t);
                                });
                            });
                            const map = new Map<LiteralType, RefTypesType>();
                            const f = (set: Set<Type>): RefTypesType => {
                                const a: Type[] = [];
                                set.forEach(t => a.push(t));
                                return floughTypeModule.createRefTypesType(a);
                            };
                            mapTypeOfStringToTsTypeSet.forEach((set, lit) => map.set(lit, f(set)));

                            const ret: FloughInnerReturn = {
                                unmerged: [{
                                    ...rhs,
                                    ...symbolAttribsOut,
                                    type: floughTypeModule.createRefTypesType(arrStringLiteralType),
                                }],
                                typeof: {
                                    argSymbol: typeofArgSymbol,
                                    map,
                                },
                            };
                            return ret;
                        }
                    }
                } // floughByTypeofExpression

                /**
                 * Uses floughTypeModule.intersectionsAndDifferences to compute the result.
                 * @returns
                 */
                // @ ts-expect-error
                function floughByBinaryExpressionEqualsCompareV3(): FloughInnerReturn {
                    assertCastType<BinaryExpression>(expr);
                    const { left: leftExpr, operatorToken, right: rightExpr } = expr;
                    if (IDebug.isActive(loggerLevel)) {
                        IDebug.ilogGroup(()=>`floughByBinaryExpressionEqualCompare[in] expr:${IDebug.dbgs.nodeToString(expr)}`, loggerLevel);
                    }
                    if (
                        ![
                            SyntaxKind.EqualsEqualsEqualsToken,
                            SyntaxKind.EqualsEqualsToken,
                            SyntaxKind.ExclamationEqualsEqualsToken,
                            SyntaxKind.ExclamationEqualsToken,
                        ].includes(operatorToken.kind)
                    ) {
                        Debug.fail("unexpected");
                    }
                    const negateEq = [
                        SyntaxKind.ExclamationEqualsEqualsToken,
                        SyntaxKind.ExclamationEqualsToken,
                    ].includes(operatorToken.kind);
                    const nomativeTrueType = floughTypeModule.createRefTypesType(negateEq ? falseType : trueType);
                    const nomativeFalseType = floughTypeModule.createRefTypesType(negateEq ? trueType : falseType);
                    const trueAndFalseType = floughTypeModule.createRefTypesType([trueType, falseType]);

                    const leftMntr = flough({
                        expr: leftExpr,
                        crit: { kind: FloughCritKind.none },
                        qdotfallout: undefined,
                        floughStatus: floughStatus,
                        sci,
                    });

                    Debug.assert(leftMntr !== undefined);

                    /**
                     * TODO: Current criterion for seperability could be widened.
                     * If we the changes to left and right sci only affect different symbols, then they are seperable.
                     * But there currently isn't a low cost way to check that, because the symbol table might be huge
                     */
                    let assumeSeparable = true;
                    let leftRttrUnion: RefTypesTableReturn | undefined;
                    let rightMntrSeparable: FloughReturn | undefined;
                    let useLeftSci = false;
                    if (assumeSeparable) {
                        leftRttrUnion = applyCritNoneUnion(leftMntr, floughStatus.groupNodeToTypeMap);
                        rightMntrSeparable = flough({
                            expr: rightExpr,
                            crit: { kind: FloughCritKind.none },
                            qdotfallout: undefined,
                            floughStatus: floughStatus,
                            sci: leftRttrUnion.sci,
                        });
                        if (leftRttrUnion.sci !== sci) {
                            const rightMntrSeparableUnion = applyCritNoneUnion(rightMntrSeparable, floughStatus.groupNodeToTypeMap);
                            if (rightMntrSeparableUnion.sci === leftRttrUnion.sci) {
                                useLeftSci = true;
                            }
                            else {
                                assumeSeparable = false;
                                leftRttrUnion = undefined;
                                rightMntrSeparable = undefined;
                            }
                        }
                    }

                    const arrRefTypesTableReturn: RefTypesTableReturn[] = [];
                    leftMntr.unmerged.forEach((leftRttr0, _leftidx) => {
                        const leftRttr = applyCritNoneToOne(leftRttr0, leftExpr, floughStatus.groupNodeToTypeMap);
                        if (IDebug.isActive(loggerLevel)) {
                            floughTypeModule.dbgRefTypesTypeToStrings(leftRttr.type).forEach(str => {
                                IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[l:${_leftidx}] leftRttr.type:${str}`, loggerLevel);
                            });
                        }
                        let rightMntr: FloughReturn;
                        let rightMntrNotSeparable: FloughReturn | undefined;
                        if (!assumeSeparable) {
                            rightMntrNotSeparable = flough({
                                expr: rightExpr,
                                crit: { kind: FloughCritKind.none },
                                qdotfallout: undefined,
                                floughStatus: floughStatus,
                                sci: leftRttr.sci,
                            });
                            rightMntr = rightMntrNotSeparable;
                        }
                        else {
                            rightMntr = rightMntrSeparable!;
                        }

                        Debug.assert(rightMntr);
                        rightMntr.unmerged.forEach((rightRttr0, _rightidx) => {
                            const rightRttr = applyCritNoneToOne(rightRttr0, rightExpr, floughStatus.groupNodeToTypeMap);
                            if (IDebug.isActive(loggerLevel)) {
                                floughTypeModule.dbgRefTypesTypeToStrings(rightRttr.type).forEach(str => {
                                    IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[l:${_leftidx},r:${_rightidx}] rightRttr.type:${str}`, loggerLevel);
                                });
                            }
                            let sciLeftRight0: RefTypesSymtabConstraintItem;
                            if (!assumeSeparable) {
                                sciLeftRight0 = rightRttr.sci;
                            }
                            else {
                                if (useLeftSci) {
                                    sciLeftRight0 = leftRttr.sci;
                                }
                                else {
                                    sciLeftRight0 = rightRttr.sci;
                                }
                            }

                            if (IDebug.isActive(loggerLevel)) {
                                IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[dbg] leftRttr.type:${dbgRefTypesTypeToString(leftRttr.type)}, rightRttr.type:${dbgRefTypesTypeToString(rightRttr.type)}`, loggerLevel);
                                IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[dbg] calling partitionForEqualityCompare(leftRttr.type,rightRttr.type))`, loggerLevel);
                            }

                            const iad = floughTypeModule.intersectionsAndDifferencesForEqualityCompare(leftRttr.type, rightRttr.type);

                            type Item = { left?: FloughType; right?: FloughType; both?: FloughType; pass?: boolean; fail?: boolean; };
                            const items: Item[] = [];
                            if (iad.bothUnique) items.push({ both: iad.bothUnique, pass: true, fail: false });
                            if (iad.bothNotUniqueA || iad.bothNotUniqueB) {
                                Debug.assert(iad.bothNotUniqueA && iad.bothNotUniqueB);
                                items.push({ left: iad.bothNotUniqueA, right: iad.bothNotUniqueB, pass: true, fail: true });
                            }
                            if (iad.aonly) {
                                items.push({ left: iad.aonly, right: rightRttr.type, pass: false, fail: true });
                            }
                            if (iad.bonly) {
                                items.push({ left: leftRttr.type, right: iad.bonly, pass: false, fail: true });
                            }

                            items.forEach((item, _i) => {
                                const { left, right, both, pass, fail } = item;
                                let leftFt: RefTypesType | undefined;
                                let rightFt: RefTypesType | undefined;
                                function f2at(x: FloughType | undefined): Type[] | undefined {
                                    if (!x) return undefined;
                                    return floughTypeModule.getTsTypesFromFloughType(x);
                                }
                                let sctmp: RefTypesSymtabConstraintItem = sciLeftRight0;
                                if (IDebug.isActive(loggerLevel)) {
                                    const leftFt1 = both ?? left;
                                    const rightFt1 = both ?? right;
                                    Debug.assert(leftFt1 && rightFt1);
                                    IDebug.ilog(()=>
                                        `floughByBinaryExpressionEqualCompare[dbg] -- before`
                                            + `[${_i}][0] left:${dbgRefTypesTypeToString(leftFt1)}, right:${dbgRefTypesTypeToString(rightFt1)}, pass:${pass},fail:${fail}`, loggerLevel
                                    );
                                    IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[dbg] leftRttr0.symbol:${IDebug.dbgs.symbolToString(leftRttr0.symbol)}, rightRttr0.symbol:${IDebug.dbgs.symbolToString(rightRttr0.symbol)}`, loggerLevel);
                                    IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[dbg] !!leftMntr.typeof:${!!leftMntr.typeof}, !!rightMntr.typeof:${!!rightMntr.typeof}`, loggerLevel);
                                    IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[dbg] !!leftRttr.logicalObjectAccessData:${!!leftRttr.logicalObjectAccessData}, !!rightRttr.logicalObjectAccessData:${!!rightRttr.logicalObjectAccessData}`, loggerLevel);
                                    dbgRefTypesSymtabConstrinatItemToStrings(sctmp).forEach(s => IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[dbg] sctmp:${s}`, loggerLevel));
                                }

                                const tftype = pass ? (fail ? trueAndFalseType : nomativeTrueType) : nomativeFalseType;
                                if (leftRttr0.symbol) {
                                    leftFt = both ?? left;
                                    ({ type: leftFt, sc: sctmp } = andSymbolTypeIntoSymtabConstraint({
                                        symbol: leftRttr0.symbol,
                                        isconst: leftRttr0.isconst,
                                        type: leftFt!,
                                        sc: sctmp,
                                        getDeclaredType: getEffectiveDeclaredTypeFromSymbol,
                                        mrNarrow,
                                    }));
                                }
                                Debug.assert(leftMntr);
                                if (leftMntr.typeof) {
                                    const leftTypeOfArgSymbol = leftMntr.typeof.argSymbol;
                                    const tsTypes = f2at(both) ?? f2at(left);
                                    Debug.assert(tsTypes);
                                    let typeofArgSubType: FloughType | undefined;
                                    if (!isArray(tsTypes)) typeofArgSubType = leftMntr.typeof.map.get(tsTypes);
                                    else if (tsTypes.length) {
                                        if (tsTypes.length === 1) typeofArgSubType = leftMntr.typeof.map.get(tsTypes[0]);
                                        else typeofArgSubType = floughTypeModule.unionOfRefTypesType(tsTypes.map(tstype => leftMntr.typeof!.map.get(tstype)!));
                                    }
                                    Debug.assert(typeofArgSubType);
                                    ({ sc: sctmp } = andSymbolTypeIntoSymtabConstraint({
                                        symbol: leftTypeOfArgSymbol,
                                        isconst: _mrState.symbolFlowInfoMap.get(leftTypeOfArgSymbol)!.isconst,
                                        type: typeofArgSubType, // ?? floughTypeModule.getNeverType(),
                                        sc: sctmp,
                                        getDeclaredType: getEffectiveDeclaredTypeFromSymbol,
                                        mrNarrow,
                                    }));
                                }

                                if (rightRttr0.symbol) {
                                    rightFt = both ?? right;
                                    ({ type: rightFt, sc: sctmp } = andSymbolTypeIntoSymtabConstraint({
                                        symbol: rightRttr0.symbol,
                                        isconst: rightRttr0.isconst,
                                        type: rightFt ?? floughTypeModule.getNeverType(),
                                        sc: sctmp,
                                        getDeclaredType: getEffectiveDeclaredTypeFromSymbol,
                                        mrNarrow,
                                    }));
                                }
                                Debug.assert(rightMntr);
                                if (rightMntr.typeof) {
                                    const rightTypeOfArgSymbol = rightMntr.typeof.argSymbol;

                                    const tsTypes = f2at(both) ?? f2at(right);
                                    Debug.assert(tsTypes);
                                    let typeofArgSubType: FloughType | undefined;
                                    if (!isArray(tsTypes)) typeofArgSubType = rightMntr.typeof.map.get(tsTypes);
                                    else if (tsTypes.length) {
                                        if (tsTypes.length = 1) typeofArgSubType = rightMntr.typeof.map.get(tsTypes[0]);
                                        else typeofArgSubType = floughTypeModule.unionOfRefTypesType(tsTypes.map(tstype => rightMntr.typeof!.map.get(tstype)!));
                                    }
                                    Debug.assert(typeofArgSubType);
                                    ({ sc: sctmp } = andSymbolTypeIntoSymtabConstraint({
                                        symbol: rightTypeOfArgSymbol,
                                        isconst: _mrState.symbolFlowInfoMap.get(rightTypeOfArgSymbol)!.isconst,
                                        type: typeofArgSubType ?? floughTypeModule.getNeverType(),
                                        sc: sctmp,
                                        getDeclaredType: getEffectiveDeclaredTypeFromSymbol,
                                        mrNarrow,
                                    }));
                                }
                                {
                                    const leftTypeTmp = left ?? both;
                                    Debug.assert(leftTypeTmp);
                                    if (leftRttr.logicalObjectAccessData) {
                                        ({ /*type,*/ sc: sctmp } = resolveLogicalObjectAccessData(leftRttr0.logicalObjectAccessData!, sctmp, leftTypeTmp));
                                    }
                                    const rightTypeTmp = right ?? both;
                                    Debug.assert(rightTypeTmp);
                                    if (rightRttr.logicalObjectAccessData) {
                                        ({ /*type,*/ sc: sctmp } = resolveLogicalObjectAccessData(rightRttr0.logicalObjectAccessData!, sctmp, rightTypeTmp));
                                    }
                                }
                                if (IDebug.isActive(loggerLevel)) {
                                    const leftx = both ?? left;
                                    const rightx = both ?? right;
                                    Debug.assert(leftx && rightx);
                                    IDebug.ilog(()=>
                                        `floughByBinaryExpressionEqualCompare[dbg] -- after`
                                            + `[${_i}][0] left:${dbgRefTypesTypeToString(leftx)}, right:${dbgRefTypesTypeToString(rightx)}, pass:${pass},fail:${fail}`, loggerLevel
                                    );
                                    dbgRefTypesSymtabConstrinatItemToStrings(sctmp).forEach(s => IDebug.ilog(()=>`floughByBinaryExpressionEqualCompare[dbg] sctmp:${s}`, loggerLevel));
                                }
                                arrRefTypesTableReturn.push({
                                    type: tftype,
                                    sci: sctmp,
                                });
                            });
                        });
                    });
                    return { unmerged: arrRefTypesTableReturn };
                } // floughByBinaryExpressionEqualCompareV3

                // @ ts-ignore
                function floughAccessExpressionCritNone(): FloughInnerReturn {
                    assertCastType<ElementAccessExpression | PropertyAccessExpression>(expr);
                    if (IDebug.isActive(loggerLevel)) {
                        IDebug.ilogGroup(()=>`floughAccessExpressionCritNone[in] expr: ${IDebug.dbgs.nodeToString(expr)}, accessDepth:${accessDepth}`, loggerLevel);
                    }
                    Debug.assert((accessDepth === undefined) === (refAccessArgs === undefined));
                    if (!accessDepth || !refAccessArgs) {
                        accessDepth = 0;
                        refAccessArgs = [{ roots: undefined, keyTypes: [], expressions: [] }];
                    }

                    const unmerged: RefTypesTableReturnNoSymbol[] = [];

                    const leftMntr = flough({
                        expr: expr.expression,
                        crit: { kind: FloughCritKind.none },
                        qdotfallout: undefined,
                        floughStatus: floughStatus,
                        sci,
                        accessDepth: accessDepth + 1,
                        refAccessArgs,
                    });
                    const leftSci: RefTypesSymtabConstraintItem = orSymtabConstraints(leftMntr.unmerged.map(rttr => rttr.sci));
                    const type: FloughType = undefined as any as FloughType; // naughty!!!
                    if (!refAccessArgs[0].roots) {
                        refAccessArgs[0].roots = leftMntr.unmerged as RefTypesTable[];
                    }

                    let sciFinal: RefTypesSymtabConstraintItem;
                    if (expr.kind === SyntaxKind.ElementAccessExpression) {
                        const argMntr = flough({
                            expr: expr.argumentExpression,
                            crit: { kind: FloughCritKind.none },
                            qdotfallout: undefined,
                            floughStatus: floughStatus,
                            sci: leftSci,
                        });
                        const argRttrUnion = applyCritNoneUnion(argMntr, floughStatus.groupNodeToTypeMap);
                        sciFinal = argRttrUnion.sci;
                        refAccessArgs[0].keyTypes.push(argRttrUnion.type);
                        refAccessArgs[0].expressions.push(expr);
                    }
                    else {
                        const keystr = expr.name.escapedText as string;
                        const keyType = floughTypeModule.createLiteralStringType(keystr);
                        sciFinal = leftSci;
                        refAccessArgs[0].keyTypes.push(keyType);
                        refAccessArgs[0].expressions.push(expr);
                    }

                    let raccess: LogicalObjectAccessReturn | undefined;
                    if (accessDepth === 0) {
                        const allSymbolsSame = refAccessArgs[0].roots.length < 2 || refAccessArgs[0].roots.every(r => {
                            assertCastType<AccessArgs[]>(refAccessArgs);
                            assertCastType<AccessArgsRoot[]>(refAccessArgs[0].roots);
                            return r.symbol === refAccessArgs[0].roots[0].symbol;
                        });
                        if (!allSymbolsSame) {
                            Debug.fail("not yet implemented, multiple disparate symbols (or lack of) for access roots");
                        }
                        if (extraAsserts) {
                            Debug.assert(refAccessArgs[0].roots);
                            Debug.assert(refAccessArgs[0].roots[0]);
                        }
                        const symbol = refAccessArgs[0].roots[0].symbol;

                        assertCastType<AccessArgsRoot[]>(refAccessArgs[0].roots);

                        raccess = floughLogicalObjectModule.logicalObjectAccess(
                            refAccessArgs[0].roots,
                            refAccessArgs[0].roots.map(r => r.type),
                            refAccessArgs[0].keyTypes,
                            refAccessArgs[0].expressions,
                        );

                        if (IDebug.isActive(loggerLevel)) {
                            floughLogicalObjectInnerModule.dbgLogicalObjectAccessResult(raccess).forEach(s => {
                                IDebug.ilog(()=>`accessResult: ${s}`, loggerLevel);
                            });
                        }

                        if (symbol && !sciFinal.symtab?.get(symbol)) {
                            // nothing changed symbol value so only add if not already present.
                            const { newRootType } = floughLogicalObjectModule.getRootTypeAtLevelFromFromLogicalObjectAccessReturn(raccess, 0);
                            sciFinal = copyRefTypesSymtabConstraintItem(sciFinal);
                            sciFinal.symtab!.set(symbol, newRootType);
                        }

                        const includeQDotUndefined = expr.parent?.kind !== SyntaxKind.CallExpression;
                        const finalType: Readonly<FloughType> = floughLogicalObjectModule.getFinalTypeFromLogicalObjectAccessReturn(raccess, includeQDotUndefined);
                        {
                            // TODO: in case floughStatus.inCondition is false, one of the following?
                            // (1) leave as is
                            // (2) don't add logicalObjectAccessData to unmerged
                            // (3) logicalObjectModify here, per finalType, and (2)
                            raccess.finalTypes.forEach((finalType, idx) => {
                                const logicalObjectAccessData: LogicalObjecAccessData = {
                                    logicalObjectAccessReturn: raccess!,
                                    finalTypeIdx: idx,
                                };
                                let type = finalType.type;
                                if (includeQDotUndefined && !floughTypeModule.hasUndefinedType(type)) {
                                    if (raccess!.collated[raccess!.collated.length - 1].carriedQdotUndefinedsOut[idx]) {
                                        type = floughTypeModule.cloneType(type);
                                        floughTypeModule.addUndefinedTypeMutate(type);
                                    }
                                }
                                unmerged.push({
                                    sci: sciFinal,
                                    type,
                                    logicalObjectAccessData,
                                });
                            });
                        }
                        for (let level = 0, nlevel = raccess.collated.length; level !== nlevel; level++) {
                            const { newRootType } = floughLogicalObjectModule.getRootTypeAtLevelFromFromLogicalObjectAccessReturn(raccess, level);
                            orIntoNodeToTypeMap(newRootType, refAccessArgs[0].expressions[level].expression, floughStatus.groupNodeToTypeMap);
                        }
                        orIntoNodeToTypeMap(finalType, expr, floughStatus.groupNodeToTypeMap);
                    }
                    // if (accessDepth===0)
                    else {
                        unmerged.push({ type, sci: sciFinal });
                    }

                    if (IDebug.isActive(loggerLevel)) {
                        IDebug.ilogGroupEnd(()=>`floughAccessExpressionCritNone[out] expr: ${IDebug.dbgs.nodeToString(expr)}, accessDepth: ${accessDepth}`, loggerLevel);
                    }
                    const ret: FloughInnerReturn = { unmerged };
                    return ret;
                } // endof floughAccessExpressionCritNone

                function floughByBinaryExpressionInKeyword(): FloughInnerReturn {
                    const { left: keyExpr, right: objExpr } = expr as BinaryExpression;
                    const keyMntr = flough({
                        expr: keyExpr,
                        crit: { kind: FloughCritKind.none },
                        qdotfallout: undefined,
                        floughStatus: floughStatus,
                        sci,
                    });
                    const keyRttrUnion = applyCritNoneUnion(keyMntr, floughStatus.groupNodeToTypeMap);
                    const { remaining: keyNobjType } = floughTypeModule.splitLogicalObject(keyRttrUnion.type);

                    const keySymbol = (keyMntr.unmerged.length === 1 && keyMntr.unmerged[0].symbol) ? keyMntr.unmerged[0].symbol : undefined;

                    const objMntr = flough({
                        expr: objExpr,
                        crit: { kind: FloughCritKind.none },
                        qdotfallout: undefined,
                        floughStatus: floughStatus,
                        sci: keyRttrUnion.sci,
                    });
                    // If there is no key, or the key is unknown, terminate this branch; it is an error anyway.
                    if (!keyNobjType || floughTypeModule.isUnknownType(keyNobjType)) return { unmerged: [] };
                    const isAnyKeyType = floughTypeModule.isAnyType(keyNobjType);
                    const usableKeys = floughTypeModule.getObjectUsableAccessKeys(keyNobjType);

                    const unmergedOut: RefTypesTableReturn[] = [];
                    objMntr.unmerged.forEach((rttr0, _rttridx) => {
                        const rttr = applyCritNoneToOne(rttr0, objExpr, floughStatus.groupNodeToTypeMap);
                        const { logicalObject, remaining: _remaining } = floughTypeModule.splitLogicalObject(rttr.type);
                        if (!logicalObject) return;
                        if (isAnyKeyType || usableKeys.genericString) {
                            unmergedOut.push({
                                ...rttr,
                                type: floughTypeModule.createBooleanType(),
                            });
                            return;
                        }
                        const keysGenericStringRemoved: ObjectUsableAccessKeys = { ...usableKeys, genericString: false };
                        const rt = floughLogicalObjectModule.resolveInKeyword(logicalObject, keysGenericStringRemoved);

                        const pushOne = (logicalObject: FloughLogicalObjectIF, key: string, tf: FloughType) => {
                            let sc = rttr.sci;
                            if (rttr0.symbol) {
                                ({ sc } = andSymbolTypeIntoSymtabConstraint({
                                    symbol: rttr0.symbol,
                                    isconst: rttr0.isconst,
                                    type: floughTypeModule.createTypeFromLogicalObject(logicalObject),
                                    sc,
                                    getDeclaredType: getEffectiveDeclaredTypeFromSymbol,
                                    mrNarrow,
                                }));
                            }
                            if (keySymbol) {
                                ({ sc } = andSymbolTypeIntoSymtabConstraint({
                                    symbol: keySymbol,
                                    isconst: keyMntr.unmerged[0].isconst,
                                    type: floughTypeModule.createLiteralStringType(key),
                                    sc,
                                    getDeclaredType: getEffectiveDeclaredTypeFromSymbol,
                                    mrNarrow,
                                }));
                            }
                            unmergedOut.push({
                                ...rttr,
                                sci: sc,
                                type: tf,
                            });
                        };

                        if (rt.passing) {
                            rt.passing.forEach(([key, logobj], _idx) => pushOne(logobj, key, floughTypeModule.createTrueType()));
                        }
                        if (rt.failing) {
                            rt.failing.forEach(([key, logobj], _idx) => pushOne(logobj, key, floughTypeModule.createFalseType()));
                        }
                        if (rt.bothing) {
                            unmergedOut.push({
                                ...rttr,
                                sci: rttr.sci,
                                type: floughTypeModule.createBooleanType(),
                            });
                        }
                    });
                    return { unmerged: unmergedOut };
                } // endof floughByBinaryExpressionInKeyword
            } // endof floughInnerAux()
        } // endof floughInner()
    } // endof flough()

    return mrNarrow;
} // createMrNarrow
