import {
    //AnonymousType,
    Debug,
    Type,
    ObjectType,
    UnionType,
    Signature,
    SignatureKind,
    // @ts-ignore
    TypeMapper,
    TypeFlags,
    TypeChecker,
    __String,
    Symbol,
    castHereafter,
    RelationComparisonResult,
    CheckMode,
    Expression,
    InferenceContext,
    InferenceFlags,
    NodeArray,
    TypeNode,
    isInJSFile,
    some,
    CallLikeExpression,
    Diagnostic,
    DiagnosticMessageChain,
    DiagnosticMessage,
    TypeComparer,
    TypeParameter,
    ResolvedType,
    SymbolFlags,
    SignatureFlags,
    StructuredType,
    NodeCheckFlags,
    NodeLinks,
    SymbolLinks,
    Node,
    TypePredicate,
    JSDocSignature,
    SignatureDeclaration,
    TransientSymbol,
    CheckFlags,
} from "./_namespaces/ts";

// cphdebug-start
import { IDebug } from "./mydebug";
// cphdebug-end

// Not working yet
const enableIsolatedInnerSigs = true;


export interface ChooseOverloadInnerValuesTracker {
    incrementChooseOverloadRecursionLevel(): void;
    decrementChooseOverloadRecursionLevel(): void;
    // called from checkExpression and after doOneCandidate if it was successful
    getChooseOverloadFlushNodesReq(): Set<Node> | undefined;
    setChooseOverloadFlushNodesReq(value: Set<Node> | undefined): void;
    // called from assignParameter and after doOneCandidate if it was successful
    getChooseOverloadFlushSymbolsReq(): Set<Symbol> | undefined;
    setChooseOverloadFlushSymbolsReq(value: Set<Symbol> | undefined): void;
}

export interface TmpChecker {
    isArrayOrTupleSymbol(symbol: Symbol): boolean;
    hasCorrectArity(node: CallLikeExpression, args: readonly Expression[], signature: Signature, signatureHelpTrailingComma?: boolean): boolean;
    hasCorrectTypeArgumentArity(signature: Signature, typeArguments: NodeArray<TypeNode> | undefined): boolean;
    checkTypeArguments(signature: Signature, typeArgumentNodes: readonly TypeNode[], reportErrors: boolean, headMessage?: DiagnosticMessage | undefined): Type[] | undefined;
    createInferenceContext(typeParameters: readonly TypeParameter[], signature: Signature | undefined, flags: InferenceFlags, compareTypes?: TypeComparer | undefined): InferenceContext;
    inferTypeArguments(node: CallLikeExpression, signature: Signature, args: readonly Expression[], checkMode: CheckMode, context: InferenceContext): Type[];
    getSignatureInstantiation(signature: Signature, typeArguments: Type[] | undefined, isJavascript: boolean, inferredTypeParameters?: readonly TypeParameter[] | undefined): Signature;
    getNonArrayRestType(signature: Signature): Type | undefined;
    getSignatureApplicabilityError(node: CallLikeExpression, args: readonly Expression[], signature: Signature, relation: Map<string, RelationComparisonResult>, checkMode: CheckMode, reportErrors: boolean, containingMessageChain: (() => DiagnosticMessageChain | undefined) | undefined): readonly Diagnostic[] | undefined;
    createUnionSignature(usig: Signature, signatures: readonly Signature[]): Signature;
    resolveStructuredTypeMembers(type: StructuredType): ResolvedType;
    getNodeLinks(node: Expression): NodeLinks;
    getSymbolLinks(symbol: Symbol): SymbolLinks;
    incrementChooseOverloadRecursionLevel(): void;
    decrementChooseOverloadRecursionLevel(): void;
    getChooseOverloadFlushNodesSignaturesReq(): Set<Node> | undefined;
    setChooseOverloadFlushNodesSignaturesReq(value: Set<Node> | undefined): void;
    getChooseOverloadFlushSymbolsReq(): Set<Symbol> | undefined;
    setChooseOverloadFlushSymbolsReq(value: Set<Symbol> | undefined): void;
    cloneSignature(sig: Signature): Signature;
    getResolvingSignature(): Readonly<Signature>;
    getOrCreateTypeFromSignature(signature: Signature): ObjectType;
    //cloneSymbol(symbol: Symbol): Symbol;
    //createSymbol(flags: SymbolFlags, name: __String): Symbol;
    createSymbol(flags: SymbolFlags, name: __String, checkFlags?: CheckFlags | undefined): TransientSymbol;
    createSignature(
        declaration: SignatureDeclaration | JSDocSignature | undefined,
        typeParameters: readonly TypeParameter[] | undefined,
        thisParameter: Symbol | undefined,
        parameters: readonly Symbol[],
        resolvedReturnType: Type | undefined,
        resolvedTypePredicate: TypePredicate | undefined,
        minArgumentCount: number,
        flags: SignatureFlags,
    ): Signature;
}


