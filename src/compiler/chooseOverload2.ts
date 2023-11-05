import {
    AnonymousType,
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
} from "./_namespaces/ts";

// cphdebug-start
import { IDebug } from "./mydebug";
// cphdebug-end



export interface OverloadState {
    getNumberOfOverloads(): number;
    getTypeParamRange(overloadIdx: number, parameterIdx: number, typeParam: Type ): Type[];
    getParameterWithTypeParam(overloadIdx: number, parameterIdx: number, typeParam: Type ): Type;

    //some(Type)
};

export class OverloadStateImpl  {
    // The signatures are needed to compare with the JIT create types we finally intend to use.
    signaturesInTypeOrder: Readonly<Signature[]>[] = []; // Ultimately, these shouldn't be necessary for intermediate steps, but they are for now.
    numberOfOverloads: number;
    constructor(apparentType: Type, checker: TypeChecker, _tmpChecker: TmpChecker) {
        const ilog = IDebug.ilog;
        const dbgs = IDebug.dbgs;
        const logLevel = 2;
        Debug.assert(apparentType.flags & TypeFlags.Union);
        castHereafter<UnionType>(apparentType);
        for (let i = 0; i < apparentType.types.length; i++) {
            this.signaturesInTypeOrder[i] = checker.getSignaturesOfType(apparentType, SignatureKind.Call);
            //this.overloads.push(sig.parameters);
        }
        let nsigsmin = Math.min(...this.signaturesInTypeOrder.map((sigs) => sigs.length));
        let nsigsmax = Math.max(...this.signaturesInTypeOrder.map((sigs) => sigs.length));
        Debug.assert(nsigsmin === nsigsmax);
        this.numberOfOverloads = nsigsmax;
        // @ts-ignore
        let apparentTarget = (apparentType as any).target;
        let type0 = (apparentType.types[0] as AnonymousType);
        castHereafter<ObjectType>(type0);
        if (type0.symbol?.declarations?.length) {
            Debug.assert(this.numberOfOverloads === type0.symbol.declarations.length);
        }
        ilog(`type0=${dbgs.dbgTypeToString(type0)}`,logLevel);
        // target0 is the generic target for method.  Array, ReadonlyArray, Tuple all have differing generic targets.
        let target0 = type0.target;
        castHereafter<ObjectType & AnonymousType>(target0);
        ilog(`type0.target=${dbgs.dbgTypeToString(target0)}`,logLevel);
        checker.getSignaturesOfType(target0, SignatureKind.Call); // This should populate target0.callSignatures
        Debug.assert(target0.callSignatures);
        const callSignatures0 = target0.callSignatures[0];
        ilog(`type0.target.callSignatures[0].resolvedReturnType=`
            +`${dbgs.dbgTypeToString(callSignatures0.resolvedReturnType)}`,logLevel);
        callSignatures0.parameters.forEach((p,pidx)=>{
            const paramType = checker.getTypeOfSymbol(p);
            ilog(`getTypeOfSymbol(...callSignatures[0].parameters[${pidx}]): ${dbgs.dbgTypeToString(paramType)}`,logLevel);
        });
        // @ts-ignore
        let x = 1;

        // let callSignatures = checker.getSignaturesOfType(target0, SignatureKind.Call);
        // for (let iol=0; i<this.numberOfOverloads; iol++) {
        //     for (let ip = 0; ip < apparentType.types; ip++) {
        // }

    }
    // private getConstraintOfTypeParameter(): Type[] {
    //     return [];
    // }

