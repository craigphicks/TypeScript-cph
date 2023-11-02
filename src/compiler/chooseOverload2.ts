import {
    Debug,
    Type,
    UnionType,
    Signature,
    SignatureKind,
    TypeMapper,
    TypeFlags
    TypeChecker,
    castHereafter,
} from "./_namespaces/ts";

// cphdebug-start
import { IDebug } from "./mydebug";
// cphdebug-end


export interface OverloadState {
    getNumberOfOverloads(): number;
    getTypeParamRange(overloadIdx: number, parameterIdx: number, typeParam: Type ): Type[];
    getParameterWithTypeParam(overloadIdx: number, parameterIdx: number, typeParam: Type ): Type;
};

class OverloadStateImpl implements OverloadState {
    //overloads: Type[][];
    signaturesInTypeOrder: Readonly<Signature[]>[] = []; // Ultimately, these shouldn't be necessary for intermediate steps, but they are for now.
    numberOfOverloads: number;
    constructor(apparentType: Type, checker: TypeChecker) {
        Debug.assert(apparentType.flags & TypeFlags.Union);
        castHereafter<UnionType>(apparentType);



        //this.numoverloads = apparentType.types[0].symbol.declarations.length;
        for (let i = 0; i < apparentType.types.length; i++) {
            this.signaturesInTypeOrder[i] = checker.getSignaturesOfType(apparentType, SignatureKind.Call);
            //this.overloads.push(sig.parameters);
        }
        let nsigsmin = Math.min(...this.signaturesInTypeOrder.map((sigs) => sigs.length));
        let nsigsmax = Math.max(...this.signaturesInTypeOrder.map((sigs) => sigs.length));
        Debug.assert(nsigsmin === nsigsmax);
        this.numberOfOverloads = nsigsmax;
    }
    // private getConstraintOfTypeParameter(): Type[] {
    //     return [];
    // }

    getNumberOfOverloads(): number {
        return this.numberOfOverloads;
    }
    static canDo(apparentType: Type, checker: TypeChecker): boolean {
        if (apparentType?.flags & TypeFlags.Union) {
            castHereafter<UnionType>(apparentType);
            let memberName: __String;
            apparentType.types.every(t => !!t.symbol?.parent && checker.isArrayOrTupleSymbol(t.symbol.parent) && (!memberName ? (memberName = t.symbol.escapedName, true) : memberName === t.symbol.escapedName))) {
                return true;
            }
        }
        return false;
    }
    const carveout = (()=>{
    }



    // getTypeParamRange(overloadIdx: number, parameterIdx: number, typeParam: Type ): Type[] {
    //     return this.overloads[overloadIdx][parameterIdx].getConstraintOfTypeParameter(typeParam);
    // }

    // getParameterWithTypeParam(overloadIdx: number, parameterIdx: number, typeParam: Type ): Type {
    //     return this.overloads[overloadIdx][parameterIdx].getTypeParameter(typeParam);
    // }

}