/**
 * Algorithm psuedocode:
 * - passing: {overload, subtype}[] = []
 * - failing: {overload}[] = []
 * - type AssignableResult = "never" | "weak" | "strong"
 * - declare psuedoAssignable (arg: Type, t: Type): AssignableResult
 * - For each generic overload<T0>
 * -     let T = T0
 * -     let stronglyMatched = true;
 * -     overload:
 * -     t = getConstraintByArg(T,arg[i])
 * -     For each parameter param<T>[i]
 * -         For each type t in range of T
 * -             r = psuedoAssignable(arg[i], param<T@t>[i]));
 * -             if r==="never"
 * -                 T = T-t;
 * -             if T is never break overload;
 * -             if r!=="strong"
 * -                 stronglyMatched = false;
 * -     if T is never
 * -         failing.push(overload<T0>)
 * -     else passing.push(overload<T0@T>, T)
 * -     if stronglyMatched break; //
 * - As long as there is at least one overload passing (not necessarily a strong match)
 * - then there is no error.
 *
 * @param candidates
 * @param relation
 * @param isSingleNonGenericCandidate
 * @param signatureHelpTrailingComma
 * @param apparentType
 * @returns
 */



// export interface TypeParameter extends InstantiableType {
//     /**
//      * Retrieve using getConstraintFromTypeParameter
//      *
//      * @internal
//      */
//     constraint?: Type;        // Constraint
//     /** @internal */
//     default?: Type;
//     /** @internal */
//     target?: TypeParameter;  // Instantiation target
//     /** @internal */
//     mapper?: TypeMapper;     // Instantiation mapper
//     /** @internal */
//     isThisType?: boolean;
//     /** @internal */
//     resolvedDefaultType?: Type;
// }

function dbgTypeParameterToStrings(typeParameter: TypeParameter): string[] {
    //return `TypeParameter{symbol:${IDebug.dbgs.dbgSymbolToString(typeParameter.symbol)}, constraint:${IDebug.dbgs.dbgTypeToString(typeParameter.constraint)}}`;
    const astr: string[] = [];
    if (typeParameter.symbol) astr.push(`symbol:${IDebug.dbgs.dbgSymbolToString(typeParameter.symbol)}`);
    if (typeParameter.isThisType) astr.push(`isThisType:${typeParameter.isThisType}`);
    if (typeParameter.constraint) astr.push(`constraint:${IDebug.dbgs.dbgTypeToString(typeParameter.constraint)}`);
    if (typeParameter.default) astr.push(`default:${IDebug.dbgs.dbgTypeToString(typeParameter.default)}`);
    if (typeParameter.resolvedDefaultType) astr.push(`resolvedDefaultType: ${IDebug.dbgs.dbgTypeToString(typeParameter.resolvedDefaultType)}`);
    if (typeParameter.target) dbgTypeParameterToStrings(typeParameter.target).forEach((s)=>astr.push(`    target:${s}`));
    return astr;
}



interface ChooseOverload2ReturnType {
    candidate: Signature | undefined;
    argCheckMode: CheckMode;
    candidatesForArgumentError: Signature[] | undefined;
    candidateForArgumentArityError: Signature | undefined;
    candidateForTypeArgumentError: Signature | undefined;
};

interface VirtualSignature {
    callSignature: Signature;
    paramTypes: Type[];
    resolvedReturnType: Type;
    thisType?: Type;
};



function cloneSymbolWithoutMerge(symbol: Symbol, _tmpChecker: TmpChecker): TransientSymbol {
    // CheckFlags.LateBoundSymbol ??
    const result = _tmpChecker.createSymbol(symbol.flags, symbol.escapedName, /*checkFlags*/ undefined);
    result.declarations = symbol.declarations ? symbol.declarations.slice() : [];
    result.parent = symbol.parent;
    if (symbol.valueDeclaration) result.valueDeclaration = symbol.valueDeclaration;
    if (symbol.constEnumOnlyModule) result.constEnumOnlyModule = true;
    if (symbol.members) result.members = new Map(symbol.members);
    if (symbol.exports) result.exports = new Map(symbol.exports);
    //recordMergedSymbol(result, symbol);
    return result;
}


/**
 * It turns out that cloning a symbol does not really provide an independent copy of the symbol, because there are revrse lookups from the declarations
 * to the symbol, and that points to the latest symbol clone via mergedSymbols, not the original symbol.
 * @param vsig
 * @param _checker
 * @param _tmpChecker
 * @returns
 */
// @ts-ignore
function cloneSignatureFromVirtualSignature(vsig: VirtualSignature, _checker: TypeChecker, _tmpChecker: TmpChecker): Signature {
    function cloneSymbolSetLinksType(symbol: Symbol, type: Type | undefined): Symbol {
        const result = cloneSymbolWithoutMerge(symbol, _tmpChecker);
        const resultLinks = _tmpChecker.getSymbolLinks(result);
        Debug.assert(resultLinks!==_tmpChecker.getSymbolLinks(symbol));
        resultLinks.type = type;
        return result;
    }
    const sig = vsig.callSignature;
    const thisParameter = sig.thisParameter ? cloneSymbolSetLinksType(sig.thisParameter, vsig.thisType) : undefined;
    const parameters = sig.parameters.map((p,i)=>cloneSymbolSetLinksType(p, vsig.paramTypes[i]));
    const result = _tmpChecker.createSignature(sig.declaration, sig.typeParameters,
        thisParameter, parameters, vsig.resolvedReturnType, /*resolvedTypePredicate*/ undefined,
        sig.minArgumentCount, sig.flags & SignatureFlags.PropagatingFlags);
    result.target = sig.target;
    result.mapper = sig.mapper;
    result.compositeSignatures = sig.compositeSignatures;
    result.compositeKind = sig.compositeKind;
    return result;
    //return 0 as any as Signature;
}