    getNumberOfOverloads(): number {
        return this.numberOfOverloads;
    }
    /**
     * Will be used for arity checking.
     * @param overloadIndex
     */
    // @ts-ignore
    getCandidateMappedToAny(overloadIndex: number): Signature {
        // TODO:
    }
    // @ts-ignore
    static canDo(apparentType: Type, checker: TypeChecker, tmpChecker: TmpChecker): boolean {
        if (apparentType?.flags & TypeFlags.Union) {
            castHereafter<UnionType>(apparentType);
            let memberName: __String;
            if (apparentType.types.every(t => !!t.symbol?.parent && tmpChecker.isArrayOrTupleSymbol(t.symbol.parent) && (!memberName ? (memberName = t.symbol.escapedName, true) : memberName === t.symbol.escapedName))) {
                return true;
            }
        }
        return false;
    }

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

};


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
export function chooseOverloadV2(
    _candidatesUnused: Signature[], // gets overwritten
    relation: Map<string, RelationComparisonResult>, isSingleNonGenericCandidate: boolean, signatureHelpTrailingComma = false,
    apparentType: Type,
    node: CallLikeExpression, checker: TypeChecker, tmpChecker: TmpChecker,
    typeArguments: NodeArray<TypeNode> | undefined, args: Readonly<Expression[]>, argCheckMode: CheckMode):
    {
            candidate: Signature;
            argCheckMode: CheckMode;
            candidatesForArgumentError: Signature[] | undefined;
            candidateForArgumentArityError: Signature | undefined;
            candidateForTypeArgumentError: Signature | undefined;
        } | undefined {

    const makeReturn = (candidate: Signature) => {
        return {
            candidate,
            argCheckMode,
            candidatesForArgumentError,
            candidateForArgumentArityError,
            candidateForTypeArgumentError,
        } satisfies ReturnType<typeof chooseOverloadV2>;
    }

    let candidates: Signature[] = [];
    let candidatesForArgumentError: Signature[] | undefined = undefined;
    let candidateForArgumentArityError: Signature | undefined = undefined;
    let candidateForTypeArgumentError: Signature | undefined = undefined;

    Debug.assert(OverloadStateImpl.canDo(apparentType,checker,tmpChecker));
    const state = new OverloadStateImpl(apparentType,checker,tmpChecker);


    if (isSingleNonGenericCandidate) {
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

    for (let candidateIndex = 0, numCandidates = state.getNumberOfOverloads(); candidateIndex < numCandidates; candidateIndex++) {
        const candidate = state.getCandidateMappedToAny(candidateIndex) // candidates[candidateIndex];
        if (!tmpChecker.hasCorrectTypeArgumentArity(candidate, typeArguments) || !tmpChecker.hasCorrectArity(node, args, candidate, signatureHelpTrailingComma)) {
            continue;
        }

        let checkCandidate: Signature;
        let inferenceContext: InferenceContext | undefined;

        if (candidate.typeParameters) {
            let typeArgumentTypes: Type[] | undefined;
            if (some(typeArguments)) {
                typeArgumentTypes = tmpChecker.checkTypeArguments(candidate, typeArguments, /*reportErrors*/ false);
                if (!typeArgumentTypes) {
                    candidateForTypeArgumentError = candidate;
                    continue;
                }
            }
            else {
                inferenceContext = tmpChecker.createInferenceContext(candidate.typeParameters, candidate, /*flags*/ isInJSFile(node) ? InferenceFlags.AnyDefault : InferenceFlags.None);
                typeArgumentTypes = tmpChecker.inferTypeArguments(node, candidate, args, argCheckMode | CheckMode.SkipGenericFunctions, inferenceContext);
                argCheckMode |= inferenceContext.flags & InferenceFlags.SkippedGenericFunction ? CheckMode.SkipGenericFunctions : CheckMode.Normal;
            }
            checkCandidate = tmpChecker.getSignatureInstantiation(candidate, typeArgumentTypes, isInJSFile(candidate.declaration), inferenceContext && inferenceContext.inferredTypeParameters);
            // If the original signature has a generic rest type, instantiation may produce a
            // signature with different arity and we need to perform another arity check.
            if (tmpChecker.getNonArrayRestType(candidate) && !tmpChecker.hasCorrectArity(node, args, checkCandidate, signatureHelpTrailingComma)) {
                candidateForArgumentArityError = checkCandidate;
                continue;
            }
        }
        else {
            checkCandidate = candidate;
        }
        if (tmpChecker.getSignatureApplicabilityError(node, args, checkCandidate, relation, argCheckMode, /*reportErrors*/ false, /*containingMessageChain*/ undefined)) {
            // Give preference to error candidates that have no rest parameters (as they are more specific)
            (candidatesForArgumentError || (candidatesForArgumentError = [])).push(checkCandidate);
            continue;
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
                    continue;
                }
            }
            if (tmpChecker.getSignatureApplicabilityError(node, args, checkCandidate, relation, argCheckMode, /*reportErrors*/ false, /*containingMessageChain*/ undefined)) {
                // Give preference to error candidates that have no rest parameters (as they are more specific)
                (candidatesForArgumentError || (candidatesForArgumentError = [])).push(checkCandidate);
                continue;
            }
        }
        candidates[candidateIndex] = checkCandidate;
        return makeReturn(checkCandidate);
    }

    return undefined;
} // chooseOverloadV2