function createVirtualSignature(sig: Signature, _checker: TypeChecker, _tmpChecker: TmpChecker): VirtualSignature {
    const paramTypes: Type[] = [];
    for (const param of sig.parameters) {
        const paramType = _checker.getTypeOfSymbol(param); // in place snapshot of the current type
        paramTypes.push(paramType);
    }
    const returnType = _checker.getReturnTypeOfSignature(sig);
    return {
        callSignature: sig,
        paramTypes,
        resolvedReturnType: returnType
    };
}


/**
 * [cph]
 * @param signatures
 * @returns
 */
// @ts-ignore
function createUnionResultSignature(signatures: Signature[], _checker: TypeChecker, _tmpChecker: TmpChecker): Signature {
    let returnTypes: Type[]=[];
    const paramTypes: Type[][] = [];
    for (const sig of signatures) {
        // Only process signatures with parameter lists that aren't already in the result list
        sig.parameters.forEach((param, index) => {
            // TODO: all the options, etc.
            const paramType = _checker.getTypeOfSymbol(param);
            if (!paramTypes[index]) paramTypes[index] = [paramType];
            else paramTypes[index].push(paramType);
        });
        const rt = _checker.getReturnTypeOfSignature(sig);
        returnTypes.push(rt);
    }
    const params = paramTypes.map((types, index) => {
        const utype = _checker.getUnionType(types);
        const paramSymbol = _checker.createSymbol(SymbolFlags.FunctionScopedVariable, `arg${index}` as __String);
        paramSymbol.links.type = utype;
        return paramSymbol;
    });
    const returnType = _checker.getUnionType(returnTypes);

    const usig = _checker.createSignature(
        /*declaration*/ undefined,
        /*typeParameters*/ undefined,
        /*thisParameter*/ undefined,
        /*parameters*/ params,
        returnType,
        /*resolvedTypePredicate*/ undefined,
        0,
        SignatureFlags.None);

    const result = _tmpChecker.createUnionSignature(usig, signatures);
    return result;
}





export function chooseOverload2(
    _candidatesOriginal: Signature[], // gets overwritten
    relation: Map<string, RelationComparisonResult>, isSingleNonGenericCandidate: boolean, signatureHelpTrailingComma: boolean | undefined,
    reducedType: Type,
    // @ts-ignore
    //resolvedTypesOfUnion: readonly {  type: (Type | ResolvedType), fromStructured: boolean}[],
    x:{
        node: CallLikeExpression,
        args: readonly Expression[],
        typeArguments: NodeArray<TypeNode> | undefined,
        // @ts-ignore
        checker: TypeChecker,
        tmpChecker: TmpChecker,
        argCheckMode: CheckMode
    }): ChooseOverload2ReturnType{
    x.tmpChecker.incrementChooseOverloadRecursionLevel(); // #56013
    x.tmpChecker.setChooseOverloadFlushNodesSignaturesReq(undefined);
    x.tmpChecker.setChooseOverloadFlushSymbolsReq(undefined);
    const result =  chooseOverload2Helper(_candidatesOriginal, relation, isSingleNonGenericCandidate, signatureHelpTrailingComma, reducedType, x);
    x.tmpChecker.setChooseOverloadFlushNodesSignaturesReq(undefined);
    x.tmpChecker.setChooseOverloadFlushSymbolsReq(undefined);
    x.tmpChecker.decrementChooseOverloadRecursionLevel(); // #56013
    return result;
}



type NodeLinksResolvedKeys = keyof NodeLinks & (`resolvedSignature` | `resolvedType`);
type NodeAccumValueType = {
    resolvedSignature: { symbol?: Symbol | undefined, virtualSignature: VirtualSignature },
    resolvedType: Type,
    //resolvedSymbol: {symbol: Symbol, type: Type},
};


function forEachTypeOfUnion(type: Type, cb: (type: Type, index: number)=>void): void {
    if (type.flags & TypeFlags.Union) {
        (type as UnionType).types.forEach((t, index)=>cb(t, index));
    }
    else {
        cb(type, 0);
    }
}

export function chooseOverload2Helper(
    _candidatesOriginal: Signature[], // gets overwritten
    relation: Map<string, RelationComparisonResult>, isSingleNonGenericCandidate: boolean, signatureHelpTrailingComma: boolean | undefined,
    reducedType: Type,
    // @ts-ignore
    //resolvedTypesOfUnion: readonly {  type: (Type | ResolvedType), fromStructured: boolean}[],
    {
        node, args, typeArguments,
        // @ts-ignore
        checker,
        tmpChecker,
        argCheckMode: argCheckModeIn
    }:{
        node: CallLikeExpression,
        args: readonly Expression[],
        typeArguments: NodeArray<TypeNode> | undefined,
        // @ts-ignore
        checker: TypeChecker,
        tmpChecker: TmpChecker,
        argCheckMode: CheckMode
    }): ChooseOverload2ReturnType{

    IDebug.ilogGroup(()=>`chooseOverload2(reducedType:${IDebug.dbgs.dbgTypeToString(reducedType)})`,2);
    if (IDebug.logLevel>=2) {
        typeArguments ? typeArguments.forEach((typeArg, _idx)=>{IDebug.ilog(()=>`typeArg[${_idx}]: ${IDebug.dbgs.dbgNodeToString(typeArg)}`,2);})
            : IDebug.ilog(()=>`typeArguments: undefined`,2);
    }
    const makeReturn = (candidate: Signature | undefined): ChooseOverload2ReturnType => {
        return {
            candidate,
            argCheckMode,
            candidatesForArgumentError,
            candidateForArgumentArityError,
            candidateForTypeArgumentError,
        };
    }

    let candidates: Signature[] = [];
    let candidatesForArgumentError: Signature[] | undefined = undefined;
    let candidateForArgumentArityError: Signature | undefined = undefined;
    let candidateForTypeArgumentError: Signature | undefined = undefined;

    // Debug.assert(OverloadStateImpl.canDo(apparentType,checker,tmpChecker));
    // const state = new OverloadStateImpl(apparentType,checker,tmpChecker);


    if (!reducedType || !(reducedType.flags & TypeFlags.Union || !isSingleNonGenericCandidate)){
        Debug.assert(false);
        // const candidate = candidates[0];
        // if (typeArguments?.length || !tmpChecker.hasCorrectArity(node, args, candidate, signatureHelpTrailingComma)) {
        //     return undefined;
        // }
        // if (tmpChecker.getSignatureApplicabilityError(node, args, candidate, relation, CheckMode.Normal, /*reportErrors*/ false, /*containingMessageChain*/ undefined)) {
        //     candidatesForArgumentError = [candidate];
        //     return undefined;
        // }
        // return makeReturn(candidate);
    }



    //Debug.assert(reducedType.flags & TypeFlags.Union);
    const resolvedTypesOfUnion: {type: (ResolvedType | Type), fromStructured: boolean}[] = [];
    forEachTypeOfUnion(reducedType, (t)=>{
        if (t.flags & TypeFlags.StructuredType) {
            resolvedTypesOfUnion.push({type: tmpChecker.resolveStructuredTypeMembers(t as StructuredType), fromStructured: true});
        }
        else {
            resolvedTypesOfUnion.push({type: t, fromStructured: false});
        }
    });

    let argCheckMode = argCheckModeIn;



    // The brute force approach for comparison - not performce feasible in the general case.
    const passed2: (Signature| undefined)[][] = [];
    const innerSymbolAccumTypesMap: Map<Symbol, Type[]> = new Map();
    //const innerNodeAccumSignaturesMap: Map<Node, Signature[]> = new Map();
    const innerNodeAccumMap: Map<Node, Map<NodeLinksResolvedKeys, any>> = new Map();
    function addToInnerNodeAccumMap<K extends NodeLinksResolvedKeys>(node: Node, kind: K, value: NodeAccumValueType[K] ): void {
        //const [kind,value] = p;
        if (!innerNodeAccumMap.has(node)) {
            innerNodeAccumMap.set(node, new Map());
        }
        const nodeMap = innerNodeAccumMap.get(node)!;
        if (!nodeMap.has(kind)) {
            nodeMap.set(kind, [value as any]);
        }
        else {
            nodeMap.get(kind)!.push(value as any);
        }
    }

    function addToInnerSymbolTypeAccumMap(symbol: Symbol, type: Type): void {
        if (!innerSymbolAccumTypesMap.has(symbol)) {
            innerSymbolAccumTypesMap.set(symbol, [type]);
        }
        else {
            innerSymbolAccumTypesMap.get(symbol)!.push(type);
        }
    }

    resolvedTypesOfUnion.forEach(({type, fromStructured}, typeIndex)=>{
        IDebug.ilogGroup(()=>`type[${typeIndex}]: ${IDebug.dbgs.dbgTypeToString(type)}`,2);
        Debug.assert(fromStructured);
        const candidates: readonly Signature[] = checker.getSignaturesOfType(type, SignatureKind.Call);
        const passed1: (Signature| undefined)[] = Array(candidates.length).fill(undefined);
        argCheckMode = argCheckModeIn
        for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
            const reportErrors = typeIndex === 1 && candidateIndex === 1;

            tmpChecker.setChooseOverloadFlushNodesSignaturesReq(new Set());
            tmpChecker.setChooseOverloadFlushSymbolsReq(new Set());

            let checkCandidate = doOneCandidate(candidates[candidateIndex], candidateIndex, reportErrors);

            if (checkCandidate) {
                passed1[candidateIndex] = checkCandidate;
                // collect the inner nodeLink.resolvedSignature and symbolLink.type for accumulation
                const setOfInnerSymbols = tmpChecker.getChooseOverloadFlushSymbolsReq();
                Debug.assert(setOfInnerSymbols);
                setOfInnerSymbols.forEach((symbol)=>{
                    const symbolLinks = tmpChecker.getSymbolLinks(symbol);
                    if (!symbolLinks.type){
                        Debug.assert(false);
                    };
                    addToInnerSymbolTypeAccumMap(symbol, symbolLinks.type!);
                    // if (!innerSymbolAccumTypesMap.has(symbol)) {
                    //     innerSymbolAccumTypesMap.set(symbol, [symbolLinks.type]);
                    // }
                    // else {
                    //     innerSymbolAccumTypesMap.get(symbol)!.push(symbolLinks.type);
                    // }
                });
                const setOfInnerNodes = tmpChecker.getChooseOverloadFlushNodesSignaturesReq();
                Debug.assert(setOfInnerNodes);
                setOfInnerNodes.forEach((node)=>{
                    const nodeLinks = tmpChecker.getNodeLinks(node as Expression);
                    Object.keys(nodeLinks).forEach((key:string)=>{
                        castHereafter<keyof NodeLinks>(key);
                        switch (key) {
                            case "flags": break;
                            case "resolvedSignature":{

                                IDebug.ilog(()=>`resolvedSignature: ${nodeLinks.resolvedSignature===tmpChecker.getResolvingSignature() ?
                                        "resolvingSignature" : IDebug.dbgs.dbgSignatureToString(nodeLinks.resolvedSignature!)}`,2);
                                //addToInnerNodeAccumMap(node, key, tmpChecker.cloneSignature(nodeLinks.resolvedSignature!));
                                //let signature: Signature | undefined;
                                let symbol: Symbol | undefined;
                                let symbolLinks: SymbolLinks | undefined;
                                //let symbolLinksType: Type | undefined;
                                const isResolvingSignature = nodeLinks.resolvedSignature===tmpChecker.getResolvingSignature();
                                if (isResolvingSignature) {
                                    if ((symbol= (node as any as ObjectType).symbol) && (symbolLinks=tmpChecker.getSymbolLinks(symbol)).type) {
                                        //addToInnerSymbolTypeAccumMap(symbol, symbolLinks.type!);
                                        IDebug.ilog(()=>`(accum) resolvedSignature from symbolLinksType: ${IDebug.dbgs.dbgTypeToString(symbolLinks!.type)}`,2);
                                        //addToInnerNodeAccumMap(node, "resolvedType", symbolLinksType);
                                        Debug.assert((symbolLinks.type as ObjectType).callSignatures?.length===1);
                                        const callSignature = (symbolLinks.type as ObjectType).callSignatures![0];
                                        const virtualSignature = createVirtualSignature(callSignature, checker, tmpChecker);
                                        addToInnerNodeAccumMap(node, key, { symbol, virtualSignature} );
                                    }
                                    else {
                                        Debug.assert(false);
                                    }
                                }
                                else {
                                    const virtualSignature = createVirtualSignature(nodeLinks.resolvedSignature!, checker, tmpChecker);
                                    IDebug.ilog(()=>`(accum) resolvedSignature: ${IDebug.dbgs.dbgSignatureToString(nodeLinks.resolvedSignature)}`,2);
                                    addToInnerNodeAccumMap(node, key, { virtualSignature });
                                }
                            }
                                break;
                            case "resolvedType":
                                IDebug.ilog(()=>`(accum) resolvedType: ${IDebug.dbgs.dbgTypeToString(nodeLinks.resolvedType!)}`,2);
                                addToInnerNodeAccumMap(node, key, nodeLinks.resolvedType!);
                                break;
                            case "resolvedSymbol":{
                                const symbolLinks = tmpChecker.getSymbolLinks(nodeLinks.resolvedSymbol!);
                                //addToInnerNodeAccumMap(node, key, {symbol: nodeLinks.resolvedSymbol!, type: symbolLinks.type!});
                                if (symbolLinks.type) addToInnerSymbolTypeAccumMap(nodeLinks.resolvedSymbol!, symbolLinks.type!);

                                IDebug.ilog(()=>`(accum) resolvedSymbol: ${IDebug.dbgs.dbgSymbolToString(nodeLinks.resolvedSymbol!)}, symbolLinks.type ${
                                    IDebug.dbgs.dbgTypeToString(symbolLinks.type)}`,2);
                            }
                                break;
                            default:
                                if (key.startsWith("resolved")) {
                                    Debug.assert(false, undefined, ()=>"unexpected 'resolved' key: "+key);
                                }
                                else {
                                    IDebug.ilog(()=>`IGNORING NODE LINKS KEY: ${key}`,2);
                                }
                        }

                    });
                });
            }

            tmpChecker.getChooseOverloadFlushNodesSignaturesReq()?.forEach((node)=>{
                const nodeLinks = tmpChecker.getNodeLinks(node as Expression);
                IDebug.ilogGroup(()=>`node: ${IDebug.dbgs.dbgNodeToString(node)}, after doOneCandidate(${candidateIndex}, candidate: ${IDebug.dbgs.dbgSignatureToString(candidates[candidateIndex])})`,2);
                let str = "";
                Object.keys(nodeLinks).forEach((key)=>{
                    if (key==="flags") return;
                    str += `(post) ${key}:`
                    if (key==="resolvedSignature") {
                        // str+= `resolvedSignature: ${IDebug.dbgs.dbgSignatureToString(nodeLinks.resolvedSignature!)}, `;
                        // let type: Type | undefined;
                        // if ((node as any as ObjectType).symbol) type = checker.getTypeOfSymbol((node as any).symbol);
                        // if (type) str+= `type:${IDebug.dbgs.dbgTypeToString(type)}, `;
                        // let callSignatures: readonly Signature[] | undefined;
                        // if (callSignatures=(type as ObjectType).callSignatures) str+= `callSignatures[0]:${IDebug.dbgs.dbgSignatureToString(callSignatures[0])}, `;
                    }
                    else if (key==="resolvedType") str+= IDebug.dbgs.dbgTypeToString(nodeLinks.resolvedType!);
                    else if (key==="resolvedSymbol") str+= IDebug.dbgs.dbgSymbolToString(nodeLinks.resolvedSymbol!);
                    str += ", ";
                });
                IDebug.ilog(()=>`nodeLinks keys: ${str}`,2);
                IDebug.ilogGroupEnd(()=>'',2);
                nodeLinks.flags &= ~NodeCheckFlags.ContextChecked;
                Object.keys(nodeLinks).forEach((key)=>{
                    if (key==="resolvedSignature") {
                        if ((node as any as ObjectType).symbol){
                            const symbolLinks = tmpChecker.getSymbolLinks((node as any as ObjectType).symbol);
                            if (symbolLinks.type) {
                                //symbolLinks.type = undefined;
                            }
                        }
                    }
                });
                //Object.keys(nodeLinks).forEach((key)=>delete (nodeLinks as any)[key]);
            });

            tmpChecker.getChooseOverloadFlushSymbolsReq()?.forEach((symbol)=>{
                const symbolLinks = tmpChecker.getSymbolLinks(symbol);
                IDebug.ilogGroup(()=>`symbol: ${IDebug.dbgs.dbgSymbolToString(symbol)}, after doOneCandidate(${candidateIndex}, candidate: ${IDebug.dbgs.dbgSignatureToString(candidates[candidateIndex])})`,2);
                let str = "";
                Object.keys(symbolLinks).forEach((key)=>{
                    str += `${key}: `;
                    if (key==="type") str+= IDebug.dbgs.dbgTypeToString(symbolLinks.type!);
                    str += ", ";
                });
                IDebug.ilog(()=>`symbolLinks keys: ${str}`,2);
                IDebug.ilogGroupEnd(()=>'',2);
                Object.keys(symbolLinks).forEach((key)=>delete (symbolLinks as any)[key]);
            });

            tmpChecker.setChooseOverloadFlushNodesSignaturesReq(undefined);
            tmpChecker.setChooseOverloadFlushSymbolsReq(undefined);

        }
        passed2.push(passed1);
        IDebug.ilogGroupEnd(()=>``,2);
    });
    const maxlenol = Math.max(...passed2.map((p1) => p1.length));

    const usigs1: Signature[] = [];
    for (let olidx = 0; olidx < maxlenol; olidx++) {
        const sigs: Signature[] = [];
        for (let typeidx = 0; typeidx < resolvedTypesOfUnion.length; typeidx++) {
            const cand = passed2[typeidx][olidx];
            if (!cand) continue;
            sigs.push(cand);
        }
        if (!sigs.length) continue;
        // create a union signature from sigs
        if (sigs.length === 1) {
            usigs1.push(sigs[0]);
            continue;
        }
        const usig1 = createUnionResultSignature(sigs, checker, tmpChecker);
        usigs1.push(usig1);
    }
    usigs1.forEach((usig1, idx) => {
        IDebug.ilog(()=>`usigs1[${idx}]=${IDebug.dbgs.dbgSignatureToString(usig1)}`,2);
    });


    let usig2: Signature | undefined;
    if (usigs1.length === 1) usig2 = usigs1[0];
    else usig2 = createUnionResultSignature(usigs1, checker, tmpChecker);

    innerSymbolAccumTypesMap.forEach((types, symbol)=>{
        const utype = checker.getUnionType(types);
        const symbolLinks = tmpChecker.getSymbolLinks(symbol);
        symbolLinks.type = utype;
        IDebug.ilog(()=>`(post accum) symbol: ${IDebug.dbgs.dbgSymbolToString(symbol)}, symbolLinksType: ${IDebug.dbgs.dbgTypeToString(symbolLinks!.type)}`,2);
    });

    innerNodeAccumMap.forEach((map, node)=>{
        map.forEach((values, key)=>{
            switch (key){
                case "resolvedSignature":{
                    castHereafter<NodeAccumValueType["resolvedSignature"][]>(values);
                    values.forEach(({symbol})=>{
                        // All or nothing
                        Debug.assert(symbol===values[0].symbol);
                    });
                    if (enableIsolatedInnerSigs){
                        let sigs = values.map(({virtualSignature}, _idx)=>{
                            return cloneSignatureFromVirtualSignature(virtualSignature, checker, tmpChecker);
                        });
                        if (values[0].symbol) {
                            const types = sigs.map((sig)=>{
                                return tmpChecker.getOrCreateTypeFromSignature(sig);
                            });
                            const utype = checker.getUnionType(types);
                            const symbolLinks = tmpChecker.getSymbolLinks(values[0].symbol);
                            symbolLinks.type = utype;
                        }
                        else {
                            const nodeLinks = tmpChecker.getNodeLinks(node as Expression);
                            // TODO: this is not correct, but it is not clear what is correct
                            //nodeLinks.resolvedType = utype;
                            nodeLinks.resolvedSignature = createUnionResultSignature(sigs, checker, tmpChecker);
                        }
                    }
                    else {
                        const returnType = checker.getUnionType(values.map(({virtualSignature}, _idx)=>{
                            return virtualSignature.resolvedReturnType;
                        }));
                        if (values[0].symbol) {
                            const symbolLinks = tmpChecker.getSymbolLinks(values[0].symbol);
                            (symbolLinks.type as ObjectType).callSignatures![0].resolvedReturnType = returnType;
                        }
                        else {
                            const nodeLinks = tmpChecker.getNodeLinks(node as Expression);
                            nodeLinks.resolvedSignature!.resolvedReturnType = returnType;
                        }
                    }

                    if (values[0].symbol) {
                        IDebug.ilog(()=>`(post accum resolvedSignature via symbol) node: ${IDebug.dbgs.dbgNodeToString(node)}, symbol:${
                            IDebug.dbgs.dbgSymbolToString(values[0].symbol!)}, resolvedType: ${
                            IDebug.dbgs.dbgTypeToString(tmpChecker.getSymbolLinks(values[0].symbol!).type)}`,2);
                    }
                    else {
                        IDebug.ilog(()=>`(post accum resolvedSignature) node: ${IDebug.dbgs.dbgNodeToString(node)}, resolvedType: ${
                            IDebug.dbgs.dbgSignatureToString(tmpChecker.getNodeLinks(node as Expression).resolvedSignature)}`,2);
                    }
                    // IDebug.ilog(()=>`(post accum) node: ${IDebug.dbgs.dbgNodeToString(node)}, node.symbol.links.type =  ${IDebug.dbgs.dbgTypeToString(utype)}`,2);
                    break;
                }
                case "resolvedType":{
                    const utype = checker.getUnionType(values as Type[]);
                    const nodeLinks = tmpChecker.getNodeLinks(node as Expression);
                    nodeLinks.resolvedType = utype;
                    IDebug.ilog(()=>`(post accum resolvedType) node: ${IDebug.dbgs.dbgNodeToString(node)}, resolvedType: ${IDebug.dbgs.dbgTypeToString(nodeLinks.resolvedType!)}`,2);
                    break;
                }
            }
        })
    });


    // innerNodeAccumSignaturesMap.forEach((signatures, node)=>{
    //     const usigInner = createUnionResultSignature(signatures, checker, tmpChecker);
    //     const nodeLinks = tmpChecker.getNodeLinks(node as Expression);
    //     nodeLinks.resolvedSignature = usigInner;
    // });

    const ret =  makeReturn(usig2);
    IDebug.ilogGroupEnd(()=>`chooseOverload2() => ${IDebug.dbgs.dbgSignatureToString(ret.candidate)})`,2);
    return ret;


    function doOneCandidate(candidate: Signature, candidateIndex: number, reportErrors = false): undefined | Signature {
        IDebug.ilogGroup(()=>`doOneCandidate(${candidateIndex}, candidate: ${IDebug.dbgs.dbgSignatureToString(candidate)})`,2);

        args.forEach((arg, _argIndex) => {
            const links: NodeLinks = tmpChecker.getNodeLinks(arg);
            IDebug.ilog(()=>`(before) arg[${_argIndex}]: ${IDebug.dbgs.dbgTypeToString(links.resolvedType)}`,2);
        });
        args.forEach((arg, _argIndex) => {
            tmpChecker.getNodeLinks(arg).flags &= ~NodeCheckFlags.ContextChecked;
        });
        candidate.parameters?.forEach((param, _idx) => {
            const symbolLinks = tmpChecker.getSymbolLinks(param);
            symbolLinks.type = undefined;
            //symbolLinks.flags &= ~SymbolFlags.Instantiated;
        });

        const ret = doOneCandidateHelper(candidate, candidateIndex, reportErrors);

        args.forEach((arg, _argIndex) => {
            const links: NodeLinks = tmpChecker.getNodeLinks(arg);
            IDebug.ilog(()=>`(after) arg[${_argIndex}]: ${IDebug.dbgs.dbgTypeToString(links.resolvedType)}`,2);
        });
        candidate.parameters?.forEach((param, _idx) => {
            const symbolLinks = tmpChecker.getSymbolLinks(param);
            IDebug.ilog(()=>`params[${_idx}] ${param.escapedName}, ${IDebug.dbgs.dbgTypeToString(symbolLinks.type)}`,2);
        });
        IDebug.ilogGroupEnd(()=>`doOneCandidate() => ${IDebug.dbgs.dbgSignatureToString(ret)})`,2);
        return ret;
    }

    function doOneCandidateHelper(candidate: Signature, candidateIndex: number, reportErrors = false): undefined | Signature {

        if (!tmpChecker.hasCorrectTypeArgumentArity(candidate, typeArguments) || !tmpChecker.hasCorrectArity(node, args, candidate, signatureHelpTrailingComma)) {
            return;
        }

        let checkCandidate: Signature;
        let inferenceContext: InferenceContext | undefined;

        if (candidate.typeParameters) {
            if (IDebug.logLevel>=2) {
                candidate.typeParameters.forEach((typeParameter, _idx)=>{
                    dbgTypeParameterToStrings(typeParameter).forEach((s)=>IDebug.ilog(()=>`typeParameter[${_idx}]: ${s}`,2));
                });
            }
            let typeArgumentTypes: Type[] | undefined;
            if (some(typeArguments)) {
                typeArgumentTypes = tmpChecker.checkTypeArguments(candidate, typeArguments, reportErrors /*false*/);
                if (!typeArgumentTypes) {
                    candidateForTypeArgumentError = candidate;
                    IDebug.ilog(()=>`doOneCandidateHelper: fail@0`,2);
                    return;
                }
            }
            else {
                inferenceContext = tmpChecker.createInferenceContext(candidate.typeParameters, candidate, /*flags*/ isInJSFile(node) ? InferenceFlags.AnyDefault : InferenceFlags.None);
                typeArgumentTypes = tmpChecker.inferTypeArguments(node, candidate, args, argCheckMode | CheckMode.SkipGenericFunctions, inferenceContext);
                argCheckMode |= inferenceContext.flags & InferenceFlags.SkippedGenericFunction ? CheckMode.SkipGenericFunctions : CheckMode.Normal;
            }
            // if (IDebug.logLevel>=2) {
            //     typeArgumentTypes.forEach((typeArg, _idx)=>{IDebug.ilog(()=>`typeArgumentTypes[${_idx}]: ${IDebug.dbgs.dbgTypeToString(typeArg)}`,2);});
            // }

            checkCandidate = tmpChecker.getSignatureInstantiation(candidate, typeArgumentTypes, isInJSFile(candidate.declaration), inferenceContext && inferenceContext.inferredTypeParameters);
            IDebug.ilog(()=>`(instantiated) checkCandidate: ${IDebug.dbgs.dbgSignatureToString(checkCandidate)}`,2);

            // If the original signature has a generic rest type, instantiation may produce a
            // signature with different arity and we need to perform another arity check.
            if (tmpChecker.getNonArrayRestType(candidate) && !tmpChecker.hasCorrectArity(node, args, checkCandidate, signatureHelpTrailingComma)) {
                candidateForArgumentArityError = checkCandidate;
                IDebug.ilog(()=>`doOneCandidateHelper: fail@1`,2);
                return;
            }
        }
        else {
            checkCandidate = candidate;
        }
        //let diagn: readonly Diagnostic[] | undefined;
        if (/*diagn=*/tmpChecker.getSignatureApplicabilityError(node, args, checkCandidate, relation, argCheckMode, !!reportErrors /*false*/, /*containingMessageChain*/ undefined)) {
            // Give preference to error candidates that have no rest parameters (as they are more specific)
            (candidatesForArgumentError || (candidatesForArgumentError = [])).push(checkCandidate);
            IDebug.ilog(()=>`doOneCandidateHelper: fail@2`,2);
            // if (diagn && diagn?.length) {
            //     IDebug.dbgs.dbgDiagnosticsToStrings(diagn[0]).forEach((s,i)=>IDebug.ilog(()=>`diagn[${i}]="${s}"`,2));
            // }
            return;
        }
        if (argCheckMode) {
            // If one or more context sensitive arguments were excluded, we start including
            // them now (and keeping do so for any subsequent candidates) and perform a second
            // round of type inference and applicability checking for this particular candidate.
            argCheckMode = CheckMode.Normal;
            if (inferenceContext) {
                const typeArgumentTypes = tmpChecker.inferTypeArguments(node, candidate, args, argCheckMode, inferenceContext);
                checkCandidate = tmpChecker.getSignatureInstantiation(candidate, typeArgumentTypes, isInJSFile(candidate.declaration), inferenceContext.inferredTypeParameters);
                // If the original signature has a generic rest type, instantiation may produce a
                // signature with different arity and we need to perform another arity check.
                if (tmpChecker.getNonArrayRestType(candidate) && !tmpChecker.hasCorrectArity(node, args, checkCandidate, signatureHelpTrailingComma)) {
                    candidateForArgumentArityError = checkCandidate;
                    IDebug.ilog(()=>`doOneCandidateHelper: fail@3`,2);
                    return;
                }
            }
            if (tmpChecker.getSignatureApplicabilityError(node, args, checkCandidate, relation, argCheckMode, !!reportErrors/*false*/, /*containingMessageChain*/ undefined)) {
                // Give preference to error candidates that have no rest parameters (as they are more specific)
                (candidatesForArgumentError || (candidatesForArgumentError = [])).push(checkCandidate);
                IDebug.ilog(()=>`doOneCandidateHelper: fail@4`,2);
                return;
            }
        }
        candidates[candidateIndex] = checkCandidate;
        return checkCandidate;
    }

} // chooseOverloadV2

